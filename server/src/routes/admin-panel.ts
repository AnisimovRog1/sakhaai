import { Router, Request, Response } from 'express';

export const adminPanelRouter = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sakhaai2026';

adminPanelRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) res.json({ success: true, token: ADMIN_PASSWORD });
  else res.status(401).json({ error: 'Неверный пароль' });
});

adminPanelRouter.get('/', (_req: Request, res: Response) => {
  res.type('text/html').send(HTML);
});

const HTML = `<!DOCTYPE html>
<html lang="ru"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UraanxAI Admin</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
*{box-sizing:border-box;margin:0}
body{min-height:100vh;background:#040810;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;overflow-x:hidden}

/* Animated background */
body::before{content:'';position:fixed;inset:0;z-index:0;
  background:radial-gradient(ellipse at 20% 40%,rgba(139,92,246,.18) 0%,transparent 50%),
  radial-gradient(ellipse at 80% 20%,rgba(6,182,212,.14) 0%,transparent 50%),
  radial-gradient(ellipse at 50% 90%,rgba(59,130,246,.10) 0%,transparent 40%);
  animation:bgPulse 8s ease-in-out infinite alternate}
@keyframes bgPulse{0%{opacity:.8}100%{opacity:1.2}}

/* Watermark */
body::after{content:'UraanxAI';position:fixed;bottom:30%;left:50%;transform:translateX(-50%);
  font-size:min(18vw,200px);font-weight:900;letter-spacing:-0.03em;
  background:linear-gradient(135deg,rgba(139,92,246,.06),rgba(6,182,212,.06));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;pointer-events:none;z-index:0}

.rel{position:relative;z-index:1}

/* Glass cards */
.glass{background:rgba(255,255,255,.04);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.08);border-radius:16px}
.glass-strong{background:rgba(255,255,255,.07);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.12);border-radius:16px}
.glass-neon{background:rgba(139,92,246,.06);backdrop-filter:blur(24px);border:1px solid rgba(139,92,246,.2);border-radius:16px;
  box-shadow:0 0 30px rgba(139,92,246,.08),inset 0 0 30px rgba(139,92,246,.03)}
.glass-cyan{background:rgba(6,182,212,.06);backdrop-filter:blur(24px);border:1px solid rgba(6,182,212,.2);border-radius:16px;
  box-shadow:0 0 30px rgba(6,182,212,.08)}

/* Animated gradient border */
@keyframes borderGlow{0%{border-color:rgba(139,92,246,.3)}50%{border-color:rgba(6,182,212,.3)}100%{border-color:rgba(139,92,246,.3)}}
.glow-border{animation:borderGlow 4s ease-in-out infinite}

/* Stat cards */
.stat-card{text-align:center;padding:24px 16px;transition:transform .2s,box-shadow .2s}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(139,92,246,.15)}
.stat-value{font-size:32px;font-weight:800;background:linear-gradient(135deg,#fff,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-label{font-size:11px;color:#64748b;margin-top:6px;text-transform:uppercase;letter-spacing:.08em}

/* Animated emoji */
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
.anim-bounce{display:inline-block;animation:bounce 2s ease-in-out infinite}
.anim-spin{display:inline-block;animation:spin 3s linear infinite}
.anim-pulse{display:inline-block;animation:pulse 2s ease-in-out infinite}

/* Gradient text */
.gradient-text{background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}

/* Buttons */
.btn{padding:10px 20px;border-radius:12px;font-weight:600;font-size:13px;cursor:pointer;transition:all .2s;border:none}
.btn:active{transform:scale(.96)}
.btn-primary{background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;box-shadow:0 4px 15px rgba(139,92,246,.25)}
.btn-primary:hover{box-shadow:0 6px 25px rgba(139,92,246,.35)}
.btn-danger{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2)}
.btn-success{background:rgba(34,197,94,.12);color:#4ade80;border:1px solid rgba(34,197,94,.2)}
.btn-ghost{background:rgba(255,255,255,.05);color:#94a3b8;border:1px solid rgba(255,255,255,.08)}

/* Table */
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:14px;color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:.1em;border-bottom:1px solid rgba(255,255,255,.06)}
td{padding:14px;border-bottom:1px solid rgba(255,255,255,.03);font-size:13px}
tr{transition:background .2s;cursor:pointer}
tr:hover{background:rgba(139,92,246,.05)}

/* Inputs */
input,select,textarea{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px 16px;color:#fff;font-size:14px;outline:none;width:100%;transition:border .2s,box-shadow .2s}
input:focus,textarea:focus{border-color:rgba(139,92,246,.5);box-shadow:0 0 20px rgba(139,92,246,.1)}

/* Tabs */
.tab{padding:10px 20px;cursor:pointer;border-radius:12px;font-weight:600;font-size:13px;color:#475569;transition:all .3s}
.tab:hover{color:#94a3b8}
.tab.active{background:linear-gradient(135deg,rgba(139,92,246,.25),rgba(6,182,212,.15));color:#fff;border:1px solid rgba(139,92,246,.3);box-shadow:0 0 20px rgba(139,92,246,.1)}

.hidden{display:none}

/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);z-index:50;display:flex;align-items:center;justify-content:center}
.modal{max-width:480px;width:90%;max-height:80vh;overflow-y:auto}

/* Live indicator */
@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.3}}
.live-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;animation:livePulse 2s infinite}
</style>
</head><body>

<!-- LOGIN -->
<div id="loginPage" class="rel flex items-center justify-center min-h-screen px-4">
  <div class="glass-neon glow-border p-10 w-full max-w-sm text-center">
    <div class="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-3xl anim-pulse">💎</div>
    <h1 class="text-2xl font-bold gradient-text mb-1">UraanxAI</h1>
    <p class="text-slate-500 text-sm mb-6">Панель управления</p>
    <input id="passInput" type="password" placeholder="🔑 Введите пароль" class="mb-4" onkeydown="if(event.key==='Enter')login()">
    <button class="btn btn-primary w-full py-3 text-base" onclick="login()">Войти</button>
    <p id="loginError" class="text-red-400 text-sm mt-3 hidden">Неверный пароль</p>
  </div>
</div>

<!-- PANEL -->
<div id="panelPage" class="hidden rel min-h-screen">
  <div class="glass-strong mx-4 mt-4 px-6 py-3 flex items-center justify-between glow-border" style="border-radius:14px">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-lg anim-bounce">💎</div>
      <span class="font-bold gradient-text text-xl">UraanxAI</span>
    </div>
    <div class="flex gap-1 bg-black/30 rounded-xl p-1">
      <div class="tab active" onclick="showTab(this,'dashboard')"><span class="anim-pulse">📊</span> Дашборд</div>
      <div class="tab" onclick="showTab(this,'users')"><span class="anim-bounce">👥</span> Юзеры</div>
      <div class="tab" onclick="showTab(this,'pushes')"><span class="anim-spin">📢</span> Пуши</div>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5 text-xs text-green-400"><div class="live-dot"></div>Live</div>
      <button class="btn btn-ghost text-xs" onclick="logout()">Выйти</button>
    </div>
  </div>

  <div class="p-4 max-w-7xl mx-auto">

    <!-- DASHBOARD -->
    <div id="tab-dashboard">
      <div class="flex items-center gap-3 mb-5">
        <button class="btn btn-primary" onclick="loadStats('today')"><span class="anim-pulse">📊</span> Сегодня</button>
        <button class="btn btn-ghost" onclick="loadStats('7d')">📅 7 дней</button>
        <button class="btn btn-ghost" onclick="loadStats('month')">📆 Месяц</button>
        <div class="ml-auto text-xs text-slate-500" id="lastUpdate"></div>
      </div>
      <div id="statsGrid" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass-neon p-5"><h3 class="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3"><span class="anim-bounce">🏆</span> Топ активных</h3><div id="topActive"></div></div>
        <div class="glass-cyan p-5"><h3 class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3"><span class="anim-pulse">💎</span> Топ по кредитам</h3><div id="topCredits"></div></div>
      </div>
    </div>

    <!-- USERS -->
    <div id="tab-users" class="hidden">
      <div class="flex flex-wrap gap-3 mb-4">
        <input id="userSearch" placeholder="🔍 Поиск..." class="flex-1 min-w-[200px]" oninput="filterUsers()">
        <div class="flex gap-2">
          <input id="addCreditsId" placeholder="User ID" class="w-28">
          <input id="addCreditsAmount" placeholder="Сумма" type="number" class="w-24">
          <button class="btn btn-success" onclick="addCredits()"><span class="anim-bounce">💎</span> Начислить</button>
        </div>
      </div>
      <div class="glass-strong overflow-x-auto">
        <table><thead><tr><th>ID</th><th>Username</th><th>Имя</th><th><span class="anim-pulse">💎</span> Кредиты</th><th>Статус</th><th>TZ</th><th>Дата</th><th>Действия</th></tr></thead>
        <tbody id="usersTable"></tbody></table>
      </div>
    </div>

    <!-- PUSHES -->
    <div id="tab-pushes" class="hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div class="glass-neon p-5">
          <h3 class="text-sm font-bold mb-4"><span class="anim-bounce">📝</span> Создать пуш</h3>
          <div class="space-y-3">
            <input id="pushName" placeholder="Название шаблона">
            <textarea id="pushText" placeholder="Текст сообщения" rows="3"></textarea>
            <select id="pushType" onchange="document.getElementById('pushTimeRow').classList.toggle('hidden',this.value!=='daily')">
              <option value="manual">📨 Разовый</option>
              <option value="daily">📅 Ежедневный</option>
              <option value="welcome">👋 Приветственный</option>
            </select>
            <div id="pushTimeRow" class="hidden">
              <select id="pushTime"><option value="08:00">08:00</option><option value="10:00" selected>10:00</option><option value="12:00">12:00</option><option value="14:00">14:00</option><option value="18:00">18:00</option><option value="20:00">20:00</option></select>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-primary flex-1" onclick="createPush(false)">💾 Сохранить</button>
              <button class="btn btn-success flex-1" onclick="createPush(true)">📨 Отправить</button>
            </div>
          </div>
        </div>
        <div class="glass-cyan p-5">
          <h3 class="text-sm font-bold mb-4"><span class="anim-spin">📊</span> Лог рассылок</h3>
          <div id="pushLogList"></div>
        </div>
      </div>
      <h3 class="text-sm font-bold mb-3"><span class="anim-pulse">📋</span> Шаблоны</h3>
      <div id="pushTemplates"></div>
    </div>

  </div>
</div>

<!-- USER MODAL -->
<div id="userModal" class="modal-bg hidden" onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="modal glass-neon glow-border p-6" id="userModalContent"></div>
</div>

<script>
let TOKEN=localStorage.getItem('at')||'';
const API=location.origin;
let autoRefresh=null;

async function login(){
  const p=document.getElementById('passInput').value;
  try{const r=await fetch(API+'/panel/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:p})});
  const t=await r.text();let d;try{d=JSON.parse(t)}catch{alert(t);return}
  if(d.success){TOKEN=d.token;localStorage.setItem('at',TOKEN);showPanel()}
  else document.getElementById('loginError').classList.remove('hidden')}catch(e){alert(e)}
}
function showPanel(){document.getElementById('loginPage').classList.add('hidden');document.getElementById('panelPage').classList.remove('hidden');loadStats('today');startAutoRefresh()}
function logout(){TOKEN='';localStorage.removeItem('at');clearInterval(autoRefresh);location.reload()}

async function apiFetch(p,o){const r=await fetch(API+p,{...o,headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json',...(o?.headers||{})}});const t=await r.text();try{return JSON.parse(t)}catch{return{error:t}}}
function G(p){return apiFetch(p)}
function P(p,d){return apiFetch(p,{method:'POST',body:JSON.stringify(d)})}
function D(p){return apiFetch(p,{method:'DELETE'})}

function showTab(el,n){document.querySelectorAll('[id^=tab-]').forEach(e=>e.classList.add('hidden'));document.getElementById('tab-'+n).classList.remove('hidden');document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));el.classList.add('active');if(n==='users')loadUsers();if(n==='pushes'){loadPushTemplates();loadPushLog()}}

// Auto-refresh every 30 sec
function startAutoRefresh(){autoRefresh=setInterval(()=>loadStats(currentPeriod),30000)}
let currentPeriod='today';

async function loadStats(period){
  currentPeriod=period;
  const s=await G('/admin/stats?period='+period);if(s.error)return;
  document.getElementById('lastUpdate').textContent='Обновлено: '+new Date().toLocaleTimeString('ru');
  document.getElementById('statsGrid').innerHTML=[
    sc('💰','Выручка',s.revenue+' ₽','neon'),sc('📈','Прибыль',s.profit+' ₽','neon'),
    sc('📊','Маржа',s.margin+'%','cyan'),sc('👥','DAU',s.dau,'cyan'),
    sc('🆕','Новых','+'+s.newUsers,'neon'),sc('📝','Запросов',s.transactions,'cyan'),
    sc('🎨','Генераций',s.generations,'neon'),sc('🤝','Рефералов','+'+s.referrals,'cyan'),
  ].join('');
  document.getElementById('topActive').innerHTML=topList(s.topActive,'requests','запр.');
  document.getElementById('topCredits').innerHTML=topList(s.topUsers,'credits','кр.');
}
function sc(emoji,label,value,type){return '<div class="glass'+(type==='neon'?'-neon':'-cyan')+' stat-card"><div class="text-lg mb-1 anim-bounce">'+emoji+'</div><div class="stat-value">'+value+'</div><div class="stat-label">'+label+'</div></div>'}
function topList(arr,key,suf){if(!arr||!arr.length)return'<p class="text-slate-600 text-sm">Пусто</p>';return arr.map((u,i)=>'<div class="flex justify-between py-2.5 text-sm border-b border-white/5"><span class="text-slate-400">'+(i+1)+'. '+(u.username?'@'+u.username:u.first_name)+'</span><span class="font-bold gradient-text">'+u[key]+' '+suf+'</span></div>').join('')}

// USERS
let allUsers=[];
async function loadUsers(){allUsers=await G('/admin/users');if(!Array.isArray(allUsers))allUsers=[];renderUsers(allUsers)}
function renderUsers(list){
  document.getElementById('usersTable').innerHTML=list.map(u=>
    '<tr onclick="showUser('+u.id+')"><td class="text-slate-500 text-xs font-mono">'+u.id+'</td>'+
    '<td class="text-violet-300 font-medium">'+(u.username?'@'+u.username:'—')+'</td>'+
    '<td>'+u.first_name+'</td>'+
    '<td class="font-bold gradient-text">'+u.credits+'</td>'+
    '<td>'+(u.is_banned?'<span class="text-red-400 text-xs font-bold">🚫</span>':'<span class="text-green-400 text-xs">✅</span>')+'</td>'+
    '<td class="text-slate-500 text-xs">UTC'+(u.timezone_offset>=0?'+':'')+Math.round((u.timezone_offset||540)/60)+'</td>'+
    '<td class="text-slate-500 text-xs">'+new Date(u.created_at).toLocaleDateString('ru')+'</td>'+
    '<td onclick="event.stopPropagation()"><button class="btn btn-sm '+(u.is_banned?'btn-success':'btn-danger')+'" style="padding:5px 12px;font-size:11px" onclick="toggleBan('+u.id+','+!u.is_banned+')">'+(u.is_banned?'Разбан':'Бан')+'</button></td></tr>'
  ).join('')}
function filterUsers(){const q=document.getElementById('userSearch').value.toLowerCase();renderUsers(allUsers.filter(u=>(u.username||'').toLowerCase().includes(q)||String(u.id).includes(q)||(u.first_name||'').toLowerCase().includes(q)))}
async function toggleBan(id,ban){await P('/admin/ban',{userId:id,ban});loadUsers()}
async function addCredits(){
  const id=document.getElementById('addCreditsId').value,amt=document.getElementById('addCreditsAmount').value;
  if(!id||!amt){alert('Заполните ID и сумму');return}
  const r=await P('/admin/addcredits',{userId:+id,amount:+amt});
  if(r.success){alert('✅ Начислено! Баланс: '+r.newBalance);loadUsers()}else alert('❌ '+r.error)}

// User modal
async function showUser(id){
  const u=await G('/admin/user/'+id);if(u.error){alert(u.error);return}
  const tz=Math.round((u.timezone_offset||540)/60);
  const localTime=new Date(Date.now()+(u.timezone_offset||540)*60000).toLocaleTimeString('ru',{timeZone:'UTC',hour:'2-digit',minute:'2-digit'});
  document.getElementById('userModalContent').innerHTML=
    '<div class="text-center mb-5">'+
      '<div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-2xl font-bold mb-3">'+u.first_name[0].toUpperCase()+'</div>'+
      '<h2 class="text-xl font-bold">'+(u.username?'@'+u.username:u.first_name)+'</h2>'+
      '<p class="text-slate-500 text-sm">ID: '+u.id+'</p>'+
    '</div>'+
    '<div class="grid grid-cols-2 gap-3 mb-4">'+
      '<div class="glass p-3 text-center"><div class="text-lg font-bold gradient-text">'+u.credits+'</div><div class="text-xs text-slate-500">💎 Кредиты</div></div>'+
      '<div class="glass p-3 text-center"><div class="text-lg font-bold gradient-text">'+u.totalSpent+'</div><div class="text-xs text-slate-500">💸 Потрачено</div></div>'+
      '<div class="glass p-3 text-center"><div class="text-lg font-bold gradient-text">'+u.chats+'</div><div class="text-xs text-slate-500">💬 Чатов</div></div>'+
      '<div class="glass p-3 text-center"><div class="text-lg font-bold gradient-text">'+u.generations+'</div><div class="text-xs text-slate-500">🎨 Генераций</div></div>'+
    '</div>'+
    '<div class="space-y-2 text-sm">'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">🌍 Часовой пояс</span><span>UTC'+(tz>=0?'+':'')+tz+' (сейчас '+localTime+')</span></div>'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">🗣 Язык</span><span>'+(u.language_code==='sah'?'Сахалыы':'Русский')+'</span></div>'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">📅 Регистрация</span><span>'+new Date(u.created_at).toLocaleDateString('ru')+'</span></div>'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">📝 Транзакций</span><span>'+u.transactions+'</span></div>'+
      '<div class="flex justify-between py-2"><span class="text-slate-500">🚫 Забанен</span><span>'+(u.is_banned?'Да':'Нет')+'</span></div>'+
    '</div>'+
    '<button class="btn btn-ghost w-full mt-4" onclick="document.getElementById(\\'userModal\\').classList.add(\\'hidden\\')">Закрыть</button>';
  document.getElementById('userModal').classList.remove('hidden');
}

// PUSHES
async function createPush(send){
  const name=document.getElementById('pushName').value,text=document.getElementById('pushText').value;
  const type=document.getElementById('pushType').value,time=type==='daily'?document.getElementById('pushTime').value:null;
  if(!name||!text){alert('Заполните название и текст');return}
  const r=await P('/admin/push/templates',{name,text,scheduleType:type,sendTime:time});
  if(r.id){document.getElementById('pushName').value='';document.getElementById('pushText').value='';loadPushTemplates();alert('✅ Шаблон сохранён!'+(send?' Для рассылки с медиа используйте /push в боте':''))}
  else alert('❌ '+(r.error||'Ошибка'))}

async function loadPushTemplates(){
  const t=await G('/admin/push/templates');const el=document.getElementById('pushTemplates');
  if(!Array.isArray(t)||!t.length){el.innerHTML='<div class="glass-strong p-8 text-center text-slate-500">Шаблонов нет</div>';return}
  el.innerHTML=t.map(p=>{const i=p.schedule_type==='daily'?'📅':p.schedule_type==='welcome'?'👋':'📨';const a=p.is_active?'✅':'⏸';
  return '<div class="glass-strong p-4 mb-3 flex items-center justify-between glow-border"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1"><span class="text-lg anim-pulse">'+a+' '+i+'</span><span class="font-bold text-sm">'+p.name+'</span>'+(p.send_time?' <span class="text-cyan-400 text-xs">⏰ '+p.send_time+'</span>':'')+'</div><p class="text-slate-400 text-xs truncate">'+(p.text||'').slice(0,120)+'</p></div><button class="btn btn-danger ml-3" onclick="delPush('+p.id+')">🗑 Удалить</button></div>'}).join('')}

async function delPush(id){if(!confirm('Удалить?'))return;await D('/admin/push/templates/'+id);loadPushTemplates()}

async function loadPushLog(){
  const l=await G('/admin/push/log');const el=document.getElementById('pushLogList');
  if(!Array.isArray(l)||!l.length){el.innerHTML='<p class="text-slate-600 text-sm">Рассылок не было</p>';return}
  el.innerHTML=l.map(x=>'<div class="flex justify-between py-2.5 text-sm border-b border-white/5"><span>'+(x.template_name||'—')+'</span><span class="text-slate-500">'+new Date(x.started_at).toLocaleDateString('ru')+'</span><span class="text-green-400">✅'+x.sent_count+'</span></div>').join('')}

if(TOKEN)showPanel();
</script></body></html>`;
