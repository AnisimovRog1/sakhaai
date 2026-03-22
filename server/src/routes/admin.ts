import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { addCredits, deduct } from '../services/balance';

export const adminRouter = Router();

function requireBotAuth(req: Request, res: Response, next: () => void) {
  const auth = req.headers.authorization;
  const adminPass = process.env.ADMIN_PASSWORD || 'sakhaai2026';
  // Принимаем и BOT_TOKEN (от бота) и ADMIN_PASSWORD (от веб-панели)
  if (!auth || (auth !== `Bearer ${process.env.BOT_TOKEN}` && auth !== `Bearer ${adminPass}`)) {
    res.status(403).json({ error: 'Доступ запрещён' });
    return;
  }
  next();
}

adminRouter.use(requireBotAuth);

// ─── /stats?period=today|7d|month|2026-03 ───────────────
adminRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    let dateFilter = "created_at >= CURRENT_DATE"; // today
    let label = 'сегодня';

    if (period === '7d') {
      dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
      label = 'за 7 дней';
    } else if (period === 'month') {
      dateFilter = "created_at >= date_trunc('month', CURRENT_DATE)";
      label = 'за текущий месяц';
    } else if (/^\d{4}-\d{2}$/.test(period)) {
      dateFilter = `created_at >= '${period}-01' AND created_at < ('${period}-01'::date + INTERVAL '1 month')`;
      label = `за ${period}`;
    }

    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    const banned = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_banned = true');
    const newUsers = await pool.query(`SELECT COUNT(*) as count FROM users WHERE ${dateFilter}`);
    const chats = await pool.query('SELECT COUNT(*) as count FROM chats');
    const messages = await pool.query(`SELECT COUNT(*) as count FROM messages WHERE ${dateFilter}`);
    const generations = await pool.query(`SELECT COUNT(*) as count FROM generations WHERE ${dateFilter}`);
    const totalCredits = await pool.query('SELECT COALESCE(SUM(credits), 0) as total FROM users');

    // DAU — уникальные юзеры с транзакциями сегодня
    const dau = await pool.query(`SELECT COUNT(DISTINCT user_id) as count FROM transactions WHERE created_at >= CURRENT_DATE`);

    // Транзакции за период
    const txCount = await pool.query(`SELECT COUNT(*) as count FROM transactions WHERE ${dateFilter}`);

    // Выручка (пополнения)
    const revenue = await pool.query(`SELECT COALESCE(SUM(amount_rub), 0) as total FROM orders WHERE status = 'paid' AND ${dateFilter.replace(/created_at/g, 'paid_at')}`);

    // Себестоимость (расход API) — считаем по генерациям
    const genCosts = await pool.query(`SELECT COALESCE(SUM(cost), 0) as total FROM generations WHERE ${dateFilter}`);

    // Рефералы за период
    const refs = await pool.query(`SELECT COUNT(*) as count FROM referrals WHERE ${dateFilter}`);

    // Топ-5 юзеров
    const topUsers = await pool.query(`SELECT id, username, first_name, credits FROM users ORDER BY credits DESC LIMIT 5`);

    // Топ-10 активных за день
    const topActive = await pool.query(`
      SELECT t.user_id, u.username, u.first_name, COUNT(*) as requests
      FROM transactions t JOIN users u ON t.user_id = u.id
      WHERE t.created_at >= CURRENT_DATE
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
    if (!userId || !amount) { res.status(400).json({ error: 'userId и amount обязательны' }); return; }
    const newBalance = await addCredits(Number(userId), Number(amount), 'topup', `Админ: +${amount}`);
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

// ─── GET /users ─────────────────────────────────────────
adminRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, username, first_name, credits, is_banned, timezone_offset, language_code, created_at
      FROM users ORDER BY created_at DESC LIMIT 100
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
    res.json({
      ...user.rows[0],
      transactions: +txCount.rows[0].count,
      chats: +chatCount.rows[0].count,
      generations: +genCount.rows[0].count,
      totalSpent: +spent.rows[0].total,
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
    const { name, text, mediaType, mediaFileId, scheduleType, sendTime, createdBy } = req.body;
    const r = await pool.query(
      `INSERT INTO push_templates (name, text, media_type, media_file_id, schedule_type, send_time, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, text, mediaType || null, mediaFileId || null, scheduleType || 'manual', sendTime || null, createdBy || null]
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
    const users = await pool.query('SELECT id FROM users WHERE is_banned = false');
    res.json({ template: tmpl.rows[0], users: users.rows });
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
    const r = await pool.query(`
      SELECT l.*, t.name as template_name, t.schedule_type
      FROM push_log l LEFT JOIN push_templates t ON l.template_id = t.id
      ORDER BY l.started_at DESC LIMIT 20
    `);
    res.json(r.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
