import { pool } from '../db/pool';

// ═══════════════════════════════════════════════════
// Автоматические пуш-последовательности
// ═══════════════════════════════════════════════════

export type TriggerType = 'no_purchase' | 'after_purchase' | 'low_credits' | 'zero_credits' | 'daily' | 'welcome' | 'reactivation' | 'first_generation';

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
  send_mode: string;           // 'immediate' | 'strict_time' | 'preferred_time'
  strict_time: string | null;  // '10:00'
  preferred_time: string | null; // '12:00'
  weekday: string | null;      // 'MON' | 'TUE' | ...
  greeting_mode: string;       // 'none' | 'dynamic' | 'fixed'
  greeting_fixed: string | null;
  media_width: number | null;
  media_height: number | null;
}

export interface PendingPush {
  user_id: number;
  sequence_id: number;
  text: string;
  media_type: string | null;
  media_url: string | null;
  media_file_id: string | null;
  media_width: number | null;
  media_height: number | null;
  greeting_mode: string;
  greeting_fixed: string | null;
  user_local_hour: number;
  ab_text: string | null;
}

// ─── Получить все активные последовательности ───
export async function getActiveSequences(trigger?: TriggerType): Promise<PushSequence[]> {
  const q = trigger
    ? `SELECT * FROM push_sequences WHERE is_active = true AND trigger_type = $1 ORDER BY delay_minutes`
    : `SELECT * FROM push_sequences WHERE is_active = true ORDER BY trigger_type, delay_minutes`;
  const { rows } = trigger ? await pool.query(q, [trigger]) : await pool.query(q);
  return rows;
}

// ─── Контекст цепочки: предыдущий шаг ───
interface ChainPrev { prevSeqId: number; deltaMinutes: number }

// ─── Найти пользователей для welcome пуша с delay > 0 ───
async function findWelcomeUsers(seq: PushSequence, prev: ChainPrev | null): Promise<number[]> {
  if (prev) {
    // Последующий шаг: требуем что предыдущий пуш отправлен >= deltaMinutes назад
    const { rows } = await pool.query(`
      SELECT u.id FROM users u
      WHERE u.is_banned = false
        AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $1)
        AND EXISTS (
          SELECT 1 FROM push_sent ps2
          WHERE ps2.user_id = u.id AND ps2.sequence_id = $2
          AND ps2.sent_at <= NOW() - INTERVAL '1 minute' * $3
        )
    `, [seq.id, prev.prevSeqId, prev.deltaMinutes]);
    return rows.map((r: any) => r.id);
  }
  // Первый шаг цепочки: оригинальная логика
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND u.created_at <= NOW() - INTERVAL '1 minute' * $1
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $2)
  `, [seq.delay_minutes, seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Найти пользователей для пуша no_purchase ───
async function findNoPurchaseUsers(seq: PushSequence, prev: ChainPrev | null): Promise<number[]> {
  if (prev) {
    const { rows } = await pool.query(`
      SELECT u.id FROM users u
      WHERE u.is_banned = false
        AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'paid')
        AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $1)
        AND EXISTS (
          SELECT 1 FROM push_sent ps2
          WHERE ps2.user_id = u.id AND ps2.sequence_id = $2
          AND ps2.sent_at <= NOW() - INTERVAL '1 minute' * $3
        )
    `, [seq.id, prev.prevSeqId, prev.deltaMinutes]);
    return rows.map((r: any) => r.id);
  }
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
async function findAfterPurchaseUsers(seq: PushSequence, prev: ChainPrev | null): Promise<number[]> {
  if (prev) {
    const { rows } = await pool.query(`
      SELECT DISTINCT o.user_id AS id FROM orders o
      WHERE o.status = 'paid'
        AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = o.user_id AND ps.sequence_id = $1)
        AND EXISTS (
          SELECT 1 FROM push_sent ps2
          WHERE ps2.user_id = o.user_id AND ps2.sequence_id = $2
          AND ps2.sent_at <= NOW() - INTERVAL '1 minute' * $3
        )
    `, [seq.id, prev.prevSeqId, prev.deltaMinutes]);
    return rows.map((r: any) => r.id);
  }
  const { rows } = await pool.query(`
    SELECT DISTINCT o.user_id AS id FROM orders o
    WHERE o.status = 'paid'
      AND o.paid_at <= NOW() - INTERVAL '1 minute' * $1
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = o.user_id AND ps.sequence_id = $2)
  `, [seq.delay_minutes, seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Найти пользователей для пуша low_credits ───
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
async function findZeroCreditsUsers(seq: PushSequence, prev: ChainPrev | null): Promise<number[]> {
  if (prev) {
    const { rows } = await pool.query(`
      SELECT u.id FROM users u
      WHERE u.is_banned = false
        AND u.credits <= 0
        AND u.credits_zero_at IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $1)
        AND EXISTS (
          SELECT 1 FROM push_sent ps2
          WHERE ps2.user_id = u.id AND ps2.sequence_id = $2
          AND ps2.sent_at <= NOW() - INTERVAL '1 minute' * $3
        )
    `, [seq.id, prev.prevSeqId, prev.deltaMinutes]);
    return rows.map((r: any) => r.id);
  }
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

// ─── Ежедневный пуш — раз в день, с учётом дня недели ───
async function findDailyUsers(seq: PushSequence): Promise<number[]> {
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND NOT EXISTS (
        SELECT 1 FROM push_sent ps
        WHERE ps.user_id = u.id AND ps.sequence_id = $1
          AND ps.sent_at >= NOW() - INTERVAL '23 hours'
      )
  `, [seq.id]);
  return rows.map((r: any) => r.id);
}


// ─── Реактивация — юзеры не заходившие 7+ дней, макс 3 раза ───
async function findReactivationUsers(seq: PushSequence): Promise<number[]> {
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND u.last_seen IS NOT NULL
      AND u.last_seen <= NOW() - INTERVAL '7 days'
      AND (SELECT COUNT(*) FROM push_sent ps
           WHERE ps.user_id = u.id
           AND ps.sequence_id IN (SELECT id FROM push_sequences WHERE trigger_type = 'reactivation')
          ) < 3
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $1)
  `, [seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Первая генерация — юзеры с ровно 1 генерацией, через delay_minutes ───
async function findFirstGenerationUsers(seq: PushSequence, prev: ChainPrev | null): Promise<number[]> {
  if (prev) {
    const { rows } = await pool.query(`
      SELECT u.id FROM users u
      WHERE u.is_banned = false
        AND (SELECT COUNT(*) FROM generations g WHERE g.user_id = u.id) >= 1
        AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $1)
        AND EXISTS (
          SELECT 1 FROM push_sent ps2
          WHERE ps2.user_id = u.id AND ps2.sequence_id = $2
          AND ps2.sent_at <= NOW() - INTERVAL '1 minute' * $3
        )
    `, [seq.id, prev.prevSeqId, prev.deltaMinutes]);
    return rows.map((r: any) => r.id);
  }
  const { rows } = await pool.query(`
    SELECT u.id FROM users u
    WHERE u.is_banned = false
      AND (SELECT COUNT(*) FROM generations g WHERE g.user_id = u.id) >= 1
      AND (SELECT MIN(g.created_at) FROM generations g WHERE g.user_id = u.id) <= NOW() - INTERVAL '1 minute' * $1
      AND NOT EXISTS (SELECT 1 FROM push_sent ps WHERE ps.user_id = u.id AND ps.sequence_id = $2)
  `, [seq.delay_minutes, seq.id]);
  return rows.map((r: any) => r.id);
}

// ─── Вычислить локальный час юзера ───
function getUserLocalHour(timezoneOffset: number): number {
  const offsetMin = timezoneOffset || 180; // default UTC+3 (Moscow)
  return (new Date().getUTCHours() + Math.floor(offsetMin / 60) + 24) % 24;
}

// ─── Вычислить локальный день недели юзера ───
function getUserLocalWeekday(timezoneOffset: number): string {
  const offsetMin = timezoneOffset || 180;
  const now = new Date();
  const localTime = new Date(now.getTime() + offsetMin * 60000);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[localTime.getUTCDay()];
}

// ─── Фильтр по часовому поясу с учётом send_mode и weekday ───
async function filterByTimezone(userIds: number[], seq: PushSequence): Promise<{ id: number; localHour: number }[]> {
  if (userIds.length === 0) return [];
  const { rows } = await pool.query(`
    SELECT id, timezone_offset FROM users WHERE id = ANY($1)
  `, [userIds]);

  const sendMode = seq.send_mode || 'immediate';
  const strictHour = seq.strict_time ? parseInt(seq.strict_time.split(':')[0], 10) : null;
  const preferredHour = seq.preferred_time ? parseInt(seq.preferred_time.split(':')[0], 10) : null;

  return rows.filter((u: any) => {
    const localHour = getUserLocalHour(u.timezone_offset);

    // Проверка дня недели (для daily с weekday)
    if (seq.weekday) {
      const localWeekday = getUserLocalWeekday(u.timezone_offset);
      if (localWeekday !== seq.weekday) return false;
    }

    // Режим отправки
    if (sendMode === 'strict_time' && strictHour !== null) {
      return localHour === strictHour;
    }
    if (sendMode === 'preferred_time' && preferredHour !== null) {
      // Отправляем только в preferred час, но в рамках окна
      return localHour === preferredHour && localHour >= seq.allow_hour_from && localHour < seq.allow_hour_to;
    }
    // immediate — стандартное окно
    return localHour >= seq.allow_hour_from && localHour < seq.allow_hour_to;
  }).map((u: any) => ({
    id: u.id,
    localHour: getUserLocalHour(u.timezone_offset),
  }));
}

// ─── Главная функция: найти все pending пуши ───
export async function findPendingPushes(): Promise<PendingPush[]> {
  const sequences = await getActiveSequences();
  const result: PendingPush[] = [];

  // Строим карту цепочек: для каждой последовательности находим предыдущий шаг
  const chainTypes: TriggerType[] = ['welcome', 'no_purchase', 'after_purchase', 'zero_credits', 'first_generation'];
  const chainMap = new Map<number, ChainPrev | null>();
  const byTrigger = new Map<TriggerType, PushSequence[]>();

  for (const seq of sequences) {
    if (!chainTypes.includes(seq.trigger_type)) continue;
    const list = byTrigger.get(seq.trigger_type) || [];
    list.push(seq);
    byTrigger.set(seq.trigger_type, list);
  }

  for (const [, list] of byTrigger) {
    // list уже отсортирован по delay_minutes (из getActiveSequences)
    for (let i = 0; i < list.length; i++) {
      if (i === 0) {
        chainMap.set(list[i].id, null); // первый в цепочке
      } else {
        chainMap.set(list[i].id, {
          prevSeqId: list[i - 1].id,
          deltaMinutes: list[i].delay_minutes - list[i - 1].delay_minutes,
        });
      }
    }
  }

  console.log(`[pending] Active sequences: ${sequences.length}, chainMap entries: ${chainMap.size}`);
  for (const [trigger, list] of byTrigger) {
    console.log(`[pending] Chain ${trigger}: ${list.map(s => `#${s.id}(delay=${s.delay_minutes})`).join(' → ')}`);
  }

  for (const seq of sequences) {
    let userIds: number[] = [];
    const prev = chainMap.get(seq.id) ?? null;

    switch (seq.trigger_type) {
      case 'no_purchase':
        userIds = await findNoPurchaseUsers(seq, prev);
        break;
      case 'after_purchase':
        userIds = await findAfterPurchaseUsers(seq, prev);
        break;
      case 'low_credits':
        userIds = await findLowCreditsUsers(seq);
        break;
      case 'zero_credits':
        userIds = await findZeroCreditsUsers(seq, prev);
        break;
      case 'daily':
        userIds = await findDailyUsers(seq);
        break;
      case 'welcome':
        // Первый welcome (delay=0) отправляется из /start, остальные через автопуши
        if (seq.delay_minutes > 0) {
          userIds = await findWelcomeUsers(seq, prev);
        }
        break;
      case 'reactivation':
        userIds = await findReactivationUsers(seq);
        break;
      case 'first_generation':
        userIds = await findFirstGenerationUsers(seq, prev);
        break;
    }

    if (userIds.length > 0) {
      console.log(`[pending] ${seq.trigger_type} #${seq.id} (delay=${seq.delay_minutes}): ${userIds.length} users found, prev=${prev ? `#${prev.prevSeqId} delta=${prev.deltaMinutes}min` : 'null (first)'}`);
    }

    // Daily пуши: фильтр по дню недели (из timezone юзера с телефона)
    // Остальные: строго по delay_minutes, без ограничений по часам
    const filtered = seq.trigger_type === 'daily'
      ? await filterByTimezone(userIds, seq)
      : userIds.map(id => ({ id, localHour: 12 }));

    if (userIds.length > 0 && filtered.length === 0) {
      console.log(`[pending] ${seq.trigger_type} #${seq.id}: ALL ${userIds.length} users filtered OUT by timezone (from=${seq.allow_hour_from}, to=${seq.allow_hour_to})`);
    }

    for (const u of filtered) {
      result.push({
        user_id: u.id,
        sequence_id: seq.id,
        text: seq.text,
        media_type: seq.media_type,
        media_url: seq.media_url,
        media_file_id: seq.media_file_id,
        media_width: seq.media_width || null,
        media_height: seq.media_height || null,
        greeting_mode: seq.greeting_mode || 'none',
        greeting_fixed: seq.greeting_fixed || null,
        user_local_hour: u.localHour,
        ab_text: (seq as any).ab_text || null,
      });
    }
  }

  return result;
}

// ─── Пометить пуш как отправленный ───
export async function markPushSent(userId: number, sequenceId: number): Promise<void> {
  const seq = await pool.query('SELECT trigger_type FROM push_sequences WHERE id = $1', [sequenceId]);
  const triggerType = seq.rows[0]?.trigger_type;
  // daily и reactivation — вставляем новую запись каждый раз
  if (triggerType === 'daily' || triggerType === 'reactivation') {
    await pool.query(
      `INSERT INTO push_sent (user_id, sequence_id) VALUES ($1, $2)`,
      [userId, sequenceId]
    );
  } else {
    // Одноразовые пуши — INSERT только если ещё нет записи (атомарно)
    await pool.query(
      `INSERT INTO push_sent (user_id, sequence_id)
       SELECT $1, $2 WHERE NOT EXISTS (
         SELECT 1 FROM push_sent WHERE user_id = $1 AND sequence_id = $2
       )`,
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
  // Вставляем записи для всех no_purchase пушей (блокируем повторную отправку)
  await pool.query(`
    INSERT INTO push_sent (user_id, sequence_id)
    SELECT $1, ps.id FROM push_sequences ps
    WHERE ps.trigger_type = 'no_purchase'
      AND NOT EXISTS (
        SELECT 1 FROM push_sent WHERE user_id = $1 AND sequence_id = ps.id
      )
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
        is_active = $9, allow_hour_from = $10, allow_hour_to = $11,
        send_mode = $13, strict_time = $14, preferred_time = $15,
        weekday = $16, greeting_mode = $17, greeting_fixed = $18,
        media_width = $19, media_height = $20, ab_text = $21
      WHERE id = $1 RETURNING *
    `, [data.id, data.trigger_type, data.delay_minutes || 0, data.credits_threshold,
        data.text, data.media_type, data.media_url, data.label,
        data.is_active ?? true, data.allow_hour_from ?? 9, data.allow_hour_to ?? 22,
        data.media_file_id || null,
        data.send_mode || 'immediate', data.strict_time || null, data.preferred_time || null,
        data.weekday || null, data.greeting_mode || 'none', data.greeting_fixed || null,
        data.media_width || null, data.media_height || null, (data as any).ab_text || null]);
    return rows[0];
  }
  const { rows } = await pool.query(`
    INSERT INTO push_sequences (trigger_type, delay_minutes, credits_threshold, text, media_type, media_url, media_file_id, label, is_active, allow_hour_from, allow_hour_to, send_mode, strict_time, preferred_time, weekday, greeting_mode, greeting_fixed, media_width, media_height, ab_text)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *
  `, [data.trigger_type, data.delay_minutes || 0, data.credits_threshold,
      data.text, data.media_type, data.media_url, data.media_file_id || null, data.label,
      data.is_active ?? true, data.allow_hour_from ?? 9, data.allow_hour_to ?? 22,
      data.send_mode || 'immediate', data.strict_time || null, data.preferred_time || null,
      data.weekday || null, data.greeting_mode || 'none', data.greeting_fixed || null,
      (data as any).media_width || null, (data as any).media_height || null, (data as any).ab_text || null]);
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
