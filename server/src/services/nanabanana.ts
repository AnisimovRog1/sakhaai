// Генерация изображений через Gemini 2.5 Flash Image API
// Используем тот же GEMINI_API_KEY что и для чата

import { GoogleGenAI } from '@google/genai';

export type ImageGenResult = {
  imageUrl: string; // data:image/png;base64,... URL
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Маппинг UI моделей → Gemini модели
const MODEL_MAP: Record<string, string> = {
  'nano-banana-pro': 'gemini-3-pro-image-preview',     // Самая мощная PRO модель
  'nano-banana-2':   'gemini-3.1-flash-image-preview',  // Новая быстрая Flash
};
const DEFAULT_MODEL = 'gemini-3.1-flash-image-preview';

function resolveModel(model?: string): string {
  return (model && MODEL_MAP[model]) || DEFAULT_MODEL;
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
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY не задан');

  const fullPrompt = enrichPrompt(prompt, aspectRatio, resolution);

  const response = await ai.models.generateContent({
    model: resolveModel(model),
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: {
      responseModalities: ['IMAGE'],
      maxOutputTokens: 8192,
      temperature: 1.0,
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('Gemini не вернул изображение');

  for (const part of parts) {
    if (part.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || 'image/png';
      const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
      return { imageUrl };
    }
  }

  throw new Error('Gemini не вернул изображение');
}

// Редактирование изображения (img2img): отправляем картинки-референсы + промпт
export async function editImage(
  images: Array<{ base64: string; mimeType: string }>,
  prompt: string,
  model?: string,
  aspectRatio?: string,
  resolution?: string
): Promise<ImageGenResult> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY не задан');
  if (images.length === 0) throw new Error('Нужно хотя бы одно изображение');

  const fullPrompt = enrichPrompt(prompt, aspectRatio, resolution);
  const imageParts = images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 },
  }));

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

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('Gemini не вернул изображение');

  for (const part of parts) {
    if (part.inlineData?.data) {
      const outMime = part.inlineData.mimeType || 'image/png';
      const imageUrl = `data:${outMime};base64,${part.inlineData.data}`;
      return { imageUrl };
    }
  }

  throw new Error('Gemini не вернул изображение');
}
