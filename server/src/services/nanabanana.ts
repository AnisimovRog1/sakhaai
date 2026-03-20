// Генерация изображений через Gemini 2.5 Flash Image API
// Используем тот же GEMINI_API_KEY что и для чата

import { GoogleGenAI } from '@google/genai';

export type ImageGenResult = {
  imageUrl: string; // data:image/png;base64,... URL
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Текст → картинка
export async function generateImage(prompt: string): Promise<ImageGenResult> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY не задан');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: ['IMAGE'],
      maxOutputTokens: 8192,
      temperature: 1.0,
    },
  });

  // Извлекаем картинку из ответа
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

// Редактирование изображения (img2img): отправляем картинку + промпт
export async function editImage(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<ImageGenResult> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY не задан');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: imageBase64 } },
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
