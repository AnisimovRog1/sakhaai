import { ai } from './genai-client';
import { memCache } from '../db/redis';

// Тип одного сообщения в истории чата
export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

// Лимит бесплатного Google Search grounding (Paid Tier: 1500/день)
// После лимита поиск отключается (не передаём googleSearch tool → $0)
const DAILY_GROUNDING_LIMIT = 1500;

async function canUseGrounding(): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `grounding:${today}`;
  const cached = await memCache.get(key);
  const count = cached ? parseInt(cached, 10) : 0;
  return count < DAILY_GROUNDING_LIMIT;
}

async function incrementGrounding(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `grounding:${today}`;
  await memCache.incr(key, 86400);
}

// Системный промпт: AI отвечает ТОЛЬКО на русском
function buildSystemPrompt(): string {
  return `Ты — UraanxAI, умный AI-ассистент. Отвечай ТОЛЬКО на русском языке. Всегда. Независимо от языка вопроса — отвечай по-русски. Будь краток, полезен и дружелюбен. Если пользователь отправил изображение или файл — проанализируй его и ответь на русском. НИКОГДА не используй markdown-разметку: без **, без *, без #, без списков с тире. Пиши чистый текст без форматирования.`;
}

// Главная функция: принимает историю, сообщение, опционально вложения
export async function sendToGemini(
  history: ChatMessage[],
  userMessage: string,
  _language: string,
  attachments?: { mimeType: string; base64: string }[]
): Promise<string> {
  const recentHistory = history.slice(-50);

  const contents = recentHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  // Формируем parts для текущего сообщения (текст + вложения)
  const userParts: any[] = [];
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      userParts.push({
        inlineData: { mimeType: att.mimeType, data: att.base64 },
      });
    }
  }
  if (userMessage.trim()) {
    userParts.push({ text: userMessage });
  }
  if (userParts.length === 0) {
    userParts.push({ text: 'Что на этом изображении?' });
  }

  contents.push({ role: 'user', parts: userParts });

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

  if (useGrounding) {
    await incrementGrounding();
  }

  return response.text ?? 'Извини, не смог сгенерировать ответ.';
}
