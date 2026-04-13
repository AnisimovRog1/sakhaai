import { Router, Request, Response } from 'express';
import multer from 'multer';
import { pool } from '../db/pool';
import { addCredits, deduct } from '../services/balance';
import { getAllSequences, getActiveSequences, getDeletedSequences, upsertSequence, deleteSequence, restoreSequence, toggleSequence, findPendingPushes, markPushSent } from '../services/push-sequences';
import { seedPushSequences } from '../services/push-seed';
import { klingRequest } from '../services/kling-direct';
import { getRateInfo, updateExchangeRate } from '../services/exchange-rate';

export const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50 МБ (Telegram Bot API лимит)

function requireBotAuth(req: Request, res: Response, next: () => void) {
  const auth = req.headers.authorization;
  if (!auth) { res.status(403).json({ error: 'Доступ запрещён' }); return; }
  const token = auth.replace('Bearer ', '');
  // Принимаем BOT_TOKEN (от бота), JWT admin token (от веб-панели), или ADMIN_PASSWORD (legacy)
  if (token === process.env.BOT_TOKEN) { next(); return; }
  if (token === (process.env.ADMIN_PASSWORD || '')) { next(); return; }
  try {
    const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || process.env.ADMIN_PASSWORD) as any;
    if (payload.admin) { next(); return; }
  } catch {}
  res.status(403).json({ error: 'Доступ запрещён' });
}

adminRouter.use(requireBotAuth);

// ─── Ensure user exists (вызывается ботом при /start) ───
adminRouter.post('/ensure-user', async (req: Request, res: Response) => {
  try {
    const { id, first_name, username, campaign_code } = req.body;
    if (!id || !first_name) { res.status(400).json({ error: 'id and first_name required' }); return; }
    await pool.query(
      `INSERT INTO users (id, first_name, username, campaign_code)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, username = EXCLUDED.username, campaign_code = COALESCE(users.campaign_code, EXCLUDED.campaign_code), last_seen = NOW(), updated_at = NOW()`,
      [id, first_name, username ?? null, campaign_code ?? null]
    );
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── Хелпер: dateFilter по периоду (Якутск UTC+9) ──────
function buildDateFilter(period: string, column = 'created_at'): { filter: string; label: string } {
  const YKT_START = "date_trunc('day', NOW() AT TIME ZONE 'Asia/Yakutsk') AT TIME ZONE 'Asia/Yakutsk'";
  let filter = `${column} >= ${YKT_START}`;
  let label = 'сегодня';

  if (period === 'yesterday') {
    filter = `${column} >= (${YKT_START} - INTERVAL '1 day') AND ${column} < ${YKT_START}`;
    label = 'вчера';
  } else if (period === '7d') {
    filter = `${column} >= (${YKT_START} - INTERVAL '7 days')`;
    label = 'за 7 дней';
  } else if (period === 'month') {
    filter = `${column} >= date_trunc('month', NOW() AT TIME ZONE 'Asia/Yakutsk') AT TIME ZONE 'Asia/Yakutsk'`;
    label = 'за текущий месяц';
  } else if (period === '2m') {
    filter = `${column} >= (${YKT_START} - INTERVAL '2 months')`;
    label = 'за 2 месяца';
  } else if (period === '3m') {
    filter = `${column} >= (${YKT_START} - INTERVAL '3 months')`;
    label = 'за 3 месяца';
  } else if (period === '6m') {
    filter = `${column} >= (${YKT_START} - INTERVAL '6 months')`;
    label = 'за 6 месяцев';
  } else if (period === '1y') {
    filter = `${column} >= (${YKT_START} - INTERVAL '1 year')`;
    label = 'за год';
  } else if (/^\d{4}-\d{2}$/.test(period)) {
    const startDate = new Date(`${period}-01T00:00:00+09:00`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    filter = `${column} >= '${startDate.toISOString()}'::timestamptz AND ${column} < '${endDate.toISOString()}'::timestamptz`;
    label = `за ${period}`;
  }
  return { filter, label };
}

// ─── /stats?period=today|7d|month|2m|3m|6m|1y|2026-03 ──
adminRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const { filter: dateFilter, label } = buildDateFilter(period);

    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    const banned = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_banned = true');
    const newUsers = await pool.query(`SELECT COUNT(*) as count FROM users WHERE ${dateFilter}`);
    const chats = await pool.query('SELECT COUNT(*) as count FROM chats');
    const messages = await pool.query(`SELECT COUNT(*) as count FROM messages WHERE ${dateFilter}`);
    const generations = await pool.query(`SELECT COUNT(*) as count FROM generations WHERE ${dateFilter}`);
    const totalCredits = await pool.query('SELECT COALESCE(SUM(credits), 0) as total FROM users');

    // DAU — уникальные юзеры с транзакциями за период
    const dau = await pool.query(`SELECT COUNT(DISTINCT user_id) as count FROM transactions WHERE ${dateFilter}`);

    // Транзакции за период
    const txCount = await pool.query(`SELECT COUNT(*) as count FROM transactions WHERE ${dateFilter}`);

    // Выручка за период
    const revenue = await pool.query(`SELECT COALESCE(SUM(amount_rub), 0) as total FROM orders WHERE status = 'paid' AND ${dateFilter.replace(/created_at/g, 'paid_at')}`);

    // Выручка all-time
    const revenueAllTime = await pool.query(`SELECT COALESCE(SUM(amount_rub), 0) as total FROM orders WHERE status = 'paid'`);

    // Выручка за вчера
    const { filter: yesterdayFilter } = buildDateFilter('yesterday', 'paid_at');
    const revenueYesterday = await pool.query(`SELECT COALESCE(SUM(amount_rub), 0) as total FROM orders WHERE status = 'paid' AND ${yesterdayFilter}`);

    // Оплаченных заказов all-time
    const ordersAllTime = await pool.query(`SELECT COUNT(*) as count FROM orders WHERE status = 'paid'`);

    // Себестоимость (расход API) — считаем по генерациям
    const genCosts = await pool.query(`SELECT COALESCE(SUM(cost), 0) as total FROM generations WHERE ${dateFilter}`);

    // Рефералы за период
    const refs = await pool.query(`SELECT COUNT(*) as count FROM referrals WHERE ${dateFilter}`);

    // Топ-5 юзеров
    const topUsers = await pool.query(`SELECT id, username, first_name, credits FROM users ORDER BY credits DESC LIMIT 5`);

    // Топ-10 активных за период
    const topActive = await pool.query(`
      SELECT t.user_id, u.username, u.first_name, COUNT(*) as requests
      FROM transactions t JOIN users u ON t.user_id = u.id
      WHERE ${dateFilter.replace(/created_at/g, 't.created_at')}
      GROUP BY t.user_id, u.username, u.first_name
      ORDER BY requests DESC LIMIT 10
    `);

    const revenueRub = +revenue.rows[0].total;
    const costEstimate = +genCosts.rows[0].total * 0.1; // ~0.1₽ за кредит себестоимости
    const profit = revenueRub - costEstimate;
    const margin = revenueRub > 0 ? ((profit / revenueRub) * 100).toFixed(1) : '0';

    res.json({
      label,
      users: +users.rows[0].count,
      banned: +banned.rows[0].count,
      newUsers: +newUsers.rows[0].count,
      dau: +dau.rows[0].count,
      chats: +chats.rows[0].count,
      messages: +messages.rows[0].count,
      generations: +generations.rows[0].count,
      totalCredits: +totalCredits.rows[0].total,
      transactions: +txCount.rows[0].count,
      referrals: +refs.rows[0].count,
      revenue: revenueRub,
      revenueAllTime: +revenueAllTime.rows[0].total,
      revenueYesterday: +revenueYesterday.rows[0].total,
      ordersAllTime: +ordersAllTime.rows[0].count,
      costEstimate: Math.round(costEstimate),
      profit: Math.round(profit),
      margin,
      topUsers: topUsers.rows,
      topActive: topActive.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Detail endpoints для кликабельных stat cards ───────

// Генерации за период
adminRouter.get('/generations', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const { filter } = buildDateFilter(period, 'g.created_at');
    const rows = await pool.query(`
      SELECT g.id, g.user_id, u.username, u.first_name, g.type, g.prompt, g.result_url, g.cost, g.created_at
      FROM generations g JOIN users u ON g.user_id = u.id
      WHERE ${filter}
      ORDER BY g.created_at DESC LIMIT 200
    `);
    res.json(rows.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Чаты за период (с кол-вом сообщений)
adminRouter.get('/detail-chats', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const { filter } = buildDateFilter(period, 'c.created_at');
    const rows = await pool.query(`
      SELECT c.id, c.user_id, u.username, u.first_name, c.title, c.created_at,
        (SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.id) as message_count
      FROM chats c JOIN users u ON c.user_id = u.id
      WHERE ${filter}
      ORDER BY c.created_at DESC LIMIT 200
    `);
    res.json(rows.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Сообщения конкретного чата
adminRouter.get('/chat/:id/messages', async (req: Request, res: Response) => {
  try {
    const chatId = req.params.id;
    const chat = await pool.query(`
      SELECT c.id, c.title, c.user_id, u.username, u.first_name
      FROM chats c JOIN users u ON c.user_id = u.id WHERE c.id = $1
    `, [chatId]);
    if (!chat.rows.length) { res.status(404).json({ error: 'Chat not found' }); return; }
    const msgs = await pool.query(`
      SELECT id, role, content, created_at FROM messages
      WHERE chat_id = $1 ORDER BY created_at ASC
    `, [chatId]);
    res.json({ chat: chat.rows[0], messages: msgs.rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Оплаты за период
adminRouter.get('/orders-list', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const { filter } = buildDateFilter(period, 'o.paid_at');
    const rows = await pool.query(`
      SELECT o.id, o.user_id, u.username, u.first_name, o.package, o.amount_rub, o.credits, o.status, o.paid_at, o.created_at
      FROM orders o JOIN users u ON o.user_id = u.id
      WHERE o.status = 'paid' AND ${filter}
      ORDER BY o.paid_at DESC LIMIT 200
    `);
    res.json(rows.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Новые юзеры за период
adminRouter.get('/new-users', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const { filter } = buildDateFilter(period);
    const rows = await pool.query(`
      SELECT id, username, first_name, campaign_code, app_opened, created_at
      FROM users WHERE ${filter}
      ORDER BY created_at DESC LIMIT 200
    `);
    res.json(rows.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Активные юзеры за период (DAU detail)
adminRouter.get('/active-users', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const { filter } = buildDateFilter(period, 't.created_at');
    const rows = await pool.query(`
      SELECT t.user_id, u.username, u.first_name, COUNT(*) as requests
      FROM transactions t JOIN users u ON t.user_id = u.id
      WHERE ${filter}
      GROUP BY t.user_id, u.username, u.first_name
      ORDER BY requests DESC LIMIT 200
    `);
    res.json(rows.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── /year — статистика по месяцам ──────────────────────
adminRouter.get('/year', async (_req: Request, res: Response) => {
  try {
    const months = await pool.query(`
      SELECT
        to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
        COUNT(DISTINCT user_id) as users,
        COUNT(*) as transactions,
        COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0) as spent
      FROM transactions
      WHERE created_at >= date_trunc('year', CURRENT_DATE)
      GROUP BY date_trunc('month', created_at)
      ORDER BY month
    `);
    res.json(months.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /deposits — пополнения за день ─────────────────────
adminRouter.get('/deposits', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.user_id, u.username, u.first_name, o.package, o.amount_rub, o.credits, o.paid_at
      FROM orders o JOIN users u ON o.user_id = u.id
      WHERE o.status = 'paid' AND o.paid_at >= CURRENT_DATE
      ORDER BY o.paid_at DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /referrals — топ рефереров ─────────────────────────
adminRouter.get('/referrals', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT r.referrer_id, u.username, u.first_name,
        COUNT(*) as total_refs,
        SUM(r.reward_credits) as total_earned
      FROM referrals r JOIN users u ON r.referrer_id = u.id
      WHERE r.created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY r.referrer_id, u.username, u.first_name
      ORDER BY total_refs DESC LIMIT 10
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /referrals/full — полная реферальная система ──────────
adminRouter.get('/referrals/full', async (_req: Request, res: Response) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status='paid') as paid,
        COUNT(*) FILTER (WHERE status='pending') as pending,
        COUNT(*) FILTER (WHERE status='held') as held,
        COUNT(*) FILTER (WHERE status='rejected') as rejected,
        COALESCE(SUM(reward_credits) FILTER (WHERE status='paid'), 0) as total_rewards
      FROM referrals
    `);
    const rows = await pool.query(`
      SELECT r.id, r.referrer_id, r.referee_id, r.status, r.package,
        r.reward_credits, r.has_ai_request, r.paid_at, r.reward_paid_at,
        r.reject_reason, r.created_at,
        u1.username as referrer_username, u1.first_name as referrer_name,
        u2.username as referee_username, u2.first_name as referee_name,
        u2.credits as referee_credits, u2.app_opened as referee_app_opened
      FROM referrals r
      JOIN users u1 ON r.referrer_id = u1.id
      JOIN users u2 ON r.referee_id = u2.id
      ORDER BY r.created_at DESC
      LIMIT 200
    `);
    res.json({ stats: stats.rows[0], referrals: rows.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /errors — ошибки (из логов генераций с пустым result) ──
adminRouter.get('/errors', async (_req: Request, res: Response) => {
  try {
    // Считаем неудачные генерации (result_url пустой)
    const result = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM generations
      WHERE created_at >= CURRENT_DATE AND (result_url = '' OR result_url IS NULL)
      GROUP BY type
    `);
    // Также общее количество за день
    const total = await pool.query(`SELECT COUNT(*) as count FROM generations WHERE created_at >= CURRENT_DATE`);
    const failed = await pool.query(`SELECT COUNT(*) as count FROM generations WHERE created_at >= CURRENT_DATE AND (result_url = '' OR result_url IS NULL)`);

    res.json({
      total: +total.rows[0].count,
      failed: +failed.rows[0].count,
      byType: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /addcredits ───────────────────────────────────
adminRouter.post('/addcredits', async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || Number(amount) === 0) { res.status(400).json({ error: 'userId и amount обязательны' }); return; }
    const amt = Number(amount);
    const desc = amt > 0 ? `Админ: +${amt}` : `Админ: ${amt} (списание)`;
    const newBalance = await addCredits(Number(userId), amt, amt > 0 ? 'topup' : 'admin_deduct', desc);
    res.json({ success: true, userId, added: amount, newBalance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /refund — вернуть кредиты ────────────────────
adminRouter.post('/refund', async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount) { res.status(400).json({ error: 'userId и amount обязательны' }); return; }
    const newBalance = await addCredits(Number(userId), Number(amount), 'topup', `Возврат: +${amount}`);
    res.json({ success: true, userId, refunded: amount, newBalance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /ban ──────────────────────────────────────────
adminRouter.post('/ban', async (req: Request, res: Response) => {
  try {
    const { userId, ban = true } = req.body;
    if (!userId) { res.status(400).json({ error: 'userId обязателен' }); return; }
    await pool.query('UPDATE users SET is_banned = $1 WHERE id = $2', [ban, userId]);
    res.json({ success: true, userId, banned: ban });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /user/:id — удалить юзера и все связанные данные ──
adminRouter.delete('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) { res.status(400).json({ error: 'userId обязателен' }); return; }

    // Проверяем что юзер существует
    const check = await pool.query('SELECT id, first_name, username FROM users WHERE id = $1', [userId]);
    if (check.rowCount === 0) { res.status(404).json({ error: 'Юзер не найден' }); return; }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Удаляем в правильном порядке (FK constraints)
      await client.query('DELETE FROM push_sent WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM messages WHERE chat_id IN (SELECT id FROM chats WHERE user_id = $1)', [userId]);
      await client.query('DELETE FROM chats WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM generations WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM pending_tasks WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM orders WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM referrals WHERE referrer_id = $1 OR referee_id = $1', [userId]);
      await client.query('DELETE FROM user_ips WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM device_fingerprints WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM share_rewards WHERE user_id = $1', [userId]).catch(() => {}); // может не существовать
      // Убираем referred_by у тех, кого он пригласил
      await client.query('UPDATE users SET referred_by = NULL WHERE referred_by = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');

      const u = check.rows[0];
      console.log(`🗑 Удалён юзер: ${userId} (${u.first_name} @${u.username})`);
      res.json({ success: true, deleted: userId });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /users ─────────────────────────────────────────
adminRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, username, first_name, credits, is_banned, timezone_offset, language_code, created_at, app_opened, campaign_code, welcome_bonus_granted, fraud_score
      FROM users ORDER BY created_at DESC LIMIT 1000
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /user/:id ──────────────────────────────────────
adminRouter.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rowCount === 0) { res.status(404).json({ error: 'Юзер не найден' }); return; }
    const txCount = await pool.query('SELECT COUNT(*) as count FROM transactions WHERE user_id = $1', [userId]);
    const chatCount = await pool.query('SELECT COUNT(*) as count FROM chats WHERE user_id = $1', [userId]);
    const genCount = await pool.query('SELECT COUNT(*) as count FROM generations WHERE user_id = $1', [userId]);
    const spent = await pool.query('SELECT COALESCE(SUM(-amount), 0) as total FROM transactions WHERE user_id = $1 AND amount < 0', [userId]);
    const orders = await pool.query('SELECT package, amount_rub, credits, status, paid_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json({
      ...user.rows[0],
      transactions: +txCount.rows[0].count,
      chats: +chatCount.rows[0].count,
      generations: +genCount.rows[0].count,
      totalSpent: +spent.rows[0].total,
      orders: orders.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// PUSH TEMPLATES
// ═══════════════════════════════════════════════════════

adminRouter.get('/push/templates', async (req: Request, res: Response) => {
  try {
    let query = 'SELECT * FROM push_templates WHERE 1=1';
    const params: any[] = [];
    if (req.query.type) { params.push(req.query.type); query += ` AND schedule_type = $${params.length}`; }
    if (req.query.active === 'true') { query += ' AND is_active = true'; }
    query += ' ORDER BY created_at DESC';
    res.json((await pool.query(query, params)).rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/push/templates', async (req: Request, res: Response) => {
  try {
    const { name, text, mediaType, mediaFileId, scheduleType, sendTime, createdBy, mediaWidth, mediaHeight } = req.body;
    const r = await pool.query(
      `INSERT INTO push_templates (name, text, media_type, media_file_id, schedule_type, send_time, created_by, media_width, media_height)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, text, mediaType || null, mediaFileId || null, scheduleType || 'manual', sendTime || null, createdBy || null, mediaWidth || null, mediaHeight || null]
    );
    res.json(r.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.delete('/push/templates/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM push_templates WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.put('/push/templates/:id/toggle', async (req: Request, res: Response) => {
  try {
    const r = await pool.query('UPDATE push_templates SET is_active = NOT is_active WHERE id = $1 RETURNING is_active', [req.params.id]);
    res.json({ success: true, isActive: r.rows[0]?.is_active });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.get('/push/users-by-tz', async (req: Request, res: Response) => {
  try {
    const targetHour = Number(req.query.hour);
    if (isNaN(targetHour)) { res.status(400).json({ error: 'hour обязателен' }); return; }
    const r = await pool.query(`
      SELECT id FROM users WHERE is_banned = false
      AND MOD(CAST(EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') AS INTEGER) + CAST(COALESCE(timezone_offset,540) / 60 AS INTEGER) + 24, 24) = $1
    `, [targetHour]);
    res.json(r.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/push/send/:id', async (req: Request, res: Response) => {
  try {
    const tmpl = await pool.query('SELECT * FROM push_templates WHERE id = $1', [req.params.id]);
    if (tmpl.rowCount === 0) { res.status(404).json({ error: 'Шаблон не найден' }); return; }
    const t = tmpl.rows[0];
    // Фильтр получателей
    const filter = req.body?.recipients || 'all';
    const creditsFilter = req.body?.creditsFilter || 500;
    let userQuery = 'SELECT id FROM users WHERE is_banned = false';
    const params: any[] = [];
    if (filter === 'active') { userQuery += ' AND last_seen >= NOW() - INTERVAL \'7 days\''; }
    else if (filter === 'purchased') { userQuery += ' AND EXISTS (SELECT 1 FROM orders o WHERE o.user_id = users.id AND o.status = \'paid\')'; }
    else if (filter === 'not_purchased') { userQuery += ' AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = users.id AND o.status = \'paid\')'; }
    else if (filter === 'low_credits') { params.push(creditsFilter); userQuery += ' AND credits < $' + params.length; }
    const users = await pool.query(userQuery, params);

    // Отправка через бот (BOT_TOKEN)
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) { res.status(503).json({ error: 'BOT_TOKEN не настроен' }); return; }

    let sent = 0, failed = 0;
    const formatText = (s: string | null | undefined) => {
      if (!s) return '';
      // 1. Экранируем HTML спецсимволы
      let t = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // 2. <<жирный>> → <b>жирный</b>
      t = t.replace(/&lt;&lt;([^&]+?)&gt;&gt;/g, '<b>$1</b>');
      // 3. **жирный** → <b>жирный</b>
      t = t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      // 4. _курсив_ → <i>курсив</i>
      t = t.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<i>$1</i>');
      return t;
    };

    for (const u of users.rows) {
      try {
        const media = t.media_file_id;
        const caption = formatText(t.text);
        let resp;
        if (t.media_type === 'video' && media) {
          resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: u.id, video: media, caption, parse_mode: 'HTML', supports_streaming: true, width: t.media_width || undefined, height: t.media_height || undefined })
          });
        } else if (t.media_type === 'photo' && media) {
          resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: u.id, photo: media, caption, parse_mode: 'HTML' })
          });
        } else {
          resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: u.id, text: caption, parse_mode: 'HTML' })
          });
        }
        const result = await resp.json() as { ok: boolean; description?: string };
        if (result.ok) { sent++; } else { failed++; console.error('[push] send error:', u.id, result.description); }
        if (sent % 25 === 0) await new Promise(r => setTimeout(r, 1000)); // rate limit
      } catch { failed++; }
    }

    // Логируем
    await pool.query('INSERT INTO push_log (template_id, sent_count, failed_count, finished_at) VALUES ($1, $2, $3, NOW())', [t.id, sent, failed]);

    res.json({ sent, failed, total: users.rows.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/push/log', async (req: Request, res: Response) => {
  try {
    const { templateId, sentCount, failedCount } = req.body;
    await pool.query(`INSERT INTO push_log (template_id, sent_count, failed_count, finished_at) VALUES ($1, $2, $3, NOW())`, [templateId, sentCount, failedCount]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.get('/push/log', async (_req: Request, res: Response) => {
  try {
    // Объединяем: разовые пуши (push_log) + автопуши (push_sent с группировкой)
    const r = await pool.query(`
      (SELECT 'manual' as source, t.name as label, l.sent_count, l.failed_count, l.started_at as sent_at
       FROM push_log l LEFT JOIN push_templates t ON l.template_id = t.id)
      UNION ALL
      (SELECT 'auto' as source, s.label, COUNT(ps.id)::int as sent_count, 0 as failed_count,
              MAX(ps.sent_at) as sent_at
       FROM push_sent ps JOIN push_sequences s ON ps.sequence_id = s.id
       GROUP BY s.id, s.label)
      ORDER BY sent_at DESC LIMIT 50
    `);
    res.json(r.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Статистика пушей
adminRouter.get('/push/stats', async (_req: Request, res: Response) => {
  try {
    const totalSent = await pool.query(`SELECT COALESCE(SUM(sent_count),0)::int as v FROM push_log`);
    const autoToday = await pool.query(`SELECT COUNT(*)::int as v FROM push_sent WHERE sent_at >= CURRENT_DATE`);
    const activeChains = await pool.query(`SELECT COUNT(*)::int as v FROM push_sequences WHERE is_active = true AND is_deleted = false`);
    const totalTemplates = await pool.query(`SELECT COUNT(*)::int as v FROM push_templates`);
    res.json({
      totalSent: totalSent.rows[0].v,
      autoToday: autoToday.rows[0].v,
      activeChains: activeChains.rows[0].v,
      totalTemplates: totalTemplates.rows[0].v,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════
// PUSH SEQUENCES — Автоматические последовательности
// ═══════════════════════════════════════════════════

adminRouter.get('/push/sequences', async (_req: Request, res: Response) => {
  try {
    const sequences = await getAllSequences();
    res.json(sequences);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/push/sequences', async (req: Request, res: Response) => {
  try {
    console.log('[push/sequences] SAVE:', JSON.stringify({ id: req.body.id, media_type: req.body.media_type, media_width: req.body.media_width, media_height: req.body.media_height, media_file_id: !!req.body.media_file_id }));
    const seq = await upsertSequence(req.body);
    console.log('[push/sequences] RESULT:', JSON.stringify({ id: seq.id, media_type: seq.media_type, media_width: seq.media_width, media_height: seq.media_height }));
    res.json(seq);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.put('/push/sequences/:id/toggle', async (req: Request, res: Response) => {
  try {
    const active = await toggleSequence(parseInt(req.params.id));
    res.json({ is_active: active });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.delete('/push/sequences/:id', async (req: Request, res: Response) => {
  try {
    await deleteSequence(parseInt(req.params.id));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Корзина удалённых пушей
adminRouter.get('/push/sequences/deleted', async (_req: Request, res: Response) => {
  try {
    const deleted = await getDeletedSequences();
    res.json(deleted);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/push/sequences/:id/restore', async (req: Request, res: Response) => {
  try {
    await restoreSequence(parseInt(req.params.id));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.delete('/push/sequences/:id/permanent', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM push_sent WHERE sequence_id = $1', [req.params.id]);
    await client.query('DELETE FROM push_sequences WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Получить ВСЕ активные welcome пуши для /start
adminRouter.get('/push/sequences/welcome', async (_req: Request, res: Response) => {
  try {
    const sequences = await getActiveSequences('welcome');
    res.json(sequences);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Статистика отправок по каждому sequence_id
adminRouter.get('/push/sequences/sent-stats', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT sequence_id, COUNT(*)::int as sent_count,
             MAX(sent_at) as last_sent_at
      FROM push_sent GROUP BY sequence_id
    `);
    const stats: Record<number, { sent: number; lastSent: string }> = {};
    for (const r of rows) {
      stats[r.sequence_id] = { sent: r.sent_count, lastSent: r.last_sent_at };
    }
    res.json(stats);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Получить pending пуши для отправки ботом
adminRouter.get('/push/sequences/pending', async (_req: Request, res: Response) => {
  try {
    const pending = await findPendingPushes();
    console.log(`[/pending] Returning ${pending.length} pending pushes`);
    res.json(pending);
  } catch (err: any) {
    console.error(`[/pending] ERROR:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Заполнить пуш-последовательности из seed (force=true перезаписывает)
adminRouter.post('/push/seed-sequences', async (req: Request, res: Response) => {
  try {
    const force = req.body?.force === true;
    const count = await seedPushSequences(force);
    res.json({ ok: true, count });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Пометить пуш как отправленный
adminRouter.post('/push/sequences/mark-sent', async (req: Request, res: Response) => {
  try {
    const { user_id, sequence_id } = req.body;
    if (!user_id || !sequence_id) { res.status(400).json({ error: 'Missing user_id or sequence_id' }); return; }
    await markPushSent(Number(user_id), Number(sequence_id));
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Загрузка фото → Telegram Bot API → file_id
adminRouter.post('/upload-photo', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'Нет файла' }); return; }
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (!isImage && !isVideo) { res.status(400).json({ error: 'Только фото или видео' }); return; }
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    if (!BOT_TOKEN || !ADMIN_CHAT_ID) { res.status(503).json({ error: 'BOT_TOKEN/ADMIN_CHAT_ID не настроены' }); return; }

    const form = new FormData();
    form.append('chat_id', ADMIN_CHAT_ID);

    let fileId: string;
    let mediaType: string;
    let mediaWidth: number | null = null;
    let mediaHeight: number | null = null;

    // Клиент может передать реальные размеры видео (HTML5 Video API)
    const clientWidth = parseInt(req.body?.width) || null;
    const clientHeight = parseInt(req.body?.height) || null;

    if (isVideo) {
      // Видео: отправляем с supports_streaming + width/height для правильного aspect ratio
      form.append('video', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
      form.append('supports_streaming', 'true');
      // Передаём размеры в Telegram чтобы thumbnail был правильного aspect ratio
      if (clientWidth && clientHeight) {
        form.append('width', String(clientWidth));
        form.append('height', String(clientHeight));
      }
      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
        method: 'POST', body: form,
      });
      const data = await tgRes.json() as any;
      if (!data.ok) { res.status(500).json({ error: data.description || 'Telegram upload failed' }); return; }
      fileId = data.result.video.file_id;
      mediaType = 'video';
      // Приоритет: клиентские размеры > Telegram response > null
      mediaWidth = clientWidth || data.result.video.width || null;
      mediaHeight = clientHeight || data.result.video.height || null;
    } else {
      // Фото загружаем как обычно
      form.append('photo', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST', body: form,
      });
      const data = await tgRes.json() as any;
      if (!data.ok) { res.status(500).json({ error: data.description || 'Telegram upload failed' }); return; }
      fileId = data.result.photo[data.result.photo.length - 1].file_id;
      mediaType = 'photo';
    }

    // Получаем прямой URL файла через getFile
    let fileUrl = '';
    try {
      const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json() as any;
      if (fileData.ok && fileData.result.file_path) {
        fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
      }
    } catch { /* fallback — без URL */ }

    console.log('[upload-photo] DONE:', JSON.stringify({ media_type: mediaType, width: mediaWidth, height: mediaHeight, file_id: fileId?.substring(0, 20) }));
    res.json({ file_id: fileId, media_type: mediaType, file_url: fileUrl, width: mediaWidth, height: mediaHeight });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Получить URL файла по file_id (для превью в админке)
adminRouter.get('/file-url/:fileId', async (req: Request, res: Response) => {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) { res.status(503).json({ error: 'BOT_TOKEN не настроен' }); return; }
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${req.params.fileId}`);
    const fileData = await fileRes.json() as any;
    if (fileData.ok && fileData.result.file_path) {
      res.json({ url: `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}` });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ─── Список всех motion-control задач из Kling ───
adminRouter.get('/kling-tasks', async (req: Request, res: Response) => {
  try {
    const result = await klingRequest('GET', '/v1/videos/motion-control?pageNum=1&pageSize=30');
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Диагностика motion-control: 3 варианта параметров ───
adminRouter.post('/test-motion', async (req: Request, res: Response) => {
  try {
    const imageUrl = req.body.image_url || 'https://sakhaai-production.up.railway.app/tmp-upload/eb9a63ec-663b-40d1-bc13-529b1acc7e15.jpeg';
    const videoUrl = req.body.video_url || 'https://cdn.higgsfield.ai/kling_motion_control_preset/d9d7ea02-fdcc-475a-a53e-d3353a8b866e.mp4';

    const variants: { name: string; body: Record<string, any> }[] = [
      {
        name: 'A_minimal',
        body: { image_url: imageUrl, video_url: videoUrl, character_orientation: 'video', mode: 'std' },
      },
      {
        name: 'B_duration',
        body: { image_url: imageUrl, video_url: videoUrl, character_orientation: 'video', mode: 'std', duration: '5' },
      },
      {
        name: 'C_cfg_scale',
        body: { image_url: imageUrl, video_url: videoUrl, character_orientation: 'video', mode: 'std', cfg_scale: 0.5 },
      },
    ];

    const results: { name: string; taskId?: string; error?: string }[] = [];

    for (const v of variants) {
      try {
        console.log(`[test-motion] === ${v.name} ===`);
        const r = await klingRequest('POST', '/v1/videos/motion-control', v.body);
        const taskId = r.data?.task_id;
        console.log(`[test-motion] ${v.name} → task_id: ${taskId}`);
        results.push({ name: v.name, taskId });
      } catch (e: any) {
        console.error(`[test-motion] ${v.name} → ERROR: ${e.message}`);
        results.push({ name: v.name, error: e.message });
      }
    }

    // Проверить статус через 2 и 5 минут
    for (const delay of [2, 5]) {
      setTimeout(async () => {
        console.log(`[test-motion] === STATUS CHECK (${delay} min) ===`);
        for (const r of results) {
          if (!r.taskId) continue;
          try {
            const status = await klingRequest('GET', `/v1/videos/motion-control/${r.taskId}`);
            const s = status.data?.task_status;
            console.log(`[test-motion] ${r.name} → ${s}${s === 'succeed' ? ' VIDEO: ' + (status.data?.task_result?.videos?.[0]?.url?.substring(0, 100) || 'no url') : ''}`);
          } catch (e: any) {
            console.error(`[test-motion] ${r.name} check error: ${e.message}`);
          }
        }
      }, delay * 60 * 1000);
    }

    res.json({ ok: true, results, note: 'Статус через 2 и 5 мин в логах' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── API Usage ──────────────────────────────────────────
adminRouter.get('/api-usage', async (_req: Request, res: Response) => {
  try {
    const rate = getRateInfo();

    // Расход по типам (всё время)
    const { rows: byType } = await pool.query(
      `SELECT type, COALESCE(SUM(cost),0)::int as credits, COUNT(*)::int as cnt
       FROM generations GROUP BY type`
    );
    const typeMap: Record<string, { credits: number; cnt: number }> = {};
    for (const r of byType) typeMap[r.type] = { credits: +r.credits, cnt: +r.cnt };

    // Пакеты
    const { rows: pkgs } = await pool.query(`SELECT * FROM api_packages ORDER BY service`);
    const pkgMap: Record<string, any> = {};
    for (const p of pkgs) pkgMap[p.service] = p;

    // Обратная формула: кредиты → юниты Kling
    const klingCredits = (typeMap.video?.credits || 0) + (typeMap.motion?.credits || 0) + (typeMap['motion-control']?.credits || 0);
    const klingUnits = klingCredits / (2.3 * 1007.75 * rate.multiplier);
    const klingCostUsd = klingUnits * 0.084;

    // Gemini: чат + фото (всё время)
    const geminiChatCredits = typeMap.chat?.credits || 0;
    const geminiImageCredits = typeMap.image?.credits || 0;
    const geminiCredits = geminiChatCredits + geminiImageCredits;
    const geminiCostUsd = (typeMap.chat?.cnt || 0) * 0.002 + (typeMap.image?.cnt || 0) * 0.1;

    // Gemini: расход за текущий и прошлый месяц
    const { rows: geminiMonthly } = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN 1 ELSE 0 END), 0)::int as chat_this,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) AND type = 'image' THEN 1 ELSE 0 END), 0)::int as img_this,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW()) THEN 1 ELSE 0 END), 0)::int as chat_last,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW()) AND type = 'image' THEN 1 ELSE 0 END), 0)::int as img_last
       FROM generations WHERE type IN ('chat', 'image')`
    );
    const gm = geminiMonthly[0] || { chat_this: 0, img_this: 0, chat_last: 0, img_last: 0 };
    const geminiThisMonth = (+gm.chat_this - +gm.img_this) * 0.002 + +gm.img_this * 0.1;
    const geminiLastMonth = (+gm.chat_last - +gm.img_last) * 0.002 + +gm.img_last * 0.1;

    // fal.ai: аватары
    const falCredits = typeMap.avatar?.credits || 0;
    const falCostUsd = (typeMap.avatar?.cnt || 0) * 0.6; // ~$0.6/аватар в среднем

    // Расход по дням (14 дней)
    const { rows: daily } = await pool.query(
      `SELECT DATE(created_at) as date, type, COALESCE(SUM(cost),0)::int as credits, COUNT(*)::int as cnt
       FROM generations WHERE created_at > NOW() - INTERVAL '14 days'
       GROUP BY 1, 2 ORDER BY 1 DESC`
    );

    res.json({
      kling: {
        credits: klingCredits,
        units: Math.round(klingUnits * 100) / 100,
        costUsd: Math.round(klingCostUsd * 100) / 100,
        costRub: Math.round(klingCostUsd * rate.rate * 100) / 100,
        cnt: (typeMap.video?.cnt || 0) + (typeMap.motion?.cnt || 0) + (typeMap['motion-control']?.cnt || 0),
        package: pkgMap.kling || null,
      },
      gemini: {
        credits: geminiCredits,
        costUsd: Math.round(geminiCostUsd * 100) / 100,
        costThisMonth: Math.round(geminiThisMonth * 100) / 100,
        costLastMonth: Math.round(geminiLastMonth * 100) / 100,
        cnt: (typeMap.chat?.cnt || 0) + (typeMap.image?.cnt || 0),
        chatCnt: typeMap.chat?.cnt || 0,
        imageCnt: typeMap.image?.cnt || 0,
        chatThisMonth: +gm.chat_this - +gm.img_this,
        imgThisMonth: +gm.img_this,
        package: pkgMap.gemini || null,
      },
      fal: {
        credits: falCredits,
        costUsd: Math.round(falCostUsd * 100) / 100,
        cnt: typeMap.avatar?.cnt || 0,
        package: pkgMap.fal || null,
      },
      rate,
      daily,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.post('/api-packages/:service', async (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    const { packageSize, packageExpiry, notes } = req.body;
    await pool.query(
      `UPDATE api_packages SET package_size = COALESCE($1, package_size),
       package_expiry = COALESCE($2, package_expiry),
       notes = COALESCE($3, notes), updated_at = NOW()
       WHERE service = $4`,
      [packageSize, packageExpiry, notes, service]
    );
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Курс валют ─────────────────────────────────────────
adminRouter.get('/exchange-rate', (_req: Request, res: Response) => {
  try {
    const info = getRateInfo();
    res.json(info);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Очистка юзеров (оставить только указанные ID) ───
adminRouter.post('/cleanup-users', async (req: Request, res: Response) => {
  try {
    const { keep_ids } = req.body;
    if (!Array.isArray(keep_ids) || !keep_ids.length) { res.status(400).json({ error: 'keep_ids required' }); return; }
    const ids = keep_ids.map(Number);
    const ph = ids.map((_: number, i: number) => `$${i + 1}`).join(',');
    // Удаляем в правильном порядке FK
    const tables = [
      `DELETE FROM push_sent WHERE user_id NOT IN (${ph})`,
      `DELETE FROM messages WHERE chat_id IN (SELECT id FROM chats WHERE user_id NOT IN (${ph}))`,
      `DELETE FROM chats WHERE user_id NOT IN (${ph})`,
      `DELETE FROM transactions WHERE user_id NOT IN (${ph})`,
      `DELETE FROM generations WHERE user_id NOT IN (${ph})`,
      `DELETE FROM orders WHERE user_id NOT IN (${ph})`,
      `DELETE FROM referrals WHERE referrer_id NOT IN (${ph}) OR referee_id NOT IN (${ph})`,
      `DELETE FROM user_ips WHERE user_id NOT IN (${ph})`,
      `DELETE FROM device_fingerprints WHERE user_id NOT IN (${ph})`,
      `DELETE FROM pending_tasks WHERE user_id NOT IN (${ph})`,
      `DELETE FROM users WHERE id NOT IN (${ph})`,
    ];
    const counts: Record<string, number> = {};
    for (const sql of tables) {
      try {
        const r = await pool.query(sql, ids);
        const tbl = sql.match(/FROM (\w+)/)?.[1] || '?';
        counts[tbl] = r.rowCount ?? 0;
      } catch (e: any) {
        const tbl = sql.match(/FROM (\w+)/)?.[1] || '?';
        counts[tbl] = -1;
        console.error(`cleanup ${tbl}:`, e.message);
      }
    }
    res.json({ ok: true, kept: ids, deleted: counts });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════
// РЕКЛАМНЫЕ КАМПАНИИ (реферальные ссылки для блогеров)
// ═══════════════════════════════════════════════════════

// Транслитерация кириллицы → латиница (Telegram start_param поддерживает только A-Za-z0-9_-)
function translit(str: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y',
    'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
    'х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  };
  return str.split('').map(c => map[c] || map[c.toLowerCase()]?.toUpperCase?.() || c).join('');
}

// Создать кампанию
adminRouter.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ error: 'name required' }); return; }
    const code = translit(name.toLowerCase()).replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 30) + '_' + Date.now().toString(36);
    const { rows } = await pool.query(
      `INSERT INTO ref_campaigns (code, name) VALUES ($1, $2) RETURNING *`,
      [code, name]
    );
    res.json(rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Список кампаний со сводной статистикой
adminRouter.get('/campaigns', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM users u WHERE u.campaign_code = c.code) AS total_users,
        (SELECT COUNT(*) FROM users u WHERE u.campaign_code = c.code AND u.app_opened = true) AS opened_app,
        (SELECT COUNT(DISTINCT o.user_id) FROM orders o JOIN users u ON u.id = o.user_id WHERE u.campaign_code = c.code AND o.status = 'paid') AS paid_users,
        (SELECT COALESCE(SUM(o.amount_rub), 0) FROM orders o JOIN users u ON u.id = o.user_id WHERE u.campaign_code = c.code AND o.status = 'paid') AS total_revenue
      FROM ref_campaigns c
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Детальная статистика по кампании — список юзеров
adminRouter.get('/campaigns/:code/users', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { rows } = await pool.query(`
      SELECT
        u.id, u.username, u.first_name, u.credits, u.app_opened,
        u.welcome_bonus_granted, u.created_at, u.last_seen,
        (SELECT COUNT(*) FROM chats ch WHERE ch.user_id = u.id) AS chat_count,
        (SELECT COUNT(*) FROM users r WHERE r.referred_by = u.id) AS invited_count,
        (SELECT json_agg(json_build_object('package', o.package, 'amount_rub', o.amount_rub, 'credits', o.credits, 'paid_at', o.paid_at))
         FROM orders o WHERE o.user_id = u.id AND o.status = 'paid') AS purchases
      FROM users u
      WHERE u.campaign_code = $1
      ORDER BY u.created_at DESC
    `, [code]);
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Диагностика: юзеры без campaign_code, зарегистрированные после создания кампаний
adminRouter.get('/campaigns/orphans', async (_req: Request, res: Response) => {
  try {
    // Находим юзеров без campaign_code которые зарегались после создания кампаний
    const { rows } = await pool.query(`
      SELECT u.id, u.username, u.first_name, u.credits, u.welcome_bonus_granted,
             u.created_at, u.campaign_code, u.fraud_score
      FROM users u
      WHERE u.campaign_code IS NULL
        AND u.created_at >= (SELECT MIN(created_at) FROM ref_campaigns)
      ORDER BY u.created_at DESC
    `);
    // Также список кампаний с датами
    const camps = await pool.query(`SELECT code, name, created_at FROM ref_campaigns ORDER BY created_at`);
    res.json({ orphanUsers: rows, campaigns: camps.rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Привязать юзера к кампании вручную
adminRouter.post('/campaigns/assign', async (req: Request, res: Response) => {
  try {
    const { userId, campaignCode } = req.body;
    if (!userId || !campaignCode) { res.status(400).json({ error: 'userId and campaignCode required' }); return; }
    await pool.query('UPDATE users SET campaign_code = $1 WHERE id = $2 AND campaign_code IS NULL', [campaignCode, userId]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Массовая привязка юзеров к кампании по диапазону дат
adminRouter.post('/campaigns/assign-bulk', async (req: Request, res: Response) => {
  try {
    const { campaignCode, fromDate, toDate } = req.body;
    if (!campaignCode || !fromDate || !toDate) { res.status(400).json({ error: 'campaignCode, fromDate, toDate required' }); return; }
    const result = await pool.query(
      `UPDATE users SET campaign_code = $1
       WHERE campaign_code IS NULL AND created_at >= $2 AND created_at <= $3`,
      [campaignCode, fromDate, toDate]
    );
    res.json({ ok: true, updated: result.rowCount });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Удалить кампанию
adminRouter.delete('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    await pool.query(`DELETE FROM ref_campaigns WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════
// AD CAMPAIGNS — рекламная статистика
// ═══════════════════════════════════════════════════════

adminRouter.get('/ad-stats', async (_req: Request, res: Response) => {
  try {
    // Автосинк: подтянуть ref_campaigns которых нет в ad_campaigns
    const missing = await pool.query(`
      SELECT c.id, c.name,
        (SELECT COUNT(*) FROM users u WHERE u.campaign_code = c.code) AS total_users,
        (SELECT COUNT(*) FROM users u WHERE u.campaign_code = c.code AND u.app_opened = true) AS opened_app,
        (SELECT COUNT(DISTINCT o.user_id) FROM orders o JOIN users u ON u.id = o.user_id WHERE u.campaign_code = c.code AND o.status = 'paid') AS paid_users,
        (SELECT COALESCE(SUM(o.amount_rub), 0) FROM orders o JOIN users u ON u.id = o.user_id WHERE u.campaign_code = c.code AND o.status = 'paid') AS total_revenue
      FROM ref_campaigns c
      WHERE NOT EXISTS (SELECT 1 FROM ad_campaigns a WHERE a.ref_campaign_id = c.id)
    `);
    for (const r of missing.rows) {
      await pool.query(
        `INSERT INTO ad_campaigns (ref_campaign_id, blogger_name, platform, ad_type, app_launches, registrations, payments_count, payments_sum, campaign_date)
         VALUES ($1, $2, 'instagram', 'stories', $3, $4, $5, $6, CURRENT_DATE)`,
        [r.id, r.name, +r.opened_app, +r.total_users, +r.paid_users, +r.total_revenue]
      );
    }
    // Обновить автоматические поля для связанных кампаний
    await pool.query(`
      UPDATE ad_campaigns a SET
        app_launches = sub.opened_app,
        registrations = sub.total_users,
        payments_count = sub.paid_users,
        payments_sum = sub.total_revenue
      FROM (
        SELECT c.id,
          (SELECT COUNT(*) FROM users u WHERE u.campaign_code = c.code) AS total_users,
          (SELECT COUNT(*) FROM users u WHERE u.campaign_code = c.code AND u.app_opened = true) AS opened_app,
          (SELECT COUNT(DISTINCT o.user_id) FROM orders o JOIN users u ON u.id = o.user_id WHERE u.campaign_code = c.code AND o.status = 'paid') AS paid_users,
          (SELECT COALESCE(SUM(o.amount_rub), 0) FROM orders o JOIN users u ON u.id = o.user_id WHERE u.campaign_code = c.code AND o.status = 'paid') AS total_revenue
        FROM ref_campaigns c
      ) sub WHERE a.ref_campaign_id = sub.id
    `);
    const all = await pool.query(`SELECT * FROM ad_campaigns ORDER BY created_at DESC`);
    const rev = await pool.query(`SELECT COALESCE(SUM(amount_rub), 0) as total FROM orders WHERE status = 'paid'`);
    res.json({ campaigns: all.rows, revenueAllTime: +rev.rows[0].total });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/ad-stats', async (req: Request, res: Response) => {
  try {
    const { id, blogger_name, platform, ad_type, creative_url, ad_cost, campaign_date } = req.body;
    if (id) {
      // Partial update — только ручные поля (whitelist)
      const allowedFields = ['blogger_name','platform','ad_type','creative_url','ad_cost','views','likes','saves','comments','clicks','notes','campaign_date'];
      const numericFields = ['ad_cost','views','likes','saves','comments','clicks'];
      const sets: string[] = [];
      const vals: any[] = [];
      let idx = 1;
      for (const f of allowedFields) {
        if (req.body[f] !== undefined) {
          sets.push(`${f} = $${idx}`);
          vals.push(numericFields.includes(f) ? (+req.body[f] || 0) : (req.body[f] || null));
          idx++;
        }
      }
      if (sets.length === 0) { res.json({ ok: true }); return; }
      vals.push(id);
      await pool.query(`UPDATE ad_campaigns SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
      res.json({ ok: true });
    } else {
      const r = await pool.query(
        `INSERT INTO ad_campaigns (blogger_name, platform, ad_type, creative_url, ad_cost, campaign_date)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [blogger_name, platform||'instagram', ad_type||'stories', creative_url||null, +ad_cost||0, campaign_date||null]
      );
      res.json(r.rows[0]);
    }
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.delete('/ad-stats/:id', async (req: Request, res: Response) => {
  try {
    await pool.query(`DELETE FROM ad_campaigns WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Анализ за временной диапазон (для рилсов): юзеры + оплаты
adminRouter.get('/registrations-range', async (req: Request, res: Response) => {
  try {
    const from = req.query.from as string;
    const to = req.query.to as string;
    if (!from || !to) { res.status(400).json({ error: 'from and to required' }); return; }
    // Юзеры за период с оплатами
    const rows = await pool.query(
      `SELECT u.id, u.username, u.first_name, u.campaign_code, u.app_opened, u.created_at,
        (SELECT COALESCE(SUM(o.amount_rub), 0) FROM orders o WHERE o.user_id = u.id AND o.status = 'paid') as paid_sum,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.status = 'paid') as paid_count
       FROM users u WHERE u.created_at >= $1::timestamptz AND u.created_at <= $2::timestamptz
       ORDER BY u.created_at DESC LIMIT 500`,
      [from, to]
    );
    const users = rows.rows;
    const totalUsers = users.length;
    const appOpened = users.filter((u: any) => u.app_opened).length;
    const paidUsers = users.filter((u: any) => +u.paid_count > 0).length;
    const paidSum = users.reduce((s: number, u: any) => s + (+u.paid_sum || 0), 0);
    res.json({ users, stats: { totalUsers, appOpened, paidUsers, paidSum } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Индивидуальные чеки по рекламной кампании
adminRouter.get('/ad-stats/:id/payments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campResult = await pool.query(`
      SELECT rc.code
      FROM ad_campaigns ac
      JOIN ref_campaigns rc ON rc.id = ac.ref_campaign_id
      WHERE ac.id = $1
    `, [id]);
    if (!campResult.rows.length) { res.json([]); return; }
    const code = campResult.rows[0].code;
    const payments = await pool.query(`
      SELECT u.username, u.first_name, o.package, o.amount_rub, o.paid_at
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE u.campaign_code = $1 AND o.status = 'paid'
      ORDER BY o.paid_at DESC
    `, [code]);
    res.json(payments.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/exchange-rate/update', async (_req: Request, res: Response) => {
  try {
    const result = await updateExchangeRate();
    const info = getRateInfo();
    res.json({ ...info, ...result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ═══ Маркетинговый план ═══

// Все задачи
adminRouter.get('/plans', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM marketing_plans ORDER BY category, sort_order`);
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Создать задачу
adminRouter.post('/plans', async (req: Request, res: Response) => {
  try {
    const { category, title } = req.body;
    if (!category || !title) return res.status(400).json({ error: 'category и title обязательны' });
    const maxOrder = await pool.query(`SELECT COALESCE(MAX(sort_order),0)+1 as next FROM marketing_plans WHERE category=$1`, [category]);
    const { rows } = await pool.query(
      `INSERT INTO marketing_plans (category, title, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [category, title, maxOrder.rows[0].next]
    );
    res.json(rows[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Обновить задачу (is_done, comment, title)
adminRouter.put('/plans/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_done, comment, title } = req.body;
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    if (is_done !== undefined) { sets.push(`is_done=$${idx++}`); vals.push(is_done); }
    if (comment !== undefined) { sets.push(`comment=$${idx++}`); vals.push(comment); }
    if (title !== undefined) { sets.push(`title=$${idx++}`); vals.push(title); }
    if (!sets.length) return res.status(400).json({ error: 'нечего обновлять' });
    vals.push(parseInt(id));
    const { rows } = await pool.query(`UPDATE marketing_plans SET ${sets.join(',')} WHERE id=$${idx} RETURNING *`, vals);
    res.json(rows[0] || { error: 'не найдено' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Удалить задачу
adminRouter.delete('/plans/:id', async (req: Request, res: Response) => {
  try {
    await pool.query(`DELETE FROM marketing_plans WHERE id=$1`, [parseInt(req.params.id)]);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Цели
adminRouter.get('/goals', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM marketing_goals ORDER BY created_at DESC LIMIT 1`);
    res.json(rows[0] || null);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

adminRouter.post('/goals', async (req: Request, res: Response) => {
  try {
    const { name, target_rub, deadline } = req.body;
    // Upsert — обновляем если есть, создаём если нет
    const existing = await pool.query(`SELECT id FROM marketing_goals LIMIT 1`);
    if (existing.rows.length > 0) {
      const { rows } = await pool.query(
        `UPDATE marketing_goals SET name=$1, target_rub=$2, deadline=$3 WHERE id=$4 RETURNING *`,
        [name, target_rub, deadline, existing.rows[0].id]
      );
      res.json(rows[0]);
    } else {
      const { rows } = await pool.query(
        `INSERT INTO marketing_goals (name, target_rub, deadline) VALUES ($1, $2, $3) RETURNING *`,
        [name, target_rub, deadline]
      );
      res.json(rows[0]);
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Прогресс к цели — реальная выручка из orders
adminRouter.get('/goals/progress', async (_req: Request, res: Response) => {
  try {
    const goal = await pool.query(`SELECT * FROM marketing_goals ORDER BY created_at DESC LIMIT 1`);
    // Сегодняшняя выручка (по якутскому времени UTC+9)
    const todayRevenue = await pool.query(`SELECT COALESCE(SUM(amount_rub),0)::int as total FROM orders WHERE status='paid' AND DATE(paid_at AT TIME ZONE 'Asia/Yakutsk') = (NOW() AT TIME ZONE 'Asia/Yakutsk')::date`);
    const todayByPackage = await pool.query(`
      SELECT package, COUNT(*)::int as cnt, COALESCE(SUM(amount_rub),0)::int as sum
      FROM orders WHERE status='paid' AND DATE(paid_at AT TIME ZONE 'Asia/Yakutsk') = (NOW() AT TIME ZONE 'Asia/Yakutsk')::date GROUP BY package
    `);
    // Всего за всё время (для общего прогресса)
    const allRevenue = await pool.query(`SELECT COALESCE(SUM(amount_rub),0)::int as total FROM orders WHERE status='paid'`);
    const allByPackage = await pool.query(`
      SELECT package, COUNT(*)::int as cnt, COALESCE(SUM(amount_rub),0)::int as sum
      FROM orders WHERE status='paid' GROUP BY package
    `);
    res.json({
      goal: goal.rows[0] || null,
      today_revenue: todayRevenue.rows[0].total,
      today_by_package: todayByPackage.rows,
      total_revenue: allRevenue.rows[0].total,
      by_package: allByPackage.rows
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
