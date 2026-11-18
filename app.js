// Konfigurasi Supabase Cloud
const SUPABASE_URL = 'https://lwqvgqzgtgrkosarxcwj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cXZncXpndGdya29zYXJ4Y3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMjEwODgsImV4cCI6MjEwNzU5NzA4OH0.I2WoqEwTmrHpE3UpQ3tzlevrDXJs4WnPliZxnGroPe0';

// Inisialisasi Klien Supabase
let supabaseClient = null;
try {
  const lib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
  if (lib && typeof lib.createClient === 'function') {
    supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.warn('Gagal menginisialisasi klien Supabase:', e);
}

// ------------------- KONFIGURASI HALAMAN & MENU -------------------
// type: 'tasks' (daftar tugas) | 'links' (kartu tautan, bisa tambah/edit/hapus) | 'iframe' (halaman tersemat / peluncur)
// Setiap halaman 'links' memakai tabel Supabase sendiri yang namanya sesuai menu (lihat file SQL).
const TASKS_TABLE = 'tugas';   // Tugas Aktif & Tugas Selesai (dibedakan oleh kolom "completed")

const VIEWS = {
  tasks:       { type: 'tasks', label: 'Tugas Aktif',    icon: 'list-todo',      accent: 'blue',   category: 'Dashboard kerja kantor', title: 'Daftar Tugas & Prioritas' },
  completed:   { type: 'tasks', label: 'Tugas Selesai',  icon: 'check-circle-2', accent: 'green',  category: 'Arsip & riwayat kerja',  title: 'Tugas Selesai' },

  ekinerja:    { type: 'links', label: 'eKinerja',       icon: 'globe',          accent: 'purple', category: 'Portal & tautan langsung', title: 'eKinerja',
                 table: 'ekinerja', storage: 'office_ekinerja_backup', initial: [] },

  // --- PSKI ---
  drivepski:   { type: 'links', label: 'Drive PSKI',     icon: 'hard-drive',     accent: 'blue',   category: 'PSKI', title: 'Drive PSKI',
                 table: 'drive_pski', seedKey: 'supabase_drive_psk_seeded',
                 initial: [{ id: '1', title: 'Google Drive PSKI', url: 'https://drive.google.com/drive/my-drive?hl=ID', logo_url: '', notes: '' }] },
  eset:        { type: 'links', label: 'Eset Protect',   icon: 'shield-check',   accent: 'cyan',   category: 'PSKI', title: 'Eset Protect',
                 table: 'eset_protect', storage: 'office_eset_backup', initial: [] },
  laporan:     { type: 'links', label: 'Laporan',        icon: 'calendar-range', accent: 'teal',   category: 'PSKI', title: 'Laporan',
                 table: 'laporan', initial: [] },
  rekap:       { type: 'iframe', label: 'Rekap Insiden', icon: 'shield-alert',   accent: 'orange', category: 'PSKI', title: 'Rekap Insiden',
                 url: 'https://www.appsheet.com/start/14238298-7d55-4640-aa26-4d40b42194fe', statusLabel: 'AppSheet' },
  // Simasda: halaman tersemat. 'url' = tautan asli (tombol "Buka di tab baru"),
  // 'embedUrl' = alamat yang dipasang di dalam kotak (versi lihat; tautan /edit biasanya ditolak Google untuk iframe).
  simasda:     { type: 'iframe', label: 'Simasda Usulan', icon: 'file-input',     accent: 'indigo', category: 'PSKI', title: 'Simasda Usulan',
                 url: 'https://docs.google.com/spreadsheets/d/1I0gtl-V8D8ktmJL-DvnzmZy3rfD0JH8jJ_9t4uxTkbg/edit?usp=sharing',
                 embedUrl: 'https://docs.google.com/spreadsheets/d/1I0gtl-V8D8ktmJL-DvnzmZy3rfD0JH8jJ_9t4uxTkbg/htmlview',
                 statusLabel: 'Google Sheets',
                 note: 'Tampilan di sini bersifat lihat saja. Untuk mengedit, klik "Buka langsung di tab baru". Jika kotak kosong, pastikan akses file diatur "Siapa saja yang memiliki link".' },

  // --- RENLAP ---
  driverenlap: { type: 'links', label: 'Drive Renlap',   icon: 'hard-drive',     accent: 'amber',  category: 'Renlap', title: 'Drive Renlap',
                 table: 'drive_renlap', seedKey: 'supabase_drive_renlap_seeded',
                 initial: [{ id: '1', title: 'Google Drive Renlap', url: 'https://drive.google.com/drive/my-drive', logo_url: '', notes: '' }] },
  bookmark:    { type: 'links', label: 'Kertas Kerja',   icon: 'file-spreadsheet', accent: 'pink', category: 'Renlap', title: 'Kertas Kerja',
                 table: 'kertas_kerja', initial: [] },

  // --- AI --- satu halaman berisi kartu peluncur. Situs AI menolak ditampilkan di dalam halaman lain,
  // jadi tiap kartu membuka situsnya di tab baru atau di jendela samping.
  ai:          { type: 'hub', label: 'AI', icon: 'sparkles', accent: 'pink', category: 'Asisten AI', title: 'AI',
                 intro: 'Pilih asisten AI yang ingin dipakai. Semuanya dibuka di luar K_Work karena situs AI tidak mengizinkan dirinya ditampilkan di dalam halaman lain.',
                 items: [
                   { key: 'chatgpt', title: 'ChatGPT', accent: 'emerald', url: 'https://chatgpt.com',
                     description: 'Asisten AI dari OpenAI untuk menulis, merangkum, dan menjawab pertanyaan.' },
                   { key: 'claude',  title: 'Claude',  accent: 'orange',  url: 'https://claude.ai',
                     description: 'Asisten AI dari Anthropic untuk menulis, menganalisis, dan membantu pekerjaan sehari-hari.' },
                   { key: 'gemini',  title: 'Gemini',  accent: 'sky',     url: 'https://gemini.google.com',
                     description: 'Asisten AI dari Google yang terhubung dengan layanan Google Anda.' }
                 ] }
};

// Struktur sidebar: 'items' = dropdown berisi submenu, 'direct' = menu tunggal tanpa submenu
const MENU = [
  { id: 'tugas',  label: 'Manajemen Tugas', icon: 'check-square',   iconClass: 'text-ios-blue',   items: ['tasks', 'completed'] },
  { id: 'portal', label: 'eKinerja',        icon: 'globe',          iconClass: 'text-ios-purple', direct: 'ekinerja' },
  { id: 'psk',    label: 'PSKI',            icon: 'folder-kanban',  iconClass: 'text-ios-orange', items: ['drivepski', 'eset', 'laporan', 'rekap', 'simasda'] },
  { id: 'renlap', label: 'Renlap',          icon: 'clipboard-list', iconClass: 'text-ios-green',  items: ['driverenlap', 'bookmark'] },
  { id: 'ai',     label: 'AI',              icon: 'sparkles',       iconClass: 'text-pink-600',   direct: 'ai' }
];

// Urutan submenu otomatis sesuai abjad (menu baru yang ditambahkan nanti ikut terurut sendiri)
function sortedItems(group) {
  return [...group.items].sort((a, b) => VIEWS[a].label.localeCompare(VIEWS[b].label, 'id'));
}

// Warna aksen per halaman (nama warna Tailwind, atau 4 warna iOS bawaan)
function ac(name) {
  const ios = ['blue', 'green', 'orange', 'purple'].includes(name);
  const main = ios ? `ios-${name}` : `${name}-600`;
  const light = ios ? `ios-${name}` : `${name}-500`;
  return {
    bg: `bg-${main}`,
    btn: ios ? `bg-${main} hover:opacity-90` : `bg-${main} hover:bg-${name}-700`,
    text: `text-${main}`,
    soft: `bg-${light}/10`,
    border: `hover:border-${light}/50`,
    iconBorder: `group-hover/link:border-${light}/60`,
    title: `group-hover/link:text-${main}`,
    glow: `shadow-md shadow-${main}/30`
  };
}

// Warna RGB tiap aksen, dipakai untuk rona latar halaman (variabel CSS --accent)
const ACCENT_RGB = {
  blue: '0, 122, 255', green: '52, 199, 89', orange: '255, 149, 0', purple: '175, 82, 222',
  cyan: '8, 145, 178', indigo: '79, 70, 229', teal: '13, 148, 136', pink: '219, 39, 119', amber: '217, 119, 6',
  emerald: '5, 150, 105', sky: '2, 132, 199'
};

// State Aplikasi
let tasks = [];
let linkLists = {};            // { namaHalaman: [ {id, title, url, logo_url} ] }
let currentView = 'tasks';     // salah satu key di VIEWS
let currentFilter = 'semua';
let searchQuery = '';
let currentBookmarkTarget = 'ekinerja'; // key halaman yang sedang ditambah/diedit linknya
let dayFilter = null;                    // filter dari Radar Deadline: null | 'overdue' | 'YYYY-MM-DD'
const openGroups = new Set(['tugas']);  // grup sidebar yang sedang terbuka

// Normalisasi Task (CamelCase & SnakeCase)
function normalizeTask(t) {
  return {
    id: String(t.id),
    title: t.title || '',
    category: t.category || '',
    priority: t.priority || 'Sedang',
    worksheetUrl: t.worksheet_url || t.worksheetUrl || '',
    worksheet_url: t.worksheet_url || t.worksheetUrl || '',
    evidenceUrl: t.evidence_url || t.evidenceUrl || '',
    evidence_url: t.evidence_url || t.evidenceUrl || '',
    deadline: t.deadline || '',
    notes: t.notes || '',
    completed: Boolean(t.completed)
  };
}

// ------------------- LOAD & SAVE TASKS -------------------
async function loadTasks() {
  let loaded = false;
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from(TASKS_TABLE)
        .select('*')
        .order('id', { ascending: false });

      if (!error && Array.isArray(data)) {
        loaded = true;
        tasks = data.map(normalizeTask);
        localStorage.setItem('office_tasks_backup', JSON.stringify(tasks));
      } else if (error) {
        console.warn(`Supabase (${TASKS_TABLE}) belum siap, memakai data lokal:`, error.message);
      }
    } catch (err) {
      console.warn('Error Supabase Tugas:', err);
    }
  }

  if (!loaded) {
    try {
      const backup = localStorage.getItem('office_tasks_backup');
      tasks = backup ? JSON.parse(backup).map(normalizeTask) : [];
    } catch (e) {
      tasks = [];
    }
  }
  setSyncStatus(loaded);
  renderTasks();
}

async function saveTask(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const id = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value.trim();
  const category = document.getElementById('taskCategory').value.trim();
  const priority = document.getElementById('taskPriority').value;
  const worksheetUrl = document.getElementById('taskWorksheetUrl').value.trim();
  const evidenceUrl = document.getElementById('taskEvidenceUrl').value.trim();
  const deadlineVal = document.getElementById('taskDeadline').value;
  const notes = document.getElementById('taskNotes').value.trim();

  if (!title || !category || !deadlineVal) {
    showToast('Mohon lengkapi judul, kategori, dan batas waktu!');
    return;
  }

  let deadlineIso = null;
  if (deadlineVal) {
    const localDate = new Date(deadlineVal);
    deadlineIso = !isNaN(localDate.getTime()) ? localDate.toISOString() : null;
  }

  const payload = {
    title, category, priority,
    worksheet_url: worksheetUrl || null,
    evidence_url: evidenceUrl || null,
    deadline: deadlineIso,
    notes: notes || null
  };

  let savedInSupabase = false;

  if (supabaseClient) {
    try {
      if (id) {
        const { error } = await supabaseClient.from(TASKS_TABLE).update(payload).eq('id', id);
        if (!error) savedInSupabase = true;
      } else {
        const { error } = await supabaseClient.from(TASKS_TABLE).insert([{ ...payload, completed: false }]);
        if (!error) savedInSupabase = true;
      }
    } catch (err) {
      console.warn('Gagal menyimpan task:', err);
    }
  }

  if (!savedInSupabase) {
    if (id) {
      const idx = tasks.findIndex(t => t.id == id);
      if (idx !== -1) tasks[idx] = normalizeTask({ ...tasks[idx], ...payload, id });
    } else {
      tasks.unshift(normalizeTask({ id: String(Date.now()), ...payload, completed: false }));
    }
    localStorage.setItem('office_tasks_backup', JSON.stringify(tasks));
    renderTasks();
  } else {
    await loadTasks();
  }

  // Jika menambahkan tugas baru saat berada di halaman Tugas Selesai, alihkan ke Tugas Aktif
  if (!id && currentView === 'completed') {
    switchMainView('tasks');
  }

  toggleModal('taskModal');
  showToast('Kerjaan berhasil disimpan ✨');
}

async function toggleComplete(id) {
  const task = tasks.find(t => t.id == id);
  if (!task) return;
  const newStatus = !task.completed;
  task.completed = newStatus;

  // Efek transisi kartu sebelum berpindah menu
  const card = document.getElementById(`task-card-${id}`);
  if (card) {
    card.style.transition = 'all 0.25s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.96)';
  }

  setTimeout(async () => {
    if (supabaseClient) {
      try {
        await supabaseClient.from(TASKS_TABLE).update({ completed: newStatus }).eq('id', id);
      } catch (err) {
        console.warn('Gagal update status Supabase:', err);
      }
    }
    localStorage.setItem('office_tasks_backup', JSON.stringify(tasks));
    renderTasks();

    if (newStatus) {
      showToast('Tugas diselesaikan 🎉 Dipindahkan ke Tugas Selesai');
    } else {
      showToast('Tugas diaktifkan kembali ↩️ Masuk ke Manajemen Tugas');
    }
  }, 220);
}

async function deleteTask(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus pekerjaan ini?')) return;
  if (supabaseClient) {
    await supabaseClient.from(TASKS_TABLE).delete().eq('id', id);
  }
  tasks = tasks.filter(t => t.id != id);
  localStorage.setItem('office_tasks_backup', JSON.stringify(tasks));
  renderTasks();
  showToast('Kerjaan berhasil dihapus');
}

// ------------------- LOGO RESOLVER -------------------
function getBookmarkLogo(urlStr, customLogo, title = '') {
  if (customLogo && customLogo.trim()) return customLogo.trim();
  if (!urlStr) return '';
  try {
    const u = new URL(urlStr.startsWith('http://') || urlStr.startsWith('https://') ? urlStr : 'https://' + urlStr);
    const host = u.hostname.toLowerCase();

    // Mapping khusus instansi & layanan populer
    if (host.includes('kotabogor.go.id')) {
      return 'https://www.google.com/s2/favicons?domain=kotabogor.go.id&sz=128';
    }
    if (host.includes('bkn.go.id')) {
      return 'https://icon.horse/icon/bkn.go.id';
    }
    if (host.includes('eset.com')) {
      return 'https://www.google.com/s2/favicons?domain=eset.com&sz=128';
    }
    if (host.includes('arsip.go.id') || (title && title.toLowerCase().includes('srikandi'))) {
      return 'https://srikandi.arsip.go.id/favicon.ico';
    }
    if (host.includes('google.com') || host.includes('drive.google')) {
      return 'https://www.google.com/s2/favicons?domain=drive.google.com&sz=128';
    }
    if (host.includes('appsheet.com')) {
      return 'https://www.google.com/s2/favicons?domain=appsheet.com&sz=128';
    }
    if (host.includes('whatsapp.com')) {
      return 'https://www.google.com/s2/favicons?domain=whatsapp.com&sz=128';
    }
    if (host.includes('youtube.com')) {
      return 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';
    }

    // Deteksi base domain
    const parts = host.split('.');
    let baseDomain = host;
    if (parts.length >= 3 && (parts[parts.length - 2] === 'go' || parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'ac')) {
      baseDomain = parts.slice(-3).join('.');
    } else if (parts.length >= 2) {
      baseDomain = parts.slice(-2).join('.');
    }

    return `https://www.google.com/s2/favicons?domain=${baseDomain}&sz=128`;
  } catch (e) {
    return '';
  }
}

// ------------------- SIDEBAR HP, STATUS & RADAR DEADLINE -------------------
function toggleSidebar(force) {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  if (!sb || !ov) return;
  const open = typeof force === 'boolean' ? force : sb.classList.contains('-translate-x-full');
  sb.classList.toggle('-translate-x-full', !open);
  ov.classList.toggle('hidden', !open);
  document.body.classList.toggle('overflow-hidden', open && window.innerWidth < 768);
}

function linkHost(urlStr) {
  try {
    const u = new URL(/^https?:\/\//i.test(urlStr) ? urlStr : 'https://' + urlStr);
    return u.hostname.replace(/^www\./, '');
  } catch (e) {
    return urlStr || '';
  }
}

function setSyncStatus(online) {
  const dot = document.getElementById('syncDot');
  const label = document.getElementById('syncLabel');
  const wrap = document.getElementById('syncStatus');
  if (!dot || !label || !wrap) return;
  dot.className = `w-2 h-2 rounded-full shrink-0 ${online ? 'bg-ios-green' : 'bg-ios-orange'}`;
  label.textContent = online ? 'Cloud' : 'Lokal saja';
  wrap.className = `flex items-center gap-1.5 font-medium whitespace-nowrap ${online ? 'text-ios-green' : 'text-ios-orange'}`;
}

function localDayKey(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function setDayFilter(key) {
  dayFilter = (dayFilter === key) ? null : key;
  renderTasks();
}

function renderRadar() {
  const el = document.getElementById('deadlineRadar');
  if (!el) return;
  if (currentView !== 'tasks') {
    el.innerHTML = '';
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Array.from({ length: 7 }, (_, i) => new Date(startToday.getFullYear(), startToday.getMonth(), startToday.getDate() + i));
  const endWindow = new Date(startToday.getFullYear(), startToday.getMonth(), startToday.getDate() + 7);

  const active = tasks.filter(t => !t.completed);
  const dated = active
    .map(t => ({ t, d: t.deadline ? new Date(t.deadline) : null }))
    .filter(x => x.d && !isNaN(x.d.getTime()));

  const overdue = dated.filter(x => x.d < now);
  const soon = dated.filter(x => x.d >= now && (x.d - now) <= 48 * 3600 * 1000);
  const later = dated.filter(x => x.d >= endWindow);

  const byDay = {};
  dated.filter(x => x.d >= now && x.d < endWindow).forEach(x => {
    const k = localDayKey(x.d);
    (byDay[k] = byDay[k] || []).push(x.t);
  });

  const order = { Tinggi: 0, Sedang: 1, Rendah: 2 };
  const dotColor = { Tinggi: 'bg-ios-red', Sedang: 'bg-ios-orange', Rendah: 'bg-ios-gray' };

  const summary = [`${active.length} tugas aktif`];
  if (soon.length) summary.push(`${soon.length} mendekati deadline`);
  const summaryText = summary.join(', ') + '.' + (later.length ? ` ${later.length} lainnya jatuh tempo setelah 7 hari.` : '');

  const cells = days.map((d, i) => {
    const key = localDayKey(d);
    const list = (byDay[key] || []).slice().sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
    const selected = dayFilter === key;
    const isToday = i === 0;
    const weekday = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const fullLabel = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

    const dots = list.slice(0, 3).map(t => `<span class="w-1.5 h-1.5 rounded-full ${selected ? 'bg-white' : (dotColor[t.priority] || 'bg-ios-gray')}"></span>`).join('')
      + (list.length > 3 ? `<span class="text-[9px] font-bold leading-none">+${list.length - 3}</span>` : '');

    const tone = selected
      ? 'bg-ios-blue text-white shadow-md shadow-ios-blue/30'
      : (isToday
        ? 'bg-ios-blue/10 text-ios-blue ring-1 ring-ios-blue/30 hover:bg-ios-blue/15'
        : 'bg-gray-100/80 dark:bg-ios-darkGray4/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-ios-darkGray4');

    return `
      <button type="button" onclick="setDayFilter('${key}')" aria-pressed="${selected}"
        aria-label="${fullLabel}: ${list.length} tugas${isToday ? ' (hari ini)' : ''}"
        class="flex flex-col items-center gap-1 rounded-2xl py-2.5 px-1 transition-colors ${tone}">
        <span class="text-[11px] font-medium ${selected ? 'text-white/80' : 'opacity-70'}">${weekday}</span>
        <span class="text-lg font-extrabold leading-none ${list.length === 0 && !selected && !isToday ? 'text-gray-400 dark:text-gray-500' : ''}">${d.getDate()}</span>
        <span class="flex items-center justify-center gap-0.5 h-2">${dots}</span>
      </button>`;
  }).join('');

  const overdueBar = overdue.length ? `
    <button type="button" onclick="setDayFilter('overdue')" aria-pressed="${dayFilter === 'overdue'}"
      class="mt-3 w-full flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${dayFilter === 'overdue' ? 'bg-ios-red text-white' : 'bg-ios-red/10 text-ios-red hover:bg-ios-red/15'}">
      <span class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4"></i>${overdue.length} tugas melewati batas waktu</span>
      <span>${dayFilter === 'overdue' ? 'Tampilkan semua' : 'Lihat'}</span>
    </button>` : '';

  el.innerHTML = `
    <section class="rounded-3xl bg-white/70 dark:bg-ios-darkGray5/70 ios-glass ios-shadow border border-gray-200/60 dark:border-gray-800/80 p-4 sm:p-5" aria-label="Radar deadline 7 hari">
      <div class="flex flex-wrap items-start justify-between gap-2 mb-3.5">
        <div>
          <h2 class="text-base font-extrabold tracking-tight">7 hari ke depan</h2>
          <p class="text-xs text-ios-gray mt-0.5">${summaryText}</p>
        </div>
        ${dayFilter && dayFilter !== 'overdue' ? `<button type="button" onclick="setDayFilter('${dayFilter}')" class="text-xs font-semibold text-ios-blue hover:underline">Tampilkan semua</button>` : ''}
      </div>
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2">${cells}</div>
      ${overdueBar}
    </section>
  `;
}

// ------------------- CATATAN (LIHAT / TUTUP) -------------------
const expandedNotes = new Set(); // supaya catatan yang terbuka tidak menutup sendiri saat daftar dirender ulang

function noteBlockHtml(key, notes, bordered = true) {
  if (!notes || !String(notes).trim()) return '';
  const k = escapeHtml(key);
  const open = expandedNotes.has(key);
  return `
    <div class="${bordered ? 'mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/60' : 'mt-1.5'}">
      <button type="button" onclick="toggleNote('${k}')"
        class="flex items-center gap-1 text-xs font-medium text-ios-gray hover:text-ios-blue transition-colors">
        <span data-note-label="${k}">${open ? 'Tutup catatan' : 'Lihat catatan'}</span>
        <span data-note-chev="${k}" class="inline-block transition-transform duration-200 ${open ? 'rotate-180' : ''}">
          <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
        </span>
      </button>
      <p data-note-panel="${k}" class="${open ? '' : 'hidden'} mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line break-words">${escapeHtml(notes)}</p>
    </div>
  `;
}

function toggleNote(key) {
  const open = !expandedNotes.has(key);
  if (open) expandedNotes.add(key); else expandedNotes.delete(key);
  const each = (attr, fn) => document.querySelectorAll(`[${attr}]`).forEach(el => { if (el.getAttribute(attr) === key) fn(el); });
  each('data-note-panel', el => el.classList.toggle('hidden', !open));
  each('data-note-chev', el => el.classList.toggle('rotate-180', open));
  each('data-note-label', el => { el.textContent = open ? 'Tutup catatan' : 'Lihat catatan'; });
}

// ------------------- URUTAN: TERBARU / A-Z / Z-A -------------------
const SORT_MODES = ['new', 'az', 'za'];
const SORT_INFO = {
  new: { label: 'Terbaru', icon: 'arrow-down-up',  hint: 'Urutan: terbaru di atas' },
  az:  { label: 'A–Z',     icon: 'arrow-down-a-z', hint: 'Urutan: A ke Z' },
  za:  { label: 'Z–A',     icon: 'arrow-down-z-a', hint: 'Urutan: Z ke A' }
};
const nameCollator = new Intl.Collator('id', { sensitivity: 'base', numeric: true });

function getSort(viewName) {
  try {
    const saved = localStorage.getItem('office_sort_' + viewName);
    if (SORT_MODES.includes(saved)) return saved;
  } catch (e) { /* abaikan */ }
  return 'new';
}

// Dipakai setiap kali daftar digambar, jadi data baru otomatis masuk ke urutan yang benar
function applySort(list, mode) {
  if (mode === 'az') return [...list].sort((a, b) => nameCollator.compare(a.title || '', b.title || ''));
  if (mode === 'za') return [...list].sort((a, b) => nameCollator.compare(b.title || '', a.title || ''));
  return list;
}

function updateSortButton() {
  const btn = document.getElementById('sortBtn');
  const cfg = VIEWS[currentView];
  if (!btn || !cfg) return;
  const show = cfg.type === 'tasks' || cfg.type === 'links';
  btn.classList.toggle('hidden', !show);
  btn.classList.toggle('inline-flex', show);
  if (!show) return;

  const info = SORT_INFO[getSort(currentView)];
  btn.innerHTML = `<i data-lucide="${info.icon}" class="w-4 h-4"></i><span class="hidden sm:inline text-xs font-semibold">${info.label}</span>`;
  btn.title = `${info.hint} (klik untuk mengganti)`;
  btn.setAttribute('aria-label', btn.title);
  initIcons();
}

function cycleSort() {
  const next = SORT_MODES[(SORT_MODES.indexOf(getSort(currentView)) + 1) % SORT_MODES.length];
  try { localStorage.setItem('office_sort_' + currentView, next); } catch (e) { /* abaikan */ }
  updateSortButton();
  const cfg = VIEWS[currentView];
  if (cfg.type === 'tasks') renderTasks();
  else if (cfg.type === 'links') renderLinks(currentView);
}

// ------------------- LAYOUT KOLOM / BARIS -------------------
function getLayout(viewName) {
  try {
    const saved = localStorage.getItem('office_layout_' + viewName);
    if (saved === 'grid' || saved === 'list') return saved;
  } catch (e) { /* abaikan */ }
  return VIEWS[viewName] && VIEWS[viewName].type === 'tasks' ? 'list' : 'grid';
}

function updateLayoutToggle() {
  const wrap = document.getElementById('layoutToggle');
  const cfg = VIEWS[currentView];
  if (!wrap || !cfg) return;
  const show = cfg.type === 'tasks' || cfg.type === 'links';
  wrap.classList.toggle('hidden', !show);
  if (!show) return;

  const mode = getLayout(currentView);
  const base = 'p-2 rounded-full transition-all';
  const on = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm';
  const off = 'text-ios-gray hover:text-gray-900 dark:hover:text-white';
  const gridBtn = document.getElementById('layoutBtnGrid');
  const listBtn = document.getElementById('layoutBtnList');
  if (gridBtn) gridBtn.className = `${base} ${mode === 'grid' ? on : off}`;
  if (listBtn) listBtn.className = `${base} ${mode === 'list' ? on : off}`;
}

function setLayout(mode) {
  if (mode !== 'grid' && mode !== 'list') return;
  try { localStorage.setItem('office_layout_' + currentView, mode); } catch (e) { /* abaikan */ }
  updateLayoutToggle();
  const cfg = VIEWS[currentView];
  if (cfg.type === 'tasks') renderTasks();
  else if (cfg.type === 'links') renderLinks(currentView);
}

// ------------------- LOAD, SAVE & RENDER LINK (Portal, PSKI, Renlap) -------------------
function linkStorageKey(cfg) {
  return cfg.storage || `office_${cfg.table}_backup`;
}

// Penanda data awal dibuat per akun, jadi tiap akun baru mendapat data awal sekali saja
function seedFlag(cfg) {
  return `${cfg.seedKey}:${currentUser ? currentUser.id : ''}`;
}

function readLinkBackup(cfg) {
  try {
    const raw = localStorage.getItem(linkStorageKey(cfg));
    return raw ? JSON.parse(raw) : cfg.initial;
  } catch (e) {
    return cfg.initial;
  }
}

async function loadLinks(viewName) {
  const cfg = VIEWS[viewName];
  if (!cfg || cfg.type !== 'links') return;

  let loaded = false;
  let list = [];

  if (supabaseClient) {
    try {
      let query = supabaseClient.from(cfg.table).select('*');
      if (cfg.section) query = query.eq('section', cfg.section);
      const { data, error } = await query.order('id', { ascending: false });

      if (!error && Array.isArray(data)) {
        loaded = true;
        if (data.length === 0 && cfg.initial.length > 0 && cfg.seedKey && !(localStorage.getItem(cfg.seedKey) || localStorage.getItem(seedFlag(cfg)))) {
          const toInsert = cfg.initial.map(({ title, url }) => (cfg.section ? { title, url, section: cfg.section } : { title, url }));
          const { data: inserted } = await supabaseClient.from(cfg.table).insert(toInsert).select();
          if (inserted && inserted.length > 0) {
            list = inserted;
            localStorage.setItem(seedFlag(cfg), 'true');
          } else {
            list = cfg.initial;
          }
        } else {
          list = data;
        }
        localStorage.setItem(linkStorageKey(cfg), JSON.stringify(list));
      } else if (error) {
        console.warn(`Supabase (${cfg.table}) belum siap, memakai data lokal:`, error.message);
      }
    } catch (err) {
      console.warn(`Error Supabase ${cfg.table}:`, err);
    }
  }

  if (!loaded) list = readLinkBackup(cfg);

  linkLists[viewName] = list;
  // Hanya render jika pengguna masih berada di halaman ini
  if (currentView === viewName) renderLinks(viewName);
}

function openBookmarkModal(bookmarkId = null, viewName = null) {
  const fallback = (VIEWS[currentView] && VIEWS[currentView].type === 'links') ? currentView : 'ekinerja';
  currentBookmarkTarget = (viewName && VIEWS[viewName]) ? viewName : fallback;

  const cfg = VIEWS[currentBookmarkTarget];
  const a = ac(cfg.accent);

  const form = document.getElementById('bookmarkForm');
  if (form) form.reset();

  const modalTitle = document.getElementById('bmModalTitle');
  const submitBtn = document.getElementById('bmSubmitBtn');
  const isEdit = bookmarkId !== null && bookmarkId !== undefined && bookmarkId !== '';

  if (submitBtn) {
    submitBtn.className = `px-6 py-2.5 rounded-xl ${a.btn} text-white text-sm font-semibold shadow-md transition-all`;
  }

  document.getElementById('bmId').value = '';
  document.getElementById('bmTitle').value = '';
  document.getElementById('bmUrl').value = '';
  document.getElementById('bmLogo').value = '';
  document.getElementById('bmNotes').value = '';

  if (isEdit) {
    const item = (linkLists[currentBookmarkTarget] || []).find(b => String(b.id) === String(bookmarkId));
    if (modalTitle) modalTitle.textContent = `Edit Link ${cfg.label}`;
    if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
    if (item) {
      document.getElementById('bmId').value = String(item.id);
      document.getElementById('bmTitle').value = item.title || '';
      document.getElementById('bmUrl').value = item.url || '';
      document.getElementById('bmLogo').value = item.logo_url || '';
      document.getElementById('bmNotes').value = item.notes || '';
    }
  } else {
    if (modalTitle) modalTitle.textContent = `Tambah Link ${cfg.label}`;
    if (submitBtn) submitBtn.textContent = 'Simpan Link';
  }

  toggleModal('bookmarkModal');
}

// Tulis ke Supabase. Jika kolom logo_url belum ada di tabel, dicoba ulang tanpa logo.
async function writeLink(cfg, id, payload) {
  const run = (p) => id
    ? supabaseClient.from(cfg.table).update(p).eq('id', id)
    : supabaseClient.from(cfg.table).insert([p]);

  const without = (keys) => Object.fromEntries(Object.entries(payload).filter(([k]) => !keys.includes(k)));
  // Urutan percobaan: lengkap -> tanpa logo -> tanpa catatan -> tanpa keduanya (jika kolomnya belum dibuat di tabel)
  const attempts = [
    { data: payload, dropped: [] },
    { data: without(['logo_url']), dropped: ['logo_url'] },
    { data: without(['notes']), dropped: ['notes'] },
    { data: without(['logo_url', 'notes']), dropped: ['logo_url', 'notes'] }
  ];

  for (const attempt of attempts) {
    const { error } = await run(attempt.data);
    if (!error) return { ok: true, dropped: attempt.dropped };
    console.warn(`Gagal menyimpan ke ${cfg.table}:`, error.message);
  }
  return { ok: false, dropped: [] };
}

async function saveBookmark(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const id = document.getElementById('bmId').value.trim();
  const title = document.getElementById('bmTitle').value.trim();
  const url = document.getElementById('bmUrl').value.trim();
  const logoUrl = document.getElementById('bmLogo').value.trim();
  const notes = document.getElementById('bmNotes').value.trim();

  if (!title || !url) {
    showToast('Mohon isi judul dan URL link!');
    return;
  }

  const viewName = currentBookmarkTarget;
  const cfg = VIEWS[viewName];
  const list = linkLists[viewName] || [];

  let savedInSupabase = false;
  let dropped = [];
  if (supabaseClient) {
    try {
      const payload = { title, url, logo_url: logoUrl, notes };
      if (!id && cfg.section) payload.section = cfg.section;
      const result = await writeLink(cfg, id || null, payload);
      savedInSupabase = result.ok;
      dropped = result.dropped;
    } catch (err) {
      console.warn(`Error save ${cfg.table}:`, err);
    }
  }

  if (savedInSupabase) {
    // Muat ulang dari database supaya ID asli dari Supabase yang dipakai
    await loadLinks(viewName);
  } else {
    // Mode offline / tabel belum dibuat: simpan di perangkat ini saja
    if (id) {
      const idx = list.findIndex(b => String(b.id) === String(id));
      if (idx !== -1) list[idx] = { ...list[idx], title, url, logo_url: logoUrl, notes };
      else list.push({ id, title, url, logo_url: logoUrl, notes });
    } else {
      list.unshift({ id: String(Date.now()), title, url, logo_url: logoUrl, notes });
    }
    linkLists[viewName] = list;
    localStorage.setItem(linkStorageKey(cfg), JSON.stringify(list));
    if (currentView === viewName) renderLinks(viewName);
  }

  toggleModal('bookmarkModal');
  if (dropped.includes('notes')) {
    showToast('Tersimpan, tetapi kolom "notes" belum ada di Supabase. Jalankan file SQL terbaru.');
  } else {
    showToast(id ? 'Link berhasil diperbarui ✨' : 'Link berhasil disimpan ✨');
  }
}

async function deleteBookmark(id, viewName = null) {
  const name = (viewName && VIEWS[viewName]) ? viewName : currentView;
  const cfg = VIEWS[name];
  if (!cfg || cfg.type !== 'links') return;
  if (!confirm(`Hapus link ${cfg.label} ini?`)) return;

  if (supabaseClient) {
    try {
      await supabaseClient.from(cfg.table).delete().eq('id', id);
    } catch (err) {
      console.warn(`Error delete ${cfg.table}:`, err);
    }
  }

  linkLists[name] = (linkLists[name] || []).filter(b => String(b.id) !== String(id));
  localStorage.setItem(linkStorageKey(cfg), JSON.stringify(linkLists[name]));
  if (currentView === name) renderLinks(name);
  showToast('Link berhasil dihapus');
}

function renderLinks(viewName) {
  const container = document.getElementById('linkList');
  const cfg = VIEWS[viewName];
  if (!container || !cfg) return;

  const a = ac(cfg.accent);
  const list = applySort(linkLists[viewName] || [], getSort(viewName));

  // Kolom (grid) atau baris (daftar)
  container.className = getLayout(viewName) === 'list'
    ? 'flex flex-col gap-3'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start';

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-16 bg-white/40 dark:bg-ios-darkGray5/40 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 ios-glass">
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl ${a.soft} ${a.text} flex items-center justify-center">
          <i data-lucide="${cfg.icon}" class="w-7 h-7"></i>
        </div>
        <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200">Belum Ada Tautan di ${escapeHtml(cfg.label)}</h3>
        <p class="text-xs text-ios-gray mt-1 max-w-sm mx-auto">Tambahkan tautan penting untuk akses cepat dari halaman ini.</p>
        <button onclick="openBookmarkModal(null, '${viewName}')" class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ${a.btn} text-white text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>Tambah Link</span>
        </button>
      </div>
    `;
    initIcons();
    return;
  }

  container.innerHTML = list.map(bm => {
    const logoUrl = getBookmarkLogo(bm.url, bm.logo_url, bm.title);
    const initial = (String(bm.title || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 2) || 'LK').toUpperCase();
    const host = linkHost(bm.url);

    return `
      <div class="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-ios-darkGray5/80 border border-gray-200/70 dark:border-gray-800/80 ios-glass ios-shadow ${a.border} hover:shadow-md transition-all p-4 pl-5 before:absolute before:inset-y-0 before:left-0 before:w-1 before:${a.bg} before:opacity-60 hover:before:opacity-100 before:transition-opacity">
        <div class="flex items-center gap-3">
          <!-- Logo & judul sebagai tautan -->
          <a href="${escapeHtml(bm.url)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3.5 flex-1 min-w-0 group/link" title="Buka ${escapeHtml(bm.title)} (${escapeHtml(bm.url)})">
            <div class="w-11 h-11 rounded-xl bg-white dark:bg-ios-darkGray4 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-2 ${a.iconBorder} group-hover/link:scale-105 transition-all">
              ${logoUrl ? `
                <img src="${escapeHtml(logoUrl)}"
                     alt=""
                     class="w-full h-full object-contain"
                     onerror="this.parentElement.innerHTML='<span class=\\'text-xs font-bold ${a.text}\\'>${initial}</span>';">
              ` : `
                <span class="text-xs font-bold ${a.text}">${initial}</span>
              `}
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-[15px] leading-snug text-gray-900 dark:text-white truncate ${a.title} transition-colors">${escapeHtml(bm.title)}</h4>
              <p class="text-xs text-ios-gray truncate mt-0.5">${escapeHtml(host)}</p>
            </div>
            <i data-lucide="arrow-up-right" class="w-4 h-4 text-ios-gray shrink-0 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all"></i>
          </a>

          <!-- Edit & hapus: tampil saat kursor di atas kartu (selalu terlihat di layar sentuh) -->
          <div class="flex items-center gap-0.5 shrink-0 md:absolute md:right-3 md:top-[22px] md:rounded-xl md:bg-white/95 md:dark:bg-ios-darkGray5/95 md:shadow-sm md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
            <button onclick="openBookmarkModal('${bm.id}', '${viewName}')" class="p-2 rounded-xl text-ios-gray hover:text-ios-blue hover:bg-ios-blue/10 transition-all" title="Edit tautan" aria-label="Edit ${escapeHtml(bm.title)}">
              <i data-lucide="pencil" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteBookmark('${bm.id}', '${viewName}')" class="p-2 rounded-xl text-ios-gray hover:text-ios-red hover:bg-ios-red/10 transition-all" title="Hapus tautan" aria-label="Hapus ${escapeHtml(bm.title)}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        ${noteBlockHtml(`${viewName}:${bm.id}`, bm.notes)}
      </div>
    `;
  }).join('');

  initIcons();
}

// ------------------- HELPER & UI FUNCTIONS -------------------
function formatToLocalDateTimeInput(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.toggle('hidden');
}

function openTaskModal(taskId = null) {
  const form = document.getElementById('taskForm');
  if (form) form.reset();

  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('taskSubmitBtn');

  if (taskId) {
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (task) {
      if (modalTitle) modalTitle.textContent = 'Edit Kerjaan';
      if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
      document.getElementById('taskId').value = String(task.id);
      document.getElementById('taskTitle').value = task.title || '';
      document.getElementById('taskCategory').value = task.category || '';
      document.getElementById('taskPriority').value = task.priority || 'Sedang';
      document.getElementById('taskWorksheetUrl').value = task.worksheetUrl || '';
      document.getElementById('taskEvidenceUrl').value = task.evidenceUrl || '';
      document.getElementById('taskDeadline').value = formatToLocalDateTimeInput(task.deadline);
      document.getElementById('taskNotes').value = task.notes || '';
    }
  } else {
    if (modalTitle) modalTitle.textContent = 'Tambah Kerjaan Baru';
    if (submitBtn) submitBtn.textContent = 'Simpan Kerjaan';
    document.getElementById('taskId').value = '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    document.getElementById('taskDeadline').value = formatToLocalDateTimeInput(tomorrow);
  }
  toggleModal('taskModal');
}

// ------------------- SIDEBAR -------------------
function navItemHtml(viewName) {
  const cfg = VIEWS[viewName];
  const a = ac(cfg.accent);
  const active = currentView === viewName;

  let badge = '';
  if (viewName === 'tasks') {
    badge = `<span id="badgeActiveCount" class="px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-ios-darkGray4 text-gray-700 dark:text-gray-300'}">0</span>`;
  } else if (viewName === 'completed') {
    badge = `<span id="badgeCompletedCount" class="px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-ios-green/10 text-ios-green dark:bg-ios-green/20'}">0</span>`;
  }

  const stateClass = active
    ? `${a.bg} ${a.glow} text-white font-semibold`
    : 'font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-ios-darkGray4/50 hover:text-gray-900 dark:hover:text-white';

  return `
    <a href="#${viewName}" onclick="switchMainView('${viewName}'); return false;" id="nav-${viewName}"
      class="flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${stateClass}">
      <div class="flex items-center gap-2.5">
        <i data-lucide="${cfg.icon}" class="w-3.5 h-3.5 ${active ? 'text-white' : a.text}"></i>
        <span class="whitespace-nowrap">${cfg.label}</span>
      </div>
      ${badge}
    </a>
  `;
}

function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;

  nav.innerHTML = MENU.map(group => {
    // Menu tunggal tanpa submenu (Portal)
    if (group.direct) {
      const cfg = VIEWS[group.direct];
      const a = ac(cfg.accent);
      const active = currentView === group.direct;
      return `
        <div class="pt-1">
          <a href="#${group.direct}" onclick="switchMainView('${group.direct}'); return false;" id="nav-${group.direct}"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active ? `${a.bg} ${a.glow} text-white` : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-ios-darkGray4'}">
            <i data-lucide="${group.icon}" class="w-4 h-4 ${active ? 'text-white' : group.iconClass}"></i>
            <span class="whitespace-nowrap text-left">${group.label}</span>
          </a>
        </div>
      `;
    }

    // Grup dengan dropdown submenu
    const isOpen = openGroups.has(group.id);
    const hasActive = group.items.includes(currentView);
    return `
      <div class="pt-1">
        <button onclick="toggleGroup('${group.id}')"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-ios-darkGray4 transition-all ${hasActive ? 'bg-gray-100/70 dark:bg-ios-darkGray4/60' : ''}">
          <div class="flex items-center gap-3">
            <i data-lucide="${group.icon}" class="w-4 h-4 ${group.iconClass}"></i>
            <span class="whitespace-nowrap text-left">${group.label}</span>
          </div>
          <i data-lucide="chevron-down" class="w-4 h-4 text-ios-gray transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}"></i>
        </button>
        <div class="${isOpen ? '' : 'hidden'} pl-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-800 ml-3">
          ${sortedItems(group).map(navItemHtml).join('')}
        </div>
      </div>
    `;
  }).join('');

  initIcons();
  updateStats(); // isi ulang angka badge Tugas Aktif / Tugas Selesai
}

function toggleGroup(groupId) {
  if (openGroups.has(groupId)) openGroups.delete(groupId);
  else openGroups.add(groupId);
  renderSidebar();
}

function renderFilterButtons() {
  const container = document.getElementById('filterContainer');
  if (!container) return;

  if (currentView === 'tasks') {
    const filters = [
      { id: 'semua', label: 'Semua' },
      { id: 'deadline', label: 'Mendekati Deadline' },
      { id: 'tinggi', label: 'Prioritas Tinggi' }
    ];
    if (!filters.some(f => f.id === currentFilter)) {
      currentFilter = 'semua';
    }
    container.innerHTML = filters.map(f => `
      <button onclick="setFilter('${f.id}')" id="btn-${f.id}"
        class="filter-btn px-3.5 py-1.5 rounded-lg transition-all ${currentFilter === f.id ? 'text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm font-semibold' : 'text-ios-gray hover:text-gray-900 dark:hover:text-white'}">
        ${f.label}
      </button>
    `).join('');
  } else if (currentView === 'completed') {
    const filters = [
      { id: 'semua', label: 'Semua Selesai' },
      { id: 'tinggi', label: 'Prioritas Tinggi' }
    ];
    if (!filters.some(f => f.id === currentFilter)) {
      currentFilter = 'semua';
    }
    container.innerHTML = filters.map(f => `
      <button onclick="setFilter('${f.id}')" id="btn-${f.id}"
        class="filter-btn px-3.5 py-1.5 rounded-lg transition-all ${currentFilter === f.id ? 'text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm font-semibold' : 'text-ios-gray hover:text-gray-900 dark:hover:text-white'}">
        ${f.label}
      </button>
    `).join('');
  }
}

function embedPanelHtml(viewName) {
  const cfg = VIEWS[viewName];
  return `
    <div class="w-full rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-800/80 ios-shadow ios-glass bg-white/50 dark:bg-ios-darkGray5/50 relative">
      <iframe src="${escapeHtml(cfg.embedUrl || cfg.url)}" title="${escapeHtml(cfg.title)}"
        class="w-full h-[78vh] border-none"
        allow="camera; microphone; geolocation; clipboard-read; clipboard-write"></iframe>
    </div>
    <div class="flex items-center justify-between text-xs text-ios-gray px-2">
      <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-ios-green animate-pulse"></span> ${escapeHtml(cfg.statusLabel || 'AppSheet')} Terkoneksi</span>
      <a href="${escapeHtml(cfg.url)}" target="_blank" rel="noopener noreferrer"
        class="text-ios-blue hover:underline flex items-center gap-1 font-medium">
        <span>Buka langsung di tab baru</span>
        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
      </a>
    </div>
    ${cfg.note ? `<p class="text-[11px] text-ios-gray px-2">${escapeHtml(cfg.note)}</p>` : ''}
  `;
}

// Halaman AI: kartu besar per asisten, dibuka di tab baru atau jendela samping
function hubPanelHtml(viewName) {
  const cfg = VIEWS[viewName];
  const items = [...cfg.items].sort((a, b) => nameCollator.compare(a.title, b.title));

  const cards = items.map(it => {
    const a = ac(it.accent);
    const logo = getBookmarkLogo(it.url, '', it.title);
    const initial = (it.title.replace(/[^A-Za-z0-9]/g, '').slice(0, 2) || 'AI').toUpperCase();
    return `
      <article class="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-ios-darkGray5/80 ios-glass ios-shadow border border-gray-200/60 dark:border-gray-800/80 p-6 flex flex-col before:absolute before:inset-x-0 before:top-0 before:h-1 before:${a.bg}">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 shrink-0 rounded-2xl bg-white dark:bg-ios-darkGray4 border border-gray-200/80 dark:border-gray-700/80 shadow-sm flex items-center justify-center p-3 overflow-hidden">
            ${logo ? `<img src="${escapeHtml(logo)}" alt="" class="w-full h-full object-contain"
              onerror="this.parentElement.innerHTML='<span class=\\'text-base font-extrabold ${a.text}\\'>${initial}</span>';">`
              : `<span class="text-base font-extrabold ${a.text}">${initial}</span>`}
          </div>
          <div class="min-w-0">
            <h3 class="text-xl font-extrabold tracking-tight">${escapeHtml(it.title)}</h3>
            <p class="text-xs text-ios-gray truncate">${escapeHtml(linkHost(it.url))}</p>
          </div>
        </div>

        <p class="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300 flex-1">${escapeHtml(it.description || '')}</p>

        <div class="mt-6 flex flex-col gap-2">
          <a href="${escapeHtml(it.url)}" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl ${a.btn} text-white text-sm font-semibold shadow-md transition-all">
            <i data-lucide="external-link" class="w-4 h-4"></i>
            <span>Buka di tab baru</span>
          </a>
          <button type="button" onclick="openAiWindow('${it.key}')"
            class="hidden md:inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-ios-darkGray4 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            <i data-lucide="panel-right-open" class="w-4 h-4"></i>
            <span>Jendela samping</span>
          </button>
        </div>
      </article>`;
  }).join('');

  return `
    <p class="text-sm text-ios-gray max-w-2xl">${escapeHtml(cfg.intro || '')}</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cards}</div>
    <p class="hidden md:block text-xs text-ios-gray">
      <strong class="font-semibold text-gray-600 dark:text-gray-300">Jendela samping</strong> membuka jendela kecil di sisi kanan layar, sehingga bisa dipakai berdampingan dengan K_Work. Jika tidak muncul, izinkan pop-up untuk situs ini di browser Anda.
    </p>
  `;
}

// Membuka asisten AI di jendela terpisah di sisi kanan layar. Klik lagi = kembali ke jendela yang sama (percakapan tidak ter-reset)
function openAiWindow(key) {
  const item = ((VIEWS.ai && VIEWS.ai.items) || []).find(i => i.key === key);
  if (!item) return;

  const width = 520;
  const height = Math.max(520, Math.min(window.screen.availHeight - 80, 900));
  const left = Math.max(0, (window.screen.availLeft || 0) + window.screen.availWidth - width - 16);
  const top = (window.screen.availTop || 0) + 40;

  const win = window.open('', 'kwork_ai_' + key, `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
  if (!win) {
    showToast('Pop-up diblokir browser. Izinkan pop-up untuk situs ini, atau pakai Buka di tab baru.');
    return;
  }

  // Jendela baru masih kosong (about:blank). Jendela lama sudah berisi situs AI sehingga alamatnya tidak bisa dibaca dari sini.
  let isNew = false;
  try { isNew = win.location.href === 'about:blank'; } catch (e) { isNew = false; }
  if (isNew) {
    try { win.opener = null; } catch (e) { /* abaikan */ }
    win.location.href = item.url;
  }
  win.focus();
}

function showIframePanel(viewName) {
  const section = document.getElementById('iframeSection');
  const cfg = VIEWS[viewName];
  if (!section || !cfg) return;

  let panel = section.querySelector(`[data-iframe-panel="${viewName}"]`);
  if (!panel) {
    panel = document.createElement('div');
    panel.setAttribute('data-iframe-panel', viewName);
    panel.className = 'space-y-4';
    panel.innerHTML = cfg.type === 'hub' ? hubPanelHtml(viewName) : embedPanelHtml(viewName);
    section.appendChild(panel);
  }

  section.querySelectorAll('[data-iframe-panel]').forEach(p => {
    p.classList.toggle('hidden', p.getAttribute('data-iframe-panel') !== viewName);
  });
}

function setHeaderAction(html) {
  const headerActionBtn = document.getElementById('headerActionBtn');
  if (!headerActionBtn) return;
  headerActionBtn.classList.remove('hidden');
  headerActionBtn.innerHTML = html;
}

function switchMainView(viewName) {
  if (!VIEWS[viewName]) viewName = 'tasks';
  currentView = viewName;
  const cfg = VIEWS[viewName];
  const a = ac(cfg.accent);
  const secType = cfg.type === 'hub' ? 'iframe' : cfg.type;   // halaman AI memakai wadah yang sama dengan halaman tersemat

  // Warna aksen halaman (rona latar, logo, titik kategori)
  document.documentElement.style.setProperty('--accent', ACCENT_RGB[cfg.accent] || ACCENT_RGB.blue);

  // Buka grup sidebar yang berisi halaman ini
  const group = MENU.find(g => g.items && g.items.includes(viewName));
  if (group) openGroups.add(group.id);

  // Sinkronkan alamat (#nama-halaman) tanpa memicu hashchange
  try {
    if (window.location.hash !== '#' + viewName) history.replaceState(null, '', '#' + viewName);
  } catch (e) { /* abaikan, mis. saat dibuka lewat file:// */ }

  // Tampilkan hanya section yang sesuai
  const sections = {
    tasks: document.querySelector('main'),
    links: document.getElementById('linkSection'),
    iframe: document.getElementById('iframeSection')
  };
  Object.entries(sections).forEach(([type, el]) => {
    if (el) el.classList.toggle('hidden', type !== secType);
  });

  // Satu gerakan halus saat berpindah menu
  const shown = sections[secType];
  if (shown) { shown.classList.remove('view-enter'); void shown.offsetWidth; shown.classList.add('view-enter'); }
  if (window.innerWidth < 768) toggleSidebar(false);

  const taskControls = document.getElementById('taskControls');
  if (taskControls) taskControls.classList.toggle('hidden', cfg.type !== 'tasks');

  const headerCategory = document.getElementById('headerCategory');
  const headerTitle = document.getElementById('headerTitle');
  if (headerCategory) headerCategory.textContent = cfg.category;
  if (headerTitle) headerTitle.textContent = cfg.title;

  if (cfg.type === 'tasks') {
    setHeaderAction(`
      <button onclick="openTaskModal()"
        class="flex items-center gap-1.5 px-4 py-2.5 bg-ios-blue hover:bg-blue-600 text-white rounded-full font-medium text-sm shadow-md transition-all">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span class="hidden sm:inline">Tambah Tugas</span>
      </button>
    `);
    renderFilterButtons();
    renderTasks();
  } else if (cfg.type === 'links') {
    setHeaderAction(`
      <button onclick="openBookmarkModal(null, '${viewName}')"
        class="flex items-center gap-1.5 px-4 py-2.5 ${a.btn} text-white rounded-full font-medium text-sm shadow-md transition-all">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>Tambah Link</span>
      </button>
    `);
    // Tampilkan data yang sudah ada dulu agar tidak berkedip, lalu segarkan dari Supabase
    if (linkLists[viewName]) renderLinks(viewName);
    loadLinks(viewName);
  } else if (cfg.type === 'iframe') {
    setHeaderAction(`
      <a href="${cfg.url}" target="_blank" rel="noopener noreferrer"
        class="flex items-center gap-1.5 px-4 py-2.5 ${a.btn} text-white rounded-full font-medium text-sm shadow-md transition-all">
        <i data-lucide="external-link" class="w-4 h-4"></i>
        <span>Buka di Tab Baru</span>
      </a>
    `);
    showIframePanel(viewName);
  } else if (cfg.type === 'hub') {
    // Halaman AI: tombol ada di setiap kartu, jadi tombol aksi di header disembunyikan
    const actionBtn = document.getElementById('headerActionBtn');
    if (actionBtn) { actionBtn.innerHTML = ''; actionBtn.classList.add('hidden'); }
    showIframePanel(viewName);
  }

  updateLayoutToggle();
  updateSortButton();
  renderSidebar();
  initIcons();
}

function setFilter(filter) {
  currentFilter = filter;
  dayFilter = null;
  renderFilterButtons();
  renderTasks();
}

function getDeadlineStatus(deadlineStr, completed) {
  if (completed) return { label: 'Selesai', colorClass: 'bg-ios-green/10 text-ios-green border-ios-green/20' };
  if (!deadlineStr) return { label: 'Tanpa Batas', colorClass: 'bg-gray-100 dark:bg-gray-800 text-ios-gray border-gray-200 dark:border-gray-700' };

  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return { label: 'Format Tanggal', colorClass: 'bg-gray-100 dark:bg-gray-800 text-ios-gray border-gray-200 dark:border-gray-700' };

  const now = new Date();
  const diffMs = deadline - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const pastDays = Math.abs(diffDays);
    return { label: `Terlewat ${pastDays === 0 ? 'beberapa jam' : pastDays + ' hari'}`, colorClass: 'bg-ios-red/10 text-ios-red border-ios-red/20 font-semibold' };
  } else if (diffHours <= 24) {
    return { label: 'Hari ini / Mendekati!', colorClass: 'bg-ios-orange/10 text-ios-orange border-ios-orange/30 font-semibold animate-pulse' };
  } else {
    return { label: `${diffDays} Hari lagi`, colorClass: 'bg-gray-100 dark:bg-gray-800 text-ios-gray border-gray-200 dark:border-gray-700' };
  }
}

function renderTasks() {
  const container = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  if (!container) return;

  // Kolom (grid 2 kolom) atau baris (daftar)
  container.className = getLayout(currentView) === 'grid'
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start'
    : 'space-y-3.5';

  const now = new Date();

  let filtered = tasks.filter(task => {
    // Pemisahan berdasarkan menu: Tugas Aktif vs Tugas Selesai
    if (currentView === 'tasks' && task.completed) return false;
    if (currentView === 'completed' && !task.completed) return false;

    // Filter Pencarian
    if (searchQuery) {
      const titleMatch = (task.title || '').toLowerCase().includes(searchQuery);
      const categoryMatch = (task.category || '').toLowerCase().includes(searchQuery);
      const notesMatch = (task.notes || '').toLowerCase().includes(searchQuery);
      if (!titleMatch && !categoryMatch && !notesMatch) return false;
    }

    // Filter Kategori/Tab
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const diffHours = deadlineDate && !isNaN(deadlineDate.getTime()) ? (deadlineDate - now) / (1000 * 60 * 60) : 999999;

    // Filter dari Radar Deadline (klik hari / tugas terlewat)
    if (currentView === 'tasks' && dayFilter) {
      if (!deadlineDate || isNaN(deadlineDate.getTime())) return false;
      if (dayFilter === 'overdue') { if (!(deadlineDate < now)) return false; }
      else if (localDayKey(deadlineDate) !== dayFilter || deadlineDate < now) return false;
    }

    if (currentView === 'tasks') {
      if (currentFilter === 'deadline') return diffHours <= 48;
      if (currentFilter === 'tinggi') return task.priority === 'Tinggi';
    } else if (currentView === 'completed') {
      if (currentFilter === 'tinggi') return task.priority === 'Tinggi';
    }

    return true;
  });

  updateStats();
  renderRadar();
  const sortedTasks = applySort(filtered, getSort(currentView));

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.classList.remove('hidden');
      const emptyIcon = document.getElementById('emptyStateIcon');
      const emptyTitle = document.getElementById('emptyStateTitle');
      const emptyDesc = document.getElementById('emptyStateDesc');
      const emptyAction = document.getElementById('emptyStateAction');

      if (currentView === 'tasks') {
        const hasActiveTasks = tasks.some(t => !t.completed);
        if (hasActiveTasks) {
          if (emptyIcon) emptyIcon.innerHTML = `<i data-lucide="search-x" class="w-8 h-8 text-ios-gray"></i>`;
          if (emptyTitle) emptyTitle.textContent = 'Tidak ada tugas yang sesuai';
          if (emptyDesc) emptyDesc.textContent = 'Coba sesuaikan kata kunci pencarian atau pilih filter Semua.';
          if (emptyAction) emptyAction.innerHTML = '';
        } else if (tasks.length === 0) {
          // Belum ada tugas sama sekali (mis. akun baru)
          if (emptyIcon) emptyIcon.innerHTML = `<i data-lucide="clipboard-list" class="w-8 h-8 text-ios-gray"></i>`;
          if (emptyTitle) emptyTitle.textContent = 'Belum Ada Tugas';
          if (emptyDesc) emptyDesc.textContent = 'Mulai dengan menambahkan tugas pertama Anda. Deadline-nya akan muncul di radar 7 hari.';
          if (emptyAction) {
            emptyAction.innerHTML = `<button onclick="openTaskModal()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ios-blue text-white text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all"><i data-lucide="plus" class="w-4 h-4"></i><span>Tambah Tugas</span></button>`;
          }
        } else {
          if (emptyIcon) emptyIcon.innerHTML = `<i data-lucide="check-check" class="w-8 h-8 text-ios-green"></i>`;
          if (emptyTitle) emptyTitle.textContent = 'Semua Tugas Aktif Selesai! 🎉';
          if (emptyDesc) emptyDesc.textContent = 'Hebat, semua pekerjaan saat ini telah selesai. Anda dapat meninjau riwayat di menu Tugas Selesai.';
          if (emptyAction) {
            emptyAction.innerHTML = `<button onclick="switchMainView('completed')" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ios-green text-white text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all"><i data-lucide="check-circle-2" class="w-4 h-4"></i><span>Buka Menu Tugas Selesai</span></button>`;
          }
        }
      } else if (currentView === 'completed') {
        const hasCompletedTasks = tasks.some(t => t.completed);
        if (hasCompletedTasks) {
          if (emptyIcon) emptyIcon.innerHTML = `<i data-lucide="search-x" class="w-8 h-8 text-ios-gray"></i>`;
          if (emptyTitle) emptyTitle.textContent = 'Tidak ada tugas selesai yang sesuai';
          if (emptyDesc) emptyDesc.textContent = 'Coba sesuaikan kata kunci pencarian atau filter.';
          if (emptyAction) emptyAction.innerHTML = '';
        } else {
          if (emptyIcon) emptyIcon.innerHTML = `<i data-lucide="clipboard-list" class="w-8 h-8 text-ios-gray"></i>`;
          if (emptyTitle) emptyTitle.textContent = 'Belum Ada Tugas Selesai';
          if (emptyDesc) emptyDesc.textContent = 'Tugas yang Anda centang selesai pada menu Manajemen Tugas akan otomatis dipindahkan ke sini.';
          if (emptyAction) {
            emptyAction.innerHTML = `<button onclick="switchMainView('tasks')" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ios-blue text-white text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all"><i data-lucide="arrow-left" class="w-4 h-4"></i><span>Kembali ke Manajemen Tugas</span></button>`;
          }
        }
      }
    }
    initIcons();
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = sortedTasks.map(task => {
    const isDone = Boolean(task.completed);
    const deadlineStatus = getDeadlineStatus(task.deadline, isDone);

    let priorityBadge = task.priority === 'Tinggi'
      ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ios-red/10 text-ios-red border border-ios-red/20">Prioritas Tinggi</span>`
      : (task.priority === 'Sedang'
        ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ios-orange/10 text-ios-orange border border-ios-orange/20">Sedang</span>`
        : `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ios-green/10 text-ios-green border border-ios-green/20">Rendah</span>`);

    const formattedDeadline = task.deadline && !isNaN(new Date(task.deadline).getTime())
      ? new Date(task.deadline).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : '-';

    const stripe = isDone ? 'before:bg-ios-green' : (task.priority === 'Tinggi' ? 'before:bg-ios-red' : (task.priority === 'Sedang' ? 'before:bg-ios-orange' : 'before:bg-gray-300 dark:before:bg-gray-600'));

    return `
      <div id="task-card-${task.id}" class="group relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-1 ${stripe} p-4 sm:p-5 pl-5 sm:pl-6 rounded-2xl bg-white/80 dark:bg-ios-darkGray5/80 border border-gray-200/70 dark:border-gray-800/80 ios-glass ios-shadow transition-all ${isDone ? 'bg-gray-50/50 dark:bg-ios-darkGray5/50 border-ios-green/30' : 'hover:border-ios-blue/40'}">
        <div class="flex items-start gap-3.5">
          <label class="relative flex items-center justify-center cursor-pointer pt-0.5 group/check" title="${isDone ? 'Klik untuk membatalkan selesai (kembalikan ke Manajemen Tugas)' : 'Tandai selesai (pindahkan ke Tugas Selesai)'}">
            <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleComplete('${task.id}')" class="sr-only ios-checkbox">
            <div class="w-6 h-6 rounded-full border-2 ${isDone ? 'bg-ios-green border-ios-green' : 'border-gray-300 dark:border-gray-600 group-hover/check:border-ios-blue'} flex items-center justify-center transition-all shadow-sm">
              <i data-lucide="check" class="w-3.5 h-3.5 text-white stroke-[3] ${isDone ? 'block' : 'hidden'}"></i>
            </div>
          </label>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-ios-darkGray4 text-gray-600 dark:text-gray-300">${escapeHtml(task.category)}</span>
              ${priorityBadge}
              <span class="px-2.5 py-0.5 rounded-full text-xs border ${deadlineStatus.colorClass}">
                <i data-lucide="${isDone ? 'check-circle-2' : 'clock'}" class="w-3 h-3 inline-block -mt-0.5 mr-1"></i>${deadlineStatus.label}
              </span>
            </div>

            <h4 class="text-base font-semibold text-gray-900 dark:text-white ${isDone ? 'line-through text-gray-500 dark:text-gray-400' : ''}">${escapeHtml(task.title)}</h4>
            ${noteBlockHtml('task:' + task.id, task.notes, false)}

            <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                ${task.worksheet_url ? `<a href="${escapeHtml(task.worksheet_url)}" target="_blank" class="px-3 py-1.5 rounded-xl text-xs font-medium bg-ios-blue/10 text-ios-blue hover:bg-ios-blue hover:text-white transition-all flex items-center gap-1.5"><i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i><span>Kertas Kerja</span></a>` : ''}
                ${task.evidence_url ? `<a href="${escapeHtml(task.evidence_url)}" target="_blank" class="px-3 py-1.5 rounded-xl text-xs font-medium bg-ios-purple/10 text-ios-purple hover:bg-ios-purple hover:text-white transition-all flex items-center gap-1.5"><i data-lucide="folder-check" class="w-3.5 h-3.5"></i><span>File Eviden</span></a>` : ''}
              </div>

              <div class="flex items-center gap-3 ml-auto text-xs text-ios-gray">
                <span class="hidden sm:inline">Target: ${formattedDeadline}</span>
                <div class="flex items-center gap-1">
                  <button onclick="openTaskModal('${task.id}')" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-ios-blue transition-colors" title="Edit"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                  <button onclick="deleteTask('${task.id}')" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-ios-red transition-colors" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initIcons();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const urgent = tasks.filter(t => !t.completed && (new Date(t.deadline) - new Date()) / (1000 * 60 * 60) <= 48).length;

  if (document.getElementById('stat-total')) document.getElementById('stat-total').textContent = total;
  if (document.getElementById('stat-urgent')) document.getElementById('stat-urgent').textContent = urgent;
  if (document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = pending;
  if (document.getElementById('stat-completed')) document.getElementById('stat-completed').textContent = completed;

  if (document.getElementById('badgeActiveCount')) document.getElementById('badgeActiveCount').textContent = pending;
  if (document.getElementById('badgeCompletedCount')) document.getElementById('badgeCompletedCount').textContent = completed;
}

function initIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggle');
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      initIcons();
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

// Window Globals
window.toggleModal = toggleModal;
window.openTaskModal = openTaskModal;
window.openBookmarkModal = openBookmarkModal;
window.saveTask = saveTask;
window.saveBookmark = saveBookmark;
window.deleteBookmark = deleteBookmark;
window.toggleComplete = toggleComplete;
window.deleteTask = deleteTask;
window.setFilter = setFilter;
window.switchMainView = switchMainView;
window.toggleGroup = toggleGroup;
window.toggleNote = toggleNote;
window.toggleSidebar = toggleSidebar;
window.handleLogin = handleLogin;
window.cycleSort = cycleSort;
window.openAiWindow = openAiWindow;
window.openUserModal = openUserModal;
window.createUserAccount = createUserAccount;
window.generatePassword = generatePassword;
window.toggleUserPw = toggleUserPw;
window.handleLogout = handleLogout;
window.togglePassword = togglePassword;
window.setDayFilter = setDayFilter;
window.setLayout = setLayout;
window.renderFilterButtons = renderFilterButtons;
window.renderTasks = renderTasks;
window.loadLinks = loadLinks;
window.renderLinks = renderLinks;

// ------------------- LOGIN & SESI -------------------
let currentUser = null;
let manualLogout = false;

function el(id) { return document.getElementById(id); }

// state: 'checking' (memeriksa sesi) | 'form' (tampilkan login) | 'app' (dashboard)
function setAuthState(state, message) {
  el('loginScreen').classList.toggle('hidden', state === 'app');
  el('appShell').classList.toggle('hidden', state !== 'app');
  el('loginChecking').classList.toggle('hidden', state !== 'checking');
  el('loginFormWrap').classList.toggle('hidden', state !== 'form');

  if (state === 'form') {
    el('loginPassword').value = '';
    showLoginError(message || '');
    setLoginBusy(false);
    setTimeout(() => { const f = el('loginEmail'); if (f) f.focus(); }, 50);
  }
}

function showLoginError(message) {
  const box = el('loginError');
  if (!box) return;
  box.textContent = message || '';
  box.classList.toggle('hidden', !message);
}

function setLoginBusy(busy) {
  const btn = el('loginSubmit');
  if (!btn) return;
  btn.disabled = busy;
  btn.textContent = busy ? 'Memeriksa...' : 'Masuk';
}

function togglePassword() {
  const input = el('loginPassword');
  const btn = el('loginTogglePw');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Sembunyikan' : 'Tampilkan';
}

function authErrorMessage(err) {
  const msg = String((err && (err.message || err.error_description)) || err || '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Email atau kata sandi salah.';
  if (msg.includes('email not confirmed')) return 'Akun belum dikonfirmasi. Minta admin mengonfirmasi akun ini di Supabase.';
  if (msg.includes('rate limit') || msg.includes('too many') || (err && err.status === 429)) return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to')) return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  return 'Gagal masuk. Coba lagi beberapa saat.';
}

async function handleLogin(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (!supabaseClient) {
    showLoginError('Layanan login belum termuat. Periksa koneksi internet lalu muat ulang halaman.');
    return;
  }

  const email = el('loginEmail').value.trim();
  const password = el('loginPassword').value;
  if (!email || !password) {
    showLoginError('Isi email dan kata sandi terlebih dahulu.');
    return;
  }

  showLoginError('');
  setLoginBusy(true);
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    el('loginPassword').value = '';
    startApp(data.user);
  } catch (err) {
    showLoginError(authErrorMessage(err));
  } finally {
    setLoginBusy(false);
  }
}

async function handleLogout() {
  if (!confirm('Keluar dari K_Work?')) return;
  manualLogout = true;
  try {
    if (supabaseClient) await supabaseClient.auth.signOut();
  } catch (err) {
    console.warn('Gagal keluar:', err);
  }
  // Jika event SIGNED_OUT tidak datang (mis. koneksi putus), tetap kembali ke layar login
  if (currentUser) onSignedOut();
}

// Hapus cadangan data di browser agar tidak bisa dibaca orang berikutnya di perangkat yang sama
function clearLocalBackups() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('office_') && k.endsWith('_backup'))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* abaikan */ }
}

function onSignedOut() {
  const expired = !manualLogout && currentUser !== null;
  manualLogout = false;
  currentUser = null;

  tasks = [];
  linkLists = {};
  dayFilter = null;
  isAdmin = false;
  const manageBtn = el('manageUsersBtn');
  if (manageBtn) manageBtn.classList.add('hidden');
  clearLocalBackups();

  ['taskModal', 'bookmarkModal', 'prdModal', 'userModal'].forEach(id => { const m = el(id); if (m) m.classList.add('hidden'); });
  toggleSidebar(false);
  try { history.replaceState(null, '', window.location.pathname); } catch (e) { /* abaikan */ }

  setAuthState('form', expired ? 'Sesi Anda telah berakhir. Silakan masuk kembali.' : '');
}

function startApp(user) {
  currentUser = user;
  const email = (user && user.email) || '';
  el('userEmail').textContent = email || 'Pengguna';
  el('userEmail').title = email;
  el('userAvatar').textContent = (email.charAt(0) || 'U').toUpperCase();

  setAuthState('app');
  currentView = 'tasks';
  loadTasks();
  checkAdmin();
  handleRoute();
  initIcons();
}

async function initAuth() {
  setAuthState('checking');

  if (!supabaseClient) {
    setAuthState('form', 'Layanan login belum termuat. Periksa koneksi internet lalu muat ulang halaman.');
    return;
  }

  // Sesi berakhir / keluar dari tab lain -> kembali ke layar login (jangan memanggil Supabase di dalam callback ini)
  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT' && currentUser) onSignedOut();
  });

  try {
    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session) startApp(data.session.user);
    else setAuthState('form');
  } catch (err) {
    setAuthState('form', authErrorMessage(err));
  }
}

// ------------------- KELOLA AKUN (HANYA ADMIN) -------------------
let isAdmin = false;

// Tombol "Kelola Akun" hanya muncul untuk admin (fungsi is_admin() di database)
async function checkAdmin() {
  isAdmin = false;
  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.rpc('is_admin');
      isAdmin = !error && data === true;
    }
  } catch (e) { /* abaikan: anggap bukan admin */ }
  const btn = el('manageUsersBtn');
  if (btn) btn.classList.toggle('hidden', !isAdmin);
}

// Pembuatan akun dilakukan oleh Edge Function "admin-users" (memakai kunci rahasia di server, bukan di browser)
async function callAdminUsers(body) {
  if (!supabaseClient) throw new Error('Layanan belum termuat. Muat ulang halaman.');
  const { data, error } = await supabaseClient.functions.invoke('admin-users', { body });

  if (error) {
    let msg = 'Gagal menghubungi server. Coba lagi.';
    const ctx = error.context;
    if (ctx && typeof ctx.status === 'number') {
      if (ctx.status === 404) {
        msg = 'Fungsi "admin-users" belum dipasang di Supabase. Ikuti langkah pemasangan fungsi.';
      } else {
        try {
          const body = await ctx.json();
          if (body && body.error) msg = body.error;
        } catch (e) { /* pakai pesan bawaan */ }
      }
    }
    throw new Error(msg);
  }
  if (data && data.error) throw new Error(data.error);
  return data;
}

function showUserError(message) {
  const box = el('userFormError');
  if (!box) return;
  box.textContent = message || '';
  box.classList.toggle('hidden', !message);
}

function openUserModal() {
  if (!isAdmin) return;
  const form = el('userForm');
  if (form) form.reset();
  showUserError('');
  el('newUserPassword').type = 'password';
  el('newUserPassword2').type = 'password';
  el('userTogglePw').textContent = 'Tampilkan';
  toggleModal('userModal');
  loadUsers();
}

function toggleUserPw() {
  const a = el('newUserPassword');
  const b = el('newUserPassword2');
  const show = a.type === 'password';
  a.type = show ? 'text' : 'password';
  b.type = show ? 'text' : 'password';
  el('userTogglePw').textContent = show ? 'Sembunyikan' : 'Tampilkan';
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  const pw = Array.from(bytes, n => chars[n % chars.length]).join('');
  el('newUserPassword').value = pw;
  el('newUserPassword2').value = pw;
  el('newUserPassword').type = 'text';
  el('newUserPassword2').type = 'text';
  el('userTogglePw').textContent = 'Sembunyikan';
  showUserError('');
}

async function loadUsers() {
  const list = el('userList');
  if (!list) return;
  list.innerHTML = '<p class="text-xs text-ios-gray">Memuat daftar akun...</p>';
  try {
    const data = await callAdminUsers({ action: 'list' });
    const users = (data && data.users) || [];
    if (users.length === 0) {
      list.innerHTML = '<p class="text-xs text-ios-gray">Belum ada akun.</p>';
      return;
    }
    const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    list.innerHTML = users.map(u => `
      <div class="flex items-center justify-between gap-3 rounded-xl bg-gray-50 dark:bg-ios-darkGray4/60 px-3.5 py-2.5">
        <div class="min-w-0">
          <p class="text-sm font-semibold truncate">${escapeHtml(u.email || '(tanpa email)')}</p>
          <p class="text-[11px] text-ios-gray">Dibuat ${fmt(u.created_at)} · Terakhir masuk ${fmt(u.last_sign_in_at)}</p>
        </div>
        ${u.is_admin ? '<span class="shrink-0 px-2 py-0.5 rounded-full bg-ios-blue/10 text-ios-blue text-[11px] font-semibold">Admin</span>' : ''}
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-xs text-ios-red">${escapeHtml(err.message)}</p>`;
  }
}

async function createUserAccount(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const email = el('newUserEmail').value.trim().toLowerCase();
  const pw = el('newUserPassword').value;
  const pw2 = el('newUserPassword2').value;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showUserError('Masukkan alamat email yang valid.'); return; }
  if (pw.length < 8) { showUserError('Kata sandi minimal 8 karakter.'); return; }
  if (pw !== pw2) { showUserError('Kata sandi dan pengulangannya tidak sama.'); return; }

  showUserError('');
  const btn = el('userSubmit');
  btn.disabled = true;
  btn.textContent = 'Menambahkan...';
  try {
    await callAdminUsers({ action: 'create', email, password: pw });
    showToast(`Akun ${email} berhasil ditambahkan ✨`);
    el('userForm').reset();
    el('newUserPassword').type = 'password';
    el('newUserPassword2').type = 'password';
    el('userTogglePw').textContent = 'Tampilkan';
    loadUsers();
  } catch (err) {
    showUserError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Tambah Akun';
  }
}

// ------------------- INISIALISASI -------------------
// Routing lewat hash, mis. index.html#psk atau #bookmark. Hash lama (#ekinerja, #eset, #rekap, #completed) tetap berfungsi.
function handleRoute() {
  if (!currentUser) return;
  const key = window.location.hash.replace('#', '');
  switchMainView(VIEWS[key] ? key : 'tasks');
}

function initApp() {
  initIcons();
  initTheme();
  renderSidebar();
  renderFilterButtons();

  window.addEventListener('hashchange', handleRoute);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleSidebar(false); });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTasks();
    });
  }

  // Dashboard baru dimuat setelah sesi login terverifikasi
  initAuth();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
