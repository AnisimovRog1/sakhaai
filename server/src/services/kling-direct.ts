// Прямое подключение к Kling AI API (без прокси fal.ai)
// Все генерации: text2video, image2video, motion-control, TTS, lip-sync (avatar)

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const BASE_URL = 'https://api-singapore.klingai.com';

// ─── Маппинг моделей UI → Kling API ────────────────────────
function resolveModelName(model?: string): string {
  const map: Record<string, string> = {
    'video-3.0': 'kling-v2-master',
    'video-2.6': 'kling-v2-6',
    'video-2.5-turbo': 'kling-v2-5-turbo',
  };
  return map[model || 'video-3.0'] || 'kling-v2-master';
}

function resolveMode(mode?: string): 'pro' | 'std' {
  return mode === '1080p' ? 'pro' : 'std';
}

// ─── Временное хранилище файлов ────────────────────────────
// Kling скачивает файлы по HTTP URL → храним временно на нашем сервере
const tempFiles = new Map<string, { buffer: Buffer; mime: string; createdAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [id, file] of tempFiles) {
    if (now - file.createdAt > 60 * 60 * 1000) tempFiles.delete(id);
  }
}, 60_000);

export function serveTempFile(id: string): { buffer: Buffer; mime: string } | null {
  return tempFiles.get(id) || null;
}

// data: URL → HTTP URL на нашем сервере
function dataUrlToHttpUrl(url: string): string {
  if (!url.startsWith('data:')) return url;

  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Некорректный data URL');

  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');
  const ext = mimeType.split('/')[1] || 'bin';
  const id = crypto.randomUUID();

  tempFiles.set(id, { buffer, mime: mimeType, createdAt: Date.now() });

  const serverUrl = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'https://sakhaai-production.up.railway.app';

  const httpUrl = `${serverUrl}/tmp-upload/${id}.${ext}`;
  console.log(`[kling-direct] temp file hosted: ${httpUrl} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return httpUrl;
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
export async function klingRequest(method: 'GET' | 'POST', path: string, body?: any): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };

  if (body) console.log(`[kling-direct] ${method} ${path} body:`, JSON.stringify(body).substring(0, 500));

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data: any = await res.json();
  console.log(`[kling-direct] ${method} ${path} → ${res.status}, code: ${data.code}`);
  console.log(`[kling-direct] response:`, JSON.stringify(data).substring(0, 500));

  if (!res.ok || data.code !== 0) {
    console.error('[kling-direct] error:', JSON.stringify(data).substring(0, 500));
    throw new Error(data.message || `Kling API error ${res.status}`);
  }

  return data;
}

// ─── Хелпер: достать task_id из ответа ─────────────────────
function extractTaskId(result: any): string {
  const taskId = result.data?.task_id;
  if (!taskId) {
    console.error('[kling-direct] no task_id in response:', JSON.stringify(result).substring(0, 300));
    throw new Error('Не получен task_id от Kling');
  }
  console.log('[kling-direct] task submitted:', taskId);
  return taskId;
}

// ─── Text-to-Video ─────────────────────────────────────────
export async function submitTextToVideo(params: {
  prompt: string;
  duration?: number;
  model?: string;
  mode?: string;
  aspectRatio?: string;
  generateAudio?: boolean;
  startImageUrl?: string;
}): Promise<{ klingTaskId: string }> {
  console.log('[kling-direct] submitting text2video, model:', params.model, 'mode:', params.mode);

  const body: Record<string, any> = {
    prompt: params.prompt,
    duration: String(params.duration || 5),
    model_name: resolveModelName(params.model),
    mode: resolveMode(params.mode),
    aspect_ratio: params.aspectRatio || '9:16',
  };
  if (params.generateAudio) body.generate_audio = true;
  if (params.startImageUrl) {
    body.image_url = dataUrlToHttpUrl(params.startImageUrl);
  }

  const result = await klingRequest('POST', '/v1/videos/text2video', body);
  return { klingTaskId: extractTaskId(result) };
}

// ─── Image-to-Video ────────────────────────────────────────
export async function submitImageToVideo(params: {
  imageUrl: string;
  prompt?: string;
  duration?: number;
  model?: string;
  mode?: string;
}): Promise<{ klingTaskId: string }> {
  console.log('[kling-direct] submitting image2video, model:', params.model, 'mode:', params.mode);

  const httpImageUrl = dataUrlToHttpUrl(params.imageUrl);
  const body: Record<string, any> = {
    image_url: httpImageUrl,
    model_name: resolveModelName(params.model),
    mode: resolveMode(params.mode),
    duration: String(params.duration || 5),
  };
  if (params.prompt?.trim()) body.prompt = params.prompt.trim();

  const result = await klingRequest('POST', '/v1/videos/image2video', body);
  return { klingTaskId: extractTaskId(result) };
}

// ─── Motion Control ────────────────────────────────────────
export async function submitMotionControlDirect(
  imageUrl: string,
  videoUrl: string,
  characterOrientation: 'video' | 'image',
  mode?: string,
  prompt?: string
): Promise<{ taskId: string }> {
  console.log('[kling-direct] submitting motion-control, orientation:', characterOrientation, 'mode:', mode || 'std');

  const httpImageUrl = dataUrlToHttpUrl(imageUrl);
  const httpVideoUrl = dataUrlToHttpUrl(videoUrl);
  console.log('[kling-direct] image_url:', httpImageUrl.substring(0, 80));
  console.log('[kling-direct] video_url:', httpVideoUrl.substring(0, 80));

  const body: Record<string, any> = {
    image_url: httpImageUrl,
    video_url: httpVideoUrl,
    character_orientation: characterOrientation,
    mode: mode === '1080p' ? 'pro' : 'std',
    model_name: 'kling-v2-6',
  };
  if (prompt?.trim()) body.prompt = prompt.trim();

  const result = await klingRequest('POST', '/v1/videos/motion-control', body);
  return { taskId: extractTaskId(result) };
}

// ─── Lip Sync / Avatar (text2video mode) ───────────────────
// Пробуем несколько форматов — Kling API документация противоречива.
export async function submitAvatar(params: {
  imageUrl: string;
  text: string;
  voiceId?: string;
  voiceSpeed?: number;
  prompt?: string;
}): Promise<{ klingTaskId: string }> {
  console.log('[kling-direct] submitting avatar, voice:', params.voiceId);

  const httpImageUrl = dataUrlToHttpUrl(params.imageUrl);
  const text = params.text.substring(0, 120);
  const voiceId = params.voiceId || 'oversea_male1';
  const voiceSpeed = params.voiceSpeed ?? 1.0;

  // Формат 1: плоский (как text2video/image2video — наши рабочие endpoints)
  const bodies = [
    {
      mode: 'text2video',
      video_url: httpImageUrl,
      text,
      voice_id: voiceId,
      voice_speed: voiceSpeed,
      voice_language: 'en',
    },
    // Формат 2: вложенный input (MCP Kling SDK)
    {
      input: {
        mode: 'text2video',
        video_url: httpImageUrl,
        text,
        voice_id: voiceId,
        voice_speed: voiceSpeed,
        voice_language: 'en',
      },
    },
    // Формат 3: PiAPI стиль (tts_text вместо text)
    {
      input: {
        video_url: httpImageUrl,
        tts_text: text,
        tts_timbre: voiceId,
        tts_speed: voiceSpeed,
        local_dubbing_url: '',
      },
    },
  ];

  for (let i = 0; i < bodies.length; i++) {
    try {
      console.log(`[kling-direct] lip-sync attempt ${i + 1}/3`);
      const result = await klingRequest('POST', '/v1/videos/lip-sync', bodies[i]);
      return { klingTaskId: extractTaskId(result) };
    } catch (err) {
      console.error(`[kling-direct] lip-sync format ${i + 1} failed:`, (err as Error).message);
      if (i === bodies.length - 1) throw err; // последний — пробросить ошибку
    }
  }
  throw new Error('Все форматы lip-sync отклонены');
}

// Whitelist допустимых Kling API endpoints для polling
const ALLOWED_ENDPOINTS = new Set([
  '/v1/videos/text2video',
  '/v1/videos/image2video',
  '/v1/videos/motion-control',
  '/v1/videos/lip-sync',
]);

// ─── Универсальная проверка статуса ────────────────────────
export async function checkTaskStatus(klingEndpoint: string, klingTaskId: string): Promise<{
  status: 'submitted' | 'processing' | 'succeed' | 'failed';
  resultUrl?: string;
  errorMsg?: string;
}> {
  if (!ALLOWED_ENDPOINTS.has(klingEndpoint)) {
    throw new Error(`Недопустимый endpoint: ${klingEndpoint}`);
  }

  const result = await klingRequest('GET', `${klingEndpoint}/${klingTaskId}`);
  const task = result.data;
  const status = task?.task_status as string;

  if (status === 'succeed') {
    // Videos: task_result.videos[0].url, Audio/TTS: task_result.audios[0].url
    const videoUrl = task?.task_result?.videos?.[0]?.url;
    const audioUrl = task?.task_result?.audios?.[0]?.url;
    const resultUrl = videoUrl || audioUrl;
    if (!resultUrl) {
      console.error('[kling-direct] succeed but no result URL:', JSON.stringify(task).substring(0, 300));
      return { status: 'failed', errorMsg: 'Результат не найден' };
    }
    console.log('[kling-direct] result ready:', resultUrl.substring(0, 80));
    return { status: 'succeed', resultUrl };
  }

  if (status === 'failed') {
    console.error('[kling-direct] task failed:', task?.task_status_msg);
    return { status: 'failed', errorMsg: task?.task_status_msg || 'Ошибка генерации' };
  }

  return { status: status as 'submitted' | 'processing' };
}

// ─── Legacy: checkMotionStatusDirect (backward compat) ─────
export async function checkMotionStatusDirect(taskId: string): Promise<{
  status: 'submitted' | 'processing' | 'succeed' | 'failed';
  videoUrl?: string;
  errorMsg?: string;
}> {
  const result = await checkTaskStatus('/v1/videos/motion-control', taskId);
  return {
    status: result.status,
    videoUrl: result.resultUrl,
    errorMsg: result.errorMsg,
  };
}
