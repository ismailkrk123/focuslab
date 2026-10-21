/**
 * Focuslab - Application Logic & Interaction Engine
 * Minimalist Oval Geometry, In-Place Expanding Calendar, 
 * 3D Procedural Tree Canvas, 100+ Item Shop with Cart & Crafting Sets.
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.appStore;
  const audio = window.soundEngine;

  let currentTab = store.data.activeTab || 'tasks';
  let activeModal = null;
  let activeDetailTaskId = null;
  let selectedCalendarDate = '2026-10-21';
  let activeDenemeType = 'TYT';
  let sanctuaryActiveTab = 'tree';

  // Pomodoro
  let timerMode = 'work';
  let timerSecondsLeft = 25 * 60;
  let timerTotalSeconds = 25 * 60;
  let timerInterval = null;
  let isTimerRunning = false;
  let stopwatchSeconds = 0;

  // Clock
  let clockInterval = null;

  // Drag Resizing
  let resizingCard = null;
  let startX = 0, startY = 0, startW = 0, startH = 0;

  // --- INITIALIZATION ---
  initTheme();
  initLucideIcons();
  setupNavigation();
  setupFreeformResizing();
  setupAudioPlayer();
  setupEventListeners();
  startClock();
  renderCurrentTab();

  store.subscribe(() => {
    updateNotchStatus();
    renderCurrentTab();
  });

  function initLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // --- THEME & DYNAMIC NOTCH ---
  // =========================================================================
  function initTheme() {
    applyThemeMode(store.data.themeMode || 'dark');
    applyThemeColors(store.data.theme || 'deep-charcoal');
  }

  function applyThemeMode(mode) {
    const body = document.body;
    const modeIcon = document.getElementById('icon-theme-mode');

    if (mode === 'light') {
      body.classList.add('theme-light');
      body.classList.remove('theme-dark');
      if (modeIcon) modeIcon.setAttribute('data-lucide', 'moon');
    } else {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      if (modeIcon) modeIcon.setAttribute('data-lucide', 'sun');
    }
    initLucideIcons();
  }

  function applyThemeColors(themeId) {
    const theme = window.DEFAULT_THEMES[themeId] || window.DEFAULT_THEMES['deep-charcoal'];
    const root = document.documentElement;

    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-glow', theme.primaryGlow);

    const isLight = store.data.themeMode === 'light';
    document.body.style.background = isLight
      ? `#ffffff`
      : `radial-gradient(ellipse at 50% -10%, ${theme.bgViaDark} 0%, ${theme.bgDark} 80%, #030406 100%)`;
  }

  function updateNotchStatus() {
    const statusText = document.getElementById('notch-user-status');
    if (statusText) {
      statusText.textContent = `${store.data.userProfile.name || 'Samet'} • Odakta`;
    }
    const coinEl = document.getElementById('library-bottom-coins');
    if (coinEl) coinEl.textContent = `${store.data.userProfile.focusCoins} 🪙`;
    const profCoins = document.getElementById('profile-points-display');
    if (profCoins) profCoins.textContent = `${store.data.userProfile.focusCoins} 🪙`;
  }

  // =========================================================================
  // --- NAVIGATION ---
  // =========================================================================
  function setupNavigation() {
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-tab-target');
        switchTab(tab);
      });
    });
  }

  function switchTab(tabId) {
    currentTab = tabId;
    store.data.activeTab = tabId;

    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const target = btn.getAttribute('data-tab-target');
      if (target === tabId) {
        btn.classList.add('active-tab');
      } else {
        btn.classList.remove('active-tab');
      }
    });

    renderCurrentTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderCurrentTab() {
    document.querySelectorAll('.view-tab').forEach(v => v.classList.add('hidden'));
    const activeView = document.getElementById(`view-${currentTab}`);
    if (activeView) activeView.classList.remove('hidden');

    switch (currentTab) {
      case 'tasks':
        renderMinimalistFluidTasks();
        break;
      case 'calendar':
        renderCalendar();
        break;
      case 'deneme':
        renderDenemeModule();
        break;
      case 'pomodoro':
        renderPomodoro();
        renderSpotifyTrackList();
        break;
      case 'stats':
        renderStats();
        break;
      case 'settings':
        renderSettings();
        break;
    }

    initLucideIcons();
  }

  // =========================================================================
  // --- 1. GÖREVLER (SADELEŞTİRİLMİŞ, OVAL SINIRSIZ BOYUTLANABİLİR KARTLAR) ---
  // =========================================================================
  function renderMinimalistFluidTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    const tasks = store.data.tasks;
    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="w-full py-16 text-center text-xs text-slate-400">
          <p>Henüz görev eklenmemiş. Aşağıdaki butondan yeni görev oluşturabilirsiniz.</p>
        </div>
      `;
      return;
    }

    // Clean, minimalist card: Only Title, Checkbox, Tag and 3-dots menu button!
    // NO bulky subtasks or long descriptions to choke the card height!
    container.innerHTML = tasks.map(task => {
      const cardWidth = task.width || 320;
      const cardHeight = task.height || 150;
      const subtaskCount = (task.subtasks || []).length;
      const doneSubtaskCount = (task.subtasks || []).filter(s => s.done).length;

      return `
        <div class="task-fluid-card card-color-${task.color}" 
          data-task-id="${task.id}" 
          style="width: ${cardWidth}px; min-height: ${cardHeight}px;">
          
          <div class="flex items-center justify-between gap-2">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" class="task-card-checkbox form-checkbox rounded border-white/20 bg-black/40 text-sky-500 focus:ring-0 cursor-pointer w-4 h-4" 
                data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
              <span class="text-[10px] font-mono font-semibold uppercase tracking-wider ${task.completed ? 'text-emerald-400' : 'text-slate-400'}">
                ${task.completed ? 'Tamamlandı' : (task.priority === 'high' ? '⚡ Yüksek' : '🔹 Görev')}
              </span>
            </label>

            <!-- 3-Dots Button: Opens Task Details Modal -->
            <button class="btn-open-task-details p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition" 
              title="Ayrıntıları ve Yapılacakları Aç" data-task-id="${task.id}">
              <i data-lucide="more-horizontal" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="my-auto py-2">
            <h3 class="text-sm font-semibold tracking-tight leading-snug ${task.completed ? 'line-through opacity-50' : ''}">
              ${escapeHtml(task.title)}
            </h3>
          </div>

          <div class="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span class="font-mono text-[11px]">
              ${task.durationMinutes || 25} dk
              ${subtaskCount > 0 ? `• (${doneSubtaskCount}/${subtaskCount})` : ''}
            </span>

            <button class="btn-task-quick-focus p-1 rounded-full text-sky-400 hover:text-white hover:bg-sky-500/20 transition" 
              title="Odaklan" data-title="${escapeHtml(task.title)}" data-duration="${task.durationMinutes || 25}">
              <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
            </button>
          </div>

          <!-- Free-Form Drag Resize Handle -->
          <div class="fluid-resize-handle-se" title="Serbest Boyutlandır (Sürükle)">
            <svg class="w-3.5 h-3.5 text-slate-400 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15l-6 6M21 9l-12 12" />
            </svg>
          </div>

        </div>
      `;
    }).join('');

    bindMinimalistTaskEvents(container);
  }

  function bindMinimalistTaskEvents(container) {
    container.querySelectorAll('.task-card-checkbox').forEach(input => {
      input.addEventListener('change', () => {
        const taskId = input.getAttribute('data-task-id');
        store.toggleTaskCompleted(taskId);
        audio.playChime('subtask');
      });
    });

    container.querySelectorAll('.btn-open-task-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.getAttribute('data-task-id');
        openTaskDetailModal(taskId);
      });
    });

    container.querySelectorAll('.btn-task-quick-focus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = btn.getAttribute('data-title');
        const duration = parseInt(btn.getAttribute('data-duration')) || 25;
        switchTab('pomodoro');
        setTimerMode('work', duration);
      });
    });

    container.querySelectorAll('.fluid-resize-handle-se').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resizingCard = handle.closest('.task-fluid-card');
        if (!resizingCard) return;

        resizingCard.classList.add('is-resizing');
        startX = e.clientX;
        startY = e.clientY;
        startW = resizingCard.offsetWidth;
        startH = resizingCard.offsetHeight;
      });
    });
  }

  function setupFreeformResizing() {
    window.addEventListener('mousemove', (e) => {
      if (!resizingCard) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newW = Math.max(220, Math.min(1150, startW + deltaX));
      const newH = Math.max(120, Math.min(800, startH + deltaY));

      resizingCard.style.width = `${newW}px`;
      resizingCard.style.minHeight = `${newH}px`;
    });

    window.addEventListener('mouseup', () => {
      if (resizingCard) {
        resizingCard.classList.remove('is-resizing');
        const taskId = resizingCard.getAttribute('data-task-id');
        const w = parseInt(resizingCard.style.width);
        const h = parseInt(resizingCard.style.minHeight);
        store.setTaskSize(taskId, w, h);
        resizingCard = null;
      }
    });
  }

  function openTaskDetailModal(taskId) {
    activeDetailTaskId = taskId;
    const task = store.data.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('modal-task-detail');
    document.getElementById('detail-task-title').textContent = task.title;
    document.getElementById('detail-task-desc').textContent = task.description || 'Detaylı açıklama girilmemiş.';

    renderDetailSubtasks(task);

    modal.classList.add('active');
    activeModal = modal;
  }

  function renderDetailSubtasks(task) {
    const container = document.getElementById('detail-subtasks-container');
    if (!container) return;

    const subtasks = task.subtasks || [];
    if (subtasks.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-1">Alt görev bulunmuyor.</p>`;
    } else {
      container.innerHTML = subtasks.map(st => `
        <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 text-xs">
          <label class="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
            <input type="checkbox" class="detail-st-toggle form-checkbox rounded border-white/20 bg-black/40 text-sky-500 cursor-pointer" 
              data-st-id="${st.id}" ${st.done ? 'checked' : ''}>
            <span class="${st.done ? 'line-through text-slate-400' : ''} truncate">${escapeHtml(st.text)}</span>
          </label>
          <button class="btn-del-detail-st text-slate-400 hover:text-rose-400 p-0.5" data-st-id="${st.id}">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');

      container.querySelectorAll('.detail-st-toggle').forEach(input => {
        input.addEventListener('change', () => {
          store.toggleSubtask(task.id, input.getAttribute('data-st-id'));
          openTaskDetailModal(task.id);
        });
      });

      container.querySelectorAll('.btn-del-detail-st').forEach(btn => {
        btn.addEventListener('click', () => {
          store.deleteSubtask(task.id, btn.getAttribute('data-st-id'));
          openTaskDetailModal(task.id);
        });
      });
    }

    initLucideIcons();
  }

  // =========================================================================
  // --- 2. TAKVİM (YERİNDE GENİŞLEYEN GÜN GÖRÜNÜMÜ - MODAL YOK) ---
  // =========================================================================
  function renderCalendar() {
    const container = document.getElementById('calendar-days-container');
    if (!container) return;

    const totalDays = 31;
    const startOffset = 3;
    const completedDates = store.data.completedDates || [];

    let cellsHtml = '';
    for (let i = 0; i < startOffset; i++) {
      cellsHtml += `<div class="opacity-10 rounded-2xl border border-white/5 p-2 min-h-[70px]"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `2026-10-${String(day).padStart(2, '0')}`;
      const isCompleted = completedDates.includes(dateStr);
      const isToday = day === 21;
      const dayTasks = store.data.tasks.filter(t => t.date === dateStr || (isToday && (!t.date || t.date === '2026-10-21')));

      cellsHtml += `
        <div class="p-2.5 rounded-2xl border ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/5 bg-white/[0.02]'} ${isToday ? 'ring-1.5 ring-sky-500' : ''} cursor-pointer hover:border-sky-400 transition"
          data-date="${dateStr}">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-mono font-bold ${isCompleted ? 'line-through text-emerald-400' : ''}">${day}</span>
            ${isCompleted ? '<span class="text-xs text-emerald-400 font-bold">✓</span>' : ''}
          </div>
          <div class="space-y-1">
            ${dayTasks.slice(0, 2).map(t => `
              <div class="text-[10px] px-1.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-200 truncate">${escapeHtml(t.title)}</div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = cellsHtml;

    // Day Click: IN-PLACE EXPANSION (Ekran değişmez, modal açılmaz, gün yerinde büyür!)
    container.querySelectorAll('[data-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        const date = cell.getAttribute('data-date');
        expandDayInPlace(date);
      });
    });
  }

  function expandDayInPlace(date) {
    selectedCalendarDate = date;
    const overview = document.getElementById('calendar-month-overview');
    const expanded = document.getElementById('calendar-expanded-day-view');
    const title = document.getElementById('expanded-day-title');

    if (title) title.textContent = `${date} Günlük Çalışma & Kronogram`;
    overview?.classList.add('hidden');
    expanded?.classList.remove('hidden');

    renderExpandedDayTasks(date);
    renderExpandedDayTimeline(date);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  function collapseDayView() {
    document.getElementById('calendar-expanded-day-view')?.classList.add('hidden');
    document.getElementById('calendar-month-overview')?.classList.remove('hidden');
  }

  // Mod 1: Day Tasks Miniature Grid
  function renderExpandedDayTasks(date) {
    const container = document.getElementById('expanded-mod1-tasks');
    if (!container) return;

    const tasks = store.data.tasks.filter(t => t.date === date || (date === '2026-10-21' && (!t.date || t.date === '2026-10-21')));
    if (tasks.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-6 text-center">Bu gün için atanmış görev bulunmuyor.</p>`;
      return;
    }

    container.innerHTML = tasks.map(t => `
      <div class="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
        <div>
          <h4 class="text-xs font-semibold text-white">${escapeHtml(t.title)}</h4>
          <span class="text-[11px] text-slate-400 font-mono">${t.durationMinutes} dk</span>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${t.completed ? 'bg-emerald-500/15 text-emerald-300' : 'bg-sky-500/15 text-sky-300'}">
          ${t.completed ? 'Tamamlandı' : 'Aktif'}
        </span>
      </div>
    `).join('');
  }

  // Mod 2: Hourly Timeline (08:00 - 23:00)
  function renderExpandedDayTimeline(date) {
    const container = document.getElementById('expanded-mod2-timeline');
    if (!container) return;

    const schedule = store.data.calendarSchedule[date] || {};
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

    container.innerHTML = hours.map(h => `
      <div class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5">
        <span class="w-14 text-xs font-mono font-semibold text-slate-400 shrink-0">${h}</span>
        <input type="text" class="input-expanded-slot flex-1 text-xs px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-sky-500"
          data-hour="${h}" placeholder="O saatteki görev..." value="${escapeHtml(schedule[h] || '')}">
      </div>
    `).join('');

    container.querySelectorAll('.input-expanded-slot').forEach(input => {
      input.addEventListener('change', () => {
        store.setDayScheduleItem(date, input.getAttribute('data-hour'), input.value);
      });
    });
  }

  // =========================================================================
  // --- 3. SANAL KÜTÜPHANE & 3D AĞAÇ SİMÜLASYONU & MAĞAZA ---
  // =========================================================================
  const wallpapersMap = {
    'misty-mountain': 'linear-gradient(rgba(8, 9, 12, 0.4), rgba(8, 9, 12, 0.85)), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85")',
    'rainy-forest': 'linear-gradient(rgba(8, 9, 12, 0.4), rgba(8, 9, 12, 0.85)), url("https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=85")',
    'alpine-lake': 'linear-gradient(rgba(8, 9, 12, 0.4), rgba(8, 9, 12, 0.85)), url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=85")',
    'sunset-fjord': 'linear-gradient(rgba(8, 9, 12, 0.4), rgba(8, 9, 12, 0.85)), url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=85")'
  };

  function enterFullscreenLibrary() {
    const overlay = document.getElementById('fullscreen-library-overlay');
    if (!overlay) return;

    const wp = store.data.virtualLibrary.customWallpaperUrl || wallpapersMap[store.data.virtualLibrary.wallpaper] || wallpapersMap['misty-mountain'];
    overlay.style.backgroundImage = wp;
    document.getElementById('library-user-name').textContent = store.data.userProfile.name || 'Samet';
    document.getElementById('library-bottom-coins').textContent = `${store.data.userProfile.focusCoins} 🪙`;

    overlay.classList.remove('hidden');

    if (!audio.isPlaying) {
      audio.playTrack('lofi');
    }
  }

  function startClock() {
    clearInterval(clockInterval);
    clockInterval = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      const digital = document.getElementById('library-digital-clock');
      if (digital) {
        digital.textContent = store.data.virtualLibrary.showSeconds ? `${hrs}:${mins}:${secs}` : `${hrs}:${mins}`;
      }

      const hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
      const minDeg = now.getMinutes() * 6;
      const secDeg = now.getSeconds() * 6;

      const hHand = document.getElementById('analog-hand-hour');
      const mHand = document.getElementById('analog-hand-min');
      const sHand = document.getElementById('analog-hand-sec');

      if (hHand) hHand.style.transform = `rotate(${hourDeg}deg)`;
      if (mHand) mHand.style.transform = `rotate(${minDeg}deg)`;
      if (sHand) {
        sHand.style.transform = `rotate(${secDeg}deg)`;
        sHand.className = store.data.virtualLibrary.showSeconds ? 'clock-hand clock-hand-sec' : 'hidden';
      }
    }, 1000);
  }

  function toggleClockDisplay() {
    const next = store.data.virtualLibrary.clockStyle === 'digital' ? 'analog' : 'digital';
    store.updateLibrary({ clockStyle: next });

    const digitalEl = document.getElementById('library-digital-clock');
    const analogEl = document.getElementById('library-analog-clock');

    if (next === 'analog') {
      digitalEl?.classList.add('hidden');
      analogEl?.classList.remove('hidden');
    } else {
      digitalEl?.classList.remove('hidden');
      analogEl?.classList.add('hidden');
    }
  }

  // --- 3D PROCEDURAL TREE CANVAS SIMULATION ---
  function draw3DTreeCanvas() {
    const canvas = document.getElementById('tree-canvas-3d');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startX = canvas.width / 2;
    const startY = canvas.height - 15;
    const length = 55;
    const angle = -Math.PI / 2;
    const depth = Math.min(8, 4 + Math.floor((store.data.virtualLibrary.totalFocusMinutes || 0) / 90));

    function branch(x, y, len, ang, dep) {
      if (dep === 0) {
        // Draw leaves / blooming flowers
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = dep % 2 === 0 ? '#38bdf8' : '#34d399';
        ctx.fill();
        return;
      }

      const x2 = x + Math.cos(ang) * len;
      const y2 = y + Math.sin(ang) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = dep * 1.5;
      ctx.strokeStyle = dep > 4 ? '#78350f' : '#b45309';
      ctx.stroke();

      branch(x2, y2, len * 0.75, ang - 0.38, dep - 1);
      branch(x2, y2, len * 0.75, ang + 0.38, dep - 1);
    }

    branch(startX, startY, length, angle, depth);
  }

  // --- SANCTUARY MODAL TABS & 100+ SHOP ---
  function switchSanctuaryTab(tabName) {
    sanctuaryActiveTab = tabName;
    ['tree', 'shop', 'cart', 'equip'].forEach(t => {
      document.getElementById(`pane-sanctuary-${t}`)?.classList.add('hidden');
      document.getElementById(`tab-sanctuary-${t}`)?.classList.remove('bg-sky-600', 'text-white', 'font-semibold');
      document.getElementById(`tab-sanctuary-${t}`)?.classList.add('text-slate-400');
    });

    document.getElementById(`pane-sanctuary-${tabName}`)?.classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-sanctuary-${tabName}`);
    activeBtn?.classList.add('bg-sky-600', 'text-white', 'font-semibold');
    activeBtn?.classList.remove('text-slate-400');

    if (tabName === 'tree') {
      setTimeout(draw3DTreeCanvas, 50);
    } else if (tabName === 'shop') {
      renderShopCatalog();
    } else if (tabName === 'cart') {
      renderCart();
    } else if (tabName === 'equip') {
      renderEquipment();
    }
  }

  function renderShopCatalog() {
    const grid = document.getElementById('shop-catalog-grid');
    if (!grid) return;

    const catalog = store.catalog;
    grid.innerHTML = catalog.map(item => `
      <div class="shop-product-card flex flex-col justify-between">
        <div>
          <div class="w-full h-24 rounded-xl overflow-hidden mb-2 bg-slate-100 flex items-center justify-center">
            <span class="text-4xl">${item.icon}</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-sky-600 block mb-0.5">${item.category}</span>
          <h4 class="text-xs font-bold text-slate-900 leading-snug">${escapeHtml(item.name)}</h4>
          <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">${escapeHtml(item.desc)}</p>
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold font-mono text-amber-600">${item.price} 🪙</span>
          <button class="btn-add-to-cart px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition"
            data-item-id="${item.id}">
            Sepete Ekle
          </button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-item-id');
        store.addToCart(id);
        updateCartBadge();
        showNotification('Ürün sepete eklendi!');
      });
    });
  }

  function updateCartBadge() {
    const count = store.data.cart.reduce((acc, c) => acc + c.quantity, 0);
    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = count;
  }

  function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    if (!container) return;

    const cart = store.data.cart;
    if (cart.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-6 text-center">Sepetinizde ürün bulunmuyor.</p>`;
      if (totalEl) totalEl.textContent = '0 🪙';
      return;
    }

    container.innerHTML = cart.map(cartItem => {
      const prod = store.catalog.find(p => p.id === cartItem.id);
      if (!prod) return '';
      return `
        <div class="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">${prod.icon}</span>
            <div>
              <h5 class="font-bold text-white">${escapeHtml(prod.name)}</h5>
              <span class="text-[11px] text-amber-400 font-mono">${prod.price} 🪙 x ${cartItem.quantity}</span>
            </div>
          </div>
          <button class="btn-remove-from-cart text-slate-400 hover:text-rose-400 transition" data-item-id="${prod.id}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = `${store.getCartTotal()} 🪙`;

    container.querySelectorAll('.btn-remove-from-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        store.removeFromCart(btn.getAttribute('data-item-id'));
        renderCart();
        updateCartBadge();
      });
    });

    initLucideIcons();
  }

  function renderEquipment() {
    const slotsContainer = document.getElementById('set-keyboard-slots');
    const ownedContainer = document.getElementById('owned-items-grid');
    const btnCraftKb = document.getElementById('btn-craft-keyboard');

    // Crafting Set: Keyboard
    const kbSetItemIds = ['craft-kb-1', 'craft-kb-2', 'craft-kb-3', 'craft-kb-4'];
    const hasAllKb = kbSetItemIds.every(id => store.data.ownedItems.includes(id));
    const isCrafted = store.data.assembledCrafts.includes('set-keyboard');

    if (slotsContainer) {
      slotsContainer.innerHTML = kbSetItemIds.map(id => {
        const item = store.catalog.find(i => i.id === id);
        const owned = store.data.ownedItems.includes(id);
        return `
          <div class="p-2.5 rounded-xl border ${owned ? 'border-sky-500 bg-sky-500/10' : 'border-white/10 bg-white/5 opacity-40'}">
            <span class="text-xl block mb-1">${item ? item.icon : '❓'}</span>
            <span class="text-[10px] text-slate-300 truncate block">${item ? item.name.slice(0, 15) : ''}</span>
          </div>
        `;
      }).join('');
    }

    if (btnCraftKb) {
      if (isCrafted) {
        btnCraftKb.textContent = 'Dönüştürüldü ✓';
        btnCraftKb.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/30';
      } else if (hasAllKb) {
        btnCraftKb.textContent = 'Dönüştür (+300 🪙)';
        btnCraftKb.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer';
      } else {
        btnCraftKb.textContent = 'Parçalar Eksik';
        btnCraftKb.className = 'px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 text-slate-500 cursor-not-allowed';
      }
    }

    // Owned Items
    if (ownedContainer) {
      const owned = store.data.ownedItems.map(id => store.catalog.find(p => p.id === id)).filter(Boolean);
      ownedContainer.innerHTML = owned.map(item => `
        <div class="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-center text-xs">
          <span class="text-2xl block mb-1">${item.icon}</span>
          <span class="font-bold text-white truncate block text-[11px]">${escapeHtml(item.name)}</span>
        </div>
      `).join('');
    }
  }

  // =========================================================================
  // --- 4. SPOTIFY AMBIENT TRACK LIST & MINI PLAYER ---
  // =========================================================================
  function renderSpotifyTrackList() {
    const container = document.getElementById('spotify-tracks-list-container');
    if (!container) return;

    const tracks = audio.getTracks();
    const currentId = audio.currentTrackId;

    container.innerHTML = tracks.map((t, idx) => {
      const isActive = t.id === currentId;
      return `
        <div class="p-3 rounded-2xl border ${isActive ? 'border-sky-500 bg-sky-500/10' : 'border-white/5 bg-white/[0.02]'} flex items-center justify-between cursor-pointer hover:border-white/20 transition"
          data-track-id="${t.id}">
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono text-slate-500">${idx + 1}</span>
            <span class="text-lg">${t.icon}</span>
            <div>
              <h5 class="text-xs font-bold ${isActive ? 'text-sky-400' : 'text-white'}">${escapeHtml(t.name)}</h5>
              <span class="text-[10px] text-slate-400">${escapeHtml(t.desc)}</span>
            </div>
          </div>
          <button class="p-1.5 text-slate-400 hover:text-white">
            <i data-lucide="${isActive && audio.isPlaying ? 'pause' : 'play'}" class="w-4 h-4 fill-current"></i>
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-track-id]').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-track-id');
        if (audio.currentTrackId === id && audio.isPlaying) {
          audio.pause();
        } else {
          audio.playTrack(id);
        }
      });
    });

    initLucideIcons();
  }

  function setupAudioPlayer() {
    audio.onStateChange = (state) => {
      const miniTitle = document.getElementById('mini-player-title');
      const miniIcon = document.getElementById('mini-player-icon');
      const miniToggleIcon = document.getElementById('mini-player-toggle-icon');

      if (miniTitle) miniTitle.textContent = state.track.name;
      if (miniIcon) miniIcon.textContent = state.track.icon;
      if (miniToggleIcon) {
        miniToggleIcon.setAttribute('data-lucide', state.isPlaying ? 'pause' : 'play');
      }

      if (currentTab === 'pomodoro') renderSpotifyTrackList();
      initLucideIcons();
    };

    document.getElementById('mini-player-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.toggle();
    });
    document.getElementById('mini-player-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.nextTrack();
    });
    document.getElementById('mini-player-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.prevTrack();
    });
    document.getElementById('select-audio-session-timer')?.addEventListener('change', (e) => {
      audio.setSessionLimitMinutes(parseInt(e.target.value));
    });
  }

  // =========================================================================
  // --- 5. POMODORO CONTROLS ---
  // =========================================================================
  function renderPomodoro() {
    const timeDisplay = document.getElementById('pomodoro-time-display');
    if (!timeDisplay) return;

    if (timerMode === 'stopwatch') {
      const m = Math.floor(stopwatchSeconds / 60);
      const s = stopwatchSeconds % 60;
      timeDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else {
      const m = Math.floor(timerSecondsLeft / 60);
      const s = timerSecondsLeft % 60;
      timeDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  function setTimerMode(mode, customMinutes = null) {
    timerMode = mode;
    isTimerRunning = false;
    clearInterval(timerInterval);

    if (mode === 'work') {
      timerTotalSeconds = (customMinutes || store.data.pomodoro.workTime || 25) * 60;
      timerSecondsLeft = timerTotalSeconds;
    } else if (mode === 'shortBreak') {
      timerTotalSeconds = 5 * 60;
      timerSecondsLeft = timerTotalSeconds;
    } else if (mode === 'longBreak') {
      timerTotalSeconds = 15 * 60;
      timerSecondsLeft = timerTotalSeconds;
    } else if (mode === 'stopwatch') {
      stopwatchSeconds = 0;
    }

    renderPomodoro();
  }

  function toggleTimer() {
    if (isTimerRunning) {
      isTimerRunning = false;
      clearInterval(timerInterval);
    } else {
      isTimerRunning = true;
      timerInterval = setInterval(() => {
        if (timerMode === 'stopwatch') {
          stopwatchSeconds += 1;
          renderPomodoro();
        } else {
          if (timerSecondsLeft > 0) {
            timerSecondsLeft -= 1;
            renderPomodoro();
          } else {
            isTimerRunning = false;
            clearInterval(timerInterval);
            audio.playChime('complete');
            store.logCompletedSession(Math.round(timerTotalSeconds / 60));
            showNotification('Odak seansı tamamlandı! +50 Focus Coin kazandın.');
            setTimerMode('shortBreak');
          }
        }
      }, 1000);
    }
  }

  // =========================================================================
  // --- 6. DENEME MODÜLÜ ---
  // =========================================================================
  function renderDenemeModule() {
    const list = document.getElementById('denemeler-list-container');
    const trend = document.getElementById('deneme-trend-bars');
    const denemeler = (store.data.denemeler || []).filter(d => d.type === activeDenemeType);

    if (list) {
      if (denemeler.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Kayıtlı deneme bulunmuyor.</p>`;
      } else {
        list.innerHTML = denemeler.map(d => `
          <div class="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span class="font-bold text-white block">${escapeHtml(d.title)}</span>
              <span class="text-[11px] text-slate-400 font-mono">${d.date}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-base font-bold font-mono text-sky-400">${d.netTotal.toFixed(2)} Net</span>
              <button class="btn-del-deneme text-slate-500 hover:text-rose-400" data-id="${d.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
          </div>
        `).join('');

        list.querySelectorAll('.btn-del-deneme').forEach(btn => {
          btn.addEventListener('click', () => {
            store.deleteDeneme(btn.getAttribute('data-id'));
          });
        });
      }
    }

    if (trend) {
      const maxNet = activeDenemeType === 'TYT' ? 120 : 80;
      trend.innerHTML = [...denemeler].reverse().map(d => {
        const heightPercent = Math.max(15, Math.round((d.netTotal / maxNet) * 100));
        return `
          <div class="flex-1 flex flex-col items-center gap-1.5">
            <span class="text-[10px] font-mono text-sky-300">${d.netTotal.toFixed(1)}</span>
            <div class="w-full max-w-[28px] h-28 bg-white/5 rounded-xl overflow-hidden flex flex-col justify-end p-0.5">
              <div class="w-full rounded-lg bg-sky-500" style="height: ${heightPercent}%"></div>
            </div>
            <span class="text-[9px] font-mono text-slate-400 truncate max-w-[40px]">${d.date.slice(5)}</span>
          </div>
        `;
      }).join('');
    }
  }

  // =========================================================================
  // --- 7. EVENT LISTENERS & MODALS ---
  // =========================================================================
  function setupEventListeners() {
    // Mode toggle
    document.getElementById('btn-theme-mode-toggle')?.addEventListener('click', () => {
      const next = store.data.themeMode === 'light' ? 'dark' : 'light';
      store.setThemeMode(next);
      applyThemeMode(next);
      applyThemeColors(store.data.theme);
    });

    document.getElementById('btn-set-dark-mode')?.addEventListener('click', () => {
      store.setThemeMode('dark');
      applyThemeMode('dark');
      applyThemeColors(store.data.theme);
    });

    document.getElementById('btn-set-light-mode')?.addEventListener('click', () => {
      store.setThemeMode('light');
      applyThemeMode('light');
      applyThemeColors(store.data.theme);
    });

    // Calendar Collapse back to month
    document.getElementById('btn-collapse-day-view')?.addEventListener('click', collapseDayView);

    // Calendar Mod 1 vs Mod 2 in expanded day
    document.getElementById('btn-switch-day-tasks')?.addEventListener('click', () => {
      document.getElementById('btn-switch-day-tasks').className = 'px-4 py-1 rounded-full text-xs font-semibold transition bg-sky-600 text-white shadow';
      document.getElementById('btn-switch-day-timeline').className = 'px-4 py-1 rounded-full text-xs font-semibold transition text-slate-400 hover:text-white';
      document.getElementById('expanded-mod1-tasks')?.classList.remove('hidden');
      document.getElementById('expanded-mod2-timeline')?.classList.add('hidden');
    });

    document.getElementById('btn-switch-day-timeline')?.addEventListener('click', () => {
      document.getElementById('btn-switch-day-timeline').className = 'px-4 py-1 rounded-full text-xs font-semibold transition bg-sky-600 text-white shadow';
      document.getElementById('btn-switch-day-tasks').className = 'px-4 py-1 rounded-full text-xs font-semibold transition text-slate-400 hover:text-white';
      document.getElementById('expanded-mod2-timeline')?.classList.remove('hidden');
      document.getElementById('expanded-mod1-tasks')?.classList.add('hidden');
    });

    // Fullscreen Library
    document.getElementById('btn-enter-fullscreen-library')?.addEventListener('click', enterFullscreenLibrary);

    document.getElementById('btn-exit-library')?.addEventListener('click', () => {
      document.getElementById('modal-library-exit-confirm')?.classList.add('active');
    });

    document.getElementById('btn-cancel-exit-library')?.addEventListener('click', () => {
      document.getElementById('modal-library-exit-confirm')?.classList.remove('active');
    });

    document.getElementById('btn-confirm-exit-library')?.addEventListener('click', () => {
      document.getElementById('modal-library-exit-confirm')?.classList.remove('active');
      document.getElementById('fullscreen-library-overlay')?.classList.add('hidden');
      audio.pause();
      store.penalizeBrokenFocus();
      showNotification('Kütüphaneden çıkıldı.');
    });

    // Custom Wallpaper Upload
    document.getElementById('input-custom-wallpaper')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const url = `url("${ev.target.result}")`;
          store.updateLibrary({ customWallpaperUrl: url });
          const overlay = document.getElementById('fullscreen-library-overlay');
          if (overlay) overlay.style.backgroundImage = url;
          showNotification('Özel arka plan yüklendi!');
        };
        reader.readAsDataURL(file);
      }
    });

    // Library Ambient Music Panel toggle
    document.getElementById('btn-toggle-library-music')?.addEventListener('click', () => {
      switchTab('pomodoro');
      document.getElementById('fullscreen-library-overlay')?.classList.add('hidden');
    });

    // Clock display click toggle
    document.getElementById('library-clock-container')?.addEventListener('click', toggleClockDisplay);

    // Tree Modal
    document.getElementById('btn-open-tree-modal')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-tree-forest');
      modal?.classList.add('active');
      activeModal = modal;
      document.getElementById('modal-coin-balance').textContent = store.data.userProfile.focusCoins;
      switchSanctuaryTab('tree');
      updateCartBadge();
    });

    // Sanctuary Tabs
    document.getElementById('tab-sanctuary-tree')?.addEventListener('click', () => switchSanctuaryTab('tree'));
    document.getElementById('tab-sanctuary-shop')?.addEventListener('click', () => switchSanctuaryTab('shop'));
    document.getElementById('tab-sanctuary-cart')?.addEventListener('click', () => switchSanctuaryTab('cart'));
    document.getElementById('tab-sanctuary-equip')?.addEventListener('click', () => switchSanctuaryTab('equip'));

    // Cart Checkout
    document.getElementById('btn-checkout-cart')?.addEventListener('click', () => {
      if (store.checkoutCart()) {
        showNotification('Sipariş tamamlandı! Ekipmanlar envanterine eklendi. 🎉');
        renderCart();
        updateCartBadge();
        document.getElementById('modal-coin-balance').textContent = store.data.userProfile.focusCoins;
      } else {
        alert('Yeterli Focus Coin bakiyeniz bulunmuyor veya sepetiniz boş!');
      }
    });

    // Crafting Set Keyboard
    document.getElementById('btn-craft-keyboard')?.addEventListener('click', () => {
      if (store.craftSet('set-keyboard')) {
        showNotification('Tebrikler! Efsanevi Mekanik Klavye dönüştürüldü (+300 Focus Coin)! 🏆');
        renderEquipment();
        document.getElementById('modal-coin-balance').textContent = store.data.userProfile.focusCoins;
      }
    });

    // Add Task from Dock
    document.getElementById('dock-btn-add')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-task');
      document.getElementById('form-task')?.reset();
      modal?.classList.add('active');
      activeModal = modal;
      setTimeout(() => document.getElementById('input-task-title')?.focus(), 150);
    });

    // Form Task Submit
    document.getElementById('form-task')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('input-task-title').value.trim();
      if (!title) return;

      store.addTask({
        title,
        description: document.getElementById('input-task-desc').value.trim(),
        color: document.getElementById('select-task-color').value,
        durationMinutes: parseInt(document.getElementById('input-task-duration').value) || 45
      });
      closeModals();
    });

    // Detail modal: Add subtask
    document.getElementById('input-detail-new-subtask')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.value.trim() && activeDetailTaskId) {
        e.preventDefault();
        store.addSubtask(activeDetailTaskId, e.target.value.trim());
        e.target.value = '';
        openTaskDetailModal(activeDetailTaskId);
      }
    });

    // Detail modal: Delete task
    document.getElementById('btn-detail-delete-task')?.addEventListener('click', () => {
      if (activeDetailTaskId && confirm('Bu görevi silmek istiyor musunuz?')) {
        store.deleteTask(activeDetailTaskId);
        closeModals();
      }
    });

    // AI Floating Drawer
    const btnFloatAI = document.getElementById('btn-floating-ai');
    const drawerAI = document.getElementById('drawer-ai-assistant');
    btnFloatAI?.addEventListener('click', () => {
      drawerAI?.classList.toggle('active');
      renderAIMessages();
    });
    document.getElementById('btn-close-ai-drawer')?.addEventListener('click', () => {
      drawerAI?.classList.remove('active');
    });

    document.getElementById('form-ai-chat')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('input-ai-message');
      if (input && input.value.trim()) {
        store.addChatMessage('user', input.value.trim());
        renderAIMessages();
        const q = input.value.trim().toLowerCase();
        input.value = '';

        setTimeout(() => {
          let ans = 'Çalışma hedeflerin doğrultusunda odaklandıkça Focus Coin kazanabilir ve sanal ekipman setini tamamlayabilirsin.';
          if (q.includes('matematik') || q.includes('tyt')) {
            ans = 'TYT Matematik’te netlerini artırmak için her gün aksatmadan 20 Paragraf + 15 Problem çözmeli ve deneme analizlerini Hata Defteri’ne kaydetmelisin.';
          } else if (q.includes('motivasyon')) {
            ans = '"Bizi rahatsız eden şeyler olayların kendisi değil, onlara yüklediğimiz anlamlardır." — Marcus Aurelius. Kararlı ol ve adım adım ilerle!';
          }
          store.addChatMessage('assistant', ans);
          renderAIMessages();
        }, 500);
      }
    });

    // Deneme modal
    document.getElementById('btn-open-deneme-modal')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-deneme');
      document.getElementById('form-deneme')?.reset();
      modal?.classList.add('active');
      activeModal = modal;
    });

    document.getElementById('form-deneme')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.addDeneme({
        type: document.getElementById('input-deneme-type').value,
        title: document.getElementById('input-deneme-title').value.trim(),
        netTotal: parseFloat(document.getElementById('input-deneme-net').value) || 0
      });
      closeModals();
      showNotification('Deneme kaydedildi!');
    });

    // Close Modals
    document.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', closeModals));
    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.addEventListener('click', (e) => { if (e.target === m) closeModals(); });
    });

    // Pomodoro toggle
    document.getElementById('btn-pomodoro-toggle')?.addEventListener('click', toggleTimer);
    document.getElementById('btn-pomodoro-reset')?.addEventListener('click', () => setTimerMode(timerMode));
    document.querySelectorAll('[data-timer-mode]').forEach(b => {
      b.addEventListener('click', () => setTimerMode(b.getAttribute('data-timer-mode')));
    });

    // Backup
    document.getElementById('btn-export-json')?.addEventListener('click', () => store.exportJSON());
    const fileIn = document.getElementById('file-import-json');
    document.getElementById('btn-import-json')?.addEventListener('click', () => fileIn?.click());
    fileIn?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (store.importJSON(ev.target.result)) showNotification('Veriler geri yüklendi!');
        };
        reader.readAsText(file);
      }
    });
  }

  function renderAIMessages() {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;
    container.innerHTML = (store.data.aiChat || []).map(m => `
      <div class="flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[85%] px-3 py-2 rounded-2xl ${m.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-white/10 text-slate-200'}">
          ${escapeHtml(m.text)}
        </div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  }

  function closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    activeModal = null;
    activeDetailTaskId = null;
  }

  function renderStats() {
    const p = store.data.userProfile || {};
    document.getElementById('profile-name-display').textContent = p.name || 'Samet';
    document.getElementById('profile-target-display').textContent = `${p.targetTitle} • ${p.targetDepartment}`;
    document.getElementById('profile-points-display').textContent = `${p.focusCoins} 🪙`;

    const bars = document.getElementById('weekly-chart-bars');
    if (!bars) return;
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const hours = store.data.stats.weeklyFocusHours || [];
    const maxH = Math.max(...hours, 7.0);

    bars.innerHTML = days.map((day, i) => {
      const h = hours[i] || 0;
      const heightPercent = Math.max(12, Math.round((h / maxH) * 100));
      const isToday = i === ((new Date().getDay() + 6) % 7);
      return `
        <div class="flex-1 flex flex-col items-center gap-1.5">
          <span class="text-[10px] font-mono font-semibold text-slate-400">${h}s</span>
          <div class="w-full max-w-[28px] h-28 bg-white/5 rounded-xl overflow-hidden flex flex-col justify-end p-0.5">
            <div class="w-full rounded-lg ${isToday ? 'bg-sky-500' : 'bg-slate-700'}" style="height: ${heightPercent}%"></div>
          </div>
          <span class="text-[11px] font-semibold ${isToday ? 'text-sky-400' : 'text-slate-400'}">${day}</span>
        </div>
      `;
    }).join('');
  }

  function renderSettings() {
    const grid = document.getElementById('theme-picker-grid');
    if (!grid) return;
    grid.innerHTML = Object.values(window.DEFAULT_THEMES).map(t => `
      <div class="p-3 rounded-2xl bg-white/5 border ${store.data.theme === t.id ? 'border-sky-500' : 'border-white/10'} cursor-pointer hover:border-white/20 transition flex items-center justify-between"
        data-theme="${t.id}">
        <div class="flex items-center gap-2.5">
          <div class="w-5 h-5 rounded-full" style="background: ${t.primary}"></div>
          <span class="text-xs font-semibold text-white">${escapeHtml(t.name)}</span>
        </div>
        ${store.data.theme === t.id ? '<span class="text-sky-400 text-xs font-bold">✓</span>' : ''}
      </div>
    `).join('');

    grid.querySelectorAll('[data-theme]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-theme');
        store.setTheme(id);
        applyThemeColors(id);
        renderSettings();
      });
    });
  }

  function showNotification(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-[200] px-4 py-2 rounded-full glass-panel text-white text-xs font-semibold shadow-2xl flex items-center gap-2 transition-all duration-300 transform -translate-y-3 opacity-0';
    toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-sky-400"></span><span>${escapeHtml(msg)}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = '-translate-y-3';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
