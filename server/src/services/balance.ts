import { pool } from '../db/pool';
import { redis } from '../db/redis';

// Ключ Redis для баланса одного юзера. TTL = 60 сек.
const BALANCE_KEY = (userId: number) => `balance:${userId}`;
const BALANCE_TTL = 60;

// Типы операций (совпадают с полем type в таблице transactions)
export type TxType = 'chat' | 'image' | 'video' | 'motion' | 'avatar' | 'topup' | 'referral';

// ─────────────────────────────────────────────────────────
// getBalance — сначала смотрим Redis, потом БД
// ─────────────────────────────────────────────────────────
export async function getBalance(userId: number): Promise<number> {
  const cached = await redis.get(BALANCE_KEY(userId));
  if (cached !== null) return parseInt(cached, 10);

  const result = await pool.query(
    'SELECT credits FROM users WHERE id = $1',
    [userId]
  );
  const credits: number = result.rows[0]?.credits ?? 0;

  // Кладём в кэш
  await redis.setex(BALANCE_KEY(userId), BALANCE_TTL, credits);
  return credits;
}

// ─────────────────────────────────────────────────────────
// deduct — атомарное списание кредитов
//
// Используем PostgreSQL-транзакцию + FOR UPDATE, чтобы
// два одновременных запроса не списали кредиты дважды.
// ─────────────────────────────────────────────────────────
export async function deduct(
  userId: number,
  amount: number,
  type: TxType,
  description: string
): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // FOR UPDATE блокирует строку до конца транзакции
    const userResult = await client.query(
      'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    const credits: number = userResult.rows[0]?.credits ?? 0;

    if (credits < amount) {
      await client.query('ROLLBACK');
      throw Object.assign(
        new Error(`Недостаточно кредитов. Нужно ${amount}, есть ${credits}`),
        { status: 402 }
      );
    }

    const updated = await client.query(
      'UPDATE users SET credits = credits - $1, updated_at = NOW() WHERE id = $2 RETURNING credits',
      [amount, userId]
    );

    await client.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [userId, type, -amount, description]
    );

    await client.query('COMMIT');

    const newBalance: number = updated.rows[0].credits;

    // Обновляем кэш сразу
    await redis.setex(BALANCE_KEY(userId), BALANCE_TTL, newBalance);

    return newBalance;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────
// addCredits — пополнение баланса (топап или реферал)
// ─────────────────────────────────────────────────────────
export async function addCredits(
  userId: number,
  amount: number,
  type: TxType,
  description: string
): Promise<number> {
  const result = await pool.query(
    'UPDATE users SET credits = credits + $1, updated_at = NOW() WHERE id = $2 RETURNING credits',
    [amount, userId]
  );

  await pool.query(
    'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
    [userId, type, amount, description]
  );

  const newBalance: number = result.rows[0].credits;
  await redis.setex(BALANCE_KEY(userId), BALANCE_TTL, newBalance);
  return newBalance;
}

// ─────────────────────────────────────────────────────────
// getTransactions — история операций юзера
// ─────────────────────────────────────────────────────────
export async function getTransactions(userId: number, limit = 20) {
  const result = await pool.query(
    `SELECT id, type, amount, description, created_at
     FROM transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}
