import { GoogleGenAI } from '@google/genai';

// Тип одного сообщения в истории чата
export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Системный промпт: AI определяет язык сообщения и отвечает на том же
function buildSystemPrompt(_language: string): string {
  return `Ты — UraanxAI, умный AI-ассистент из Якутии (Республика Саха).

ГЛАВНОЕ ПРАВИЛО ЯЗЫКА:
- Если пользователь пишет на якутском (саха тыла) — отвечай ТОЛЬКО на якутском языке.
- Если пользователь пишет на русском — отвечай ТОЛЬКО на русском языке.
- Если пользователь пишет на другом языке — отвечай на том же языке.
- Никогда не переключай язык, если пользователь сам не попросит.

Ты хорошо знаешь культуру, историю и традиции народа Саха.
Ты свободно владеешь якутским (саха тыла) и русским языками.
Будь краток, полезен и дружелюбен.`;
}

// Главная функция: принимает историю сообщений, возвращает ответ Gemini
export async function sendToGemini(
  history: ChatMessage[],
  userMessage: string,
  language: string
): Promise<string> {
  // Берём последние 6 сообщений как контекст (3 пары вопрос/ответ)
  const recentHistory = history.slice(-6);

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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: buildSystemPrompt(language),
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });

  return response.text ?? 'Извини, не смог сгенерировать ответ.';
}
