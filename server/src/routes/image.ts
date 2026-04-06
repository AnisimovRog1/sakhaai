import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateImage, editImage, translateToEnglish } from '../services/nanabanana';
import { deduct, addCredits } from '../services/balance';
import { getMultiplier } from '../services/exchange-rate';
import { saveGeneration } from '../services/generations';
import { tryGrantWelcomeBonus } from '../services/welcome-antifraud';

export const imageRouter = Router();
imageRouter.use(requireAuth);

// Базовая цена за 1 фото (себестоимость × 2.3, при курсе 80.62)
function getBaseImageCost(model?: string, resolution?: string): number {
  if (model === 'nano-banana-pro') {
    if (resolution === '4K') return 556;
    return 310; // 1K и 2K
  }
  // nano-banana-2
  if (resolution === '4K') return 350;
  if (resolution === '2K') return 234;
  return 155; // 1K
}

function getImageCost(model?: string, resolution?: string): number {
  return Math.ceil(getBaseImageCost(model, resolution) * getMultiplier());
}

// POST /image/generate
imageRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt, model, refImages, aspectRatio, resolution, count: rawCount } = req.body;
  if (!prompt?.trim()) {
    res.status(400).json({ error: 'Промпт обязателен' });
    return;
  }

  // Welcome-бонус при первом AI-запросе (антифрод)
  await tryGrantWelcomeBonus(req.userId!).catch(console.error);

  const count = Math.min(Math.max(Number(rawCount) || 1, 1), 4);
  const costPerImage = getImageCost(model, resolution);
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
      parsedImages = [];
      for (let idx = 0; idx < Math.min(refImages.length, 4); idx++) {
        const dataUrl = String(refImages[idx]);
        if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
          // URL — скачиваем и конвертируем в base64 (только внешние CDN)
          const urlObj = new URL(dataUrl);
          if (['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'].includes(urlObj.hostname) || urlObj.hostname.startsWith('10.') || urlObj.hostname.startsWith('192.168.') || urlObj.hostname.startsWith('172.')) {
            throw new Error('Недопустимый URL изображения');
          }
          const resp = await fetch(dataUrl, { signal: AbortSignal.timeout(15000) });
          if (!resp.ok) throw new Error('Не удалось загрузить референс-изображение');
          const buf = Buffer.from(await resp.arrayBuffer());
          let ct = resp.headers.get('content-type') || '';
          // CloudFront часто отдаёт binary/octet-stream — определяем по расширению
          if (!ct || ct === 'binary/octet-stream' || ct === 'application/octet-stream') {
            const ext = dataUrl.split('?')[0].split('.').pop()?.toLowerCase();
            if (ext === 'png') ct = 'image/png';
            else if (ext === 'webp') ct = 'image/webp';
            else if (ext === 'gif') ct = 'image/gif';
            else ct = 'image/jpeg';
          }
          parsedImages.push({ mimeType: ct, base64: buf.toString('base64') });
        } else {
          // data URL — парсим base64
          const clean = dataUrl.replace(/\s/g, '');
          const match = clean.match(/^data:([^;]+);base64,(.+)$/);
          if (!match) throw new Error('Некорректный формат изображения');
          parsedImages.push({ mimeType: match[1], base64: match[2] });
        }
      }
    }

    // Переводим промпт ОДИН раз (не для каждого фото)
    const translatedPrompt = await translateToEnglish(prompt);

    // Генерируем count изображений ПОСЛЕДОВАТЕЛЬНО
    const imageUrls: string[] = [];
    let failedCount = 0;
    for (let i = 0; i < count; i++) {
      try {
        console.log(`[image] generating ${i + 1}/${count}...`);
        const result = parsedImages
          ? await editImage(parsedImages, translatedPrompt, model, aspectRatio, resolution)
          : await generateImage(translatedPrompt, model, aspectRatio, resolution);
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
      requested: count,
      generated: imageUrls.length,
      refunded: failedCount,
    });
  } catch (e: any) {
    await addCredits(req.userId!, totalCost, 'image', `Рефанд: ошибка генерации`).catch(console.error);
    console.error('[image] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});
