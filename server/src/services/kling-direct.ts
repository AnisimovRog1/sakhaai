// Прямое подключение к Kling AI API (без прокси fal.ai)
// Используется для motion-control — быстрее и надёжнее

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const BASE_URL = 'https://api-singapore.klingai.com';

// ─── Временное хранилище файлов (в памяти сервера) ─────────
// Kling скачивает файлы по HTTP URL → мы храним их временно и отдаём
const tempFiles = new Map<string, { buffer: Buffer; mime: string; createdAt: number }>();

// Автоочистка: удаляем файлы старше 10 минут каждые 2 минуты
setInterval(() => {
  const now = Date.now();
  for (const [id, file] of tempFiles) {
    if (now - file.createdAt > 10 * 60 * 1000) tempFiles.delete(id);
  }
}, 2 * 60 * 1000);

// Отдать файл по HTTP (вызывается из Express роута)
export function serveTempFile(id: string): { buffer: Buffer; mime: string } | null {
  return tempFiles.get(id) || null;
}

// Конвертация data: URL → временный HTTP URL на нашем сервере
function dataUrlToTempUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) return dataUrl; // уже HTTP — пропускаем

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Некорректный data URL');

  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');
  const ext = mimeType.split('/')[1] || 'bin';
  const id = crypto.randomUUID();

  tempFiles.set(id, { buffer, mime: mimeType, createdAt: Date.now() });

  // Публичный URL нашего сервера
  const serverUrl = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : process.env.VITE_API_URL || 'https://sakhaai-production.up.railway.app';

  const url = `${serverUrl}/tmp-upload/${id}.${ext}`;
  console.log(`[kling-direct] temp file: ${url} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return url;
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

  // Конвертировать data URL → HTTP URL на нашем сервере (бесплатно)
  const httpImageUrl = dataUrlToTempUrl(imageUrl);
  const httpVideoUrl = dataUrlToTempUrl(videoUrl);

  const result = await klingRequest('POST', '/v1/videos/motion-control', {
    image_url: httpImageUrl,
    video_url: httpVideoUrl,
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
