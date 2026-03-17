import { useState } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

type Props = {
  user: User;
  onCreditsUpdate: (credits: number) => void;
};

type Tab = 'video' | 'motion' | 'avatar';

const COSTS: Record<Tab, number> = {
  video:  608,
  motion: 608,
  avatar: 810,
};

const TAB_LABELS: Record<Tab, { icon: string; label: string; desc: string }> = {
  video:  { icon: '🎬', label: 'Видео',  desc: 'Текст → Видео 3 сек' },
  motion: { icon: '✨', label: 'Motion', desc: 'Картинка → Видео 3 сек' },
  avatar: { icon: '🗣️', label: 'Avatar', desc: 'Аватар говорит твой текст' },
};

export function VideoGen({ user, onCreditsUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('video');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [avatarText, setAvatarText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cost = COSTS[tab];
  const hasCredits = user.credits >= cost;

  const canGenerate = !loading && hasCredits && (
    (tab === 'video'  && prompt.trim().length > 0) ||
    (tab === 'motion' && imageUrl.trim().length > 0) ||
    (tab === 'avatar' && imageUrl.trim().length > 0 && avatarText.trim().length > 0)
  );

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      let result: { videoUrl: string; creditsLeft: number };

      if (tab === 'video') {
        result = await api.generateVideo(prompt.trim());
      } else if (tab === 'motion') {
        result = await api.generateMotion(imageUrl.trim(), prompt.trim() || undefined);
      } else {
        result = await api.generateAvatar(imageUrl.trim(), avatarText.trim());
      }

      setVideoUrl(result.videoUrl);
      onCreditsUpdate(result.creditsLeft);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setVideoUrl(null);
    setPrompt('');
    setImageUrl('');
    setAvatarText('');
    setError(null);
  }

  return (
    <div className="p-4 space-y-4">
      {/* Заголовок */}
      <div className="pt-2">
        <h1 className="text-xl font-bold">🎬 Генерация видео</h1>
        <p className="text-gray-400 text-sm mt-1">Powered by Kling AI</p>
      </div>

      {/* Табы */}
      <div className="flex bg-[#1a1d27] rounded-2xl p-1 gap-1">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); reset(); }}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
              tab === t
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 active:text-gray-200'
            }`}
          >
            {TAB_LABELS[t].icon} {TAB_LABELS[t].label}
          </button>
        ))}
      </div>

      {/* Баланс и стоимость */}
      <div className="flex justify-between items-center bg-[#1a1d27] rounded-xl px-4 py-3">
        <span className="text-gray-400 text-sm">
          Баланс: <span className="text-white font-medium">{user.credits.toLocaleString('ru')} кр.</span>
        </span>
        <span className="text-violet-400 text-sm font-medium">Стоимость: {cost} кр.</span>
      </div>

      {/* Форма — Видео */}
      {tab === 'video' && (
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Опиши видео</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Якутская тайга зимой, снег падает, лоси идут сквозь лес..."
            rows={4}
            className="w-full bg-[#1a1d27] rounded-2xl p-4 text-sm resize-none outline-none placeholder-gray-600 text-white"
          />
        </div>
      )}

      {/* Форма — Motion */}
      {tab === 'motion' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">URL исходного изображения</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-[#1a1d27] rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Описание движения (необязательно)</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Плавное движение ветра, колышущиеся ветки..."
              className="w-full bg-[#1a1d27] rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-600 text-white"
            />
          </div>
        </div>
      )}

      {/* Форма — Avatar */}
      {tab === 'avatar' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">URL фото аватара</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-[#1a1d27] rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Текст (аватар произнесёт вслух)</label>
            <textarea
              value={avatarText}
              onChange={(e) => setAvatarText(e.target.value)}
              placeholder="Привет! Я SakhaAI — твой помощник на якутском и русском языках..."
              rows={3}
              className="w-full bg-[#1a1d27] rounded-2xl p-4 text-sm resize-none outline-none placeholder-gray-600 text-white"
            />
          </div>
        </div>
      )}

      {/* Кнопка */}
      <button
        onClick={generate}
        disabled={!canGenerate}
        className="w-full bg-violet-600 rounded-2xl py-4 font-semibold text-lg disabled:opacity-40 active:bg-violet-700 transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Генерирую...
          </span>
        ) : !hasCredits ? (
          '❌ Недостаточно кредитов'
        ) : (
          `✨ Создать ${TAB_LABELS[tab].label}`
        )}
      </button>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Загрузка */}
      {loading && (
        <div className="bg-[#1a1d27] rounded-2xl p-8 flex flex-col items-center gap-3">
          <div className="text-4xl animate-pulse">🎬</div>
          <p className="text-gray-400 text-sm">Создаю видео...</p>
          <p className="text-gray-600 text-xs">Обычно 1–3 минуты</p>
        </div>
      )}

      {/* Результат */}
      {videoUrl && (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-2xl"
            playsInline
          />
          <div className="flex gap-2">
            <a
              href={videoUrl}
              download="sakhaai-video.mp4"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-[#1a1d27] rounded-xl py-3 text-center text-sm font-medium active:bg-[#22263a] transition-colors"
            >
              ⬇️ Скачать
            </a>
            <button
              onClick={reset}
              className="flex-1 bg-violet-600/20 rounded-xl py-3 text-sm font-medium text-violet-400 active:bg-violet-600/30 transition-colors"
            >
              🔄 Новое
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
