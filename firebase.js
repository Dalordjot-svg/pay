import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  onValue 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVEvKgcprZx2TBCnkQxsgo5IFVJdNaGRE",
  authDomain: "check-list-c0458.firebaseapp.com",
  databaseURL: "https://check-list-c0458-default-rtdb.firebaseio.com",
  projectId: "check-list-c0458",
  storageBucket: "check-list-c0458.firebasestorage.app",
  messagingSenderId: "34268049423",
  appId: "1:34268049423:web:0e6d5bbb3389b72192737a"
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);

// Узел хранения всей схемы зала
export const stateRef = ref(rtdb, "coffeeman_hall_state");

let syncDebounceTimer = null;

// Инициализация (для совместимости)
export function initFirebaseAuth(onReadyCallback) {
  if (typeof onReadyCallback === "function") {
    onReadyCallback(true);
  }
}

// Сохранение столов и препятствий в Realtime Database
export function saveTablesToCloud(tables, obstacles = [], currentWaiter = "") {
  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    const syncDot = document.getElementById("syncDot");
    const syncText = document.getElementById("syncText");
    if (syncDot) syncDot.className = "w-2 h-2 rounded-full bg-amber-400 animate-spin";

    try {
      const payload = {
        tables: tables,
        obstacles: obstacles,
        updatedAt: new Date().toISOString(),
        lastWaiter: currentWaiter || "Администратор"
      };

      await set(stateRef, payload);

      if (syncDot) syncDot.className = "w-2 h-2 rounded-full bg-emerald-400";
      if (syncText) syncText.textContent = "В сети";
    } catch (err) {
      console.error("Ошибка сохранения в Realtime Database:", err);
      if (syncDot) syncDot.className = "w-2 h-2 rounded-full bg-rose-500";
      if (syncText) syncText.textContent = "Ошибка RTDB";
    }
  }, 150);
}

// Мгновенная подписка на обновления
export function subscribeToCloudTables(onUpdateCallback) {
  return onValue(stateRef, (snapshot) => {
    const data = snapshot.val();
    const syncDot = document.getElementById("syncDot");
    const syncText = document.getElementById("syncText");

    if (syncDot) syncDot.className = "w-2 h-2 rounded-full bg-emerald-400";
    if (syncText) syncText.textContent = "В сети";

    if (data) {
      onUpdateCallback(data.tables || [], data.obstacles || []);
    } else {
      onUpdateCallback([], []);
    }
  }, (err) => {
    console.error("Сбой Realtime Database:", err);
    const syncDot = document.getElementById("syncDot");
    const syncText = document.getElementById("syncText");
    if (syncDot) syncDot.className = "w-2 h-2 rounded-full bg-rose-500";
    if (syncText) syncText.textContent = "Нет доступа";
  });
}