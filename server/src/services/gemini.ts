import { GoogleGenAI } from '@google/genai';

// Тип одного сообщения в истории чата
export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Системный промпт: задаёт личность бота и язык ответа
function buildSystemPrompt(language: string): string {
  if (language === 'sah') {
    return `Эн – SakhaAI, якутскай тылынан кэпсэтэр AI-ассистент.
Хоруйдарыңы якутскай тылынан биэр. Кыратык, чуолкайдык хоруй.
Якутскай норуот культуратын, историятын үчүгэйдик билэҕин.`;
  }
  return `Ты — SakhaAI, AI-ассистент с поддержкой якутского языка.
Отвечай на русском языке. Будь краток и по делу.
Ты хорошо знаешь культуру и историю Якутии.`;
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
