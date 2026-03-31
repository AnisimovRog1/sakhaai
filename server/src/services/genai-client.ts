// Единая инициализация Google GenAI
// Используется всеми сервисами: чат, картинки, названия чатов
// Ключ от Google Cloud проекта где $300 кредитов

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('[genai] GEMINI_API_KEY не задан!');
}

export const ai = new GoogleGenAI({ apiKey: apiKey! });

console.log('[genai] Инициализация через API key');
