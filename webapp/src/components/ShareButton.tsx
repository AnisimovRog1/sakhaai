type Props = {
  userId: number;
  generationId: number;
};

export function ShareButton({ userId, generationId }: Props) {
  const botUsername = import.meta.env.VITE_BOT_USERNAME ?? 'UraanxAI_bot';
  const deepLink = `https://t.me/${botUsername}?start=share_${userId}_${generationId}`;
  const shareText = 'Смотри, что я создал с помощью нейросети! \u{1F680}\nПопробуй сам:';

  function handleShare() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(shareText)}`;
    window.Telegram?.WebApp?.openTelegramLink?.(url);
  }

  return (
    <button
      onClick={handleShare}
      className="flex-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl py-2.5 text-center text-sm font-bold text-amber-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5"
    >
      <span>{'🎁'}</span>
      <span>{'+50 💎'}</span>
    </button>
  );
}
