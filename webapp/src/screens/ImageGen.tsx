import { useState } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

type Props = {
  user: User;
  onCreditsUpdate: (credits: number) => void;
};

const IMAGE_COST = 79;

const EXAMPLES = [
  'Якутская природа, лиственницы в инее, северное сияние',
  'Портрет якутского шамана в традиционном костюме',
  'Современный Якутск зимой, −50 градусов',
];

export function ImageGen({ user, onCreditsUpdate }: Props) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = prompt.trim().length > 0 && user.credits >= IMAGE_COST && !loading;

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const result = await api.generateImage(prompt.trim());
      setImageUrl(result.imageUrl);
      onCreditsUpdate(result.creditsLeft);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 space-y-4 pb-6">

      {/* Header */}
      <div className="pt-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Генерация картинок</h1>
          <p className="text-slate-400 text-xs font-medium">Powered by NanaBanana</p>
        </div>
      </div>

      {/* Balance bar */}
      <div className="flex justify-between items-center bg-white/[0.06] border border-white/[0.10] rounded-xl px-4 py-3">
        <span className="text-slate-300 text-sm font-medium">
          Баланс: <span className="text-white font-bold">{user.credits.toLocaleString('ru')} кр.</span>
        </span>
        <span className="text-xs font-bold text-red-400">
          {IMAGE_COST} кр.
        </span>
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <label className="text-slate-300 text-xs font-semibold uppercase tracking-[0.12em]">Опиши изображение</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Якутская женщина в национальном костюме на фоне северного сияния..."
          rows={4}
          className="w-full bg-white/[0.06] border border-white/[0.10] rounded-2xl p-4 text-sm font-medium resize-none outline-none placeholder-slate-500 text-white focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={!canGenerate}
        className="w-full rounded-2xl py-4 font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:scale-100 bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/>
              <path d="M12 3a9 9 0 019 9"/>
            </svg>
            Генерирую...
          </span>
        ) : user.credits < IMAGE_COST ? (
          'Недостаточно кредитов'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Сгенерировать
          </span>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading placeholder */}
      {loading && !imageUrl && (
        <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl aspect-square flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto">
              <svg className="animate-pulse" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Создаю изображение...</p>
            <p className="text-slate-500 text-xs font-medium">Обычно 10–30 секунд</p>
          </div>
        </div>
      )}

      {/* Result */}
      {imageUrl && (
        <div className="space-y-3">
          <img
            src={imageUrl}
            alt="Сгенерированное изображение"
            className="w-full rounded-2xl shadow-xl shadow-black/40"
          />
          <div className="flex gap-2">
            <a
              href={imageUrl}
              download="uraanxai-image.png"
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
              onClick={() => { setImageUrl(null); setPrompt(''); }}
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

      {/* Examples */}
      {!imageUrl && !loading && (
        <div className="space-y-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.12em]">Попробуй:</p>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="w-full text-left bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-slate-300 font-medium active:bg-white/[0.08] transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
