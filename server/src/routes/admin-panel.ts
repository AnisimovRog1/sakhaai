import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const adminPanelRouter = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) console.warn('⚠️ ADMIN_PASSWORD не задан — админ-панель отключена');

adminPanelRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD) { res.status(503).json({ error: 'Панель не настроена' }); return; }
  const padded = password ? password.padEnd(ADMIN_PASSWORD.length, '\0') : '\0'.repeat(ADMIN_PASSWORD.length);
  const passOk = password && password.length === ADMIN_PASSWORD.length && crypto.timingSafeEqual(Buffer.from(padded), Buffer.from(ADMIN_PASSWORD));
  if (passOk) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET || ADMIN_PASSWORD, { expiresIn: '7d' });
    res.json({ success: true, token });
  }
  else res.status(401).json({ error: 'Неверный пароль' });
});

adminPanelRouter.get('/', (_req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.type('text/html').send(HTML);
});

const HTML = `<!DOCTYPE html>
<html lang="ru"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UraanxAI Admin</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
*{box-sizing:border-box;margin:0}
body{min-height:100vh;background:#040810;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;overflow-x:hidden;overscroll-behavior-x:none}

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

/* Inline edit */
td.editable{cursor:text;position:relative;transition:background .15s}
td.editable:hover{background:rgba(139,92,246,.08);border-radius:4px}
td.editing input,td.editing select{background:rgba(0,0,0,.3);border:1px solid rgba(139,92,246,.4);border-radius:6px;padding:4px 8px;color:#fff;font-size:12px;width:100%;outline:none;min-width:60px}
td.editing input:focus,td.editing select:focus{border-color:rgba(139,92,246,.7);box-shadow:0 0 0 2px rgba(139,92,246,.15)}
td.auto{color:#475569;cursor:default}
td.sum-clickable{cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}
td.sum-clickable:hover{color:#22d3ee}
tr.payments-detail{background:rgba(6,182,212,.04)}
tr.payments-detail td{padding:0!important}
.payments-mini{margin:8px 16px 8px 32px;font-size:11px}
.payments-mini th{color:#64748b;font-size:10px;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:left}
.payments-mini td{padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.02)}

/* ═══ SIDEBAR LAYOUT ═══ */
.admin-layout{display:flex;min-height:100vh}
.sidebar{width:220px;min-height:100vh;background:rgba(10,15,26,.95);backdrop-filter:blur(20px);border-right:1px solid rgba(255,255,255,.06);position:fixed;left:0;top:0;bottom:0;z-index:40;display:flex;flex-direction:column;overflow-y:auto}
.sidebar-logo{padding:24px 20px 20px;border-bottom:1px solid rgba(255,255,255,.06)}
.sidebar-nav{flex:1;padding:12px 0}
.sidebar-footer{padding:12px 16px;border-top:1px solid rgba(255,255,255,.06)}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;margin:2px 8px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:#64748b;transition:all .2s;white-space:nowrap}
.nav-item:hover{color:#94a3b8;background:rgba(255,255,255,.04)}
.nav-item.active{color:#fff;background:linear-gradient(135deg,rgba(139,92,246,.25),rgba(6,182,212,.15));border:1px solid rgba(139,92,246,.3);box-shadow:0 0 20px rgba(139,92,246,.08)}
.nav-item .nav-icon{width:20px;text-align:center;font-size:15px}
.main-content{margin-left:220px;flex:1;min-height:100vh;overflow-x:hidden}
.content-header{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;background:rgba(10,15,26,.5);backdrop-filter:blur(12px);position:sticky;top:0;z-index:30}
.content-body{padding:24px;max-width:1400px}

/* ═══ STAT CARDS V2 (colored left border) ═══ */
.stat-card-v2{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px 20px;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s}
.stat-card-v2:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.3)}
.stat-card-v2::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:3px 0 0 3px}
.stat-card-v2.border-red::before{background:#ef4444}
.stat-card-v2.border-yellow::before{background:#eab308}
.stat-card-v2.border-green::before{background:#22c55e}
.stat-card-v2.border-orange::before{background:#f97316}
.stat-card-v2.border-violet::before{background:#8b5cf6}
.stat-card-v2.border-cyan::before{background:#06b6d4}
.stat-card-v2.border-pink::before{background:#ec4899}
.stat-card-v2.border-blue::before{background:#3b82f6}
.stat-label-v2{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
.stat-value-v2{font-size:24px;font-weight:800;color:#fff}
.stat-sub-v2{font-size:11px;color:#475569;margin-top:2px}

/* ═══ FIELDSET SECTIONS ═══ */
.section-group{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:20px;position:relative}
.section-group-title{position:absolute;top:-10px;left:16px;background:#040810;padding:0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8b5cf6}

/* ═══ BORDERED TABLES ═══ */
.scroll-container{overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
table.bordered{border-collapse:separate;border-spacing:0;border:1px solid rgba(255,255,255,.08);border-radius:10px;overflow:hidden}
table.bordered th{border-bottom:1px solid rgba(255,255,255,.08);border-right:1px solid rgba(255,255,255,.04);padding:12px 14px}
table.bordered td{border-bottom:1px solid rgba(255,255,255,.04);border-right:1px solid rgba(255,255,255,.03);padding:10px 14px}
table.bordered th:last-child,table.bordered td:last-child{border-right:none}
table.bordered tr:last-child td{border-bottom:none}

/* ═══ CIRCULAR PROGRESS ═══ */
.circular-progress{position:relative;display:inline-flex;align-items:center;justify-content:center}
.circular-progress svg{transform:rotate(-90deg)}
.circular-progress .cp-label{position:absolute;font-size:13px;font-weight:800;color:#fff}
.circular-progress .cp-sublabel{position:absolute;font-size:9px;color:#64748b;margin-top:22px}
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
<div id="panelPage" class="hidden rel admin-layout">
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-lg anim-bounce">💎</div>
        <div><div class="font-bold gradient-text text-lg">UraanxAI</div><div class="text-[10px] text-slate-500">Admin Panel</div></div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-item active" onclick="showTab(this,'dashboard')"><span class="nav-icon">📊</span> Панель</div>
      <div class="nav-item" onclick="showTab(this,'analytics')"><span class="nav-icon">📊</span> Аналитика</div>
      <div class="nav-item" onclick="showTab(this,'users')"><span class="nav-icon">👥</span> Пользователи</div>
      <div class="nav-item" onclick="showTab(this,'pushes')"><span class="nav-icon">📢</span> Пуши</div>
      <div class="nav-item" onclick="showTab(this,'referrals')"><span class="nav-icon">🤝</span> Рефералы</div>
      <div class="nav-item" onclick="showTab(this,'campaigns')"><span class="nav-icon">📣</span> Кампании</div>
      <div class="nav-item" onclick="showTab(this,'adstats')"><span class="nav-icon">📈</span> Реклама</div>
      <div class="nav-item" onclick="showTab(this,'taskplans')"><span class="nav-icon">📝</span> Планы</div>
      <div class="nav-item" onclick="showTab(this,'strategy')"><span class="nav-icon">📋</span> Стратегия</div>
      <div class="nav-item" onclick="showTab(this,'shares')"><span class="nav-icon">🎁</span> Шеринг</div>
    </nav>
    <div class="sidebar-footer">
      <div class="flex items-center gap-1.5 text-xs text-green-400 mb-3"><div class="live-dot"></div> Live</div>
      <button class="btn btn-ghost w-full text-xs mb-2" onclick="location.reload()">🔄 Обновить</button>
      <button class="btn btn-ghost w-full text-xs" onclick="logout()">🚪 Выйти</button>
    </div>
  </aside>
  <div class="main-content">
    <div class="content-header">
      <h1 class="text-xl font-bold gradient-text" id="pageTitle">Панель</h1>
      <div class="flex items-center gap-3">
        <div class="text-xs text-slate-500" id="lastUpdate"></div>
        <button class="btn btn-primary text-xs" onclick="loadStats(currentPeriod)">🔄 Обновить</button>
      </div>
    </div>
    <div class="content-body">

    <!-- DASHBOARD -->
    <div id="tab-dashboard">
      <div class="flex flex-wrap items-center gap-2 mb-5">
        <button class="btn btn-primary" data-period="today"><span class="anim-pulse">📊</span> Сегодня</button>
        <button class="btn btn-ghost" data-period="7d">7д</button>
        <button class="btn btn-ghost" data-period="month">Месяц</button>
        <button class="btn btn-ghost" data-period="2m">2 мес</button>
        <button class="btn btn-ghost" data-period="3m">3 мес</button>
        <button class="btn btn-ghost" data-period="6m">6 мес</button>
        <button class="btn btn-ghost" data-period="1y">Год</button>
      </div>
      <!-- Курс ЦБ -->
      <div class="glass p-4 mb-5 flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-lg">💱</span>
          <span class="text-xs text-slate-400">Курс ЦБ:</span>
          <span id="exRate" class="text-white font-bold">—</span>
          <span class="text-slate-500 text-xs">₽/$</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Базовый:</span>
          <span id="exBase" class="text-slate-300">—</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Множитель:</span>
          <span id="exMult" class="text-cyan-400 font-bold">—</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Обновлён:</span>
          <span id="exUpdated" class="text-slate-300 text-xs">—</span>
        </div>
        <button class="btn btn-ghost text-xs ml-auto" onclick="updateExRate()">🔄 Обновить курс</button>
      </div>
      <div id="revenueBar" class="glass-neon p-5 mb-5 flex items-center justify-between glow-border" style="border-radius:14px"></div>
      <div id="statsGrid" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"></div>
      <div id="statDetail" class="hidden glass-strong p-5 mb-5" style="border-radius:14px">
        <div class="flex items-center justify-between mb-4">
          <h3 id="statDetailTitle" class="text-sm font-bold gradient-text uppercase tracking-wider"></h3>
          <button class="btn btn-ghost text-xs" data-action="closeDetail">✕ Закрыть</button>
        </div>
        <div id="statDetailBody" class="scroll-container"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass-neon p-5"><h3 class="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3"><span class="anim-bounce">🏆</span> Топ активных</h3><div id="topActive"></div></div>
        <div class="glass-cyan p-5"><h3 class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3"><span class="anim-pulse">💎</span> Топ по кредитам</h3><div id="topCredits"></div></div>
      </div>
    </div>

    <!-- USERS -->
    <div id="tab-analytics" class="hidden">
      <div class="flex gap-2 mb-4 flex-wrap">
        <button class="btn btn-primary btn-sm" data-aperiod="today" onclick="loadAnalytics('today')">Сегодня</button>
        <button class="btn btn-ghost btn-sm" data-aperiod="week" onclick="loadAnalytics('week')">Неделя</button>
        <button class="btn btn-ghost btn-sm" data-aperiod="10d" onclick="loadAnalytics('10d')">10 дней</button>
        <button class="btn btn-ghost btn-sm" data-aperiod="15d" onclick="loadAnalytics('15d')">15 дней</button>
        <button class="btn btn-ghost btn-sm" data-aperiod="all" onclick="loadAnalytics('all')">Всё время</button>
      </div>
      <div class="section-group mb-5"><div class="section-group-title">РАСХОД КРЕДИТОВ ПО ПРОДУКТАМ</div><div id="productCards" class="grid grid-cols-2 md:grid-cols-5 gap-3"></div></div>
      <div class="section-group mb-5"><div class="section-group-title">ВЫРУЧКА ₽ ПО ПРОДУКТАМ</div><div id="revenueCards" class="grid grid-cols-2 md:grid-cols-5 gap-3"></div></div>
      <div class="section-group mb-5"><div class="section-group-title">ВОРОНКА (ЮЗЕРФЛОУ)</div><div id="funnelBlock"></div></div>
      <div class="section-group mb-5"><div class="section-group-title">ТРЕНД ПО ДНЯМ</div><div id="dailyTable" class="scroll-container"></div></div>
      <div class="section-group"><div class="section-group-title">ТОП ЮЗЕРЫ ПО РАСХОДУ</div><div id="topUsersAnalytics" class="scroll-container"></div></div>
    </div>

    <div id="tab-users" class="hidden">
      <div class="flex flex-wrap gap-3 mb-4">
        <input id="userSearch" placeholder="🔍 Поиск..." class="flex-1 min-w-[200px]" oninput="filterUsers()">
        <div class="flex gap-2">
          <input id="addCreditsId" placeholder="User ID" class="w-28">
          <input id="addCreditsAmount" placeholder="Сумма" type="number" class="w-24">
          <button class="btn btn-success" onclick="addCredits()"><span class="anim-bounce">💎</span> Начислить</button>
          <button class="btn btn-danger" onclick="removeCredits()" style="padding:10px 16px;font-size:13px">➖ Списать</button>
        </div>
      </div>
      <div class="glass-strong scroll-container">
        <table class="bordered"><thead><tr><th>ID</th><th>Username</th><th>Имя</th><th>App</th><th><span class="anim-pulse">💎</span> Кредиты</th><th>Кампания</th><th>Промо</th><th>Бонус</th><th>Статус</th><th>TZ</th><th>Дата</th><th>Действия</th></tr></thead>
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
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <input id="pushBtnText" placeholder="Текст кнопки (необяз.)" style="font-size:12px">
            <input id="pushBtnUrl" placeholder="webapp = прила, или https://..." style="font-size:12px">
          </div>
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
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="pushTiming" value="now" checked onchange="document.getElementById('pushScheduleTime').style.display='none'" style="accent-color:#7c3aed;width:16px;height:16px"><span class="text-sm text-slate-300">Отправить сразу</span></label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="pushTiming" value="scheduled" onchange="document.getElementById('pushScheduleTime').style.display='flex'" style="accent-color:#7c3aed;width:16px;height:16px"><span class="text-sm text-slate-300">Запланировать</span></label>
            <div id="pushScheduleTime" style="display:none;align-items:center;gap:8px"><input type="datetime-local" id="pushScheduleAt" style="background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px 10px;color:#cbd5e1;font-size:13px"></div>
          </div>
          <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 16px">
            <div style="font-size:11px;color:#94a3b8;font-weight:600;margin-bottom:8px">👥 Получатели:</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;color:#cbd5e1"><input type="radio" name="pushRecipients" value="all" checked style="accent-color:#7c3aed;width:14px;height:14px">Все</label>
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;color:#cbd5e1"><input type="radio" name="pushRecipients" value="active" style="accent-color:#7c3aed;width:14px;height:14px">Активные</label>
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;color:#cbd5e1"><input type="radio" name="pushRecipients" value="purchased" style="accent-color:#7c3aed;width:14px;height:14px">Купившие</label>
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;color:#cbd5e1"><input type="radio" name="pushRecipients" value="not_purchased" style="accent-color:#7c3aed;width:14px;height:14px">Не купившие</label>
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;color:#cbd5e1"><input type="radio" name="pushRecipients" value="low_credits" style="accent-color:#7c3aed;width:14px;height:14px">Кредиты &lt;<input type="number" id="pushCreditsFilter" placeholder="500" style="width:50px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:3px 6px;color:#94a3b8;font-size:11px"></label>
            </div>
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn btn-ghost" style="padding:10px 16px;font-size:13px" onclick="previewPush()">👁 Превью</button>
            <button class="btn btn-primary" style="flex:1;padding:12px;font-size:13px" onclick="createPush(false)">💾 Сохранить</button>
            <button class="btn btn-success" style="flex:1;padding:12px;font-size:13px" onclick="createPush(true)">📨 Отправить</button>
          </div>
        </div>
      </div>

      <!-- Статистика пушей -->
      <div id="pushStatsGrid" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"></div>

      <!-- Таблица пушей -->
      <h3 class="text-base font-bold mb-4 flex items-center gap-2"><span class="anim-pulse">📋</span> Разовые пуши</h3>
      <div class="scroll-container mb-5">
        <table class="bordered">
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
          <div class="flex items-center gap-2">
            <button id="undoBtn" class="text-slate-500 hover:text-white text-sm" onclick="undo()" title="Отменить (Ctrl+Z)" style="opacity:0.3">↩️</button>
            <button id="redoBtn" class="text-slate-500 hover:text-white text-sm" onclick="redo()" title="Повторить (Ctrl+Y)" style="opacity:0.3">↪️</button>
            <button class="btn btn-ghost text-xs" onclick="addNewSeq()">➕ Добавить</button>
          </div>
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

    <!-- REFERRALS -->
    <div id="tab-referrals" class="hidden">
      <div id="refStats" class="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-5"></div>
      <div id="refList"></div>
    </div>

    <!-- CAMPAIGNS -->
    <div id="tab-campaigns" class="hidden">
      <div class="section-group">
        <div class="section-group-title">СОЗДАНИЕ КАМПАНИИ</div>
        <div class="flex gap-3 items-end flex-wrap">
          <div class="flex-1 min-w-[200px]"><label class="text-xs text-slate-400 mb-1 block">Название (блогер / канал)</label><input id="campName" placeholder="Маша_YouTube"></div>
          <button class="btn btn-primary" onclick="createCampaign()">📣 Создать ссылку</button>
        </div>
      </div>
      <div id="campList"></div>

      <div class="section-group mt-6">
        <div class="section-group-title">🎟️ ПРОМОКОДЫ</div>
        <div class="flex gap-3 items-end flex-wrap mb-4">
          <div class="min-w-[150px]"><label class="text-xs text-slate-400 mb-1 block">Кампания</label><select id="promoCampaign"><option value="">— без кампании —</option></select></div>
          <div class="min-w-[150px]"><label class="text-xs text-slate-400 mb-1 block">Код</label><input id="promoCode" placeholder="Darina300"></div>
          <div class="min-w-[100px]"><label class="text-xs text-slate-400 mb-1 block">Бонус (кр)</label><input id="promoBonus" type="number" placeholder="300"></div>
          <div class="min-w-[100px]"><label class="text-xs text-slate-400 mb-1 block">Лимит (0=безл.)</label><input id="promoLimit" type="number" placeholder="0"></div>
          <button class="btn btn-primary" onclick="createPromo()">➕ Создать</button>
        </div>
        <div id="promoList"></div>
      </div>

      <div class="section-group mt-6">
        <div class="section-group-title">📊 ИСПОЛЬЗОВАНИЯ ПРОМО</div>
        <div id="promoUsesList"></div>
      </div>
    </div>

    <!-- AD STATS -->
    <div id="tab-adstats" class="hidden">
      <div class="section-group mb-5">
        <div class="section-group-title">ДОБАВИТЬ РЕКЛАМУ</div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <div><label class="text-xs text-slate-400 block mb-1">Блогер/канал *</label><input id="adBlogger" placeholder="@nickname"></div>
          <div><label class="text-xs text-slate-400 block mb-1">Платформа</label><select id="adPlatform"><option value="instagram">Instagram</option><option value="telegram">Telegram</option></select></div>
          <div><label class="text-xs text-slate-400 block mb-1">Тип рекламы</label><select id="adType"><option value="stories">Stories</option><option value="reels">Reels</option><option value="stories+reels">Stories+Reels</option><option value="post">Post</option></select></div>
        </div>
        <div class="grid grid-cols-3 gap-3 mb-3">
          <div><label class="text-xs text-slate-400 block mb-1">Дата</label><input id="adDate" type="date"></div>
          <div><label class="text-xs text-slate-400 block mb-1">Расход (₽)</label><input id="adCost" type="number" placeholder="0"></div>
          <div><label class="text-xs text-slate-400 block mb-1">Ссылка на креатив</label><input id="adCreative" placeholder="https://..."></div>
        </div>
        <button class="btn btn-primary" onclick="saveAdStat()">+ Добавить</button>
      </div>
      <div id="adStatsSummary" class="grid grid-cols-2 sm:grid-cols-7 gap-3 mb-5"></div>
      <div class="section-group">
        <div class="section-group-title">КАМПАНИИ</div>
        <div class="scroll-container"><table class="bordered text-xs"><thead><tr>
          <th>Блогер</th><th>Платф.</th><th>Тип</th><th>Дата</th><th>Расход ₽</th><th>Просм.</th><th>Лайки</th><th>Сохр.</th><th class="text-slate-600">Открыли</th><th class="text-slate-600">Старт</th><th class="text-slate-600">Оплаты</th><th class="text-slate-600">Сумма ₽</th><th>₽/рег</th><th>Окуп. %</th><th>Конв. %</th><th>Ср. чек</th><th>Креатив</th><th>Заметки</th><th></th>
        </tr></thead><tbody id="adStatsBody"></tbody>
        <tfoot id="adStatsFoot"></tfoot>
        </table></div>
      </div>
      <div id="adTotalsCircular" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5"></div>
    </div>

    <!-- TASK PLANS TAB -->
    <div id="tab-taskplans" class="hidden">
      <div class="glass p-4 mb-4">
        <div class="flex gap-3 items-end flex-wrap">
          <div class="flex-1 min-w-[200px]"><label class="text-xs text-slate-400 mb-1 block">Название плана</label><input id="planTitle" placeholder="Что нужно сделать..."></div>
          <div class="min-w-[140px]"><label class="text-xs text-slate-400 mb-1 block">Дедлайн</label><input id="planDate" type="date"></div>
          <button class="btn btn-primary" onclick="addTaskPlan()">➕ Добавить</button>
        </div>
      </div>
      <div id="taskPlansList"></div>
    </div>

    <!-- STRATEGY TAB (ex-PLANS) -->
    <div id="tab-strategy" class="hidden">
      <div id="goalBlock"></div>
      <div id="plansCategories"></div>
      <div class="section-group mt-5">
        <div class="section-group-title">ШАБЛОНЫ СООБЩЕНИЙ</div>
        <div id="templatesBlock"></div>
      </div>
      <div class="section-group mt-5">
        <div class="section-group-title">СПРАВКА: СЕБЕСТОИМОСТИ</div>
        <div class="glass p-4">
          <table class="bordered text-xs w-full"><thead><tr><th>Пакет</th><th>Цена</th><th>Себест.</th><th>Прибыль</th><th>-30%</th><th>Прибыль -30%</th></tr></thead><tbody>
          <tr><td>Start</td><td>99 &#8381;</td><td>43 &#8381;</td><td class="text-green-400">56 &#8381;</td><td>69 &#8381;</td><td class="text-green-400">26 &#8381;</td></tr>
          <tr><td>Basic</td><td>299 &#8381;</td><td>130 &#8381;</td><td class="text-green-400">169 &#8381;</td><td>209 &#8381;</td><td class="text-green-400">79 &#8381;</td></tr>
          <tr><td>Pro</td><td>799 &#8381;</td><td>347 &#8381;</td><td class="text-green-400">452 &#8381;</td><td>559 &#8381;</td><td class="text-green-400">212 &#8381;</td></tr>
          <tr><td>Max</td><td>1 990 &#8381;</td><td>865 &#8381;</td><td class="text-green-400">1 125 &#8381;</td><td>1 393 &#8381;</td><td class="text-green-400">528 &#8381;</td></tr>
          </tbody></table>
          <div class="text-xs text-slate-500 mt-3">Welcome 300 кр = ~17&#8381; | 10К кр блогеру = ~500&#8381; | 15К = ~750&#8381; | 20К = ~1000&#8381;</div>
        </div>
      </div>
    </div>

    <!-- SHARES TAB -->
    <div id="tab-shares" class="hidden">
      <h2 class="text-lg font-bold gradient-text uppercase tracking-wider mb-4">Бонусы за шеринг</h2>
      <div id="shareStatsCards" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5"></div>
      <div class="glass p-4">
        <h3 class="text-sm font-bold text-white mb-3">Последние шеры</h3>
        <div id="shareRewardsTable" class="text-xs"></div>
      </div>
    </div>

    <!-- Notes Modal -->
    <div id="notesModal" class="hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,.7)">
      <div class="glass-neon p-6 w-full max-w-lg mx-4" style="border-radius:16px">
        <h3 class="text-sm font-bold gradient-text uppercase tracking-wider mb-3">Заметка</h3>
        <textarea id="notesText" rows="6" class="w-full" placeholder="Введите заметку..."></textarea>
        <div class="flex gap-2 mt-3">
          <button class="btn btn-primary flex-1" data-action="saveNote">Сохранить</button>
          <button class="btn btn-ghost" data-action="closeNote">Отмена</button>
        </div>
      </div>
    </div>

    <!-- Reg Analysis Modal -->
    <div id="regAnalysisModal" class="hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,.7)">
      <div class="glass-neon p-6 w-full max-w-2xl mx-4" style="border-radius:16px;max-height:80vh;overflow-y:auto">
        <h3 class="text-sm font-bold gradient-text uppercase tracking-wider mb-4">📊 Анализ за период <span class="text-slate-500 text-xs font-normal">(время МСК)</span></h3>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div><label class="text-xs text-slate-400 block mb-1">От</label><input id="regFrom" type="datetime-local" class="w-full"></div>
          <div><label class="text-xs text-slate-400 block mb-1">До</label><input id="regTo" type="datetime-local" class="w-full"></div>
        </div>
        <div class="flex gap-2 mb-4">
          <button class="btn btn-primary flex-1" data-action="loadRegAnalysis">Показать</button>
          <button class="btn btn-ghost" data-action="closeRegAnalysis">Закрыть</button>
        </div>
        <div id="regAnalysisResult"></div>
      </div>
    </div>

    </div><!-- content-body -->
  </div><!-- main-content -->
</div><!-- panelPage -->

<!-- USER MODAL -->
<div id="userModal" class="modal-bg hidden" onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="modal glass-neon glow-border p-6" id="userModalContent"></div>
</div>

<!-- TELEGRAM PREVIEW MODAL -->
<div id="tgPreviewModal" class="modal-bg hidden" onclick="if(event.target===this)this.classList.add('hidden')">
  <div class="modal glass-neon glow-border p-0" style="max-width:400px;border-radius:16px;overflow:hidden">
    <div style="background:#0e1621;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">
      <div class="flex items-center gap-3">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white">U</div>
        <div><div class="text-white text-sm font-semibold">UraanxAI</div><div class="text-[10px] text-slate-500">bot</div></div>
      </div>
    </div>
    <div style="background:#0e1621;padding:12px 16px;min-height:200px;max-height:70vh;overflow-y:auto" id="tgPreviewBody"></div>
    <div style="background:#0e1621;padding:8px 16px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
      <button class="btn btn-ghost text-xs" onclick="document.getElementById('tgPreviewModal').classList.add('hidden')">Закрыть</button>
    </div>
  </div>
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
  var pe=document.getElementById('passInput');if(!pe)return;const p=pe.value;
  try{const r=await fetch(API+'/panel/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:p})});
  const t=await r.text();let d;try{d=JSON.parse(t)}catch{alert(t);return}
  if(d.success){TOKEN=d.token;localStorage.setItem('at',TOKEN);showPanel()}
  else{const el=document.getElementById('loginError');if(el){el.textContent=d.error||'Неверный пароль';el.classList.remove('hidden')}}}catch(e){alert(e)}
}
function showPanel(){document.getElementById('loginPage').classList.add('hidden');document.getElementById('panelPage').classList.remove('hidden');loadStats('today');loadExRate();startAutoRefresh()}
function logout(){TOKEN='';localStorage.removeItem('at');clearInterval(autoRefresh);location.reload()}

async function apiFetch(p,o){const r=await fetch(API+p,{...o,headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json',...(o?.headers||{})}});const t=await r.text();try{return JSON.parse(t)}catch{return{error:t}}}
function G(p){return apiFetch(p)}
function P(p,d){return apiFetch(p,{method:'POST',body:JSON.stringify(d)})}
function D(p){return apiFetch(p,{method:'DELETE'})}

function showTab(el,n){document.querySelectorAll('[id^=tab-]').forEach(function(e){e.classList.add('hidden')});document.getElementById('tab-'+n).classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(function(e){e.classList.remove('active')});el.classList.add('active');var titles={dashboard:'Панель',users:'Пользователи',pushes:'Пуши',referrals:'Рефералы',campaigns:'Кампании',adstats:'Реклама',analytics:'Аналитика',taskplans:'Планы',strategy:'Стратегия работы',shares:'Шеринг'};var pt=document.getElementById('pageTitle');if(pt)pt.textContent=titles[n]||n;if(n==='analytics')loadAnalytics('today');if(n==='users')loadUsers();if(n==='pushes'){loadPushTemplates();loadPushLog();loadSeqs();loadPushStats()}if(n==='campaigns'){loadCampaigns();loadPromoCodes();loadPromoUses()}if(n==='referrals')loadReferrals();if(n==='adstats')loadAdStats();if(n==='strategy')loadPlansTab();if(n==='taskplans')loadTaskPlans();if(n==='shares')loadSharesTab()}

// Курс ЦБ
async function loadExRate(){
  const d=await G('/admin/exchange-rate');if(!d||d.error)return;
  document.getElementById('exRate').textContent=d.rate?.toFixed(2)||'—';
  document.getElementById('exBase').textContent=d.baseRate?.toFixed(2)||'—';
  document.getElementById('exMult').textContent='×'+(d.multiplier?.toFixed(4)||'1.0000');
  document.getElementById('exUpdated').textContent=d.updatedAt?new Date(d.updatedAt).toLocaleDateString('ru'):'—';
}

async function updateExRate(){
  const d=await P('/admin/exchange-rate/update');if(!d||d.error){alert('Ошибка: '+(d?.error||''));return}
  alert('Курс обновлён: '+d.rate?.toFixed(2)+'₽/$');loadExRate();
}

// Auto-refresh every 30 sec
function startAutoRefresh(){autoRefresh=setInterval(()=>loadStats(currentPeriod),30000)}
let currentPeriod='today';

async function loadStats(period){
  currentPeriod=period;
  var btns=document.querySelectorAll('button[data-period]');btns.forEach(function(b){b.classList.remove('btn-primary');b.classList.add('btn-ghost')});btns.forEach(function(b){if(b.getAttribute('data-period')===period){b.classList.remove('btn-ghost');b.classList.add('btn-primary')}});
  const s=await G('/admin/stats?period='+period);if(s.error)return;
  document.getElementById('lastUpdate').textContent='Обновлено: '+new Date().toLocaleTimeString('ru');
  document.getElementById('revenueBar').innerHTML=
    '<div class="flex items-center gap-4">'+
      '<div class="text-3xl anim-pulse">💰</div>'+
      '<div><div class="text-xs text-slate-400 uppercase tracking-wider font-bold">Выручка за всё время</div>'+
      '<div class="text-3xl font-black gradient-text">'+s.revenueAllTime.toLocaleString('ru')+' ₽</div></div>'+
    '</div>'+
    '<div class="flex gap-6">'+
      '<div class="text-center"><div class="text-2xl font-bold text-cyan-400">'+s.ordersAllTime+'</div><div class="text-xs text-slate-500">Оплат</div></div>'+
      '<div class="text-center"><div class="text-2xl font-bold text-amber-400">'+(s.revenueYesterday||0).toLocaleString('ru')+' ₽</div><div class="text-xs text-slate-500">Вчера</div></div>'+
      '<div class="text-center"><div class="text-2xl font-bold text-violet-400">'+s.revenue+' ₽</div><div class="text-xs text-slate-500">'+s.label+'</div></div>'+
      '<div class="text-center"><div class="text-2xl font-bold text-green-400">'+s.users+'</div><div class="text-xs text-slate-500">Юзеров</div></div>'+
    '</div>';
  document.getElementById('statsGrid').innerHTML=[
    sc('💰','Выручка ('+s.label+')',s.revenue+' ₽','neon','green','revenue'),sc('📈','Прибыль',s.profit+' ₽','neon','yellow'),
    sc('📊','Маржа',s.margin+'%','cyan','cyan'),sc('👥','DAU',s.dau,'cyan','orange','dau'),
    sc('🆕','Новых','+'+s.newUsers,'neon','violet','newUsers'),sc('📝','Запросов',s.transactions,'cyan','blue','chats'),
    sc('🎨','Генераций',s.generations,'neon','pink','generations'),sc('🤝','Рефералов','+'+s.referrals,'cyan','cyan','referrals'),
  ].join('');
  document.getElementById('topActive').innerHTML=topList(s.topActive,'requests','запр.');
  document.getElementById('topCredits').innerHTML=topList(s.topUsers,'credits','кр.');
}
function sc(emoji,label,value,type,border,statKey){var b=border||'violet';var click=statKey?' data-stat="'+statKey+'" style="cursor:pointer"':'';return '<div class="stat-card-v2 border-'+b+'"'+click+'><div class="stat-label-v2">'+emoji+' '+label+'</div><div class="stat-value-v2">'+value+'</div></div>'}

// Period buttons event delegation
document.addEventListener('click',function(e){var btn=e.target.closest('[data-period]');if(btn)loadStats(btn.getAttribute('data-period'))});

// Stat card click → detail
document.addEventListener('click',function(e){var card=e.target.closest('[data-stat]');if(!card)return;var stat=card.getAttribute('data-stat');if(stat==='referrals'){document.querySelectorAll('.nav-item').forEach(function(n){if(n.textContent.indexOf('Рефералы')>-1)n.click()});return}loadStatDetail(stat)});

var statDetailEndpoints={generations:'/admin/generations',dau:'/admin/active-users',newUsers:'/admin/new-users',revenue:'/admin/orders-list',chats:'/admin/detail-chats'};
var statDetailTitles={generations:'Генерации',dau:'Активные пользователи (DAU)',newUsers:'Новые пользователи',revenue:'Оплаты',chats:'Чаты (запросы)'};

async function loadStatDetail(stat){
  var el=document.getElementById('statDetail');var body=document.getElementById('statDetailBody');
  if(!el||!body)return;
  document.getElementById('statDetailTitle').textContent=statDetailTitles[stat]||stat;
  body.innerHTML='<p class="text-slate-400 text-sm">Загрузка...</p>';
  el.classList.remove('hidden');
  el.scrollIntoView({behavior:'smooth',block:'start'});
  var url=statDetailEndpoints[stat];if(!url)return;
  var data=await G(url+'?period='+currentPeriod);if(data.error){body.innerHTML='<p class="text-red-400">'+esc(data.error)+'</p>';return}
  if(!Array.isArray(data)||data.length===0){body.innerHTML='<p class="text-slate-500 text-sm">Нет данных за этот период</p>';return}
  if(stat==='generations')body.innerHTML=renderGenerationsTable(data);
  else if(stat==='chats')body.innerHTML=renderChatsTable(data);
  else if(stat==='newUsers')body.innerHTML=renderNewUsersTable(data);
  else if(stat==='revenue')body.innerHTML=renderOrdersTable(data);
  else if(stat==='dau')body.innerHTML=renderActiveUsersTable(data);
}
function closeStatDetail(){var el=document.getElementById('statDetail');if(el)el.classList.add('hidden')}
document.addEventListener('click',function(e){if(e.target.closest('[data-action="closeDetail"]'))closeStatDetail()});

function renderGenerationsTable(data){
  return '<table class="bordered"><thead><tr><th>#</th><th>Юзер</th><th>TG ID</th><th>Тип</th><th>Промпт</th><th>Стоимость</th><th>Дата</th></tr></thead><tbody>'+
  data.map(function(r,i){return '<tr><td class="text-slate-500 text-xs">'+(i+1)+'</td><td class="text-violet-300">'+(r.username?'@'+esc(r.username):esc(r.first_name||'—'))+'</td><td class="text-slate-500 text-xs font-mono">'+r.user_id+'</td><td><span class="text-xs px-2 py-0.5 rounded-full '+(r.type==='image'?'bg-pink-500/20 text-pink-300':r.type==='video'?'bg-blue-500/20 text-blue-300':r.type==='avatar'?'bg-cyan-500/20 text-cyan-300':'bg-violet-500/20 text-violet-300')+'">'+esc(r.type)+'</span></td><td class="text-xs text-slate-300 max-w-[200px] truncate" title="'+esc(r.prompt||'')+'">'+esc((r.prompt||'').substring(0,60))+(r.prompt&&r.prompt.length>60?'...':'')+'</td><td class="text-yellow-300 text-xs">'+r.cost+' кр</td><td class="text-slate-500 text-xs">'+new Date(r.created_at).toLocaleString('ru',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</td></tr>'}).join('')+'</tbody></table>';
}
function renderChatsTable(data){
  return '<table class="bordered"><thead><tr><th>#</th><th>Юзер</th><th>TG ID</th><th>Название</th><th>Сообщений</th><th>Дата</th></tr></thead><tbody>'+
  data.map(function(r,i){return '<tr data-chat-id="'+r.id+'" style="cursor:pointer" title="Нажмите для просмотра сообщений"><td class="text-slate-500 text-xs">'+(i+1)+'</td><td class="text-violet-300">'+(r.username?'@'+esc(r.username):esc(r.first_name||'—'))+'</td><td class="text-slate-500 text-xs font-mono">'+r.user_id+'</td><td class="text-slate-200 text-sm">'+esc(r.title||'Без названия')+'</td><td class="text-cyan-400 font-bold text-center">'+r.message_count+'</td><td class="text-slate-500 text-xs">'+new Date(r.created_at).toLocaleString('ru',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</td></tr><tr class="chat-messages-row hidden" id="chat-msgs-'+r.id+'"><td colspan="6" class="p-0"><div class="p-3 bg-white/[0.03]"></div></td></tr>'}).join('')+'</tbody></table>';
}
function renderNewUsersTable(data){
  return '<table class="bordered"><thead><tr><th>#</th><th>Username</th><th>TG ID</th><th>Имя</th><th>Кампания</th><th>App</th><th>Дата</th></tr></thead><tbody>'+
  data.map(function(r,i){return '<tr><td class="text-slate-500 text-xs">'+(i+1)+'</td><td class="text-violet-300">'+(r.username?'@'+esc(r.username):'—')+'</td><td class="text-slate-500 text-xs font-mono">'+r.id+'</td><td>'+esc(r.first_name||'—')+'</td><td class="text-xs">'+(r.campaign_code?'<span class="text-cyan-400">'+esc(r.campaign_code)+'</span>':'<span class="text-slate-600">—</span>')+'</td><td class="text-center">'+(r.app_opened?'<span class="text-green-400">📱</span>':'<span class="text-slate-600">—</span>')+'</td><td class="text-slate-500 text-xs">'+new Date(r.created_at).toLocaleString('ru',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</td></tr>'}).join('')+'</tbody></table>';
}
function renderOrdersTable(data){
  return '<table class="bordered"><thead><tr><th>#</th><th>Юзер</th><th>TG ID</th><th>Пакет</th><th>Сумма</th><th>Кредиты</th><th>Дата</th></tr></thead><tbody>'+
  data.map(function(r,i){return '<tr><td class="text-slate-500 text-xs">'+(i+1)+'</td><td class="text-violet-300">'+(r.username?'@'+esc(r.username):esc(r.first_name||'—'))+'</td><td class="text-slate-500 text-xs font-mono">'+r.user_id+'</td><td class="text-xs"><span class="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">'+esc(r.package||'—')+'</span></td><td class="text-green-400 font-bold">'+r.amount_rub+' ₽</td><td class="text-yellow-300">'+r.credits+' кр</td><td class="text-slate-500 text-xs">'+new Date(r.paid_at||r.created_at).toLocaleString('ru',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</td></tr>'}).join('')+'</tbody></table>';
}
function renderActiveUsersTable(data){
  return '<table class="bordered"><thead><tr><th>#</th><th>Юзер</th><th>TG ID</th><th>Запросов</th></tr></thead><tbody>'+
  data.map(function(r,i){return '<tr><td class="text-slate-500 text-xs">'+(i+1)+'</td><td class="text-violet-300">'+(r.username?'@'+esc(r.username):esc(r.first_name||'—'))+'</td><td class="text-slate-500 text-xs font-mono">'+r.user_id+'</td><td class="font-bold gradient-text">'+r.requests+'</td></tr>'}).join('')+'</tbody></table>';
}

// Chat messages drill-down
document.addEventListener('click',function(e){
  var row=e.target.closest('[data-chat-id]');if(!row)return;
  var chatId=row.getAttribute('data-chat-id');
  var msgsRow=document.getElementById('chat-msgs-'+chatId);if(!msgsRow)return;
  if(!msgsRow.classList.contains('hidden')){msgsRow.classList.add('hidden');return}
  var container=msgsRow.querySelector('div');
  container.innerHTML='<p class="text-slate-400 text-xs">Загрузка...</p>';
  msgsRow.classList.remove('hidden');
  G('/admin/chat/'+chatId+'/messages').then(function(data){
    if(data.error){container.innerHTML='<p class="text-red-400 text-xs">'+esc(data.error)+'</p>';return}
    var msgs=data.messages||[];
    if(!msgs.length){container.innerHTML='<p class="text-slate-500 text-xs">Нет сообщений</p>';return}
    container.innerHTML='<div class="text-xs text-slate-500 mb-2">Чат: <span class="text-violet-300">'+esc(data.chat.title||'—')+'</span> | '+(data.chat.username?'@'+esc(data.chat.username):esc(data.chat.first_name||''))+'</div>'+
    msgs.map(function(m){
      var isUser=m.role==='user';
      return '<div class="flex '+(isUser?'justify-end':'justify-start')+' mb-1.5"><div class="max-w-[80%] px-3 py-2 rounded-xl text-xs '+(isUser?'bg-violet-500/20 text-violet-200':'bg-white/[0.07] text-slate-300')+'">'+esc(m.content.substring(0,500))+(m.content.length>500?'...':'')+'<div class="text-slate-600 text-[10px] mt-1">'+new Date(m.created_at).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})+'</div></div></div>';
    }).join('');
  });
})
function topList(arr,key,suf){if(!arr||!arr.length)return'<p class="text-slate-600 text-sm">Пусто</p>';return arr.map((u,i)=>'<div class="flex justify-between py-2.5 text-sm border-b border-white/5"><span class="text-slate-400">'+(i+1)+'. '+(u.username?'@'+esc(u.username):esc(u.first_name||'—'))+' <span class="text-slate-600 text-xs font-mono">'+u.id+'</span></span><span class="font-bold gradient-text">'+u[key]+' '+suf+'</span></div>').join('')}

// USERS
let allUsers=[];
async function loadUsers(){allUsers=await G('/admin/users');if(!Array.isArray(allUsers))allUsers=[];renderUsers(allUsers)}
function renderUsers(list){
  document.getElementById('usersTable').innerHTML=list.map(u=>
    '<tr onclick="showUser('+u.id+')"><td class="text-slate-500 text-xs font-mono">'+u.id+'</td>'+
    '<td class="text-violet-300 font-medium">'+(u.username?'@'+esc(u.username):'—')+'</td>'+
    '<td>'+esc(u.first_name||'—')+'</td>'+
    '<td class="text-center">'+(u.app_opened?'<span title="Открыл приложение" class="text-green-400">📱</span>':'<span title="Только /start" class="text-slate-600">—</span>')+'</td>'+
    '<td class="font-bold gradient-text">'+u.credits+'</td>'+
    '<td class="text-xs">'+(u.campaign_code?'<span class="text-cyan-400">'+esc(u.campaign_code.substring(0,15))+'</span>':'<span class="text-slate-600">—</span>')+'</td>'+
    '<td class="text-xs">'+(u.promo_used?'<span class="text-amber-400 font-mono">'+esc(u.promo_used)+'</span>':'<span class="text-slate-600">—</span>')+'</td>'+
    '<td class="text-xs text-center">'+(u.welcome_bonus_granted?(u.fraud_score>=5?'<span class="text-red-400" title="Антифрод: score='+u.fraud_score+'">0 кр (фрод '+u.fraud_score+')</span>':u.fraud_score>=3?'<span class="text-yellow-400" title="Подозрительный: score='+u.fraud_score+'">50 кр ('+u.fraud_score+')</span>':'<span class="text-green-400" title="score='+u.fraud_score+'">300 кр ✓</span>'):(u.fraud_score!==null&&u.fraud_score!==undefined?'<span class="text-orange-400" title="Бонус не выдан, score='+u.fraud_score+'">ожидание ('+u.fraud_score+')</span>':'<span class="text-slate-500" title="IP пустой или антифрод не запустился">не запустился</span>'))+'</td>'+
    '<td>'+(u.is_banned?'<span class="text-red-400 text-xs font-bold">🚫</span>':'<span class="text-green-400 text-xs">✅</span>')+'</td>'+
    '<td class="text-slate-500 text-xs">UTC'+(u.timezone_offset>=0?'+':'')+Math.round((u.timezone_offset||540)/60)+'</td>'+
    '<td class="text-slate-500 text-xs">'+new Date(u.created_at).toLocaleDateString('ru')+'</td>'+
    '<td onclick="event.stopPropagation()" style="white-space:nowrap"><button class="btn btn-sm '+(u.is_banned?'btn-success':'btn-danger')+'" style="padding:5px 12px;font-size:11px" onclick="toggleBan('+u.id+','+!u.is_banned+')">'+(u.is_banned?'Разбан':'Бан')+'</button> <button class="btn btn-sm" style="padding:5px 10px;font-size:11px;background:#dc2626;color:#fff" onclick="deleteUser('+u.id+')">🗑</button></td></tr>'
  ).join('')}
function filterUsers(){const q=document.getElementById('userSearch').value.toLowerCase();renderUsers(allUsers.filter(u=>(u.username||'').toLowerCase().includes(q)||String(u.id).includes(q)||(u.first_name||'').toLowerCase().includes(q)))}
async function toggleBan(id,ban){await P('/admin/ban',{userId:id,ban});loadUsers()}
async function deleteUser(id){if(!confirm('Удалить юзера '+id+' и ВСЕ его данные? Это необратимо!')){return}const r=await fetch('/admin/user/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+localStorage.getItem('at')}}).then(r=>r.json());if(r.success){alert('✅ Юзер '+id+' удал��н');loadUsers()}else{alert('❌ '+(r.error||'Ошибка'))}}
async function addCredits(){
  const id=document.getElementById('addCreditsId').value,amt=document.getElementById('addCreditsAmount').value;
  if(!id||!amt){alert('Заполните ID и сумму');return}
  const r=await P('/admin/addcredits',{userId:+id,amount:+amt});
  if(r.success){alert('✅ Начислено! Баланс: '+r.newBalance);loadUsers()}else alert('❌ '+r.error)}
async function removeCredits(){
  const id=document.getElementById('addCreditsId').value,amt=document.getElementById('addCreditsAmount').value;
  if(!id||!amt){alert('Заполните ID и сумму');return}
  if(!confirm('Списать '+amt+' кредитов у юзера '+id+'?'))return;
  const r=await P('/admin/addcredits',{userId:+id,amount:-Math.abs(+amt)});
  if(r.success){alert('✅ Списано! Баланс: '+r.newBalance);loadUsers()}else alert('❌ '+r.error)}

// User modal
function closeUserModal(){document.getElementById('userModal').classList.add('hidden')}

async function showUser(id){
  const u=await G('/admin/user/'+id);if(u.error){alert(u.error);return}
  const tz=Math.round((u.timezone_offset||540)/60);
  const localTime=new Date(Date.now()+(u.timezone_offset||540)*60000).toLocaleTimeString('ru',{timeZone:'UTC',hour:'2-digit',minute:'2-digit'});
  document.getElementById('userModalContent').innerHTML=
    '<div class="text-center mb-5">'+
      '<div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-2xl font-bold mb-3">'+esc(u.first_name&&u.first_name[0]?u.first_name[0].toUpperCase():'?')+'</div>'+
      '<h2 class="text-xl font-bold">'+(u.username?'@'+esc(u.username):esc(u.first_name||'—'))+'</h2>'+
      '<p class="text-slate-500 text-sm">ID: '+u.id+'</p>'+
    '</div>'+
    '<div class="grid grid-cols-2 gap-3 mb-4">'+
      '<div class="glass p-3 text-center"><div class="text-lg font-bold gradient-text">'+u.credits+'</div><div class="text-xs text-slate-500">💎 Кредиты</div></div>'+
      '<div class="glass p-3 text-center"><div class="text-lg font-bold text-amber-400">'+u.totalSpent+'</div><div class="text-xs text-slate-500">🔥 Использовано</div></div>'+
      '<div class="glass p-3 text-center"><div class="text-lg font-bold gradient-text">'+u.chats+'</div><div class="text-xs text-slate-500">💬 Чатов</div></div>'+
      '<div class="glass p-3 text-center"><div class="text-lg font-bold gradient-text">'+u.generations+'</div><div class="text-xs text-slate-500">🎨 Генераций</div></div>'+
    '</div>'+
    '<div class="space-y-2 text-sm">'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">🌍 Часовой пояс</span><span>UTC'+(tz>=0?'+':'')+tz+' (сейчас '+localTime+')</span></div>'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">🗣 Язык</span><span>'+(u.language_code==='sah'?'Сахалыы':'Русский')+'</span></div>'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">📅 Регистрация</span><span>'+new Date(u.created_at).toLocaleDateString('ru')+'</span></div>'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">📝 Транзакций</span><span>'+u.transactions+'</span></div>'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">🚫 Забанен</span><span>'+(u.is_banned?'Да':'Нет')+'</span></div>'+
      '<div class="flex justify-between py-2 border-b border-white/5"><span class="text-slate-500">🎁 Welcome бонус</span><span>'+(u.welcome_bonus_granted?'Получен':'Нет')+'</span></div>'+
      '<div class="flex justify-between py-2"><span class="text-slate-500">🛡 Fraud score</span><span>'+(u.fraud_score!==null?u.fraud_score:'—')+'</span></div>'+
    '</div>'+
    (u.orders&&u.orders.length?'<div class="mt-4"><h4 class="text-sm font-bold mb-2 text-green-400">💰 Покупки</h4>'+u.orders.map(function(o){return '<div class="glass p-2 mb-1 flex justify-between text-xs"><span class="text-white font-medium">'+esc(o.package||'—')+'</span><span class="text-amber-400">'+o.amount_rub+'₽</span><span class="gradient-text">+'+o.credits+' кр.</span><span class="'+(o.status==='paid'?'text-green-400':'text-slate-500')+'">'+esc(o.status||'—')+'</span>'+(o.paid_at?'<span class="text-slate-500">'+new Date(o.paid_at).toLocaleDateString('ru')+'</span>':'')+'</div>'}).join('')+'</div>':'<div class="mt-4 text-xs text-slate-600 text-center">Покупок нет</div>')+
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
  var name='',text='';
  try{ name=document.getElementById('pushName').value||''; }catch(e){}
  try{ text=document.getElementById('pushText').value||''; }catch(e){}
  if(!name||!text){alert('Заполните название и текст пуша');return}
  var timing='now';
  try{ timing=document.querySelector('input[name="pushTiming"]:checked')?.value||'now'; }catch(e){}
  var scheduleAt=null;
  if(timing==='scheduled'){
    scheduleAt=document.getElementById('pushScheduleAt')?.value||null;
    if(!scheduleAt){alert('Укажите время отправки');return}
  }
  var mediaType=uploadedMedia?.type||null;
  var mediaFileId=null;
  if(uploadedMedia?.data&&uploadedMedia?.type){
    try{
      var blob=await fetch(uploadedMedia.data).then(function(r){return r.blob()});
      var fd=new FormData();fd.append('photo',blob,uploadedMedia.name||'file.jpg');
      var ur=await fetch(API+'/admin/upload-photo',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN},body:fd});
      var ud=await ur.json();
      if(ud.file_id){mediaFileId=ud.file_id}else{alert('Ошибка загрузки: '+(ud.error||''));return}
    }catch(e){alert('Ошибка загрузки медиа: '+e);return}
  }
  var btnText='',btnUrl='';
  try{ btnText=document.getElementById('pushBtnText')?.value||''; }catch(e){}
  try{ btnUrl=document.getElementById('pushBtnUrl')?.value||''; }catch(e){}
  var body={name:name,text:text,scheduleType:timing==='scheduled'?'scheduled':'manual',sendTime:scheduleAt,mediaType:mediaType,mediaFileId:mediaFileId,buttonText:btnText||null,buttonUrl:btnUrl||null};
  console.log('[createPush] saving template...',body);
  var r;
  try{ r=await P('/admin/push/templates',body); }catch(e){alert('Ошибка сохранения: '+e);return}
  console.log('[createPush] template=',r);
  if(!r||!r.id){alert('Ошибка: '+(r?.error||'шаблон не создан'));return}
  if(send&&timing==='now'){
    var recipients='all';
    try{ recipients=document.querySelector('input[name="pushRecipients"]:checked')?.value||'all'; }catch(e){}
    var creditsFilter=500;
    try{ creditsFilter=parseInt(document.getElementById('pushCreditsFilter')?.value)||500; }catch(e){}
    console.log('[createPush] sending to',recipients,'...');
    var sr;
    try{ sr=await P('/admin/push/send/'+r.id,{recipients:recipients,creditsFilter:creditsFilter}); }catch(e){alert('Ошибка отправки: '+e);return}
    console.log('[createPush] send result=',sr);
    if(sr?.error){alert('Ошибка: '+sr.error);return}
    alert('Отправка запущена: '+sr.total+' юзерам');
  }else if(timing==='scheduled'){
    alert('Пуш запланирован');
  }else{
    alert('Шаблон сохранён');
  }
  try{document.getElementById('pushName').value='';document.getElementById('pushText').value='';document.getElementById('pushBtnText').value='';document.getElementById('pushBtnUrl').value='';clearMedia()}catch(e){}
  loadPushTemplates();
}

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
  var formatted=text.replace(/<<([^>]+)>>/g,'<b>$1</b>').replace(/\\*\\*([^*]+)\\*\\*/g,'<b>$1</b>').replace(/_([^_]+)_/g,'<i>$1</i>');
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
        '<button class="btn btn-success" style="padding:4px 8px;font-size:11px" onclick="sendPushNow('+p.id+')">📨</button>'+
        '<button class="btn btn-ghost" style="padding:4px 8px;font-size:11px" onclick="togglePush('+p.id+')">'+(p.is_active?'⏸':'▶️')+'</button>'+
        '<button class="btn btn-danger" style="padding:4px 8px;font-size:11px" onclick="delPush('+p.id+')">🗑</button>'+
      '</div></td></tr>'
  }).join('')}

async function sendPushNow(id){
  if(!confirm('Отправить этот пуш ВСЕМ пользователям прямо сейчас?'))return;
  try{
    var r=await P('/admin/push/send/'+id,{recipients:'all'});
    if(r.error){alert('Ошибка: '+r.error);return}
    alert('Отправка запущена: '+r.total+' юзерам! Прогресс в логе пушей.');
    loadPushLog();
  }catch(e){alert('Ошибка: '+e)}
}
async function delPush(id){if(!confirm('Удалить пуш?'))return;await D('/admin/push/templates/'+id);loadPushTemplates()}
async function togglePush(id){await apiFetch('/admin/push/templates/'+id+'/toggle',{method:'PUT'});loadPushTemplates()}

async function loadPushLog(){
  const l=await G('/admin/push/log');const el=document.getElementById('pushLogList');
  if(!Array.isArray(l)||!l.length){el.innerHTML='<p class="text-slate-600 text-sm">Рассылок не было</p>';return}
  el.innerHTML='<div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-x-3 gap-y-2 text-sm items-center">'+
    '<span class="text-slate-600 text-[10px] uppercase">Тип</span><span class="text-slate-600 text-[10px] uppercase">Название</span><span class="text-slate-600 text-[10px] uppercase">Дата</span><span class="text-slate-600 text-[10px] uppercase">Отправлено</span><span class="text-slate-600 text-[10px] uppercase">Ошибки</span><span></span>'+
    l.map(x=>{var icon=x.source==='auto'?'🤖':'📨';var date=x.sent_at?new Date(x.sent_at).toLocaleDateString('ru'):'';var fail=x.failed_count>0?'<span class="text-red-400">'+x.failed_count+'</span>':'<span class="text-slate-600">0</span>';var delBtn='';if(x.log_id){delBtn='<button class="text-red-400/60 hover:text-red-400 text-[10px]" onclick="deleteSentPush(\\x27manual\\x27,'+x.log_id+')" title="Удалить у всех">🗑</button>'}else if(x.seq_id){delBtn='<button class="text-red-400/60 hover:text-red-400 text-[10px]" onclick="deleteSentPush(\\x27auto\\x27,'+x.seq_id+')" title="Удалить у всех">🗑</button>'}return '<span>'+icon+'</span><span class="text-white font-medium truncate">'+(x.label||'—')+'</span><span class="text-slate-500 text-xs">'+date+'</span><span class="text-green-400 font-bold">'+x.sent_count+'</span>'+fail+'<span>'+delBtn+'</span>'}).join('')+'</div>'}
async function deleteSentPush(type,id){if(!confirm('Удалить сообщения у всех пользователей?'))return;var url=type==='manual'?'/admin/push/delete-sent/'+id:'/admin/push/delete-auto/'+id;try{var r=await fetch(url,{method:'DELETE',headers:{'Authorization':'Bearer '+localStorage.getItem('at')}}).then(function(r){return r.json()});alert('Удаление запущено: '+(r.total||0)+' сообщений');loadPushLog()}catch(e){alert('Ошибка: '+e)}}

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

    html+='<div class="relative pl-12 pb-5" id="seq-'+s.id+'" draggable="true" ondragstart="seqDragStart(event,'+s.id+')" ondragover="seqDragOver(event)" ondrop="seqDrop(event,'+s.id+')" style="cursor:grab">';
    // Точка на таймлайне
    html+='<div style="position:absolute;left:13px;top:8px;width:16px;height:16px;border-radius:50%;background:'+dotColor+';border:3px solid #0a0f1a;z-index:2"></div>';
    // Время на таймлайне
    html+='<div style="position:absolute;left:-60px;top:6px;width:70px;text-align:right" class="text-xs font-mono '+(active?'text-cyan-400':'text-slate-600')+'">'+delayLabel(s.delay_minutes)+'</div>';

    html+='<div class="glass-strong p-4 '+borderColor+'" style="border-left:3px solid '+(active?'#4ade80':'#334155')+'">';

    // Заголовок + статистика + переключатель
    html+='<div class="flex items-center justify-between mb-2">';
    html+='<div class="flex items-center gap-2"><span class="text-sm font-bold text-white">'+esc(s.label)+'</span>';
    if(s.credits_threshold) html+='<span class="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">&lt; '+s.credits_threshold+' кр.</span>';
    html+='<span class="text-[10px] text-slate-500" id="seqstat-'+s.id+'"></span>';
    html+='</div>';
    html+='<label class="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" '+(active?'checked':'')+' onchange="toggleSeq('+s.id+')" class="w-4 h-4 accent-green-500 rounded"><span class="text-xs font-medium '+(active?'text-green-400':'text-slate-600')+'">'+(active?'✅ Вкл':'Выкл')+'</span></label>';
    html+='</div>';

    // Превью фото + зона загрузки
    html+='<div class="mb-2" id="seqmedia-'+s.id+'">';
    if(s.media_url||s.media_file_id){
      html+='<div class="relative mb-2">';
      var isVid=s.media_type==='video';
      if(s.media_url&&!s.media_url.startsWith('tg://')){
        if(isVid){
          html+='<video src="'+esc(s.media_url)+'" class="w-full rounded-lg" style="max-height:300px;object-fit:contain;background:#111" controls playsinline></video>';
        } else {
          html+='<img src="'+esc(s.media_url)+'" class="w-full rounded-lg" style="max-height:300px;object-fit:contain;background:#111">';
        }
      } else if(s.media_file_id){
        html+='<img id="seqpreview-'+s.id+'" data-fileid="'+esc(s.media_file_id)+'" class="w-full rounded-lg seqimg-lazy" style="max-height:300px;object-fit:contain;background:#111;display:none"><div id="seqloading-'+s.id+'" class="w-full rounded-lg p-4 text-center" style="background:#111;border:1px solid rgba(255,255,255,0.1)"><p class="text-cyan-400 text-sm">⏳ Загрузка '+(isVid?'видео':'фото')+'...</p></div>';
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
    html+='<textarea class="w-full bg-black/20 border border-white/8 rounded-lg p-2.5 text-xs text-slate-300 resize-y leading-relaxed font-mono" rows="4" id="seqtext-'+s.id+'" onfocus="this.dataset.prev=this.value" oninput="markSeqDirty('+s.id+')" onblur="trackUndo('+s.id+',\\x27seqtext-'+s.id+'\\x27)" onkeydown="seqHotkey(event,'+s.id+')">'+esc(s.text)+'</textarea>';

    // Настройки
    html+='<div class="flex gap-2 mt-2 flex-wrap items-center">';
    html+='<input class="flex-1 min-w-[160px] text-[11px] bg-black/20 border border-white/8 rounded-lg px-2 py-1.5 text-slate-400" placeholder="URL фото" value="'+esc(s.media_url||'')+'" id="seqimg-'+s.id+'" oninput="markSeqDirty('+s.id+')"><input type="hidden" id="seqfileid-'+s.id+'" value="'+esc(s.media_file_id||'')+'"><input type="hidden" id="seqmediatype-'+s.id+'" value="'+esc(s.media_type||'')+'"><input type="hidden" id="seqmediawidth-'+s.id+'" value="'+(s.media_width||'')+'"><input type="hidden" id="seqmediaheight-'+s.id+'" value="'+(s.media_height||'')+'">';
    html+='<div class="flex items-center gap-1 text-[11px] text-slate-500"><span>⏱ Через</span><input type="number" class="w-16 bg-black/20 border border-white/8 rounded px-1.5 py-1 text-slate-400 text-center" value="'+s.delay_minutes+'" id="seqdelay-'+s.id+'" oninput="markSeqDirty('+s.id+')"><span>мин после триггера</span></div>';
    html+='<input type="hidden" id="seqhfrom-'+s.id+'" value="'+(s.allow_hour_from||9)+'"><input type="hidden" id="seqhto-'+s.id+'" value="'+(s.allow_hour_to||22)+'">';
    html+='</div>';

    // ═══ Режим отправки ═══
    var sm=s.send_mode||'immediate';
    html+='<div class="flex items-start gap-2 mt-2 text-[11px] text-slate-500">';
    html+='<span class="pt-0.5">📤</span>';
    html+='<div class="flex flex-col gap-1">';
    html+='<label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="seqmode-'+s.id+'" value="immediate" '+(sm==='immediate'?'checked':'')+' onchange="markSeqDirty('+s.id+')"><span>Немедленно</span></label>';
    html+='<label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="seqmode-'+s.id+'" value="strict_time" '+(sm==='strict_time'?'checked':'')+' onchange="markSeqDirty('+s.id+')"><span>Строго в</span><input type="text" class="w-14 bg-black/20 border border-white/8 rounded px-1.5 py-0.5 text-slate-400 text-center" placeholder="10:00" value="'+esc(s.strict_time||'')+'" id="seqstrict-'+s.id+'" oninput="markSeqDirty('+s.id+')"></label>';
    html+='<label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="seqmode-'+s.id+'" value="preferred_time" '+(sm==='preferred_time'?'checked':'')+' onchange="markSeqDirty('+s.id+')"><span>Preferred</span><input type="text" class="w-14 bg-black/20 border border-white/8 rounded px-1.5 py-0.5 text-slate-400 text-center" placeholder="12:00" value="'+esc(s.preferred_time||'')+'" id="seqpref-'+s.id+'" oninput="markSeqDirty('+s.id+')"></label>';
    html+='</div></div>';

    // ═══ Приветствие ═══
    var gm=s.greeting_mode||'none';
    html+='<div class="flex items-center gap-2 mt-2 text-[11px] text-slate-500">';
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

    // ═══ A/B тест ═══
    var abText=s.ab_text||'';
    html+='<div class="mt-2" id="seqab-wrap-'+s.id+'" style="'+(abText?'':'display:none')+'">';
    html+='<div class="flex items-center gap-2 mb-1"><span class="text-[10px] font-bold text-amber-400">B вариант</span><button class="text-red-400/50 hover:text-red-400 text-[10px]" onclick="removeAB('+s.id+')" title="Удалить вариант B">✕</button></div>';
    html+='<textarea class="w-full bg-black/20 border border-amber-500/20 rounded-lg p-2.5 text-xs text-slate-300 resize-y leading-relaxed font-mono" rows="3" id="seqabtext-'+s.id+'" onfocus="this.dataset.prev=this.value" oninput="markSeqDirty('+s.id+')" onblur="trackUndo('+s.id+',\\x27seqabtext-'+s.id+'\\x27)" onkeydown="seqHotkey(event,'+s.id+')">'+esc(abText)+'</textarea>';
    html+='</div>';

    // ═══ Кнопка со ссылкой ═══
    var btnText=s.button_text||'';
    var btnUrl=s.button_url||'';
    html+='<div class="mt-2 grid grid-cols-2 gap-2">';
    html+='<input class="bg-black/20 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300" id="seqbtn-'+s.id+'" placeholder="Текст кнопки" value="'+esc(btnText)+'" oninput="markSeqDirty('+s.id+')" onblur="saveSeq('+s.id+')">';
    html+='<input class="bg-black/20 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300" id="seqbtnurl-'+s.id+'" placeholder="webapp = прила, или https://..." value="'+esc(btnUrl)+'" oninput="markSeqDirty('+s.id+')" onblur="saveSeq('+s.id+')">';
    html+='</div>';

    // ═══ Кнопки сохранения/удаления ═══
    html+='<div class="flex gap-2 mt-2 items-center">';
    html+='<button class="btn btn-primary text-[11px] hidden" id="seqsave-'+s.id+'" onclick="saveSeq('+s.id+')" style="padding:4px 12px">💾 Сохранить</button>';
    html+='<button class="text-violet-400/70 hover:text-violet-400 text-[11px]" onclick="previewSeq('+s.id+')" title="Превью">👁 Превью</button>';
    if(!abText) html+='<button class="text-amber-400/50 hover:text-amber-400 text-[11px]" onclick="addAB('+s.id+')" title="A/B тест">🔀 A/B</button>';
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
  // Загрузить статистику отправок
  loadSentStats();
}

function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function parseNum(s){if(!s)return 0;s=String(s).trim().toLowerCase();var mult=1;if(s.indexOf('млн')>-1||s.indexOf('m')>-1){mult=1000000;s=s.replace(/млн|m/g,'')}else if(s.indexOf('тыс')>-1||s.indexOf('к')>-1||s.indexOf('k')>-1){mult=1000;s=s.replace(/тыс|к|k/g,'')}s=s.replace(/\s/g,'').replace(/,/g,'.');s=s.replace(/[^0-9.\-]/g,'');var n=parseFloat(s);return isNaN(n)?0:Math.round(n*mult)}

function toggleGreetFixed(id,val){var f=document.getElementById('seqgreetfixed-'+id);if(f)f.classList.toggle('hidden',val!=='fixed')}
function markSeqDirty(id){var b=document.getElementById('seqsave-'+id);if(b)b.classList.remove('hidden');startDraftTimer(id)}
function trackUndo(id,fieldId){var el=document.getElementById(fieldId);if(!el)return;if(!el.dataset.prev)el.dataset.prev=el.value;var prev=el.dataset.prev;if(prev!==el.value){pushUndo({id:id,field:fieldId,value:prev});el.dataset.prev=el.value}}

var savingIds={};
async function saveSeq(id){
  if(savingIds[id])return;savingIds[id]=true;
  try{
  var text=document.getElementById('seqtext-'+id).value;
  var media_url=document.getElementById('seqimg-'+id).value||null;
  var media_file_id=document.getElementById('seqfileid-'+id)?.value||null;
  if(media_url&&media_url.startsWith('tg://file_id/')){media_file_id=media_url.replace('tg://file_id/','');media_url=null}
  var delay_minutes=Math.max(0,parseInt(document.getElementById('seqdelay-'+id).value)||0);
  var allow_hour_from=parseInt(document.getElementById('seqhfrom-'+id).value)||9;
  var allow_hour_to=parseInt(document.getElementById('seqhto-'+id).value)||22;
  var send_mode=(document.querySelector('input[name="seqmode-'+id+'"]:checked')||{}).value||'immediate';
  var strict_time=(document.getElementById('seqstrict-'+id)||{}).value||null;
  var preferred_time=(document.getElementById('seqpref-'+id)||{}).value||null;
  var weekday=(document.getElementById('seqweekday-'+id)||{}).value||null;
  var greeting_mode=(document.getElementById('seqgreet-'+id)||{}).value||'none';
  var greeting_fixed=(document.getElementById('seqgreetfixed-'+id)||{}).value||null;
  var s=seqData.find(function(x){return x.id===id});
  var savedMediaType=(document.getElementById('seqmediatype-'+id)||{}).value||null;
  var media_width=parseInt((document.getElementById('seqmediawidth-'+id)||{}).value)||null;
  var media_height=parseInt((document.getElementById('seqmediaheight-'+id)||{}).value)||null;
  var ab_text=(document.getElementById('seqabtext-'+id)||{}).value||null;
  if(ab_text==='')ab_text=null;
  var button_text=(document.getElementById('seqbtn-'+id)||{}).value||null;
  var button_url=(document.getElementById('seqbtnurl-'+id)||{}).value||null;
  if(button_text==='')button_text=null;
  if(button_url==='')button_url=null;
  var r=await P('/admin/push/sequences',{id:id,trigger_type:s.trigger_type,delay_minutes:delay_minutes,credits_threshold:s.credits_threshold,text:text,media_type:(media_url||media_file_id)?savedMediaType:null,media_url:media_url,media_file_id:media_file_id,label:s.label,is_active:s.is_active,allow_hour_from:allow_hour_from,allow_hour_to:allow_hour_to,send_mode:send_mode,strict_time:strict_time,preferred_time:preferred_time,weekday:weekday,greeting_mode:greeting_mode,greeting_fixed:greeting_fixed,media_width:media_width,media_height:media_height,ab_text:ab_text,button_text:button_text,button_url:button_url});
  if(r.id){document.getElementById('seqsave-'+id).classList.add('hidden');if(s)Object.assign(s,r)}
  else alert(r.error||'Ошибка')
  }finally{delete savingIds[id]}
}

// Telegram-style превью сообщения
function previewSeq(id){
  var s=seqData.find(function(x){return x.id===id});if(!s)return;
  var body=document.getElementById('tgPreviewBody');
  var html='';
  // Медиа
  var mediaUrl=s.media_url||'';
  var fid=s.media_file_id||'';
  if(s.media_type==='video'&&(mediaUrl||fid)){
    html+='<video src="'+esc(mediaUrl||'')+'" style="width:100%;border-radius:10px;margin-bottom:8px;max-height:240px;object-fit:cover;background:#000" controls playsinline></video>';
  }else if((s.media_type==='photo'||mediaUrl)&&(mediaUrl||fid)){
    html+='<img src="'+esc(mediaUrl||'')+'" style="width:100%;border-radius:10px;margin-bottom:8px;max-height:240px;object-fit:cover;background:#000">';
  }
  // Текст
  var text=s.text||'';
  text=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  text=text.replace(/&lt;&lt;([^&]+?)&gt;&gt;/g,'<b>$1</b>');
  text=text.replace(/\\*\\*(.+?)\\*\\*/g,'<b>$1</b>');
  text=text.replace(/(?<!\\w)_(.+?)_(?!\\w)/g,'<i>$1</i>');
  text=text.replace(/\\\\n/g,'<br>');
  html+='<div style="background:#182533;border-radius:0 12px 12px 12px;padding:8px 12px;max-width:320px;color:#e4e6ea;font-size:14px;line-height:1.5;word-wrap:break-word;white-space:pre-wrap">'+text+'</div>';
  // Кнопка
  html+='<div style="margin-top:6px;max-width:320px"><div style="background:#2b5278;border-radius:8px;padding:8px;text-align:center;color:#7eb8e6;font-size:13px;cursor:pointer">🚀 Открыть UraanxAI</div></div>';
  // Время
  html+='<div style="text-align:right;color:#5b6d80;font-size:11px;margin-top:4px">'+new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})+'</div>';
  body.innerHTML=html;
  // Если нет URL но есть file_id — подгрузить
  if(!mediaUrl&&fid){
    G('/admin/file-url/'+fid).then(function(d){
      if(d&&d.url){var el=body.querySelector('img,video');if(el)el.src=d.url}
    }).catch(function(){});
  }
  document.getElementById('tgPreviewModal').classList.remove('hidden');
}

// Загрузить статистику отправок
async function loadSentStats(){
  var stats=await G('/admin/push/sequences/sent-stats');
  if(!stats||typeof stats!=='object')return;
  for(var sid in stats){
    var el=document.getElementById('seqstat-'+sid);
    if(el&&stats[sid]&&typeof stats[sid].sent==='number')el.textContent='📤 '+stats[sid].sent+' отпр.';
  }
}

// ═══ Drag & Drop перетаскивание шагов ═══
var seqDragId=null;
function seqDragStart(e,id){seqDragId=id;e.dataTransfer.effectAllowed='move';e.target.style.opacity='0.4'}
function seqDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move'}
async function seqDrop(e,targetId){
  e.preventDefault();
  if(seqDragId===null||seqDragId===targetId)return;
  var src=seqData.find(function(x){return x.id===seqDragId});
  var tgt=seqData.find(function(x){return x.id===targetId});
  if(!src||!tgt)return;
  // Swap delay_minutes
  var tmpDelay=src.delay_minutes;
  src.delay_minutes=tgt.delay_minutes;
  tgt.delay_minutes=tmpDelay;
  // Save both
  var r1=await P('/admin/push/sequences',{id:src.id,trigger_type:src.trigger_type,delay_minutes:src.delay_minutes,credits_threshold:src.credits_threshold,text:src.text,media_type:src.media_type,media_url:src.media_url,media_file_id:src.media_file_id,label:src.label,is_active:src.is_active,allow_hour_from:src.allow_hour_from,allow_hour_to:src.allow_hour_to,send_mode:src.send_mode,strict_time:src.strict_time,preferred_time:src.preferred_time,weekday:src.weekday,greeting_mode:src.greeting_mode,greeting_fixed:src.greeting_fixed,media_width:src.media_width||null,media_height:src.media_height||null,ab_text:src.ab_text||null});
  var r2=await P('/admin/push/sequences',{id:tgt.id,trigger_type:tgt.trigger_type,delay_minutes:tgt.delay_minutes,credits_threshold:tgt.credits_threshold,text:tgt.text,media_type:tgt.media_type,media_url:tgt.media_url,media_file_id:tgt.media_file_id,label:tgt.label,is_active:tgt.is_active,allow_hour_from:tgt.allow_hour_from,allow_hour_to:tgt.allow_hour_to,send_mode:tgt.send_mode,strict_time:tgt.strict_time,preferred_time:tgt.preferred_time,weekday:tgt.weekday,greeting_mode:tgt.greeting_mode,greeting_fixed:tgt.greeting_fixed,media_width:tgt.media_width||null,media_height:tgt.media_height||null,ab_text:tgt.ab_text||null});
  if(!r1.id||!r2.id){alert('Ошибка перетаскивания');src.delay_minutes=tgt.delay_minutes;tgt.delay_minutes=tmpDelay}
  seqDragId=null;
  renderSeqs();
}
document.addEventListener('dragend',function(){seqDragId=null;document.querySelectorAll('[id^="seq-"]').forEach(function(el){el.style.opacity='1'})});

// ═══ Undo/Redo система ═══
var undoStack=[];
var redoStack=[];
function pushUndo(action){undoStack.push(action);if(undoStack.length>50)undoStack.shift();redoStack=[];updateUndoButtons()}
function updateUndoButtons(){var u=document.getElementById('undoBtn');var r=document.getElementById('redoBtn');if(u)u.style.opacity=undoStack.length?'1':'0.3';if(r)r.style.opacity=redoStack.length?'1':'0.3'}
async function undo(){
  if(!undoStack.length)return;
  var a=undoStack.pop();
  redoStack.push({id:a.id,field:a.field,value:document.getElementById(a.field)?.value||''});
  var el=document.getElementById(a.field);if(el)el.value=a.value;
  markSeqDirty(a.id);updateUndoButtons();
}
async function redo(){
  if(!redoStack.length)return;
  var a=redoStack.pop();
  undoStack.push({id:a.id,field:a.field,value:document.getElementById(a.field)?.value||''});
  var el=document.getElementById(a.field);if(el)el.value=a.value;
  markSeqDirty(a.id);updateUndoButtons();
}
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault();undo()}
  if((e.ctrlKey||e.metaKey)&&e.key==='z'&&e.shiftKey){e.preventDefault();redo()}
  if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();redo()}
});

// ═══ Draft автосохранение ═══
var draftTimers={};
function startDraftTimer(id){
  if(draftTimers[id])clearTimeout(draftTimers[id]);
  draftTimers[id]=setTimeout(function(){saveSeq(id);delete draftTimers[id]},8000);
}

async function toggleSeq(id){var r=await apiFetch('/admin/push/sequences/'+id+'/toggle',{method:'PUT'});if(r.error)alert(r.error);else loadSeqs()}
// A/B тест: добавить/удалить вариант B
function addAB(id){var w=document.getElementById('seqab-wrap-'+id);if(w)w.style.display='';markSeqDirty(id)}
function removeAB(id){var w=document.getElementById('seqab-wrap-'+id);if(w)w.style.display='none';var ta=document.getElementById('seqabtext-'+id);if(ta)ta.value='';var s=seqData.find(function(x){return x.id===id});if(s)s.ab_text=null;markSeqDirty(id)}

async function delSeq(id){if(!confirm('Удалить?'))return;await D('/admin/push/sequences/'+id);loadSeqs()}
async function dupeSeq(id){
  var s=seqData.find(function(x){return x.id===id});if(!s)return;
  var r=await P('/admin/push/sequences',{trigger_type:s.trigger_type,delay_minutes:s.delay_minutes,credits_threshold:s.credits_threshold,text:s.text,media_type:s.media_type,media_url:s.media_url,media_file_id:s.media_file_id,label:s.label+' (копия)',is_active:false,allow_hour_from:s.allow_hour_from,allow_hour_to:s.allow_hour_to,send_mode:s.send_mode,strict_time:s.strict_time,preferred_time:s.preferred_time,weekday:s.weekday,greeting_mode:s.greeting_mode,greeting_fixed:s.greeting_fixed,media_width:s.media_width||null,media_height:s.media_height||null,ab_text:s.ab_text||null});
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
  var ta=e.target;if(!ta||ta.tagName!=='TEXTAREA')return;
  if((e.ctrlKey||e.metaKey)&&e.key==='b'){e.preventDefault();var start=ta.selectionStart,end=ta.selectionEnd,text=ta.value,sel=text.substring(start,end);ta.value=text.substring(0,start)+'<<'+sel+'>>'+text.substring(end);ta.selectionStart=start+2;ta.selectionEnd=start+2+sel.length;ta.focus();markSeqDirty(id)}
  if((e.ctrlKey||e.metaKey)&&e.key==='i'){e.preventDefault();var start=ta.selectionStart,end=ta.selectionEnd,text=ta.value,sel=text.substring(start,end);ta.value=text.substring(0,start)+'_'+sel+'_'+text.substring(end);ta.selectionStart=start+1;ta.selectionEnd=start+1+sel.length;ta.focus();markSeqDirty(id)}
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
  if(media){var els=media.querySelectorAll('img,video,.relative');for(var i=0;i<els.length;i++)els[i].remove()}
  var imgEl=document.getElementById('seqimg-'+id);if(imgEl)imgEl.value='';
  var fid=document.getElementById('seqfileid-'+id);if(fid)fid.value='';
  var mt=document.getElementById('seqmediatype-'+id);if(mt)mt.value='';
  var mw=document.getElementById('seqmediawidth-'+id);if(mw)mw.value='';
  var mh=document.getElementById('seqmediaheight-'+id);if(mh)mh.value='';
  var s=seqData.find(function(x){return x.id===id});
  if(s){s.media_url=null;s.media_type=null;s.media_file_id=null;s.media_width=null;s.media_height=null}
  await saveSeq(id);
}

// Выбор файла
function seqPickFile(id){document.getElementById('seqfile-'+id).click()}
function seqDropFile(e,id){var f=e.dataTransfer.files[0];if(f&&(f.type.startsWith('image/')||f.type.startsWith('video/')))uploadSeqMedia(f,id)}
function seqFileSelect(e,id){var f=e.target.files[0];if(f)uploadSeqMedia(f,id)}
// Получить реальные размеры видео через HTML5 Video API
function getVideoSize(file){
  return new Promise(function(resolve){
    if(!file.type.startsWith('video/')){resolve({w:null,h:null});return}
    var resolved=false;
    var video=document.createElement('video');
    video.preload='auto';
    video.muted=true;
    function done(){
      if(resolved)return;resolved=true;
      var w=video.videoWidth||null;
      var h=video.videoHeight||null;
      URL.revokeObjectURL(video.src);
      resolve({w:w,h:h});
    }
    video.onloadedmetadata=done;
    video.onloadeddata=done;
    video.oncanplay=done;
    video.onerror=function(){if(!resolved){resolved=true;resolve({w:null,h:null})}};
    video.src=URL.createObjectURL(file);
    video.load();
    setTimeout(function(){if(!resolved){resolved=true;resolve({w:null,h:null})}},15000);
  });
}

async function uploadSeqMedia(file,id){
  var media=document.getElementById('seqmedia-'+id);
  var isVideo=file.type.startsWith('video/');
  if(media){var old=media.querySelector('.relative');if(old)old.remove();var zone=media.querySelector('[ondragover]');if(zone)zone.innerHTML='<p class="text-cyan-400 text-xs">⏳ Загрузка...</p>'}
  // Определяем реальные размеры видео ДО загрузки
  var realSize=await getVideoSize(file);
  var fd=new FormData();fd.append('photo',file);
  if(realSize.w&&realSize.h){fd.append('width',String(realSize.w));fd.append('height',String(realSize.h))}
  try{
    var r=await fetch(API+'/admin/upload-photo',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN},body:fd});
    var d=await r.json();
    if(d.file_id){
      var imgUrl=d.file_url||'';
      document.getElementById('seqimg-'+id).value=imgUrl;
      var hiddenFid=document.getElementById('seqfileid-'+id);if(hiddenFid)hiddenFid.value=d.file_id;
      var mtype=d.media_type||(isVideo?'video':'photo');
      // Приоритет: реальные размеры с клиента (HTML5 Video API), fallback — от Telegram API
      var actualW=realSize.w||d.width||null;
      var actualH=realSize.h||d.height||null;
      var s=seqData.find(function(x){return x.id===id});
      if(s){s.media_url=imgUrl;s.media_type=mtype;s.media_file_id=d.file_id;s.media_width=actualW;s.media_height=actualH}
      var mtypeInput=document.getElementById('seqmediatype-'+id);if(mtypeInput)mtypeInput.value=mtype;
      var mwInput=document.getElementById('seqmediawidth-'+id);if(mwInput)mwInput.value=actualW||'';
      var mhInput=document.getElementById('seqmediaheight-'+id);if(mhInput)mhInput.value=actualH||'';
      await saveSeq(id);
      var blobUrl=imgUrl?null:URL.createObjectURL(file);
      var previewSrc=imgUrl||blobUrl;
      var mediaTag=isVideo?'<video src="'+previewSrc+'" class="w-full rounded-lg" style="max-height:300px;object-fit:contain;background:#111" controls playsinline></video>':'<img src="'+previewSrc+'" class="w-full rounded-lg" style="max-height:300px;object-fit:contain;background:#111">';
      if(media)media.innerHTML='<div class="relative mb-2">'+mediaTag+'<button class="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-red-600 text-white text-lg flex items-center justify-center shadow-lg cursor-pointer" onclick="event.stopPropagation();clearSeqImg('+id+')">✕</button></div>';
      if(blobUrl)setTimeout(function(){URL.revokeObjectURL(blobUrl)},5000);
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

// ═══ REFERRALS ═══
async function loadReferrals(){
  var d=await G('/admin/referrals/full');if(!d||d.error){return}
  var s=d.stats||{};
  document.getElementById('refStats').innerHTML=
    '<div class="glass p-3 text-center"><div class="text-lg font-bold gradient-text">'+(s.total||0)+'</div><div class="text-xs text-slate-500">Всего</div></div>'+
    '<div class="glass p-3 text-center"><div class="text-lg font-bold text-green-400">'+(s.paid||0)+'</div><div class="text-xs text-slate-500">Оплачено</div></div>'+
    '<div class="glass p-3 text-center"><div class="text-lg font-bold text-amber-400">'+(s.pending||0)+'</div><div class="text-xs text-slate-500">Ожидание</div></div>'+
    '<div class="glass p-3 text-center"><div class="text-lg font-bold text-blue-400">'+(s.held||0)+'</div><div class="text-xs text-slate-500">Холд</div></div>'+
    '<div class="glass p-3 text-center"><div class="text-lg font-bold text-red-400">'+(s.rejected||0)+'</div><div class="text-xs text-slate-500">Отклонено</div></div>'+
    '<div class="glass p-3 text-center"><div class="text-lg font-bold text-cyan-400">'+Number(s.total_rewards||0).toLocaleString('ru')+'</div><div class="text-xs text-slate-500">Награды (кр.)</div></div>';
  // Группировка по рефереру
  var rows=d.referrals||[];
  var grouped={};var order=[];
  rows.forEach(function(r){
    var key=r.referrer_id;
    if(!grouped[key]){grouped[key]={id:key,name:r.referrer_username?'@'+r.referrer_username:r.referrer_name,refs:[],paid:0,pending:0,totalReward:0};order.push(key)}
    grouped[key].refs.push(r);
    if(r.status==='paid'){grouped[key].paid++;grouped[key].totalReward+=r.reward_credits||0}
    else{grouped[key].pending++}
  });
  var el=document.getElementById('refList');
  if(!order.length){el.innerHTML='<p class="text-slate-500 text-center py-8">Нет рефералов</p>';return}
  el.innerHTML=order.map(function(key){
    var g=grouped[key];
    return '<div class="glass p-4 mb-3" id="ref-'+key+'">'+
      '<div class="flex items-center justify-between cursor-pointer" onclick="toggleRefUsers('+key+')">'+
        '<div class="flex items-center gap-3"><span class="text-slate-500 text-xs" id="ref-arrow-'+key+'">&#9654;</span>'+
        '<span class="text-violet-300 font-bold text-sm cursor-pointer" onclick="event.stopPropagation();showUser('+key+')">'+esc(g.name)+'</span></div>'+
        '<div class="flex gap-3 text-xs">'+
          '<span class="text-slate-400">Всего: <span class="text-white font-bold">'+g.refs.length+'</span></span>'+
          '<span class="text-green-400">Оплачено: <span class="font-bold">'+g.paid+'</span></span>'+
          '<span class="text-amber-400">Ожидание: <span class="font-bold">'+g.pending+'</span></span>'+
          '<span class="text-cyan-400">Награда: <span class="font-bold">'+g.totalReward.toLocaleString('ru')+' кр.</span></span>'+
        '</div>'+
      '</div>'+
      '<div id="ref-users-'+key+'" class="hidden mt-4">'+
        '<div class="scroll-container"><table class="text-xs"><thead><tr>'+
          '<th>Приглашённый</th><th>Статус</th><th>Пакет</th><th>Награда</th><th>AI запрос</th><th>Приглашён</th><th>Оплата</th>'+
        '</tr></thead><tbody>'+
        g.refs.map(function(r){
          var stColor=r.status==='paid'?'text-green-400':r.status==='pending'?'text-amber-400':r.status==='held'?'text-blue-400':'text-red-400';
          return '<tr>'+
            '<td class="text-cyan-300 font-medium cursor-pointer" onclick="showUser('+r.referee_id+')">'+(r.referee_username?'@'+esc(r.referee_username):esc(r.referee_name))+'</td>'+
            '<td class="'+stColor+' font-bold">'+r.status+'</td>'+
            '<td>'+(r.package||'<span class="text-slate-600">—</span>')+'</td>'+
            '<td class="font-bold">'+(r.reward_credits?'+'+r.reward_credits+' кр.':'<span class="text-slate-600">—</span>')+'</td>'+
            '<td class="text-center">'+(r.has_ai_request?'<span class="text-green-400">✓</span>':'<span class="text-slate-600">✗</span>')+'</td>'+
            '<td class="text-slate-500">'+new Date(r.created_at).toLocaleDateString('ru')+'</td>'+
            '<td class="text-slate-500">'+(r.paid_at?new Date(r.paid_at).toLocaleDateString('ru'):'—')+'</td>'+
          '</tr>'
        }).join('')+
        '</tbody></table></div>'+
      '</div>'+
    '</div>'
  }).join('')
}
function toggleRefUsers(id){
  var el=document.getElementById('ref-users-'+id);if(!el)return;
  var arrow=document.getElementById('ref-arrow-'+id);
  if(el.classList.contains('hidden')){el.classList.remove('hidden');if(arrow)arrow.innerHTML='&#9660;'}
  else{el.classList.add('hidden');if(arrow)arrow.innerHTML='&#9654;'}
}

// ═══ CAMPAIGNS ═══
var campCache={};
var CAMP_PAGE_SIZE=50;
async function createCampaign(){
  var n=document.getElementById('campName').value.trim();
  if(!n){alert('Введите название');return}
  var r=await P('/admin/campaigns',{name:n});
  if(r.error){alert(r.error);return}
  document.getElementById('campName').value='';
  loadCampaigns()
}
async function loadCampaigns(){
  var data=await G('/admin/campaigns');
  if(!Array.isArray(data)){data=[]}
  var el=document.getElementById('campList');
  if(!data.length){el.innerHTML='<p class="text-slate-500 text-center py-8">Нет кампаний</p>';return}
  el.innerHTML=data.map(function(c){
    var link='https://t.me/UraanxAI_bot?start=c_'+c.code;
    var conv=c.total_users>0?Math.round(c.opened_app/c.total_users*100):0;
    var payConv=c.total_users>0?Math.round(c.paid_users/c.total_users*100):0;
    return '<div class="glass p-4 mb-3" id="camp-'+c.code+'">'+
    '<div class="flex items-center justify-between mb-3 cursor-pointer" data-code="'+c.code+'" onclick="toggleCampUsers(this.dataset.code)">'+
    '<div class="flex items-center gap-3 flex-1 min-w-0"><span class="text-slate-500 text-xs">&#9654;</span><span class="text-white font-bold text-sm" id="camp-arrow-'+c.code+'">'+esc(c.name)+'</span><span class="text-slate-500 text-xs">'+new Date(c.created_at).toLocaleDateString('ru')+'</span></div>'+
    '<div class="flex gap-2" onclick="event.stopPropagation()"><button class="btn btn-danger text-xs" style="padding:4px 10px" onclick="deleteCamp('+c.id+')">✕</button></div></div>'+
    '<div class="flex gap-2 mb-3 flex-wrap"><input value="'+link+'" readonly class="flex-1 text-xs font-mono bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-cyan-400 min-w-0" onclick="this.select()"><button class="btn btn-ghost text-xs" data-link="'+link+'" onclick="navigator.clipboard.writeText(this.dataset.link)">📋 Копировать</button></div>'+
    '<div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">'+
    '<div class="glass p-2 rounded-lg"><div class="text-lg font-bold gradient-text">'+c.total_users+'</div><div class="text-xs text-slate-500">/start</div></div>'+
    '<div class="glass p-2 rounded-lg"><div class="text-lg font-bold text-green-400">'+c.opened_app+'</div><div class="text-xs text-slate-500">Открыли ('+conv+'%)</div></div>'+
    '<div class="glass p-2 rounded-lg"><div class="text-lg font-bold text-violet-400">'+c.paid_users+'</div><div class="text-xs text-slate-500">Купили ('+payConv+'%)</div></div>'+
    '<div class="glass p-2 rounded-lg"><div class="text-lg font-bold text-amber-400">'+Number(c.total_revenue).toLocaleString('ru')+'</div><div class="text-xs text-slate-500">Доход ₽</div></div>'+
    '<div class="glass p-2 rounded-lg"><div class="text-lg font-bold text-cyan-400">'+conv+'%</div><div class="text-xs text-slate-500">Конверсия</div></div>'+
    '</div>'+
    '<div id="camp-users-'+c.code+'" class="hidden mt-4">'+
    '<div class="flex gap-2 mb-3 items-center"><input id="camp-search-'+c.code+'" placeholder="Поиск по имени или @username" class="flex-1 text-xs" data-code="'+c.code+'" oninput="filterCampUsers(this.dataset.code)"><span id="camp-count-'+c.code+'" class="text-xs text-slate-500"></span></div>'+
    '<div class="scroll-container"><table class="text-xs"><thead><tr><th>ID</th><th>Username</th><th>Имя</th><th>App</th><th>Кредиты</th><th>Покупки</th><th>Чаты</th><th>Пригласил</th><th>Бонус</th><th>Регистрация</th><th>Последний визит</th></tr></thead>'+
    '<tbody id="camp-tbody-'+c.code+'"></tbody></table></div>'+
    '<div id="camp-pager-'+c.code+'" class="flex justify-center gap-2 mt-3"></div>'+
    '</div></div>'
  }).join('')
}
async function deleteCamp(id){if(!confirm('Удалить кампанию?'))return;await D('/admin/campaigns/'+id);loadCampaigns()}

// ── Промокоды ──
async function loadCampaignSelect(){
  var data=await G('/admin/campaigns');
  if(!Array.isArray(data))data=[];
  var sel=document.getElementById('promoCampaign');
  if(!sel)return;
  sel.innerHTML='<option value="">\\u2014 без кампании \\u2014</option>'+data.map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+'</option>'}).join('');
}
async function createPromo(){
  var code=document.getElementById('promoCode').value.trim();
  var bonus=parseInt(document.getElementById('promoBonus').value)||0;
  var limit=parseInt(document.getElementById('promoLimit').value)||0;
  var campId=document.getElementById('promoCampaign').value||null;
  if(!code||!bonus){alert('Введите код и бонус');return}
  var r=await P('/admin/promo-codes',{code:code,bonusCredits:bonus,maxUses:limit||null,campaignId:campId?parseInt(campId):null});
  if(r.error){alert(r.error);return}
  document.getElementById('promoCode').value='';
  document.getElementById('promoBonus').value='';
  document.getElementById('promoLimit').value='';
  loadPromoCodes()
}
async function loadPromoCodes(){
  loadCampaignSelect();
  var data=await G('/admin/promo-codes');
  if(!Array.isArray(data))data=[];
  var el=document.getElementById('promoList');
  if(!data.length){el.innerHTML='<p class="text-slate-500 text-center py-4">Нет промокодов</p>';return}
  el.innerHTML='<table class="bordered w-full text-xs"><thead><tr><th>Кампания</th><th>Код</th><th>Бонус</th><th>Лимит</th><th>Исполь.</th><th>Статус</th><th></th></tr></thead><tbody>'+
    data.map(function(p){
      return '<tr><td class="text-slate-400">'+(p.campaign_name?esc(p.campaign_name):'\\u2014')+'</td>'+
        '<td class="font-mono font-bold text-cyan-400">'+esc(p.code)+'</td>'+
        '<td class="text-green-400">+'+p.bonus_credits+'</td>'+
        '<td>'+(p.max_uses||'\\u221E')+'</td>'+
        '<td>'+p.used_count+'</td>'+
        '<td>'+(p.is_active?'<span class="text-green-400">Активен</span>':'<span class="text-red-400">Выкл</span>')+'</td>'+
        '<td><button class="btn btn-ghost text-xs" style="padding:2px 8px" onclick="togglePromo('+p.id+')">'+(p.is_active?'Выкл':'Вкл')+'</button></td></tr>'
    }).join('')+'</tbody></table>'
}
async function togglePromo(id){await P('/admin/promo-codes/'+id+'/toggle',{});loadPromoCodes()}
async function loadPromoUses(){
  var data=await G('/admin/promo-uses');
  if(!Array.isArray(data))data=[];
  var el=document.getElementById('promoUsesList');
  if(!data.length){el.innerHTML='<p class="text-slate-500 text-center py-4">Пока нет использований</p>';return}
  el.innerHTML='<table class="bordered w-full text-xs"><thead><tr><th>Дата</th><th>Юзер</th><th>Промокод</th><th>Пакет</th><th>Сумма</th><th>Бонус</th></tr></thead><tbody>'+
    data.map(function(u){
      return '<tr><td>'+new Date(u.created_at).toLocaleDateString('ru')+'</td>'+
        '<td>'+esc(u.first_name||'')+(u.username?' @'+esc(u.username):'')+'</td>'+
        '<td class="font-mono text-cyan-400">'+esc(u.code)+'</td>'+
        '<td>'+(u.package||'—')+'</td>'+
        '<td>'+(u.amount_rub?u.amount_rub+'\\u20BD':'—')+'</td>'+
        '<td class="text-green-400">+'+u.credits_awarded+'</td></tr>'
    }).join('')+'</tbody></table>'
}
async function toggleCampUsers(code){
  var el=document.getElementById('camp-users-'+code);
  if(!el)return;
  if(!el.classList.contains('hidden')){el.classList.add('hidden');return}
  el.classList.remove('hidden');
  if(!campCache[code]){
    var tbody=document.getElementById('camp-tbody-'+code);
    tbody.innerHTML='<tr><td colspan="11" class="text-center text-slate-500 py-4">Загрузка...</td></tr>';
    var users=await G('/admin/campaigns/'+code+'/users');
    campCache[code]={all:Array.isArray(users)?users:[],filtered:null,page:0};
  }
  renderCampPage(code)
}
function filterCampUsers(code){
  var d=campCache[code];if(!d)return;
  var q=(document.getElementById('camp-search-'+code).value||'').toLowerCase();
  d.filtered=q?d.all.filter(function(u){return(u.username||'').toLowerCase().includes(q)||(u.first_name||'').toLowerCase().includes(q)||String(u.id).includes(q)}):null;
  d.page=0;
  renderCampPage(code)
}
function renderCampPage(code){
  var d=campCache[code];if(!d)return;
  var list=d.filtered||d.all;
  var total=list.length;
  var pages=Math.ceil(total/CAMP_PAGE_SIZE)||1;
  var p=Math.min(d.page,pages-1);
  var slice=list.slice(p*CAMP_PAGE_SIZE,(p+1)*CAMP_PAGE_SIZE);
  document.getElementById('camp-count-'+code).textContent=total+' юзеров';
  document.getElementById('camp-tbody-'+code).innerHTML=slice.map(function(u){
    var purch=u.purchases?u.purchases.map(function(p){return p.package+' ('+p.amount_rub+'₽)'}).join(', '):'<span class="text-slate-600">—</span>';
    return '<tr><td class="text-slate-500 font-mono">'+u.id+'</td>'+
    '<td class="text-violet-300 font-medium">'+(u.username?'@'+esc(u.username):'—')+'</td>'+
    '<td>'+esc(u.first_name)+'</td>'+
    '<td class="text-center">'+(u.app_opened?'<span class="text-green-400">📱</span>':'<span class="text-slate-600">—</span>')+'</td>'+
    '<td class="font-bold gradient-text">'+u.credits+'</td>'+
    '<td>'+purch+'</td>'+
    '<td class="text-center">'+u.chat_count+'</td>'+
    '<td class="text-center">'+(u.invited_count>0?'<span class="text-cyan-400 font-bold">'+u.invited_count+'</span>':'0')+'</td>'+
    '<td class="text-center">'+(u.welcome_bonus_granted?'<span class="text-amber-400">✓</span>':'—')+'</td>'+
    '<td class="text-slate-500">'+new Date(u.created_at).toLocaleDateString('ru')+'</td>'+
    '<td class="text-slate-500">'+(u.last_seen?new Date(u.last_seen).toLocaleDateString('ru'):'—')+'</td></tr>'
  }).join('');
  var pager=document.getElementById('camp-pager-'+code);
  if(pages<=1){pager.innerHTML='';return}
  var btns='';
  for(var i=0;i<pages;i++){
    btns+='<button class="btn btn-sm '+(i===p?'btn-primary':'btn-ghost')+'" style="padding:4px 10px;font-size:11px;min-width:32px" data-code="'+code+'" data-page="'+i+'" onclick="campCache[this.dataset.code].page=+this.dataset.page;renderCampPage(this.dataset.code)">'+(i+1)+'</button>'
  }
  pager.innerHTML=btns
}

// ═══ AD STATS ═══
async function loadAdStats(){
  var resp=await G('/admin/ad-stats');
  var data=Array.isArray(resp)?resp:(resp&&resp.campaigns?resp.campaigns:[]);
  var revenueAllTime=resp&&resp.revenueAllTime?resp.revenueAllTime:0;
  var totals={cost:0,views:0,likes:0,saves:0,launches:0,regs:0,payC:0,payS:0};
  var tbody=document.getElementById('adStatsBody');
  tbody.innerHTML=data.length?data.map(function(r){
    totals.cost+=r.ad_cost||0;totals.views+=r.views||0;totals.likes+=r.likes||0;totals.saves+=r.saves||0;
    totals.launches+=r.app_launches||0;totals.regs+=r.registrations||0;totals.payC+=r.payments_count||0;totals.payS+=r.payments_sum||0;
    var cpr=r.registrations>0?Math.round(r.ad_cost/r.registrations):'—';
    var roas=r.ad_cost>0?Math.round(r.payments_sum/r.ad_cost*100):'—';
    var cr=r.app_launches>0?Math.round(r.payments_count/r.app_launches*100):'—';
    var avgChk=r.payments_count>0?Math.round(r.payments_sum/r.payments_count):'—';
    var pBadge=r.platform==='telegram'?'<span class="text-blue-400">TG</span>':'<span class="text-pink-400">IG</span>';
    var dateVal=r.campaign_date?r.campaign_date.substring(0,10):'';
    var dateFmt=dateVal?new Date(r.campaign_date).toLocaleDateString('ru'):'—';
    var ed=function(cls,field,type,val,display){return '<td class="editable '+cls+'" data-id="'+r.id+'" data-field="'+field+'" data-type="'+type+'" data-value="'+esc(String(val))+'" onclick="inlineEdit(this)">'+display+'</td>'};
    return '<tr id="ad-row-'+r.id+'">'+
      ed('text-violet-300 font-medium','blogger_name','text',r.blogger_name,esc(r.blogger_name)+(r.ref_campaign_id?' <span class="text-[10px] text-cyan-500">авто</span>':''))+
      ed('','platform','select:instagram,telegram',r.platform,pBadge)+
      ed('text-slate-400','ad_type','select:stories,reels,stories+reels,post',r.ad_type,esc(r.ad_type))+
      ed('text-slate-500','campaign_date','date',dateVal,dateFmt)+
      ed('text-amber-400 font-bold','ad_cost','number',r.ad_cost||0,(r.ad_cost||0).toLocaleString('ru'))+
      ed('','views','number',r.views||0,(r.views||0).toLocaleString('ru'))+
      ed('','likes','number',r.likes||0,(r.likes||0).toLocaleString('ru'))+
      ed('','saves','number',r.saves||0,(r.saves||0).toLocaleString('ru'))+
      '<td class="auto text-green-400">'+(r.app_launches||0).toLocaleString('ru')+'</td>'+
      '<td class="auto text-cyan-400">'+(r.registrations||0).toLocaleString('ru')+'</td>'+
      '<td class="auto text-green-400 font-bold">'+(r.payments_count||0)+'</td>'+
      '<td class="auto sum-clickable text-green-400 font-bold" onclick="togglePayments('+r.id+')">'+(r.payments_sum||0).toLocaleString('ru')+'</td>'+
      '<td class="'+(typeof cpr==='number'&&cpr<50?'text-green-400':'text-slate-300')+'">'+cpr+'</td>'+
      '<td class="'+(typeof roas==='number'&&roas>=100?'text-green-400 font-bold':'text-red-400')+'">'+roas+(typeof roas==='number'?'%':'')+'</td>'+
      '<td>'+cr+(typeof cr==='number'?'%':'')+'</td>'+
      '<td>'+(typeof avgChk==='number'?avgChk.toLocaleString('ru')+'₽':'—')+'</td>'+
      '<td>'+(r.creative_url?'<a href="'+esc(r.creative_url)+'" target="_blank" class="text-violet-400 hover:underline">Ссылка</a>':ed('text-slate-600','creative_url','text','','—'))+'</td>'+
      '<td class="text-slate-500 cursor-pointer hover:text-violet-300" data-note-id="'+r.id+'" data-note-text="'+esc(r.notes||'')+'">'+(r.notes?'<span title="'+esc(r.notes)+'">📝</span>':'<span class="text-slate-600">—</span>')+'</td>'+
      '<td class="flex gap-1"><button class="btn btn-ghost text-xs" style="padding:3px 8px" data-analyze-date="'+(r.campaign_date||'')+'" data-action="openRegAnalysis">📊</button><button class="btn btn-danger text-xs" style="padding:3px 8px" onclick="deleteAdStat('+r.id+')">✕</button></td>'+
    '</tr>'
  }).join(''):'<tr><td colspan="19" class="text-center text-slate-500 py-8">Нет записей. Добавьте рекламную кампанию.</td></tr>';
  // Footer totals
  var tCpr=totals.regs>0?Math.round(totals.cost/totals.regs):'—';
  var tRoas=totals.cost>0?Math.round(totals.payS/totals.cost*100):'—';
  var tCr=totals.launches>0?Math.round(totals.payC/totals.launches*100):'—';
  var tAvg=totals.payC>0?Math.round(totals.payS/totals.payC):'—';
  document.getElementById('adStatsFoot').innerHTML='<tr class="font-bold text-white border-t border-white/10">'+
    '<td>ИТОГО</td><td></td><td></td><td></td>'+
    '<td class="text-amber-400">'+totals.cost.toLocaleString('ru')+'</td>'+
    '<td>'+totals.views.toLocaleString('ru')+'</td><td>'+totals.likes.toLocaleString('ru')+'</td><td>'+totals.saves.toLocaleString('ru')+'</td>'+
    '<td class="text-green-400">'+totals.launches.toLocaleString('ru')+'</td><td class="text-cyan-400">'+totals.regs.toLocaleString('ru')+'</td>'+
    '<td class="text-green-400">'+totals.payC+'</td><td class="text-green-400">'+totals.payS.toLocaleString('ru')+'</td>'+
    '<td>'+tCpr+'</td><td class="'+(typeof tRoas==='number'&&tRoas>=100?'text-green-400':'text-red-400')+'">'+tRoas+(typeof tRoas==='number'?'%':'')+'</td>'+
    '<td>'+tCr+(typeof tCr==='number'?'%':'')+'</td>'+
    '<td>'+(typeof tAvg==='number'?tAvg.toLocaleString('ru')+'₽':'—')+'</td>'+
    '<td></td><td></td><td></td></tr>';
  // Summary cards (v2)
  document.getElementById('adStatsSummary').innerHTML=
    sc('💰','Расход',totals.cost.toLocaleString('ru')+'₽','','yellow')+
    sc('💵','Доход',totals.payS.toLocaleString('ru')+'₽','','green')+
    sc('💎','Выручка',revenueAllTime.toLocaleString('ru')+'₽','','cyan')+
    sc('📈','Окупаемость',tRoas+(typeof tRoas==='number'?'%':''),'',typeof tRoas==='number'&&tRoas>=100?'green':'red')+
    sc('🎯','₽/регистр.',tCpr,'','violet')+
    sc('💳','Ср. чек',(typeof tAvg==='number'?tAvg.toLocaleString('ru')+'₽':'—'),'','cyan')+
    sc('📊','Кампаний',data.length,'','blue');
  // Circular progress
  var el=document.getElementById('adTotalsCircular');
  if(el){
    var items=[
      {label:'Окуп.',value:typeof tRoas==='number'?tRoas:0,max:200,color:'#22c55e',suffix:'%'},
      {label:'Конв.',value:typeof tCr==='number'?tCr:0,max:100,color:'#8b5cf6',suffix:'%'},
      {label:'Расход',value:totals.cost,max:Math.max(totals.cost+totals.payS,1),color:'#eab308',suffix:''},
      {label:'Доход',value:totals.payS,max:Math.max(totals.cost+totals.payS,1),color:'#06b6d4',suffix:''}
    ];
    el.innerHTML=items.map(function(item){
      var pct=Math.min(Math.round(item.value/(item.max||1)*100),100);
      var r=40;var c=Math.round(2*3.14159*r);var offset=Math.round(c-(pct/100)*c);
      var displayVal=item.suffix?item.value+item.suffix:item.value.toLocaleString('ru')+'₽';
      return '<div class="stat-card-v2 border-violet text-center" style="padding:20px">'+
        '<div class="circular-progress mx-auto mb-3" style="width:100px;height:100px">'+
          '<svg width="100" height="100">'+
            '<circle cx="50" cy="50" r="'+r+'" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="8"></circle>'+
            '<circle cx="50" cy="50" r="'+r+'" fill="none" stroke="'+item.color+'" stroke-width="8" stroke-dasharray="'+c+'" stroke-dashoffset="'+offset+'" stroke-linecap="round"></circle>'+
          '</svg>'+
          '<span class="cp-label">'+pct+'%</span>'+
        '</div>'+
        '<div class="text-white font-bold text-sm">'+displayVal+'</div>'+
        '<div class="stat-label-v2 mt-1">'+item.label+'</div>'+
      '</div>'
    }).join('')
  }
}

function inlineEdit(td){
  if(td.classList.contains('editing'))return;
  var id=td.getAttribute('data-id');
  var field=td.getAttribute('data-field');
  var type=td.getAttribute('data-type');
  var currentValue=td.getAttribute('data-value')||'';
  td.classList.add('editing');
  var input;
  if(type.indexOf('select:')===0){
    var options=type.split(':')[1].split(',');
    input=document.createElement('select');
    options.forEach(function(o){
      var opt=document.createElement('option');
      opt.value=o;opt.textContent=o;
      if(o===currentValue)opt.selected=true;
      input.appendChild(opt);
    });
  }else{
    input=document.createElement('input');
    input.type=type==='date'?'date':'text';
    input.value=currentValue==='—'?'':currentValue;
    if(type==='number'){input.style.width='100px';input.inputMode='numeric'}
  }
  td.textContent='';
  td.appendChild(input);
  input.focus();
  var saving=false;
  function save(){
    if(saving)return;saving=true;
    var val=input.value;
    if(type==='number')val=String(parseNum(val));
    td.classList.remove('editing');
    var payload={id:id};
    payload[field]=val;
    P('/admin/ad-stats',payload).then(function(){loadAdStats()});
  }
  input.addEventListener('blur',save);
  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();save()}
    if(e.key==='Escape'){td.classList.remove('editing');loadAdStats()}
  });
}

// Notes modal
var currentNoteId=null;
document.addEventListener('click',function(e){
  var cell=e.target.closest('[data-note-id]');if(!cell)return;
  currentNoteId=cell.getAttribute('data-note-id');
  document.getElementById('notesText').value=cell.getAttribute('data-note-text')||'';
  var modal=document.getElementById('notesModal');modal.classList.remove('hidden');modal.style.display='flex';
  document.getElementById('notesText').focus();
});
document.addEventListener('click',function(e){
  if(e.target.closest('[data-action="saveNote"]')){
    var text=document.getElementById('notesText').value;
    P('/admin/ad-stats',{id:currentNoteId,notes:text}).then(function(){
      var modal=document.getElementById('notesModal');modal.classList.add('hidden');modal.style.display='';
      loadAdStats();
    });
  }
  if(e.target.closest('[data-action="closeNote"]')){
    var modal=document.getElementById('notesModal');modal.classList.add('hidden');modal.style.display='';
  }
});

// Reg Analysis modal
document.addEventListener('click',function(e){
  if(e.target.closest('[data-action="openRegAnalysis"]')){
    var btn=e.target.closest('[data-action="openRegAnalysis"]');
    var dateStr=btn.getAttribute('data-analyze-date')||'';
    var fromDate,toDate;
    if(dateStr){
      fromDate=dateStr.substring(0,10)+'T00:00';
      var d=new Date(dateStr);d.setDate(d.getDate()+2);
      toDate=d.toISOString().substring(0,10)+'T23:59';
    }else{
      var now=new Date();
      fromDate=now.toISOString().substring(0,10)+'T00:00';
      toDate=now.toISOString().substring(0,10)+'T23:59';
    }
    document.getElementById('regFrom').value=fromDate;
    document.getElementById('regTo').value=toDate;
    document.getElementById('regAnalysisResult').innerHTML='';
    var modal=document.getElementById('regAnalysisModal');modal.classList.remove('hidden');modal.style.display='flex';
  }
  if(e.target.closest('[data-action="loadRegAnalysis"]')){
    var from=document.getElementById('regFrom').value;
    var to=document.getElementById('regTo').value;
    if(!from||!to){alert('Выберите диапазон');return}
    var result=document.getElementById('regAnalysisResult');
    result.innerHTML='<p class="text-slate-400 text-sm">Загрузка...</p>';
    G('/admin/registrations-range?from='+encodeURIComponent(from)+':00+03:00&to='+encodeURIComponent(to)+':00+03:00').then(function(resp){
      var users=resp&&resp.users?resp.users:[];
      var st=resp&&resp.stats?resp.stats:{};
      if(!users.length){result.innerHTML='<p class="text-slate-500 text-sm">Нет данных за этот период</p>';return}
      result.innerHTML='<div class="grid grid-cols-4 gap-3 mb-3">'+
        '<div class="glass p-3 text-center"><div class="text-xl font-bold gradient-text">'+(st.totalUsers||0)+'</div><div class="text-xs text-slate-500">/start</div></div>'+
        '<div class="glass p-3 text-center"><div class="text-xl font-bold text-green-400">'+(st.appOpened||0)+'</div><div class="text-xs text-slate-500">Открыли</div></div>'+
        '<div class="glass p-3 text-center"><div class="text-xl font-bold text-cyan-400">'+(st.paidUsers||0)+'</div><div class="text-xs text-slate-500">Оплат</div></div>'+
        '<div class="glass p-3 text-center"><div class="text-xl font-bold text-amber-400">'+(st.paidSum||0).toLocaleString('ru')+' ₽</div><div class="text-xs text-slate-500">Сумма</div></div>'+
      '</div>'+
      '<div class="scroll-container" style="max-height:300px"><table class="bordered text-xs"><thead><tr><th>#</th><th>Username</th><th>TG ID</th><th>Имя</th><th>Кампания</th><th>App</th><th>Оплата</th><th>Дата (МСК)</th></tr></thead><tbody>'+
      users.map(function(u,i){return '<tr><td class="text-slate-500">'+(i+1)+'</td><td class="text-violet-300">'+(u.username?'@'+esc(u.username):'—')+'</td><td class="text-slate-500 font-mono">'+u.id+'</td><td>'+esc(u.first_name||'—')+'</td><td>'+(u.campaign_code?'<span class="text-cyan-400">'+esc(u.campaign_code)+'</span>':'<span class="text-slate-600">—</span>')+'</td><td class="text-center">'+(u.app_opened?'<span class="text-green-400">📱</span>':'—')+'</td><td class="text-center">'+(+u.paid_count>0?'<span class="text-amber-400 font-bold">'+u.paid_sum.toLocaleString('ru')+' ₽</span>':'—')+'</td><td class="text-slate-500">'+new Date(u.created_at).toLocaleString('ru',{timeZone:'Europe/Moscow',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</td></tr>'}).join('')+
      '</tbody></table></div>';
    });
  }
  if(e.target.closest('[data-action="closeRegAnalysis"]')){
    var modal=document.getElementById('regAnalysisModal');modal.classList.add('hidden');modal.style.display='';
  }
});

async function togglePayments(id){
  var existingRow=document.getElementById('payments-detail-'+id);
  if(existingRow){existingRow.remove();return}
  var row=document.getElementById('ad-row-'+id);
  if(!row)return;
  var data=await G('/admin/ad-stats/'+id+'/payments');
  if(!Array.isArray(data)||data.length===0){
    var emptyRow=document.createElement('tr');
    emptyRow.id='payments-detail-'+id;emptyRow.className='payments-detail';
    emptyRow.innerHTML='<td colspan="19"><div class="payments-mini text-slate-500 py-2">Нет чеков</div></td>';
    row.after(emptyRow);return;
  }
  var detailRow=document.createElement('tr');
  detailRow.id='payments-detail-'+id;detailRow.className='payments-detail';
  detailRow.innerHTML='<td colspan="19"><div class="payments-mini"><table width="100%">'+
    '<thead><tr><th>Пользователь</th><th>Пакет</th><th>Сумма ₽</th><th>Дата оплаты</th></tr></thead>'+
    '<tbody>'+data.map(function(p){
      return '<tr><td class="text-violet-300">@'+esc(p.username||p.first_name||'—')+'</td>'+
        '<td>'+esc(p.package)+'</td>'+
        '<td class="text-green-400">'+(p.amount_rub||0).toLocaleString('ru')+' ₽</td>'+
        '<td class="text-slate-500">'+(p.paid_at?new Date(p.paid_at).toLocaleString('ru'):'—')+'</td></tr>';
    }).join('')+'</tbody></table></div></td>';
  row.after(detailRow);
}

async function saveAdStat(){
  var b=document.getElementById('adBlogger').value.trim();
  if(!b){alert('Введите имя блогера/канала');return}
  var payload={
    blogger_name:b,
    platform:document.getElementById('adPlatform').value,
    ad_type:document.getElementById('adType').value,
    campaign_date:document.getElementById('adDate').value||null,
    ad_cost:document.getElementById('adCost').value||0,
    creative_url:document.getElementById('adCreative').value||null
  };
  console.log('[saveAdStat] payload',JSON.stringify(payload));
  var resp=await P('/admin/ad-stats',payload);
  console.log('[saveAdStat] resp',JSON.stringify(resp));
  document.getElementById('adBlogger').value='';document.getElementById('adCost').value='';
  document.getElementById('adCreative').value='';
  loadAdStats()
}
async function deleteAdStat(id){if(!confirm('Удалить запись?'))return;await D('/admin/ad-stats/'+id);loadAdStats()}

// ═══ ПЛАНЫ ═══
var plansData=[];
var goalData=null;
var progressData=null;

var TMPL1='Здравствуйте!\\n\\nМы UraanxAI \\u2014 AI-стартап из Якутии, развиваем новое направление для региона. Приложение работает прямо в Telegram \\u2014 ничего скачивать не нужно.\\n\\nЧто умеет:\\n- Оживляет фото (фото начинает двигаться, улыбаться)\\n- Генерирует трендовые AI-фото и видео\\n- AI-чат на базе Gemini (мощнее ChatGPT)\\n- Создает говорящие AI-аватары\\n\\nСейчас формат оживления фото набирает огромные охваты в Reels \\u2014 идеально для вовлечения аудитории.\\n\\nХотим предложить сотрудничество:\\n- Вам: [10К/15К/20К] кредитов для создания контента [+ X руб за публикацию]\\n- Персональный промокод \\u2014 Ваши подписчики получат бонус при покупке, а Вы сможете отслеживать охват\\n- От Вас: 1 Reels \\u2014 оживляете свое фото + Ваша реакция\\n\\nВыгода для Вас:\\n- Трендовый AI-контент = высокие охваты\\n- Промокод с Вашим именем = вовлечение подписчиков + лояльность и благодарность от подписчиков\\n- Поддержка якутского стартапа = крутая история для аудитории\\n\\nВыгода для Ваших подписчиков:\\n- Бонусные кредиты по Вашему промокоду\\n- Доступ к AI-инструментам без скачивания приложений\\n- Оживление фото, AI-фото, чат \\u2014 все в одном месте\\n- Освоение передовых AI-инструментов, которые меняют подход к созданию контента\\n\\nМы развиваем AI-направление для Якутии и были бы рады Вашей поддержке. Вот как это выглядит: [демо-видео]\\n\\nЕсли интересно \\u2014 отправлю доступ прямо сейчас.';
var TMPL2='Здравствуйте! Написали Вам в директ \\u2014 предложение по сотрудничеству от AI-стартапа из Якутии!';
var TEMPLATES=[{name:'Сотрудничество (инста + ТГ)',text:TMPL1},{name:'Комментарий (если ДМ не видят)',text:TMPL2}];

var CAT_NAMES={features:'ФИЧИ (13 апреля)',content:'VIRALMAXING',bloggers:'БЛОГЕРЫ',schedule:'ГРАФИК',may9:'ПРОГРЕВ 9 МАЯ',scale:'МАСШТАБИРОВАНИЕ'};
var CAT_ORDER=['features','content','bloggers','schedule','may9','scale'];

async function loadPlansTab(){
  var [plans,progress]=await Promise.all([G('/admin/plans'),G('/admin/goals/progress')]);
  plansData=Array.isArray(plans)?plans:[];
  progressData=progress;
  goalData=progress?.goal||null;
  renderGoal();
  renderPlans();
  renderTemplates();
}

function renderGoal(){
  var el=document.getElementById('goalBlock');
  if(!el)return;
  var g=goalData;
  var todayRev=progressData?.today_revenue||0;
  var totalRev=progressData?.total_revenue||0;
  var target=g?g.target_rub:200000;
  var pct=target>0?Math.min(100,Math.round(totalRev/target*100)):0;
  var remain=Math.max(0,target-totalRev);
  var daysLeft='';
  if(g&&g.deadline){
    var dl=new Date(g.deadline);
    var now=new Date();
    var diff=Math.ceil((dl.getTime()-now.getTime())/(1000*60*60*24));
    daysLeft=diff>0?diff+' дней':'Просрочено';
  }
  var prices={start:99,basic:299,pro:799,max:1990};
  var remainPkgs=['start','basic','pro','max'];
  var todayBp=progressData?.today_by_package||[];
  var remainHtml=remainPkgs.map(function(pk){
    var price=prices[pk]||250;
    var need=Math.ceil(remain/price);
    return '<div class="glass p-2 rounded-lg text-center"><div class="text-lg font-bold text-amber-400">'+need+'</div><div class="text-xs text-slate-500">'+pk+' ('+price+'&#8381;)</div></div>';
  }).join('');
  var todayHtml=todayBp.map(function(p){return '<span class="glass px-3 py-1.5 rounded text-xs"><b class="text-green-400">'+p.cnt+'</b> '+esc(p.package||'?')+' ('+Number(p.sum).toLocaleString('ru')+'&#8381;)</span>'}).join(' ');
  if(!todayHtml) todayHtml='<span class="text-xs text-slate-600">Нет оплат сегодня</span>';

  el.innerHTML='<div class="section-group mb-5"><div class="section-group-title">ЦЕЛЬ</div>'+
    '<div class="glass-neon p-5">'+
    '<div class="flex justify-between items-center mb-3">'+
    '<div class="text-sm font-bold">'+(g?esc(g.name):'Цель не установлена')+'</div>'+
    '<div class="text-xs text-slate-400">'+(daysLeft?'до '+new Date(g.deadline).toLocaleDateString('ru')+' ('+daysLeft+')':'')+'</div></div>'+
    '<div class="w-full bg-white/5 rounded-full h-4 mb-3 overflow-hidden"><div class="h-full rounded-full transition-all" style="width:'+pct+'%;background:linear-gradient(90deg,#7c3aed,#06b6d4)"></div></div>'+
    '<div class="flex justify-between text-sm mb-3"><span class="gradient-text font-bold">'+Number(totalRev).toLocaleString('ru')+' &#8381;</span><span class="text-slate-400">/ '+Number(target).toLocaleString('ru')+' &#8381; ('+pct+'%)</span></div>'+
    '<div class="text-xs text-slate-400 mb-2">Осталось: <b class="text-white">'+Number(remain).toLocaleString('ru')+' &#8381;</b></div>'+
    '<div class="text-xs text-slate-500 mb-2">Осталось оплат до цели:</div>'+
    '<div class="grid grid-cols-4 gap-2 mb-4">'+remainHtml+'</div>'+
    '<div class="text-xs text-slate-500 mb-2">Оплаты сегодня:</div>'+
    '<div class="flex flex-wrap gap-2 mb-4">'+todayHtml+'</div>'+
    '<div class="flex gap-2 items-end flex-wrap">'+
    '<div class="flex-1 min-w-[140px]"><label class="text-xs text-slate-400 block mb-1">Название</label><input id="goalName" class="w-full text-xs" value="'+(g?esc(g.name):'')+'"></div>'+
    '<div class="w-[120px]"><label class="text-xs text-slate-400 block mb-1">Цель &#8381;</label><input id="goalTarget" type="number" class="w-full text-xs" value="'+target+'"></div>'+
    '<div class="w-[120px]"><label class="text-xs text-slate-400 block mb-1">Выручка &#8381;</label><input id="goalRevenue" type="number" class="w-full text-xs" value="'+(g?g.current_revenue||0:0)+'"></div>'+
    '<div class="w-[130px]"><label class="text-xs text-slate-400 block mb-1">Начало</label><input id="goalStartDate" type="date" class="w-full text-xs" value="'+(g&&g.start_date?g.start_date.substring(0,10):'')+'"></div>'+
    '<div class="w-[130px]"><label class="text-xs text-slate-400 block mb-1">Дедлайн</label><input id="goalDeadline" type="date" class="w-full text-xs" value="'+(g&&g.deadline?g.deadline.substring(0,10):'')+'"></div>'+
    '<button class="btn btn-primary text-xs" onclick="saveGoal()">Сохранить</button>'+
    '</div></div></div>';
}

async function saveGoal(){
  var n=document.getElementById('goalName').value.trim()||'Цель';
  var t=parseInt(document.getElementById('goalTarget').value)||200000;
  var d=document.getElementById('goalDeadline').value||null;
  var sd=document.getElementById('goalStartDate').value||null;
  var rev=parseInt(document.getElementById('goalRevenue').value)||0;
  var r=await P('/admin/goals',{name:n,target_rub:t,deadline:d,start_date:sd,current_revenue:rev});
  if(r&&r.error){alert('Ошибка: '+r.error)}else{alert('Сохранено! Выручка: '+(r.current_revenue||rev)+' ₽')}
  loadPlansTab();
}

var CAT_INFO={
features:'<b>Цель: 100-200К руб за первую неделю</b><br>100К = ~400 оплат (200 Start + 120 Basic + 50 Pro + 10 Max)<br>200К = ~770 оплат',
content:'<b>Каждое утро 20-30 мин:</b> скроллим Reels, TikTok, Pipiads<br>Находим виральное видео в нише AI/фото<br>Разбираем: хук + содержание + CTA<br>Переделываем под UraanxAI<br>Публикуем 1-3 Reels/день<br><b>Формула:</b> ХУК (0-2 сек) &#8594; СОДЕРЖАНИЕ (охватное + обучающее) &#8594; CTA',
bloggers:'<b>Где искать:</b> Instagram #якутск #якутия #yakutsk | LabelUp/Getblogger | tgstat.ru | Паблики Якутска<br><b>Каждый вечер:</b> 15-25 новых блогеров найти + написать<br>Кто не ответил в ДМ &#8594; комментарий под последний Reels<br><br><b>Бартер инста:</b><br>1-5К: 10К кр (~500&#8381;) | 5-30К: 15К кр (~750&#8381;) | 30-100К: 20К кр (~1000&#8381;) + 3-5К&#8381;<br><b>Бартер ТГ:</b><br>1-5К: 10К кр | 5-20К: 15К кр + 0-2К&#8381; | 20-50К: 20К кр + 3-5К&#8381;<br>Паблики/каналы: Stories с лицом блогера + ссылка<br><br><b>6 сценариев видео</b> (все с оживлением фото блогером):<br>1. Оживление + реакция (основной, 15-30с)<br>2. Оживление + реставрация старого фото + эмоции (самый вирусный)<br>3. Оживление + рассказ о приле (все возможности + промокод)<br>4. Оживление + реферальная система (25% за друга)<br>5. Оживление + другие возможности (студийное фото, AI-чат)<br>6. Оживление + угадай (где AI? в комментах)',
schedule:'<b>День 1 (13 апр):</b> фичи в прилу + таблица блогеров + написать ВСЕМ + 5 демо<br><b>День 2 (14 апр):</b> VIRALMAXING рилсы + согласовать рекламы + запустить + вечером новым блогерам<br><b>День 3 (15 апр):</b> 1-3 Reels + обработка ответов + комментарии неответившим + 15-25 новых<br><b>День 4 (16 апр):</b> 1-3 Reels + первые выкладки блогеров + проверка промокодов + новые блогеры<br><b>День 5 (17 апр):</b> 1-3 Reels + анализ промокодов + вторая волна блогеров + ч/б фото (прогрев 9 мая)<br><b>День 6 (18 апр):</b> 1-3 Reels + полный анализ: DAU, покупки, выручка, ROI + удвоить что работает<br><b>День 7 (19 апр):</b> 1-3 Reels + ИТОГИ НЕДЕЛИ: выручка vs цель, ROI по промокодам, что работает/нет<br><br><b>Каждый день:</b> утро VIRALMAXING &#8594; 1-3 Reels &#8594; блогеры (бартер / бартер+оплата) &#8594; вечер 15-25 новых<br><b>Стратегия:</b> бартер + бартер+оплата. Если работает &#8594; продолжаем той же стратегией',
may9:'С 25 апреля начинаем прогрев ч/б фото<br>1-4 мая: "Выберем подписчиков \\u2014 бесплатно оживим фото ветеранов"<br>8-9 мая: максимум контента',
scale:'Якутия сработала (конверсия > 3%) &#8594; тот же плейбук:<br>Бурятия &#8594; Иркутск &#8594; Хабаровск &#8594; Красноярск'
};

function renderPlans(){
  var el=document.getElementById('plansCategories');
  if(!el)return;
  var html='';
  CAT_ORDER.forEach(function(cat){
    var items=plansData.filter(function(p){return p.category===cat});
    var done=items.filter(function(p){return p.is_done}).length;
    html+='<div class="section-group mb-4"><div class="section-group-title">'+CAT_NAMES[cat]+' <span class="text-slate-500 font-normal">('+done+'/'+items.length+')</span></div>';
    if(CAT_INFO[cat]){var saved=localStorage.getItem('plan_info_'+cat);html+='<div class="glass p-3 mb-3 text-xs text-slate-300 leading-relaxed" contenteditable="true" data-cat="'+cat+'" onblur="localStorage.setItem(&#39;plan_info_&#39;+this.dataset.cat,this.innerHTML)" style="outline:none;cursor:text">'+(saved||CAT_INFO[cat])+'</div>';}
    items.forEach(function(p){
      var checked=p.is_done?'checked':'';
      var strike=p.is_done?'line-through text-slate-600':'text-white';
      var checkColor=p.is_done?'text-green-400':'text-slate-600';
      html+='<div class="glass p-3 mb-2" id="plan-item-'+p.id+'">'+
        '<div class="flex items-start gap-3">'+
        '<label class="flex items-center mt-0.5 cursor-pointer"><input type="checkbox" '+checked+' onchange="togglePlanDone('+p.id+')" class="w-4 h-4 accent-green-500 rounded cursor-pointer"></label>'+
        '<div class="flex-1 min-w-0">'+
        '<div class="text-sm '+strike+'">'+esc(p.title)+'</div>'+
        (p.comment?'<div class="text-xs text-cyan-400 mt-1">'+esc(p.comment)+'</div>':'')+
        '</div>'+
        '<div class="flex gap-1 shrink-0">'+
        '<button class="btn btn-ghost text-xs px-2" onclick="editPlanComment('+p.id+')" title="Комментарий">&#128172;</button>'+
        '<button class="btn btn-ghost text-xs px-2 text-red-400" onclick="deletePlan('+p.id+')" title="Удалить">&#10005;</button>'+
        '</div></div>'+
        '<div id="plan-comment-edit-'+p.id+'" class="hidden mt-2">'+
        '<textarea id="plan-comment-val-'+p.id+'" class="w-full text-xs" rows="2" placeholder="Комментарий...">'+(p.comment||'')+'</textarea>'+
        '<button class="btn btn-primary text-xs mt-1" onclick="savePlanComment('+p.id+')">Сохранить</button>'+
        '</div></div>';
    });
    html+='<div class="flex gap-2 mt-2" id="plan-add-wrap-'+cat+'">'+
      '<input id="plan-add-input-'+cat+'" class="flex-1 text-xs" placeholder="Новая задача...">'+
      '<button class="btn btn-primary text-xs" onclick="addPlan(&#39;'+cat+'&#39;)">+ Добавить</button>'+
      '</div></div>';
  });
  el.innerHTML=html;
}

async function togglePlanDone(id){
  var item=plansData.find(function(p){return p.id===id});
  if(!item)return;
  await apiFetch('/admin/plans/'+id,{method:'PUT',body:JSON.stringify({is_done:!item.is_done})});
  loadPlansTab();
}

function editPlanComment(id){
  var el=document.getElementById('plan-comment-edit-'+id);
  if(!el)return;
  el.classList.toggle('hidden');
  if(!el.classList.contains('hidden')){
    var ta=document.getElementById('plan-comment-val-'+id);
    if(ta)ta.focus();
  }
}

async function savePlanComment(id){
  var ta=document.getElementById('plan-comment-val-'+id);
  if(!ta)return;
  await apiFetch('/admin/plans/'+id,{method:'PUT',body:JSON.stringify({comment:ta.value})});
  loadPlansTab();
}

async function addPlan(cat){
  var inp=document.getElementById('plan-add-input-'+cat);
  if(!inp||!inp.value.trim())return;
  await P('/admin/plans',{category:cat,title:inp.value.trim()});
  inp.value='';
  loadPlansTab();
}

async function deletePlan(id){
  if(!confirm('Удалить задачу?'))return;
  await D('/admin/plans/'+id);
  loadPlansTab();
}

function renderTemplates(){
  var el=document.getElementById('templatesBlock');
  if(!el)return;
  el.innerHTML=TEMPLATES.map(function(t,i){
    var txt=t.text;
    return '<div class="glass p-4 mb-3">'+
      '<div class="flex justify-between items-center mb-2">'+
      '<div class="text-sm font-bold">'+esc(t.name)+'</div>'+
      '<button class="btn btn-primary text-xs" onclick="copyTemplate('+i+')">&#128203; Скопировать</button>'+
      '</div>'+
      '<pre class="text-xs text-slate-300 whitespace-pre-wrap bg-black/30 rounded-lg p-3 border border-white/5 max-h-[300px] overflow-y-auto">'+esc(txt)+'</pre>'+
      '</div>';
  }).join('');
}

function copyTemplate(i){
  var txt=TEMPLATES[i].text;
  navigator.clipboard.writeText(txt).then(function(){
    alert('Скопировано!');
  });
}

// ── Аналитика продуктов ──
var PROD_NAMES={chat:'Чат',image:'Фото',video:'Видео',motion:'Motion',avatar:'Аватар'};
async function loadAnalytics(period){
  document.querySelectorAll('[data-aperiod]').forEach(function(b){b.classList.remove('btn-primary');b.classList.add('btn-ghost')});
  var active=document.querySelector('[data-aperiod="'+period+'"]');if(active){active.classList.remove('btn-ghost');active.classList.add('btn-primary')}
  var d=await G('/admin/product-analytics?period='+period);if(!d||d.error)return;

  var totalCr=0;d.byProduct.forEach(function(p){totalCr+=p.credits});
  var maxCr=0;d.byProduct.forEach(function(p){if(p.credits>maxCr)maxCr=p.credits});
  var allTypes=['chat','image','video','motion','avatar'];

  // Карточки продуктов — текст
  var el=document.getElementById('productCards');
  el.innerHTML=allTypes.map(function(t){
    var item=d.byProduct.find(function(p){return p.type===t})||{ops:0,credits:0};
    var pct=totalCr>0?Math.round(item.credits/totalCr*100):0;
    var isMax=item.credits===maxCr&&maxCr>0;
    return '<div class="glass p-4 text-center'+(isMax?' border-2 border-violet-500/60':'')+'">'+
      '<div class="text-sm font-bold mb-2 '+(isMax?'gradient-text':'text-white')+'">'+(PROD_NAMES[t]||t)+'</div>'+
      '<div class="text-xl font-bold '+(isMax?'gradient-text':'text-white')+'">'+Number(item.credits).toLocaleString('ru')+' кр</div>'+
      '<div class="text-xs text-slate-400 mt-1">'+item.ops+' операций</div>'+
      '<div class="text-xs font-bold '+(isMax?'text-violet-400':'text-slate-500')+' mt-1">'+pct+'%</div></div>'
  }).join('');

  // Выручка в ₽
  var revEl=document.getElementById('revenueCards');
  revEl.innerHTML=allTypes.map(function(t){
    var item=d.byProduct.find(function(p){return p.type===t})||{credits:0};
    var rubShare=totalCr>0?Math.round(item.credits/totalCr*d.revenue):0;
    return '<div class="glass p-3 text-center">'+
      '<div class="text-sm font-bold text-white mb-1">'+(PROD_NAMES[t]||t)+'</div>'+
      '<div class="text-lg font-bold text-green-400">'+Number(rubShare).toLocaleString('ru')+' &#8381;</div></div>'
  }).join('');

  // Воронка — таблица
  var fn=d.funnel;
  var fEl=document.getElementById('funnelBlock');
  var convOpen=fn.start>0?Math.round(fn.opened/fn.start*100):0;
  var convGen=fn.opened>0?Math.round(fn.generated/fn.opened*100):0;
  var convPay=fn.generated>0?Math.round(fn.paid/fn.generated*100):0;
  var convTotal=fn.start>0?Math.round(fn.paid/fn.start*100):0;
  fEl.innerHTML='<div class="glass p-4"><table class="bordered w-full text-sm"><tbody>'+
    '<tr><td class="font-bold">/start (регистрация)</td><td class="text-right text-xl font-bold text-white">'+fn.start+'</td><td></td></tr>'+
    '<tr><td class="font-bold">Открыли приложение</td><td class="text-right text-xl font-bold text-cyan-400">'+fn.opened+'</td><td class="text-right text-sm text-slate-400">'+convOpen+'% от /start</td></tr>'+
    '<tr><td class="font-bold">Сделали генерацию</td><td class="text-right text-xl font-bold text-green-400">'+fn.generated+'</td><td class="text-right text-sm text-slate-400">'+convGen+'% от открывших</td></tr>'+
    '<tr><td class="font-bold">Купили пакет</td><td class="text-right text-xl font-bold text-amber-400">'+fn.paid+'</td><td class="text-right text-sm text-slate-400">'+convPay+'% от генераций</td></tr>'+
    '<tr class="border-t-2 border-white/20"><td class="font-bold">Общая конверсия</td><td class="text-right text-xl font-bold gradient-text">'+convTotal+'%</td><td class="text-right text-sm text-slate-400">/start &#8594; покупка</td></tr>'+
    '</tbody></table></div>';

  // Тренд по дням
  var days={};d.daily.forEach(function(r){
    var day=r.day.slice(0,10);if(!days[day])days[day]={};
    days[day][r.type]={ops:r.ops,credits:r.credits}
  });
  var dayNames=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  var dKeys=Object.keys(days).sort().reverse();
  var dtEl=document.getElementById('dailyTable');
  dtEl.innerHTML='<table class="bordered w-full text-xs"><thead><tr><th>Дата</th><th>День</th><th>Чат</th><th>Фото</th><th>Видео</th><th>Motion</th><th>Аватар</th><th>Всего кр</th><th>Операций</th></tr></thead><tbody>'+
    dKeys.map(function(day){
      var dd=new Date(day);var dn=dayNames[dd.getDay()];
      var row=days[day];var totalC=0;var totalO=0;
      var cells=allTypes.map(function(t){var c=row[t]||{ops:0,credits:0};totalC+=c.credits;totalO+=c.ops;return '<td class="text-center">'+(c.ops?c.ops+' <span class="text-slate-600">('+Number(c.credits).toLocaleString('ru')+')</span>':'<span class="text-slate-700">-</span>')+'</td>'}).join('');
      return '<tr><td class="text-slate-400 whitespace-nowrap">'+dd.toLocaleDateString('ru')+'</td><td class="font-bold">'+dn+'</td>'+cells+'<td class="text-green-400 font-bold text-right">'+Number(totalC).toLocaleString('ru')+'</td><td class="text-right">'+totalO+'</td></tr>'
    }).join('')+'</tbody></table>';

  // Топ юзеры
  var tuEl=document.getElementById('topUsersAnalytics');
  if(!d.topUsers.length){tuEl.innerHTML='<p class="text-slate-500 text-center py-4">Нет данных</p>';return}
  tuEl.innerHTML='<table class="bordered w-full text-xs"><thead><tr><th>Юзер</th><th>Всего кр</th><th>Чат</th><th>Фото</th><th>Видео</th><th>Motion</th><th>Аватар</th></tr></thead><tbody>'+
    d.topUsers.map(function(u){
      return '<tr><td>'+esc(u.first_name||'')+(u.username?' @'+esc(u.username):'')+'</td>'+
        '<td class="font-bold gradient-text text-right">'+Number(u.total).toLocaleString('ru')+'</td>'+
        '<td class="text-right">'+Number(u.chat).toLocaleString('ru')+'</td><td class="text-right">'+Number(u.image).toLocaleString('ru')+'</td><td class="text-right">'+Number(u.video).toLocaleString('ru')+'</td><td class="text-right">'+Number(u.motion).toLocaleString('ru')+'</td><td class="text-right">'+Number(u.avatar).toLocaleString('ru')+'</td></tr>'
    }).join('')+'</tbody></table>'
}

// ── Планы (задачи) ──
var taskPlansData=[];
async function loadTaskPlans(){
  var data=await G('/admin/task-plans');
  taskPlansData=Array.isArray(data)?data:[];
  renderTaskPlans();
}
function renderTaskPlans(){
  var el=document.getElementById('taskPlansList');
  if(!taskPlansData.length){el.innerHTML='<div class="text-slate-500 text-center py-8">Нет планов. Добавьте первый!</div>';return}
  var today=new Date().toISOString().slice(0,10);
  el.innerHTML=taskPlansData.map(function(p){
    var dateStr='';var dateClass='text-slate-500';
    if(p.due_date){
      var d=p.due_date.slice(0,10);
      if(d<today&&!p.is_done){dateClass='text-red-400';dateStr='Просрочен: '+new Date(d).toLocaleDateString('ru')}
      else if(d===today){dateClass='text-amber-400';dateStr='Сегодня'}
      else{dateClass='text-green-400';dateStr=new Date(d).toLocaleDateString('ru')}
    }
    var doneClass=p.is_done?'opacity-50':'';
    var titleClass=p.is_done?'line-through text-slate-500':'text-white';
    var subs=p.subtasks||[];
    var subsDone=subs.filter(function(s){return s.is_done}).length;
    var subsTotal=subs.length;
    var progress=subsTotal>0?'<span class="text-xs ml-2 '+(subsDone===subsTotal&&subsTotal>0?'text-green-400':'text-slate-500')+'">'+subsDone+'/'+subsTotal+'</span>':'';
    var subsHtml=subs.map(function(s){
      return '<div class="flex items-center gap-2 py-1">'+
        '<input type="checkbox" '+(s.is_done?'checked':'')+' onchange="toggleSubtask('+s.id+')" class="w-4 h-4 rounded cursor-pointer accent-violet-500">'+
        '<span class="text-xs flex-1 '+(s.is_done?'line-through text-slate-600':'text-slate-300')+'">'+esc(s.title)+'</span>'+
        '<button class="text-slate-700 hover:text-red-400 text-xs" onclick="deleteSubtask('+s.id+')">\\u2716</button></div>'
    }).join('');
    return '<div class="glass mb-3 '+doneClass+'">'+
      '<div class="p-4 flex items-start gap-3 cursor-pointer" onclick="togglePlanExpand('+p.id+')">'+
      '<input type="checkbox" '+(p.is_done?'checked':'')+' onchange="event.stopPropagation();toggleTaskPlan('+p.id+')" class="mt-1 w-5 h-5 rounded cursor-pointer accent-violet-500" style="min-width:20px">'+
      '<div class="flex-1 min-w-0">'+
      '<div class="flex items-center justify-between gap-2">'+
      '<span class="font-bold text-sm '+titleClass+'">'+
      '<span id="plan-arrow-'+p.id+'" class="text-slate-500 text-xs mr-1">\\u25B6</span>'+
      esc(p.title)+progress+'</span>'+
      '<input type="date" value="'+(p.due_date?p.due_date.slice(0,10):'')+'" onchange="updatePlanDate('+p.id+',this.value)" onclick="event.stopPropagation()" class="text-xs '+dateClass+' bg-transparent border-none cursor-pointer" style="width:120px">'+
      '</div>'+
      (p.description?'<div class="text-xs text-slate-500 mt-1">'+esc(p.description).substring(0,100)+'</div>':'')+
      '</div>'+
      '<button class="text-slate-600 hover:text-red-400 text-xs mt-1" onclick="event.stopPropagation();deleteTaskPlan('+p.id+')" style="min-width:24px">\\u2716</button>'+
      '</div>'+
      '<div id="plan-expand-'+p.id+'" class="hidden px-4 pb-4 border-t border-white/5 pt-3">'+
      '<div id="plan-desc-'+p.id+'" onclick="editTaskPlanDesc('+p.id+')" class="text-xs text-slate-400 cursor-pointer mb-3 min-h-[20px]">'+(p.description?esc(p.description):'<span class="text-slate-600">Нажмите чтобы добавить описание...</span>')+'</div>'+
      '<textarea id="plan-edit-'+p.id+'" class="hidden w-full mb-3 text-xs" rows="3" onblur="saveTaskPlanDesc('+p.id+')">'+(p.description||'')+'</textarea>'+
      '<div class="text-xs text-slate-500 mb-2 font-bold">Подзадачи:</div>'+
      '<div id="plan-subs-'+p.id+'">'+subsHtml+'</div>'+
      '<div class="flex gap-2 mt-2">'+
      '<input id="sub-input-'+p.id+'" placeholder="Новая подзадача..." class="flex-1 text-xs" onkeydown="if(event.key===&quot;Enter&quot;)addSubtask('+p.id+')">'+
      '<button class="btn btn-ghost text-xs" style="padding:4px 10px" onclick="addSubtask('+p.id+')">+</button>'+
      '</div></div></div>'
  }).join('')
}
function togglePlanExpand(id){
  var el=document.getElementById('plan-expand-'+id);
  var arrow=document.getElementById('plan-arrow-'+id);
  if(!el)return;
  if(el.classList.contains('hidden')){el.classList.remove('hidden');if(arrow)arrow.textContent='\\u25BC'}
  else{el.classList.add('hidden');if(arrow)arrow.textContent='\\u25B6'}
}
async function addTaskPlan(){
  var title=document.getElementById('planTitle').value.trim();
  var date=document.getElementById('planDate').value;
  if(!title){alert('Введите название');return}
  await P('/admin/task-plans',{title:title,dueDate:date||null});
  document.getElementById('planTitle').value='';
  document.getElementById('planDate').value='';
  loadTaskPlans()
}
async function toggleTaskPlan(id){
  var p=taskPlansData.find(function(x){return x.id===id});
  if(!p)return;
  await apiFetch('/admin/task-plans/'+id,{method:'PUT',body:JSON.stringify({isDone:!p.is_done})});
  loadTaskPlans()
}
function editTaskPlanDesc(id){
  var desc=document.getElementById('plan-desc-'+id);
  var edit=document.getElementById('plan-edit-'+id);
  if(!desc||!edit)return;
  desc.classList.add('hidden');
  edit.classList.remove('hidden');
  edit.focus()
}
async function saveTaskPlanDesc(id){
  var edit=document.getElementById('plan-edit-'+id);
  var desc=document.getElementById('plan-desc-'+id);
  if(!edit||!desc)return;
  await apiFetch('/admin/task-plans/'+id,{method:'PUT',body:JSON.stringify({description:edit.value})});
  desc.innerHTML=edit.value?esc(edit.value):'<span class="text-slate-600">Нажмите чтобы добавить описание...</span>';
  edit.classList.add('hidden');
  desc.classList.remove('hidden');
  var p=taskPlansData.find(function(x){return x.id===id});
  if(p)p.description=edit.value
}
async function updatePlanDate(id,val){
  await apiFetch('/admin/task-plans/'+id,{method:'PUT',body:JSON.stringify({dueDate:val||null})});
  loadTaskPlans()
}
async function deleteTaskPlan(id){
  if(!confirm('Удалить план?'))return;
  await D('/admin/task-plans/'+id);
  loadTaskPlans()
}
async function addSubtask(planId){
  var inp=document.getElementById('sub-input-'+planId);
  if(!inp||!inp.value.trim())return;
  await P('/admin/task-plans/'+planId+'/subtasks',{title:inp.value.trim()});
  inp.value='';
  loadTaskPlans()
}
async function toggleSubtask(id){
  var sub=null;
  taskPlansData.forEach(function(p){(p.subtasks||[]).forEach(function(s){if(s.id===id)sub=s})});
  if(!sub)return;
  await apiFetch('/admin/task-plans/subtask/'+id,{method:'PUT',body:JSON.stringify({isDone:!sub.is_done})});
  loadTaskPlans()
}
async function deleteSubtask(id){
  await D('/admin/task-plans/subtask/'+id);
  loadTaskPlans()
}

async function loadSharesTab(){
  try{
    var stats=await G('/admin/share-stats');
    var cards=document.getElementById('shareStatsCards');
    if(cards&&stats){
      cards.innerHTML=
        '<div class="glass p-3 text-center"><div class="text-2xl font-bold text-white">'+(stats.total_shares||0)+'</div><div class="text-xs text-slate-400">Всего шеров</div></div>'+
        '<div class="glass p-3 text-center"><div class="text-2xl font-bold text-green-400">'+(stats.rewarded_shares||0)+'</div><div class="text-xs text-slate-400">С бонусом</div></div>'+
        '<div class="glass p-3 text-center"><div class="text-2xl font-bold text-violet-400">'+(stats.unique_sharers||0)+'</div><div class="text-xs text-slate-400">Шарили</div></div>'+
        '<div class="glass p-3 text-center"><div class="text-2xl font-bold text-cyan-400">'+(stats.unique_receivers||0)+'</div><div class="text-xs text-slate-400">Перешли</div></div>'+
        '<div class="glass p-3 text-center"><div class="text-2xl font-bold text-amber-400">'+(stats.total_credits_awarded||0)+' \\u{1F48E}</div><div class="text-xs text-slate-400">Начислено</div></div>';
    }
    var rewards=await G('/admin/share-rewards');
    var tbl=document.getElementById('shareRewardsTable');
    if(tbl&&Array.isArray(rewards)&&rewards.length>0){
      tbl.innerHTML='<table class="bordered w-full"><thead><tr><th>Дата</th><th>Кто поделился</th><th>Кто перешёл</th><th>Gen ID</th><th>Кредиты</th></tr></thead><tbody>'+
        rewards.map(function(r){
          return '<tr><td>'+new Date(r.created_at).toLocaleDateString('ru')+'</td>'+
            '<td>'+esc(r.sharer_name||'')+(r.sharer_username?' @'+esc(r.sharer_username):'')+'<br><span class="text-slate-500">'+r.sharer_id+'</span></td>'+
            '<td>'+esc(r.receiver_name||'')+(r.receiver_username?' @'+esc(r.receiver_username):'')+'<br><span class="text-slate-500">'+r.receiver_id+'</span></td>'+
            '<td>'+(r.generation_id||'—')+'</td>'+
            '<td class="text-green-400">+'+(r.credits_awarded||0)+'</td></tr>';
        }).join('')+'</tbody></table>';
    }else if(tbl){tbl.innerHTML='<div class="text-slate-500 text-center py-4">Пока нет данных</div>'}
  }catch(e){console.error('loadSharesTab error:',e)}
}

if(TOKEN)showPanel();
</script></body></html>`;
