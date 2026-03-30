import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateImage, editImage } from '../services/nanabanana';
import { deduct, addCredits } from '../services/balance';
import { saveGeneration } from '../services/generations';

export const imageRouter = Router();
imageRouter.use(requireAuth);

const IMAGE_COST = 79;

// POST /image/generate
imageRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt, model } = req.body;
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
    const { refImages } = req.body;
    let result;

    if (Array.isArray(refImages) && refImages.length > 0) {
      // img2img: парсим data: URL → base64 + mimeType
      const images = refImages.slice(0, 4).map((dataUrl: string) => {
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) throw new Error('Некорректный формат изображения');
        return { mimeType: match[1], base64: match[2] };
      });
      result = await editImage(images, prompt, model);
    } else {
      result = await generateImage(prompt, model);
    }

    // Автосохранение в историю
    await saveGeneration(req.userId!, 'image', prompt, result.imageUrl, IMAGE_COST).catch(console.error);

    res.json({ imageUrl: result.imageUrl, creditsLeft, cost: IMAGE_COST });
  } catch (e: any) {
    await addCredits(req.userId!, IMAGE_COST, 'image', `Рефанд: ошибка генерации`).catch(console.error);
    console.error('[image] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});
