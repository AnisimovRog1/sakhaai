import { useState, useRef } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

type Props = {
  user: User;
  onCreditsUpdate: (credits: number) => void;
};

type Tab = 'txt2img' | 'img2img';
type Model = 'nano-banana-pro' | 'nano-banana-2';
type AspectRatio = '1:1' | '16:9' | '9:16' | '21:9' | '3:2' | '2:3' | '3:4' | '4:3' | '4:5' | '5:4';
type Resolution = '1K' | '2K' | '4K';

const MODELS: { id: Model; name: string; desc: string; badge?: string; badgeColor?: string }[] = [
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', desc: 'Улучшенный рендеринг, точное следование промптам и генерация в 4K', badge: 'Популярно', badgeColor: 'bg-green-500' },
  { id: 'nano-banana-2', name: 'Nano Banana 2', desc: 'Модель нового поколения: быстрее, выше качество и поддержка 4K', badge: 'Новинка', badgeColor: 'bg-cyan-500' },
];

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '21:9', '3:2', '2:3', '3:4', '4:3', '4:5', '5:4'];
const RESOLUTIONS: Resolution[] = ['1K', '2K', '4K'];

const BASE_COST = 60;

export function ImageGen({ user, onCreditsUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('txt2img');
  const [model, setModel] = useState<Model>('nano-banana-2');
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [aspect, setAspect] = useState<AspectRatio>('1:1');
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showAspectPicker, setShowAspectPicker] = useState(false);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [_refFile, setRefFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cost = BASE_COST * count;
  const canGenerate = prompt.trim().length > 0 && user.credits >= cost && !loading
    && (tab === 'txt2img' || refImage !== null);

  const selectedModel = MODELS.find(m => m.id === model)!;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRefFile(file);
    const reader = new FileReader();
    reader.onload = () => setRefImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeRefImage() {
    setRefImage(null);
    setRefFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

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
    <div className="p-5 space-y-5 pb-6">

      {/* ─── Header ─── */}
      <h1 className="text-xl font-bold text-white pt-1">UraanxAI</h1>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-1">
        <button
          onClick={() => setTab('img2img')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'img2img'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-200'
          }`}
        >
          Редактирование
        </button>
        <button
          onClick={() => setTab('txt2img')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'txt2img'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-200'
          }`}
        >
          Текст в изображение
        </button>
      </div>

      {/* ─── Model picker ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">Модель</label>
        <button
          onClick={() => setShowModelPicker(!showModelPicker)}
          className="w-full flex items-center justify-between bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md px-4 py-3 text-sm text-white font-medium"
        >
          <span>{selectedModel.name}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${showModelPicker ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showModelPicker && (
          <div className="bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md overflow-hidden">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { setModel(m.id); setShowModelPicker(false); }}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                  model === m.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                }`}
              >
                {/* Checkmark */}
                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  {model === m.id && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">{m.name}</span>
                    {m.badge && (
                      <span className={`${m.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 text-xs mt-0.5 leading-snug">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Reference image (img2img only) ─── */}
      {tab === 'img2img' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white text-sm font-semibold">Загрузить изображение (референс)</label>
            {refImage && (
              <span className="text-slate-200 text-xs">1/10</span>
            )}
          </div>

          {refImage ? (
            <div className="relative inline-block">
              <img src={refImage} alt="Референс" className="w-24 h-24 object-cover rounded-xl border border-white/[0.10]" />
              <button
                onClick={removeRefImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-white/[0.15] flex flex-col items-center justify-center gap-2 text-slate-200 active:bg-white/[0.04] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span className="text-xs font-medium">Добавить</span>
            </button>
          )}

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-slate-400 text-xs">Перетащите или нажмите, чтобы загрузить изображение</p>
        </div>
      )}

      {/* ─── Prompt ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">Запрос (обязательно)</label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Что вы хотите создать?"
            maxLength={20000}
            rows={4}
            className="w-full bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-4 pb-8 text-sm font-medium resize-none outline-none placeholder-slate-400 text-white focus:border-violet-500/50 transition-colors"
          />
          <span className="absolute bottom-3 left-4 text-slate-400 text-xs">{prompt.length} / 20000</span>
        </div>
      </div>

      {/* ─── Count ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">Количество результатов</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                count === n
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20'
                  : 'bg-white/[0.08] border border-white/[0.12] text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Aspect ratio ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">Соотношение сторон</label>
        <button
          onClick={() => setShowAspectPicker(!showAspectPicker)}
          className="w-full flex items-center justify-between bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md px-4 py-3 text-sm text-white font-medium"
        >
          <span>{aspect}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${showAspectPicker ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showAspectPicker && (
          <div className="grid grid-cols-5 gap-1.5 bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-2">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar}
                onClick={() => { setAspect(ar); setShowAspectPicker(false); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  aspect === ar
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                    : 'text-white active:bg-white/[0.08]'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Resolution ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">Разрешение</label>
        <div className="flex gap-2">
          {RESOLUTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                resolution === r
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20'
                  : 'bg-white/[0.08] border border-white/[0.12] text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Credits info ─── */}
      <div className="flex items-center gap-2 text-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span className="text-white font-medium">
          Требуются кредиты: <span className="text-white font-bold">{cost}</span>
        </span>
      </div>

      {/* ─── Generate button ─── */}
      <button
        onClick={generate}
        disabled={!canGenerate}
        className="w-full rounded-xl py-4 font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:scale-100 bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/>
              <path d="M12 3a9 9 0 019 9"/>
            </svg>
            Создаю...
          </span>
        ) : user.credits < cost ? (
          'Недостаточно кредитов'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Создать
          </span>
        )}
      </button>

      {/* ─── Error ─── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ─── Loading placeholder ─── */}
      {loading && !imageUrl && (
        <div className="bg-white/[0.08] border border-white/[0.12] rounded-2xl aspect-square flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mx-auto">
              <svg className="animate-pulse" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <p className="text-white text-sm font-semibold">Создаю изображение...</p>
            <p className="text-slate-400 text-xs font-medium">Обычно 10–30 секунд</p>
          </div>
        </div>
      )}

      {/* ─── Result ─── */}
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
              className="flex-1 bg-violet-500/15 border border-violet-500/20 rounded-xl py-3 text-sm font-bold text-violet-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5"
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
