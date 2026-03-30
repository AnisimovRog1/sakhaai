import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateImage, editImage } from '../services/nanabanana';
import { deduct, addCredits } from '../services/balance';
import { saveGeneration } from '../services/generations';

export const imageRouter = Router();
imageRouter.use(requireAuth);

const IMAGE_COST_BASE = 79;

// Множитель цены за разрешение
function getResolutionMultiplier(resolution?: string): number {
  if (resolution === '4K') return 2.0;
  if (resolution === '2K') return 1.5;
  return 1.0; // 1K или не указано
}

// POST /image/generate
imageRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt, model, refImages, aspectRatio, resolution, count: rawCount } = req.body;
  if (!prompt?.trim()) {
    res.status(400).json({ error: 'Промпт обязателен' });
    return;
  }

  const count = Math.min(Math.max(Number(rawCount) || 1, 1), 4);
  const resMultiplier = getResolutionMultiplier(resolution);
  const costPerImage = Math.ceil(IMAGE_COST_BASE * resMultiplier);
  const totalCost = costPerImage * count;

  const creditsLeft = await deduct(
    req.userId!,
    totalCost,
    'image',
    `Картинка x${count} ${resolution || '1K'}: ${(prompt as string).slice(0, 50)}`
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

    // Генерируем count изображений ПОСЛЕДОВАТЕЛЬНО
    // Если одно фото не получилось — возвращаем те что получились
    const imageUrls: string[] = [];
    let failedCount = 0;
    for (let i = 0; i < count; i++) {
      try {
        console.log(`[image] generating ${i + 1}/${count}...`);
        const result = parsedImages
          ? await editImage(parsedImages, prompt, model, aspectRatio, resolution)
          : await generateImage(prompt, model, aspectRatio, resolution);
        imageUrls.push(result.imageUrl);
      } catch (genErr: any) {
        console.error(`[image] gen ${i + 1}/${count} failed:`, genErr?.message);
        failedCount++;
      }
    }

    // Если ничего не сгенерировалось — рефанд и ошибка
    if (imageUrls.length === 0) {
      throw new Error('Gemini не вернул изображение. Попробуйте другой промпт.');
    }

    // Рефанд за неудачные фото
    if (failedCount > 0) {
      const refundAmount = costPerImage * failedCount;
      await addCredits(req.userId!, refundAmount, 'image', `Рефанд: ${failedCount} фото не получились`).catch(console.error);
      console.log(`[image] partial refund: ${refundAmount} credits for ${failedCount} failed`);
    }

    // Сохраняем каждый результат в историю
    for (const url of imageUrls) {
      try {
        await saveGeneration(req.userId!, 'image', prompt, url, costPerImage);
        console.log(`[image] saved to generations, url length: ${url.length}`);
      } catch (saveErr: any) {
        console.error('[image] SAVE FAILED:', saveErr?.message, 'url length:', url.length);
      }
    }

    res.json({
      imageUrl: imageUrls[0],
      imageUrls,
      creditsLeft: creditsLeft + (costPerImage * failedCount),
      cost: costPerImage * imageUrls.length,
    });
  } catch (e: any) {
    await addCredits(req.userId!, totalCost, 'image', `Рефанд: ошибка генерации`).catch(console.error);
    console.error('[image] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});
