import { ai } from './genai-client';
import { memCache } from '../db/redis';

// Тип одного сообщения в истории чата
export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

// Лимит бесплатного Google Search grounding (1500/день)
const DAILY_GROUNDING_LIMIT = 1500;

async function canUseGrounding(): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `grounding:${today}`;
  const cached = await memCache.get(key);
  const count = cached ? parseInt(cached, 10) : 0;
  return count < DAILY_GROUNDING_LIMIT;
}

async function incrementGrounding(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `grounding:${today}`;
  await memCache.incr(key, 86400); // TTL 24 часа
}

// Системный промпт: AI отвечает ТОЛЬКО на русском
function buildSystemPrompt(): string {
  return `Ты — UraanxAI, умный AI-ассистент. Отвечай ТОЛЬКО на русском языке. Всегда. Независимо от языка вопроса — отвечай по-русски. Будь краток, полезен и дружелюбен.`;
}

// Главная функция: принимает историю сообщений, возвращает ответ Gemini
export async function sendToGemini(
  history: ChatMessage[],
  userMessage: string,
  _language: string
): Promise<string> {
  // Берём последние 50 сообщений (25 пар вопрос/ответ)
  const recentHistory = history.slice(-50);

  // Формируем историю в формате Gemini API
  const contents = recentHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  // Добавляем новое сообщение пользователя
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  // Google Search grounding (до 1500/день бесплатно)
  const useGrounding = await canUseGrounding();
  const tools = useGrounding ? [{ googleSearch: {} }] : undefined;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: buildSystemPrompt(),
      maxOutputTokens: 1024,
      temperature: 0.7,
      tools,
    },
  });

  // Инкрементируем счётчик grounding
  if (useGrounding) {
    await incrementGrounding();
  }

  return response.text ?? 'Извини, не смог сгенерировать ответ.';
}
