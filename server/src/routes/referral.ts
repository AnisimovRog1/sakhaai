import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getReferralStats, getReferralFriends, REFERRAL_REWARDS } from '../services/referral';

export const referralRouter = Router();
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
