import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateImage } from '../services/nanabanana';
import { deduct } from '../services/balance';

export const imageRouter = Router();
imageRouter.use(requireAuth);

const IMAGE_COST = 79; // 7.88 руб / 0.1 руб на кредит

// POST /image/generate
imageRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt?.trim()) {
    res.status(400).json({ error: 'Промпт обязателен' });
    return;
  }

  // Списываем кредиты атомарно (проверка баланса внутри deduct)
  const creditsLeft = await deduct(
    req.userId!,
    IMAGE_COST,
    'image',
    `Картинка: ${(prompt as string).slice(0, 50)}`
  ).catch((err: Error & { status?: number }) => {
    res.status(err.status ?? 500).json({ error: err.message });
    return null;
  });
  if (creditsLeft === null) return;

  const result = await generateImage(prompt);
  res.json({ imageUrl: result.imageUrl, creditsLeft, cost: IMAGE_COST });
});
