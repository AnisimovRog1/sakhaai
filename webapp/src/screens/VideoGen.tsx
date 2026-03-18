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

const TABS: Record<Tab, { label: string; desc: string; color: string; stroke: string; icon: React.ReactNode }> = {
  video: {
    label: 'Видео',
    desc: 'Текст → Видео 3 сек',
    color: 'from-cyan-600/30 to-blue-600/30',
    stroke: '#22d3ee',
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
    color: 'from-violet-600/30 to-pink-600/30',
    stroke: '#a78bfa',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  avatar: {
    label: 'Аватар',
    desc: 'Аватар говорит твой текст',
    color: 'from-amber-600/30 to-orange-600/30',
    stroke: '#fbbf24',
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

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-sm resize-none outline-none placeholder-slate-600 text-slate-100 focus:border-violet-500/40 transition-colors";

  return (
    <div className="p-5 space-y-4 pb-6">

      {/* Header */}
      <div className="pt-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-white/[0.06] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="14" height="12" rx="2"/>
            <path d="M16 10l6-4v12l-6-4V10z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Генерация видео</h1>
          <p className="text-slate-500 text-xs">Powered by Kling AI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-2xl p-1 gap-1">
        {(Object.keys(TABS) as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => { setTab(t); reset(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20'
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <span className={active ? 'text-white' : 'text-slate-500'}>
                {TABS[t].icon}
              </span>
              {TABS[t].label}
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className="flex items-center gap-2 px-1">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${TABS[tab].color} flex items-center justify-center`} style={{ color: TABS[tab].stroke }}>
          {TABS[tab].icon}
        </div>
        <p className="text-slate-400 text-sm">{TABS[tab].desc}</p>
      </div>

      {/* Balance bar */}
      <div className="flex justify-between items-center bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
        <span className="text-slate-400 text-sm">
          Баланс: <span className="text-slate-100 font-semibold">{user.credits.toLocaleString('ru')} кр.</span>
        </span>
        <span className="text-xs font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          {cost} кр.
        </span>
      </div>

      {/* Form */}
      {tab === 'video' && (
        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-medium uppercase tracking-widest">Опиши видео</label>
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
            <label className="text-slate-400 text-xs font-medium uppercase tracking-widest">URL изображения</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`${inputClass} !resize-none`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-medium uppercase tracking-widest">Описание движения (необязательно)</label>
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
            <label className="text-slate-400 text-xs font-medium uppercase tracking-widest">URL фото аватара</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`${inputClass} !resize-none`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-medium uppercase tracking-widest">Текст (аватар произнесёт вслух)</label>
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
        className="w-full rounded-2xl py-4 font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-40 disabled:scale-100 bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25"
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
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center">
            <svg className="animate-pulse" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="14" height="12" rx="2"/>
              <path d="M16 10l6-4v12l-6-4V10z"/>
            </svg>
          </div>
          <p className="text-slate-300 text-sm font-medium">Генерирую видео...</p>
          <p className="text-slate-600 text-xs">Обычно 1–3 минуты</p>
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
              className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-xl py-3 text-center text-sm font-medium active:bg-white/[0.10] transition-all flex items-center justify-center gap-1.5"
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
              className="flex-1 bg-gradient-to-r from-violet-600/20 to-cyan-500/20 border border-violet-500/20 rounded-xl py-3 text-sm font-medium text-violet-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5"
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
