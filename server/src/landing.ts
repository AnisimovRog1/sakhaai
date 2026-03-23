export const LANDING_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="verification" content="16693ad0a9f05ceba9ce1b6a59b655" />
  <meta name="description" content="UraanxAI — AI-ассистент из Якутии. Умный чат, генерация картинок и видео прямо в Telegram.">
  <title>UraanxAI — AI-ассистент из Якутии</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0}
    body{background:#030711;color:#e2e8f0;font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}

    /* Aurora animated background */
    .aurora{position:fixed;inset:0;z-index:0;pointer-events:none}
    .aurora::before{content:'';position:absolute;width:150%;height:60%;top:-20%;left:-25%;
      background:conic-gradient(from 180deg at 50% 50%,rgba(139,92,246,.12),rgba(6,182,212,.08),rgba(59,130,246,.06),transparent,rgba(139,92,246,.12));
      animation:auroraRotate 20s linear infinite;filter:blur(80px)}
    .aurora::after{content:'';position:absolute;width:120%;height:40%;bottom:-10%;right:-20%;
      background:conic-gradient(from 0deg at 50% 50%,rgba(6,182,212,.10),rgba(139,92,246,.06),transparent,rgba(6,182,212,.10));
      animation:auroraRotate 25s linear infinite reverse;filter:blur(60px)}
    @keyframes auroraRotate{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}

    /* Diamond particles */
    .diamonds{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
    .diamond{position:absolute;width:8px;height:8px;background:rgba(139,92,246,.3);
      transform:rotate(45deg);animation:float linear infinite;border-radius:2px}
    @keyframes float{0%{transform:rotate(45deg) translateY(100vh);opacity:0}
      10%{opacity:1}90%{opacity:1}100%{transform:rotate(45deg) translateY(-100vh);opacity:0}}

    .rel{position:relative;z-index:1}

    /* Glass */
    .glass{background:rgba(255,255,255,.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.06);border-radius:20px;transition:all .4s}
    .glass:hover{background:rgba(255,255,255,.06);border-color:rgba(139,92,246,.2);box-shadow:0 0 40px rgba(139,92,246,.08)}
    .glass-neon{background:rgba(139,92,246,.04);backdrop-filter:blur(20px);border:1px solid rgba(139,92,246,.15);border-radius:20px;
      box-shadow:0 0 30px rgba(139,92,246,.06);transition:all .4s}
    .glass-neon:hover{box-shadow:0 0 50px rgba(139,92,246,.12);border-color:rgba(139,92,246,.3)}

    /* Gradient text */
    .gt{background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .gt2{background:linear-gradient(135deg,#c4b5fd,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}

    /* Animated border */
    @keyframes borderGlow{0%{border-color:rgba(139,92,246,.2)}50%{border-color:rgba(6,182,212,.3)}100%{border-color:rgba(139,92,246,.2)}}
    .glow-border{animation:borderGlow 4s ease-in-out infinite}

    /* Floating animation */
    @keyframes gentle{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    .float{animation:gentle 6s ease-in-out infinite}

    /* Reveal on scroll */
    .reveal{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}
    .reveal.visible{opacity:1;transform:translateY(0)}

    /* Button */
    .btn-hero{position:relative;display:inline-flex;align-items:center;gap:10px;padding:18px 40px;
      background:linear-gradient(135deg,#7c3aed,#0891b2);color:#fff;font-weight:700;font-size:18px;
      border:none;border-radius:16px;cursor:pointer;transition:all .3s;overflow:hidden}
    .btn-hero::before{content:'';position:absolute;inset:-2px;background:linear-gradient(135deg,#a78bfa,#22d3ee,#a78bfa);
      border-radius:18px;z-index:-1;animation:borderGlow 3s linear infinite;filter:blur(8px);opacity:.5}
    .btn-hero:hover{transform:translateY(-2px);box-shadow:0 20px 60px rgba(139,92,246,.3)}

    /* Pricing card */
    .price-card{text-align:center;padding:32px 24px;position:relative;overflow:hidden}
    .price-card::before{content:'';position:absolute;top:0;left:50%;width:80%;height:1px;transform:translateX(-50%);
      background:linear-gradient(90deg,transparent,rgba(139,92,246,.4),transparent)}
    .price-card:hover{transform:translateY(-4px)}
    .price-popular{border-color:rgba(139,92,246,.4) !important;box-shadow:0 0 40px rgba(139,92,246,.12) !important}

    /* Feature icon */
    .feat-icon{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;
      font-size:24px;margin:0 auto 16px;position:relative}
    .feat-icon::after{content:'';position:absolute;inset:-4px;border-radius:20px;
      background:inherit;opacity:.3;filter:blur(12px);z-index:-1}

    /* Step circle */
    .step-circle{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:20px;font-weight:800;margin:0 auto 16px;position:relative}
    .step-circle::after{content:'';position:absolute;inset:-3px;border-radius:50%;
      background:inherit;opacity:.3;filter:blur(10px);z-index:-1}

    /* Scroll indicator */
    @keyframes scrollDown{0%{transform:translateY(0);opacity:1}100%{transform:translateY(8px);opacity:0}}
    .scroll-dot{width:4px;height:8px;background:#a78bfa;border-radius:4px;animation:scrollDown 1.5s infinite}

    /* Payment badge */
    .pay-badge{display:inline-flex;align-items:center;padding:6px 16px;background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.08);border-radius:8px;font-size:12px;font-weight:700;color:#94a3b8}

    a{text-decoration:none;color:inherit}
    section{scroll-margin-top:80px}
  </style>
</head>
<body>

<div class="aurora"></div>
<div class="diamonds" id="diamonds"></div>

<!-- NAV -->
<nav class="rel fixed top-0 left-0 right-0 z-50" style="background:rgba(3,7,17,.8);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.05)">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-violet-500/20">U</div>
      <span class="text-xl font-extrabold gt">UraanxAI</span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-sm text-slate-400">
      <a href="#features" class="hover:text-white transition">Возможности</a>
      <a href="#pricing" class="hover:text-white transition">Тарифы</a>
      <a href="#terms" class="hover:text-white transition">Документы</a>
      <a href="#contacts" class="hover:text-white transition">Контакты</a>
    </div>
    <a href="https://t.me/UraanxAI_bot" class="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition shadow-lg shadow-violet-500/20">
      Открыть бота
    </a>
  </div>
</nav>

<!-- HERO -->
<section class="rel min-h-screen flex items-center justify-center px-6 pt-20">
  <div class="text-center max-w-3xl">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
      <span class="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
      Telegram Mini App
    </div>
    <h1 class="text-5xl md:text-7xl font-black leading-tight mb-6">
      <span class="gt">AI-ассистент</span><br>
      <span class="text-white">из Якутии</span>
    </h1>
    <p class="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
      Умный чат на русском и якутском, генерация картинок и видео — всё в одном Telegram-боте
    </p>
    <a href="https://t.me/UraanxAI_bot" class="btn-hero">
      <span>🚀</span> Попробовать бесплатно
    </a>
    <p class="text-slate-500 text-sm mt-5">50 бесплатных кредитов • Без карты • Мгновенный старт</p>

    <div class="mt-16 flex justify-center">
      <div class="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center pt-2">
        <div class="scroll-dot"></div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="rel max-w-6xl mx-auto px-6 py-24" id="features">
  <div class="text-center mb-16 reveal">
    <p class="text-violet-400 text-sm font-bold uppercase tracking-widest mb-3">Возможности</p>
    <h2 class="text-3xl md:text-4xl font-extrabold text-white">Всё что нужно для <span class="gt">AI-творчества</span></h2>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="glass p-8 reveal" style="transition-delay:.1s">
      <div class="feat-icon" style="background:linear-gradient(135deg,rgba(139,92,246,.2),rgba(139,92,246,.05))">💬</div>
      <h3 class="font-bold text-lg text-white text-center mb-3">AI-чат</h3>
      <p class="text-slate-400 text-sm text-center leading-relaxed">Умный ассистент на базе Gemini. Понимает русский и якутский (саха тыла), знает культуру и историю Саха.</p>
    </div>
    <div class="glass p-8 reveal" style="transition-delay:.2s">
      <div class="feat-icon" style="background:linear-gradient(135deg,rgba(6,182,212,.2),rgba(6,182,212,.05))">🎨</div>
      <h3 class="font-bold text-lg text-white text-center mb-3">Генерация картинок</h3>
      <p class="text-slate-400 text-sm text-center leading-relaxed">Создавайте изображения по описанию, редактируйте существующие фото. Поддержка разных стилей и форматов.</p>
    </div>
    <div class="glass p-8 reveal" style="transition-delay:.3s">
      <div class="feat-icon" style="background:linear-gradient(135deg,rgba(59,130,246,.2),rgba(59,130,246,.05))">🎬</div>
      <h3 class="font-bold text-lg text-white text-center mb-3">Генерация видео</h3>
      <p class="text-slate-400 text-sm text-center leading-relaxed">Текст в видео, анимация картинок, говорящие аватары. Технология Kling AI — кинематографическое качество.</p>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="rel max-w-6xl mx-auto px-6 py-24">
  <div class="text-center mb-16 reveal">
    <p class="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3">Начните за 30 секунд</p>
    <h2 class="text-3xl md:text-4xl font-extrabold text-white">Как это <span class="gt">работает</span></h2>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="text-center reveal" style="transition-delay:.1s">
      <div class="step-circle" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white">1</div>
      <h3 class="font-bold text-white mb-2">Откройте бота</h3>
      <p class="text-slate-400 text-sm">Перейдите в <a href="https://t.me/UraanxAI_bot" class="text-violet-400 hover:underline">@UraanxAI_bot</a> и нажмите «Начать»</p>
    </div>
    <div class="text-center reveal" style="transition-delay:.2s">
      <div class="step-circle" style="background:linear-gradient(135deg,#0891b2,#0e7490);color:white">2</div>
      <h3 class="font-bold text-white mb-2">Получите 50 кредитов</h3>
      <p class="text-slate-400 text-sm">Бесплатные кредиты начисляются мгновенно при первом входе</p>
    </div>
    <div class="text-center reveal" style="transition-delay:.3s">
      <div class="step-circle" style="background:linear-gradient(135deg,#7c3aed,#0891b2);color:white">3</div>
      <h3 class="font-bold text-white mb-2">Создавайте контент</h3>
      <p class="text-slate-400 text-sm">Общайтесь с AI, генерируйте картинки и видео без ограничений</p>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="rel max-w-6xl mx-auto px-6 py-24" id="pricing">
  <div class="text-center mb-16 reveal">
    <p class="text-violet-400 text-sm font-bold uppercase tracking-widest mb-3">Тарифы</p>
    <h2 class="text-3xl md:text-4xl font-extrabold text-white">Пакеты <span class="gt">AI-кредитов</span></h2>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="glass price-card reveal" style="transition-delay:.1s">
      <p class="text-3xl font-black text-white">99 ₽</p>
      <p class="font-bold text-violet-300 mt-2">Старт</p>
      <p class="text-slate-500 text-sm mt-1">1 100 кредитов</p>
      <div class="mt-4 text-xs text-slate-600">≈ 0.09 ₽/кредит</div>
    </div>
    <div class="glass price-card reveal" style="transition-delay:.2s">
      <p class="text-3xl font-black text-white">299 ₽</p>
      <p class="font-bold text-violet-300 mt-2">Базовый</p>
      <p class="text-slate-500 text-sm mt-1">3 500 кредитов</p>
      <div class="mt-4 text-xs text-slate-600">≈ 0.085 ₽/кредит</div>
    </div>
    <div class="glass-neon price-card price-popular reveal" style="transition-delay:.3s">
      <span class="absolute top-3 right-3 text-[10px] font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-3 py-1 rounded-full">Хит</span>
      <p class="text-3xl font-black text-white">799 ₽</p>
      <p class="font-bold gt mt-2">Про</p>
      <p class="text-slate-400 text-sm mt-1">10 000 кредитов</p>
      <div class="mt-4 text-xs text-violet-400">≈ 0.08 ₽/кредит</div>
    </div>
    <div class="glass price-card reveal" style="transition-delay:.4s">
      <p class="text-3xl font-black text-white">1 990 ₽</p>
      <p class="font-bold text-cyan-300 mt-2">Макс</p>
      <p class="text-slate-500 text-sm mt-1">28 000 кредитов</p>
      <div class="mt-4 text-xs text-slate-600">≈ 0.07 ₽/кредит</div>
    </div>
  </div>
  <div class="glass p-5 mt-8 reveal">
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4 text-center text-sm">
      <div><span class="text-white font-bold">1</span> <span class="text-slate-500">кр/сообщение</span></div>
      <div><span class="text-white font-bold">79</span> <span class="text-slate-500">кр/картинка</span></div>
      <div><span class="text-white font-bold">608</span> <span class="text-slate-500">кр/видео</span></div>
      <div><span class="text-white font-bold">608</span> <span class="text-slate-500">кр/motion</span></div>
      <div><span class="text-white font-bold">810</span> <span class="text-slate-500">кр/аватар</span></div>
      <div><span class="text-violet-400 font-bold">50</span> <span class="text-slate-500">бесплатно</span></div>
    </div>
  </div>
</section>

<!-- LEGAL -->
<section class="rel max-w-4xl mx-auto px-6 py-24" id="terms">
  <div class="text-center mb-16 reveal">
    <p class="text-slate-500 text-sm font-bold uppercase tracking-widest mb-3">Документы</p>
    <h2 class="text-3xl font-extrabold text-white">Правовая информация</h2>
  </div>
  <div class="glass p-8 md:p-10 space-y-8 text-sm text-slate-300 leading-relaxed reveal">
    <div>
      <h3 class="font-bold text-white text-lg mb-3 flex items-center gap-2"><span class="text-violet-400">§1</span> Пользовательское соглашение (оферта)</h3>
      <p>Настоящее соглашение является публичной офертой между администрацией сервиса UraanxAI (Исполнитель) и пользователем (Заказчик).</p>
      <p class="mt-2"><strong class="text-slate-200">Предмет:</strong> Исполнитель предоставляет доступ к AI-сервисам (чат, генерация изображений, видео, аватаров) через Telegram Mini App на основе кредитной системы.</p>
      <p class="mt-2"><strong class="text-slate-200">Порядок оказания услуг:</strong> Заказчик приобретает пакет кредитов. Кредиты списываются при использовании. Услуга считается оказанной в момент генерации контента.</p>
      <p class="mt-2"><strong class="text-slate-200">Права Заказчика:</strong> использовать контент в личных и коммерческих целях, запрашивать возврат неиспользованных кредитов, получать техническую поддержку.</p>
      <p class="mt-2"><strong class="text-slate-200">Обязанности Заказчика:</strong> не создавать запрещённый контент, не передавать доступ третьим лицам.</p>
      <p class="mt-2"><strong class="text-slate-200">Обязанности Исполнителя:</strong> обеспечивать работоспособность, сохранность данных, начислять кредиты после оплаты.</p>
      <p class="mt-2"><strong class="text-slate-200">Акцепт:</strong> использование сервиса и/или оплата является безоговорочным акцептом оферты.</p>
    </div>
    <div class="border-t border-white/5 pt-8">
      <h3 class="font-bold text-white text-lg mb-3 flex items-center gap-2"><span class="text-cyan-400">§2</span> Политика обработки персональных данных</h3>
      <p><strong class="text-slate-200">Собираемые данные:</strong> Telegram ID, имя, username, IP-адрес, часовой пояс, история чатов и генераций.</p>
      <p class="mt-2"><strong class="text-slate-200">Цели:</strong> предоставление услуг, безопасность, улучшение качества.</p>
      <p class="mt-2"><strong class="text-slate-200">Передача:</strong> данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ.</p>
      <p class="mt-2"><strong class="text-slate-200">Хранение:</strong> защищённые серверы. Удаление по запросу через поддержку.</p>
      <p class="mt-2">Используя сервис, вы даёте согласие на обработку в соответствии с ФЗ №152 «О персональных данных».</p>
    </div>
    <div class="border-t border-white/5 pt-8">
      <h3 class="font-bold text-white text-lg mb-3 flex items-center gap-2"><span class="text-violet-400">§3</span> Условия возврата</h3>
      <p>Возврат неиспользованных кредитов — в течение 14 дней с момента покупки.</p>
      <p class="mt-2">При частичном использовании — пропорциональный возврат за вычетом потраченных кредитов.</p>
      <p class="mt-2">Обращение: <a href="https://t.me/UraanxAI_support" class="text-violet-400 hover:underline">@UraanxAI_support</a> или kuzmin.art993@gmail.com.</p>
      <p class="mt-2">Возврат — тем же способом оплаты, в течение 10 рабочих дней.</p>
      <p class="mt-2">Полностью использованные и бесплатные кредиты возврату не подлежат.</p>
    </div>
  </div>
</section>

<!-- CONTACTS -->
<section class="rel max-w-4xl mx-auto px-6 py-24" id="contacts">
  <div class="text-center mb-12 reveal">
    <h2 class="text-3xl font-extrabold text-white">Контакты</h2>
  </div>
  <div class="glass p-8 md:p-10 reveal">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg">🤖</div>
          <div><p class="text-xs text-slate-500">Бот</p><a href="https://t.me/UraanxAI_bot" class="text-violet-400 font-medium hover:underline">@UraanxAI_bot</a></div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-lg">💬</div>
          <div><p class="text-xs text-slate-500">Поддержка</p><a href="https://t.me/UraanxAI_support" class="text-cyan-400 font-medium hover:underline">@UraanxAI_support</a></div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg">📧</div>
          <div><p class="text-xs text-slate-500">Email</p><a href="mailto:kuzmin.art993@gmail.com" class="text-violet-400 font-medium hover:underline">kuzmin.art993@gmail.com</a></div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-lg">📍</div>
          <div><p class="text-xs text-slate-500">Разработчик</p><p class="text-slate-300 font-medium">ИП Анисимов · Республика Саха (Якутия)</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PAYMENT LOGOS -->
<section class="rel max-w-4xl mx-auto px-6 py-12">
  <div class="flex flex-wrap items-center justify-center gap-6">
    <div class="pay-badge">VISA</div>
    <div class="pay-badge">MasterCard</div>
    <div class="pay-badge">МИР</div>
    <div class="pay-badge">СБП</div>
    <div class="pay-badge">UnitPay</div>
  </div>
  <p class="text-center text-slate-600 text-xs mt-4">Безопасные платежи. Мы не храним данные банковских карт.</p>
</section>

<!-- FOOTER -->
<footer class="rel max-w-6xl mx-auto px-6 py-10 border-t border-white/5">
  <div class="flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-black text-white">U</div>
      <span class="text-sm font-bold gt2">UraanxAI</span>
      <span class="text-slate-600 text-sm">© 2026</span>
    </div>
    <div class="flex gap-6 text-sm text-slate-500">
      <a href="#terms" class="hover:text-white transition">Соглашение</a>
      <a href="#pricing" class="hover:text-white transition">Тарифы</a>
      <a href="#contacts" class="hover:text-white transition">Контакты</a>
      <a href="https://t.me/UraanxAI_support" class="hover:text-white transition">Поддержка</a>
    </div>
  </div>
</footer>

<script>
// Diamond particles
const dc=document.getElementById('diamonds');
for(let i=0;i<20;i++){const d=document.createElement('div');d.className='diamond';
d.style.left=Math.random()*100+'%';d.style.animationDuration=(15+Math.random()*20)+'s';
d.style.animationDelay=Math.random()*15+'s';d.style.width=d.style.height=(4+Math.random()*6)+'px';
d.style.background='rgba('+(Math.random()>.5?'139,92,246':'6,182,212')+','+(0.1+Math.random()*0.2)+')';
dc.appendChild(d);}

// Scroll reveal
const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{e.preventDefault();
document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth'})})});
</script>
</body>
</html>`;
