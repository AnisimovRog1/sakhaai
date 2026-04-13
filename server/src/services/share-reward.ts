import { pool } from '../db/pool';
import { addCredits } from './balance';

const SHARE_BONUS = 50;
const DAILY_LIMIT = 3;

export async function processShareReward(
  sharerId: number,
  receiverId: number,
  generationId?: number
): Promise<{ ok: boolean; reason?: string }> {
  // Нельзя получить бонус от самого себя
  if (sharerId === receiverId) {
    return { ok: false, reason: 'self_share' };
  }

  // Дедупликация: один receiver = один бонус для данного sharer
  const existing = await pool.query(
    'SELECT id FROM share_rewards WHERE sharer_id = $1 AND receiver_id = $2',
    [sharerId, receiverId]
  );
  if (existing.rows.length > 0) {
    return { ok: false, reason: 'already_rewarded' };
  }

  // Антифрод: бонус ТОЛЬКО за новых юзеров (не было в БД до шеринга)
  // Если created_at > 2 мин назад — юзер существовал ДО клика по ссылке
  const userCheck = await pool.query(
    'SELECT created_at FROM users WHERE id = $1',
    [receiverId]
  );
  if (userCheck.rows.length > 0) {
    const createdAt = new Date(userCheck.rows[0].created_at);
    if (createdAt < new Date(Date.now() - 2 * 60 * 1000)) {
      return { ok: false, reason: 'existing_user' };
    }
  }

  // Лимит 3 бонуса в день
  const todayCount = await pool.query(
    `SELECT COUNT(*) FROM share_rewards
     WHERE sharer_id = $1
       AND credits_awarded > 0
       AND created_at >= CURRENT_DATE`,
    [sharerId]
  );
  if (parseInt(todayCount.rows[0].count, 10) >= DAILY_LIMIT) {
    return { ok: false, reason: 'daily_limit' };
  }

  // Записываем бонус + начисляем кредиты
  await pool.query(
    `INSERT INTO share_rewards (sharer_id, receiver_id, generation_id, credits_awarded)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (sharer_id, receiver_id) DO NOTHING`,
    [sharerId, receiverId, generationId ?? null, SHARE_BONUS]
  );

  await addCredits(sharerId, SHARE_BONUS, 'share_bonus',
    `Бонус за шеринг: пользователь ${receiverId} открыл ссылку`);

  return { ok: true };
}

// Статистика для админки
export async function getShareStats() {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total_shares,
      COUNT(*) FILTER (WHERE credits_awarded > 0) AS rewarded_shares,
      COUNT(DISTINCT sharer_id) AS unique_sharers,
      COUNT(DISTINCT receiver_id) AS unique_receivers,
      COALESCE(SUM(credits_awarded), 0) AS total_credits_awarded
    FROM share_rewards
  `);
  return result.rows[0];
}

// Последние записи для админки
export async function getShareRewardsRecent(limit = 50) {
  const { rows } = await pool.query(`
    SELECT sr.id, sr.sharer_id, sr.receiver_id, sr.generation_id,
           sr.credits_awarded, sr.created_at,
           u1.username AS sharer_username, u1.first_name AS sharer_name,
           u2.username AS receiver_username, u2.first_name AS receiver_name
    FROM share_rewards sr
    JOIN users u1 ON u1.id = sr.sharer_id
    JOIN users u2 ON u2.id = sr.receiver_id
    ORDER BY sr.created_at DESC
    LIMIT $1
  `, [limit]);
  return rows;
}
