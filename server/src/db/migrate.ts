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
  `);

  console.log('✅ Миграции применены');
}
