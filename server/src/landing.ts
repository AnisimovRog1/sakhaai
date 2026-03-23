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
    body { background: #050a14; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; }
    .gradient-text { background: linear-gradient(135deg, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
    .glow { box-shadow: 0 0 40px rgba(139,92,246,0.15); }
  </style>
</head>
<body>

  <!-- Header -->
  <header class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-lg font-bold text-white">U</div>
      <span class="text-xl font-bold gradient-text">UraanxAI</span>
    </div>
    <a href="https://t.me/UraanxAI_bot" class="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition">Открыть в Telegram</a>
  </header>

  <!-- Hero -->
  <section class="max-w-5xl mx-auto px-6 py-20 text-center">
    <h1 class="text-4xl md:text-6xl font-extrabold mb-6">
      <span class="gradient-text">AI-ассистент</span> из Якутии
    </h1>
    <p class="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
      Умный чат на русском и якутском языках, генерация картинок и видео — прямо в Telegram Mini App
    </p>
    <a href="https://t.me/UraanxAI_bot" class="inline-block px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold rounded-2xl text-lg hover:opacity-90 transition shadow-lg shadow-violet-500/25">
      🚀 Попробовать бесплатно
    </a>
    <p class="text-slate-500 text-sm mt-4">50 бесплатных кредитов при регистрации</p>
  </section>

  <!-- Features -->
  <section class="max-w-5xl mx-auto px-6 py-16">
    <h2 class="text-2xl font-bold text-center mb-10">Возможности</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass p-6 text-center">
        <div class="text-3xl mb-4">💬</div>
        <h3 class="font-bold text-lg mb-2">AI-чат</h3>
        <p class="text-slate-400 text-sm">Умный ассистент на базе Gemini. Понимает русский и якутский языки, знает культуру Саха.</p>
      </div>
      <div class="glass p-6 text-center">
        <div class="text-3xl mb-4">🎨</div>
        <h3 class="font-bold text-lg mb-2">Генерация картинок</h3>
        <p class="text-slate-400 text-sm">Создавайте изображения по текстовому описанию. Редактирование существующих фото.</p>
      </div>
      <div class="glass p-6 text-center">
        <div class="text-3xl mb-4">🎬</div>
        <h3 class="font-bold text-lg mb-2">Генерация видео</h3>
        <p class="text-slate-400 text-sm">Текст в видео, анимация картинок, говорящие аватары с технологией Kling AI.</p>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section class="max-w-5xl mx-auto px-6 py-16" id="pricing">
    <h2 class="text-2xl font-bold text-center mb-4">Тарифы</h2>
    <p class="text-slate-400 text-center mb-10">Выберите подходящий пакет AI-кредитов</p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass p-6 text-center">
        <p class="text-2xl font-extrabold text-white">99 ₽</p>
        <p class="font-semibold mt-1">Старт</p>
        <p class="text-slate-400 text-sm mt-1">1 100 кредитов</p>
      </div>
      <div class="glass p-6 text-center">
        <p class="text-2xl font-extrabold text-white">299 ₽</p>
        <p class="font-semibold mt-1">Базовый</p>
        <p class="text-slate-400 text-sm mt-1">3 500 кредитов</p>
      </div>
      <div class="glass glow p-6 text-center border-violet-500/30">
        <span class="text-[10px] font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-2 py-0.5 rounded-full">Популярный</span>
        <p class="text-2xl font-extrabold text-white mt-2">799 ₽</p>
        <p class="font-semibold mt-1">Про</p>
        <p class="text-slate-400 text-sm mt-1">10 000 кредитов</p>
      </div>
      <div class="glass p-6 text-center">
        <p class="text-2xl font-extrabold text-white">1 990 ₽</p>
        <p class="font-semibold mt-1">Макс</p>
        <p class="text-slate-400 text-sm mt-1">28 000 кредитов</p>
      </div>
    </div>
    <div class="glass p-4 mt-6">
      <p class="text-sm text-slate-400 text-center">
        <strong>Стоимость услуг:</strong> чат — 1 кр./сообщение, картинка — 79 кр., видео — 608 кр., аватар — 810 кр.
      </p>
    </div>
  </section>

  <!-- How it works -->
  <section class="max-w-5xl mx-auto px-6 py-16">
    <h2 class="text-2xl font-bold text-center mb-10">Как это работает</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-violet-600/20 flex items-center justify-center text-xl font-bold text-violet-400 mb-4">1</div>
        <h3 class="font-bold mb-2">Откройте бота</h3>
        <p class="text-slate-400 text-sm">Перейдите в @UraanxAI_bot в Telegram и нажмите «Начать»</p>
      </div>
      <div class="text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-cyan-600/20 flex items-center justify-center text-xl font-bold text-cyan-400 mb-4">2</div>
        <h3 class="font-bold mb-2">Получите 50 кредитов</h3>
        <p class="text-slate-400 text-sm">Бесплатные кредиты начисляются автоматически при первом входе</p>
      </div>
      <div class="text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-violet-600/20 flex items-center justify-center text-xl font-bold text-violet-400 mb-4">3</div>
        <h3 class="font-bold mb-2">Создавайте контент</h3>
        <p class="text-slate-400 text-sm">Общайтесь с AI, генерируйте картинки и видео</p>
      </div>
    </div>
  </section>

  <!-- Legal -->
  <section class="max-w-5xl mx-auto px-6 py-16" id="terms">
    <h2 class="text-2xl font-bold text-center mb-10">Правовая информация</h2>
    <div class="glass p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
      <div>
        <h3 class="font-bold text-white text-base mb-3">1. Пользовательское соглашение (оферта)</h3>
        <p>Настоящее пользовательское соглашение (далее — Соглашение) является публичной офертой и регулирует отношения между администрацией сервиса UraanxAI (далее — Исполнитель) и пользователем (далее — Заказчик).</p>
        <p class="mt-2"><strong>1.1. Предмет соглашения:</strong> Исполнитель предоставляет Заказчику доступ к AI-сервисам (чат с искусственным интеллектом, генерация изображений, генерация видео, создание аватаров) через Telegram Mini App на основе системы внутренних кредитов.</p>
        <p class="mt-2"><strong>1.2. Порядок оказания услуг:</strong> Заказчик приобретает пакет кредитов через платёжную систему. Кредиты списываются при использовании AI-сервисов. Услуга считается оказанной в момент генерации контента.</p>
        <p class="mt-2"><strong>1.3. Права Заказчика:</strong> Заказчик имеет право использовать сгенерированный контент в личных и коммерческих целях, запрашивать возврат неиспользованных кредитов, получать техническую поддержку.</p>
        <p class="mt-2"><strong>1.4. Обязанности Заказчика:</strong> Заказчик обязуется не использовать сервис для создания контента, нарушающего законодательство РФ, не передавать доступ к аккаунту третьим лицам, соблюдать условия настоящего Соглашения.</p>
        <p class="mt-2"><strong>1.5. Обязанности Исполнителя:</strong> Исполнитель обязуется обеспечивать работоспособность сервиса, сохранность данных пользователей, начислять кредиты после подтверждения оплаты, оказывать техническую поддержку.</p>
        <p class="mt-2"><strong>1.6. Ответственность:</strong> Исполнитель не несёт ответственности за содержание сгенерированного AI контента. Максимальная ответственность ограничена суммой оплаченных, но неиспользованных кредитов.</p>
        <p class="mt-2"><strong>1.7. Акцепт оферты:</strong> Факт использования сервиса и/или оплаты пакета кредитов является полным и безоговорочным акцептом настоящей оферты.</p>
      </div>
      <div>
        <h3 class="font-bold text-white text-base mb-3">2. Политика обработки персональных данных</h3>
        <p><strong>2.1. Какие данные мы собираем:</strong></p>
        <ul class="list-disc list-inside mt-1 space-y-1">
          <li>Telegram ID, имя пользователя, username — для идентификации аккаунта</li>
          <li>IP-адрес — для обеспечения безопасности и предотвращения мошенничества</li>
          <li>Часовой пояс — для корректной отправки уведомлений</li>
          <li>История чатов и генераций — для обеспечения работы сервиса</li>
        </ul>
        <p class="mt-2"><strong>2.2. Цели обработки:</strong> Данные используются исключительно для предоставления услуг сервиса, обеспечения безопасности, улучшения качества услуг и связи с пользователем.</p>
        <p class="mt-2"><strong>2.3. Передача данных:</strong> Персональные данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ.</p>
        <p class="mt-2"><strong>2.4. Хранение:</strong> Данные хранятся на защищённых серверах. Пользователь может запросить удаление своих данных, обратившись в службу поддержки.</p>
        <p class="mt-2"><strong>2.5. Согласие:</strong> Используя сервис, пользователь даёт согласие на обработку персональных данных в соответствии с Федеральным законом №152-ФЗ «О персональных данных».</p>
      </div>
      <div>
        <h3 class="font-bold text-white text-base mb-3">3. Условия и порядок возврата</h3>
        <p><strong>3.1.</strong> Возврат неиспользованных кредитов возможен в течение 14 (четырнадцати) календарных дней с момента покупки при условии, что кредиты не были использованы (полностью или частично).</p>
        <p class="mt-2"><strong>3.2.</strong> Для оформления возврата необходимо обратиться в службу поддержки по email: anisimovnrb99@gmail.com с указанием Telegram ID и причины возврата.</p>
        <p class="mt-2"><strong>3.3.</strong> Возврат осуществляется тем же способом, которым была произведена оплата, в течение 10 рабочих дней с момента одобрения заявки.</p>
        <p class="mt-2"><strong>3.4.</strong> Использованные кредиты (полностью или частично) возврату не подлежат, так как услуга считается оказанной в момент генерации AI-контента.</p>
        <p class="mt-2"><strong>3.5.</strong> Бесплатные кредиты (приветственные, реферальные) возврату не подлежат.</p>
      </div>
      <div>
        <h3 class="font-bold text-white text-base mb-3">4. Подробное описание платных услуг</h3>
        <p>UraanxAI — сервис искусственного интеллекта, работающий через Telegram Mini App. Оплата производится путём приобретения внутренних кредитов.</p>
        <p class="mt-2"><strong>Предоставляемые услуги и их стоимость:</strong></p>
        <ul class="list-disc list-inside mt-2 space-y-1">
          <li><strong>AI-чат</strong> на русском и якутском языках — 1 кредит за сообщение</li>
          <li><strong>Генерация изображений</strong> по текстовому описанию — 79 кредитов за изображение</li>
          <li><strong>Редактирование изображений</strong> с помощью AI — 79 кредитов</li>
          <li><strong>Генерация видео</strong> по текстовому описанию — 608 кредитов</li>
          <li><strong>Motion Control</strong> (анимация изображений) — 608 кредитов</li>
          <li><strong>Создание говорящих аватаров</strong> — 810 кредитов</li>
        </ul>
        <p class="mt-3"><strong>Пакеты кредитов:</strong></p>
        <ul class="list-disc list-inside mt-1 space-y-1">
          <li>Старт — 99 ₽ (1 100 кредитов)</li>
          <li>Базовый — 299 ₽ (3 500 кредитов)</li>
          <li>Про — 799 ₽ (10 000 кредитов)</li>
          <li>Макс — 1 990 ₽ (28 000 кредитов)</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Contacts -->
  <section class="max-w-5xl mx-auto px-6 py-16" id="contacts">
    <h2 class="text-2xl font-bold text-center mb-10">Контакты</h2>
    <div class="glass p-8 text-center space-y-4">
      <p class="text-slate-300"><strong>Telegram:</strong> <a href="https://t.me/UraanxAI_bot" class="text-violet-400 hover:underline">@UraanxAI_bot</a></p>
      <p class="text-slate-300"><strong>Email:</strong> <a href="mailto:anisimovnrb99@gmail.com" class="text-violet-400 hover:underline">anisimovnrb99@gmail.com</a></p>
      <p class="text-slate-300"><strong>Разработчик:</strong> ИП Анисимов (Республика Саха, Якутия)</p>
    </div>
  </section>

  <!-- Payment logos -->
  <section class="max-w-5xl mx-auto px-6 py-10">
    <div class="flex flex-wrap items-center justify-center gap-8 opacity-50">
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none"><rect width="60" height="20" rx="4" fill="#1A1F71"/><text x="8" y="14" fill="white" font-size="11" font-weight="bold" font-family="Arial">VISA</text></svg>
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none"><circle cx="22" cy="10" r="9" fill="#EB001B"/><circle cx="38" cy="10" r="9" fill="#F79E1B"/><path d="M30 3.5a9 9 0 000 13" fill="#FF5F00"/></svg>
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none"><rect width="60" height="20" rx="4" fill="#00A0E5"/><text x="14" y="14" fill="white" font-size="10" font-weight="bold" font-family="Arial">МИР</text></svg>
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none"><rect width="60" height="20" rx="4" fill="#21A038"/><text x="11" y="14" fill="white" font-size="9" font-weight="bold" font-family="Arial">СБП</text></svg>
    </div>
    <p class="text-center text-slate-600 text-xs mt-4">Безопасные платежи через UnitPay. Мы не храним данные банковских карт.</p>
  </section>

  <!-- Footer -->
  <footer class="max-w-5xl mx-auto px-6 py-8 border-t border-white/5 text-center">
    <p class="text-slate-500 text-sm">© 2026 UraanxAI. Все права защищены.</p>
    <div class="flex justify-center gap-6 mt-3 text-sm">
      <a href="#terms" class="text-slate-400 hover:text-white transition">Пользовательское соглашение</a>
      <a href="#pricing" class="text-slate-400 hover:text-white transition">Тарифы</a>
      <a href="#contacts" class="text-slate-400 hover:text-white transition">Контакты</a>
    </div>
  </footer>

</body>
</html>`;
