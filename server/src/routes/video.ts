import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateVideo, generateMotion, generateAvatar } from '../services/kling';
import { deduct, TxType } from '../services/balance';
import { saveGeneration } from '../services/generations';

export const videoRouter = Router();
videoRouter.use(requireAuth);

const COSTS: Record<string, { credits: number; type: TxType; label: string }> = {
  video:  { credits: 608, type: 'video',  label: 'Видео' },
  motion: { credits: 608, type: 'motion', label: 'Motion видео' },
  avatar: { credits: 810, type: 'avatar', label: 'Avatar видео' },
};

async function charge(
  req: Parameters<Parameters<typeof videoRouter.post>[1]>[0],
  res: Parameters<Parameters<typeof videoRouter.post>[1]>[1],
  kind: keyof typeof COSTS
): Promise<number | null> {
  const { credits, type, label } = COSTS[kind];
  return deduct(req.userId!, credits, type, label).catch((err: Error & { status?: number }) => {
    res.status(err.status ?? 500).json({ error: err.message });
    return null;
  });
}

// POST /video/generate — текст → видео
videoRouter.post('/generate', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt?.trim()) { res.status(400).json({ error: 'Промпт обязателен' }); return; }

  const creditsLeft = await charge(req, res, 'video');
  if (creditsLeft === null) return;

  try {
    const result = await generateVideo(prompt);
    await saveGeneration(req.userId!, 'video', prompt, result.videoUrl, COSTS.video.credits).catch(console.error);
    res.json({ ...result, creditsLeft, cost: COSTS.video.credits });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});

// POST /video/motion — картинка → видео
videoRouter.post('/motion', async (req: Request, res: Response) => {
  const { imageUrl, prompt } = req.body;
  if (!imageUrl) { res.status(400).json({ error: 'imageUrl обязателен' }); return; }

  const creditsLeft = await charge(req, res, 'motion');
  if (creditsLeft === null) return;

  try {
    const result = await generateMotion(imageUrl, prompt);
    await saveGeneration(req.userId!, 'motion', prompt || null, result.videoUrl, COSTS.motion.credits).catch(console.error);
    res.json({ ...result, creditsLeft, cost: COSTS.motion.credits });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});

// POST /video/avatar — изображение + аудио → говорящий аватар
videoRouter.post('/avatar', async (req: Request, res: Response) => {
  const { imageUrl, audioUrl, text } = req.body;
  const audio = audioUrl || text;
  if (!imageUrl || !audio) { res.status(400).json({ error: 'imageUrl и audioUrl обязательны' }); return; }

  const creditsLeft = await charge(req, res, 'avatar');
  if (creditsLeft === null) return;

  try {
    const result = await generateAvatar(imageUrl, audio);
    await saveGeneration(req.userId!, 'avatar', null, result.videoUrl, COSTS.avatar.credits).catch(console.error);
    res.json({ ...result, creditsLeft, cost: COSTS.avatar.credits });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Ошибка генерации' });
  }
});
