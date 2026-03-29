import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateVideo, generateMotion, submitMotionControl, checkQueueStatus, getQueueResult, generateAvatar, generateTTS } from '../services/kling';
import { deduct, addCredits, TxType } from '../services/balance';
import { saveGeneration } from '../services/generations';
import { pool } from '../db/pool';

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
    if (isMotionControl) {
      // ASYNC: submit в очередь, вернуть requestId сразу
      const orient = characterOrientation === 'image' ? 'image' as const : 'video' as const;
      const { requestId, endpoint } = await submitMotionControl(imageUrl, videoUrl, orient, model, mode);
      // Сохраняем в БД (переживает рестарт сервера)
      await pool.query(
        `INSERT INTO pending_motion (request_id, user_id, cost, endpoint, prompt) VALUES ($1, $2, $3, $4, $5)`,
        [requestId, req.userId!, cost, endpoint, prompt || null]
      );
      console.log('[motion] submitted to queue:', requestId, 'endpoint:', endpoint);
      res.json({ requestId, creditsLeft, cost, async: true });
    } else {
      // Обычный motion (image-to-video) — синхронный
      const result = await generateMotion(imageUrl, prompt, dur, model, mode);
      await saveGeneration(req.userId!, 'motion', prompt || null, result.videoUrl, cost).catch(console.error);
      res.json({ ...result, creditsLeft, cost });
    }
  } catch (e: any) {
    await addCredits(req.userId!, cost, 'motion', `Рефанд: ошибка motion`).catch(console.error);
    console.error('[motion] error + refund:', e?.message, e?.body || '');
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});

// GET /video/motion-status/:requestId — проверить статус генерации
videoRouter.get('/motion-status/:requestId', async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const row = await pool.query('SELECT * FROM pending_motion WHERE request_id = $1', [requestId]);
  const meta = row.rows[0];
  if (!meta) { res.status(404).json({ error: 'Запрос не найден' }); return; }
  if (Number(meta.user_id) !== req.userId) { res.status(403).json({ error: 'Нет доступа' }); return; }

  // Старше 30 мин — удалить, рефанд
  if (Date.now() - new Date(meta.created_at).getTime() > 30 * 60 * 1000) {
    await addCredits(Number(meta.user_id), meta.cost, 'motion', 'Рефанд: таймаут motion-control').catch(console.error);
    await pool.query('DELETE FROM pending_motion WHERE request_id = $1', [requestId]);
    res.status(410).json({ error: 'Генерация истекла. Кредиты возвращены.' });
    return;
  }

  try {
    const status = await checkQueueStatus(meta.endpoint, requestId);
    res.json(status);
  } catch (e: any) {
    console.error('[motion-status] error:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка проверки статуса' });
  }
});

// GET /video/motion-result/:requestId — забрать готовое видео
videoRouter.get('/motion-result/:requestId', async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const row = await pool.query('SELECT * FROM pending_motion WHERE request_id = $1', [requestId]);
  const meta = row.rows[0];
  if (!meta) { res.status(404).json({ error: 'Запрос не найден' }); return; }
  if (Number(meta.user_id) !== req.userId) { res.status(403).json({ error: 'Нет доступа' }); return; }

  try {
    const result = await getQueueResult(meta.endpoint, requestId);
    await saveGeneration(Number(meta.user_id), 'motion', meta.prompt, result.videoUrl, meta.cost).catch(console.error);
    await pool.query('DELETE FROM pending_motion WHERE request_id = $1', [requestId]);
    res.json({ videoUrl: result.videoUrl, cost: meta.cost });
  } catch (e: any) {
    await addCredits(Number(meta.user_id), meta.cost, 'motion', `Рефанд: ошибка motion-control`).catch(console.error);
    await pool.query('DELETE FROM pending_motion WHERE request_id = $1', [requestId]);
    console.error('[motion-result] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка получения результата' });
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
