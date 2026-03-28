import { pool } from '../db/pool';

// ═══════════════════════════════════════════════════
// Автоматические пуш-последовательности
// ═══════════════════════════════════════════════════

export type TriggerType = 'no_purchase' | 'after_purchase' | 'low_credits' | 'zero_credits' | 'daily' | 'welcome';

export interface PushSequence {
  id: number;
  trigger_type: TriggerType;
  delay_minutes: number;
  credits_threshold: number | null;
  text: string;
  media_type: string | null;
  media_url: string | null;
  media_file_id: string | null;
  label: string;
  is_active: boolean;
  allow_hour_from: number;
  allow_hour_to: number;
}

export interface PendingPush {
  user_id: number;
  sequence_id: number;
  text: string;
  media_type: string | null;
  media_url: string | null;
  media_file_id: string | null;
}

// ─── Получить все активные последовательности ───
export async function getActiveSequences(trigger?: TriggerType): Promise<PushSequence[]> {
  const q = trigger
    ? `SELECT * FROM push_sequences WHERE is_active = true AND trigger_type = $1 ORDER BY delay_minutes`
    : `SELECT * FROM push_sequences WHERE is_active = true ORDER BY trigger_type, delay_minutes`;
  const { rows } = trigger ? await pool.query(q, [trigger]) : await pool.query(q);
  return rows;
}

// ─── Найти пользователей для пуша no_purchase ───
// Те, кто зарегистрировался >= delay_minutes назад и НЕ покупал пакет
async function findNoPurchaseUsers(seq: PushSequence): Promise<number[]> {
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND u.created_at <= NOW() - INTERVAL '1 minute' * $1
      AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'paid')
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $2)
  `, [seq.delay_minutes, seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Найти пользователей для пуша after_purchase ───
// Те, кто купил пакет >= delay_minutes назад
async function findAfterPurchaseUsers(seq: PushSequence): Promise<number[]> {
  const { rows } = await pool.query(`
    SELECT DISTINCT o.user_id AS id FROM orders o
    WHERE o.status = 'paid'
      AND o.paid_at <= NOW() - INTERVAL '1 minute' * $1
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = o.user_id AND ps.sequence_id = $2)
  `, [seq.delay_minutes, seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Найти пользователей для пуша low_credits ───
// Те, у кого credits <= threshold И кто покупал раньше (значит тратит)
async function findLowCreditsUsers(seq: PushSequence): Promise<number[]> {
  if (!seq.credits_threshold) return [];
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND u.credits <= $1
      AND u.credits > 0
      AND EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'paid')
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $2)
  `, [seq.credits_threshold, seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Найти пользователей для пуша zero_credits ───
// Те, у кого credits = 0 и credits_zero_at >= delay_minutes назад
async function findZeroCreditsUsers(seq: PushSequence): Promise<number[]> {
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND u.credits <= 0
      AND u.credits_zero_at IS NOT NULL
      AND u.credits_zero_at <= NOW() - INTERVAL '1 minute' * $1
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $2)
  `, [seq.delay_minutes, seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Ежедневный пуш — все активные юзеры, раз в день (дедупликация через push_sent с датой) ───
async function findDailyUsers(seq: PushSequence): Promise<number[]> {
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND NOT EXISTS (
        SELECT 1 FROM push_sent ps
        WHERE ps.user_id = u.id AND ps.sequence_id = $1
          AND ps.sent_at >= CURRENT_DATE
      )
  `, [seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Приветственный пуш — юзеры зареганные менее 5 минут назад ───
async function findWelcomeUsers(seq: PushSequence): Promise<number[]> {
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND u.created_at >= NOW() - INTERVAL '5 minutes'
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $1)
  `, [seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Проверить разрешённые часы по таймзоне юзера ───
async function filterByTimezone(userIds: number[], seq: PushSequence): Promise<number[]> {
  if (userIds.length === 0) return [];
  const { rows } = await pool.query(`
    SELECT id, timezone_offset FROM users WHERE id = ANY($1)
  `, [userIds]);

  return rows.filter((u: any) => {
    const offsetMin = u.timezone_offset || 180; // default UTC+3 (Moscow)
    const userHour = (new Date().getUTCHours() + Math.floor(offsetMin / 60)) % 24;
    return userHour >= seq.allow_hour_from && userHour < seq.allow_hour_to;
  }).map((u: any) => u.id);
}

// ─── Главная функция: найти все pending пуши ───
export async function findPendingPushes(): Promise<PendingPush[]> {
  const sequences = await getActiveSequences();
  const result: PendingPush[] = [];

  for (const seq of sequences) {
    let userIds: number[] = [];

    switch (seq.trigger_type) {
      case 'no_purchase':
        userIds = await findNoPurchaseUsers(seq);
        break;
      case 'after_purchase':
        userIds = await findAfterPurchaseUsers(seq);
        break;
      case 'low_credits':
        userIds = await findLowCreditsUsers(seq);
        break;
      case 'zero_credits':
        userIds = await findZeroCreditsUsers(seq);
        break;
      case 'daily':
        userIds = await findDailyUsers(seq);
        break;
      case 'welcome':
        userIds = await findWelcomeUsers(seq);
        break;
    }

    // Фильтр по разрешённым часам
    userIds = await filterByTimezone(userIds, seq);

    for (const uid of userIds) {
      result.push({
        user_id: uid,
        sequence_id: seq.id,
        text: seq.text,
        media_type: seq.media_type,
        media_url: seq.media_url,
        media_file_id: seq.media_file_id,
      });
    }
  }

  return result;
}

// ─── Пометить пуш как отправленный ───
export async function markPushSent(userId: number, sequenceId: number): Promise<void> {
  // Для daily пушей — вставляем новую запись каждый день (без ON CONFLICT)
  const seq = await pool.query('SELECT trigger_type FROM push_sequences WHERE id = $1', [sequenceId]);
  if (seq.rows[0]?.trigger_type === 'daily') {
    await pool.query(
      `INSERT INTO push_sent (user_id, sequence_id) VALUES ($1, $2)`,
      [userId, sequenceId]
    );
  } else {
    await pool.query(
      `INSERT INTO push_sent (user_id, sequence_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, sequenceId]
    );
  }
}

// ─── Обновить credits_zero_at при обнулении кредитов ───
export async function markCreditsZero(userId: number): Promise<void> {
  await pool.query(
    `UPDATE users SET credits_zero_at = NOW() WHERE id = $1 AND credits_zero_at IS NULL`,
    [userId]
  );
}

// ─── Сбросить credits_zero_at при пополнении ───
export async function clearCreditsZero(userId: number): Promise<void> {
  await pool.query(
    `UPDATE users SET credits_zero_at = NULL WHERE id = $1`,
    [userId]
  );
}

// ─── Сбросить пуши no_purchase при покупке (чтобы остановить цепочку) ───
export async function resetNoPurchasePushes(userId: number): Promise<void> {
  await pool.query(`
    INSERT INTO push_sent (user_id, sequence_id)
    SELECT $1, id FROM push_sequences WHERE trigger_type = 'no_purchase'
    ON CONFLICT DO NOTHING
  `, [userId]);
}

// ─── Сбросить пуши zero_credits при пополнении ───
export async function resetZeroCreditsPushes(userId: number): Promise<void> {
  await pool.query(`
    DELETE FROM push_sent WHERE user_id = $1 AND sequence_id IN (
      SELECT id FROM push_sequences WHERE trigger_type = 'zero_credits'
    )
  `, [userId]);
}

// ─── CRUD для админки ───
export async function getAllSequences(): Promise<PushSequence[]> {
  const { rows } = await pool.query(`SELECT * FROM push_sequences WHERE is_deleted = false ORDER BY trigger_type, delay_minutes`);
  return rows;
}

export async function getDeletedSequences(): Promise<PushSequence[]> {
  const { rows } = await pool.query(`SELECT * FROM push_sequences WHERE is_deleted = true ORDER BY deleted_at DESC`);
  return rows;
}

export async function upsertSequence(data: Partial<PushSequence> & { trigger_type: string; text: string; label: string }): Promise<PushSequence> {
  if (data.id) {
    const { rows } = await pool.query(`
      UPDATE push_sequences SET
        trigger_type = $2, delay_minutes = $3, credits_threshold = $4,
        text = $5, media_type = $6, media_url = $7, media_file_id = $12, label = $8,
        is_active = $9, allow_hour_from = $10, allow_hour_to = $11
      WHERE id = $1 RETURNING *
    `, [data.id, data.trigger_type, data.delay_minutes || 0, data.credits_threshold,
        data.text, data.media_type, data.media_url, data.label,
        data.is_active ?? true, data.allow_hour_from ?? 9, data.allow_hour_to ?? 22,
        data.media_file_id || null]);
    return rows[0];
  }
  const { rows } = await pool.query(`
    INSERT INTO push_sequences (trigger_type, delay_minutes, credits_threshold, text, media_type, media_url, media_file_id, label, is_active, allow_hour_from, allow_hour_to)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
  `, [data.trigger_type, data.delay_minutes || 0, data.credits_threshold,
      data.text, data.media_type, data.media_url, data.media_file_id || null, data.label,
      data.is_active ?? true, data.allow_hour_from ?? 9, data.allow_hour_to ?? 22]);
  return rows[0];
}

export async function deleteSequence(id: number): Promise<void> {
  await pool.query(`UPDATE push_sequences SET is_deleted = true, is_active = false, deleted_at = NOW() WHERE id = $1`, [id]);
}

export async function restoreSequence(id: number): Promise<void> {
  await pool.query(`UPDATE push_sequences SET is_deleted = false, deleted_at = NULL WHERE id = $1`, [id]);
}

export async function toggleSequence(id: number): Promise<boolean> {
  const { rows } = await pool.query(
    `UPDATE push_sequences SET is_active = NOT is_active WHERE id = $1 RETURNING is_active`,
    [id]
  );
  return rows[0]?.is_active;
}
