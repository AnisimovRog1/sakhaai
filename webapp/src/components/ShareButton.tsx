type Props = {
  userId: number;
  generationId: number;
};

export function ShareButton({ userId, generationId }: Props) {
  function handleShare() {
    const tg = window.Telegram?.WebApp as any;
    const query = `share_${userId}_${generationId}`;

    // switchInlineQuery — открывает inline-режим бота с медиа-превью
    if (tg?.switchInlineQuery) {
      tg.switchInlineQuery(query, ['users', 'groups', 'channels']);
      return;
    }

    // Fallback для старых версий Telegram
    const apiUrl = import.meta.env.VITE_API_URL ?? 'https://sakhaai-production.up.railway.app';
    const sharePageUrl = `${apiUrl}/s/${userId}/${generationId}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent('\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u0430\u043c:')}`;
    tg?.openTelegramLink?.(url);
  }

  return (
    <button
      onClick={handleShare}
      className="flex-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl py-2.5 text-center text-sm font-bold text-amber-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5"
    >
      {'🎁 Поделиться и получить бонус'}
    </button>
  );
}
