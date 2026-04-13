type Props = {
  userId: number;
  generationId: number;
};

export function ShareButton({ userId, generationId }: Props) {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'https://sakhaai-production.up.railway.app';
  const sharePageUrl = `${apiUrl}/s/${userId}/${generationId}`;
  const shareText = 'Смотри, что я создал с помощью нейросети! \u{1F680}\nПопробуй сам:';

  function handleShare() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent(shareText)}`;
    window.Telegram?.WebApp?.openTelegramLink?.(url);
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
