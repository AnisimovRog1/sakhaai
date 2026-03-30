import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateImage, editImage } from '../services/nanabanana';
import { deduct, addCredits } from '../services/balance';
import { saveGeneration } from '../services/generations';

export const imageRouter = Router();
imageRouter.use(requireAuth);

const IMAGE_COST_PER_IMAGE = 79;

// POST /image/generate
imageRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt, model, refImages, aspectRatio, resolution, count: rawCount } = req.body;
  if (!prompt?.trim()) {
    res.status(400).json({ error: 'Промпт обязателен' });
    return;
  }

  const count = Math.min(Math.max(Number(rawCount) || 1, 1), 4);
  const totalCost = IMAGE_COST_PER_IMAGE * count;

  const creditsLeft = await deduct(
    req.userId!,
    totalCost,
    'image',
    `Картинка x${count}: ${(prompt as string).slice(0, 50)}`
  ).catch((err: Error & { status?: number }) => {
    res.status(err.status ?? 500).json({ error: err.message });
    return null;
  });
  if (creditsLeft === null) return;

  try {
    const hasRefImages = Array.isArray(refImages) && refImages.length > 0;
    let parsedImages: Array<{ mimeType: string; base64: string }> | undefined;

    if (hasRefImages) {
      parsedImages = refImages.slice(0, 4).map((dataUrl: string) => {
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) throw new Error('Некорректный формат изображения');
        return { mimeType: match[1], base64: match[2] };
      });
    }

    // Генерируем count изображений параллельно
    const promises = Array.from({ length: count }, () =>
      parsedImages
        ? editImage(parsedImages, prompt, model, aspectRatio, resolution)
        : generateImage(prompt, model, aspectRatio, resolution)
    );

    const results = await Promise.all(promises);
    const imageUrls = results.map(r => r.imageUrl);

    // Сохраняем каждый результат в историю
    for (const url of imageUrls) {
      await saveGeneration(req.userId!, 'image', prompt, url, IMAGE_COST_PER_IMAGE).catch(console.error);
    }

    res.json({
      imageUrl: imageUrls[0],
      imageUrls,
      creditsLeft,
      cost: totalCost,
    });
  } catch (e: any) {
    await addCredits(req.userId!, totalCost, 'image', `Рефанд: ошибка генерации`).catch(console.error);
    console.error('[image] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});
