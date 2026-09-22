import { initFirebaseAuth, subscribeToCloudTables, saveTablesToCloud } from "./firebase.js";
import { FULL_MENU, TABLES_INITIAL, MODIFIERS_DATA, calcTableSum, getDishDepartment } from "./menu.js";

/* Состояние терминала */
let tables = TABLES_INITIAL;
let obstacles = [];
let currentWaiter = "";
let currentTableId = 1;
let currentAppTab = 'map'; // 'map', 'orders', 'menu', 'cart'
let currentCategory = 'all';
let currentOrdersFilter = 'all'; // 'all', 'new', 'cooking', 'served'

let pendingModalTableId = null;
let tempGuestsCount = 2;
let toastTimer = null;

let activeModDish = null;
let selectedModifiers = [];

/* База известных имён официантов */
const DEFAULT_WAITERS = ['Алексей', 'Дарья', 'Максим', 'Алина'];
let knownWaiters = [...DEFAULT_WAITERS];

/* Pan & Zoom карты */
let mapScale = 1;
let mapPanX = 20;
let mapPanY = 20;
let isPanningMap = false;
let startMapMouseX = 0, startMapMouseY = 0;

const mapContainer = document.getElementById('hallMapContainer');
const mapWorld = document.getElementById('hallMapWorld');
const layerObstacles = document.getElementById('layerObstacles');
const layerTables = document.getElementById('layerTables');

function applyMapTransform() {
  if (!mapWorld) return;
  mapWorld.style.transform = `translate(${mapPanX}px, ${mapPanY}px) scale(${mapScale})`;
  const display = document.getElementById('mapZoomDisplay');
  if (display) display.textContent = `${Math.round(mapScale * 100)}%`;
}

function zoomMap(delta) {
  mapScale = Math.max(0.3, Math.min(2.5, mapScale + delta));
  applyMapTransform();
}

function resetMapView() {
  mapScale = 1;
  mapPanX = 20;
  mapPanY = 20;
  applyMapTransform();
}

if (mapContainer) {
  mapContainer.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.map-table-btn')) return;
    isPanningMap = true;
    startMapMouseX = e.clientX - mapPanX;
    startMapMouseY = e.clientY - mapPanY;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPanningMap) return;
    mapPanX = e.clientX - startMapMouseX;
    mapPanY = e.clientY - startMapMouseY;
    applyMapTransform();
  });

  window.addEventListener('pointerup', () => {
    isPanningMap = false;
  });

  mapContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomMap(e.deltaY < 0 ? 0.08 : -0.08);
  }, { passive: false });
}

/* Отрисовка 2D-карты зала */
function renderHallMap() {
  if (!layerObstacles || !layerTables) return;
  layerObstacles.innerHTML = '';
  layerTables.innerHTML = '';

  obstacles.forEach(obs => {
    if (obs.type === 'stool') return;
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.left = `${obs.x}px`;
    el.style.top = `${obs.y}px`;
    el.style.width = `${obs.w}px`;
    el.style.height = `${obs.h}px`;
    el.style.transform = `rotate(${obs.rotation || 0}deg)`;
    el.style.transformOrigin = 'center center';

    if (obs.type === 'sofa') {
      el.className = "sofa-item shadow-xs";
      el.innerHTML = `<div class="sofa-back-strip"></div>`;
    } else if (obs.type === 'plant') {
      el.className = "plant-divider shadow-xs";
    } else if (obs.type === 'window') {
      el.className = "window-glass";
    } else if (obs.type === 'wall') {
      el.className = "bg-slate-300 border border-slate-400 rounded-sm shadow-xs";
    } else if (obs.type === 'bar') {
      el.className = "bg-orange-100 border-2 border-orange-400 rounded-2xl shadow-sm flex items-center justify-center text-orange-700 text-xs font-black";
      el.innerHTML = `<span>☕ БАР</span>`;
    } else if (obs.type === 'column') {
      el.className = "bg-slate-400 border-2 border-slate-300 rounded-full shadow-xs";
    }

    layerObstacles.appendChild(el);
  });

  tables.forEach(table => {
    const el = document.createElement('div');
    el.className = "map-table-btn flex flex-col items-center justify-center font-bold";
    el.style.left = `${table.x}px`;
    el.style.top = `${table.y}px`;
    el.style.width = `${table.w}px`;
    el.style.height = `${table.h}px`;
    el.style.transform = `rotate(${table.rotation || 0}deg)`;
    el.style.transformOrigin = 'center center';

    const isRound = table.shape === 'round';
    el.className += isRound ? ' rounded-full' : ' rounded-2xl';

    const hasItems = table.items && table.items.length > 0;
    const totalSum = calcTableSum(table);
    const totalCount = hasItems ? table.items.reduce((s, it) => s + it.qty, 0) : 0;
    const servedCount = hasItems ? table.items.filter(it => it.served).reduce((s, it) => s + it.qty, 0) : 0;
    const allServed = hasItems && totalCount > 0 && servedCount === totalCount;
    const hasUnsent = hasItems && table.items.some(it => !it.sentToKitchen);

    if (!hasItems) {
      el.className += " bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 shadow-xs";
      el.innerHTML = `
        <span class="text-sm font-black leading-none text-slate-900 pointer-events-none">${table.name || table.id}</span>
        <span class="text-[9px] text-slate-400 mt-0.5 leading-none pointer-events-none">Свободен</span>
      `;
    } else if (hasUnsent) {
      el.className += " bg-orange-50 border-2 border-orange-500 text-orange-950 shadow-md animate-pulse";
      el.innerHTML = `
        <span class="text-sm font-black leading-none text-orange-950 pointer-events-none">${table.name || table.id}</span>
        <span class="text-[9px] font-mono font-black mt-0.5 leading-none text-orange-600 pointer-events-none">${totalSum} ₽</span>
        <span class="text-[8px] bg-orange-500 text-white px-1.5 py-0.2 rounded-full font-bold mt-0.5 pointer-events-none">Новое</span>
      `;
    } else if (allServed) {
      el.className += " bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xs";
      el.innerHTML = `
        <span class="text-sm font-black leading-none text-emerald-900 pointer-events-none">${table.name || table.id}</span>
        <span class="text-[9px] font-mono font-black mt-0.5 leading-none text-emerald-600 pointer-events-none">${totalSum} ₽</span>
        <span class="text-[8px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold mt-0.5 pointer-events-none">✓ Подано</span>
      `;
    } else {
      el.className += " bg-blue-50 border-2 border-blue-500 text-blue-950 shadow-xs";
      el.innerHTML = `
        <span class="text-sm font-black leading-none text-blue-900 pointer-events-none">${table.name || table.id}</span>
        <span class="text-[9px] font-mono font-black mt-0.5 leading-none text-blue-600 pointer-events-none">${totalSum} ₽</span>
        <span class="text-[8px] bg-blue-500 text-white px-1.5 py-0.2 rounded-full font-bold mt-0.5 pointer-events-none">${servedCount}/${totalCount}</span>
      `;
    }

    el.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onTableClicked(table.id);
    });

    layerTables.appendChild(el);
  });

  updateHallMetrics();
}

function updateHallMetrics() {
  const busy = tables.filter(t => t.items && t.items.length > 0);
  const free = tables.filter(t => !t.items || t.items.length === 0);
  const totalSum = busy.reduce((sum, t) => sum + calcTableSum(t), 0);

  const freeEl = document.getElementById('mapFreeCount');
  const busyEl = document.getElementById('mapBusyCount');
  const sumEl = document.getElementById('mapSumTotal');

  if (freeEl) freeEl.textContent = free.length;
  if (busyEl) busyEl.textContent = busy.length;
  if (sumEl) sumEl.textContent = `${totalSum} ₽`;

  // Бейдж на нижней навигации «Заказы»
  const navBadge = document.getElementById('navOrdersBadge');
  if (navBadge) {
    if (busy.length > 0) navBadge.classList.remove('hidden');
    else navBadge.classList.add('hidden');
  }

  // Обновляем список известных имён из столов в базе
  tables.forEach(t => {
    if (t.waiter && !knownWaiters.includes(t.waiter)) {
      knownWaiters.push(t.waiter);
    }
  });
}

/* =========================================================
 * НИЖНИЙ ПЛАВАЮЩИЙ ТАББАР С АНИМАЦИЕЙ СКОЛЬЗЯЩЕЙ ТАБЛЕТКИ
 * ========================================================= */
function switchAppTab(tab, tabIndex = 0) {
  currentAppTab = tab;

  // 1. Анимация бегающей оранжевой пилюли
  const pill = document.getElementById('slidingNavPill');
  if (pill) {
    pill.style.transform = `translateX(${tabIndex * 100}%)`;
  }

  // 2. Цвета иконок таббара
  document.querySelectorAll('.nav-tab-btn').forEach((btn, idx) => {
    if (idx === tabIndex) {
      btn.className = "nav-tab-btn flex-1 py-2 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors text-white font-black";
    } else {
      btn.className = "nav-tab-btn flex-1 py-2 flex flex-col items-center justify-center gap-0.5 relative z-10 transition-colors text-slate-500 font-medium";
    }
  });

  // 3. Переключение экранов
  const viewTables = document.getElementById('view-tables');
  const viewActiveOrders = document.getElementById('view-active-orders');
  const viewOrder = document.getElementById('view-order');

  const menuCol = document.getElementById('orderMenuColumn');
  const cartCol = document.getElementById('orderCartColumn');

  if (tab === 'map') {
    viewTables?.classList.remove('hidden');
    viewActiveOrders?.classList.add('hidden');
    viewOrder?.classList.add('hidden');
    renderHallMap();
  } else if (tab === 'orders') {
    viewTables?.classList.add('hidden');
    viewActiveOrders?.classList.remove('hidden');
    viewOrder?.classList.add('hidden');
    renderActiveOrdersScreen();
  } else if (tab === 'menu') {
    viewTables?.classList.add('hidden');
    viewActiveOrders?.classList.add('hidden');
    viewOrder?.classList.remove('hidden');
    if (menuCol) menuCol.classList.remove('hidden');
    if (cartCol) cartCol.classList.add('hidden');
    renderDishes();
  } else if (tab === 'cart') {
    viewTables?.classList.add('hidden');
    viewActiveOrders?.classList.add('hidden');
    viewOrder?.classList.remove('hidden');
    if (menuCol) menuCol.classList.add('hidden');
    if (cartCol) cartCol.classList.remove('hidden');
    renderOrderScreen();
  }
}

/* =========================================================
 * РАЗДЕЛ «АКТИВНЫЕ ЗАКАЗЫ» С СОРТИРОВКОЙ ПО СТАТУСУ
 * ========================================================= */
function filterActiveOrders(status) {
  currentOrdersFilter = status;
  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.className = "order-filter-btn px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 transition";
  });
  const act = document.getElementById(`order-filter-${status}`);
  if (act) act.className = "order-filter-btn px-3 py-1.5 rounded-full bg-orange-500 text-white shadow-xs transition";

  renderActiveOrdersScreen();
}

function renderActiveOrdersScreen() {
  const container = document.getElementById('activeOrdersListContainer');
  const totalBadge = document.getElementById('activeOrdersTotalBadge');
  if (!container) return;
  container.innerHTML = '';

  const busyTables = tables.filter(t => t.items && t.items.length > 0);
  if (totalBadge) totalBadge.textContent = `${busyTables.length} столов`;

  // Сортировка / фильтрация
  const filtered = busyTables.filter(t => {
    const hasUnsent = t.items.some(it => !it.sentToKitchen);
    const totalCount = t.items.reduce((s, it) => s + it.qty, 0);
    const servedCount = t.items.filter(it => it.served).reduce((s, it) => s + it.qty, 0);
    const allServed = totalCount > 0 && servedCount === totalCount;

    if (currentOrdersFilter === 'new') return hasUnsent;
    if (currentOrdersFilter === 'cooking') return !hasUnsent && !allServed;
    if (currentOrdersFilter === 'served') return allServed;
    return true; // 'all'
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="h-48 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
        <span class="text-3xl">☕</span>
        <p class="text-xs">Заказов с таким статусом сейчас нет</p>
      </div>
    `;
    return;
  }

  filtered.forEach(t => {
    const sum = calcTableSum(t);
    const totalCount = t.items.reduce((s, it) => s + it.qty, 0);
    const servedCount = t.items.filter(it => it.served).reduce((s, it) => s + it.qty, 0);
    const hasUnsent = t.items.some(it => !it.sentToKitchen);
    const allServed = totalCount > 0 && servedCount === totalCount;

    let badgeStatus = '<span class="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">Готовится</span>';
    if (hasUnsent) {
      badgeStatus = '<span class="text-[9px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200 animate-pulse">Есть новые!</span>';
    } else if (allServed) {
      badgeStatus = '<span class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">Подано ✓</span>';
    }

    const card = document.createElement('div');
    card.className = "p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.98] transition";
    card.onclick = () => {
      goToOrderView(t.id);
    };

    card.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 font-black text-sm flex items-center justify-center border border-orange-200 shadow-2xs">
          ${t.name || t.id}
        </span>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-extrabold text-sm text-slate-900">${t.name ? `Стол ${t.name}` : `Стол ${t.id}`}</h4>
            ${badgeStatus}
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5 font-medium">
            👥 ${t.guests || 1} чел. • 🍽️ ${t.items.length} поз. • 👤 ${t.waiter || '—'}
          </p>
        </div>
      </div>

      <div class="text-right">
        <span class="font-mono font-black text-sm text-orange-600 block">${sum} ₽</span>
        <span class="text-[10px] text-slate-400 font-semibold">${servedCount}/${totalCount} подано</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function onTableClicked(tableId) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  if (!currentWaiter) {
    openWelcomeModal();
    return;
  }

  if (!table.items || table.items.length === 0) {
    openGuestsModal(tableId);
  } else {
    goToOrderView(tableId);
  }
}

function openGuestsModal(tableId) {
  pendingModalTableId = tableId;
  const table = tables.find(t => t.id === tableId);
  tempGuestsCount = (table && table.guests > 0) ? table.guests : 2;

  const tag = document.getElementById('guestModalTableTag');
  if (tag) tag.textContent = table ? (table.name || `Стол ${table.id}`) : "Стол";
  
  const modal = document.getElementById('guestsModal');
  if (modal) modal.classList.remove('hidden');
}

function setTempGuests(n) {
  tempGuestsCount = n;
  document.querySelectorAll('.guest-btn').forEach((btn, idx) => {
    if (idx + 1 === n) {
      btn.className = "guest-btn p-2.5 rounded-2xl border-2 border-orange-500 bg-orange-50 text-orange-600 font-bold flex flex-col items-center";
    } else {
      btn.className = "guest-btn p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-bold flex flex-col items-center";
    }
  });
}

function confirmGuestSelection() {
  if (!pendingModalTableId) return;
  const table = tables.find(t => t.id === pendingModalTableId);
  if (table) {
    table.guests = tempGuestsCount;
    table.waiter = currentWaiter;
    syncToCloud();
  }
  closeModal('guestsModal');
  goToOrderView(pendingModalTableId);
}

function goToOrderView(tableId) {
  currentTableId = tableId;
  const table = tables.find(t => t.id === tableId);
  const badge = document.getElementById('headerTableBadge');
  if (badge) {
    badge.textContent = `№${table?.name || tableId}`;
    badge.classList.remove('hidden');
  }

  switchAppTab('menu', 2);
  renderOrderScreen();
  renderDishes();
}

function goToTablesView() {
  switchAppTab('map', 0);
  document.getElementById('headerTableBadge')?.classList.add('hidden');
}

function renderDishes() {
  const grid = document.getElementById('dishesList');
  if (!grid) return;
  grid.innerHTML = '';

  const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const currentTable = tables.find(t => t.id === currentTableId);
  const items = currentTable?.items || [];

  const dishes = FULL_MENU.filter(d => {
    const matchCat = (currentCategory === 'all') || (d.cat === currentCategory);
    if (!query) return matchCat;
    return matchCat && (
      d.name.toLowerCase().includes(query) || 
      (d.catTitle && d.catTitle.toLowerCase().includes(query)) ||
      (d.desc && d.desc.toLowerCase().includes(query))
    );
  });

  dishes.forEach(dish => {
    const countInCart = items.filter(it => it.dishId === dish.id).reduce((s, it) => s + it.qty, 0);
    const card = document.createElement('div');
    card.className = `p-2.5 rounded-2xl border flex flex-col justify-between select-none cursor-pointer transition active:scale-[0.97] ${
      countInCart > 0 ? 'bg-orange-50/80 border-orange-300' : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
    }`;

    card.onclick = () => onSelectDishCard(dish);

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-[8px] uppercase font-bold text-orange-600 bg-orange-100/80 px-1.5 py-0.2 rounded-md">${dish.catTitle}</span>
          ${countInCart > 0 ? `<span class="text-xs font-mono font-black text-orange-600">×${countInCart}</span>` : ''}
        </div>
        <h4 class="font-bold text-xs text-slate-800 leading-snug line-clamp-2">${dish.name}</h4>
      </div>
      <div class="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
        <span class="font-mono font-black text-xs text-slate-900">${dish.price} ₽</span>
        <span class="w-6 h-6 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-xs">+</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function onSelectDishCard(dish) {
  openItemModifiersModal(dish);
}

function openItemModifiersModal(dish) {
  activeModDish = dish;
  selectedModifiers = [];

  const nameEl = document.getElementById('modModalDishName');
  const priceEl = document.getElementById('modModalBasePrice');
  const commentInp = document.getElementById('modModalComment');
  const container = document.getElementById('modModalContent');

  if (nameEl) nameEl.textContent = dish.name;
  if (priceEl) priceEl.textContent = `Базовая цена: ${dish.price} ₽`;
  if (commentInp) commentInp.value = "";
  if (!container) return;
  container.innerHTML = "";

  if (dish.desc) {
    const descBlock = document.createElement('div');
    descBlock.className = "p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-600 text-xs leading-relaxed flex items-start gap-2";
    descBlock.innerHTML = `
      <span class="text-orange-500 text-sm">ℹ️</span>
      <div>
        <span class="font-semibold text-slate-800 block mb-0.5">Состав и описание:</span>
        <span class="text-slate-500">${dish.desc}</span>
      </div>
    `;
    container.appendChild(descBlock);
  }

  if (dish.modGroups && dish.modGroups.length > 0) {
    dish.modGroups.forEach(grpKey => {
      const group = MODIFIERS_DATA[grpKey];
      if (!group) return;

      const block = document.createElement('div');
      block.className = "bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-1.5";
      block.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800 block text-xs">${group.title}</span>
          <span class="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-600 font-semibold">${group.type === 'single' ? 'Один вариант' : 'Несколько'}</span>
        </div>
      `;

      const pillsWrap = document.createElement('div');
      pillsWrap.className = "flex flex-wrap gap-1";

      group.items.forEach((mod, idx) => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = "mod-pill-btn px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center gap-1 active:scale-95 transition";
        btn.dataset.groupId = grpKey;
        btn.dataset.modId = mod.id;

        btn.innerHTML = `
          <span>${mod.name}</span>
          ${mod.price > 0 ? `<span class="text-orange-600 font-mono text-[10px]">+${mod.price}₽</span>` : ''}
          ${mod.price < 0 ? `<span class="text-emerald-600 font-mono text-[10px]">${mod.price}₽</span>` : ''}
        `;

        btn.onclick = () => toggleModifier(grpKey, mod, group.type, btn);
        pillsWrap.appendChild(btn);

        if (group.type === 'single' && idx === 0) {
          selectedModifiers.push({ ...mod, groupKey: grpKey });
          btn.className = "mod-pill-btn px-3 py-1.5 rounded-full border-2 border-orange-500 bg-orange-50 text-orange-600 font-bold text-xs flex items-center gap-1 active:scale-95 transition";
        }
      });

      block.appendChild(pillsWrap);
      container.appendChild(block);
    });
  }

  updateModModalTotal();
  document.getElementById('itemModifiersModal')?.classList.remove('hidden');
}

function toggleModifier(groupKey, mod, type, btnEl) {
  if (type === 'single') {
    selectedModifiers = selectedModifiers.filter(m => m.groupKey !== groupKey);
    document.querySelectorAll(`.mod-pill-btn[data-group-id="${groupKey}"]`).forEach(b => {
      b.className = "mod-pill-btn px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center gap-1 active:scale-95 transition";
    });

    selectedModifiers.push({ ...mod, groupKey });
    btnEl.className = "mod-pill-btn px-3 py-1.5 rounded-full border-2 border-orange-500 bg-orange-50 text-orange-600 font-bold text-xs flex items-center gap-1 active:scale-95 transition";
  } else {
    const existIdx = selectedModifiers.findIndex(m => m.id === mod.id);
    if (existIdx >= 0) {
      selectedModifiers.splice(existIdx, 1);
      btnEl.className = "mod-pill-btn px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center gap-1 active:scale-95 transition";
    } else {
      selectedModifiers.push({ ...mod, groupKey });
      btnEl.className = "mod-pill-btn px-3 py-1.5 rounded-full border-2 border-orange-500 bg-orange-50 text-orange-600 font-bold text-xs flex items-center gap-1 active:scale-95 transition";
    }
  }

  updateModModalTotal();
}

function updateModModalTotal() {
  if (!activeModDish) return;
  const modsSum = selectedModifiers.reduce((acc, m) => acc + (m.price || 0), 0);
  const total = activeModDish.price + modsSum;
  const el = document.getElementById('modModalTotalPrice');
  if (el) el.textContent = `${total} ₽`;
}

function appendQuickComment(text) {
  const inp = document.getElementById('modModalComment');
  if (!inp) return;
  if (inp.value.trim().length > 0) {
    inp.value += `, ${text}`;
  } else {
    inp.value = text;
  }
  inp.focus();
}

function clearModalComment() {
  const inp = document.getElementById('modModalComment');
  if (inp) {
    inp.value = '';
    inp.focus();
  }
}

function skipAndAddDish() {
  if (!activeModDish) return;
  addDishDirectlyToCart(activeModDish, selectedModifiers, "");
  closeModal('itemModifiersModal');
}

function confirmDishWithModifiers() {
  if (!activeModDish) return;
  const comment = (document.getElementById('modModalComment')?.value || '').trim();
  addDishDirectlyToCart(activeModDish, selectedModifiers, comment);
  closeModal('itemModifiersModal');
}

function addDishDirectlyToCart(dish, modifiers = [], comment = "") {
  const table = tables.find(t => t.id === currentTableId);
  if (!table) return;

  if (!table.items) table.items = [];
  if (!table.guests || table.guests === 0) table.guests = 1;
  if (!table.waiter) table.waiter = currentWaiter;

  const modsKey = modifiers.map(m => m.id).sort().join('_') + (comment ? `_${comment}` : '');
  const exist = table.items.find(it => it.dishId === dish.id && it.modsKey === modsKey && !it.sentToKitchen && !it.served);

  if (exist) {
    exist.qty++;
  } else {
    table.items.push({
      uniqueCartId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      qty: 1,
      modifiers: modifiers,
      comment: comment,
      modsKey: modsKey,
      sentToKitchen: false,
      served: false,
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  syncToCloud();
  renderOrderScreen();
  renderDishes();
  showToast(`+ 1 ${dish.name}`, '☕');
}

/* РЕНДЕРИНГ ЧЕКА СТОЛА С ПОДДЕРЖКОЙ DOUBLE-TAP ДЛЯ ПОДАЧИ */
function renderOrderScreen() {
  const table = tables.find(t => t.id === currentTableId);
  if (!table) return;

  const titleEl = document.getElementById('activeOrderTitle');
  const subEl = document.getElementById('activeOrderSubtitle');
  const gEl = document.getElementById('btnGuestsDisplay');
  const pEl = document.getElementById('ticketPersonsBadge');
  const countBadge = document.getElementById('mobileCartCountBadge');
  const countText = document.getElementById('cartItemsCountText');

  if (titleEl) titleEl.textContent = table.name ? `Стол ${table.name}` : `Стол ${table.id}`;
  if (subEl) subEl.textContent = `${table.guests || 1} персоны`;
  if (gEl) gEl.textContent = `${table.guests || 1}`;
  if (pEl) pEl.textContent = `${table.guests || 1} персоны`;

  const container = document.getElementById('ticketItemsContainer');
  const totalPriceEl = document.getElementById('ticketTotalPrice');
  const items = table.items || [];

  const totalSum = calcTableSum(table);
  const totalQty = items.reduce((s, it) => s + it.qty, 0);

  if (totalPriceEl) totalPriceEl.textContent = `${totalSum} ₽`;
  if (countBadge) {
    countBadge.textContent = totalQty;
    if (totalQty > 0) countBadge.classList.remove('hidden');
    else countBadge.classList.add('hidden');
  }
  if (countText) countText.textContent = `${totalQty} шт.`;

  if (!container) return;
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `
      <div class="h-36 flex flex-col items-center justify-center text-center text-slate-400 space-y-1.5">
        <span class="text-2xl">☕</span>
        <p class="text-xs">Чек пуст.<br>Нажмите на блюдо для добавления.</p>
      </div>
    `;
    return;
  }

  items.forEach((it, idx) => {
    const modsSum = (it.modifiers || []).reduce((acc, m) => acc + (m.price || 0), 0);
    const itemFullPrice = it.price + modsSum;

    const row = document.createElement('div');
    row.className = `p-2.5 rounded-2xl border text-xs flex flex-col gap-1 transition select-none cursor-pointer active:scale-[0.98] ${
      it.served 
        ? 'border-emerald-300 bg-emerald-50/70 shadow-xs' 
        : (it.sentToKitchen ? 'border-slate-200 bg-slate-50' : 'border-orange-200 bg-orange-50/40')
    }`;

    // Переменная для отслеживания двойного тапа
    let lastTapTime = 0;

    row.addEventListener('click', (e) => {
      // Игнорируем клики по кнопкам + / - / удалить, чтобы не сбивать счетчик
      if (e.target.closest('button')) return;

      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;

      if (tapLength < 320 && tapLength > 0) {
        // Двойной тап зафиксирован!
        toggleServed(idx);
        e.preventDefault();
      }
      lastTapTime = currentTime;
    });

    row.innerHTML = `
      <div class="flex items-start justify-between gap-1.5">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-extrabold text-xs ${it.served ? 'line-through text-slate-400' : 'text-slate-800'}">
              ${it.name}
            </span>
            ${it.served ? '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-500 text-white rounded-full font-bold flex items-center gap-0.5">✓ Подано</span>' : ''}
            ${(!it.served && it.sentToKitchen) ? '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full font-semibold">Готовится</span>' : ''}
            ${(!it.served && !it.sentToKitchen) ? '<span class="text-[9px] px-1.5 py-0.2 bg-orange-100 text-orange-700 rounded-full font-semibold animate-pulse">Новое</span>' : ''}
          </div>
          ${it.modifiers && it.modifiers.length > 0 ? `<div class="text-[9px] text-orange-600 font-mono mt-0.5">+ ${it.modifiers.map(m => m.name).join(', ')}</div>` : ''}
          ${it.comment ? `<div class="text-[9px] text-slate-500 italic mt-0.5">💬 "${it.comment}"</div>` : ''}
          <div class="text-[8px] text-slate-400 mt-0.5 tracking-tight font-medium">⚡ Двойной тап — ${it.served ? 'отменить подачу' : 'отметить как подано'}</div>
        </div>
        <span class="font-mono font-black text-xs text-slate-900 shrink-0">${itemFullPrice * it.qty} ₽</span>
      </div>

      <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 mt-0.5">
        <span class="text-[9px] font-mono text-slate-400">${itemFullPrice} ₽/шт</span>
        <div class="flex items-center gap-1">
          <button onclick="changeQty(${idx}, -1)" class="w-6 h-6 bg-white border border-slate-200 text-slate-700 rounded-lg font-black flex items-center justify-center active:scale-90 shadow-2xs">-</button>
          <span class="font-mono font-bold text-xs px-1.5 text-slate-800">${it.qty}</span>
          <button onclick="changeQty(${idx}, 1)" class="w-6 h-6 bg-white border border-slate-200 text-slate-700 rounded-lg font-black flex items-center justify-center active:scale-90 shadow-2xs">+</button>
          <button onclick="deleteCartItem(${idx})" title="Удалить позицию" class="ml-1.5 w-6 h-6 rounded-lg text-slate-400 hover:text-rose-500 flex items-center justify-center text-xs active:scale-90">✕</button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

/* ПЕРЕКЛЮЧЕНИЕ СТАТУСА ПОДАЧИ */
function toggleServed(idx) {
  const table = tables.find(t => t.id === currentTableId);
  if (!table || !table.items[idx]) return;

  table.items[idx].served = !table.items[idx].served;
  const isNowServed = table.items[idx].served;

  syncToCloud();
  renderOrderScreen();

  if (isNowServed) {
    showToast(`«${table.items[idx].name}» подано! ✓`, '🍽️');
  } else {
    showToast(`«${table.items[idx].name}» возвращено в готовку`, '⏳');
  }
}


function changeQty(idx, delta) {
  const table = tables.find(t => t.id === currentTableId);
  if (!table || !table.items[idx]) return;
  table.items[idx].qty += delta;
  if (table.items[idx].qty <= 0) table.items.splice(idx, 1);
  syncToCloud();
  renderOrderScreen();
  renderDishes();
}

function deleteCartItem(idx) {
  const table = tables.find(t => t.id === currentTableId);
  if (!table || !table.items[idx]) return;
  table.items.splice(idx, 1);
  syncToCloud();
  renderOrderScreen();
  renderDishes();
}

function sendNewItemsToKitchen() {
  const table = tables.find(t => t.id === currentTableId);
  if (!table || !table.items || table.items.length === 0) return;
  table.items.forEach(it => it.sentToKitchen = true);
  syncToCloud();
  renderOrderScreen();
  showToast('Заказ отправлен в цех!', '🚀');
}

function clearCurrentOrder() {
  if (!confirm("Очистить чек этого стола?")) return;
  const table = tables.find(t => t.id === currentTableId);
  if (!table) return;
  table.items = [];
  table.guests = 0;
  syncToCloud();
  renderOrderScreen();
  renderDishes();
  showToast('Чек очищен', '🗑️');
}

/* Пересадка за свободный стол */
function openTransferTableModal() {
  const currentTable = tables.find(t => t.id === currentTableId);
  if (!currentTable) return;

  const fromText = document.getElementById('transferModalFromText');
  if (fromText) fromText.textContent = `Текущий: Стол ${currentTable.name || currentTable.id}`;

  const container = document.getElementById('transferAvailableTablesContainer');
  if (!container) return;
  container.innerHTML = '';

  const freeTables = tables.filter(t => t.id !== currentTableId && (!t.items || t.items.length === 0));

  if (freeTables.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-6 text-center text-slate-400">
        <span class="text-xl">🚫</span>
        <p class="text-xs mt-1">Все остальные столы заняты</p>
      </div>
    `;
  } else {
    freeTables.forEach(t => {
      const btn = document.createElement('button');
      btn.className = "p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 text-slate-800 font-bold flex flex-col items-center justify-center transition active:scale-95";
      btn.innerHTML = `
        <span class="text-sm font-black text-slate-900">${t.name || t.id}</span>
        <span class="text-[9px] text-emerald-600 font-semibold">Свободен</span>
      `;
      btn.onclick = () => executeTransferTable(t.id);
      container.appendChild(btn);
    });
  }

  document.getElementById('transferTableModal')?.classList.remove('hidden');
}

function executeTransferTable(targetTableId) {
  const fromTable = tables.find(t => t.id === currentTableId);
  const targetTable = tables.find(t => t.id === targetTableId);

  if (!fromTable || !targetTable) return;

  targetTable.items = [...(fromTable.items || [])];
  targetTable.guests = fromTable.guests || 1;
  targetTable.waiter = fromTable.waiter || currentWaiter;

  fromTable.items = [];
  fromTable.guests = 0;
  fromTable.waiter = "";

  syncToCloud();
  closeModal('transferTableModal');
  currentTableId = targetTable.id;

  goToOrderView(targetTable.id);
  showToast(`Пересажено на Стол ${targetTable.name || targetTable.id}!`, '🔄');
}

function syncToCloud() {
  saveTablesToCloud(tables, obstacles, currentWaiter);
}

function showToast(msg, icon = '🔔') {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');
  if (!toast || !msgEl || !iconEl) return;
  msgEl.textContent = msg;
  iconEl.textContent = icon;
  toast.classList.remove('opacity-0', '-translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-4');
  }, 1800);
}

/* =========================================================
 * ЭКРАН ВХОДА И ДИНАМИЧЕСКИЕ ИМЕНА ИЗ БАЗЫ
 * ========================================================= */
function renderWaitersList() {
  const container = document.getElementById('quickWaitersList');
  if (!container) return;
  container.innerHTML = '';

  knownWaiters.forEach(name => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = "px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 font-semibold active:scale-95 transition";
    btn.textContent = name;
    btn.onclick = () => selectQuickWaiter(name);
    container.appendChild(btn);
  });
}

function openWelcomeModal() {
  renderWaitersList();
  document.getElementById('welcomeModal')?.classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}

function selectQuickWaiter(name) {
  const inp = document.getElementById('waiterCustomNameInput');
  if (inp) inp.value = name;
  confirmWaiterLogin();
}

function confirmWaiterLogin() {
  const inp = document.getElementById('waiterCustomNameInput');
  const name = (inp?.value || '').trim();
  if (!name) return;
  currentWaiter = name;

  if (!knownWaiters.includes(name)) {
    knownWaiters.push(name);
  }

  localStorage.setItem('coffeeman_waiter_name', currentWaiter);
  const el = document.getElementById('headerWaiterName');
  if (el) el.textContent = `Официант: ${currentWaiter}`;
  closeModal('welcomeModal');
  showToast(`Привет, ${currentWaiter}!`, '☕');
}

/* Экспорт в window */
window.zoomMap = zoomMap;
window.resetMapView = resetMapView;
window.switchAppTab = switchAppTab;
window.filterActiveOrders = filterActiveOrders;
window.onTableClicked = onTableClicked;
window.openGuestsModal = openGuestsModal;
window.openGuestsModalForCurrentTable = () => openGuestsModal(currentTableId);
window.goToTablesView = goToTablesView;
window.setTempGuests = setTempGuests;
window.confirmGuestSelection = confirmGuestSelection;
window.appendQuickComment = appendQuickComment;
window.clearModalComment = clearModalComment;
window.skipAndAddDish = skipAndAddDish;
window.confirmDishWithModifiers = confirmDishWithModifiers;
window.openTransferTableModal = openTransferTableModal;
window.executeTransferTable = executeTransferTable;
window.changeQty = changeQty;
window.deleteCartItem = deleteCartItem;
window.sendNewItemsToKitchen = sendNewItemsToKitchen;
window.clearCurrentOrder = clearCurrentOrder;
window.openWelcomeModal = openWelcomeModal;
window.closeModal = closeModal;
window.selectQuickWaiter = selectQuickWaiter;
window.confirmWaiterLogin = confirmWaiterLogin;

window.selectCategory = (cat) => {
  currentCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    if (btn.dataset.cat === cat) {
      btn.className = "cat-pill px-3.5 py-1.5 rounded-full bg-orange-500 text-white shrink-0 font-bold transition";
    } else {
      btn.className = "cat-pill px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 shrink-0 font-medium transition";
    }
  });
  renderDishes();
};

window.onSearchChange = () => {
  const q = document.getElementById('searchInput')?.value.trim();
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    if (q && q.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderDishes();
};

window.clearSearchInput = () => {
  const inp = document.getElementById('searchInput');
  if (inp) {
    inp.value = '';
    inp.focus();
  }
  window.onSearchChange();
};

window.openCashierCheckoutModal = () => {
  const table = tables.find(t => t.id === currentTableId);
  if (!table || !table.items || table.items.length === 0) {
    showToast('В чеке пока пусто!', '⚠️');
    return;
  }
  const tag = document.getElementById('cashierModalTableTag');
  const lines = document.getElementById('cashierReceiptLines');
  const sum = document.getElementById('cashierModalTotalSum');

  if (tag) tag.textContent = table.name ? `Стол ${table.name}` : `Стол ${table.id}`;
  if (sum) sum.textContent = `${calcTableSum(table)} ₽`;

  if (lines) {
    lines.innerHTML = '';
    table.items.forEach((it, i) => {
      const modsSum = (it.modifiers || []).reduce((acc, m) => acc + (m.price || 0), 0);
      const row = document.createElement('div');
      row.className = "py-1.5 border-b border-slate-100 text-xs";
      row.innerHTML = `
        <div class="flex justify-between">
          <span class="text-slate-700 font-bold">${i + 1}. ${it.name} (${it.qty} × ${it.price + modsSum}₽)</span>
          <span class="font-bold text-orange-600 font-mono">${(it.price + modsSum) * it.qty} ₽</span>
        </div>
        ${it.modifiers && it.modifiers.length > 0 ? `
          <div class="text-[10px] text-slate-400 font-mono pl-3">+ ${it.modifiers.map(m => m.name).join(', ')}</div>
        ` : ''}
        ${it.comment ? `
          <div class="text-[10px] text-slate-400 italic pl-3">💬 "${it.comment}"</div>
        ` : ''}
      `;
      lines.appendChild(row);
    });
  }

  document.getElementById('cashierCheckoutModal')?.classList.remove('hidden');
};

window.copyReceiptToClipboard = () => {
  const table = tables.find(t => t.id === currentTableId);
  if (!table || !table.items) return;
  let text = `ЧЕК • ${table.name ? `Стол ${table.name}` : `Стол ${table.id}`}\n`;
  table.items.forEach((it, i) => {
    const modsSum = (it.modifiers || []).reduce((acc, m) => acc + (m.price || 0), 0);
    text += `${i+1}. ${it.name} x${it.qty} = ${(it.price + modsSum) * it.qty} ₽\n`;
    if (it.modifiers && it.modifiers.length > 0) {
      text += `   (${it.modifiers.map(m => m.name).join(', ')})\n`;
    }
    if (it.comment) {
      text += `   [${it.comment}]\n`;
    }
  });
  text += `ИТОГО: ${calcTableSum(table)} ₽`;
  navigator.clipboard.writeText(text);
  showToast('Чек скопирован!', '📋');
};

window.completeAndFreeTable = () => {
  const table = tables.find(t => t.id === currentTableId);
  if (!table) return;
  table.items = [];
  table.guests = 0;
  table.waiter = "";
  syncToCloud();
  closeModal('cashierCheckoutModal');
  goToTablesView();
  showToast('Стол освобожден!', '💰');
};

window.openCustomDishModal = () => document.getElementById('customDishModal')?.classList.remove('hidden');

window.saveCustomDishToOrder = () => {
  const name = (document.getElementById('customDishName')?.value || '').trim();
  const price = parseFloat(document.getElementById('customDishPrice')?.value) || 0;
  const qty = parseInt(document.getElementById('customDishQty')?.value) || 1;

  if (!name || price <= 0) {
    showToast('Укажите название и цену', '⚠️');
    return;
  }

  const table = tables.find(t => t.id === currentTableId);
  if (!table) return;

  if (!table.items) table.items = [];
  table.items.push({
    uniqueCartId: `custom_${Date.now()}`,
    dishId: `custom_${Date.now()}`,
    name: `★ ${name}`,
    price: price,
    qty: qty,
    modifiers: [],
    comment: "",
    sentToKitchen: false,
    served: false,
    addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  syncToCloud();
  renderOrderScreen();
  closeModal('customDishModal');
  showToast(`+ ${name}`, '✨');
};

/* Инициализация */
window.addEventListener('DOMContentLoaded', () => {
  const savedName = localStorage.getItem('coffeeman_waiter_name');
  if (savedName) {
    currentWaiter = savedName;
    const el = document.getElementById('headerWaiterName');
    if (el) el.textContent = `Официант: ${currentWaiter}`;
    if (!knownWaiters.includes(savedName)) knownWaiters.push(savedName);
  } else {
    openWelcomeModal();
  }

  try {
    const local = localStorage.getItem('coffeeman_local_backup');
    if (local) {
      const p = JSON.parse(local);
      if (p.tables && p.tables.length > 0) tables = p.tables;
      if (p.obstacles) obstacles = p.obstacles;
      renderHallMap();
      applyMapTransform();
    }
  } catch(e) {}

  initFirebaseAuth(() => {
    subscribeToCloudTables((remoteTables, remoteObstacles) => {
      if (remoteTables && remoteTables.length > 0) {
        tables = remoteTables;
      }
      if (remoteObstacles) {
        obstacles = remoteObstacles;
      }

      if (currentAppTab === 'map') {
        renderHallMap();
      } else if (currentAppTab === 'orders') {
        renderActiveOrdersScreen();
      } else {
        renderOrderScreen();
      }
      applyMapTransform();
    });
  });
});