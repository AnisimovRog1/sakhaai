// Генерация видео через fal.ai + Kling
// Требуется FAL_KEY в переменных окружения

import { fal } from '@fal-ai/client';

// Конфигурация fal.ai
fal.config({
  credentials: process.env.FAL_KEY!,
});

// 10 минут — максимальное время ожидания генерации видео (совпадает с Express)
const FAL_TIMEOUT = 600_000;

export type VideoGenResult = {
  videoUrl: string;
  taskId: string;
};

// Маппинг UI моделей + mode → fal.ai endpoints
function getVideoEndpoint(model: string, mode: string): string {
  const tier = mode === '1080p' ? 'pro' : 'standard';
  const map: Record<string, Record<string, string>> = {
    'video-3.0':       { standard: 'fal-ai/kling-video/v3/standard/text-to-video',       pro: 'fal-ai/kling-video/v3/pro/text-to-video' },
    'video-2.6':       { standard: 'fal-ai/kling-video/v2.6/standard/text-to-video',     pro: 'fal-ai/kling-video/v2.6/pro/text-to-video' },
    'video-2.5-turbo': { standard: 'fal-ai/kling-video/v2.5-turbo/standard/text-to-video', pro: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video' },
  };
  return map[model]?.[tier] || 'fal-ai/kling-video/v3/standard/text-to-video';
}

function getMotionEndpoint(model: string, mode: string): string {
  const tier = mode === '1080p' ? 'pro' : 'standard';
  const map: Record<string, Record<string, string>> = {
    'video-3.0':       { standard: 'fal-ai/kling-video/v3/standard/image-to-video',       pro: 'fal-ai/kling-video/v3/pro/image-to-video' },
    'video-2.6':       { standard: 'fal-ai/kling-video/v2.6/standard/image-to-video',     pro: 'fal-ai/kling-video/v2.6/pro/image-to-video' },
    'video-2.5-turbo': { standard: 'fal-ai/kling-video/v2.5-turbo/standard/image-to-video', pro: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video' },
  };
  return map[model]?.[tier] || 'fal-ai/kling-video/v3/standard/image-to-video';
}

function getMotionControlEndpoint(model: string): string {
  const map: Record<string, string> = {
    'video-3.0':       'fal-ai/kling-video/v3/standard/motion-control',
    'video-2.6':       'fal-ai/kling-video/v2.6/standard/motion-control',
    'video-2.5-turbo': 'fal-ai/kling-video/v2.5-turbo/standard/motion-control',
  };
  return map[model] || 'fal-ai/kling-video/v3/standard/motion-control';
}

// Текст → Видео
export async function generateVideo(
  prompt: string,
  duration: number = 5,
  model?: string,
  mode?: string,
  aspectRatio?: string,
  generateAudio?: boolean,
  startImageUrl?: string
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const endpoint = getVideoEndpoint(model || 'video-3.0', mode || '720p');

  const input: Record<string, any> = {
    prompt,
    duration,
    aspect_ratio: aspectRatio || '9:16',
  };
  if (generateAudio) input.generate_audio = true;
  if (startImageUrl) input.start_image_url = startImageUrl;

  const result = await fal.subscribe(endpoint as any, {
    input,
    timeout: FAL_TIMEOUT,
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
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const file = new File([buffer], `upload.${mimeType.split('/')[1] || 'png'}`, { type: mimeType });
    const hostedUrl = await fal.storage.upload(file);
    console.log(`[ensureHttpUrl] uploaded: ${hostedUrl.substring(0, 80)}...`);
    return hostedUrl;
  } catch (err) {
    console.error('[ensureHttpUrl] upload failed:', err);
    throw new Error(`Ошибка загрузки файла: ${(err as Error).message}`);
  }
}

// Картинка → Видео (Image-to-Video)
export async function generateMotion(
  imageUrl: string,
  prompt?: string,
  duration: number = 5,
  model?: string,
  mode?: string
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const hostedUrl = await ensureHttpUrl(imageUrl);
  const endpoint = getMotionEndpoint(model || 'video-3.0', mode || '720p');

  const result = await fal.subscribe(endpoint as any, {
    input: {
      image_url: hostedUrl,
      prompt: prompt ?? '',
      duration,
    },
    timeout: FAL_TIMEOUT,
  });

  const data = result.data as any;
  return {
    videoUrl: data.video?.url ?? '',
    taskId: result.requestId ?? '',
  };
}

// Motion Control — персонаж из фото повторяет движения из видео
export async function generateMotionControl(
  imageUrl: string,
  videoUrl: string,
  characterOrientation: 'video' | 'image',
  model?: string
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const hostedImageUrl = await ensureHttpUrl(imageUrl);
  const hostedVideoUrl = await ensureHttpUrl(videoUrl);
  const endpoint = getMotionControlEndpoint(model || 'video-3.0');

  const result = await fal.subscribe(endpoint as any, {
    input: {
      image_url: hostedImageUrl,
      video_url: hostedVideoUrl,
      character_orientation: characterOrientation,
    },
    timeout: FAL_TIMEOUT,
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
    timeout: FAL_TIMEOUT,
  });

  const data = result.data as any;
  return { audioUrl: data.audio?.url ?? '' };
}

// Avatar — говорящая аватарка (Kling Avatar v2 Pro)
export async function generateAvatar(
  imageUrl: string,
  audioUrl: string,
  prompt?: string
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const hostedImageUrl = await ensureHttpUrl(imageUrl);

  const input: Record<string, any> = {
    image_url: hostedImageUrl,
    audio_url: audioUrl,
  };
  if (prompt) input.prompt = prompt;

  const result = await fal.subscribe('fal-ai/kling-video/ai-avatar/v2/pro', {
    input,
    timeout: FAL_TIMEOUT,
  });

  const data = result.data as any;
  return {
    videoUrl: data.video?.url ?? '',
    taskId: result.requestId ?? '',
  };
}
