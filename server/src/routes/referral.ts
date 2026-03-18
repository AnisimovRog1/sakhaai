import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getReferralStats, getReferralFriends, registerReferral, REFERRAL_REWARDS } from '../services/referral';
import { pool } from '../db/pool';

export const referralRouter = Router();

// POST /referral/preregister — вызывается ботом при /start ref_X
// Защита: BOT_TOKEN в заголовке Authorization
referralRouter.post('/preregister', async (req: Request, res: Response) => {
  try {
    const auth = req.headers['authorization'];
    if (!auth || auth !== `Bearer ${process.env.BOT_TOKEN}`) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { refereeId, refereeFirstName, refereeUsername, referrerId } = req.body;
    if (!refereeId || !referrerId || !refereeFirstName) {
      res.status(400).json({ error: 'Неверные параметры' });
      return;
    }

    // Upsert пользователя-реферала в БД (он ещё не открыл webapp)
    await pool.query(
      `INSERT INTO users (id, first_name, username)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE
         SET first_name = EXCLUDED.first_name,
             username   = EXCLUDED.username,
             updated_at = NOW()`,
      [refereeId, refereeFirstName, refereeUsername ?? null]
    );

    // Регистрируем реферал
    const result = await registerReferral(Number(refereeId), Number(referrerId), '');
    console.log(`🤝 Бот: реферал ${refereeId} → ${referrerId}: ${result.ok ? 'OK' : result.reason}`);
    res.json({ ok: result.ok, reason: result.reason });
  } catch (err) {
    console.error('preregister error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

referralRouter.use(requireAuth);

// GET /referral/stats — статистика реферера
referralRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getReferralStats(req.userId!);
    const rewards = Object.entries(REFERRAL_REWARDS).map(([pkg, credits]) => ({
      package: pkg,
      credits,
      label: { start: 'Старт', basic: 'Базовый', pro: 'Про', max: 'Макс' }[pkg],
    }));
    res.json({ ...stats, rewards });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /referral/friends — список приглашённых друзей
referralRouter.get('/friends', async (req: Request, res: Response) => {
  try {
    const friends = await getReferralFriends(req.userId!);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
