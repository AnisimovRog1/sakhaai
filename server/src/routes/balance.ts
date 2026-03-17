import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getBalance, getTransactions } from '../services/balance';

export const balanceRouter = Router();
balanceRouter.use(requireAuth);

// GET /balance — текущий баланс (из Redis кэша или БД)
balanceRouter.get('/', async (req: Request, res: Response) => {
  const credits = await getBalance(req.userId!);
  res.json({ credits });
});

// GET /balance/transactions — история операций
balanceRouter.get('/transactions', async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const transactions = await getTransactions(req.userId!, limit);

  // Добавляем понятные иконки и подписи для UI
  const withMeta = transactions.map((tx: { type: string; amount: number; description: string; id: number; created_at: string }) => ({
    ...tx,
    icon: iconForType(tx.type),
    label: labelForType(tx.type),
    isDebit: tx.amount < 0,
  }));

  res.json(withMeta);
});

function iconForType(type: string): string {
  const icons: Record<string, string> = {
    chat:     '💬',
    image:    '🎨',
    video:    '🎬',
    motion:   '✨',
    avatar:   '🗣️',
    topup:    '💳',
    referral: '👥',
  };
  return icons[type] ?? '📝';
}

function labelForType(type: string): string {
  const labels: Record<string, string> = {
    chat:     'Чат с AI',
    image:    'Генерация картинки',
    video:    'Генерация видео',
    motion:   'Motion видео',
    avatar:   'Avatar видео',
    topup:    'Пополнение',
    referral: 'Реферальный бонус',
  };
  return labels[type] ?? type;
}
