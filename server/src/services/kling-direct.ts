// Прямое подключение к Kling AI API (без прокси fal.ai)
// Используется для motion-control — быстрее и надёжнее

import jwt from 'jsonwebtoken';

const BASE_URL = 'https://api-singapore.klingai.com';

// Конвертация data: URL → чистый base64 (без префикса data:...;base64,)
// Kling принимает: HTTP URL или raw base64. НЕ принимает data: URL с префиксом.
function prepareFileUrl(url: string): string {
  if (!url.startsWith('data:')) return url; // HTTP URL — пропускаем

  const match = url.match(/^data:[^;]+;base64,(.+)$/);
  if (!match) throw new Error('Некорректный data URL');

  const base64 = match[1];
  console.log(`[kling-direct] converted data URL → raw base64 (${(base64.length / 1024).toFixed(0)} KB)`);
  return base64;
}

// ─── JWT авторизация ───────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

function getToken(): string {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiry > now + 300) return cachedToken;

  const ak = process.env.KLING_ACCESS_KEY;
  const sk = process.env.KLING_SECRET_KEY;
  if (!ak || !sk) throw new Error('KLING_ACCESS_KEY/KLING_SECRET_KEY не заданы');

  cachedToken = jwt.sign(
    { iss: ak, exp: now + 1800, nbf: now - 5 },
    sk,
    { algorithm: 'HS256', header: { alg: 'HS256', typ: 'JWT' } }
  );
  tokenExpiry = now + 1800;
  return cachedToken;
}

// ─── HTTP запросы к Kling API ──────────────────────────────
async function klingRequest(method: 'GET' | 'POST', path: string, body?: any): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data: any = await res.json();
  console.log(`[kling-direct] ${method} ${path} → ${res.status}, code: ${data.code}`);

  if (!res.ok || data.code !== 0) {
    console.error('[kling-direct] error:', JSON.stringify(data).substring(0, 500));
    throw new Error(data.message || `Kling API error ${res.status}`);
  }

  return data;
}

// ─── Motion Control ────────────────────────────────────────

// Submit motion-control задачу
export async function submitMotionControlDirect(
  imageUrl: string,
  videoUrl: string,
  characterOrientation: 'video' | 'image',
  mode?: string
): Promise<{ taskId: string }> {
  console.log('[kling-direct] submitting motion-control, orientation:', characterOrientation, 'mode:', mode || 'std');

  // data: URL → raw base64 (без префикса), HTTP URL → как есть
  const preparedImage = prepareFileUrl(imageUrl);
  const preparedVideo = prepareFileUrl(videoUrl);

  const result = await klingRequest('POST', '/v1/videos/motion-control', {
    image_url: preparedImage,
    video_url: preparedVideo,
    character_orientation: characterOrientation,
    mode: mode === '1080p' ? 'pro' : 'std',
    model_name: 'kling-v3',
  });

  const taskId = result.data?.task_id;
  if (!taskId) {
    console.error('[kling-direct] no task_id in response:', JSON.stringify(result).substring(0, 300));
    throw new Error('Не получен task_id от Kling');
  }

  console.log('[kling-direct] task submitted:', taskId);
  return { taskId };
}

// Проверить статус + получить видео если готово
export async function checkMotionStatusDirect(taskId: string): Promise<{
  status: 'submitted' | 'processing' | 'succeed' | 'failed';
  videoUrl?: string;
  errorMsg?: string;
}> {
  const result = await klingRequest('GET', `/v1/videos/motion-control/${taskId}`);

  const task = result.data;
  const status = task?.task_status as 'submitted' | 'processing' | 'succeed' | 'failed';
  console.log(`[kling-direct] task ${taskId} status: ${status}`);

  if (status === 'succeed') {
    const videoUrl = task?.task_result?.videos?.[0]?.url;
    if (!videoUrl) {
      console.error('[kling-direct] succeed but no video URL:', JSON.stringify(task).substring(0, 300));
      return { status: 'failed', errorMsg: 'Видео не найдено в результате' };
    }
    console.log('[kling-direct] video ready:', videoUrl.substring(0, 80));
    return { status: 'succeed', videoUrl };
  }

  if (status === 'failed') {
    console.error('[kling-direct] task failed:', task?.task_status_msg);
    return { status: 'failed', errorMsg: task?.task_status_msg || 'Ошибка генерации' };
  }

  return { status };
}
