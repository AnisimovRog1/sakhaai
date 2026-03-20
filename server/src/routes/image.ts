import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateImage } from '../services/nanabanana';
import { deduct } from '../services/balance';
import { saveGeneration } from '../services/generations';

export const imageRouter = Router();
imageRouter.use(requireAuth);

const IMAGE_COST = 79;

// POST /image/generate
imageRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt?.trim()) {
    res.status(400).json({ error: 'Промпт обязателен' });
    return;
  }

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

  try {
    const result = await generateImage(prompt);

    // Автосохранение в историю
    await saveGeneration(req.userId!, 'image', prompt, result.imageUrl, IMAGE_COST).catch(console.error);

    res.json({ imageUrl: result.imageUrl, creditsLeft, cost: IMAGE_COST });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});
