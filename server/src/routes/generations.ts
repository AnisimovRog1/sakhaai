import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getGenerations, GenerationType } from '../services/generations';
import { pool } from '../db/pool';

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

// DELETE /generations/:id
generationsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) { res.status(400).json({ error: 'Неверный ID' }); return; }

    const { rowCount } = await pool.query(
      'DELETE FROM generations WHERE id = $1 AND user_id = $2',
      [id, req.userId!]
    );
    if (rowCount === 0) { res.status(404).json({ error: 'Не найдено' }); return; }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Ошибка удаления' });
  }
});
