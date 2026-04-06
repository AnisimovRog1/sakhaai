import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import type { User } from '../types';
import { useLang } from '../LangContext';
import { PromptGallery } from '../components/PromptGallery';
import { GenerationViewer } from '../components/GenerationViewer';
import { downloadMedia } from '../utils/download';

type HistoryItem = { id: number; type: string; prompt: string | null; resultUrl: string; cost: number; createdAt: string };

type Props = {
  user: User;
  onCreditsUpdate: (credits: number) => void;
};

type Tab = 'txt2img' | 'img2img';
type Model = 'nano-banana-pro' | 'nano-banana-2';
type AspectRatio = '1:1' | '16:9' | '9:16' | '21:9' | '3:2' | '2:3' | '3:4' | '4:3' | '4:5' | '5:4';
type Resolution = '1K' | '2K' | '4K';

const MODELS: { id: Model; name: string; desc: string; badge?: string; badgeColor?: string }[] = [
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', desc: 'Максимальное качество, face swap, сложные промпты', badge: 'PRO', badgeColor: 'bg-violet-500' },
  { id: 'nano-banana-2', name: 'Nano Banana 2', desc: 'Быстрая генерация, высокое качество', badge: 'Новинка', badgeColor: 'bg-cyan-500' },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; desc: string }[] = [
  { id: '1:1',  label: '1:1',  desc: 'Квадрат' },
  { id: '16:9', label: '16:9', desc: 'Широкий' },
  { id: '9:16', label: '9:16', desc: 'Портрет' },
  { id: '4:3',  label: '4:3',  desc: 'Стандарт' },
  { id: '3:4',  label: '3:4',  desc: 'Портрет Стандарт' },
  { id: '3:2',  label: '3:2',  desc: 'Фото' },
  { id: '2:3',  label: '2:3',  desc: 'Портрет Фото' },
  { id: '5:4',  label: '5:4',  desc: 'Средний' },
  { id: '4:5',  label: '4:5',  desc: 'Портрет Средний' },
  { id: '21:9', label: '21:9', desc: 'Ультраширокий' },
];
const RESOLUTIONS: Resolution[] = ['1K', '2K', '4K'];

// Цены: себестоимость × 2.3 (по ставке Про 0.080₽/кр)
const IMAGE_COSTS: Record<string, Record<string, number>> = {
  'nano-banana-2': { '1K': 155, '2K': 234, '4K': 350 },
  'nano-banana-pro': { '1K': 310, '2K': 310, '4K': 556 },
};

export function ImageGen({ user, onCreditsUpdate }: Props) {
  const { t } = useLang();
  const [exMult, setExMult] = useState(1);
  useEffect(() => { api.getExchangeRate().then(d => setExMult(d.multiplier)).catch(() => {}); }, []);
  const [section, setSection] = useState<'create' | 'templates'>('create');
  const [tab, setTab] = useState<Tab>('txt2img');
  const [model, setModel] = useState<Model>('nano-banana-2');
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [aspect, setAspect] = useState<AspectRatio>('1:1');
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showAspectPicker, setShowAspectPicker] = useState(false);
  const [refImages, setRefImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const MAX_REF_IMAGES = 4;
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  function loadHistory() {
    setHistoryLoading(true);
    api.getGenerations('image', 20).then(setHistory).catch(console.error).finally(() => setHistoryLoading(false));
  }

  const costPerImage = Math.ceil((IMAGE_COSTS[model]?.[resolution] ?? 155) * exMult);
  const cost = costPerImage * count;
  const canGenerate = prompt.trim().length > 0 && user.credits >= cost && !loading
    && (tab === 'txt2img' || refImages.length > 0);

  const selectedModel = MODELS.find(m => m.id === model)!;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || refImages.length >= MAX_REF_IMAGES) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRefImages(prev => [...prev, reader.result as string]);
    };
    reader.onerror = () => { console.error('FileReader error'); };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeRefImage(index: number) {
    setRefImages(prev => prev.filter((_, i) => i !== index));
  }

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    setImageUrls([]);
    try {
      const result = await api.generateImage({
        prompt: prompt.trim(),
        model,
        refImages: refImages.length > 0 ? refImages : undefined,
        aspectRatio: aspect,
        resolution,
        count,
      });
      setImageUrls(result.imageUrls || [result.imageUrl]);
      onCreditsUpdate(result.creditsLeft);
      loadHistory();
      // Уведомление о частичном рефанде
      if (result.refunded && result.refunded > 0 && result.generated && result.generated > 0) {
        setInfo(`${result.generated} из ${result.requested} изображений готовы. Кредиты за ${result.refunded} неудачных возвращены на баланс.`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка генерации';
      setError(`${msg}. Кредиты возвращены. Попробуйте снова.`);
      // Обновить баланс после рефанда
      api.getBalance().then(b => onCreditsUpdate(b.credits)).catch(() => {});
    } finally {
      setLoading(false);
    }
  }

  function handleSelectTemplate(templatePrompt: string, imageUrl?: string) {
    setPrompt(templatePrompt);
    if (imageUrl) {
      setRefImages([imageUrl]);
      setTab('img2img');
    }
    setSection('create');
    setTimeout(() => promptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }

  return (
    <div className="p-5 space-y-5 pb-6">

      {/* ─── Header ─── */}
      <h1 className="text-xl font-bold text-white">UraanxAI</h1>

      {/* ─── Section toggle: Create / Templates ─── */}
      <div className="flex gap-1 glass-neon rounded-xl p-1">
        <button
          onClick={() => setSection('create')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            section === 'create'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-200'
          }`}
        >
          {t('image.create')}
        </button>
        <button
          onClick={() => setSection('templates')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            section === 'templates'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-200'
          }`}
        >
          {t('image.templates')}
        </button>
      </div>

      {/* ─── Templates gallery ─── */}
      {section === 'templates' && (
        <PromptGallery onSelectTemplate={handleSelectTemplate} />
      )}

      {/* ─── Create section ─── */}
      {section === 'create' && <>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 glass-neon rounded-xl p-1">
        <button
          onClick={() => setTab('img2img')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'img2img'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-200'
          }`}
        >
          {t('image.edit')}
        </button>
        <button
          onClick={() => setTab('txt2img')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'txt2img'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-200'
          }`}
        >
          {t('image.textToImage')}
        </button>
      </div>

      {/* ─── Model picker ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">{t('image.model')}</label>
        <button
          onClick={() => setShowModelPicker(!showModelPicker)}
          className="w-full flex items-center justify-between glass-neon rounded-xl px-4 py-3 text-sm text-white font-medium"
        >
          <span>{selectedModel.name}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${showModelPicker ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showModelPicker && (
          <div className="glass-neon rounded-xl overflow-hidden">
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

      {/* ─── Reference images (img2img only, до 4 шт.) ─── */}
      {tab === 'img2img' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white text-sm font-semibold">{t('image.uploadRef')}</label>
            {refImages.length > 0 && (
              <span className="text-slate-200 text-xs">{refImages.length}/{MAX_REF_IMAGES}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {refImages.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt={`Референс ${i + 1}`} className="w-24 h-24 object-cover rounded-xl border border-white/[0.10]" />
                <button
                  onClick={() => removeRefImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}

            {refImages.length < MAX_REF_IMAGES && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-white/[0.15] flex flex-col items-center justify-center gap-1.5 text-slate-200 active:bg-white/[0.04] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span className="text-[10px] font-medium">Добавить</span>
              </button>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-slate-400 text-xs">Нажмите +, чтобы добавить изображение (до {MAX_REF_IMAGES})</p>
        </div>
      )}

      {/* ─── Prompt ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">{t('image.prompt')}</label>
        <div className="relative">
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('image.promptPlaceholder')}
            maxLength={20000}
            rows={4}
            className="w-full glass-neon rounded-xl p-4 pb-8 text-base font-medium resize-none outline-none placeholder-slate-400 text-white focus:border-violet-500/50 transition-colors"
          />
          <span className="absolute bottom-3 left-4 text-slate-400 text-xs">{prompt.length} / 20000</span>
        </div>
      </div>

      {/* ─── Count ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">{t('image.count')}</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                count === n
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20'
                  : 'glass-neon text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Aspect ratio ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">{t('image.aspectRatio')}</label>
        <button
          onClick={() => setShowAspectPicker(!showAspectPicker)}
          className="w-full flex items-center justify-between glass-neon rounded-xl px-4 py-3 text-sm text-white font-medium"
        >
          <span>{aspect} ({ASPECT_RATIOS.find(a => a.id === aspect)?.desc})</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${showAspectPicker ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showAspectPicker && (
          <div className="glass-neon rounded-xl p-2 space-y-1">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.id}
                onClick={() => { setAspect(ar.id); setShowAspectPicker(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  aspect === ar.id
                    ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/20 border border-violet-500/30'
                    : 'active:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-bold w-10">{ar.label}</span>
                  <span className="text-slate-300 text-xs">{ar.desc}</span>
                </div>
                {aspect === ar.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Resolution ─── */}
      <div className="space-y-2">
        <label className="text-white text-sm font-semibold">{t('image.resolution')}</label>
        <div className="flex gap-2">
          {RESOLUTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                resolution === r
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20'
                  : 'glass-neon text-white'
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
          {t('image.creditsRequired')}: <span className="text-white font-bold">{cost}</span>
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
            {t('image.creating')}
          </span>
        ) : user.credits < cost ? (
          t('image.notEnough')
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {t('image.create')}
          </span>
        )}
      </button>

      {/* ─── Error ─── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm font-medium">
          {error}
        </div>
      )}
      {info && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-cyan-300 text-sm font-medium flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          {info}
        </div>
      )}

      {/* ─── Loading placeholder ─── */}
      {loading && imageUrls.length === 0 && (
        <div className="glass-neon rounded-2xl aspect-square flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mx-auto">
              <svg className="animate-pulse" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <p className="text-white text-sm font-semibold">Создаю изображение{count > 1 ? ` (${count} шт.)` : ''}...</p>
            <p className="text-slate-400 text-xs font-medium">Обычно 10–30 секунд</p>
          </div>
        </div>
      )}

      {/* ─── Result ─── */}
      {imageUrls.length > 0 && (
        <div className="space-y-3">
          <div className={imageUrls.length > 1 ? 'grid grid-cols-2 gap-2' : ''}>
            {imageUrls.map((url, i) => (
              <div key={i} className="space-y-2">
                <img
                  src={url}
                  alt={`Результат ${i + 1}`}
                  className={`w-full object-contain rounded-2xl shadow-xl shadow-black/40 ${imageUrls.length === 1 ? 'max-h-[50vh]' : ''}`}
                />
                <button
                  onClick={() => downloadMedia(url, `uraanxai-image-${i + 1}.png`)}
                  className="w-full bg-white/[0.08] border border-white/[0.10] rounded-lg py-2 text-center text-xs font-bold text-white active:bg-white/[0.12] transition-all flex items-center justify-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Скачать
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setImageUrls([]); setPrompt(''); }}
            className="w-full bg-violet-500/15 border border-violet-500/20 rounded-xl py-3 text-sm font-bold text-violet-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            {t('image.new')}
          </button>
        </div>
      )}

      </>}

      {/* ─── Мои генерации ─── */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-white text-sm font-bold"
        >
          <span>{t('image.history')}</span>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <span className="text-xs text-violet-400 font-semibold">{history.length}</span>
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${showHistory ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </button>

        {showHistory && (
          historyLoading ? (
            <div className="flex justify-center py-6">
              <div className="flex gap-2">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white/[0.06] rounded-xl p-6 text-center">
              <p className="text-slate-300 text-sm">{t('image.noHistory')}</p>
            </div>
          ) : (
            <div className="columns-2 gap-2 space-y-2">
              {history.map((item, i) => (
                <div key={item.id} className="relative group break-inside-avoid" onClick={() => setViewerIndex(i)}>
                  <img
                    src={item.resultUrl}
                    alt={item.prompt || 'Генерация'}
                    loading="lazy"
                    className="w-full rounded-xl border border-white/[0.10]"
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      const r = img.naturalWidth / img.naturalHeight;
                      const badge = img.parentElement?.querySelector('[data-ratio]') as HTMLElement;
                      if (badge) {
                        if (r > 1.3) badge.textContent = '16:9';
                        else if (r > 1.1) badge.textContent = '4:3';
                        else if (r < 0.77) badge.textContent = '9:16';
                        else if (r < 0.9) badge.textContent = '3:4';
                        else badge.textContent = '1:1';
                      }
                    }}
                  />
                  <span data-ratio className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm"></span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      api.deleteGeneration(item.id).then(() => {
                        setHistory(prev => prev.filter(h => h.id !== item.id));
                      }).catch(console.error);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl opacity-0 group-active:opacity-100 transition-opacity flex flex-col justify-end p-2 pointer-events-none">
                    <p className="text-white text-[10px] font-medium line-clamp-2">{item.prompt}</p>
                    <p className="text-slate-300 text-[9px] mt-0.5">{new Date(item.createdAt).toLocaleDateString('ru')}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {viewerIndex !== null && (
        <GenerationViewer
          items={history}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

    </div>
  );
}
