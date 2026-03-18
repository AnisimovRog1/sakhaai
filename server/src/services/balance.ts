import { pool } from '../db/pool';
import { memCache } from '../db/redis';

const BALANCE_KEY = (userId: number) => `balance:${userId}`;
const BALANCE_TTL = 60;

export type TxType = 'chat' | 'image' | 'video' | 'motion' | 'avatar' | 'topup' | 'referral';

export async function getBalance(userId: number): Promise<number> {
  const cached = await memCache.get(BALANCE_KEY(userId));
  if (cached !== null) return parseInt(cached, 10);
  const result = await pool.query('SELECT credits FROM users WHERE id = $1', [userId]);
  const credits: number = result.rows[0]?.credits ?? 0;
  await memCache.setex(BALANCE_KEY(userId), BALANCE_TTL, credits);
  return credits;
}

export async function deduct(userId: number, amount: number, type: TxType, description: string): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const credits: number = userResult.rows[0]?.credits ?? 0;
    if (credits < amount) {
      await client.query('ROLLBACK');
      throw Object.assign(new Error(`Недостаточно кредитов. Нужно ${amount}, есть ${credits}`), { status: 402 });
    }
    const updated = await client.query('UPDATE users SET credits = credits - $1, updated_at = NOW() WHERE id = $2 RETURNING credits', [amount, userId]);
    await client.query('INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)', [userId, type, -amount, description]);
    await client.query('COMMIT');
    const newBalance: number = updated.rows[0].credits;
    await memCache.setex(BALANCE_KEY(userId), BALANCE_TTL, newBalance);
    return newBalance;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function addCredits(userId: number, amount: number, type: TxType, description: string): Promise<number> {
  const result = await pool.query('UPDATE users SET credits = credits + $1, updated_at = NOW() WHERE id = $2 RETURNING credits', [amount, userId]);
  await pool.query('INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)', [userId, type, amount, description]);
  const newBalance: number = result.rows[0].credits;
  await memCache.setex(BALANCE_KEY(userId), BALANCE_TTL, newBalance);
  return newBalance;
}

export async function getTransactions(userId: number, limit = 20) {
  const result = await pool.query(`SELECT id, type, amount, description, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`, [userId, limit]);
  return result.rows;
}
