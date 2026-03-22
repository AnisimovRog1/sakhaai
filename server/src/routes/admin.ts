import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { addCredits } from '../services/balance';

export const adminRouter = Router();

// Простая проверка: BOT_TOKEN как Bearer токен (бот вызывает эти роуты)
function requireBotAuth(req: Request, res: Response, next: () => void) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.BOT_TOKEN}`) {
    res.status(403).json({ error: 'Доступ запрещён' });
    return;
  }
  next();
}

adminRouter.use(requireBotAuth);

// GET /admin/stats — статистика
adminRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    const banned = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_banned = true');
    const chats = await pool.query('SELECT COUNT(*) as count FROM chats');
    const messages = await pool.query('SELECT COUNT(*) as count FROM messages');
    const generations = await pool.query('SELECT COUNT(*) as count FROM generations');
    const totalCredits = await pool.query('SELECT COALESCE(SUM(credits), 0) as total FROM users');
    const todayUsers = await pool.query("SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE");
    const todayTx = await pool.query("SELECT COUNT(*) as count FROM transactions WHERE created_at >= CURRENT_DATE");
    const topUsers = await pool.query(`
      SELECT id, username, first_name, credits
      FROM users ORDER BY credits DESC LIMIT 5
    `);

    res.json({
      users: +users.rows[0].count,
      banned: +banned.rows[0].count,
      chats: +chats.rows[0].count,
      messages: +messages.rows[0].count,
      generations: +generations.rows[0].count,
      totalCredits: +totalCredits.rows[0].total,
      todayUsers: +todayUsers.rows[0].count,
      todayTransactions: +todayTx.rows[0].count,
      topUsers: topUsers.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/addcredits — начислить кредиты
adminRouter.post('/addcredits', async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount) {
      res.status(400).json({ error: 'userId и amount обязательны' });
      return;
    }
    const newBalance = await addCredits(Number(userId), Number(amount), 'topup', `Админ начисление: +${amount}`);
    res.json({ success: true, userId, added: amount, newBalance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/ban — заблокировать/разблокировать
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

// GET /admin/users — список всех юзеров
adminRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, username, first_name, credits, is_banned, created_at
      FROM users ORDER BY created_at DESC LIMIT 100
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/user/:id — инфо о юзере
adminRouter.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rowCount === 0) { res.status(404).json({ error: 'Юзер не найден' }); return; }
    const txCount = await pool.query('SELECT COUNT(*) as count FROM transactions WHERE user_id = $1', [userId]);
    const chatCount = await pool.query('SELECT COUNT(*) as count FROM chats WHERE user_id = $1', [userId]);
    const genCount = await pool.query('SELECT COUNT(*) as count FROM generations WHERE user_id = $1', [userId]);
    res.json({
      ...user.rows[0],
      transactions: +txCount.rows[0].count,
      chats: +chatCount.rows[0].count,
      generations: +genCount.rows[0].count,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
