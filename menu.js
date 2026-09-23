/* =========================================================
 * СПРАВОЧНИК МОДИФИКАТОРОВ И ДОБАВОК COFFEEMAN
 * ========================================================= */
export const MODIFIERS_DATA = {
  // Выбор подачи чая: Чашка или Чайник
  tea_serving: {
    title: "Подача чая",
    type: "single",
    items: [
      { id: "ts_cup", name: "Чашка", price: 0 },
      { id: "ts_pot", name: "Чайник", price: 100 } // +100₽ к базовой цене (140 -> 240₽)
    ]
  },

  // Подача для Улуна и Ройбуша (160 / 270₽)
  tea_serving_premium: {
    title: "Подача чая",
    type: "single",
    items: [
      { id: "tsp_cup", name: "Чашка (160 мл)", price: 0 },
      { id: "tsp_pot", name: "Чайник (270 мл)", price: 110 } // +110₽ (160 -> 270₽)
    ]
  },

  // Начинка для Поке
  poke_base: {
    title: "Выбор основы / рыбы",
    type: "single",
    items: [
      { id: "pk_salmon", name: "С лососем", price: 0 },
      { id: "pk_eel", name: "С угрём", price: 0 },
      { id: "pk_shrimp", name: "С креветками", price: 0 }
    ]
  },

  // Мясо в Теппаньяки и Тонкацу
  meat_choice: {
    title: "Выбор мяса",
    type: "single",
    items: [
      { id: "mc_chicken", name: "Курица", price: 0 },
      { id: "mc_beef", name: "Говядина", price: 0 },
      { id: "mc_pork", name: "Свинина", price: 0 }
    ]
  },

  // Начинка кесадильи
  quesadilla_filling: {
    title: "Начинка кесадильи",
    type: "single",
    items: [
      { id: "qf_chicken", name: "С курицей", price: 0 },
      { id: "qf_ham", name: "С ветчиной", price: 0 },
      { id: "qf_tomato", name: "С помидорами", price: 0 }
    ]
  },

  // Соус к наггетсам и фри
  sauces: {
    title: "Соус на выбор",
    type: "single",
    items: [
      { id: "sc_cheese", name: "Сырный соус", price: 0 },
      { id: "sc_garlic", name: "Чесночный соус", price: 0 },
      { id: "sc_ketchup", name: "Кетчуп", price: 0 }
    ]
  },

  // Заправка к супам
  soup_dressing: {
    title: "Заправка к супу",
    type: "single",
    items: [
      { id: "sd_sour_cream", name: "Сметана", price: 0 },
      { id: "sd_mayo", name: "Майонез", price: 0 },
      { id: "sd_none", name: "Без заправки", price: 0 }
    ]
  },

  // Молоко для кофе и какао
  milk: {
    title: "Молоко / Основа",
    type: "single",
    items: [
      { id: "m_classic", name: "Обычное молоко", price: 0 },
      { id: "m_alt", name: "Альтернативное / безлактозное", price: 60 }
    ]
  },

  // Объём кофе
  coffee_volume: {
    title: "Объём порции",
    type: "single",
    items: [
      { id: "vol_standard", name: "Стандарт", price: 0 },
      { id: "vol_large", name: "Большой (+объём)", price: 40 }
    ]
  },

  // Сиропы
  syrups: {
    title: "Сиропы в ассортименте",
    type: "multi",
    items: [
      { id: "s_caramel", name: "Карамель", price: 60 },
      { id: "s_vanilla", name: "Ваниль", price: 60 },
      { id: "s_nut", name: "Ореховый", price: 60 },
      { id: "s_berry", name: "Ягодный", price: 60 },
      { id: "s_coconut", name: "Кокос", price: 60 }
    ]
  },

  // Начинка для блинчиков
  pancake_filling: {
    title: "Начинка блинчиков",
    type: "single",
    items: [
      { id: "pf_salmon", name: "С лососем", price: 0 },
      { id: "pf_chicken", name: "С курицей", price: -30 },
      { id: "pf_cottage", name: "С творогом", price: -30 }
    ]
  },

  // Каши основа
  porridge_base: {
    title: "Крупа",
    type: "single",
    items: [
      { id: "pb_oat", name: "Овсяная", price: 0 },
      { id: "pb_rice", name: "Рисовая", price: 0 }
    ]
  },

  // Яйца завтрака
  egg_style: {
    title: "Приготовление яиц",
    type: "single",
    items: [
      { id: "es_fried", name: "Яичница-глазунья", price: 0 },
      { id: "es_omelet", name: "Омлет", price: 0 }
    ]
  },

  // Выбор вкуса мороженого
  ice_cream_choice: {
    title: "Мороженое на выбор",
    type: "single",
    items: [
      { id: "ic_vanilla", name: "Ванильное", price: 0 },
      { id: "ic_chocolate", name: "Шоколадное", price: 0 },
      { id: "ic_strawberry", name: "Клубничное", price: 0 }
    ]
  }
};

/* =========================================================
 * ПОЛНОЕ МЕНЮ С ОПИСАНИЯМИ
 * ========================================================= */
export const FULL_MENU = [
  // --- КЛАССИЧЕСКИЙ КОФЕ ---
  { id: 101, name: "Эспрессо", price: 140, cat: "coffee_classic", catTitle: "Классический кофе", desc: "Насыщенный классический шот эспрессо", modGroups: [] },
  { id: 102, name: "Американо", price: 180, cat: "coffee_classic", catTitle: "Классический кофе", desc: "Эспрессо с горячей водой (180/220 мл)", modGroups: ["coffee_volume", "syrups"] },
  { id: 103, name: "Латте", price: 260, cat: "coffee_classic", catTitle: "Классический кофе", desc: "Эспрессо с нежной молочной пенкой (260/300 мл)", modGroups: ["coffee_volume", "milk", "syrups"] },
  { id: 104, name: "Капучино", price: 260, cat: "coffee_classic", catTitle: "Классический кофе", desc: "Идеальный баланс кофе и плотной молочной пены (260/300 мл)", modGroups: ["coffee_volume", "milk", "syrups"] },
  { id: 105, name: "Флэт Уайт", price: 270, cat: "coffee_classic", catTitle: "Классический кофе", desc: "Двойной эспрессо с бархатистым молоком", modGroups: ["milk"] },

  // --- АВТОРСКИЙ КОФЕ ---
  { id: 111, name: "Цитрусовый раф", price: 350, cat: "coffee_author", catTitle: "Авторский кофе", desc: "Сливочный раф с натуральной цитрусовой нотой", modGroups: [] },
  { id: 112, name: "Ореховый раф", price: 350, cat: "coffee_author", catTitle: "Авторский кофе", desc: "Нежный раф с насыщенным ореховым вкусом", modGroups: [] },
  { id: 113, name: "Латте солёная карамель", price: 350, cat: "coffee_author", catTitle: "Авторский кофе", desc: "Классический латте с топпингом домашней солёной карамели", modGroups: ["milk"] },
  { id: 114, name: "Латте малина", price: 360, cat: "coffee_author", catTitle: "Авторский кофе", desc: "Классический латте с ярким акцентом малины", modGroups: ["milk"] },

  // --- ГОРЯЧИЕ НАПИТКИ ---
  { id: 121, name: "Матча Латте", price: 320, cat: "hot_drinks", catTitle: "Горячие напитки", desc: "Японский зелёный чай матча со взбитым молоком", modGroups: ["milk", "syrups"] },
  { id: 122, name: "Какао", price: 260, cat: "hot_drinks", catTitle: "Горячие напитки", desc: "Горячий шоколадный напиток из отборного какао", modGroups: ["milk", "syrups"] },

  // --- ЧИСТЫЕ ЧАИ (ЧАШКА ИЛИ ЧАЙНИК) ---
  { id: 131, name: "Чёрный чай", price: 140, cat: "tea", catTitle: "Чистые чаи", desc: "Классический чёрный чай на выбор: чашка 140 мл (140 ₽) или чайник 240 мл (240 ₽)", modGroups: ["tea_serving"] },
  { id: 132, name: "Зелёный чай", price: 140, cat: "tea", catTitle: "Чистые чаи", desc: "Благородный зелёный чай на выбор: чашка 140 мл (140 ₽) или чайник 240 мл (240 ₽)", modGroups: ["tea_serving"] },
  { id: 133, name: "Молочный улун", price: 160, cat: "tea", catTitle: "Чистые чаи", desc: "Карамельно-сливочный улун: чашка 160 мл (160 ₽) или чайник 270 мл (270 ₽)", modGroups: ["tea_serving_premium"] },
  { id: 134, name: "Ройбуш", price: 160, cat: "tea", catTitle: "Чистые чаи", desc: "Травяной напиток без кофеина: чашка 160 мл (160 ₽) или чайник 270 мл (270 ₽)", modGroups: ["tea_serving_premium"] },

  // --- АВТОРСКИЙ ЧАЙ ---
  { id: 141, name: "Облепиха-апельсин", price: 360, cat: "tea", catTitle: "Авторский чай", desc: "Чёрный чай, облепиха, апельсин, мёд (подаётся в чайнике)", modGroups: [] },
  { id: 142, name: "Лимон-имбирь", price: 350, cat: "tea", catTitle: "Авторский чай", desc: "Чёрный чай, лимон, имбирь, мёд (подаётся в чайнике)", modGroups: [] },
  { id: 143, name: "Смородиновый", price: 350, cat: "tea", catTitle: "Авторский чай", desc: "Чёрный чай, смородина, мёд (подаётся в чайнике)", modGroups: [] },
  { id: 144, name: "Ягодный микс", price: 360, cat: "tea", catTitle: "Авторский чай", desc: "Чёрный чай, малина, смородина, мёд (подаётся в чайнике)", modGroups: [] },

  // --- СМУЗИ ---
  { id: 151, name: "Тропический смузи", price: 360, cat: "smoothies", catTitle: "Смузи", desc: "Ананас, манго, сок, банан", modGroups: [] },
  { id: 152, name: "Смородиновый смузи", price: 360, cat: "smoothies", catTitle: "Смузи", desc: "Смородина, сок, банан", modGroups: [] },
  { id: 153, name: "Витаминный смузи", price: 360, cat: "smoothies", catTitle: "Смузи", desc: "Клубника, малина, сок, банан", modGroups: [] },
  { id: 154, name: "Зелёный смузи", price: 360, cat: "smoothies", catTitle: "Смузи", desc: "Киви, яблоко, банан, сок", modGroups: [] },

  // --- МИЛКШЕЙКИ ---
  { id: 161, name: "Сливочный милкшейк", price: 350, cat: "cold_drinks", catTitle: "Милкшейки", desc: "Густой классический коктейль с мороженым", modGroups: [] },
  { id: 162, name: "Клубничный милкшейк", price: 350, cat: "cold_drinks", catTitle: "Милкшейки", desc: "Освежающий ягодный милкшейк с клубникой", modGroups: [] },
  { id: 163, name: "Шоколадный милкшейк", price: 350, cat: "cold_drinks", catTitle: "Милкшейки", desc: "Насыщенный шоколадный коктейль", modGroups: [] },

  // --- ХОЛОДНЫЕ НАПИТКИ ---
  { id: 171, name: "Морс брусничный / облепиховый", price: 150, cat: "cold_drinks", catTitle: "Холодные напитки", desc: "Домашний ягодный морс", modGroups: [] },
  { id: 172, name: "Газированные напитки", price: 220, cat: "cold_drinks", catTitle: "Холодные напитки", desc: "В ассортименте (220/260 ₽)", modGroups: [] },
  { id: 173, name: "Сок в ассортименте", price: 150, cat: "cold_drinks", catTitle: "Холодные напитки", desc: "Стакан натурального сока", modGroups: [] },
  { id: 174, name: "Вода", price: 130, cat: "cold_drinks", catTitle: "Холодные напитки", desc: "Питьевая вода без газа", modGroups: [] },

  // --- ЗАВТРАКИ ---
  { id: 201, name: "Мюсли с йогуртом", price: 310, cat: "breakfast", catTitle: "Завтраки", desc: "Хрустящие мюсли со свежим йогуртом", modGroups: [] },
  { id: 202, name: "Сырники", price: 310, cat: "breakfast", catTitle: "Завтраки", desc: "Подаются со сметаной, сгущенкой или джемом", modGroups: ["syrups"] },
  { id: 203, name: "Каша овсяная / рисовая", price: 270, cat: "breakfast", catTitle: "Завтраки", desc: "Свежесваренная каша на выбор (270/295 ₽)", modGroups: ["porridge_base", "milk"] },
  { id: 204, name: "Блинчики классические", price: 210, cat: "breakfast", catTitle: "Завтраки", desc: "Сметана / сгущенка / джем", modGroups: ["syrups"] },
  { id: 205, name: "Блинчики с начинкой", price: 370, cat: "breakfast", catTitle: "Завтраки", desc: "С лососем (370 ₽), курицей или творогом (340 ₽)", modGroups: ["pancake_filling"] },
  { id: 206, name: "Английский завтрак", price: 360, cat: "breakfast", catTitle: "Завтраки", desc: "Яичница, помидор, огурец, сыр", modGroups: [] },
  { id: 207, name: "Мексиканский завтрак", price: 360, cat: "breakfast", catTitle: "Завтраки", desc: "Салат, яйцо, помидор, сыр", modGroups: [] },
  { id: 208, name: "Яичница / Омлет с беконом", price: 360, cat: "breakfast", catTitle: "Завтраки", desc: "Горячие яйца на выбор с хрустящим беконом", modGroups: ["egg_style"] },

  // --- ЗАКУСКИ ---
  { id: 211, name: "Сэндвич на тостовом хлебе", price: 360, cat: "snacks", catTitle: "Закуски", desc: "Сыр, листья салата, томаты, куриное филе", modGroups: [] },
  { id: 212, name: "Сэндвич-клаб", price: 360, cat: "snacks", catTitle: "Закуски", desc: "С сыром, томатами и куриным филе", modGroups: [] },
  { id: 213, name: "Сэндвич на бейгле", price: 390, cat: "snacks", catTitle: "Закуски", desc: "Сыр, листья салата, соус, томаты, куриное филе/ветчина", modGroups: [] },
  { id: 214, name: "Кесадилья", price: 460, cat: "snacks", catTitle: "Закуски", desc: "С курицей, ветчиной или помидорами на выбор", modGroups: ["quesadilla_filling"] },
  { id: 215, name: "Наггетсы куриные", price: 390, cat: "snacks", catTitle: "Закуски", desc: "Хрустящие наггетсы. Соус на выбор", modGroups: ["sauces"] },
  { id: 216, name: "Брускетта с лососем", price: 480, cat: "snacks", catTitle: "Закуски", desc: "Лосось, творожный сыр, зерновой хлеб", modGroups: [] },
  { id: 217, name: "Брускетта с авокадо и с креветками", price: 480, cat: "snacks", catTitle: "Закуски", desc: "Тигровые креветки, авокадо, творожный сыр", modGroups: [] },
  { id: 218, name: "Чиккен & фрайс", price: 450, cat: "snacks", catTitle: "Закуски", desc: "Куриный шашлычок, картофель фри, соус на выбор", modGroups: ["sauces"] },
  { id: 219, name: "Картофель фри", price: 250, cat: "snacks", catTitle: "Закуски", desc: "Золотистый хрустящий картофель фри", modGroups: ["sauces"] },

  // --- САЛАТЫ ---
  { id: 221, name: "Цезарь с курицей", price: 460, cat: "salads", catTitle: "Салаты", desc: "Куриное филе, салат, томаты черри, крутоны, соус цезарь", modGroups: [] },
  { id: 222, name: "Цезарь с креветками", price: 480, cat: "salads", catTitle: "Салаты", desc: "Тигровые креветки, салат, томаты черри, соус цезарь", modGroups: [] },
  { id: 223, name: "Оливье", price: 390, cat: "salads", catTitle: "Салаты", desc: "Традиционный праздничный мясной салат", modGroups: [] },
  { id: 224, name: "Салат из слабосоленого лосося", price: 480, cat: "salads", catTitle: "Салаты", desc: "Лосось, стручковая фасоль, апельсин, листья салата", modGroups: [] },
  { id: 225, name: "Теплый салат", price: 460, cat: "salads", catTitle: "Салаты", desc: "Куриное филе, листья салата, свежие овощи", modGroups: [] },

  // --- СУПЫ ---
  { id: 231, name: "Суп дня (Борщ)", price: 260, cat: "soups", catTitle: "Супы", desc: "Наваристый домашний суп / борщ. Подается с заправкой", modGroups: ["soup_dressing"] },
  { id: 232, name: "Куриный бульон", price: 260, cat: "soups", catTitle: "Супы", desc: "Подаётся с варёным яйцом и зеленью", modGroups: ["soup_dressing"] },
  { id: 233, name: "Солянка мясная", price: 360, cat: "soups", catTitle: "Супы", desc: "Сборная мясная солянка, подаётся с крутонами", modGroups: ["soup_dressing"] },
  { id: 234, name: "Сырный крем-суп", price: 360, cat: "soups", catTitle: "Супы", desc: "Нежный сливочно-сырный крем-суп", modGroups: [] },
  { id: 235, name: "Грибной крем-суп", price: 360, cat: "soups", catTitle: "Супы", desc: "Ароматный крем-суп из шампиньонов со сливками", modGroups: [] },

  // --- ПАСТЫ ---
  { id: 241, name: "Паста «Болоньезе»", price: 620, cat: "pastas", catTitle: "Пасты", desc: "Домашняя лапша, фарш, фирменный соус", modGroups: [] },
  { id: 242, name: "Паста «Карбонара»", price: 620, cat: "pastas", catTitle: "Пасты", desc: "Феттуччини, бекон, яйца, сливочный соус, пармезан", modGroups: [] },
  { id: 243, name: "Паста с креветками", price: 660, cat: "pastas", catTitle: "Пасты", desc: "Феттуччини, сливочный соус, креветки, яйцо, пармезан", modGroups: [] },
  { id: 244, name: "Паста с цыпленком и грибами", price: 620, cat: "pastas", catTitle: "Пасты", desc: "Феттуччини, цыплёнок, фирменный соус, шампиньоны, пармезан", modGroups: [] },

  // --- ГОРЯЧИЕ БЛЮДА ---
  { id: 251, name: "Удон с курицей", price: 570, cat: "hot", catTitle: "Горячие блюда", desc: "Пшеничная лапша, куриное филе, овощи, кунжут, соус", modGroups: [] },
  { id: 252, name: "Удон с креветками", price: 590, cat: "hot", catTitle: "Горячие блюда", desc: "Пшеничная лапша, креветки, овощи, кунжут, соус", modGroups: [] },
  { id: 253, name: "Удон с говядиной", price: 590, cat: "hot", catTitle: "Горячие блюда", desc: "Пшеничная лапша, говядина, овощи, кунжут, соус", modGroups: [] },
  { id: 254, name: "Теппаньяки", price: 560, cat: "hot", catTitle: "Горячие блюда", desc: "Рис, кунжут, мясо на выбор, болгарский перец, лук, соус", modGroups: ["meat_choice"] },
  { id: 255, name: "Поке (с лососем / угрём / с креветками)", price: 650, cat: "hot", catTitle: "Горячие блюда", desc: "Рис, овощи, авокадо, чука, кунжут, ореховый соус", modGroups: ["poke_base"] },
  { id: 256, name: "Тонкацу с курицей / свининой", price: 650, cat: "hot", catTitle: "Горячие блюда", desc: "Соус тонкацу, фасоль, перец, сыр, картофельное пюре", modGroups: ["meat_choice"] },
  { id: 257, name: "Жаркое по-домашнему", price: 670, cat: "hot", catTitle: "Горячие блюда", desc: "Говядина, картофель, свежие овощи", modGroups: [] },

  // --- ДЕСЕРТЫ ---
  { id: 261, name: "Домашний пирог", price: 330, cat: "desserts", catTitle: "Десерты", desc: "Свежая домашняя выпечка от шефа", modGroups: [] },
  { id: 262, name: "Блинчики «Сюзетт»", price: 360, cat: "desserts", catTitle: "Десерты", desc: "Соус сюзетт, клубника, мороженое, клубничный топпинг", modGroups: ["ice_cream_choice"] },
  { id: 263, name: "Сметанник с бананом", price: 360, cat: "desserts", catTitle: "Десерты", desc: "Бисквит, соус сметанник, банан, грецкий орех", modGroups: [] },
  { id: 264, name: "Фруктовый салат с шариком мороженого", price: 330, cat: "desserts", catTitle: "Десерты", desc: "Свежие сезонные фрукты со сливочным мороженым", modGroups: [] },

  // --- БИЗНЕС ЛАНЧИ ---
  { id: 301, name: "Бизнес Ланч №1", price: 650, cat: "lunch", catTitle: "Бизнес Ланч", desc: "Салат невеста, Солянка по-домашнему, Тефтели с пюре, Хлеб, Чай/Морс", modGroups: ["soup_dressing"] },
  { id: 302, name: "Бизнес Ланч №2", price: 650, cat: "lunch", catTitle: "Бизнес Ланч", desc: "Овощной салат с брынзой, Суп куриный, Жаркое по-домашнему, Хлеб, Чай/Морс", modGroups: ["soup_dressing"] },
  { id: 303, name: "Бизнес Ланч №3", price: 650, cat: "lunch", catTitle: "Бизнес Ланч", desc: "Салат невеста, Жаркое по-домашнему, Горячий бутерброд, Хлеб, Чай/Морс", modGroups: [] },
  { id: 304, name: "Бизнес Ланч №4", price: 650, cat: "lunch", catTitle: "Бизнес Ланч", desc: "Овощной салат с брынзой, Тефтели с пюре, Домашний пирог, Хлеб, Чай/Морс", modGroups: [] }
];

/* =========================================================
 * НАЧАЛЬНЫЕ СТОЛЫ
 * ========================================================= */
export const TABLES_INITIAL = [
  { id: 1, name: "1", shape: "round", x: 190, y: 500, w: 80, h: 80, rotation: 0, guests: 0, waiter: "", items: [] },
  { id: 2, name: "2", shape: "rect", x: 310, y: 510, w: 90, h: 65, rotation: 0, guests: 0, waiter: "", items: [] },
  { id: 3, name: "3", shape: "round", x: 425, y: 515, w: 60, h: 60, rotation: 0, guests: 0, waiter: "", items: [] },
  { id: 4, name: "4", shape: "round", x: 485, y: 515, w: 60, h: 60, rotation: 0, guests: 0, waiter: "", items: [] },
  { id: 5, name: "5", shape: "rect", x: 600, y: 510, w: 90, h: 65, rotation: 0, guests: 0, waiter: "", items: [] },
  { id: 6, name: "6", shape: "round", x: 320, y: 615, w: 70, h: 70, rotation: 0, guests: 0, waiter: "", items: [] },
  { id: 7, name: "7", shape: "round", x: 590, y: 610, w: 70, h: 70, rotation: 0, guests: 0, waiter: "", items: [] },
  { id: 8, name: "8", shape: "round", x: 350, y: 730, w: 70, h: 70, rotation: 0, guests: 0, waiter: "", items: [] },
  { id: 9, name: "9", shape: "round", x: 515, y: 730, w: 70, h: 70, rotation: 0, guests: 0, waiter: "", items: [] }
];

export function calcTableSum(table) {
  if (!table || !Array.isArray(table.items)) return 0;
  return table.items.reduce((sum, item) => {
    const modsSum = (item.modifiers || []).reduce((mSum, m) => mSum + (m.price || 0), 0);
    return sum + (item.price + modsSum) * (item.qty || 1);
  }, 0);
}

export function getDishDepartment(cat) {
  const barCats = ['coffee_classic', 'coffee_author', 'hot_drinks', 'tea', 'smoothies', 'cold_drinks'];
  return barCats.includes(cat) ? 'Бар' : 'Кухня';
}
