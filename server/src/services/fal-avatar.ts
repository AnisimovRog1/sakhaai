// Avatar генерация через fal.ai (TTS + Avatar v2 Pro)
// Только для аватаров — остальное через Kling Direct

import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_KEY! });

const FAL_TIMEOUT = 1_800_000; // 30 мин

// Конвертация data: URL → fal.ai hosted URL
async function ensureHttpUrl(url: string): Promise<string> {
  if (!url.startsWith('data:')) return url;
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Некорректный data URL');
  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');
  const file = new File([buffer], `upload.${mimeType.split('/')[1] || 'png'}`, { type: mimeType });
  const hostedUrl = await fal.storage.upload(file);
  console.log(`[fal-avatar] uploaded: ${hostedUrl.substring(0, 80)}...`);
  return hostedUrl;
}

// TTS — текст → аудио
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
  const audioUrl = data.audio?.url;
  if (!audioUrl) {
    console.error('[fal-avatar] TTS пустой audioUrl:', JSON.stringify(data).substring(0, 300));
    throw new Error('Аудио не сгенерировано');
  }
  console.log('[fal-avatar] TTS ready:', audioUrl.substring(0, 60));
  return { audioUrl };
}

// Avatar — фото + аудио → говорящее видео
export async function generateAvatar(
  imageUrl: string,
  audioUrl: string,
  prompt?: string
): Promise<{ videoUrl: string }> {
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY не задан');

  const hostedImageUrl = await ensureHttpUrl(imageUrl);
  console.log('[fal-avatar] starting avatar generation');

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
  const videoUrl = data.video?.url;
  if (!videoUrl) {
    console.error('[fal-avatar] пустой videoUrl:', JSON.stringify(data).substring(0, 300));
    throw new Error('Видео аватара не сгенерировано');
  }
  console.log('[fal-avatar] avatar ready:', videoUrl.substring(0, 60));
  return { videoUrl };
}
