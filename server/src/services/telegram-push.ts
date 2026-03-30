// Telegram push-уведомления о готовности генерации

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = 'https://sakhaai-production.up.railway.app';

const TYPE_LABELS: Record<string, string> = {
  video: 'Видео',
  motion: 'Motion видео',
  'motion-control': 'Motion Control',
  avatar: 'Аватар',
  tts: 'Озвучка',
};

async function tgApi(method: string, body: Record<string, any>): Promise<boolean> {
  if (!BOT_TOKEN) { console.warn('[tg-push] BOT_TOKEN not set'); return false; }
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`[tg-push] ${method} failed:`, err.substring(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[tg-push] ${method} error:`, (e as Error).message);
    return false;
  }
}

export async function sendTelegramPush(
  userId: number,
  taskType: string,
  status: 'succeed' | 'failed',
  resultUrl?: string,
  prompt?: string,
  errorMsg?: string
): Promise<void> {
  const label = TYPE_LABELS[taskType] || taskType;
  const openButton = {
    inline_keyboard: [[{ text: 'Открыть UraanxAI', web_app: { url: WEBAPP_URL } }]],
  };

  if (status === 'succeed' && resultUrl) {
    // Для видео — отправляем видеофайл
    if (taskType !== 'tts') {
      const caption = `✅ ${label} готово!${prompt ? `\n📝 ${prompt.substring(0, 100)}` : ''}`;
      const sent = await tgApi('sendVideo', {
        chat_id: userId,
        video: resultUrl,
        caption,
        reply_markup: openButton,
      });
      if (sent) return;
      // Fallback to text if video send fails
    }

    // Текстовое сообщение (fallback или TTS)
    const text = `✅ ${label} готово!${prompt ? `\n📝 ${prompt.substring(0, 100)}` : ''}\n🔗 ${resultUrl}`;
    await tgApi('sendMessage', {
      chat_id: userId,
      text,
      reply_markup: openButton,
    });
  } else {
    // Ошибка
    const text = `❌ ${label}: ошибка генерации.\n${errorMsg || 'Неизвестная ошибка.'}\n💰 Кредиты возвращены на баланс.`;
    await tgApi('sendMessage', { chat_id: userId, text });
  }
}
