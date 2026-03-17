import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getReferralStats, REFERRAL_REWARDS } from '../services/referral';

export const referralRouter = Router();
referralRouter.use(requireAuth);

// GET /referral/stats — статистика реферера
referralRouter.get('/stats', async (req: Request, res: Response) => {
  const stats = await getReferralStats(req.userId!);

  // Добавляем описание наград для UI
  const rewards = Object.entries(REFERRAL_REWARDS).map(([pkg, credits]) => ({
    package: pkg,
    credits,
    label: { start: 'Старт', basic: 'Базовый', pro: 'Про', max: 'Макс' }[pkg],
  }));

  res.json({ ...stats, rewards });
});
