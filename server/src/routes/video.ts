import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  submitTextToVideo,
  submitImageToVideo,
  submitMotionControlDirect,
  checkTaskStatus,
  checkMotionStatusDirect,
} from '../services/kling-direct';
import { generateTTS, generateAvatar } from '../services/fal-avatar';
import voiceSamples from '../data/voice-samples.json';
import { deduct, addCredits, TxType } from '../services/balance';
import { getMultiplier } from '../services/exchange-rate';
import { saveGeneration } from '../services/generations';
import { pool } from '../db/pool';
import crypto from 'crypto';

export const videoRouter = Router();
videoRouter.use(requireAuth);

// Динамическая цена: baseRate (LP2 $0.084/unit) × duration × маржа ×2.3 × 1000
function calcVideoCost(duration: number, type: 'video' | 'motion' | 'motion-control', model?: string, mode?: string, audio?: boolean): number {
  // baseRate = units_per_sec × LP2_unit_cost ($0.084)
  let baseRate: number;

  if (type === 'motion-control') {
    // Motion Control V3.0: 0.9 (720p) / 1.2 (1080p) units/sec
    baseRate = mode === '1080p' ? 0.1008 : 0.0756;
  } else if (model === 'video-2.6' || model === 'video-2.5-turbo') {
    if (mode === '1080p') {
      baseRate = audio ? 0.084 : 0.042;
    } else {
      baseRate = audio ? 0.042 : 0.0252;
    }
  } else {
    // V3.0
    if (mode === '1080p') {
      baseRate = audio ? 0.1008 : 0.0672;
    } else {
      baseRate = audio ? 0.0756 : 0.0504;
    }
  }

  // Маржа ×2.3 × курсовой множитель
  return Math.ceil(duration * baseRate * 2.3 * 1000 * getMultiplier());
}

// Аватар: TTS (фикс 16 кр) + видео (267 кр/сек)
const AVATAR_TTS_COST = 16;
const AVATAR_PER_SEC = 267;

function calcAvatarCost(text: string): number {
  // ~15 символов/сек для русской речи
  const estimatedDuration = Math.max(3, Math.min(10, Math.ceil(text.length / 15)));
  const m = getMultiplier();
  return Math.ceil(AVATAR_TTS_COST * m) + Math.ceil(estimatedDuration * AVATAR_PER_SEC * m);
}

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

// ─── POST /video/generate — текст → видео (async) ──────────
videoRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt, model, duration, mode, aspectRatio, generateAudio, startImageUrl } = req.body;
  if (!prompt?.trim()) { res.status(400).json({ error: 'Промпт обязателен' }); return; }

  const dur = [5, 10].includes(Number(duration)) ? Number(duration) : 5;
  const cost = calcVideoCost(dur, 'video', model, mode, !!generateAudio);

  const creditsLeft = await charge(req, res, 'video', cost);
  if (creditsLeft === null) return;

  try {
    let klingTaskId: string;
    let klingEndpoint: string;

    if (startImageUrl) {
      // Начальный кадр → image-to-video (Kling использует image как первый кадр)
      const result = await submitImageToVideo({
        imageUrl: startImageUrl,
        prompt: prompt.trim(),
        duration: dur,
        model,
        mode,
      });
      klingTaskId = result.klingTaskId;
      klingEndpoint = '/v1/videos/image2video';
    } else {
      // Только текст → text-to-video
      const result = await submitTextToVideo({
        prompt: prompt.trim(),
        duration: dur,
        model,
        mode,
        aspectRatio,
        generateAudio: !!generateAudio,
      });
      klingTaskId = result.klingTaskId;
      klingEndpoint = '/v1/videos/text2video';
    }

    const taskId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO pending_tasks (task_id, kling_task_id, user_id, type, kling_endpoint, cost, prompt, metadata)
       VALUES ($1, $2, $3, 'video', $4, $5, $6, $7)`,
      [taskId, klingTaskId, req.userId!, klingEndpoint, cost, prompt.trim(),
       JSON.stringify({ model, mode, duration: dur, aspectRatio, generateAudio: !!generateAudio })]
    );

    res.json({ taskId, async: true, creditsLeft, cost });
  } catch (e: any) {
    await addCredits(req.userId!, cost, 'video', `Рефанд: ошибка генерации`).catch(console.error);
    console.error('[video] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});

// ─── POST /video/motion — image-to-video ИЛИ motion control (async) ──
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
    let klingTaskId: string;
    let klingEndpoint: string;
    let taskType: string;

    if (isMotionControl) {
      const orient = characterOrientation === 'image' ? 'image' as const : 'video' as const;
      const result = await submitMotionControlDirect(imageUrl, videoUrl, orient, mode, prompt);
      klingTaskId = result.taskId;
      klingEndpoint = '/v1/videos/motion-control';
      taskType = 'motion-control';
    } else {
      const result = await submitImageToVideo({ imageUrl, prompt, duration: dur, model, mode });
      klingTaskId = result.klingTaskId;
      klingEndpoint = '/v1/videos/image2video';
      taskType = 'motion';
    }

    const taskId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO pending_tasks (task_id, kling_task_id, user_id, type, kling_endpoint, cost, prompt, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [taskId, klingTaskId, req.userId!, taskType, klingEndpoint, cost, prompt || null,
       JSON.stringify({ model, mode, duration: dur })]
    );

    res.json({ taskId, requestId: klingTaskId, async: true, creditsLeft, cost });
  } catch (e: any) {
    await addCredits(req.userId!, cost, 'motion', `Рефанд: ошибка motion`).catch(console.error);
    console.error('[motion] error + refund:', e?.message, e?.body || '');
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});

// ─── GET /video/task-status/:taskId — универсальный статус задачи ──
videoRouter.get('/task-status/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM pending_tasks WHERE task_id = $1',
      [taskId]
    );
    const task = rows[0];
    if (!task) { res.status(404).json({ error: 'Задача не найдена' }); return; }
    if (String(task.user_id) !== String(req.userId)) { res.status(403).json({ error: 'Нет доступа' }); return; }

    res.json({
      taskId: task.task_id,
      type: task.type,
      status: task.status,
      resultUrl: task.result_url,
      errorMsg: task.error_msg,
      cost: task.cost,
      createdAt: task.created_at,
    });
  } catch (e: any) {
    console.error('[task-status] error:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка проверки статуса' });
  }
});

// ─── GET /video/tasks — все задачи юзера ──
videoRouter.get('/tasks', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT task_id, type, status, result_url, error_msg, prompt, cost, created_at
       FROM pending_tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.userId!]
    );
    res.json(rows);
  } catch (e: any) {
    console.error('[tasks] error:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка загрузки задач' });
  }
});

// ─── GET /video/motion-status/:requestId — legacy (backward compat) ──
videoRouter.get('/motion-status/:requestId', async (req: Request, res: Response) => {
  const { requestId } = req.params;

  // Сначала проверяем новую таблицу
  const { rows: newRows } = await pool.query(
    'SELECT * FROM pending_tasks WHERE kling_task_id = $1 OR task_id = $1',
    [requestId]
  );
  if (newRows.length > 0) {
    const task = newRows[0];
    if (String(task.user_id) !== String(req.userId)) { res.status(403).json({ error: 'Нет доступа' }); return; }
    res.json({
      status: task.status === 'pending' ? 'submitted' : task.status,
      videoUrl: task.result_url,
      errorMsg: task.error_msg,
    });
    return;
  }

  // Fallback на legacy таблицу pending_motion
  const row = await pool.query('SELECT * FROM pending_motion WHERE request_id = $1', [requestId]);
  const meta = row.rows[0];
  if (!meta) { res.status(404).json({ error: 'Запрос не найден' }); return; }
  if (String(meta.user_id) !== String(req.userId)) { res.status(403).json({ error: 'Нет доступа' }); return; }

  if (Date.now() - new Date(meta.created_at).getTime() > 60 * 60 * 1000) {
    await addCredits(Number(meta.user_id), meta.cost, 'motion', 'Рефанд: таймаут motion-control').catch(console.error);
    await pool.query('DELETE FROM pending_motion WHERE request_id = $1', [requestId]);
    res.status(410).json({ error: 'Генерация истекла. Кредиты возвращены.' });
    return;
  }

  try {
    const result = await checkMotionStatusDirect(requestId);

    if (result.status === 'succeed' && result.videoUrl) {
      await saveGeneration(Number(meta.user_id), 'motion', meta.prompt, result.videoUrl, meta.cost).catch(console.error);
      await pool.query('DELETE FROM pending_motion WHERE request_id = $1', [requestId]);
      res.json({ status: 'succeed', videoUrl: result.videoUrl });
      return;
    }

    if (result.status === 'failed') {
      await addCredits(Number(meta.user_id), meta.cost, 'motion', 'Рефанд: ошибка motion-control').catch(console.error);
      await pool.query('DELETE FROM pending_motion WHERE request_id = $1', [requestId]);
      res.json({ status: 'failed', errorMsg: result.errorMsg || 'Ошибка генерации' });
      return;
    }

    res.json({ status: result.status });
  } catch (e: any) {
    console.error('[motion-status] error:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка проверки статуса' });
  }
});

// ─── POST /video/tts-preview — превью голоса (локальные файлы) ──

videoRouter.post('/tts-preview', async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.body;
    if (!voiceId || !(voiceId in voiceSamples)) {
      res.status(404).json({ error: 'Превью для этого голоса недоступно' });
      return;
    }
    const audioUrl = `/voice-samples/${voiceId}.mp3`;
    res.json({ audioUrl });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Ошибка превью голоса' });
  }
});

// ─── POST /video/tts — TTS (недоступно) ──
videoRouter.post('/tts', async (_req: Request, res: Response) => {
  res.status(501).json({ error: 'TTS временно недоступен. Используйте генерацию аватара.' });
});

// ─── POST /video/avatar — синхронный через fal.ai (TTS → Avatar) ──
videoRouter.post('/avatar', async (req: Request, res: Response) => {
  const { imageUrl, text, voiceId, voiceSpeed, emotion, avatarPrompt } = req.body;
  if (!imageUrl) { res.status(400).json({ error: 'imageUrl обязателен' }); return; }
  if (!text?.trim()) { res.status(400).json({ error: 'Текст обязателен' }); return; }

  const avatarCost = calcAvatarCost(text.trim());
  const creditsLeft = await charge(req, res, 'avatar', avatarCost);
  if (creditsLeft === null) return;

  try {
    // Шаг 1: TTS — текст → аудио
    const ttsResult = await generateTTS(text.trim(), voiceId || 'oversea_male1', voiceSpeed ?? 1.0);
    if (!ttsResult.audioUrl) throw new Error('TTS не вернул аудио');

    // Шаг 2: Avatar — фото + аудио → видео
    const prompt = [avatarPrompt, emotion && emotion !== 'neutral' ? `Expression: ${emotion}` : ''].filter(Boolean).join('. ') || undefined;
    const result = await generateAvatar(imageUrl, ttsResult.audioUrl, prompt);

    // Сохранить в историю
    await saveGeneration(req.userId!, 'avatar', text.trim(), result.videoUrl, avatarCost).catch(console.error);

    res.json({ videoUrl: result.videoUrl, creditsLeft, cost: avatarCost });
  } catch (e: any) {
    await addCredits(req.userId!, avatarCost, 'avatar', `Рефанд: ошибка avatar`).catch(console.error);
    console.error('[avatar] error + refund:', e?.message);
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});
