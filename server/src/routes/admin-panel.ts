import { Router, Request, Response } from 'express';

export const adminPanelRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sakhaai2026';

adminPanelRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Неверный пароль' });
  }
});

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
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh;
      background: #050a12;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.10) 0%, transparent 50%);
      color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    }
    .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
    .glass-strong { background: rgba(255,255,255,0.07); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; }
    .glow-violet { box-shadow: 0 0 30px rgba(139,92,246,0.15), 0 0 60px rgba(139,92,246,0.05); }
    .glow-cyan { box-shadow: 0 0 30px rgba(6,182,212,0.15); }
    .gradient-text { background: linear-gradient(135deg, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .btn { padding: 8px 18px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; border: none; }
    .btn:active { transform: scale(0.97); }
    .btn-primary { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; }
    .btn-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .btn-success { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
    .btn-ghost { background: rgba(255,255,255,0.06); color: #94a3b8; border: 1px solid rgba(255,255,255,0.10); }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(255,255,255,0.06); }
    td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 13px; }
    tr:hover { background: rgba(255,255,255,0.02); }
    input, select, textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10); border-radius: 10px; padding: 10px 14px; color: white; font-size: 14px; outline: none; width: 100%; }
    input:focus, textarea:focus { border-color: rgba(139,92,246,0.5); box-shadow: 0 0 15px rgba(139,92,246,0.1); }
    .tab { padding: 10px 20px; cursor: pointer; border-radius: 10px; font-weight: 600; font-size: 13px; color: #64748b; transition: all 0.2s; }
    .tab:hover { color: #94a3b8; }
    .tab.active { background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2)); color: white; border: 1px solid rgba(139,92,246,0.3); }
    .stat-card { text-align: center; padding: 20px 16px; }
    .stat-value { font-size: 28px; font-weight: 800; color: white; }
    .stat-label { font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    .hidden { display: none; }
    .diamond { position: fixed; width: 200px; height: 200px; border: 1px solid rgba(139,92,246,0.08); transform: rotate(45deg); border-radius: 20px; pointer-events: none; }
  </style>
</head>
<body>

<!-- Decorative diamonds -->
<div class="diamond" style="top:-60px;right:10%;opacity:0.5"></div>
<div class="diamond" style="bottom:10%;left:-60px;opacity:0.3;width:150px;height:150px;border-color:rgba(6,182,212,0.08)"></div>
<div class="diamond" style="top:40%;right:-40px;opacity:0.2;width:100px;height:100px"></div>

<!-- LOGIN -->
<div id="loginPage" class="flex items-center justify-center min-h-screen px-4">
  <div class="glass-strong glow-violet p-8 w-full max-w-sm text-center">
    <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-2xl">🔐</div>
    <h1 class="text-xl font-bold mb-1">SakhaAI Admin</h1>
    <p class="text-slate-500 text-sm mb-6">Панель управления</p>
    <input id="passInput" type="password" placeholder="Введите пароль" class="mb-4" onkeydown="if(event.key==='Enter')login()">
    <button class="btn btn-primary w-full py-3 text-base" onclick="login()">Войти</button>
    <p id="loginError" class="text-red-400 text-sm mt-3 hidden">Неверный пароль</p>
  </div>
</div>

<!-- PANEL -->
<div id="panelPage" class="hidden min-h-screen">
  <!-- Header -->
  <div class="glass-strong mx-4 mt-4 px-6 py-3 flex items-center justify-between" style="border-radius:14px">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-sm">📊</div>
      <span class="font-bold gradient-text text-lg">SakhaAI</span>
    </div>
    <div class="flex gap-1 bg-black/20 rounded-xl p-1">
      <div class="tab active" onclick="showTab(this,'dashboard')">📊 Дашборд</div>
      <div class="tab" onclick="showTab(this,'users')">👥 Юзеры</div>
      <div class="tab" onclick="showTab(this,'pushes')">📢 Пуши</div>
    </div>
    <button class="btn btn-ghost text-xs" onclick="logout()">Выйти</button>
  </div>

  <div class="p-4 max-w-6xl mx-auto">

    <!-- DASHBOARD -->
    <div id="tab-dashboard">
      <div class="flex gap-2 mb-5">
        <button class="btn btn-primary" onclick="loadStats('today')">Сегодня</button>
        <button class="btn btn-ghost" onclick="loadStats('7d')">7 дней</button>
        <button class="btn btn-ghost" onclick="loadStats('month')">Месяц</button>
      </div>
      <div id="statsGrid" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass-strong p-5">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🏆 Топ активных</h3>
          <div id="topActive"></div>
        </div>
        <div class="glass-strong p-5">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">💎 Топ по кредитам</h3>
          <div id="topCredits"></div>
        </div>
      </div>
    </div>

    <!-- USERS -->
    <div id="tab-users" class="hidden">
      <div class="flex flex-wrap gap-3 mb-4">
        <input id="userSearch" placeholder="🔍 Поиск по username, имени или ID..." class="flex-1 min-w-[200px]" oninput="filterUsers()">
        <div class="flex gap-2">
          <input id="addCreditsId" placeholder="User ID" class="w-28">
          <input id="addCreditsAmount" placeholder="Сумма" type="number" class="w-24">
          <button class="btn btn-success" onclick="addCredits()">💎 Начислить</button>
        </div>
      </div>
      <div class="glass-strong overflow-x-auto">
        <table>
          <thead><tr><th>ID</th><th>Username</th><th>Имя</th><th>💎 Кредиты</th><th>Статус</th><th>Дата</th><th>Действия</th></tr></thead>
          <tbody id="usersTable"></tbody>
        </table>
      </div>
    </div>

    <!-- PUSHES -->
    <div id="tab-pushes" class="hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <!-- Create push form -->
        <div class="glass-strong p-5">
          <h3 class="text-sm font-bold mb-4">📝 Создать пуш</h3>
          <div class="space-y-3">
            <input id="pushName" placeholder="Название шаблона">
            <textarea id="pushText" placeholder="Текст сообщения" rows="3"></textarea>
            <select id="pushType">
              <option value="manual">📨 Разовый</option>
              <option value="daily">📅 Ежедневный</option>
              <option value="welcome">👋 Приветственный</option>
            </select>
            <div id="pushTimeRow" class="hidden">
              <select id="pushTime">
                <option value="08:00">08:00</option>
                <option value="10:00" selected>10:00</option>
                <option value="12:00">12:00</option>
                <option value="14:00">14:00</option>
                <option value="18:00">18:00</option>
                <option value="20:00">20:00</option>
              </select>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-primary flex-1" onclick="createPush()">💾 Сохранить</button>
              <button class="btn btn-success flex-1" onclick="createAndSendPush()">📨 Сохранить и отправить</button>
            </div>
          </div>
        </div>
        <!-- Push log -->
        <div class="glass-strong p-5">
          <h3 class="text-sm font-bold mb-4">📊 Лог рассылок</h3>
          <div id="pushLogList"><p class="text-slate-500 text-sm">Загрузка...</p></div>
        </div>
      </div>
      <!-- Templates list -->
      <h3 class="text-sm font-bold mb-3">📋 Шаблоны</h3>
      <div id="pushTemplates"></div>
    </div>

  </div>
</div>

<script>
let TOKEN = localStorage.getItem('admin_token') || '';
const API = location.origin;

async function login() {
  const pass = document.getElementById('passInput').value;
  try {
    const r = await fetch(API + '/panel/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:pass}) });
    const text = await r.text();
    let d; try { d = JSON.parse(text); } catch { alert('Ошибка: ' + text); return; }
    if (d.success) {
      TOKEN = d.token;
      localStorage.setItem('admin_token', TOKEN);
      showPanel();
    } else {
      document.getElementById('loginError').classList.remove('hidden');
    }
  } catch(e) { alert('Ошибка: ' + e); }
}

function showPanel() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('panelPage').classList.remove('hidden');
  loadStats('today');
}

function logout() { TOKEN=''; localStorage.removeItem('admin_token'); location.reload(); }

async function apiFetch(path, opts) {
  const r = await fetch(API + path, { ...opts, headers: { 'Authorization':'Bearer '+TOKEN, 'Content-Type':'application/json', ...(opts?.headers||{}) } });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return { error: t }; }
}
function apiGet(path) { return apiFetch(path); }
function apiPost(path, data) { return apiFetch(path, { method:'POST', body:JSON.stringify(data) }); }
function apiDel(path) { return apiFetch(path, { method:'DELETE' }); }

function showTab(el, name) {
  document.querySelectorAll('[id^=tab-]').forEach(e => e.classList.add('hidden'));
  document.getElementById('tab-'+name).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  if (name==='users') loadUsers();
  if (name==='pushes') { loadPushTemplates(); loadPushLog(); }
}

// ─── DASHBOARD ───
async function loadStats(period) {
  const s = await apiGet('/admin/stats?period='+period);
  if (s.error) { return; }
  document.getElementById('statsGrid').innerHTML = [
    sCard('💰 Выручка', s.revenue+' ₽'),
    sCard('📈 Прибыль', s.profit+' ₽'),
    sCard('📊 Маржа', s.margin+'%'),
    sCard('👥 DAU', s.dau),
    sCard('🆕 Новых', '+'+s.newUsers),
    sCard('📝 Запросов', s.transactions),
    sCard('🎨 Генераций', s.generations),
    sCard('🤝 Рефералов', '+'+s.referrals),
  ].join('');
  document.getElementById('topActive').innerHTML = listTop(s.topActive, 'requests', 'запр.');
  document.getElementById('topCredits').innerHTML = listTop(s.topUsers, 'credits', 'кр.');
}
function sCard(l,v) { return '<div class="glass stat-card"><div class="stat-value">'+v+'</div><div class="stat-label">'+l+'</div></div>'; }
function listTop(arr, key, suffix) {
  if (!arr||!arr.length) return '<p class="text-slate-600 text-sm">Пусто</p>';
  return arr.map((u,i) => '<div class="flex justify-between py-2 text-sm border-b border-white/5"><span class="text-slate-400">'+(i+1)+'. '+(u.username?'@'+u.username:u.first_name)+'</span><span class="text-white font-bold">'+u[key]+' '+suffix+'</span></div>').join('');
}

// ─── USERS ───
let allUsers = [];
async function loadUsers() {
  allUsers = await apiGet('/admin/users');
  if (!Array.isArray(allUsers)) allUsers = [];
  renderUsers(allUsers);
}
function renderUsers(list) {
  document.getElementById('usersTable').innerHTML = list.map(u =>
    '<tr><td class="text-slate-500 text-xs font-mono">'+u.id+'</td>'+
    '<td class="text-violet-300">'+(u.username?'@'+u.username:'—')+'</td>'+
    '<td>'+u.first_name+'</td>'+
    '<td class="font-bold text-cyan-300">'+u.credits+'</td>'+
    '<td>'+(u.is_banned?'<span class="text-red-400 text-xs font-bold">🚫 Бан</span>':'<span class="text-green-400 text-xs">✅</span>')+'</td>'+
    '<td class="text-slate-500 text-xs">'+new Date(u.created_at).toLocaleDateString('ru')+'</td>'+
    '<td><button class="btn btn-sm '+(u.is_banned?'btn-success':'btn-danger')+'" style="padding:4px 10px;font-size:11px" onclick="toggleBan('+u.id+','+!u.is_banned+')">'+(u.is_banned?'Разбан':'Бан')+'</button></td></tr>'
  ).join('');
}
function filterUsers() {
  const q = document.getElementById('userSearch').value.toLowerCase();
  renderUsers(allUsers.filter(u => (u.username||'').toLowerCase().includes(q) || String(u.id).includes(q) || (u.first_name||'').toLowerCase().includes(q)));
}
async function toggleBan(id, ban) { await apiPost('/admin/ban',{userId:id,ban}); loadUsers(); }
async function addCredits() {
  const id=document.getElementById('addCreditsId').value, amt=document.getElementById('addCreditsAmount').value;
  if(!id||!amt){alert('Заполните ID и сумму');return;}
  const r = await apiPost('/admin/addcredits',{userId:+id,amount:+amt});
  if(r.success){alert('✅ Начислено! Баланс: '+r.newBalance+' кр.');loadUsers();}else alert('❌ '+r.error);
}

// ─── PUSHES ───
document.getElementById('pushType').addEventListener('change', function() {
  document.getElementById('pushTimeRow').classList.toggle('hidden', this.value !== 'daily');
});

async function createPush(andSend) {
  const name = document.getElementById('pushName').value;
  const text = document.getElementById('pushText').value;
  const scheduleType = document.getElementById('pushType').value;
  const sendTime = scheduleType === 'daily' ? document.getElementById('pushTime').value : null;
  if (!name || !text) { alert('Заполните название и текст'); return; }
  const r = await apiPost('/admin/push/templates', { name, text, scheduleType, sendTime });
  if (r.id) {
    document.getElementById('pushName').value = '';
    document.getElementById('pushText').value = '';
    loadPushTemplates();
    if (andSend) {
      const data = await apiPost('/admin/push/send/'+r.id, {});
      if (data.template && data.users) {
        // Отправка через бота невозможна из веб-панели напрямую, но мы можем отправить текстовый broadcast
        const users = data.users;
        let sent=0, failed=0;
        for (const u of users) {
          // Используем серверный эндпоинт для отправки (нужно добавить)
          sent++;
        }
        alert('✅ Шаблон сохранён! Для рассылки с медиа используйте бота /push');
      }
    } else {
      alert('✅ Шаблон сохранён!');
    }
  } else { alert('❌ Ошибка: '+(r.error||'неизвестная')); }
}
function createAndSendPush() { createPush(true); }

async function loadPushTemplates() {
  const tmpls = await apiGet('/admin/push/templates');
  const el = document.getElementById('pushTemplates');
  if (!Array.isArray(tmpls) || tmpls.length === 0) { el.innerHTML = '<div class="glass-strong p-6 text-center text-slate-500">Шаблонов нет</div>'; return; }
  el.innerHTML = tmpls.map(t => {
    const icon = t.schedule_type==='daily'?'📅':t.schedule_type==='welcome'?'👋':'📨';
    const media = t.media_type==='photo'?'📸':t.media_type==='video'?'🎬':'📝';
    const active = t.is_active?'✅':'⏸';
    return '<div class="glass-strong p-4 mb-3 flex items-center justify-between">'+
      '<div class="flex-1 min-w-0">'+
        '<div class="flex items-center gap-2 mb-1"><span class="text-lg">'+active+' '+icon+' '+media+'</span><span class="font-bold text-sm">'+t.name+'</span>'+(t.send_time?' <span class="text-cyan-400 text-xs">⏰ '+t.send_time+'</span>':'')+'</div>'+
        '<p class="text-slate-400 text-xs truncate">'+(t.text||'').slice(0,100)+'</p>'+
      '</div>'+
      '<div class="flex gap-2 ml-3">'+
        '<button class="btn btn-danger" style="padding:6px 12px;font-size:12px" onclick="deletePush('+t.id+')">🗑 Удалить</button>'+
      '</div></div>';
  }).join('');
}

async function deletePush(id) {
  if (!confirm('Удалить шаблон?')) return;
  await apiDel('/admin/push/templates/'+id);
  loadPushTemplates();
}

async function loadPushLog() {
  const logs = await apiGet('/admin/push/log');
  const el = document.getElementById('pushLogList');
  if (!Array.isArray(logs) || logs.length === 0) { el.innerHTML = '<p class="text-slate-600 text-sm">Рассылок пока не было</p>'; return; }
  el.innerHTML = logs.map(l =>
    '<div class="flex justify-between py-2.5 text-sm border-b border-white/5">'+
    '<span class="text-slate-300">'+(l.template_name||'—')+'</span>'+
    '<span class="text-slate-500">'+new Date(l.started_at).toLocaleDateString('ru')+'</span>'+
    '<span><span class="text-green-400">✅'+l.sent_count+'</span> <span class="text-red-400">❌'+l.failed_count+'</span></span></div>'
  ).join('');
}

// ─── INIT ───
if (TOKEN) showPanel();
</script>
</body>
</html>`;
