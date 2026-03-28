// Генерация видео через fal.ai + Kling
// Требуется FAL_KEY в переменных окружения

import { fal } from '@fal-ai/client';

// Конфигурация fal.ai
fal.config({
  credentials: process.env.FAL_KEY!,
});

export type VideoGenResult = {
  videoUrl: string;
  taskId: string;
};

// Текст → Видео (Kling v3)
export async function generateVideo(prompt: string): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const result = await fal.subscribe('fal-ai/kling-video/v3/standard/text-to-video', {
    input: {
      prompt,
      duration: 5,
      aspect_ratio: '9:16',
    },
  });

  const data = result.data as any;
  return {
    videoUrl: data.video?.url ?? '',
    taskId: result.requestId ?? '',
  };
}

// Конвертация data URL → fal.ai hosted URL
async function ensureHttpUrl(url: string): Promise<string> {
  if (!url.startsWith('data:')) return url;
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Некорректный data URL');
  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');
  const blob = new Blob([buffer], { type: mimeType });
  return fal.storage.upload(blob);
}

// Картинка → Видео (Motion, Kling v3)
export async function generateMotion(
  imageUrl: string,
  prompt?: string
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const hostedUrl = await ensureHttpUrl(imageUrl);

  const result = await fal.subscribe('fal-ai/kling-video/v3/standard/image-to-video', {
    input: {
      start_image_url: hostedUrl,
      prompt: prompt ?? '',
      duration: 5,
    },
  });

  const data = result.data as any;
  return {
    videoUrl: data.video?.url ?? '',
    taskId: result.requestId ?? '',
  };
}

// TTS — текст в речь (Kling TTS v1)
export async function generateTTS(
  text: string,
  voiceId: string = 'oversea_male1',
  voiceSpeed: number = 1.0
): Promise<{ audioUrl: string }> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const result = await fal.subscribe('fal-ai/kling-video/v1/tts', {
    input: {
      text,
      voice_id: voiceId as any,
      voice_speed: voiceSpeed,
    },
  });

  const data = result.data as any;
  return { audioUrl: data.audio?.url ?? '' };
}

// Avatar — говорящая аватарка (Kling Avatar v2 Pro)
export async function generateAvatar(
  imageUrl: string,
  audioUrl: string
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const hostedImageUrl = await ensureHttpUrl(imageUrl);

  const result = await fal.subscribe('fal-ai/kling-video/ai-avatar/v2/pro', {
    input: {
      image_url: hostedImageUrl,
      audio_url: audioUrl,
    },
  });

  const data = result.data as any;
  return {
    videoUrl: data.video?.url ?? '',
    taskId: result.requestId ?? '',
  };
}
