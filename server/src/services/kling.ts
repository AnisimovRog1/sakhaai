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

// Маппинг UI моделей → fal.ai endpoints
const VIDEO_MODEL_MAP: Record<string, string> = {
  'video-3.0':       'fal-ai/kling-video/v3/standard/text-to-video',
  'video-2.6':       'fal-ai/kling-video/v2.6/pro/text-to-video',
  'video-2.5-turbo': 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
};
const DEFAULT_VIDEO_MODEL = 'fal-ai/kling-video/v3/standard/text-to-video';

const MOTION_MODEL_MAP: Record<string, string> = {
  'video-3.0':       'fal-ai/kling-video/v3/standard/image-to-video',
  'video-2.6':       'fal-ai/kling-video/v2.6/pro/image-to-video',
  'video-2.5-turbo': 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
};
const DEFAULT_MOTION_MODEL = 'fal-ai/kling-video/v3/standard/image-to-video';

// Текст → Видео
export async function generateVideo(prompt: string, duration: number = 5, model?: string): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const endpoint = (model && VIDEO_MODEL_MAP[model]) || DEFAULT_VIDEO_MODEL;

  const result = await fal.subscribe(endpoint as any, {
    input: {
      prompt,
      duration,
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

// Картинка → Видео (Motion)
export async function generateMotion(
  imageUrl: string,
  prompt?: string,
  duration: number = 5
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const hostedUrl = await ensureHttpUrl(imageUrl);

  const result = await fal.subscribe(DEFAULT_MOTION_MODEL as any, {
    input: {
      start_image_url: hostedUrl,
      prompt: prompt ?? '',
      duration,
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
