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

const TABS: Record<Tab, { label: string; desc: string; colorBg: string; colorBorder: string; stroke: string; icon: React.ReactNode }> = {
  video: {
    label: 'Видео',
    desc: 'Текст → Видео 3 сек',
    colorBg: 'bg-green-500/15',
    colorBorder: 'border-green-500/20',
    stroke: '#4ADE80',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="14" height="12" rx="2"/>
        <path d="M16 10l6-4v12l-6-4V10z"/>
      </svg>
    ),
  },
  motion: {
    label: 'Motion',
    desc: 'Картинка → Видео 3 сек',
    colorBg: 'bg-blue-500/15',
    colorBorder: 'border-blue-500/20',
    stroke: '#60A5FA',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  avatar: {
    label: 'Аватар',
    desc: 'Аватар говорит твой текст',
    colorBg: 'bg-yellow-500/15',
    colorBorder: 'border-yellow-500/20',
    stroke: '#FBBF24',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
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
      if (tab === 'video')        result = await api.generateVideo(prompt.trim());
      else if (tab === 'motion')  result = await api.generateMotion(imageUrl.trim(), prompt.trim() || undefined);
      else                        result = await api.generateAvatar(imageUrl.trim(), avatarText.trim());
      setVideoUrl(result.videoUrl);
      onCreditsUpdate(result.creditsLeft);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setVideoUrl(null); setPrompt(''); setImageUrl(''); setAvatarText(''); setError(null);
  }

  const inputClass = "w-full bg-white/[0.06] border border-white/[0.10] rounded-2xl p-4 text-sm font-medium resize-none outline-none placeholder-slate-500 text-white focus:border-blue-500/50 transition-colors";

  return (
    <div className="p-5 space-y-4 pb-6">

      {/* Header */}
      <div className="pt-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="14" height="12" rx="2"/>
            <path d="M16 10l6-4v12l-6-4V10z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Генерация видео</h1>
          <p className="text-slate-400 text-xs font-medium">Powered by Kling AI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/[0.05] border border-white/[0.10] rounded-2xl p-1 gap-1">
        {(Object.keys(TABS) as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => { setTab(t); reset(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 active:text-white'
              }`}
            >
              <span className={active ? 'text-white' : 'text-slate-400'}>
                {TABS[t].icon}
              </span>
              {TABS[t].label}
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className="flex items-center gap-2 px-1">
        <div className={`w-7 h-7 rounded-lg ${TABS[tab].colorBg} ${TABS[tab].colorBorder} border flex items-center justify-center`} style={{ color: TABS[tab].stroke }}>
          {TABS[tab].icon}
        </div>
        <p className="text-slate-300 text-sm font-medium">{TABS[tab].desc}</p>
      </div>

      {/* Balance bar */}
      <div className="flex justify-between items-center bg-white/[0.06] border border-white/[0.10] rounded-xl px-4 py-3">
        <span className="text-slate-300 text-sm font-medium">
          Баланс: <span className="text-white font-bold">{user.credits.toLocaleString('ru')} кр.</span>
        </span>
        <span className="text-xs font-bold text-green-400">
          {cost} кр.
        </span>
      </div>

      {/* Form */}
      {tab === 'video' && (
        <div className="space-y-2">
          <label className="text-slate-300 text-xs font-semibold uppercase tracking-[0.12em]">Опиши видео</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Якутская тайга зимой, снег падает, лоси идут сквозь лес..."
            rows={4}
            className={inputClass}
          />
        </div>
      )}

      {tab === 'motion' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-[0.12em]">URL изображения</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`${inputClass} !resize-none`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-[0.12em]">Описание движения (необязательно)</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Плавное колыхание ветра, снег падает..."
              className={`${inputClass} !resize-none`}
            />
          </div>
        </div>
      )}

      {tab === 'avatar' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-[0.12em]">URL фото аватара</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`${inputClass} !resize-none`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-[0.12em]">Текст (аватар произнесёт вслух)</label>
            <textarea
              value={avatarText}
              onChange={(e) => setAvatarText(e.target.value)}
              placeholder="Привет! Я UraanxAI — твой помощник на якутском и русском..."
              rows={3}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={!canGenerate}
        className="w-full rounded-2xl py-4 font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:scale-100 bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/>
              <path d="M12 3a9 9 0 019 9"/>
            </svg>
            Создаю видео...
          </span>
        ) : !hasCredits ? (
          'Недостаточно кредитов'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Создать {TABS[tab].label}
          </span>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl p-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
            <svg className="animate-pulse" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="14" height="12" rx="2"/>
              <path d="M16 10l6-4v12l-6-4V10z"/>
            </svg>
          </div>
          <p className="text-white text-sm font-semibold">Генерирую видео...</p>
          <p className="text-slate-400 text-xs font-medium">Обычно 1–3 минуты</p>
        </div>
      )}

      {/* Result */}
      {videoUrl && (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-2xl shadow-xl shadow-black/40"
            playsInline
          />
          <div className="flex gap-2">
            <a
              href={videoUrl}
              download="uraanxai-video.mp4"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-white/[0.08] border border-white/[0.10] rounded-xl py-3 text-center text-sm font-bold text-white active:bg-white/[0.12] transition-all flex items-center justify-center gap-1.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Скачать
            </a>
            <button
              onClick={reset}
              className="flex-1 bg-blue-500/15 border border-blue-500/20 rounded-xl py-3 text-sm font-bold text-blue-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Новое
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
