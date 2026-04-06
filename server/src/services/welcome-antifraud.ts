/**
 * Антифрод-система UraanxAI — 6 слоёв защиты
 * Источники: OWASP, IEEE, Stripe Radar, Gartner, IBM, FingerprintJS
 */
import { pool } from '../db/pool';

const BONUS_FULL = 300;
const BONUS_SUSPICIOUS = 50;
const BONUS_BLOCKED = 0;

interface TgUserInfo {
  id: number;
  username?: string | null;
  isPremium?: boolean;
  hasPhoto: boolean;
}

interface HeadlessSignals {
  webdriver?: boolean;
  noPlugins?: boolean;
  noLanguages?: boolean;
  phantomjs?: boolean;
  selenium?: boolean;
  noChrome?: boolean;
}

interface AntifraudResult {
  score: number;
  bonus: number;
  reasons: string[];
}

export async function calculateFraudScore(
  ip: string,
  deviceId: string | null,
  tgUser: TgUserInfo,
  headless: HeadlessSignals | null,
): Promise<AntifraudResult> {
  let score = 0;
  const reasons: string[] = [];

  // ── Слой 1: Device Fingerprint ──
  if (deviceId) {
    const { rows } = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS cnt FROM device_fingerprints WHERE fingerprint_hash = $1`,
      [deviceId]
    );
    const deviceAccounts = parseInt(rows[0]?.cnt || '0', 10);

    if (deviceAccounts >= 3) {
      score += 5;
      reasons.push(`device_multiaccounts:${deviceAccounts}`);
    } else if (deviceAccounts >= 1) {
      score += 3;
      reasons.push(`device_seen:${deviceAccounts}`);
    }
  }

  // ── Слой 2: Telegram Account Scoring ──
  if (tgUser.isPremium) {
    score -= 3;
    reasons.push('premium_user');
  }
  if (tgUser.id > 7_000_000_000) {
    score += 1;
    reasons.push('fresh_tg_account');
  }
  if (!tgUser.username) {
    score += 1;
    reasons.push('no_username');
  }
  if (!tgUser.hasPhoto) {
    score += 1;
    reasons.push('no_photo');
  }

  // ── Слой 3: IP Intelligence ──
  const ipResult = await pool.query(
    `SELECT COUNT(DISTINCT user_id) AS cnt FROM user_ips WHERE ip = $1`,
    [ip]
  );
  const ipAccounts = parseInt(ipResult.rows[0]?.cnt || '0', 10);

  if (ipAccounts >= 3) {
    // Проверяем есть ли покупки с этого IP
    const purchaseResult = await pool.query(
      `SELECT COUNT(*) AS cnt FROM orders
       WHERE status = 'paid'
         AND user_id IN (SELECT DISTINCT user_id FROM user_ips WHERE ip = $1)`,
      [ip]
    );
    const hasPurchases = parseInt(purchaseResult.rows[0]?.cnt || '0', 10) > 0;

    if (hasPurchases) {
      // Семья — кто-то покупал, доверяем
      reasons.push(`ip_family:${ipAccounts}`);
    } else {
      score += ipAccounts >= 5 ? 4 : 2;
      reasons.push(`ip_abuse:${ipAccounts}_no_purchases`);
    }
  }

  // ── Слой 4: Rate Limiting ──
  // Новые регистрации с этого IP за 24ч
  const recentIpRegs = await pool.query(
    `SELECT COUNT(*) AS cnt FROM users
     WHERE id IN (SELECT user_id FROM user_ips WHERE ip = $1)
       AND created_at > NOW() - INTERVAL '24 hours'`,
    [ip]
  );
  const recentIpCount = parseInt(recentIpRegs.rows[0]?.cnt || '0', 10);
  if (recentIpCount >= 3) {
    score += 3;
    reasons.push(`rate_limit_ip:${recentIpCount}_in_24h`);
  }

  // Новые регистрации с этого deviceId за 24ч
  if (deviceId) {
    const recentDevRegs = await pool.query(
      `SELECT COUNT(*) AS cnt FROM device_fingerprints
       WHERE fingerprint_hash = $1
         AND created_at > NOW() - INTERVAL '24 hours'`,
      [deviceId]
    );
    const recentDevCount = parseInt(recentDevRegs.rows[0]?.cnt || '0', 10);
    if (recentDevCount >= 2) {
      score += 4;
      reasons.push(`rate_limit_device:${recentDevCount}_in_24h`);
    }
  }

  // ── Слой 5: Headless Browser Detection ──
  if (headless) {
    let headlessFlags = 0;
    if (headless.webdriver) headlessFlags++;
    if (headless.selenium) headlessFlags++;
    if (headless.phantomjs) headlessFlags++;
    if (headless.noPlugins) headlessFlags++;
    if (headless.noLanguages) headlessFlags++;
    if (headless.noChrome) headlessFlags++;

    if (headlessFlags >= 2) {
      score += 5;
      reasons.push(`headless_detected:${headlessFlags}_flags`);
    } else if (headlessFlags === 1) {
      score += 1;
      reasons.push(`headless_suspect:1_flag`);
    }
  }

  // ── Итог ──
  score = Math.max(score, 0); // не уходим в минус

  let bonus: number;
  if (score >= 5) {
    bonus = BONUS_BLOCKED;
  } else if (score >= 3) {
    bonus = BONUS_SUSPICIOUS;
  } else {
    bonus = BONUS_FULL;
  }

  return { score, bonus, reasons };
}

// Сохранить fingerprint
export async function saveDeviceFingerprint(userId: number, deviceId: string): Promise<void> {
  await pool.query(
    `INSERT INTO device_fingerprints (user_id, fingerprint_hash)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, deviceId]
  );
}

// Начислить бонус при первом AI-запросе (отложенное начисление)
export async function tryGrantWelcomeBonus(userId: number): Promise<number> {
  // Проверяем: есть ли fraud_score и был ли уже бонус
  const { rows } = await pool.query(
    `SELECT fraud_score, welcome_bonus_granted FROM users WHERE id = $1 FOR UPDATE`,
    [userId]
  );
  if (!rows[0]) return 0;

  const { fraud_score, welcome_bonus_granted } = rows[0];
  if (welcome_bonus_granted) return 0; // уже начислено

  let bonus: number;
  if (fraud_score === null || fraud_score === undefined) {
    bonus = BONUS_FULL; // старый юзер без score — даём полный бонус
  } else if (fraud_score >= 5) {
    bonus = BONUS_BLOCKED;
  } else if (fraud_score >= 3) {
    bonus = BONUS_SUSPICIOUS;
  } else {
    bonus = BONUS_FULL;
  }

  if (bonus > 0) {
    await pool.query(
      `UPDATE users SET credits = credits + $1, welcome_bonus_granted = true WHERE id = $2 AND welcome_bonus_granted = false`,
      [bonus, userId]
    );
  } else {
    await pool.query(
      `UPDATE users SET welcome_bonus_granted = true WHERE id = $1 AND welcome_bonus_granted = false`,
      [userId]
    );
  }

  return bonus;
}
