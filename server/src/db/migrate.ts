import { pool } from './pool';

// Эта функция создаёт все таблицы в базе данных при первом запуске.
// "IF NOT EXISTS" — безопасно: если таблица уже есть, ничего не сломается.
export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            BIGINT PRIMARY KEY,        -- Telegram user ID
      username      TEXT,                       -- @username (может быть null)
      first_name    TEXT NOT NULL,
      last_name     TEXT,
      language_code TEXT DEFAULT 'ru',          -- 'ru' или 'sah' (якутский)
      credits       INTEGER NOT NULL DEFAULT 0, -- баланс кредитов
      referred_by   BIGINT REFERENCES users(id),-- кто пригласил
      is_banned     BOOLEAN NOT NULL DEFAULT false,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chats (
      id         SERIAL PRIMARY KEY,
      user_id    BIGINT NOT NULL REFERENCES users(id),
      title      TEXT NOT NULL DEFAULT 'Новый чат',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         SERIAL PRIMARY KEY,
      chat_id    INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
      role       TEXT NOT NULL CHECK (role IN ('user', 'model')),
      content    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id          SERIAL PRIMARY KEY,
      user_id     BIGINT NOT NULL REFERENCES users(id),
      type        TEXT NOT NULL,    -- 'chat', 'image', 'video', 'topup', 'referral'
      amount      INTEGER NOT NULL, -- положительное = пополнение, отрицательное = списание
      description TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Хранит IP-адреса юзеров для антифрод-проверки рефералов
    CREATE TABLE IF NOT EXISTS user_ips (
      user_id    BIGINT NOT NULL REFERENCES users(id),
      ip         TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, ip)
    );

    -- Реферальные связи
    CREATE TABLE IF NOT EXISTS referrals (
      id              SERIAL PRIMARY KEY,
      referrer_id     BIGINT NOT NULL REFERENCES users(id), -- кто пригласил
      referee_id      BIGINT NOT NULL REFERENCES users(id), -- кого пригласили
      status          TEXT NOT NULL DEFAULT 'pending',
        -- pending  = ждём оплату
        -- held     = оплата есть, ждём AI-запрос + 24ч
        -- paid     = награда выплачена
        -- rejected = антифрод отклонил
      package         TEXT,           -- 'start' | 'basic' | 'pro' | 'max'
      reward_credits  INTEGER NOT NULL DEFAULT 0,
      has_ai_request  BOOLEAN NOT NULL DEFAULT false,
      paid_at         TIMESTAMPTZ,    -- когда была оплата (старт 24ч-холда)
      reward_paid_at  TIMESTAMPTZ,    -- когда выплатили награду
      reject_reason   TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (referee_id)             -- один реферал на одного юзера
    );

    CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals (referrer_id);
    CREATE INDEX IF NOT EXISTS referrals_status_idx   ON referrals (status);

    -- Заказы на оплату
    CREATE TABLE IF NOT EXISTS orders (
      id          TEXT PRIMARY KEY,              -- уникальный ID заказа (uuid)
      user_id     BIGINT NOT NULL REFERENCES users(id),
      package     TEXT NOT NULL,                 -- 'start' | 'basic' | 'pro' | 'max'
      amount_rub  INTEGER NOT NULL,              -- сумма в рублях
      credits     INTEGER NOT NULL,              -- сколько кредитов начислить
      status      TEXT NOT NULL DEFAULT 'pending', -- pending | paid | expired
      paid_at     TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS orders_user_idx   ON orders (user_id);
    CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

    -- История генераций (картинки, видео, аватары)
    CREATE TABLE IF NOT EXISTS generations (
      id          SERIAL PRIMARY KEY,
      user_id     BIGINT NOT NULL REFERENCES users(id),
      type        TEXT NOT NULL,                 -- 'image' | 'video' | 'motion' | 'avatar'
      prompt      TEXT,
      result_url  TEXT NOT NULL,                 -- URL или data:base64
      cost        INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS generations_user_idx ON generations (user_id, created_at DESC);

    -- Фикс foreign key: разрешить каскадное удаление пушей
    DO $$ BEGIN
      ALTER TABLE push_log DROP CONSTRAINT IF EXISTS push_log_template_id_fkey;
      ALTER TABLE push_log ADD CONSTRAINT push_log_template_id_fkey FOREIGN KEY (template_id) REFERENCES push_templates(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END $$;

    -- Часовой пояс юзера (минуты от UTC, 540 = UTC+9 Якутск)
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN timezone_offset INTEGER DEFAULT 540;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- Шаблоны пушей
    CREATE TABLE IF NOT EXISTS push_templates (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      text          TEXT NOT NULL,
      media_type    TEXT,                             -- 'photo' | 'video' | NULL
      media_file_id TEXT,                             -- Telegram file_id
      schedule_type TEXT NOT NULL DEFAULT 'manual',   -- 'manual' | 'daily' | 'welcome'
      send_time     TEXT,                             -- 'HH:MM' для daily
      is_active     BOOLEAN NOT NULL DEFAULT true,
      created_by    BIGINT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Лог рассылок
    CREATE TABLE IF NOT EXISTS push_log (
      id            SERIAL PRIMARY KEY,
      template_id   INTEGER REFERENCES push_templates(id) ON DELETE CASCADE,
      sent_count    INTEGER NOT NULL DEFAULT 0,
      failed_count  INTEGER NOT NULL DEFAULT 0,
      started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at   TIMESTAMPTZ
    );
    -- ═══════════════════════════════════════════════════
    -- Автоматические пуш-последовательности
    -- ═══════════════════════════════════════════════════

    -- Шаблоны автоматических пушей (триггерные последовательности)
    CREATE TABLE IF NOT EXISTS push_sequences (
      id              SERIAL PRIMARY KEY,
      trigger_type    TEXT NOT NULL,              -- 'no_purchase' | 'after_purchase' | 'low_credits' | 'zero_credits'
      delay_minutes   INTEGER NOT NULL DEFAULT 0, -- задержка после триггера (минуты)
      credits_threshold INTEGER,                  -- порог кредитов для low_credits (500/350/150)
      text            TEXT NOT NULL,              -- текст сообщения
      media_type      TEXT,                       -- 'photo' | 'video' | NULL
      media_url       TEXT,                       -- URL картинки/видео
      media_file_id   TEXT,                       -- Telegram file_id (после первой отправки)
      label           TEXT NOT NULL,              -- название для админки
      is_active       BOOLEAN NOT NULL DEFAULT true,
      allow_hour_from INTEGER NOT NULL DEFAULT 9, -- не раньше 9:00 по времени юзера
      allow_hour_to   INTEGER NOT NULL DEFAULT 22,-- не позже 22:00
      sort_order      INTEGER NOT NULL DEFAULT 0, -- порядок в админке
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS push_seq_trigger_idx ON push_sequences (trigger_type, is_active);

    -- Лог отправленных автопушей (дедупликация — один пуш одному юзеру один раз)
    CREATE TABLE IF NOT EXISTS push_sent (
      id          SERIAL PRIMARY KEY,
      user_id     BIGINT NOT NULL REFERENCES users(id),
      sequence_id INTEGER NOT NULL REFERENCES push_sequences(id) ON DELETE CASCADE,
      sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, sequence_id)
    );

    CREATE INDEX IF NOT EXISTS push_sent_user_idx ON push_sent (user_id);

    -- Трекинг событий для триггеров (когда юзер перешёл в состояние)
    -- Используем для zero_credits: запоминаем момент когда кредиты обнулились
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN credits_zero_at TIMESTAMPTZ;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- Soft-delete для пуш-последовательностей (корзина)
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN deleted_at TIMESTAMPTZ;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- Push sequences: расширенные настройки времени и приветствий
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN send_mode TEXT DEFAULT 'immediate';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN strict_time TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN preferred_time TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN weekday TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN greeting_mode TEXT DEFAULT 'none';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN greeting_fixed TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- Users: отслеживание последней активности для реактивации
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN last_seen TIMESTAMPTZ;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- Видео размеры для правильного отображения в Telegram
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN media_width INTEGER;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN media_height INTEGER;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- A/B тест текст
    DO $$ BEGIN
      ALTER TABLE push_sequences ADD COLUMN ab_text TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- Видео размеры для push_templates
    DO $$ BEGIN
      ALTER TABLE push_templates ADD COLUMN media_width INTEGER;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE push_templates ADD COLUMN media_height INTEGER;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- Убрать UNIQUE constraint на push_sent чтобы daily пуши могли отправляться каждый день
    DO $$ BEGIN
      ALTER TABLE push_sent DROP CONSTRAINT IF EXISTS push_sent_user_id_sequence_id_key;
    EXCEPTION WHEN OTHERS THEN NULL;
    END $$;

    -- Pending motion-control запросы (legacy, kept for backward compat)
    CREATE TABLE IF NOT EXISTS pending_motion (
      request_id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      cost INT NOT NULL,
      endpoint TEXT NOT NULL,
      prompt TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Универсальная таблица async-задач (все генерации через Kling Direct)
    CREATE TABLE IF NOT EXISTS pending_tasks (
      id              SERIAL PRIMARY KEY,
      task_id         TEXT NOT NULL UNIQUE,
      kling_task_id   TEXT NOT NULL,
      user_id         BIGINT NOT NULL,
      type            TEXT NOT NULL,
      kling_endpoint  TEXT NOT NULL,
      cost            INTEGER NOT NULL,
      prompt          TEXT,
      status          TEXT NOT NULL DEFAULT 'pending',
      result_url      TEXT,
      error_msg       TEXT,
      metadata        JSONB,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS pending_tasks_active_idx ON pending_tasks (status) WHERE status IN ('pending', 'processing');
    CREATE INDEX IF NOT EXISTS pending_tasks_user_idx ON pending_tasks (user_id, created_at DESC);

    -- Курс валют (для динамического ценообразования)
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id          SERIAL PRIMARY KEY,
      currency    TEXT NOT NULL UNIQUE,
      rate        NUMERIC(12,4) NOT NULL,
      base_rate   NUMERIC(12,4) NOT NULL DEFAULT 80.62,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    INSERT INTO exchange_rates (currency, rate, base_rate)
    VALUES ('USD', 80.62, 80.62) ON CONFLICT (currency) DO NOTHING;

    -- Настройки API-пакетов (для мониторинга расходов)
    CREATE TABLE IF NOT EXISTS api_packages (
      id              SERIAL PRIMARY KEY,
      service         TEXT NOT NULL UNIQUE,
      package_size    NUMERIC DEFAULT 0,
      package_expiry  TIMESTAMPTZ,
      notes           TEXT,
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );
    INSERT INTO api_packages (service, package_size, package_expiry, notes) VALUES
      ('kling', 2000, '2026-06-30', 'Limited Pack 2'),
      ('gemini', 300, '2026-06-28', '$300 free credits'),
      ('fal', 0, NULL, 'Pay as you go')
    ON CONFLICT (service) DO NOTHING;

    -- ═══ Антифрод-система ═══

    -- Device fingerprints (слой 1)
    CREATE TABLE IF NOT EXISTS device_fingerprints (
      id              SERIAL PRIMARY KEY,
      user_id         BIGINT NOT NULL REFERENCES users(id),
      fingerprint_hash TEXT NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_device_fp_hash ON device_fingerprints (fingerprint_hash);
    CREATE INDEX IF NOT EXISTS idx_device_fp_user ON device_fingerprints (user_id);
    -- Unique: один юзер — один fingerprint запись
    DO $$ BEGIN
      ALTER TABLE device_fingerprints ADD CONSTRAINT device_fp_unique UNIQUE (user_id, fingerprint_hash);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- Fraud score в users
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN fraud_score INTEGER;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    -- Welcome bonus granted flag
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN welcome_bonus_granted BOOLEAN NOT NULL DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  console.log('✅ Миграции применены');
}

// Отдельная функция для seed — вызывается из index.ts ПОСЛЕ миграции
export async function seedPushData() {
  const { rows: seqCount } = await pool.query(`SELECT COUNT(*) as cnt FROM push_sequences`);
  const cnt = parseInt(seqCount[0].cnt);
  if (cnt > 0) { console.log('⏭ push_sequences: уже есть ' + cnt + ' записей'); return 0; }
  console.log('📥 Заполняем push_sequences...');
  const IMG = {
      fashion: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260217_175012_2482b23d-7762-4366-b718-3fde133ac10e.png',
      fantasy: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260207_193655_711f3c26-8d2b-4e66-89e4-8357c0100b62.png',
      portrait: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_142019_2da23ac9-1bf0-4ba6-8b0c-11e45297c26e.png',
      ocean: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260218_122714_a722e28d-e551-46fe-894d-db88c7c8b7ad.png',
      interior: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_134706_11f7c352-78f2-4a8e-a5cd-0ab9cfe0fcac.png',
      dog: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_140800_3330a6bc-1ef6-47ef-92a0-404a1ce2f200.png',
      jellyfish: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260217_184432_7af6e3df-a5ad-4e8a-a3b4-c6d8637ce85c.png',
      vintage: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260218_140810_000df2f5-c22c-490b-ba58-1bc267964f2d.png',
      couple: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_174359_0bb5e528-8943-4765-ae11-42c58f518025.png',
      dancer: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260217_212611_922a5d2b-2a21-4b76-bae2-cf3d73bcbc12.png',
      pion: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_124914_3497c398-0398-44f7-a5b7-395d6c832886.png',
    };

    const seeds = [
      // NO_PURCHASE
      ['no_purchase',0,null,'Приветствие','Добро пожаловать в UraanxAI! 🎨\n\nТы только что открыл доступ к самым мощным AI-инструментам:\n\n🖼 Генерация картинок — от фэшн-фото до фэнтези\n🎬 Создание видео — реалистичные ролики за минуты\n🤖 AI-чат — умный помощник на русском и якутском\n\nУ тебя есть бесплатные кредиты — попробуй прямо сейчас!','photo',IMG.fashion],
      ['no_purchase',10,null,'10 мин — возможности','Посмотри что создают наши пользователи 🔥\n\nЭто не фотошоп — это AI-генерация за 30 секунд. Просто опиши что хочешь увидеть, и нейросеть создаст это.\n\nПопробуй бесплатно — у тебя ещё есть кредиты!','photo',IMG.fantasy],
      ['no_purchase',20,null,'20 мин — видео','А ты знал, что можно создать видео из текста? 🎬\n\nОпиши сцену — AI сгенерирует реалистичный ролик. Люди, природа, спецэффекты — всё возможно.\n\nЗайди в раздел «Видео» и попробуй!','photo',IMG.ocean],
      ['no_purchase',35,null,'35 мин — соцдок','Уже тысячи людей создают контент с UraanxAI 📈\n\nБлогеры генерируют обложки, предприниматели — рекламные материалы, художники — вдохновение.\n\nА что создашь ты?','photo',IMG.portrait],
      ['no_purchase',90,null,'1.5ч — предложение','Специально для тебя 🎁\n\nПакет «Старт» — всего 99₽:\n• 1 100 кредитов\n• ~14 картинок или 1-2 видео\n• Безлимитный AI-чат\n\nЭто дешевле чашки кофе, а возможности — безграничные!','photo',IMG.jellyfish],
      ['no_purchase',210,null,'3.5ч — образование','3 идеи что можно создать с AI прямо сейчас:\n\n1. 🖼 Аватар для соцсетей в любом стиле\n2. 🎬 Короткий ролик для TikTok/Reels\n3. 💬 Перевод текста на якутский язык\n\nВсё это — в одном приложении. Открой и попробуй!','photo',IMG.dancer],
      ['no_purchase',300,null,'5ч — FOMO','Пока ты думаешь, другие уже создают 🚀\n\nЗа последний час наши пользователи сгенерировали сотни картинок и десятки видео.\n\nНе упусти свой шанс — начни создавать!','photo',IMG.pion],
      ['no_purchase',480,null,'8ч — истории','Как люди используют UraanxAI:\n\n📸 Фотограф создаёт мудборды за минуты\n🎥 Блогер генерирует обложки без дизайнера\n🏠 Дизайнер визуализирует интерьеры мгновенно\n\nНачни свою историю — от 99₽!','photo',IMG.interior],
      ['no_purchase',600,null,'10ч — последний шанс','Твои бесплатные кредиты скоро закончатся ⏰\n\nИспользуй их, пока есть возможность! А если понравится — пакет «Старт» за 99₽ даст в 20 раз больше.\n\nОткрой приложение →','photo',IMG.couple],
      ['no_purchase',1440,null,'24ч — новый день','Доброе утро! ☀️\n\nВчера ты открыл UraanxAI — сегодня самое время попробовать. Мы добавляем новые шаблоны каждую неделю.\n\nЗайди и создай что-нибудь крутое!','photo',IMG.dog],
      ['no_purchase',2880,null,'48ч — финальное','Мы заметили, что ты ещё не попробовал все возможности 👀\n\nUraanxAI умеет:\n• Генерировать фото любого стиля\n• Создавать видео из текста\n• Переносить движения на персонажей\n• Общаться как умный помощник\n\nВсего 99₽ за полный доступ. Попробуй!','photo',IMG.vintage],
      // AFTER_PURCHASE
      ['after_purchase',0,null,'Благодарность','Спасибо за покупку! 🎉\n\nКредиты уже на твоём балансе. Вот с чего начать:\n\n1. Открой «Картинки» → выбери шаблон → нажми «Использовать»\n2. Или напиши свой промпт с нуля\n3. Попробуй «Видео» — это впечатляет!\n\nСоздавай без ограничений! 💫',null,null],
      // LOW_CREDITS
      ['low_credits',0,500,'< 500 кредитов','На балансе осталось менее 500 кредитов 📊\n\nЭтого хватит примерно на:\n• 6 картинок\n• Или 500 сообщений в чате\n\nПополни баланс, чтобы не прерывать творчество!',null,null],
      ['low_credits',0,350,'< 350 кредитов','Кредиты заканчиваются — осталось менее 350 ⚡\n\nПакет «Базовый» за 299₽ даст 3 500 кредитов — хватит надолго!\n\nПополни сейчас, чтобы не потерять вдохновение.','photo',IMG.fashion],
      ['low_credits',0,150,'< 150 кредитов','Внимание! Осталось менее 150 кредитов 🔴\n\nЭто всего 1-2 картинки. Пополни баланс прямо сейчас:\n\n• Старт — 99₽ (1 100 кр.)\n• Базовый — 299₽ (3 500 кр.)\n• Про — 799₽ (10 000 кр.) ⭐ Популярный\n\nНе дай творчеству остановиться!',null,null],
      // ZERO_CREDITS
      ['zero_credits',5,null,'5мин — закончились','Кредиты закончились 😔\n\nНо это не конец! Пополни баланс и продолжай создавать:\n\n• Старт — 99₽ → 1 100 кредитов\n• Базовый — 299₽ → 3 500 кредитов\n• Про — 799₽ → 10 000 кредитов\n\nНажми «Купить AI-кредиты» на главном экране!',null,null],
      ['zero_credits',60,null,'1ч — упускаешь','Пока ты без кредитов, другие создают невероятное 🌟\n\nВернись и пополни баланс — всего от 99₽!','photo',IMG.pion],
      ['zero_credits',300,null,'5ч — спецпредложение','Скучаешь по AI-генерации? 🎨\n\nПакет «Про» — лучшее соотношение цены:\n• 10 000 кредитов за 799₽\n• ~130 картинок или 12+ видео\n• Безлимитный AI-чат\n\nВернись и твори!','photo',IMG.fantasy],
      ['zero_credits',480,null,'8ч — FOMO','За сегодня наши пользователи создали тысячи AI-генераций 🔥\n\nНе оставайся в стороне — пополни баланс и присоединяйся!','photo',IMG.dancer],
      ['zero_credits',600,null,'10ч — пакеты','Какой пакет выбрать? 🤔\n\n💚 Старт (99₽) — попробовать\n💙 Базовый (299₽) — для регулярного использования\n💜 Про (799₽) — для активных создателей ⭐\n🖤 Макс (1990₽) — для профессионалов\n\nВыбери свой и продолжай создавать!',null,null],
      ['zero_credits',1440,null,'24ч — новый контент','Мы обновили шаблоны! 🆕\n\nНовые стили картинок, видео-пресеты и аватары ждут тебя. Пополни баланс и попробуй первым!','photo',IMG.ocean],
      ['zero_credits',2880,null,'48ч — финальное','Мы скучаем по тебе! 💫\n\nUraanxAI стал ещё лучше. Новые модели, больше возможностей.\n\nВернись и создай что-то потрясающее — от 99₽!','photo',IMG.couple],
    ];

    for (const s of seeds) {
      await pool.query(
        `INSERT INTO push_sequences (trigger_type, delay_minutes, credits_threshold, label, text, media_type, media_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
        [s[0], s[1], s[2], s[3], s[4], s[5], s[6]]
      );
    }
    console.log(`✅ Заполнено ${seeds.length} пуш-последовательностей`);
  return seeds.length;
}
