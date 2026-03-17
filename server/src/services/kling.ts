// Сервис генерации видео через Kling AI API
// Документация: https://klingai.com/api-reference

export type VideoGenResult = {
  videoUrl: string;
  taskId: string;
};

type KlingHeaders = {
  'Authorization': string;
  'Content-Type': string;
};

function headers(): KlingHeaders {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) throw new Error('KLING_API_KEY не задан');
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

// Текст → Видео (3 сек)
export async function generateVideo(prompt: string): Promise<VideoGenResult> {
  const response = await fetch('https://api.klingai.com/v1/videos/text2video', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, duration: 3 }),
  });
  if (!response.ok) throw new Error('Ошибка Kling API (video)');
  const data = await response.json() as { video_url: string; task_id: string };
  return { videoUrl: data.video_url, taskId: data.task_id };
}

// Картинка → Видео (Motion, 3 сек)
export async function generateMotion(
  imageUrl: string,
  prompt?: string
): Promise<VideoGenResult> {
  const response = await fetch('https://api.klingai.com/v1/videos/image2video', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, prompt: prompt ?? '', duration: 3 }),
  });
  if (!response.ok) throw new Error('Ошибка Kling API (motion)');
  const data = await response.json() as { video_url: string; task_id: string };
  return { videoUrl: data.video_url, taskId: data.task_id };
}

// Avatar — говорящая аватарка
export async function generateAvatar(
  imageUrl: string,
  text: string
): Promise<VideoGenResult> {
  const response = await fetch('https://api.klingai.com/v1/videos/avatar', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, text }),
  });
  if (!response.ok) throw new Error('Ошибка Kling API (avatar)');
  const data = await response.json() as { video_url: string; task_id: string };
  return { videoUrl: data.video_url, taskId: data.task_id };
}
