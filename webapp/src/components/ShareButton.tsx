import { useState } from 'react';
import { api } from '../api/client';

type Props = {
  userId: number;
  generationId: number;
};

export function ShareButton({ userId, generationId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    const tg = window.Telegram?.WebApp as any;

    // Способ 1: shareMessage (Bot API 8.0+) — нативный диалог с медиа
    if (tg?.shareMessage) {
      try {
        setLoading(true);
        const res = await api.prepareShare(generationId);
        if (res.preparedMessageId) {
          tg.shareMessage(res.preparedMessageId);
          return;
        }
      } catch (e) {
        console.error('[share] prepare failed:', e);
      } finally {
        setLoading(false);
      }
    }

    // Способ 2: switchInlineQuery — inline бот с превью
    if (tg?.switchInlineQuery) {
      tg.switchInlineQuery(`share_${userId}_${generationId}`, ['users', 'groups', 'channels']);
      return;
    }

    // Способ 3: fallback — текст + ссылка
    const apiUrl = import.meta.env.VITE_API_URL ?? 'https://sakhaai-production.up.railway.app';
    const url = `https://t.me/share/url?url=${encodeURIComponent(`${apiUrl}/s/${userId}/${generationId}`)}&text=${encodeURIComponent('Попробуй сам:')}`;
    tg?.openTelegramLink?.(url);
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl py-2.5 text-center text-sm font-bold text-amber-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
    >
      {loading ? 'Подготовка...' : '\u{1F381} Поделиться и получить бонус'}
    </button>
  );
}
