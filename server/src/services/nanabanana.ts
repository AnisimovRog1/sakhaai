// Генерация изображений через Gemini Image API
// Используем Vertex AI (Google Cloud $300 кредиты)

import { ai } from './genai-client';

export type ImageGenResult = {
  imageUrl: string; // data:image/png;base64,... URL
};

// Маппинг UI моделей → Gemini модели
const MODEL_MAP: Record<string, string> = {
  'nano-banana-pro': 'gemini-3-pro-image-preview',     // Самая мощная PRO модель
  'nano-banana-2':   'gemini-3.1-flash-image-preview',  // Новая быстрая Flash
};
const DEFAULT_MODEL = 'gemini-3.1-flash-image-preview';

function resolveModel(model?: string): string {
  return (model && MODEL_MAP[model]) || DEFAULT_MODEL;
}

// Перевод промпта на английский через Gemini (текстовая модель)
// Если промпт уже на английском — возвращает как есть
export async function translateToEnglish(prompt: string): Promise<string> {
  // Быстрая проверка — если >80% ASCII символов, скорее всего уже EN
  const asciiRatio = prompt.replace(/[^\x00-\x7F]/g, '').length / prompt.length;
  if (asciiRatio > 0.8) return prompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [{ text: `You are a precise translator for AI image generation prompts. Translate the following prompt to English. Keep all technical terms, style descriptions, and specific instructions exactly as intended. Do NOT add or remove anything. Do NOT explain. Return ONLY the translated text.\n\nPrompt: ${prompt}` }],
      }],
    });
    const translated = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (translated && translated.length > 5) {
      console.log(`[nanabanana] translated: "${prompt.substring(0, 50)}" → "${translated.substring(0, 50)}"`);
      return translated;
    }
  } catch (err) {
    console.error('[nanabanana] translation failed:', (err as Error).message);
  }
  return prompt; // fallback — оригинал
}

// Retry при IMAGE_SAFETY / IMAGE_RECITATION (до 2 повторов)
const RETRYABLE_REASONS = ['IMAGE_SAFETY', 'IMAGE_RECITATION', 'SAFETY'];
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = (err as Error).message || '';
      const isRetryable = RETRYABLE_REASONS.some(r => msg.includes(r));
      if (!isRetryable || attempt === maxRetries) throw err;
      console.log(`[nanabanana] retry ${attempt + 1}/${maxRetries} after: ${msg.substring(0, 60)}`);
    }
  }
  throw new Error('Unexpected');
}

// Добавить инструкции по aspect ratio и resolution в промпт
function enrichPrompt(prompt: string, aspectRatio?: string, resolution?: string): string {
  const parts = [prompt];
  if (aspectRatio && aspectRatio !== '1:1') {
    parts.push(`[Aspect ratio: ${aspectRatio}]`);
  }
  if (resolution && resolution !== '1K') {
    parts.push(`[Resolution: ${resolution}]`);
  }
  return parts.join(' ');
}

// Текст → картинка
export async function generateImage(prompt: string, model?: string, aspectRatio?: string, resolution?: string): Promise<ImageGenResult> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CREDENTIALS_JSON) throw new Error('Нет credentials для Gemini (ни API key, ни Vertex AI)');

  const translated = await translateToEnglish(prompt);
  const fullPrompt = enrichPrompt(translated, aspectRatio, resolution);

  return withRetry(async () => {

  const response = await ai.models.generateContent({
    model: resolveModel(model),
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: {
      responseModalities: ['IMAGE'],
      maxOutputTokens: 8192,
      temperature: 1.0,
    },
  });

  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts;

  if (!parts || !parts.some((p: any) => p.inlineData?.data)) {
    const finishReason = candidate?.finishReason;
    const textParts = parts?.filter((p: any) => p.text).map((p: any) => p.text).join(' ');
    console.error('[generateImage] Gemini отказ:', finishReason, textParts?.substring(0, 200));
    throw new Error(textParts
      ? `Gemini: ${textParts.substring(0, 100)}`
      : 'Gemini не вернул изображение. Попробуйте другой промпт.');
  }

  for (const part of parts) {
    if (part.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || 'image/png';
      const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
      return { imageUrl };
    }
  }

  throw new Error('Gemini не вернул изображение. Попробуйте другой промпт.');
  }); // withRetry
}

// Редактирование изображения (img2img): отправляем картинки-референсы + промпт
export async function editImage(
  images: Array<{ base64: string; mimeType: string }>,
  prompt: string,
  model?: string,
  aspectRatio?: string,
  resolution?: string
): Promise<ImageGenResult> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CREDENTIALS_JSON) throw new Error('Нет credentials для Gemini (ни API key, ни Vertex AI)');
  if (images.length === 0) throw new Error('Нужно хотя бы одно изображение');

  const translated = await translateToEnglish(prompt);
  const fullPrompt = enrichPrompt(translated, aspectRatio, resolution);
  const imageParts = images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 },
  }));

  return withRetry(async () => {
  const response = await ai.models.generateContent({
    model: resolveModel(model),
    contents: [{
      parts: [
        { text: fullPrompt },
        ...imageParts,
      ],
    }],
    config: {
      responseModalities: ['IMAGE'],
      maxOutputTokens: 8192,
      temperature: 1.0,
    },
  });

  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts;

  // Логируем отказ если нет картинки
  if (!parts || !parts.some((p: any) => p.inlineData?.data)) {
    const finishReason = candidate?.finishReason;
    const textParts = parts?.filter((p: any) => p.text).map((p: any) => p.text).join(' ');
    console.error('[editImage] Gemini отказ:', finishReason, textParts?.substring(0, 200));
    throw new Error(textParts
      ? `Gemini: ${textParts.substring(0, 100)}`
      : 'Gemini не вернул изображение. Попробуйте другой промпт.');
  }

  for (const part of parts) {
    if (part.inlineData?.data) {
      const outMime = part.inlineData.mimeType || 'image/png';
      const imageUrl = `data:${outMime};base64,${part.inlineData.data}`;
      return { imageUrl };
    }
  }

  throw new Error('Gemini не вернул изображение. Попробуйте другой промпт.');
  }); // withRetry
}
