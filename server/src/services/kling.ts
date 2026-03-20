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

// Картинка → Видео (Motion, Kling v3)
export async function generateMotion(
  imageUrl: string,
  prompt?: string
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const result = await fal.subscribe('fal-ai/kling-video/v3/standard/image-to-video', {
    input: {
      start_image_url: imageUrl,
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

// Avatar — говорящая аватарка (Kling Avatar v2 Pro)
export async function generateAvatar(
  imageUrl: string,
  audioUrl: string
): Promise<VideoGenResult> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const result = await fal.subscribe('fal-ai/kling-video/ai-avatar/v2/pro', {
    input: {
      image_url: imageUrl,
      audio_url: audioUrl,
    },
  });

  const data = result.data as any;
  return {
    videoUrl: data.video?.url ?? '',
    taskId: result.requestId ?? '',
  };
}
