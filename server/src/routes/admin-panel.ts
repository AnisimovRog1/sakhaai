import { Router, Request, Response } from 'express';

export const adminPanelRouter = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) console.warn('⚠️ ADMIN_PASSWORD не задан — админ-панель отключена');

adminPanelRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD) { res.status(503).json({ error: 'Панель не настроена' }); return; }
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
      <!-- Создание пуша -->
      <div class="glass-neon p-6 mb-5 glow-border">
        <h3 class="text-base font-bold mb-4 flex items-center gap-2"><span class="anim-bounce">📝</span> Создать разовый пуш</h3>
        <div class="space-y-3">
          <input id="pushName" placeholder="📌 Название пуша">
          <textarea id="pushText" placeholder="✏️ Текст сообщения" rows="3"></textarea>
          <div>
            <div id="dropZone" style="border:2px dashed rgba(139,92,246,.3);border-radius:12px;padding:16px;text-align:center;cursor:pointer;transition:all .3s" onclick="document.getElementById('fileInput').click()" ondragover="event.preventDefault();this.style.borderColor='rgba(6,182,212,.6)';this.style.background='rgba(6,182,212,.05)'" ondragleave="this.style.borderColor='rgba(139,92,246,.3)';this.style.background='transparent'" ondrop="event.preventDefault();handleFileDrop(event);this.style.borderColor='rgba(139,92,246,.3)';this.style.background='transparent'">
              <div id="dropZoneContent">
                <p class="text-slate-400 text-sm">📁 Перетащите фото/видео или нажмите</p>
              </div>
              <div id="mediaPreview" class="hidden">
                <img id="mediaImg" class="max-h-32 mx-auto rounded-lg" style="display:none">
                <video id="mediaVid" class="max-h-32 mx-auto rounded-lg" style="display:none" muted></video>
                <p id="mediaName" class="text-cyan-400 text-sm mt-2 font-medium"></p>
                <button class="btn btn-danger mt-2" style="padding:4px 12px;font-size:11px" onclick="event.stopPropagation();clearMedia()">✕ Убрать</button>
              </div>
            </div>
            <input type="file" id="fileInput" accept="image/*,video/*" class="hidden" onchange="handleFileSelect(event)">
          </div>
          <input type="hidden" id="pushType" value="manual">
          <div class="flex items-center gap-3 flex-wrap">
            <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="pushTiming" value="now" checked onchange="document.getElementById('pushScheduleTime').classList.add('hidden')"><span class="text-sm text-slate-300">Отправить сразу</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="pushTiming" value="scheduled" onchange="document.getElementById('pushScheduleTime').classList.remove('hidden')"><span class="text-sm text-slate-300">Запланировать</span></label>
            <div id="pushScheduleTime" class="hidden flex items-center gap-2">
              <input type="datetime-local" id="pushScheduleAt" class="bg-black/20 border border-white/8 rounded-lg px-2 py-1.5 text-sm text-slate-300">
            </div>
          </div>
          <div class="space-y-2">
            <div class="text-xs text-slate-400 font-semibold">👥 Получатели:</div>
            <div class="flex flex-wrap gap-2 text-xs">
              <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="pushRecipients" value="all" checked><span class="text-slate-300">Все юзеры</span></label>
              <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="pushRecipients" value="active"><span class="text-slate-300">Активные (&lt;7 дн)</span></label>
              <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="pushRecipients" value="purchased"><span class="text-slate-300">Купившие</span></label>
              <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="pushRecipients" value="not_purchased"><span class="text-slate-300">Не купившие</span></label>
              <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="pushRecipients" value="low_credits"><span class="text-slate-300">Кредиты &lt;</span></label>
              <input type="number" id="pushCreditsFilter" placeholder="500" class="w-16 bg-black/20 border border-white/8 rounded px-1.5 py-0.5 text-slate-400 text-xs">
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost py-3" onclick="previewPush()">👁 Preview</button>
            <button class="btn btn-primary flex-1 py-3" onclick="createPush(false)">💾 Сохранить</button>
            <button class="btn btn-success flex-1 py-3" onclick="createPush(true)">📨 Отправить</button>
          </div>
        </div>
      </div>

      <!-- Статистика пушей -->
      <div id="pushStatsGrid" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"></div>

      <!-- Таблица пушей -->
      <h3 class="text-base font-bold mb-4 flex items-center gap-2"><span class="anim-pulse">📋</span> Разовые пуши</h3>
      <div class="glass-strong overflow-x-auto mb-5">
        <table>
          <thead><tr>
            <th>Статус</th><th>Тип</th><th>Название</th><th>Медиа</th><th>Время</th><th>Текст</th><th>Действия</th>
          </tr></thead>
          <tbody id="pushTable"></tbody>
        </table>
      </div>

      <!-- Лог рассылок -->
      <div class="glass-cyan p-5 mb-5">
        <h3 class="text-sm font-bold mb-4 flex items-center gap-2"><span class="anim-spin">📊</span> Лог рассылок</h3>
        <div id="pushLogList"></div>
      </div>

      <!-- ═══ КОРЗИНА ═══ -->
      <div class="glass p-5 mb-5" style="border:1px dashed rgba(255,255,255,.1)">
        <div class="flex items-center justify-between cursor-pointer" onclick="toggleTrash()">
          <h3 class="text-sm font-bold flex items-center gap-2">🗑 Корзина удалённых <span id="trashCount" class="text-slate-600 font-normal">(0)</span></h3>
          <span class="text-slate-600 text-xs" id="trashArrow">▶</span>
        </div>
        <div id="trashList" class="hidden mt-4 space-y-2"></div>
      </div>

      <!-- ═══ АВТОПУШ-ЦЕПОЧКИ ═══ -->
      <div class="glass-neon p-6 glow-border">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold flex items-center gap-2">🤖 Автоматические цепочки</h3>
            <p class="text-slate-500 text-xs mt-1">Включите галочку ✅ — пуш начнёт вылетать по триггеру и таймингу</p>
          </div>
          <button class="btn btn-ghost text-xs" onclick="addNewSeq()">➕ Добавить</button>
        </div>

        <!-- Табы цепочек -->
        <div class="flex gap-1 mb-5 bg-white/5 rounded-xl p-1">
          <button class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all seq-tab active" onclick="filterSeq(this,'no_purchase')">🛒 Не купил<br><span class="text-[10px] font-normal opacity-60">11 шагов</span></button>
          <button class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all seq-tab" onclick="filterSeq(this,'after_purchase')">✅ Купил<br><span class="text-[10px] font-normal opacity-60">1 шаг</span></button>
          <button class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all seq-tab" onclick="filterSeq(this,'low_credits')">📉 Мало<br><span class="text-[10px] font-normal opacity-60">3 порога</span></button>
          <button class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all seq-tab" onclick="filterSeq(this,'zero_credits')">🔴 Ноль<br><span class="text-[10px] font-normal opacity-60">7 шагов</span></button>
          <button class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all seq-tab" onclick="filterSeq(this,'daily')">📅 Ежедневные<br><span class="text-[10px] font-normal opacity-60">для всех</span></button>
          <button class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all seq-tab" onclick="filterSeq(this,'welcome')">👋 Приветствие<br><span class="text-[10px] font-normal opacity-60">новые юзеры</span></button>
          <button class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all seq-tab" onclick="filterSeq(this,'reactivation')">🔄 Реактивация<br><span class="text-[10px] font-normal opacity-60">7+ дней</span></button>
          <button class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all seq-tab" onclick="filterSeq(this,'first_generation')">🎨 1-я генерация<br><span class="text-[10px] font-normal opacity-60">после генерации</span></button>
        </div>

        <div id="seqList"></div>
      </div>
    </div>

  </div>
</div>

<!-- USER MODAL -->
<div id="userModal" class="modal-bg hidden" onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="modal glass-neon glow-border p-6" id="userModalContent"></div>
</div>

<!-- SEQUENCE CREATE MODAL -->
<div id="seqCreateModal" class="modal-bg hidden" onclick="if(event.target===this)closeSeqModal()">
  <div class="modal glass-neon glow-border p-6" style="max-width:520px">
    <h3 class="text-lg font-bold gradient-text mb-4">🔗 Создать новую цепочку</h3>
    <div class="space-y-3">
      <input id="seqCreateName" placeholder="📌 Название цепочки" class="w-full">
      <div class="text-xs text-slate-400 font-semibold mb-1">Триггер срабатывания:</div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <label class="flex items-center gap-2 glass p-2.5 rounded-lg cursor-pointer hover:bg-white/5"><input type="radio" name="seqCreateTrigger" value="no_purchase" checked onchange="onSeqTriggerChange()"><span>🛒 Не купил пакет</span></label>
        <label class="flex items-center gap-2 glass p-2.5 rounded-lg cursor-pointer hover:bg-white/5"><input type="radio" name="seqCreateTrigger" value="after_purchase" onchange="onSeqTriggerChange()"><span>✅ Купил пакет</span></label>
        <label class="flex items-center gap-2 glass p-2.5 rounded-lg cursor-pointer hover:bg-white/5"><input type="radio" name="seqCreateTrigger" value="low_credits" onchange="onSeqTriggerChange()"><span>📉 Мало кредитов</span></label>
        <label class="flex items-center gap-2 glass p-2.5 rounded-lg cursor-pointer hover:bg-white/5"><input type="radio" name="seqCreateTrigger" value="zero_credits" onchange="onSeqTriggerChange()"><span>🔴 Ноль кредитов</span></label>
        <label class="flex items-center gap-2 glass p-2.5 rounded-lg cursor-pointer hover:bg-white/5"><input type="radio" name="seqCreateTrigger" value="daily" onchange="onSeqTriggerChange()"><span>📅 Ежедневно</span></label>
        <label class="flex items-center gap-2 glass p-2.5 rounded-lg cursor-pointer hover:bg-white/5"><input type="radio" name="seqCreateTrigger" value="welcome" onchange="onSeqTriggerChange()"><span>👋 Приветствие</span></label>
        <label class="flex items-center gap-2 glass p-2.5 rounded-lg cursor-pointer hover:bg-white/5"><input type="radio" name="seqCreateTrigger" value="reactivation" onchange="onSeqTriggerChange()"><span>🔄 Реактивация</span></label>
        <label class="flex items-center gap-2 glass p-2.5 rounded-lg cursor-pointer hover:bg-white/5"><input type="radio" name="seqCreateTrigger" value="first_generation" onchange="onSeqTriggerChange()"><span>🎨 Первая генерация</span></label>
      </div>
      <div class="hidden"><label class="text-xs text-slate-500">Порог кредитов: <input id="seqCreateThreshold" type="number" placeholder="500" class="w-20 ml-2"></label></div>
      <div class="hidden"><label class="text-xs text-slate-500">День недели: <select id="seqCreateWeekday" class="ml-2 bg-black/20 border border-white/8 rounded px-2 py-1 text-slate-400 text-xs"><option value="">Каждый день</option><option value="MON">Пн</option><option value="TUE">Вт</option><option value="WED">Ср</option><option value="THU">Чт</option><option value="FRI">Пт</option><option value="SAT">Сб</option><option value="SUN">Вс</option></select></label></div>
      <div class="flex gap-2 mt-4">
        <button class="btn btn-ghost flex-1" onclick="closeSeqModal()">Отмена</button>
        <button class="btn btn-primary flex-1" onclick="submitNewSeq()">✨ Создать</button>
      </div>
    </div>
  </div>
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
  else{const el=document.getElementById('loginError');el.textContent=d.error||'Неверный пароль';el.classList.remove('hidden')}}catch(e){alert(e)}
}
function showPanel(){document.getElementById('loginPage').classList.add('hidden');document.getElementById('panelPage').classList.remove('hidden');loadStats('today');startAutoRefresh()}
function logout(){TOKEN='';localStorage.removeItem('at');clearInterval(autoRefresh);location.reload()}

async function apiFetch(p,o){const r=await fetch(API+p,{...o,headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json',...(o?.headers||{})}});const t=await r.text();try{return JSON.parse(t)}catch{return{error:t}}}
function G(p){return apiFetch(p)}
function P(p,d){return apiFetch(p,{method:'POST',body:JSON.stringify(d)})}
function D(p){return apiFetch(p,{method:'DELETE'})}

function showTab(el,n){document.querySelectorAll('[id^=tab-]').forEach(e=>e.classList.add('hidden'));document.getElementById('tab-'+n).classList.remove('hidden');document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));el.classList.add('active');if(n==='users')loadUsers();if(n==='pushes'){loadPushTemplates();loadPushLog();loadSeqs();loadPushStats()}}

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
function closeUserModal(){document.getElementById('userModal').classList.add('hidden')}

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
    '<button class="btn btn-ghost w-full mt-4" onclick="closeUserModal()">Закрыть</button>';
  document.getElementById('userModal').classList.remove('hidden');
}

// PUSHES — file handling
let uploadedMedia={type:null,data:null,name:null};

function handleFileDrop(e){const f=e.dataTransfer.files[0];if(f)processFile(f)}
function handleFileSelect(e){const f=e.target.files[0];if(f)processFile(f)}
function processFile(f){
  const isVideo=f.type.startsWith('video/');
  const isImage=f.type.startsWith('image/');
  if(!isVideo&&!isImage){alert('Поддерживаются только фото и видео');return}
  uploadedMedia.type=isVideo?'video':'photo';
  uploadedMedia.name=f.name;
  const reader=new FileReader();
  reader.onload=function(e){
    uploadedMedia.data=e.target.result;
    document.getElementById('dropZoneContent').classList.add('hidden');
    document.getElementById('mediaPreview').classList.remove('hidden');
    document.getElementById('mediaName').textContent=(isVideo?'🎬 ':'📸 ')+f.name;
    if(isImage){document.getElementById('mediaImg').src=e.target.result;document.getElementById('mediaImg').style.display='block';document.getElementById('mediaVid').style.display='none'}
    else{document.getElementById('mediaVid').src=e.target.result;document.getElementById('mediaVid').style.display='block';document.getElementById('mediaImg').style.display='none'}
  };reader.readAsDataURL(f)
}
function clearMedia(){
  uploadedMedia={type:null,data:null,name:null};
  document.getElementById('dropZoneContent').classList.remove('hidden');
  document.getElementById('mediaPreview').classList.add('hidden');
  document.getElementById('mediaImg').style.display='none';
  document.getElementById('mediaVid').style.display='none';
  document.getElementById('fileInput').value='';
}

async function createPush(send){
  const name=document.getElementById('pushName').value,text=document.getElementById('pushText').value;
  const timing=document.querySelector('input[name="pushTiming"]:checked')?.value||'now';
  const scheduleAt=timing==='scheduled'?document.getElementById('pushScheduleAt').value:null;
  var mediaType=uploadedMedia.type||null;
  var mediaFileId=null;
  if(!name||!text){alert('Заполните название и текст');return}
  if(timing==='scheduled'&&!scheduleAt){alert('Укажите время отправки');return}
  // Загрузить медиа через upload-photo → получить Telegram file_id
  if(uploadedMedia.data&&uploadedMedia.type){
    try{
      var blob=await fetch(uploadedMedia.data).then(r=>r.blob());
      var ext=uploadedMedia.type==='video'?'mp4':'jpg';
      var fd=new FormData();fd.append('photo',blob,uploadedMedia.name||('file.'+ext));
      var ur=await fetch(API+'/admin/upload-photo',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN},body:fd});
      var ud=await ur.json();
      if(ud.file_id){mediaFileId=ud.file_id}else{alert('Ошибка загрузки медиа: '+(ud.error||''));return}
    }catch(e){alert('Ошибка загрузки: '+e);return}
  }
  const r=await P('/admin/push/templates',{name,text,scheduleType:timing==='scheduled'?'scheduled':'manual',sendTime:scheduleAt,mediaType:mediaType,mediaFileId:mediaFileId});
  if(r.id){
    if(send&&timing==='now'){
      var recipients=(document.querySelector('input[name="pushRecipients"]:checked')||{}).value||'all';
      var creditsFilter=parseInt(document.getElementById('pushCreditsFilter')?.value)||500;
      var sr=await P('/admin/push/send/'+r.id,{recipients:recipients,creditsFilter:creditsFilter});
      alert('📨 Отправлено: '+(sr.sent||0)+' пользователям');
    } else if(timing==='scheduled'){
      alert('📅 Пуш запланирован на '+new Date(scheduleAt).toLocaleString('ru'));
    } else {
      alert('✅ Шаблон сохранён!');
    }
    document.getElementById('pushName').value='';document.getElementById('pushText').value='';
    clearMedia();loadPushTemplates()
  } else alert('❌ '+(r.error||'Ошибка'))}

async function loadPushStats(){
  var s=await G('/admin/push/stats');if(s.error)return;
  var el=document.getElementById('pushStatsGrid');if(!el)return;
  el.innerHTML=[
    sc('📨','Отправлено',s.totalSent,'neon'),
    sc('🤖','Авто сегодня',s.autoToday,'cyan'),
    sc('🔗','Активных цепочек',s.activeChains,'neon'),
    sc('📝','Шаблонов',s.totalTemplates,'cyan'),
  ].join('');
}

function previewPush(){
  var text=document.getElementById('pushText').value;
  if(!text){alert('Введите текст');return}
  var formatted=text.replace(/<<([^>]+)>>/g,'<b>$1</b>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/_([^_]+)_/g,'<i>$1</i>');
  var hasMedia=uploadedMedia.data?'<div style="background:#111;border-radius:8px;padding:20px;text-align:center;margin-bottom:8px"><span style="color:#06b6d4">📸 Фото прикреплено</span></div>':'';
  var modal=document.getElementById('userModal');
  document.getElementById('userModalContent').innerHTML='<h3 class="text-lg font-bold gradient-text mb-3">👁 Preview пуша</h3><div class="glass p-4 rounded-xl">'+hasMedia+'<div class="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">'+formatted+'</div></div><p class="text-slate-600 text-[10px] mt-2">Так будет выглядеть в Telegram (приблизительно)</p><button class="btn btn-ghost w-full mt-3" onclick="closeUserModal()">Закрыть</button>';
  modal.classList.remove('hidden');
}

async function loadPushTemplates(){
  const t=await G('/admin/push/templates');const el=document.getElementById('pushTable');
  if(!Array.isArray(t)||!t.length){el.innerHTML='<tr><td colspan="7" class="text-center text-slate-500 py-8">Пушей нет — создайте первый</td></tr>';return}
  el.innerHTML=t.map(p=>{
    const typeIcon=p.schedule_type==='daily'?'<span class="text-cyan-400">📅 Ежедневный</span>':p.schedule_type==='welcome'?'<span class="text-amber-400">👋 Приветствие</span>':'<span class="text-violet-400">📨 Разовый</span>';
    const status=p.is_active?'<span class="text-green-400 font-bold">✅ Вкл</span>':'<span class="text-slate-500">⏸ Выкл</span>';
    const media=p.media_type==='photo'?'📸 Фото':p.media_type==='video'?'🎬 Видео':'📝 Текст';
    const time=p.send_time?'<span class="font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">'+p.send_time+'</span>':'<span class="text-slate-600">—</span>';
    return '<tr>'+
      '<td>'+status+'</td>'+
      '<td>'+typeIcon+'</td>'+
      '<td class="font-semibold text-white">'+p.name+'</td>'+
      '<td>'+media+'</td>'+
      '<td>'+time+'</td>'+
      '<td class="text-slate-400 text-xs max-w-[200px] truncate">'+(p.text||'').slice(0,60)+'</td>'+
      '<td><div class="flex gap-1">'+
        '<button class="btn btn-ghost" style="padding:4px 8px;font-size:11px" onclick="togglePush('+p.id+')">'+(p.is_active?'⏸':'▶️')+'</button>'+
        '<button class="btn btn-danger" style="padding:4px 8px;font-size:11px" onclick="delPush('+p.id+')">🗑</button>'+
      '</div></td></tr>'
  }).join('')}

async function delPush(id){if(!confirm('Удалить пуш?'))return;await D('/admin/push/templates/'+id);loadPushTemplates()}
async function togglePush(id){await apiFetch('/admin/push/templates/'+id+'/toggle',{method:'PUT'});loadPushTemplates()}

async function loadPushLog(){
  const l=await G('/admin/push/log');const el=document.getElementById('pushLogList');
  if(!Array.isArray(l)||!l.length){el.innerHTML='<p class="text-slate-600 text-sm">Рассылок не было</p>';return}
  el.innerHTML='<div class="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 gap-y-2 text-sm items-center">'+
    '<span class="text-slate-600 text-[10px] uppercase">Тип</span><span class="text-slate-600 text-[10px] uppercase">Название</span><span class="text-slate-600 text-[10px] uppercase">Дата</span><span class="text-slate-600 text-[10px] uppercase">Отправлено</span><span class="text-slate-600 text-[10px] uppercase">Ошибки</span>'+
    l.map(x=>{var icon=x.source==='auto'?'🤖':'📨';var date=x.sent_at?new Date(x.sent_at).toLocaleDateString('ru'):'';var fail=x.failed_count>0?'<span class="text-red-400">'+x.failed_count+'</span>':'<span class="text-slate-600">0</span>';return '<span>'+icon+'</span><span class="text-white font-medium truncate">'+(x.label||'—')+'</span><span class="text-slate-500 text-xs">'+date+'</span><span class="text-green-400 font-bold">'+x.sent_count+'</span>'+fail}).join('')+'</div>'}

// ═══ АВТОПУШ-ЦЕПОЧКИ ═══
let seqData=[];
let seqFilter='no_purchase';

function filterSeq(el,f){seqFilter=f;document.querySelectorAll('.seq-tab').forEach(e=>{e.classList.remove('active');e.style.background=''});el.classList.add('active');el.style.background='rgba(139,92,246,.2)';renderSeqs()}

async function loadSeqs(){seqData=await G('/admin/push/sequences');if(!Array.isArray(seqData))seqData=[];renderSeqs();G('/admin/push/sequences/deleted').then(function(d){if(Array.isArray(d))document.getElementById('trashCount').textContent='('+d.length+')'}).catch(function(){})}

function delayLabel(m){if(m===0)return 'сразу';if(m<60)return m+' мин';if(m<1440){var h=Math.floor(m/60),mm=m%60;return h+'ч'+(mm?' '+mm+'м':'')}return Math.floor(m/1440)+'д'}

function renderSeqs(){
  var el=document.getElementById('seqList');
  var list=seqData.filter(function(s){return s.trigger_type===seqFilter}).sort(function(a,b){return a.delay_minutes-b.delay_minutes});
  if(!list.length){el.innerHTML='<div class="text-center py-8 text-slate-600">Нет пушей в этой цепочке</div>';return}

  var triggerDesc={no_purchase:'Юзер запустил бота но НЕ купил пакет',after_purchase:'Юзер купил пакет',low_credits:'Баланс юзера упал ниже порога',zero_credits:'Кредиты юзера закончились (= 0)',daily:'Ежедневный пуш — отправляется ВСЕМ активным юзерам раз в день',welcome:'Приветственный пуш — отправляется при ПЕРВОМ запуске бота',reactivation:'Юзер не заходил 7+ дней — отправляется до 3 раз',first_generation:'Юзер завершил первую генерацию — через N минут'}[seqFilter]||'';

  var html='<div class="mb-4 p-3 rounded-lg bg-white/5 border border-white/8"><p class="text-xs text-slate-400">⚡ Триггер: <span class="text-cyan-300 font-medium">'+triggerDesc+'</span></p></div>';

  html+='<div class="relative">';
  // Вертикальная линия таймлайна
  html+='<div style="position:absolute;left:20px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,rgba(139,92,246,.4),rgba(6,182,212,.4))"></div>';

  list.forEach(function(s,i){
    var active=s.is_active;
    var dotColor=active?'#4ade80':'#64748b';
    var borderColor=active?'border-green-500/20':'border-white/6';

    html+='<div class="relative pl-12 pb-5" id="seq-'+s.id+'">';
    // Точка на таймлайне
    html+='<div style="position:absolute;left:13px;top:8px;width:16px;height:16px;border-radius:50%;background:'+dotColor+';border:3px solid #0a0f1a;z-index:2"></div>';
    // Время на таймлайне
    html+='<div style="position:absolute;left:-60px;top:6px;width:70px;text-align:right" class="text-xs font-mono '+(active?'text-cyan-400':'text-slate-600')+'">'+delayLabel(s.delay_minutes)+'</div>';

    html+='<div class="glass-strong p-4 '+borderColor+'" style="border-left:3px solid '+(active?'#4ade80':'#334155')+'">';

    // Заголовок + переключатель
    html+='<div class="flex items-center justify-between mb-2">';
    html+='<div class="flex items-center gap-2"><span class="text-sm font-bold text-white">'+esc(s.label)+'</span>';
    if(s.credits_threshold) html+='<span class="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">&lt; '+s.credits_threshold+' кр.</span>';
    html+='</div>';
    html+='<label class="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" '+(active?'checked':'')+' onchange="toggleSeq('+s.id+')" class="w-4 h-4 accent-green-500 rounded"><span class="text-xs font-medium '+(active?'text-green-400':'text-slate-600')+'">'+(active?'✅ Вкл':'Выкл')+'</span></label>';
    html+='</div>';

    // Превью фото + зона загрузки
    html+='<div class="mb-2" id="seqmedia-'+s.id+'">';
    if(s.media_url||s.media_file_id){
      html+='<div class="relative mb-2">';
      if(s.media_url&&!s.media_url.startsWith('tg://')){
        html+='<img src="'+esc(s.media_url)+'" class="w-full rounded-lg" style="max-height:300px;object-fit:contain;background:#111">';
      } else if(s.media_file_id){
        html+='<img id="seqpreview-'+s.id+'" data-fileid="'+esc(s.media_file_id)+'" class="w-full rounded-lg seqimg-lazy" style="max-height:300px;object-fit:contain;background:#111;display:none"><div id="seqloading-'+s.id+'" class="w-full rounded-lg p-4 text-center" style="background:#111;border:1px solid rgba(255,255,255,0.1)"><p class="text-cyan-400 text-sm">⏳ Загрузка фото...</p></div>';
      }
      html+='<button class="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-red-600 text-white text-lg flex items-center justify-center shadow-lg cursor-pointer" style="pointer-events:auto" onclick="event.stopPropagation();clearSeqImg('+s.id+')">✕</button>';
      html+='</div>';
    }
    html+='<div class="border-2 border-dashed border-white/10 rounded-lg p-3 text-center cursor-pointer hover:border-violet-500/40 transition" onclick="seqPickFile('+s.id+')" ondragover="event.preventDefault();this.classList.add(&quot;border-violet-500&quot;)" ondragleave="this.classList.remove(&quot;border-violet-500&quot;)" ondrop="event.preventDefault();this.classList.remove(&quot;border-violet-500&quot;);seqDropFile(event,'+s.id+')">';
    html+='<p class="text-slate-500 text-xs">📁 Перетащите фото или нажмите для выбора</p></div>';
    html+='<input type="file" id="seqfile-'+s.id+'" class="hidden" accept="image/*,video/*" onchange="seqFileSelect(event,'+s.id+')">';
    html+='</div>';

    // Форматирование — через data-атрибуты, без кавычек в onclick
    html+='<div class="flex gap-1 mb-1 flex-wrap">';
    html+='<button class="px-2 py-0.5 rounded text-[11px] bg-white/5 hover:bg-white/10 text-slate-400 font-bold" data-seq="'+s.id+'" data-fmt="bold" onclick="seqFmt(this)">B</button>';
    html+='<button class="px-2 py-0.5 rounded text-[11px] bg-white/5 hover:bg-white/10 text-slate-400 italic" data-seq="'+s.id+'" data-fmt="italic" onclick="seqFmt(this)">I</button>';
    html+='<button class="px-2 py-0.5 rounded text-[11px] bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-bold" data-seq="'+s.id+'" data-fmt="chevron-bold" onclick="seqFmt(this)">&laquo;\\u0416&raquo;</button>';
    html+='<span class="border-l border-white/10 mx-1"></span>';
    var emojis=["🎨","🔥","⭐","💎","🎬","✨","🚀","💰","❤️","👋","📸","🎁","⚡","🆕"];
    emojis.forEach(function(e){html+='<button class="px-1 py-0.5 rounded text-sm bg-white/5 hover:bg-white/10" data-seq="'+s.id+'" data-emoji="'+e+'" onclick="seqEmoji(this)">'+e+'</button>'});
    html+='</div>';

    // Текст
    html+='<textarea class="w-full bg-black/20 border border-white/8 rounded-lg p-2.5 text-xs text-slate-300 resize-y leading-relaxed font-mono" rows="4" id="seqtext-'+s.id+'" oninput="markSeqDirty('+s.id+')" onkeydown="seqHotkey(event,'+s.id+')">'+esc(s.text)+'</textarea>';

    // Настройки
    html+='<div class="flex gap-2 mt-2 flex-wrap items-center">';
    html+='<input class="flex-1 min-w-[160px] text-[11px] bg-black/20 border border-white/8 rounded-lg px-2 py-1.5 text-slate-400" placeholder="URL фото" value="'+esc(s.media_url||'')+'" id="seqimg-'+s.id+'" oninput="markSeqDirty('+s.id+')"><input type="hidden" id="seqfileid-'+s.id+'" value="'+esc(s.media_file_id||'')+'">';
    html+='<div class="flex items-center gap-1 text-[11px] text-slate-500"><span>⏱ Через</span><input type="number" class="w-16 bg-black/20 border border-white/8 rounded px-1.5 py-1 text-slate-400 text-center" value="'+s.delay_minutes+'" id="seqdelay-'+s.id+'" oninput="markSeqDirty('+s.id+')"><span>мин после триггера</span></div>';
    html+='<input type="hidden" id="seqhfrom-'+s.id+'" value="'+(s.allow_hour_from||9)+'"><input type="hidden" id="seqhto-'+s.id+'" value="'+(s.allow_hour_to||22)+'">';
    html+='</div>';

    // ═══ Режим отправки ═══
    var sm=s.send_mode||'immediate';
    html+='<div class="flex gap-2 mt-2 flex-wrap items-center text-[11px] text-slate-500">';
    html+='<span>📤</span>';
    html+='<label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="seqmode-'+s.id+'" value="immediate" '+(sm==='immediate'?'checked':'')+' onchange="markSeqDirty('+s.id+')"><span>Немедленно</span></label>';
    html+='<label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="seqmode-'+s.id+'" value="strict_time" '+(sm==='strict_time'?'checked':'')+' onchange="markSeqDirty('+s.id+')"><span>Строго в</span></label>';
    html+='<input type="text" class="w-14 bg-black/20 border border-white/8 rounded px-1.5 py-0.5 text-slate-400 text-center" placeholder="10:00" value="'+esc(s.strict_time||'')+'" id="seqstrict-'+s.id+'" oninput="markSeqDirty('+s.id+')">';
    html+='<label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="seqmode-'+s.id+'" value="preferred_time" '+(sm==='preferred_time'?'checked':'')+' onchange="markSeqDirty('+s.id+')"><span>Preferred</span></label>';
    html+='<input type="text" class="w-14 bg-black/20 border border-white/8 rounded px-1.5 py-0.5 text-slate-400 text-center" placeholder="12:00" value="'+esc(s.preferred_time||'')+'" id="seqpref-'+s.id+'" oninput="markSeqDirty('+s.id+')">';
    html+='</div>';

    // ═══ Приветствие ═══
    var gm=s.greeting_mode||'none';
    html+='<div class="flex gap-2 mt-1 flex-wrap items-center text-[11px] text-slate-500">';
    html+='<span>👋</span>';
    html+='<select class="bg-black/20 border border-white/8 rounded px-1.5 py-0.5 text-slate-400 text-[11px]" id="seqgreet-'+s.id+'" onchange="markSeqDirty('+s.id+');toggleGreetFixed('+s.id+',this.value)">';
    html+='<option value="none" '+(gm==='none'?'selected':'')+'>Без приветствия</option>';
    html+='<option value="dynamic" '+(gm==='dynamic'?'selected':'')+'>Динамическое (утро/день/вечер)</option>';
    html+='<option value="fixed" '+(gm==='fixed'?'selected':'')+'>Фиксированное</option>';
    html+='</select>';
    html+='<input type="text" class="w-28 bg-black/20 border border-white/8 rounded px-1.5 py-0.5 text-slate-400 '+(gm==='fixed'?'':'hidden')+'" placeholder="Привет!" value="'+esc(s.greeting_fixed||'')+'" id="seqgreetfixed-'+s.id+'" oninput="markSeqDirty('+s.id+')">';
    html+='</div>';

    // ═══ День недели (только для daily) ═══
    if(seqFilter==='daily'){
      var wd=s.weekday||'';
      html+='<div class="flex gap-2 mt-1 flex-wrap items-center text-[11px] text-slate-500">';
      html+='<span>📅</span>';
      html+='<select class="bg-black/20 border border-white/8 rounded px-1.5 py-0.5 text-slate-400 text-[11px]" id="seqweekday-'+s.id+'" onchange="markSeqDirty('+s.id+')">';
      html+='<option value="" '+(wd===''?'selected':'')+'>Каждый день</option>';
      html+='<option value="MON" '+(wd==='MON'?'selected':'')+'>Пн</option>';
      html+='<option value="TUE" '+(wd==='TUE'?'selected':'')+'>Вт</option>';
      html+='<option value="WED" '+(wd==='WED'?'selected':'')+'>Ср</option>';
      html+='<option value="THU" '+(wd==='THU'?'selected':'')+'>Чт</option>';
      html+='<option value="FRI" '+(wd==='FRI'?'selected':'')+'>Пт</option>';
      html+='<option value="SAT" '+(wd==='SAT'?'selected':'')+'>Сб</option>';
      html+='<option value="SUN" '+(wd==='SUN'?'selected':'')+'>Вс</option>';
      html+='</select>';
      html+='</div>';
    }

    // ═══ Кнопки сохранения/удаления ═══
    html+='<div class="flex gap-2 mt-2 items-center">';
    html+='<button class="btn btn-primary text-[11px] hidden" id="seqsave-'+s.id+'" onclick="saveSeq('+s.id+')" style="padding:4px 12px">💾 Сохранить</button>';
    html+='<button class="text-cyan-400/50 hover:text-cyan-400 text-[11px]" onclick="dupeSeq('+s.id+')" title="Дублировать">📋</button>';
    html+='<button class="text-red-400/50 hover:text-red-400 text-[11px]" onclick="delSeq('+s.id+')">🗑</button>';
    html+='</div>';

    html+='</div></div>';
  });
  html+='</div>';
  el.innerHTML=html;
  // Загрузить превью фото для file_id
  document.querySelectorAll('.seqimg-lazy').forEach(function(img){
    var fid=img.getAttribute('data-fileid');if(!fid)return;
    G('/admin/file-url/'+fid).then(function(d){
      if(d&&d.url){img.src=d.url;img.style.display='block';var ld=document.getElementById('seqloading-'+img.id.replace('seqpreview-',''));if(ld)ld.remove()}
    }).catch(function(){});
  });
}

function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}

function toggleGreetFixed(id,val){var f=document.getElementById('seqgreetfixed-'+id);if(f)f.classList.toggle('hidden',val!=='fixed')}
function markSeqDirty(id){var b=document.getElementById('seqsave-'+id);if(b)b.classList.remove('hidden')}

async function saveSeq(id){
  var text=document.getElementById('seqtext-'+id).value;
  var media_url=document.getElementById('seqimg-'+id).value||null;
  var media_file_id=document.getElementById('seqfileid-'+id)?.value||null;
  if(media_url&&media_url.startsWith('tg://file_id/')){media_file_id=media_url.replace('tg://file_id/','');media_url=null}
  var delay_minutes=parseInt(document.getElementById('seqdelay-'+id).value)||0;
  var allow_hour_from=parseInt(document.getElementById('seqhfrom-'+id).value)||9;
  var allow_hour_to=parseInt(document.getElementById('seqhto-'+id).value)||22;
  var send_mode=(document.querySelector('input[name="seqmode-'+id+'"]:checked')||{}).value||'immediate';
  var strict_time=(document.getElementById('seqstrict-'+id)||{}).value||null;
  var preferred_time=(document.getElementById('seqpref-'+id)||{}).value||null;
  var weekday=(document.getElementById('seqweekday-'+id)||{}).value||null;
  var greeting_mode=(document.getElementById('seqgreet-'+id)||{}).value||'none';
  var greeting_fixed=(document.getElementById('seqgreetfixed-'+id)||{}).value||null;
  var s=seqData.find(function(x){return x.id===id});
  var r=await P('/admin/push/sequences',{id:id,trigger_type:s.trigger_type,delay_minutes:delay_minutes,credits_threshold:s.credits_threshold,text:text,media_type:(media_url||media_file_id)?'photo':null,media_url:media_url,media_file_id:media_file_id,label:s.label,is_active:s.is_active,allow_hour_from:allow_hour_from,allow_hour_to:allow_hour_to,send_mode:send_mode,strict_time:strict_time,preferred_time:preferred_time,weekday:weekday,greeting_mode:greeting_mode,greeting_fixed:greeting_fixed});
  if(r.id){document.getElementById('seqsave-'+id).classList.add('hidden');loadSeqs()}
  else alert(r.error||'Ошибка')
}

async function toggleSeq(id){await apiFetch('/admin/push/sequences/'+id+'/toggle',{method:'PUT'});loadSeqs()}
async function delSeq(id){if(!confirm('Удалить?'))return;await D('/admin/push/sequences/'+id);loadSeqs()}
async function dupeSeq(id){
  var s=seqData.find(function(x){return x.id===id});if(!s)return;
  var r=await P('/admin/push/sequences',{trigger_type:s.trigger_type,delay_minutes:s.delay_minutes,credits_threshold:s.credits_threshold,text:s.text,media_type:s.media_type,media_url:s.media_url,media_file_id:s.media_file_id,label:s.label+' (копия)',is_active:false,allow_hour_from:s.allow_hour_from,allow_hour_to:s.allow_hour_to,send_mode:s.send_mode,strict_time:s.strict_time,preferred_time:s.preferred_time,weekday:s.weekday,greeting_mode:s.greeting_mode,greeting_fixed:s.greeting_fixed});
  if(r.id)loadSeqs();else alert(r.error||'Ошибка')
}

// Форматирование через data-атрибуты
function seqFmt(btn){
  var id=btn.dataset.seq;var fmt=btn.dataset.fmt;
  var ta=document.getElementById('seqtext-'+id);if(!ta)return;
  var start=ta.selectionStart,end=ta.selectionEnd;
  var text=ta.value,sel=text.substring(start,end);
  var before='',after='';
  if(fmt==='bold'){before='**';after='**'}
  else if(fmt==='italic'){before='_';after='_'}
  else if(fmt==='chevron-bold'){before='<<';after='>>'}
  ta.value=text.substring(0,start)+before+sel+after+text.substring(end);
  ta.selectionStart=ta.selectionEnd=start+before.length+sel.length+after.length;
  ta.focus();markSeqDirty(id);
}
function seqHotkey(e,id){
  if((e.ctrlKey||e.metaKey)&&e.key==='b'){e.preventDefault();var ta=document.getElementById('seqtext-'+id);if(!ta)return;var start=ta.selectionStart,end=ta.selectionEnd,text=ta.value,sel=text.substring(start,end);ta.value=text.substring(0,start)+'<<'+sel+'>>'+text.substring(end);ta.selectionStart=start+2;ta.selectionEnd=start+2+sel.length;ta.focus();markSeqDirty(id)}
  if((e.ctrlKey||e.metaKey)&&e.key==='i'){e.preventDefault();var ta=document.getElementById('seqtext-'+id);if(!ta)return;var start=ta.selectionStart,end=ta.selectionEnd,text=ta.value,sel=text.substring(start,end);ta.value=text.substring(0,start)+'_'+sel+'_'+text.substring(end);ta.selectionStart=start+1;ta.selectionEnd=start+1+sel.length;ta.focus();markSeqDirty(id)}
}
function seqEmoji(btn){
  var id=btn.dataset.seq;var emoji=btn.dataset.emoji;
  var ta=document.getElementById('seqtext-'+id);if(!ta)return;
  var pos=ta.selectionStart;
  ta.value=ta.value.substring(0,pos)+emoji+ta.value.substring(pos);
  ta.selectionStart=ta.selectionEnd=pos+emoji.length;
  ta.focus();markSeqDirty(id);
}

// Удалить фото
async function clearSeqImg(id){
  var media=document.getElementById('seqmedia-'+id);
  if(media){var imgs=media.querySelectorAll('img,.relative');for(var i=0;i<imgs.length;i++)imgs[i].remove()}
  document.getElementById('seqimg-'+id).value='';
  var s=seqData.find(function(x){return x.id===id});
  if(s){s.media_url=null;s.media_type=null;s.media_file_id=null}
  await saveSeq(id);
}

// Выбор файла
function seqPickFile(id){document.getElementById('seqfile-'+id).click()}
function seqDropFile(e,id){var f=e.dataTransfer.files[0];if(f&&(f.type.startsWith('image/')||f.type.startsWith('video/')))uploadSeqMedia(f,id)}
function seqFileSelect(e,id){var f=e.target.files[0];if(f)uploadSeqMedia(f,id)}
async function uploadSeqMedia(file,id){
  var media=document.getElementById('seqmedia-'+id);
  var isVideo=file.type.startsWith('video/');
  if(media){var old=media.querySelector('.relative');if(old)old.remove();var zone=media.querySelector('[ondragover]');if(zone)zone.innerHTML='<p class="text-cyan-400 text-xs">⏳ Загрузка...</p>'}
  var fd=new FormData();fd.append('photo',file);
  try{
    var r=await fetch(API+'/admin/upload-photo',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN},body:fd});
    var d=await r.json();
    if(d.file_id){
      var imgUrl=d.file_url||'';
      document.getElementById('seqimg-'+id).value=imgUrl;
      var hiddenFid=document.getElementById('seqfileid-'+id);if(hiddenFid)hiddenFid.value=d.file_id;
      var mtype=d.media_type||(isVideo?'video':'photo');
      var s=seqData.find(function(x){return x.id===id});
      if(s){s.media_url=imgUrl;s.media_type=mtype;s.media_file_id=d.file_id}
      markSeqDirty(id);
      var previewSrc=imgUrl||URL.createObjectURL(file);
      if(media)media.innerHTML='<div class="relative mb-2"><img src="'+previewSrc+'" class="w-full rounded-lg" style="max-height:300px;object-fit:contain;background:#111"><button class="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-red-600 text-white text-lg flex items-center justify-center shadow-lg cursor-pointer" onclick="event.stopPropagation();clearSeqImg('+id+')">✕</button></div>';
    }else{alert(d.error||'Ошибка загрузки');loadSeqs()}
  }catch(e){alert('Ошибка: '+e);loadSeqs()}
}

function addNewSeq(){
  var m=document.getElementById('seqCreateModal');if(m)m.classList.remove('hidden');
  document.getElementById('seqCreateName').value='';
  document.getElementById('seqCreateThreshold').parentElement.classList.add('hidden');
  document.getElementById('seqCreateWeekday').parentElement.classList.add('hidden');
}
function closeSeqModal(){document.getElementById('seqCreateModal').classList.add('hidden')}
function onSeqTriggerChange(){
  var t=document.querySelector('input[name="seqCreateTrigger"]:checked').value;
  var th=document.getElementById('seqCreateThreshold').parentElement;
  var wd=document.getElementById('seqCreateWeekday').parentElement;
  th.classList.toggle('hidden',t!=='low_credits');
  wd.classList.toggle('hidden',t!=='daily');
}
function submitNewSeq(){
  var label=document.getElementById('seqCreateName').value;
  if(!label){alert('Введите название');return}
  var trigger=document.querySelector('input[name="seqCreateTrigger"]:checked')?.value||seqFilter;
  var threshold=trigger==='low_credits'?parseInt(document.getElementById('seqCreateThreshold').value)||null:null;
  var weekday=trigger==='daily'?document.getElementById('seqCreateWeekday').value||null:null;
  P('/admin/push/sequences',{trigger_type:trigger,delay_minutes:0,text:'Текст...',label:label,is_active:false,credits_threshold:threshold,weekday:weekday}).then(function(r){
    if(r.id){closeSeqModal();seqFilter=trigger;loadSeqs()}else alert(r.error||'Ошибка')
  })
}

// Корзина удалённых
var trashData=[];
function toggleTrash(){var el=document.getElementById('trashList');var ar=document.getElementById('trashArrow');if(el.classList.contains('hidden')){loadTrash();el.classList.remove('hidden');if(ar)ar.textContent='▼'}else{el.classList.add('hidden');if(ar)ar.textContent='▶'}}
async function loadTrash(){trashData=await G('/admin/push/sequences/deleted');if(!Array.isArray(trashData))trashData=[];document.getElementById('trashCount').textContent='('+trashData.length+')';renderTrash()}
function renderTrash(){
  var el=document.getElementById('trashList');
  if(!trashData.length){el.innerHTML='<p class="text-slate-600 text-sm py-4 text-center">Корзина пуста</p>';return}
  el.innerHTML=trashData.map(function(s){
    var d=s.deleted_at?new Date(s.deleted_at).toLocaleDateString('ru'):'';
    return '<div class="glass p-3 flex items-center justify-between"><div class="flex-1 min-w-0"><span class="text-white text-sm font-bold">'+esc(s.label)+'</span><span class="text-slate-500 text-xs ml-2">'+s.trigger_type+'</span>'+(d?' <span class="text-slate-600 text-xs">удалён '+d+'</span>':'')+'<p class="text-slate-400 text-xs truncate mt-1">'+esc((s.text||'').substring(0,80))+'</p></div><div class="flex gap-2 ml-3"><button class="btn btn-success text-xs" style="padding:6px 12px" onclick="restoreSeq('+s.id+')">♻️ Вернуть</button><button class="btn btn-danger text-xs" style="padding:6px 12px" onclick="permDeleteSeq('+s.id+')">🗑 Удалить</button></div></div>'
  }).join('')
}
async function restoreSeq(id){await P('/admin/push/sequences/'+id+'/restore',{});loadSeqs();loadTrash()}
async function permDeleteSeq(id){if(!confirm('Удалить навсегда? Это нельзя отменить!'))return;await D('/admin/push/sequences/'+id+'/permanent');loadTrash()}

if(TOKEN)showPanel();
</script></body></html>`;
