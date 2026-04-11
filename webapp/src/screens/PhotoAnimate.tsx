import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import type { User } from '../types';
import { GenerationViewer } from '../components/GenerationViewer';
import { downloadMedia } from '../utils/download';

type HistoryItem = { id: number; type: string; prompt: string | null; resultUrl: string; cost: number; createdAt: string };

type Props = {
  user: User;
  onCreditsUpdate: (credits: number) => void;
};

type ActiveTab = 'animate' | 'restore';
type VideoMode = '720p' | '1080p';
type VideoLength = '5s' | '10s';
type VideoRatio = '16:9' | '1:1' | '9:16';
type Model = 'nano-banana-pro' | 'nano-banana-2';
type AspectRatio = '1:1' | '16:9' | '9:16' | '21:9' | '3:2' | '2:3' | '3:4' | '4:3' | '4:5' | '5:4';
type Resolution = '1K' | '2K' | '4K';

// ─── Шаблоны промптов для оживления фото ───
const ANIMATE_TEMPLATES: { title: string; prompt: string }[] = [
  {
    title: 'Приветствие в камеру',
    prompt: 'The person(s) look directly into the camera and smile warmly, waving their hand in a friendly greeting gesture. The camera angle remains static and unchanged. The person does not speak. Ultra-detailed skin texture, visible pores, professional cinematic lighting, shallow depth of field, ultra-high definition.',
  },
  {
    title: 'Воздушный поцелуй',
    prompt: 'The person looks directly into the camera with a charming expression, then gently blows an air kiss towards the camera. The camera angle remains completely static. The person does not speak. Ultra-detailed rendering, professional portrait lighting, natural skin with visible pores, cinematic color grading, 8K quality.',
  },
  {
    title: 'Радостный смех',
    prompt: 'The person starts with a neutral expression then gradually breaks into genuine, joyful laughter with natural head movement and sparkling eyes. The camera slowly zooms in slightly during the laugh. The person does not speak. Ultra-detailed facial expressions, professional studio lighting, natural skin texture, cinematic depth of field.',
  },
  {
    title: 'Драматические слёзы',
    prompt: 'The person is still at first, then their expression slowly shifts to deep emotion. A single tear rolls down their cheek as they look into the camera with glistening, emotional eyes. The camera remains static. The person does not speak. Ultra-realistic tear rendering, professional dramatic lighting, detailed skin texture with subsurface scattering, cinematic grading.',
  },
  {
    title: 'Кинематографичный поворот',
    prompt: 'The camera starts from a close-up side angle of the person, then slowly orbits around to reveal their full face in a dramatic cinematic arc. The person maintains a confident, calm expression with subtle natural micro-movements. The person does not speak. Ultra-detailed 3D parallax, professional cinematic camera movement, volumetric lighting, shallow depth of field, film grain.',
  },
];

// ─── Шаблон для реставрации ───
const RESTORE_TEMPLATES: { title: string; prompt: string }[] = [
  {
    title: 'Профессиональная реставрация',
    prompt: 'Реставрируй и раскрась это старое фото с абсолютной точностью. Сохрани каждую черту лица один в один — костную структуру, форму глаз, нос, губы, челюсть, уши, линию роста волос — без единого изменения, без сглаживания, без идеализации. Никаких галлюцинаций ИИ. Кожа должна быть живой: видимые поры, микротекстура, естественное подповерхностное рассеивание света, мелкие несовершенства - родинки, морщинки, неровности. Категорически запрещена пластиковая, восковая или аэрографная кожа. Цветокоррекция натуральная и исторически достоверная, тон кожи соответствует этнической принадлежности человека на фото. Убери все повреждения - царапины, пыль, заломы, зернистость плёнки - но сохрани оригинальную резкость и детализацию. Рендер как профессиональный портрет, снятый на камеру Canon EOS R5 с объективом 85mm f/1.4 - мягкий направленный свет, естественное боке, малая глубина резкости. Финальный результат: ультравысокое разрешение, фотореалистичное изображение, неотличимое от современной профессиональной фотографии. Это реставрация, не переосмысление. Лицо должно быть идентично оригиналу на 100%. Не додумывай и не изменяй ни одну деталь.',
  },
];

// ─── Цены (копируем логику из VideoGen / ImageGen) ───
function calcAnimateCost(durationStr: VideoLength, mode: VideoMode, audio: boolean, exMult: number): number {
  const dur = parseInt(durationStr);
  let baseRate: number;
  // Video 3.0 only
  if (mode === '1080p') {
    baseRate = audio ? 0.1008 : 0.0672;
  } else {
    baseRate = audio ? 0.0756 : 0.0504;
  }
  return Math.ceil(dur * baseRate * 2.3 * 1007.75 * exMult);
}

const IMAGE_COSTS: Record<string, Record<string, number>> = {
  'nano-banana-2': { '1K': 155, '2K': 234, '4K': 350 },
  'nano-banana-pro': { '1K': 310, '2K': 310, '4K': 556 },
};

const ASPECT_RATIOS: { id: AspectRatio; label: string }[] = [
  { id: '1:1', label: '1:1' }, { id: '16:9', label: '16:9' }, { id: '9:16', label: '9:16' },
  { id: '4:3', label: '4:3' }, { id: '3:4', label: '3:4' }, { id: '3:2', label: '3:2' },
  { id: '2:3', label: '2:3' }, { id: '5:4', label: '5:4' }, { id: '4:5', label: '4:5' },
  { id: '21:9', label: '21:9' },
];
const RESOLUTIONS: Resolution[] = ['1K', '2K', '4K'];

// ─── Icons ───
function IconUpload({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" opacity="0.5"/>
      <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export function PhotoAnimate({ user, onCreditsUpdate }: Props) {
  const [exMult, setExMult] = useState(1);
  useEffect(() => { api.getExchangeRate().then(d => setExMult(d.multiplier)).catch(() => {}); }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('animate');
  const abortRef = useRef(false);
  useEffect(() => () => { abortRef.current = true; }, []);

  // ─── Общие ───
  const [prompt, setPrompt] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);

  // ─── Animate (video) state ───
  const [videoMode, setVideoMode] = useState<VideoMode>('1080p');
  const [videoLength, setVideoLength] = useState<VideoLength>('10s');
  const [videoRatio, setVideoRatio] = useState<VideoRatio>('9:16');
  const [nativeAudio, setNativeAudio] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // ─── Restore (image) state ───
  const [restoreModel, setRestoreModel] = useState<Model>('nano-banana-pro');
  const [restoreAspect, setRestoreAspect] = useState<AspectRatio>('1:1');
  const [restoreResolution, setRestoreResolution] = useState<Resolution>('2K');
  const [restoreCount, setRestoreCount] = useState(1);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showAspectPicker, setShowAspectPicker] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // ─── History ───
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => { loadHistory(); }, []);

  function loadHistory() {
    setHistoryLoading(true);
    Promise.all([
      api.getGenerations('video', 20),
      api.getGenerations('image', 20),
    ]).then(([v, img]) => {
      const all = [...v, ...img]
        .filter(i => i.resultUrl)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);
      setHistory(all);
    }).catch(console.error).finally(() => setHistoryLoading(false));
  }

  // ─── Costs ───
  const animateCost = calcAnimateCost(videoLength, videoMode, nativeAudio, exMult);
  const restoreCostPerImage = Math.ceil((IMAGE_COSTS[restoreModel]?.[restoreResolution] ?? 155) * exMult);
  const restoreCost = restoreCostPerImage * restoreCount;
  const cost = activeTab === 'animate' ? animateCost : restoreCost;

  const canGenerate = !loading && user.credits >= cost && prompt.trim().length > 0 && photo !== null;

  // ─── File handling ───
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function useTemplate(templatePrompt: string) {
    setPrompt(templatePrompt);
    setExpandedTemplate(null);
    setTimeout(() => promptRef.current?.focus(), 100);
  }

  // ─── Polling (video) ───
  async function pollTaskResult(taskId: string) {
    setPollStatus('Отправлено в Kling...');
    let errorCount = 0;
    for (let i = 0; i < 360; i++) {
      if (abortRef.current) return;
      await new Promise(r => setTimeout(r, 10_000));
      try {
        const result = await api.checkTaskStatus(taskId);
        errorCount = 0;
        if (result.status === 'succeed' && result.resultUrl) return result.resultUrl;
        if (result.status === 'failed') throw new Error(result.errorMsg || 'Kling: ошибка генерации. Кредиты возвращены.');
        const mins = Math.floor(i * 10 / 60);
        const secs = (i * 10) % 60;
        const label = result.status === 'pending' ? 'В очереди Kling' : 'Оживляю фото';
        setPollStatus(`${label}... ${mins}:${secs.toString().padStart(2, '0')}`);
      } catch (err) {
        if (err instanceof Error && (err.message.includes('Kling') || err.message.includes('генерации'))) throw err;
        errorCount++;
        if (err instanceof Error && (err.message.includes('не найден') || err.message.includes('истекла'))) {
          throw new Error('Кредиты возвращены. Попробуйте ещё раз.');
        }
        if (errorCount > 5) throw err;
      }
    }
    throw new Error('Генерация заняла слишком много времени. Кредиты возвращены.');
  }

  // ─── Generate ───
  async function generate() {
    if (!canGenerate || !photo) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setImageUrls([]);
    setPollStatus(null);

    try {
      if (activeTab === 'animate') {
        // Image-to-Video через существующий /video/generate
        const r = await api.generateVideo({
          prompt: prompt.trim(),
          model: 'video-3.0',
          duration: parseInt(videoLength),
          mode: videoMode,
          aspectRatio: videoRatio,
          generateAudio: nativeAudio,
          startImageUrl: photo,
        });
        if (r.creditsLeft !== undefined) onCreditsUpdate(r.creditsLeft);
        setPollStatus('Отправлено в очередь...');
        const result = await pollTaskResult(r.taskId);
        if (result) setVideoUrl(result);
        loadHistory();
      } else {
        // Image-to-Image через существующий /image/generate
        const r = await api.generateImage({
          prompt: prompt.trim(),
          model: restoreModel,
          refImages: [photo],
          aspectRatio: restoreAspect,
          resolution: restoreResolution,
          count: restoreCount,
        });
        if (r.imageUrls && r.imageUrls.length > 0) {
          setImageUrls(r.imageUrls);
        } else if (r.imageUrl) {
          setImageUrls([r.imageUrl]);
        }
        if (r.creditsLeft !== undefined) onCreditsUpdate(r.creditsLeft);
        loadHistory();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setError(msg || 'Ошибка генерации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
      setPollStatus(null);
    }
  }

  function reset() {
    setVideoUrl(null);
    setImageUrls([]);
    setPrompt('');
    setPhoto(null);
    setError(null);
  }

  const templates = activeTab === 'animate' ? ANIMATE_TEMPLATES : RESTORE_TEMPLATES;
  const hasResult = activeTab === 'animate' ? !!videoUrl : imageUrls.length > 0;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="p-4 space-y-4">

      {/* ─── Header ─── */}
      <div className="text-center">
        <h1 className="text-xl font-extrabold text-white">
          {activeTab === 'animate' ? 'Оживление фото' : 'Реставрация фото'}
        </h1>
      </div>

      {/* ─── Tab Toggle ─── */}
      <div className="flex gap-1 bg-white/[0.06] rounded-xl p-1">
        <button
          onClick={() => { setActiveTab('animate'); reset(); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'animate' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Оживить фото
        </button>
        <button
          onClick={() => { setActiveTab('restore'); reset(); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'restore' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Реставрация фото
        </button>
      </div>

      {/* ─── Showcase: место для примеров (Игорь добавит медиа) ─── */}
      {activeTab === 'animate' ? (
        <div className="glass-neon rounded-2xl p-4 space-y-3">
          <p className="text-center text-slate-400 text-xs font-semibold mb-1">Пример результата</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Слот 1: фото (до) */}
            <div className="aspect-[3/4] rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden" id="animate-showcase-photo">
              <p className="text-slate-600 text-xs text-center px-2">Фото</p>
            </div>
            {/* Слот 2: видео (после) */}
            <div className="aspect-[3/4] rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden" id="animate-showcase-video">
              <p className="text-slate-600 text-xs text-center px-2">Видео</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-neon rounded-2xl p-4 space-y-3">
          <p className="text-center text-slate-400 text-xs font-semibold mb-1">Пример результата</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Слот 1: до */}
            <div className="space-y-1">
              <div className="aspect-[3/4] rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden" id="restore-showcase-before">
                <p className="text-slate-600 text-xs text-center px-2">До</p>
              </div>
              <p className="text-center text-slate-500 text-[10px] font-bold">ДО</p>
            </div>
            {/* Слот 2: после */}
            <div className="space-y-1">
              <div className="aspect-[3/4] rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden" id="restore-showcase-after">
                <p className="text-slate-600 text-xs text-center px-2">После</p>
              </div>
              <p className="text-center text-slate-500 text-[10px] font-bold">ПОСЛЕ</p>
            </div>
          </div>
        </div>
      )}

      {!hasResult && !loading && <>

      {/* ─── Photo Upload ─── */}
      <div className="glass-neon rounded-2xl p-4 space-y-3 overflow-visible">
        <p className="text-white text-sm font-bold">
          {activeTab === 'animate' ? 'Загрузите фото которое хотите оживить' : 'Загрузите старое фото'}
          <span className="text-red-400 ml-1">*</span>
        </p>

        {photo ? (
          <div className="relative inline-block mt-1">
            <img src={photo} alt="" className="max-w-full max-h-[200px] object-contain rounded-xl border border-white/[0.10]" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 rounded-xl border-2 border-dashed border-white/[0.15] bg-white/[0.03] flex flex-col items-center justify-center gap-3 text-slate-200 active:bg-white/[0.06] transition-colors"
          >
            <IconUpload size={32} />
            <span className="text-sm font-medium">Нажмите чтобы загрузить</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

        {activeTab === 'animate' && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
            <p className="text-violet-300 text-xs leading-relaxed">
              <span className="font-bold">Рекомендация:</span> Лучше всего подходят чёткие портретные фото с хорошим освещением. Лицо должно быть хорошо видно, без сильных теней и размытия. Одно лицо на фото даёт лучший результат.
            </p>
          </div>
        )}
      </div>

      {/* ─── Prompt Input ─── */}
      <div className="glass-neon rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-white text-sm font-bold">
            {activeTab === 'animate' ? 'Описание анимации' : 'Запрос'}
            <span className="text-red-400 ml-1">*</span>
          </p>
          <span className="text-slate-500 text-xs">{prompt.length}</span>
        </div>
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={activeTab === 'animate' ? 'Опишите как хотите оживить фото...' : 'Опишите что нужно сделать с фото...'}
          className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/40 transition-colors"
          rows={3}
        />

        {/* ─── Prompt Templates (под полем ввода) ─── */}
        <div className="space-y-2">
          <p className="text-slate-400 text-xs font-semibold">Готовые шаблоны:</p>
          {templates.map((tpl, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTemplate(expandedTemplate === i ? null : i)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left active:bg-white/[0.06] transition-colors"
              >
                <span className="text-white text-xs font-semibold">{tpl.title}</span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round"
                  className={`text-slate-400 transition-transform ${expandedTemplate === i ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {expandedTemplate === i && (
                <div className="px-3 pb-3 space-y-2">
                  <p className="text-slate-300 text-xs leading-relaxed">{tpl.prompt}</p>
                  <button
                    onClick={() => useTemplate(tpl.prompt)}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold active:scale-[0.98] transition-transform"
                  >
                    Использовать этот промпт
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Settings: ANIMATE ─── */}
      {activeTab === 'animate' && (
        <div className="glass-neon rounded-2xl p-4 space-y-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-white text-sm font-bold">Настройки</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`text-slate-400 transition-transform ${showSettings ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showSettings && (
            <div className="space-y-3 pt-1">
              {/* Режим */}
              <div>
                <p className="text-slate-400 text-xs font-semibold mb-2">Режим</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['720p', '1080p'] as VideoMode[]).map(m => (
                    <button key={m} onClick={() => setVideoMode(m)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${videoMode === m ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-white/[0.06] text-slate-400'}`}
                    >{m}</button>
                  ))}
                </div>
              </div>

              {/* Длительность */}
              <div>
                <p className="text-slate-400 text-xs font-semibold mb-2">Длительность</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['5s', '10s'] as VideoLength[]).map(l => (
                    <button key={l} onClick={() => setVideoLength(l)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${videoLength === l ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-white/[0.06] text-slate-400'}`}
                    >{l === '5s' ? '5 сек' : '10 сек'}</button>
                  ))}
                </div>
              </div>

              {/* Соотношение сторон */}
              <div>
                <p className="text-slate-400 text-xs font-semibold mb-2">Соотношение сторон</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['16:9', '1:1', '9:16'] as VideoRatio[]).map(r => (
                    <button key={r} onClick={() => setVideoRatio(r)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${videoRatio === r ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-white/[0.06] text-slate-400'}`}
                    >{r}</button>
                  ))}
                </div>
              </div>

              {/* Нативное аудио */}
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs font-semibold">Нативное аудио</p>
                <button
                  onClick={() => setNativeAudio(!nativeAudio)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${nativeAudio ? 'bg-violet-500' : 'bg-white/[0.15]'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${nativeAudio ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Settings: RESTORE ─── */}
      {activeTab === 'restore' && (
        <div className="glass-neon rounded-2xl p-4 space-y-3">
          {/* Модель */}
          <div>
            <p className="text-slate-400 text-xs font-semibold mb-2">Модель</p>
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="w-full flex items-center justify-between bg-white/[0.06] border border-white/[0.10] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-semibold">
                  {restoreModel === 'nano-banana-pro' ? 'Nano Banana Pro' : 'Nano Banana 2'}
                </span>
                {restoreModel === 'nano-banana-pro' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500 text-white">Рекомендуем</span>
                )}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`text-slate-400 transition-transform ${showModelPicker ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showModelPicker && (
              <div className="mt-2 space-y-2">
                {([
                  { id: 'nano-banana-pro' as Model, name: 'Nano Banana Pro', desc: 'Максимальное качество, сложные промпты', badge: 'Рекомендуем', badgeColor: 'bg-green-500' },
                  { id: 'nano-banana-2' as Model, name: 'Nano Banana 2', desc: 'Быстрая генерация, высокое качество', badge: 'Быстрый', badgeColor: 'bg-cyan-500' },
                ]).map(m => (
                  <button key={m.id} onClick={() => { setRestoreModel(m.id); setShowModelPicker(false); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${restoreModel === m.id ? 'bg-white/[0.08] border border-violet-500/40' : 'bg-white/[0.04] border border-white/[0.08]'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">{m.name}</span>
                        {m.badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.badgeColor} text-white`}>{m.badge}</span>}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">{m.desc}</p>
                    </div>
                    {restoreModel === m.id && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Количество результатов */}
          <div>
            <p className="text-slate-400 text-xs font-semibold mb-2">Количество результатов</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setRestoreCount(n)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${restoreCount === n ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-white/[0.06] text-slate-400'}`}
                >{n}</button>
              ))}
            </div>
          </div>

          {/* Соотношение сторон */}
          <div>
            <p className="text-slate-400 text-xs font-semibold mb-2">Соотношение сторон</p>
            <button
              onClick={() => setShowAspectPicker(!showAspectPicker)}
              className="w-full flex items-center justify-between bg-white/[0.06] border border-white/[0.10] rounded-xl px-4 py-2.5"
            >
              <span className="text-white text-sm font-semibold">{restoreAspect}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`text-slate-400 transition-transform ${showAspectPicker ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showAspectPicker && (
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {ASPECT_RATIOS.map(ar => (
                  <button key={ar.id} onClick={() => { setRestoreAspect(ar.id); setShowAspectPicker(false); }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${restoreAspect === ar.id ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-white/[0.06] text-slate-400'}`}
                  >{ar.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Разрешение */}
          <div>
            <p className="text-slate-400 text-xs font-semibold mb-2">Разрешение</p>
            <div className="grid grid-cols-3 gap-2">
              {RESOLUTIONS.map(r => (
                <button key={r} onClick={() => setRestoreResolution(r)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all relative ${restoreResolution === r ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-white/[0.06] text-slate-400'}`}
                >
                  {r}
                  {r === '2K' && (
                    <span className="absolute -top-1.5 -right-1 text-[8px] font-bold px-1 py-0.5 rounded bg-green-500 text-white">Рек.</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Cost + Generate Button ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-slate-400 text-xs font-semibold">Стоимость:</span>
          <span className="text-white text-sm font-bold">{cost.toLocaleString('ru')} кр.</span>
        </div>
        <button
          onClick={generate}
          disabled={!canGenerate}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
            canGenerate
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 active:scale-[0.98] text-white'
              : 'bg-white/[0.06] text-slate-500 cursor-not-allowed'
          }`}
        >
          {activeTab === 'animate' ? 'Оживить фото' : 'Реставрировать'}
        </button>
        {!canGenerate && photo && prompt.trim().length > 0 && user.credits < cost && (
          <p className="text-red-400 text-xs text-center">Недостаточно кредитов</p>
        )}
      </div>

      </>}

      {/* ─── Loading ─── */}
      {loading && !hasResult && (
        <div className="glass-neon rounded-2xl p-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <svg className="animate-pulse" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {activeTab === 'animate' ? (
                <><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-4v12l-6-4V10z"/></>
              ) : (
                <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>
              )}
            </svg>
          </div>
          <p className="text-white text-sm font-semibold">{pollStatus || (activeTab === 'animate' ? 'Оживляю фото...' : 'Реставрирую фото...')}</p>
          <p className="text-slate-200 text-xs font-medium">
            {activeTab === 'animate' ? 'Обычно 2-5 минут' : 'Обычно 15-30 секунд'}
          </p>
        </div>
      )}

      {/* ─── Error ─── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* ─── Result: Video ─── */}
      {activeTab === 'animate' && videoUrl && (
        <div className="space-y-3">
          <video src={videoUrl} controls className="w-full rounded-2xl shadow-xl shadow-black/40" playsInline />
          <div className="flex gap-2">
            <button
              onClick={() => downloadMedia(videoUrl, 'uraanxai-animate.mp4')}
              className="flex-1 bg-white/[0.08] border border-white/[0.10] rounded-xl py-3 text-center text-sm font-bold text-white active:bg-white/[0.12] transition-all flex items-center justify-center gap-1.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Скачать
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-violet-500/15 border border-violet-500/20 rounded-xl py-3 text-sm font-bold text-violet-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Новое
            </button>
          </div>
        </div>
      )}

      {/* ─── Result: Images ─── */}
      {activeTab === 'restore' && imageUrls.length > 0 && (
        <div className="space-y-3">
          <div className={imageUrls.length > 1 ? 'grid grid-cols-2 gap-2' : ''}>
            {imageUrls.map((url, i) => (
              <div key={i} className="space-y-2">
                <img src={url} alt="" className={`w-full rounded-2xl shadow-xl shadow-black/40 ${imageUrls.length === 1 ? 'max-h-[50vh] object-contain' : ''}`} />
                <button
                  onClick={() => downloadMedia(url, `uraanxai-restore-${i + 1}.png`)}
                  className="w-full bg-white/[0.08] border border-white/[0.10] rounded-xl py-2.5 text-center text-xs font-bold text-white active:bg-white/[0.12] transition-all flex items-center justify-center gap-1.5"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Скачать
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={reset}
            className="w-full bg-violet-500/15 border border-violet-500/20 rounded-xl py-3 text-sm font-bold text-violet-300 active:opacity-80 transition-all flex items-center justify-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            Новое
          </button>
        </div>
      )}

      {/* ─── Мои генерации ─── */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-white text-sm font-bold"
        >
          <span>Мои генерации</span>
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
              <p className="text-slate-300 text-sm">Пока нет генераций</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={item.id} className="glass-neon rounded-xl p-3 flex items-center gap-3 active:bg-white/[0.12] transition-colors" onClick={() => setViewerIndex(i)}>
                  <div className="w-10 h-10 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    {item.type === 'image' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{item.prompt || item.type}</p>
                    <p className="text-slate-400 text-xs">{new Date(item.createdAt).toLocaleDateString('ru')} · {item.cost} кр.</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      api.deleteGeneration(item.id).then(() => {
                        setHistory(prev => prev.filter(h => h.id !== item.id));
                      }).catch(console.error);
                    }}
                    className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
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
