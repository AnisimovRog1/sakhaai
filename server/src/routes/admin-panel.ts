import { Router, Request, Response } from 'express';

export const adminPanelRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sakhaai2026';

// Проверка пароля
adminPanelRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Неверный пароль' });
  }
});

// Главная страница админки
adminPanelRouter.get('/', (_req: Request, res: Response) => {
  res.type('text/html').send(PANEL_HTML);
});

const PANEL_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SakhaAI Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #070b14; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; }
    .card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 16px; padding: 20px; }
    .stat-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; padding: 16px; text-align: center; }
    .btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(to right, #7c3aed, #06b6d4); color: white; border: none; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-danger { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
    .btn-success { background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
    .btn-sm { padding: 4px 10px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 12px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.08); }
    td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
    input, select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 8px 12px; color: white; font-size: 14px; outline: none; }
    input:focus { border-color: rgba(139,92,246,0.5); }
    .tab { padding: 8px 16px; cursor: pointer; border-radius: 8px; font-weight: 600; font-size: 14px; color: #94a3b8; }
    .tab.active { background: linear-gradient(to right, #7c3aed, #06b6d4); color: white; }
    .hidden { display: none; }
    .login-box { max-width: 380px; margin: 120px auto; }
    .glow { box-shadow: 0 0 20px rgba(139,92,246,0.15); }
  </style>
</head>
<body>

<!-- LOGIN -->
<div id="loginPage" class="login-box">
  <div class="card glow text-center">
    <h1 class="text-2xl font-bold mb-2">🔐 SakhaAI Admin</h1>
    <p class="text-slate-400 text-sm mb-6">Введите пароль для входа</p>
    <input id="passInput" type="password" placeholder="Пароль" class="w-full mb-4" onkeydown="if(event.key==='Enter')login()">
    <button class="btn btn-primary w-full" onclick="login()">Войти</button>
    <p id="loginError" class="text-red-400 text-sm mt-3 hidden">Неверный пароль</p>
  </div>
</div>

<!-- PANEL -->
<div id="panelPage" class="hidden">
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
    <h1 class="text-lg font-bold">📊 SakhaAI Admin</h1>
    <div class="flex gap-2">
      <div class="tab active" onclick="showTab('dashboard')">Дашборд</div>
      <div class="tab" onclick="showTab('users')">Юзеры</div>
      <div class="tab" onclick="showTab('generations')">Генерации</div>
      <div class="tab" onclick="showTab('pushes')">Пуши</div>
    </div>
    <button class="text-slate-400 text-sm" onclick="logout()">Выйти</button>
  </div>

  <div class="p-6 max-w-6xl mx-auto">

    <!-- DASHBOARD -->
    <div id="tab-dashboard">
      <div class="flex gap-3 mb-6">
        <button class="btn btn-primary btn-sm" onclick="loadStats('today')">Сегодня</button>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.06);color:#94a3b8;border:1px solid rgba(255,255,255,0.1)" onclick="loadStats('7d')">7 дней</button>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.06);color:#94a3b8;border:1px solid rgba(255,255,255,0.1)" onclick="loadStats('month')">Месяц</button>
      </div>
      <div id="statsGrid" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card">
          <h3 class="text-sm font-bold text-slate-400 mb-3">🏆 Топ активных</h3>
          <div id="topActive"></div>
        </div>
        <div class="card">
          <h3 class="text-sm font-bold text-slate-400 mb-3">💎 Топ по кредитам</h3>
          <div id="topCredits"></div>
        </div>
      </div>
    </div>

    <!-- USERS -->
    <div id="tab-users" class="hidden">
      <div class="flex gap-3 mb-4">
        <input id="userSearch" placeholder="Поиск по username или ID..." class="flex-1" oninput="filterUsers()">
        <div class="flex gap-2">
          <input id="addCreditsId" placeholder="User ID" class="w-28">
          <input id="addCreditsAmount" placeholder="Кредиты" type="number" class="w-24">
          <button class="btn btn-success btn-sm" onclick="addCredits()">+ Начислить</button>
        </div>
      </div>
      <div class="card overflow-x-auto">
        <table>
          <thead><tr>
            <th>ID</th><th>Username</th><th>Имя</th><th>Кредиты</th><th>Статус</th><th>Регистрация</th><th>Действия</th>
          </tr></thead>
          <tbody id="usersTable"></tbody>
        </table>
      </div>
    </div>

    <!-- GENERATIONS -->
    <div id="tab-generations" class="hidden">
      <div class="flex gap-3 mb-4">
        <select id="genTypeFilter" onchange="loadGenerations()">
          <option value="">Все типы</option>
          <option value="image">Картинки</option>
          <option value="video">Видео</option>
          <option value="motion">Motion</option>
          <option value="avatar">Аватар</option>
        </select>
      </div>
      <div class="card overflow-x-auto">
        <table>
          <thead><tr>
            <th>ID</th><th>Юзер</th><th>Тип</th><th>Промпт</th><th>Стоимость</th><th>Дата</th>
          </tr></thead>
          <tbody id="genTable"></tbody>
        </table>
      </div>
    </div>

    <!-- PUSHES -->
    <div id="tab-pushes" class="hidden">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">Шаблоны пушей</h2>
        <button class="btn btn-primary btn-sm" onclick="loadPushLog()">📊 Лог рассылок</button>
      </div>
      <div id="pushTemplates"></div>
      <div id="pushLog" class="hidden mt-6">
        <h3 class="text-sm font-bold text-slate-400 mb-3">Последние рассылки</h3>
        <div id="pushLogList"></div>
      </div>
    </div>

  </div>
</div>

<script>
let TOKEN = localStorage.getItem('admin_token') || '';
const API = location.origin;

// ─── AUTH ───
async function login() {
  const pass = document.getElementById('passInput').value;
  try {
    const r = await fetch(API + '/panel/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({password:pass}) });
    const text = await r.text();
    let d;
    try { d = JSON.parse(text); } catch { alert('Ответ сервера: ' + text); return; }
    if (d.success) {
      TOKEN = d.token;
      localStorage.setItem('admin_token', TOKEN);
      document.getElementById('loginPage').classList.add('hidden');
      document.getElementById('panelPage').classList.remove('hidden');
      loadStats('today');
      loadUsers();
    } else {
      document.getElementById('loginError').classList.remove('hidden');
    }
  } catch(e) { alert('Ошибка: ' + e); }
}

function logout() {
  TOKEN = '';
  localStorage.removeItem('admin_token');
  location.reload();
}

async function api(path) {
  const r = await fetch(API + path, { headers: { 'Authorization': 'Bearer ' + TOKEN } });
  return r.json();
}
async function apiPost(path, data) {
  const r = await fetch(API + path, { method:'POST', headers: { 'Authorization':'Bearer '+TOKEN, 'Content-Type':'application/json' }, body: JSON.stringify(data) });
  return r.json();
}
async function apiDelete(path) {
  const r = await fetch(API + path, { method:'DELETE', headers: { 'Authorization':'Bearer '+TOKEN } });
  return r.json();
}

// ─── TABS ───
function showTab(name) {
  document.querySelectorAll('[id^=tab-]').forEach(el => el.classList.add('hidden'));
  document.getElementById('tab-' + name).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
  if (name === 'users') loadUsers();
  if (name === 'generations') loadGenerations();
  if (name === 'pushes') loadPushTemplates();
}

// ─── DASHBOARD ───
async function loadStats(period) {
  const s = await api('/admin/stats?period=' + period);
  document.getElementById('statsGrid').innerHTML = [
    stat('💰 Выручка', s.revenue + ' ₽', 'violet'),
    stat('📈 Прибыль', s.profit + ' ₽', s.profit >= 0 ? 'green' : 'red'),
    stat('📊 Маржа', s.margin + '%', 'cyan'),
    stat('👥 DAU', s.dau, 'blue'),
    stat('🆕 Новых', '+' + s.newUsers, 'green'),
    stat('📝 Запросов', s.transactions, 'slate'),
    stat('🎨 Генераций', s.generations, 'purple'),
    stat('🤝 Рефералов', '+' + s.referrals, 'amber'),
  ].join('');

  const topA = (s.topActive||[]).map((u,i) =>
    '<div class="flex justify-between py-1.5 text-sm"><span class="text-slate-300">' + (i+1) + '. ' + (u.username ? '@'+u.username : u.first_name) + '</span><span class="text-white font-bold">' + u.requests + ' запр.</span></div>'
  ).join('') || '<p class="text-slate-500 text-sm">Пусто</p>';
  document.getElementById('topActive').innerHTML = topA;

  const topC = (s.topUsers||[]).map((u,i) =>
    '<div class="flex justify-between py-1.5 text-sm"><span class="text-slate-300">' + (i+1) + '. ' + (u.username ? '@'+u.username : u.first_name) + '</span><span class="text-white font-bold">' + u.credits + ' кр.</span></div>'
  ).join('') || '<p class="text-slate-500 text-sm">Пусто</p>';
  document.getElementById('topCredits').innerHTML = topC;
}

function stat(label, value, color) {
  return '<div class="stat-card"><p class="text-xs text-slate-400 mb-1">' + label + '</p><p class="text-xl font-extrabold text-white">' + value + '</p></div>';
}

// ─── USERS ───
let allUsers = [];
async function loadUsers() {
  allUsers = await api('/admin/users');
  renderUsers(allUsers);
}

function renderUsers(users) {
  document.getElementById('usersTable').innerHTML = users.map(u =>
    '<tr>' +
    '<td class="text-slate-400 text-xs font-mono">' + u.id + '</td>' +
    '<td>' + (u.username ? '@'+u.username : '—') + '</td>' +
    '<td>' + u.first_name + '</td>' +
    '<td class="font-bold">' + u.credits + '</td>' +
    '<td>' + (u.is_banned ? '<span class="text-red-400">🚫</span>' : '<span class="text-green-400">✅</span>') + '</td>' +
    '<td class="text-slate-400 text-xs">' + new Date(u.created_at).toLocaleDateString('ru') + '</td>' +
    '<td class="flex gap-1">' +
      '<button class="btn btn-sm ' + (u.is_banned ? 'btn-success' : 'btn-danger') + '" onclick="toggleBan(' + u.id + ',' + !u.is_banned + ')">' + (u.is_banned ? 'Разбан' : 'Бан') + '</button>' +
    '</td></tr>'
  ).join('');
}

function filterUsers() {
  const q = document.getElementById('userSearch').value.toLowerCase();
  renderUsers(allUsers.filter(u => (u.username||'').toLowerCase().includes(q) || String(u.id).includes(q) || (u.first_name||'').toLowerCase().includes(q)));
}

async function toggleBan(userId, ban) {
  await apiPost('/admin/ban', { userId, ban });
  loadUsers();
}

async function addCredits() {
  const userId = document.getElementById('addCreditsId').value;
  const amount = document.getElementById('addCreditsAmount').value;
  if (!userId || !amount) { alert('Заполните ID и сумму'); return; }
  const r = await apiPost('/admin/addcredits', { userId: Number(userId), amount: Number(amount) });
  if (r.success) { alert('✅ Начислено! Баланс: ' + r.newBalance); loadUsers(); }
  else alert('Ошибка: ' + r.error);
}

// ─── GENERATIONS ───
async function loadGenerations() {
  const type = document.getElementById('genTypeFilter').value;
  // Use generations endpoint (requires user auth) — for admin, use direct query
  // For now, show message that this requires admin-specific endpoint
  document.getElementById('genTable').innerHTML = '<tr><td colspan="6" class="text-center text-slate-400 py-8">Загрузка...</td></tr>';
}

// ─── PUSHES ───
async function loadPushTemplates() {
  const tmpls = await api('/admin/push/templates');
  if (!Array.isArray(tmpls) || tmpls.length === 0) {
    document.getElementById('pushTemplates').innerHTML = '<div class="card text-center text-slate-400 py-8">Шаблонов нет. Создайте через бота: /push</div>';
    return;
  }
  document.getElementById('pushTemplates').innerHTML = tmpls.map(t => {
    const icon = t.schedule_type === 'daily' ? '📅' : t.schedule_type === 'welcome' ? '👋' : '📨';
    const media = t.media_type === 'photo' ? '📸' : t.media_type === 'video' ? '🎬' : '📝';
    const active = t.is_active ? '✅' : '⏸';
    return '<div class="card mb-3 flex items-center justify-between">' +
      '<div><span class="text-lg mr-2">' + active + ' ' + icon + ' ' + media + '</span><span class="font-bold">' + t.name + '</span>' +
      (t.send_time ? ' <span class="text-slate-400 text-sm">⏰ ' + t.send_time + '</span>' : '') +
      '<p class="text-slate-400 text-sm mt-1">' + (t.text||'').slice(0,80) + '</p></div>' +
      '<div class="flex gap-2">' +
        '<button class="btn btn-danger btn-sm" onclick="deletePush(' + t.id + ')">🗑</button>' +
      '</div></div>';
  }).join('');
}

async function deletePush(id) {
  if (!confirm('Удалить шаблон?')) return;
  await apiDelete('/admin/push/templates/' + id);
  loadPushTemplates();
}

async function loadPushLog() {
  const logs = await api('/admin/push/log');
  const el = document.getElementById('pushLog');
  el.classList.remove('hidden');
  document.getElementById('pushLogList').innerHTML = (!Array.isArray(logs) || logs.length === 0)
    ? '<p class="text-slate-400 text-sm">Рассылок пока не было</p>'
    : logs.map(l =>
        '<div class="flex justify-between py-2 text-sm border-b border-white/5">' +
        '<span>' + (l.template_name||'—') + '</span>' +
        '<span class="text-slate-400">' + new Date(l.started_at).toLocaleDateString('ru') + '</span>' +
        '<span>✅ ' + l.sent_count + ' ❌ ' + l.failed_count + '</span></div>'
      ).join('');
}

// ─── INIT ───
if (TOKEN) {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('panelPage').classList.remove('hidden');
  loadStats('today');
}
</script>
</body>
</html>`;
