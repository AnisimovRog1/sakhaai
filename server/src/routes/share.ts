import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { pool } from '../db/pool';
import { saveTempBuffer } from '../services/kling-direct';

export const shareRouter = Router();
shareRouter.use(requireAuth);

const BOT_TOKEN = process.env.BOT_TOKEN;

// POST /share/prepare — подготовить медиа для нативного шеринга Telegram
// Вызывает savePreparedInlineMessage (Bot API 8.0+)
shareRouter.post('/prepare', async (req: Request, res: Response) => {
  try {
    const { generationId } = req.body;
    if (!generationId) { res.status(400).json({ error: 'generationId required' }); return; }

    // Получить генерацию
    const { rows } = await pool.query(
      'SELECT id, type, result_url, prompt FROM generations WHERE id = $1 AND user_id = $2',
      [generationId, req.userId]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Generation not found' }); return; }
    const gen = rows[0];

    // Конвертировать data URL (картинки) в публичный HTTPS
    let mediaUrl = gen.result_url;
    if (mediaUrl.startsWith('data:')) {
      const match = mediaUrl.match(/^data:([^;]+);base64,(.+)$/s);
      if (match) {
        const buffer = Buffer.from(match[2], 'base64');
        mediaUrl = saveTempBuffer(buffer, match[1]);
      }
    }

    const isVideo = ['video', 'motion', 'avatar'].includes(gen.type);
    const deepLink = `https://t.me/UraanxAI_bot?start=share_${req.userId}_${generationId}`;
    const caption = `Создано с помощью нейросети UraanxAI ✨\n\nПопробуй сам 👇\n${deepLink}`;

    // Формируем InlineQueryResult
    const inlineResult = isVideo
      ? {
          type: 'video',
          id: `share_${generationId}`,
          video_url: mediaUrl,
          mime_type: 'video/mp4',
          thumbnail_url: mediaUrl,
          title: 'Генерация UraanxAI',
          caption,
        }
      : {
          type: 'photo',
          id: `share_${generationId}`,
          photo_url: mediaUrl,
          thumbnail_url: mediaUrl,
          caption,
        };

    // Вызываем savePreparedInlineMessage (Bot API 8.0+)
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/savePreparedInlineMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: req.userId,
        result: inlineResult,
        allow_user_chats: true,
        allow_bot_chats: true,
        allow_group_chats: true,
        allow_channel_chats: true,
      }),
    });

    const tgData = await tgRes.json() as any;
    if (!tgData.ok) {
      console.error('[share/prepare] Telegram API error:', JSON.stringify(tgData));
      res.status(500).json({ error: tgData.description || 'Telegram API error' });
      return;
    }

    res.json({ preparedMessageId: tgData.result.prepared_message_id });
  } catch (err: any) {
    console.error('[share/prepare] error:', err?.message);
    res.status(500).json({ error: 'Server error' });
  }
});
