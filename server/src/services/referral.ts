import { pool } from '../db/pool';
import { addCredits } from './balance';

// Награды за каждый пакет (из бизнес-плана)
export const REFERRAL_REWARDS: Record<string, number> = {
  start:  200,
  basic:  600,
  pro:    1500,
  max:    4000,
};

// Максимум рефералов в месяц на одного реферера
const MONTHLY_LIMIT = 30;

// Холд 24 часа в миллисекундах
const HOLD_MS = 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────
// saveIp — запоминаем IP юзера (используется для антифрод-проверки)
// ─────────────────────────────────────────────────────────────────────
export async function saveUserIp(userId: number, ip: string): Promise<void> {
  await pool.query(
    `INSERT INTO user_ips (user_id, ip) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, ip]
  );
}

// ─────────────────────────────────────────────────────────────────────
// register — записываем реферальную связь при первом входе нового юзера
//
// Все 5 антифрод-проверок выполняются здесь.
// ─────────────────────────────────────────────────────────────────────
export async function registerReferral(
  refereeId: number,    // новый юзер
  referrerId: number,   // кто пригласил
  refereeIp: string
): Promise<{ ok: boolean; reason?: string }> {

  // ── Правило 1: само-реферал запрещён ──────────────────────────────
  if (refereeId === referrerId) {
    return { ok: false, reason: 'self_referral' };
  }

  // ── Правило 2: IP-проверка — нельзя с одного IP ───────────────────
  const referrerIps = await pool.query(
    `SELECT ip FROM user_ips WHERE user_id = $1`,
    [referrerId]
  );
  const referrerIpSet = new Set(referrerIps.rows.map((r: { ip: string }) => r.ip));

  if (refereeIp && referrerIpSet.has(refereeIp)) {
    return { ok: false, reason: 'same_ip' };
  }

  // ── Правило 3: лимит 30 рефералов в месяц ─────────────────────────
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthCount = await pool.query(
    `SELECT COUNT(*) FROM referrals
     WHERE referrer_id = $1 AND created_at >= $2 AND status != 'rejected'`,
    [referrerId, monthStart]
  );
  if (parseInt(monthCount.rows[0].count, 10) >= MONTHLY_LIMIT) {
    return { ok: false, reason: 'monthly_limit' };
  }

  // ── Правило 4 и 5: проверяются позже (AI-запрос и 24ч-холд) ────────
  // Создаём запись со статусом pending
  await pool.query(
    `INSERT INTO referrals (referrer_id, referee_id, status)
     VALUES ($1, $2, 'pending')
     ON CONFLICT (referee_id) DO NOTHING`, // игнорируем повторные попытки
    [referrerId, refereeId]
  );

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// onAiRequest — Правило 4: отмечаем что реферал сделал первый AI-запрос
// ─────────────────────────────────────────────────────────────────────
export async function markAiRequest(refereeId: number): Promise<void> {
  await pool.query(
    `UPDATE referrals SET has_ai_request = true
     WHERE referee_id = $1 AND status IN ('pending', 'held')`,
    [refereeId]
  );

  // Если оплата уже была — переводим в held (ждём 24ч)
  await pool.query(
    `UPDATE referrals SET status = 'held'
     WHERE referee_id = $1 AND status = 'pending' AND paid_at IS NOT NULL AND has_ai_request = true`,
    [refereeId]
  );
}

// ─────────────────────────────────────────────────────────────────────
// onPayment — вызывается когда реферал совершил первую оплату
//
// Правило 5: начинаем 24ч-холд
// ─────────────────────────────────────────────────────────────────────
export async function onPayment(
  refereeId: number,
  packageName: string
): Promise<void> {
  const reward = REFERRAL_REWARDS[packageName] ?? 0;
  if (reward === 0) return;

  await pool.query(
    `UPDATE referrals
     SET package        = $1,
         reward_credits = $2,
         paid_at        = NOW(),
         status         = CASE
           WHEN has_ai_request = true THEN 'held'
           ELSE 'pending'
         END
     WHERE referee_id = $3 AND status = 'pending'`,
    [packageName, reward, refereeId]
  );
}

// ─────────────────────────────────────────────────────────────────────
// processHeldReferrals — Правило 5: выплачиваем вознаграждения,
// у которых прошло 24ч с момента оплаты.
//
// Вызывается при каждом запуске сервера и каждые N минут.
// ─────────────────────────────────────────────────────────────────────
export async function processHeldReferrals(): Promise<number> {
  const holdCutoff = new Date(Date.now() - HOLD_MS);

  // Берём все held-рефералы у которых прошёл холд
  const ready = await pool.query(
    `SELECT id, referrer_id, reward_credits, package
     FROM referrals
     WHERE status = 'held'
       AND has_ai_request = true
       AND paid_at <= $1
     FOR UPDATE SKIP LOCKED`, // SKIP LOCKED — безопасно при параллельных вызовах
    [holdCutoff]
  );

  let paid = 0;
  for (const row of ready.rows) {
    try {
      await addCredits(
        row.referrer_id,
        row.reward_credits,
        'referral',
        `Реферальная награда (${row.package}): +${row.reward_credits} кр.`
      );

      await pool.query(
        `UPDATE referrals SET status = 'paid', reward_paid_at = NOW() WHERE id = $1`,
        [row.id]
      );

      paid++;
      console.log(`✅ Реферал #${row.id}: выплачено ${row.reward_credits} кр. реферу ${row.referrer_id}`);
    } catch (err) {
      console.error(`❌ Ошибка выплаты реферала #${row.id}:`, err);
    }
  }

  return paid;
}

// ─────────────────────────────────────────────────────────────────────
// getFriends — список рефералов с деталями для UI
// ─────────────────────────────────────────────────────────────────────
export async function getReferralFriends(referrerId: number) {
  const result = await pool.query(
    `SELECT
       r.id,
       r.status,
       r.package,
       r.reward_credits,
       r.created_at,
       u.username,
       u.first_name
     FROM referrals r
     JOIN users u ON u.id = r.referee_id
     WHERE r.referrer_id = $1
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [referrerId]
  );

  return result.rows.map((row: {
    id: number; status: string; package: string | null;
    reward_credits: number | null; created_at: string;
    username: string | null; first_name: string;
  }) => ({
    id:           row.id,
    status:       row.status,
    package:      row.package,
    rewardCredits: row.reward_credits ?? 0,
    createdAt:    row.created_at,
    username:     row.username,
    firstName:    row.first_name,
  }));
}

// ─────────────────────────────────────────────────────────────────────
// getStats — статистика реферера для отображения в UI
// ─────────────────────────────────────────────────────────────────────
export async function getReferralStats(referrerId: number) {
  const result = await pool.query(
    `SELECT
       COUNT(*)                                          AS total,
       COUNT(*) FILTER (WHERE status = 'paid')          AS paid,
       COUNT(*) FILTER (WHERE status = 'held')          AS held,
       COUNT(*) FILTER (WHERE status = 'pending')       AS pending,
       COALESCE(SUM(reward_credits) FILTER (WHERE status = 'paid'), 0) AS total_earned
     FROM referrals
     WHERE referrer_id = $1`,
    [referrerId]
  );

  // Рефералы в этом месяце (для отображения лимита 30/мес)
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthResult = await pool.query(
    `SELECT COUNT(*) AS this_month
     FROM referrals
     WHERE referrer_id = $1 AND created_at >= $2 AND status != 'rejected'`,
    [referrerId, monthStart]
  );

  const s = result.rows[0];
  return {
    total:        parseInt(s.total, 10),
    paid:         parseInt(s.paid, 10),
    held:         parseInt(s.held, 10),
    pending:      parseInt(s.pending, 10),
    totalEarned:  parseInt(s.total_earned, 10),
    thisMonth:    parseInt(monthResult.rows[0].this_month, 10),
    monthlyLimit: MONTHLY_LIMIT,
  };
}
