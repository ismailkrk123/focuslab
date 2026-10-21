/**
 * Focuslab - Core State Management & LocalStorage Persistence
 * Features: Rebranded to Focuslab, Oval Geometry Data, Equipment Crafting System,
 * Cart & 100+ Item Shop, Custom Wallpapers, Dynamic Tree Evolution.
 */

const STORAGE_KEY = 'focuslab_v1_data';

const DEFAULT_THEMES = {
  'deep-charcoal': {
    id: 'deep-charcoal',
    name: 'Kömür Karası (Obsidyen & Koyu Siyah)',
    primary: '#38bdf8',
    primaryGlow: 'rgba(56, 189, 248, 0.25)',
    bgDark: '#08090c',
    bgViaDark: '#0c0d12',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'cyber-violet': {
    id: 'cyber-violet',
    name: 'Kozmik Mor (Cyber Violet)',
    primary: '#a855f7',
    primaryGlow: 'rgba(168, 85, 247, 0.25)',
    bgDark: '#07060b',
    bgViaDark: '#100c1c',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'emerald-slate': {
    id: 'emerald-slate',
    name: 'Zümrüt Yeşili (Minimal Orman)',
    primary: '#10b981',
    primaryGlow: 'rgba(16, 185, 129, 0.25)',
    bgDark: '#050a07',
    bgViaDark: '#0a1410',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  },
  'rose-obsidian': {
    id: 'rose-obsidian',
    name: 'Kızıl Alacakaranlık (Sunset)',
    primary: '#f43f5e',
    primaryGlow: 'rgba(244, 63, 94, 0.25)',
    bgDark: '#0a0507',
    bgViaDark: '#160910',
    cardBorderDark: 'rgba(255, 255, 255, 0.08)'
  }
};

const MOTIVATION_QUOTES = [
  { text: "Zorluklar başarıya giden merdivenlerin basamaklarıdır.", author: "Mustafa Kemal Atatürk" },
  { text: "Bizi rahatsız eden şeyler olayların kendisi değil, onlara yüklediğimiz anlamlardır.", author: "Marcus Aurelius" },
  { text: "Zaman en kıymetli hazinedir; onu en değerli hedefin için harca.", author: "Seneca" },
  { text: "Dehanın yüzde biri ilham, yüzde doksan dokuzu terdir.", author: "Thomas Edison" },
  { text: "Gelecek, hedeflerinin güzelliğine inananlarındır.", author: "Eleanor Roosevelt" }
];

// 100+ Catalog Items with Sets & Parts
function generateCatalogItems() {
  const items = [];

  // Crafting Set 1: Efsanevi Mekanik Klavye Parçaları (4 Parça)
  items.push(
    { id: 'craft-kb-1', name: 'Alüminyum Klavye Kasası', category: 'Set Parçası', setId: 'set-keyboard', price: 250, icon: '⌨️', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=300&q=80', desc: 'Ağır CNC işleme mat siyah alüminyum gövde.' },
    { id: 'craft-kb-2', name: 'Özel Hot-Swap PCB Devre Kartı', category: 'Set Parçası', setId: 'set-keyboard', price: 200, icon: '🔌', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80', desc: 'RGB aydınlatmalı, programlanabilir devre.' },
    { id: 'craft-kb-3', name: 'Yağlanmış Sarı Switch Paketi', category: 'Set Parçası', setId: 'set-keyboard', price: 180, icon: '🔘', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80', desc: 'Sessiz ve yağ gibi akıcı basış hissi.' },
    { id: 'craft-kb-4', name: 'PBT Çift Katman Keycap Seti', category: 'Set Parçası', setId: 'set-keyboard', price: 220, icon: '🔤', img: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=300&q=80', desc: 'Aşınmaya dayanıklı mat minimalist tuşlar.' }
  );

  // Crafting Set 2: Ultra Ergonomik Çalışma Setup (4 Parça)
  items.push(
    { id: 'craft-set-1', name: 'Manyetik Ekran Işık Çubuğu', category: 'Set Parçası', setId: 'set-setup', price: 300, icon: '💡', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80', desc: 'Gözü yormayan asimetrik optik aydınlatma.' },
    { id: 'craft-set-2', name: 'Masif Meşe Monitör Yükseltici', category: 'Set Parçası', setId: 'set-setup', price: 320, icon: '🪵', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80', desc: 'Doğal ahşap dokulu ergonomik stand.' },
    { id: 'craft-set-3', name: 'Kablosuz Ergonomik Dikey Mouse', category: 'Set Parçası', setId: 'set-setup', price: 280, icon: '🖱️', img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=300&q=80', desc: 'Bilek ağrısını önleyen ergonomik tasarım.' },
    { id: 'craft-set-4', name: 'Büyük Keçe Masa Matı', category: 'Set Parçası', setId: 'set-setup', price: 150, icon: '⬛', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80', desc: 'Yumuşak dokulu koyu gri keçe çalışma pedi.' }
  );

  // Setup Donanımları & Aksesuarlar (50+ Ürün)
  const names = [
    { n: 'Aktif Gürültü Engelleyici Kulaklık', p: 600, cat: 'Donanım', icon: '🎧' },
    { n: 'Studio Referans Hoparlörü', p: 550, cat: 'Donanım', icon: '🔊' },
    { n: 'Minimalist Kahve Demleme Seti', p: 260, cat: 'Masa Objeleri', icon: '☕' },
    { n: 'Japon Bonsai Ağacı', p: 400, cat: 'Masa Objeleri', icon: '🪴' },
    { n: 'Manyetik Kum Saati', p: 180, cat: 'Masa Objeleri', icon: '⏳' },
    { n: 'Deri Ciltli Not Defteri', p: 120, cat: 'Kırtasiye', icon: '📓' },
    { n: 'Mat Siyah Titanyum Dolma Kalem', p: 240, cat: 'Kırtasiye', icon: '✒️' },
    { n: 'Kristal Gece Küresi', p: 350, cat: 'Aydınlatma', icon: '🔮' },
    { n: 'Retro Edison Masa Lambası', p: 290, cat: 'Aydınlatma', icon: '🏮' },
    { n: 'Sessiz Masa Fanı', p: 200, cat: 'Donanım', icon: '💨' },
    { n: 'Hava Nemlendirici & Buhar Difüzörü', p: 310, cat: 'Donanım', icon: '💧' },
    { n: 'Metal Kablo Düzenleyici Omurga', p: 140, cat: 'Aksesuar', icon: '🗂️' },
    { n: 'Ahşap Kulaklık Standı', p: 160, cat: 'Aksesuar', icon: '🪑' },
    { n: 'Bambu Bardak Altlığı', p: 80, cat: 'Aksesuar', icon: '🍵' },
    { n: 'Doğal Lav Taşı Aromaterapi', p: 190, cat: 'Masa Objeleri', icon: '🪨' },
    { n: 'Minimalist Duvar Saati', p: 220, cat: 'Dekor', icon: '🕰️' },
    { n: 'Mat Akrilik Kitap Desteği', p: 130, cat: 'Dekor', icon: '📚' },
    { n: 'Termal Çelik Matara (750ml)', p: 170, cat: 'Kişisel', icon: '🍶' },
    { n: 'Göz Dinlendirici Mavi Işık Gözlüğü', p: 250, cat: 'Kişisel', icon: '👓' },
    { n: 'Hafızalı Sünger Bilek Desteği', p: 110, cat: 'Aksesuar', icon: '☁️' }
  ];

  names.forEach((item, idx) => {
    items.push({
      id: `prod-${idx + 1}`,
      name: item.n,
      category: item.cat,
      price: item.p,
      icon: item.icon,
      img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80',
      desc: `${item.n} ile çalışma ortamını profesyonelleştir.`
    });
  });

  // Ek 70 item daha ekleyerek 100+ ürün havuzunu garanti ediyoruz
  for (let i = 1; i <= 75; i++) {
    items.push({
      id: `addon-${i}`,
      name: `Minimalist Etüt Objeksiyonu #${i}`,
      category: i % 3 === 0 ? 'Dekor' : (i % 2 === 0 ? 'Kırtasiye' : 'Aksesuar'),
      price: 90 + (i * 12),
      icon: i % 4 === 0 ? '✨' : (i % 3 === 0 ? '📐' : '📎'),
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
      desc: `Odaklanma disiplinini artıran çalışma ekipmanı #${i}.`
    });
  }

  return items;
}

const INITIAL_DATA = {
  themeMode: 'dark', // 'dark' (Mat Kömür Karası) | 'light' (Aydınlık Beyaz)
  theme: 'deep-charcoal',
  activeTab: 'tasks',
  
  // User Profile & Focus Currency
  userProfile: {
    name: 'Samet',
    targetTitle: 'YKS 2027: İlk 1.000',
    targetDepartment: 'Bilgisayar Mühendisliği / Yapay Zeka',
    targetRank: 'İlk 1.000',
    dailyTargetHours: 7,
    focusCoins: 1650 // Harcanabilir Mağaza Parası
  },

  // Cart & Inventory
  cart: [], // [{ id, quantity }]
  ownedItems: ['craft-kb-1', 'craft-kb-2', 'prod-3', 'prod-4'], // Owned items
  assembledCrafts: [], // ['set-keyboard']

  // Tree daily evolution history
  treeDays: [
    { day: 'Pzt', date: '19 Eki', minutes: 210, stage: 2, score: 75 },
    { day: 'Sal', date: '20 Eki', minutes: 270, stage: 3, score: 84 },
    { day: 'Bugün', date: '21 Eki', minutes: 380, stage: 4, score: 95 }
  ],

  // Minimalist, Clean Tasks (Clean title + checkbox, details in modal)
  tasks: [
    {
      id: 'task-1',
      title: 'Yapay Zeka & Arayüz Kod Mimarisi',
      description: 'Focuslab için oval cam geçişleri, YKS net analiz modülü ve sanal kütüphane prototipini tamamla.',
      color: 'blue',
      width: 320,
      height: 150,
      priority: 'high',
      completed: false,
      date: '2026-10-21',
      deadline: 'Bugün, 20:00',
      durationMinutes: 50,
      subtasks: [
        { id: 'st-1', text: 'Gerçek oval çerçeve ve sıvı cam arayüzü', done: true },
        { id: 'st-2', text: 'Tek tıkla çalınan Spotify tarzı müzik listesi', done: true },
        { id: 'st-3', text: 'Büyük takvim yerinde genişleme mimarisi', done: false }
      ]
    },
    {
      id: 'task-2',
      title: 'TYT Matematik Problem Maratonu (40 Soru)',
      description: 'Hız ve Renk denemesinden 40 soruluk problem seti çözümü, yanlış analizi ve formül kartları.',
      color: 'purple',
      width: 320,
      height: 150,
      priority: 'high',
      completed: false,
      date: '2026-10-21',
      deadline: 'Bugün, 16:30',
      durationMinutes: 60,
      subtasks: [
        { id: 'st-4', text: 'Hız & Hareket Problemleri 20 soru', done: true },
        { id: 'st-5', text: 'Kombinasyon & Olasılık 10 soru', done: false }
      ]
    },
    {
      id: 'task-3',
      title: 'AYT Fizik - Manyetizma & İndüksiyon',
      description: 'Manyetik akı, Faraday yasası ve Lenz kanunu video dersleri ile 3 farklı kaynaktan soru çözümü.',
      color: 'emerald',
      width: 320,
      height: 150,
      priority: 'medium',
      completed: false,
      date: '2026-10-22',
      deadline: 'Yarın, 14:00',
      durationMinutes: 45,
      subtasks: [
        { id: 'st-6', text: 'Formül haritası hazırla', done: false }
      ]
    },
    {
      id: 'task-4',
      title: 'Haftalık Kronogram & Çalışma Planı',
      description: 'Haftanın her gününü saat saat bloklara ayırarak deneme ve konu çalışma oturumlarını takvime işle.',
      color: 'amber',
      width: 320,
      height: 150,
      priority: 'high',
      completed: false,
      date: '2026-10-21',
      deadline: '23 Ekim, 18:00',
      durationMinutes: 40,
      subtasks: [
        { id: 'st-7', text: 'Sabah derin odak oturumu (08:30 - 11:30)', done: true }
      ]
    }
  ],

  // Hour-by-hour calendar schedule
  calendarSchedule: {
    '2026-10-21': {
      '08:00': 'Güne Başlangıç & Zihin Açma',
      '09:00': 'TYT Türkçe Paragraf & Dil Bilgisi',
      '10:30': 'TYT Matematik Problem Çözümü',
      '13:00': 'Öğle Molası & Nefes Egzersizi',
      '14:00': 'AYT Fizik Konu Tekrarı',
      '16:00': 'Focuslab Kodlama & Optimizasyon',
      '18:30': 'Akşam Yürüyüşü',
      '20:00': 'Günün Değerlendirmesi & Soru Analizi'
    }
  },

  completedDates: ['2026-10-18', '2026-10-19', '2026-10-20'],

  // Mock Exams
  denemeler: [
    {
      id: 'den-1',
      type: 'TYT',
      title: '3D Türkiye Geneli TYT Denemesi #1',
      date: '2026-10-15',
      netTotal: 101.25
    },
    {
      id: 'den-2',
      type: 'TYT',
      title: 'Özdebir Kurumsal TYT #2',
      date: '2026-10-19',
      netTotal: 105.50
    },
    {
      id: 'den-3',
      type: 'AYT',
      title: 'Apotemi AYT Sayısal Deneme #1',
      date: '2026-10-17',
      netTotal: 69.75
    }
  ],

  // Virtual Library Settings
  virtualLibrary: {
    wallpaper: 'misty-mountain',
    customWallpaperUrl: '',
    clockStyle: 'digital',
    showSeconds: false, // Setting: show/hide seconds in clock
    totalFocusMinutes: 520,
    treeAgeWeeks: 4,
    gardenScore: 95
  },

  // AI Assistant Chat Messages
  aiChat: [
    { sender: 'assistant', text: 'Merhaba Samet! Focuslab çalışma ortamına hoş geldin. YKS İlk 1.000 hedefin için bugün nasıl bir plan hazırlayalım?' }
  ],

  pomodoro: {
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsCompletedToday: 5,
    totalMinutesToday: 135
  },

  stats: {
    weeklyFocusHours: [4.2, 5.0, 5.5, 4.8, 6.5, 6.0, 5.2],
    totalCompletedTasks: 22,
    streakDays: 8
  }
};

class Store {
  constructor() {
    this.catalog = generateCatalogItems();
    this.data = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...INITIAL_DATA, ...parsed };
      }
    } catch (e) {
      console.warn('LocalStorage okunamadı, varsayılan veri yükleniyor', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error('LocalStorage kaydedilemedi', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  setThemeMode(mode) {
    this.data.themeMode = mode === 'light' ? 'light' : 'dark';
    this.save();
  }

  setTheme(themeId) {
    if (DEFAULT_THEMES[themeId]) {
      this.data.theme = themeId;
      this.save();
    }
  }

  updateProfile(profile) {
    this.data.userProfile = { ...this.data.userProfile, ...profile };
    this.save();
  }

  // --- CART & SHOP SYSTEM ---
  addToCart(itemId) {
    const existing = this.data.cart.find(i => i.id === itemId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.data.cart.push({ id: itemId, quantity: 1 });
    }
    this.save();
  }

  removeFromCart(itemId) {
    this.data.cart = this.data.cart.filter(i => i.id !== itemId);
    this.save();
  }

  getCartTotal() {
    return this.data.cart.reduce((total, cartItem) => {
      const prod = this.catalog.find(p => p.id === cartItem.id);
      return total + (prod ? prod.price * cartItem.quantity : 0);
    }, 0);
  }

  checkoutCart() {
    const totalCost = this.getCartTotal();
    if (this.data.userProfile.focusCoins >= totalCost && this.data.cart.length > 0) {
      this.data.userProfile.focusCoins -= totalCost;
      this.data.cart.forEach(cartItem => {
        if (!this.data.ownedItems.includes(cartItem.id)) {
          this.data.ownedItems.push(cartItem.id);
        }
      });
      this.data.cart = [];
      this.save();
      return true;
    }
    return false;
  }

  // Crafting / Assembling Sets
  craftSet(setId) {
    const requiredSetItems = this.catalog.filter(i => i.setId === setId).map(i => i.id);
    const hasAll = requiredSetItems.every(id => this.data.ownedItems.includes(id));
    if (hasAll && !this.data.assembledCrafts.includes(setId)) {
      this.data.assembledCrafts.push(setId);
      this.data.userProfile.focusCoins += 300; // Bonus Crafting Coins!
      this.save();
      return true;
    }
    return false;
  }

  // --- TASKS ---
  addTask(task) {
    const newTask = {
      id: 'task-' + Date.now(),
      title: task.title || 'Yeni Görev',
      description: task.description || '',
      color: task.color || 'blue',
      width: task.width || 320,
      height: task.height || 150,
      priority: task.priority || 'medium',
      completed: false,
      date: task.date || new Date().toISOString().slice(0, 10),
      deadline: task.deadline || '',
      durationMinutes: parseInt(task.durationMinutes) || 30,
      subtasks: task.subtasks || []
    };
    this.data.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  toggleTaskCompleted(id) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        this.data.stats.totalCompletedTasks += 1;
        this.data.userProfile.focusCoins += 30; // 30 Focus Coins per completed task
      }
      this.save();
    }
  }

  updateTask(id, updates) {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.tasks[index] = { ...this.data.tasks[index], ...updates };
      this.save();
    }
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.save();
  }

  setTaskSize(id, width, height) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      task.width = Math.max(220, Math.min(1200, width));
      task.height = Math.max(120, Math.min(800, height));
      this.save();
    }
  }

  addSubtask(taskId, text) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task && text.trim()) {
      task.subtasks.push({
        id: 'st-' + Date.now(),
        text: text.trim(),
        done: false
      });
      this.save();
    }
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task) {
      const st = task.subtasks.find(s => s.id === subtaskId);
      if (st) {
        st.done = !st.done;
        this.save();
      }
    }
  }

  deleteSubtask(taskId, subtaskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task) {
      task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
      this.save();
    }
  }

  // --- CALENDAR & SCHEDULE ---
  setDayScheduleItem(date, hour, text) {
    if (!this.data.calendarSchedule[date]) {
      this.data.calendarSchedule[date] = {};
    }
    if (text.trim()) {
      this.data.calendarSchedule[date][hour] = text.trim();
    } else {
      delete this.data.calendarSchedule[date][hour];
    }
    this.save();
  }

  toggleCompletedDate(date) {
    const idx = this.data.completedDates.indexOf(date);
    if (idx !== -1) {
      this.data.completedDates.splice(idx, 1);
    } else {
      this.data.completedDates.push(date);
    }
    this.save();
  }

  // --- DENEMELER ---
  addDeneme(deneme) {
    const newDeneme = {
      id: 'den-' + Date.now(),
      type: deneme.type || 'TYT',
      title: deneme.title || 'Yeni Deneme',
      date: deneme.date || new Date().toISOString().slice(0, 10),
      netTotal: Number(deneme.netTotal || 0)
    };
    this.data.denemeler.unshift(newDeneme);
    this.save();
    return newDeneme;
  }

  deleteDeneme(id) {
    this.data.denemeler = this.data.denemeler.filter(d => d.id !== id);
    this.save();
  }

  // --- SANAL KÜTÜPHANE ---
  updateLibrary(settings) {
    this.data.virtualLibrary = { ...this.data.virtualLibrary, ...settings };
    this.save();
  }

  addFocusTimeToTree(minutes) {
    this.data.virtualLibrary.totalFocusMinutes += minutes;
    
    // Earn focus coins (1 min = 2 coins)
    const earnedCoins = Math.round(minutes * 2);
    this.data.userProfile.focusCoins += earnedCoins;

    // Tree growth
    const mins = this.data.virtualLibrary.totalFocusMinutes;
    this.data.virtualLibrary.treeAgeWeeks = Math.max(1, Math.floor(mins / 100));
    this.data.virtualLibrary.gardenScore = Math.min(100, Math.round(60 + (mins / 12)));

    // Update today's entry
    const today = this.data.treeDays.find(t => t.day === 'Bugün');
    if (today) {
      today.minutes += minutes;
      today.score = this.data.virtualLibrary.gardenScore;
    }
    this.save();
  }

  penalizeBrokenFocus() {
    // Minor penalty when focus is prematurely broken
    this.data.userProfile.focusCoins = Math.max(0, this.data.userProfile.focusCoins - 15);
    this.save();
  }

  // --- AI CHAT ---
  addChatMessage(sender, text) {
    this.data.aiChat.push({ sender, text, timestamp: new Date().toLocaleTimeString().slice(0, 5) });
    this.save();
  }

  logCompletedSession(minutes = 25) {
    this.data.pomodoro.sessionsCompletedToday += 1;
    this.data.pomodoro.totalMinutesToday += minutes;
    this.addFocusTimeToTree(minutes);

    const todayIndex = (new Date().getDay() + 6) % 7;
    this.data.stats.weeklyFocusHours[todayIndex] = Number(
      (this.data.stats.weeklyFocusHours[todayIndex] + (minutes / 60)).toFixed(1)
    );
    this.save();
  }

  exportJSON() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuslab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tasks || parsed.denemeler) {
        this.data = { ...INITIAL_DATA, ...parsed };
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON', e);
    }
    return false;
  }
}

window.appStore = new Store();
window.DEFAULT_THEMES = DEFAULT_THEMES;
window.MOTIVATION_QUOTES = MOTIVATION_QUOTES;
