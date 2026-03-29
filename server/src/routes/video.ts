import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateVideo, generateMotion, generateMotionControl, generateAvatar, generateTTS } from '../services/kling';
import { deduct, addCredits, TxType } from '../services/balance';
import { saveGeneration } from '../services/generations';

export const videoRouter = Router();
videoRouter.use(requireAuth);

// Динамическая цена: baseRate × duration × маржа x2 × 1000 (кредиты/$)
function calcVideoCost(duration: number, type: 'video' | 'motion' | 'motion-control', model?: string, mode?: string, audio?: boolean): number {
  let baseRate: number;

  if (type === 'motion-control') {
    baseRate = 0.168; // motion-control is expensive
  } else if (model === 'video-2.6' || model === 'video-2.5-turbo') {
    baseRate = audio ? 0.14 : 0.07;
  } else {
    // v3 standard
    baseRate = audio ? 0.126 : 0.084;
  }

  // 1080p/pro costs ~50% more
  if (mode === '1080p') baseRate *= 1.5;

  // Margin x2
  return Math.ceil(duration * baseRate * 2 * 1000);
}

const AVATAR_COST = 1150;

const TX_META: Record<string, { type: TxType; label: string }> = {
  video:  { type: 'video',  label: 'Видео' },
  motion: { type: 'motion', label: 'Motion видео' },
  avatar: { type: 'avatar', label: 'Avatar видео' },
};

async function charge(
  req: Parameters<Parameters<typeof videoRouter.post>[1]>[0],
  res: Parameters<Parameters<typeof videoRouter.post>[1]>[1],
  kind: keyof typeof TX_META,
  credits: number
): Promise<number | null> {
  const { type, label } = TX_META[kind];
  return deduct(req.userId!, credits, type, `${label} (${credits} кр.)`).catch((err: Error & { status?: number }) => {
    res.status(err.status ?? 500).json({ error: err.message });
    return null;
  });
}

// POST /video/generate — текст → видео
videoRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt, model, duration, mode, aspectRatio, generateAudio, startImageUrl } = req.body;
  if (!prompt?.trim()) { res.status(400).json({ error: 'Промпт обязателен' }); return; }

  const dur = [5, 10].includes(Number(duration)) ? Number(duration) : 5;
  const cost = calcVideoCost(dur, 'video', model, mode, !!generateAudio);

  const creditsLeft = await charge(req, res, 'video', cost);
  if (creditsLeft === null) return;

  try {
    const result = await generateVideo(prompt, dur, model, mode, aspectRatio, generateAudio, startImageUrl);
    await saveGeneration(req.userId!, 'video', prompt, result.videoUrl, cost).catch(console.error);
    res.json({ ...result, creditsLeft, cost });
  } catch (e: any) {
    await addCredits(req.userId!, cost, 'video', `Рефанд: ошибка генерации`).catch(console.error);
    console.error('[video] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});

// POST /video/motion — картинка → видео (image-to-video) ИЛИ motion control (image + video)
videoRouter.post('/motion', async (req: Request, res: Response) => {
  const { imageUrl, videoUrl, characterOrientation, prompt, duration, model, mode } = req.body;
  if (!imageUrl) { res.status(400).json({ error: 'imageUrl обязателен' }); return; }

  const isMotionControl = !!(imageUrl && videoUrl);
  const dur = isMotionControl ? 5 : ([5, 10].includes(Number(duration)) ? Number(duration) : 5);
  const costType = isMotionControl ? 'motion-control' as const : 'motion' as const;
  const cost = calcVideoCost(dur, costType, model, mode);

  const creditsLeft = await charge(req, res, 'motion', cost);
  if (creditsLeft === null) return;

  try {
    let result;
    if (isMotionControl) {
      const orient = characterOrientation === 'image' ? 'image' as const : 'video' as const;
      result = await generateMotionControl(imageUrl, videoUrl, orient, model, mode);
    } else {
      result = await generateMotion(imageUrl, prompt, dur, model, mode);
    }
    await saveGeneration(req.userId!, 'motion', prompt || null, result.videoUrl, cost).catch(console.error);
    res.json({ ...result, creditsLeft, cost });
  } catch (e: any) {
    await addCredits(req.userId!, cost, 'motion', `Рефанд: ошибка motion`).catch(console.error);
    console.error('[motion] error + refund:', e?.message, e?.body || '');
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});

// POST /video/tts-preview — превью голоса (бесплатно, без списания)
videoRouter.post('/tts-preview', async (req: Request, res: Response) => {
  const { text, voiceId, voiceSpeed } = req.body;
  if (!text?.trim()) { res.status(400).json({ error: 'Текст обязателен' }); return; }
  try {
    const result = await generateTTS(text, voiceId, voiceSpeed);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Ошибка TTS' });
  }
});

// POST /video/tts — генерация аудио для аватара (списание при генерации аватара)
videoRouter.post('/tts', async (req: Request, res: Response) => {
  const { text, voiceId, voiceSpeed } = req.body;
  if (!text?.trim()) { res.status(400).json({ error: 'Текст обязателен' }); return; }
  try {
    const result = await generateTTS(text, voiceId, voiceSpeed);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Ошибка TTS' });
  }
});

// POST /video/avatar — изображение + текст → TTS → говорящий аватар
videoRouter.post('/avatar', async (req: Request, res: Response) => {
  const { imageUrl, text, voiceId, voiceSpeed, emotion, avatarPrompt } = req.body;
  if (!imageUrl) { res.status(400).json({ error: 'imageUrl обязателен' }); return; }
  if (!text?.trim()) { res.status(400).json({ error: 'Текст обязателен' }); return; }

  const creditsLeft = await charge(req, res, 'avatar', AVATAR_COST);
  if (creditsLeft === null) return;

  try {
    // Шаг 1: TTS — текст → аудио URL
    const ttsResult = await generateTTS(text.trim(), voiceId || 'oversea_male1', voiceSpeed ?? 1.0);
    if (!ttsResult.audioUrl) throw new Error('TTS не вернул аудио');

    // Шаг 2: Собрать prompt из emotion + avatarPrompt
    const prompt = [avatarPrompt, emotion && emotion !== 'neutral' ? `Expression: ${emotion}` : ''].filter(Boolean).join('. ') || undefined;

    // Шаг 3: Аватар — фото + аудио → видео
    const result = await generateAvatar(imageUrl, ttsResult.audioUrl, prompt);
    await saveGeneration(req.userId!, 'avatar', text.trim(), result.videoUrl, AVATAR_COST).catch(console.error);
    res.json({ ...result, creditsLeft, cost: AVATAR_COST });
  } catch (e: any) {
    await addCredits(req.userId!, AVATAR_COST, 'avatar', `Рефанд: ошибка avatar`).catch(console.error);
    console.error('[avatar] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});
