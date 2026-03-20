import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getGenerations, GenerationType } from '../services/generations';

export const generationsRouter = Router();
generationsRouter.use(requireAuth);

// GET /generations?type=image&limit=20&offset=0
generationsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as GenerationType | undefined;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Number(req.query.offset) || 0;

    const items = await getGenerations(req.userId!, type, limit, offset);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Ошибка получения истории' });
  }
});
