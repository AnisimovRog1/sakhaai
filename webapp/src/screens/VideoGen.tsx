import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

type HistoryItem = { id: number; type: string; prompt: string | null; resultUrl: string; cost: number; createdAt: string };

type Props = {
  user: User;
  onCreditsUpdate: (credits: number) => void;
};

type Tab = 'video' | 'motion' | 'avatar';
type VideoModel = 'video-3.0' | 'video-2.6' | 'video-2.5-turbo';
type VideoMode = '720p' | '1080p';
type VideoLength = '5s' | '10s';
type VideoRatio = '16:9' | '1:1' | '9:16';
type Emotion = 'neutral' | 'happy' | 'angry' | 'sad' | 'fearful' | 'disgusted' | 'surprised';

const VIDEO_MODELS: { id: VideoModel; name: string; desc: string; badge?: string; badgeColor?: string }[] = [
  { id: 'video-3.0', name: 'VIDEO 3.0', desc: 'Улучшенное аудио, консистентность элементов, мульти-сцены', badge: 'Новинка', badgeColor: 'bg-cyan-500' },
  { id: 'video-2.6', name: 'VIDEO 2.6', desc: 'Звук в картинке, картинка в звуке', badge: undefined },
  { id: 'video-2.5-turbo', name: 'VIDEO 2.5 Turbo', desc: 'Максимум креатива с лучшим качеством', badge: undefined },
];

const VOICES = ['Давид', 'Диана', 'Бетти', 'Мария', 'Михаил', 'Эрик', 'Амир', 'Эмма'];

const EMOTIONS: { id: Emotion; label: string }[] = [
  { id: 'neutral', label: 'Нейтральная' },
  { id: 'happy', label: 'Радость' },
  { id: 'angry', label: 'Злость' },
  { id: 'sad', label: 'Грусть' },
  { id: 'fearful', label: 'Страх' },
  { id: 'disgusted', label: 'Отвращение' },
  { id: 'surprised', label: 'Удивление' },
];

const COSTS: Record<Tab, number> = {
  video: 608,
  motion: 608,
  avatar: 810,
};

// ─── Icon components ───────────────────────────────────────
function IconVideo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}
function IconMotion({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-4v12l-6-4V10z"/>
    </svg>
  );
}
function IconUser({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconUpload({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" opacity="0.5"/>
      <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ─── Upload card ─────────────────────────────────────────
function UploadCard({ label, preview, onSelect, onRemove, accept = 'image/*' }: {
  label: string; preview: string | null; onSelect: (file: File) => void;
  onRemove: () => void; accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onSelect(f);
  }
  return (
    <div className="flex-1">
      {preview ? (
        <div className="relative">
          {accept.startsWith('video') ? (
            <video src={preview} className="w-full h-32 object-cover rounded-xl border border-white/[0.10]" muted playsInline />
          ) : (
            <img src={preview} alt="" className="w-full h-32 object-cover rounded-xl border border-white/[0.10]" />
          )}
          <button onClick={onRemove} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          className="w-full h-32 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.03] flex flex-col items-center justify-center gap-2 text-slate-200 active:bg-white/[0.06] transition-colors"
        >
          <IconUpload />
          <span className="text-xs font-medium text-center px-2 leading-tight">{label}</span>
        </button>
      )}
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  );
}

// ─── Pill selector ──────────────────────────────────────
function PillSelector<T extends string>({ options, value, onChange, columns }: {
  options: { id: T; label: string; icon?: React.ReactNode }[];
  value: T; onChange: (v: T) => void; columns?: number;
}) {
  return (
    <div className={`grid gap-1.5 ${columns ? `grid-cols-${columns}` : `grid-cols-${options.length}`}`}
      style={columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : { gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            value === o.id
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20'
              : 'bg-white/[0.08] border border-white/[0.12] text-white'
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────
export function VideoGen({ user, onCreditsUpdate }: Props) {
  // Tab
  const [tab, setTab] = useState<Tab>('video');

  // Video Generation
  const [videoModel, setVideoModel] = useState<VideoModel>('video-3.0');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState<VideoMode>('1080p');
  const [videoLength, setVideoLength] = useState<VideoLength>('10s');
  const [videoRatio, setVideoRatio] = useState<VideoRatio>('9:16');
  const [videoCount, setVideoCount] = useState(1);
  const [nativeAudio, setNativeAudio] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Motion Control
  const [motionVideo, setMotionVideo] = useState<string | null>(null);
  const [motionImage, setMotionImage] = useState<string | null>(null);
  const [motionOrient, setMotionOrient] = useState<'video' | 'image'>('video');

  // Avatar
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [speechText, setSpeechText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Давид');
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [avatarPrompt, setAvatarPrompt] = useState('');

  // Output
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  function loadHistory() {
    setHistoryLoading(true);
    api.getGenerations('video', 20).then(setHistory).catch(console.error).finally(() => setHistoryLoading(false));
  }

  const cost = COSTS[tab] * videoCount;
  const hasCredits = user.credits >= cost;

  const canGenerate = !loading && hasCredits && (
    (tab === 'video'  && prompt.trim().length > 0) ||
    (tab === 'motion' && (motionVideo !== null || motionImage !== null)) ||
    (tab === 'avatar' && avatarImage !== null && speechText.trim().length > 0)
  );

  const selectedModel = VIDEO_MODELS.find(m => m.id === videoModel)!;

  function fileToDataUrl(file: File, cb: (url: string) => void) {
    const reader = new FileReader();
    reader.onload = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  }

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
        result = await api.generateMotion(motionImage || motionVideo || '', prompt.trim() || undefined);
      } else {
        result = await api.generateAvatar(avatarImage || '', speechText.trim());
      }
      setVideoUrl(result.videoUrl);
      onCreditsUpdate(result.creditsLeft);
      loadHistory();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setVideoUrl(null);
    setPrompt('');
    setStartFrame(null);
    setMotionVideo(null);
    setMotionImage(null);
    setAvatarImage(null);
    setSpeechText('');
    setAvatarPrompt('');
    setError(null);
  }

  return (
    <div className="p-5 space-y-5 pb-6">

      {/* ─── Header ─── */}
      <h1 className="text-xl font-bold text-white pt-1">UraanxAI</h1>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-1">
        {([
          { id: 'video' as Tab, label: 'Видео', icon: <IconVideo size={14} /> },
          { id: 'motion' as Tab, label: 'Motion', icon: <IconMotion size={14} /> },
          { id: 'avatar' as Tab, label: 'Аватар', icon: <IconUser size={14} /> },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); reset(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
                : 'text-slate-200'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Model selector (Video & Motion) ─── */}
      {(tab === 'video' || tab === 'motion') && (
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold">Модель</label>
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="w-full flex items-center justify-between bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center text-[10px] font-black text-green-300 border border-green-700/50">
                {videoModel === 'video-3.0' ? '3.0' : videoModel === 'video-2.6' ? '2.6' : '2.5'}
              </div>
              <div className="text-left">
                <span className="text-white text-sm font-semibold">{selectedModel.name}</span>
                <p className="text-white text-[11px] leading-tight mt-0.5">{selectedModel.desc.slice(0, 40)}...</p>
              </div>
            </div>
            <IconChevron open={showModelPicker} />
          </button>

          {showModelPicker && (
            <div className="bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md overflow-hidden">
              {VIDEO_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setVideoModel(m.id); setShowModelPicker(false); }}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors ${
                    videoModel === m.id ? 'bg-white/[0.06]' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center text-[10px] font-black text-green-300 border border-green-700/50 flex-shrink-0">
                    {m.id === 'video-3.0' ? '3.0' : m.id === 'video-2.6' ? '2.6' : '2.5'}
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
                  {videoModel === m.id && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ VIDEO GENERATION TAB ═══════════════ */}
      {tab === 'video' && (
        <>
          {/* Start frame upload */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Начальный кадр <span className="text-white font-normal">(необязательно)</span></label>
            <UploadCard
              label="Загрузить изображение"
              preview={startFrame}
              onSelect={(f) => fileToDataUrl(f, setStartFrame)}
              onRemove={() => setStartFrame(null)}
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Описание видео</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Опишите сцену, действия, камеру..."
                rows={4}
                className="w-full bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-4 pb-8 text-sm font-medium resize-none outline-none placeholder-slate-400 text-white focus:border-violet-500/50 transition-colors"
              />
              <span className="absolute bottom-3 left-4 text-white text-xs">{prompt.length}</span>
            </div>
          </div>

          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md px-4 py-2.5 text-sm text-white font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-4.2-5.8l-1.4 1.4M6.6 17.4l-1.4 1.4m0-12.8l1.4 1.4m10.8 10.8l1.4 1.4"/>
            </svg>
            {videoMode} · {videoLength} · {videoRatio} · {videoCount}
            <IconChevron open={showSettings} />
          </button>

          {showSettings && (
            <div className="bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-4 space-y-4">
              {/* Mode */}
              <div className="space-y-2">
                <label className="text-white text-xs font-semibold">Режим</label>
                <PillSelector
                  options={[
                    { id: '720p' as VideoMode, label: '720p' },
                    { id: '1080p' as VideoMode, label: '1080p' },
                  ]}
                  value={videoMode}
                  onChange={setVideoMode}
                />
              </div>

              {/* Length */}
              <div className="space-y-2">
                <label className="text-white text-xs font-semibold">Длительность</label>
                <PillSelector
                  options={[
                    { id: '5s' as VideoLength, label: '5 сек' },
                    { id: '10s' as VideoLength, label: '10 сек' },
                  ]}
                  value={videoLength}
                  onChange={setVideoLength}
                />
              </div>

              {/* Video Ratio */}
              <div className="space-y-2">
                <label className="text-white text-xs font-semibold">Соотношение сторон</label>
                <PillSelector
                  options={[
                    { id: '16:9' as VideoRatio, label: '16:9', icon: <span className="inline-block w-4 h-2.5 border border-current rounded-[2px]" /> },
                    { id: '1:1' as VideoRatio, label: '1:1', icon: <span className="inline-block w-3 h-3 border border-current rounded-[2px]" /> },
                    { id: '9:16' as VideoRatio, label: '9:16', icon: <span className="inline-block w-2.5 h-4 border border-current rounded-[2px]" /> },
                  ]}
                  value={videoRatio}
                  onChange={setVideoRatio}
                />
              </div>

              {/* Count */}
              <div className="space-y-2">
                <label className="text-white text-xs font-semibold">Количество</label>
                <PillSelector
                  options={[1, 2, 3, 4].map((n) => ({ id: String(n) as any, label: String(n) }))}
                  value={String(videoCount) as any}
                  onChange={(v) => setVideoCount(Number(v))}
                />
              </div>
            </div>
          )}

          {/* Native Audio */}
          <button
            onClick={() => setNativeAudio(!nativeAudio)}
            className="flex items-center gap-3 px-1"
          >
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${nativeAudio ? 'bg-violet-600' : 'bg-white/[0.10]'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${nativeAudio ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-white font-medium">Нативное аудио</span>
          </button>
        </>
      )}

      {/* ═══════════════ MOTION CONTROL TAB ═══════════════ */}
      {tab === 'motion' && (
        <>
          {/* Two upload areas side by side */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Загрузите материалы</label>
            <div className="flex gap-3">
              <UploadCard
                label="Видео с движениями персонажа"
                preview={motionVideo}
                onSelect={(f) => fileToDataUrl(f, setMotionVideo)}
                onRemove={() => setMotionVideo(null)}
                accept="video/*"
              />
              <UploadCard
                label="Изображение персонажа"
                preview={motionImage}
                onSelect={(f) => fileToDataUrl(f, setMotionImage)}
                onRemove={() => setMotionImage(null)}
              />
            </div>
          </div>

          {/* Character Orientation */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Ориентация персонажа</label>
            <div className="flex gap-2">
              {([
                { id: 'video' as const, label: 'По видео' },
                { id: 'image' as const, label: 'По изображению' },
              ]).map((o) => (
                <button
                  key={o.id}
                  onClick={() => setMotionOrient(o.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all ${
                    motionOrient === o.id
                      ? 'bg-white/[0.08] border border-violet-500/40 text-white'
                      : 'bg-white/[0.04] border border-white/[0.08] text-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    motionOrient === o.id ? 'border-violet-500' : 'border-slate-500'
                  }`}>
                    {motionOrient === o.id && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                  </div>
                  {o.label}
                </button>
              ))}
            </div>
            <p className="text-white text-[11px] leading-snug px-1">
              Когда ориентация совпадает с видео — сложные движения работают лучше; когда с изображением — лучше поддерживаются движения камеры.
            </p>
          </div>

          {/* Optional prompt */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Описание <span className="text-white font-normal">(необязательно)</span></label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Дополнительное описание движений..."
              rows={3}
              className="w-full bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-4 text-sm font-medium resize-none outline-none placeholder-slate-400 text-white focus:border-violet-500/50 transition-colors"
            />
          </div>
        </>
      )}

      {/* ═══════════════ AVATAR TAB ═══════════════ */}
      {tab === 'avatar' && (
        <>
          {/* Face image upload */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Фото лица персонажа</label>
            <UploadCard
              label="Загрузить изображение лица"
              preview={avatarImage}
              onSelect={(f) => fileToDataUrl(f, setAvatarImage)}
              onRemove={() => setAvatarImage(null)}
            />
          </div>

          {/* Speech text */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Речь</label>
            <textarea
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              placeholder="Введите текст, который персонаж произнесёт..."
              rows={3}
              className="w-full bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-4 text-sm font-medium resize-none outline-none placeholder-slate-400 text-white focus:border-violet-500/50 transition-colors"
            />
          </div>

          {/* Voice selection */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Голос</label>
            <button
              onClick={() => setShowVoicePicker(!showVoicePicker)}
              className="w-full flex items-center justify-between bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md px-4 py-3 text-sm text-white font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                  {selectedVoice[0]}
                </div>
                <span>{selectedVoice}</span>
              </div>
              <IconChevron open={showVoicePicker} />
            </button>

            {showVoicePicker && (
              <div className="bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md overflow-hidden max-h-48 overflow-y-auto">
                {VOICES.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setSelectedVoice(v); setShowVoicePicker(false); }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                      selectedVoice === v ? 'bg-white/[0.06]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-bold text-white">
                        {v[0]}
                      </div>
                      <span className="text-white text-sm font-medium">{v}</span>
                    </div>
                    {selectedVoice === v && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Speech Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-semibold">Скорость речи</label>
              <span className="text-sm text-violet-400 font-bold">{speechRate}x</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSpeechRate(Math.max(0.5, +(speechRate - 0.1).toFixed(1)))}
                className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <div className="flex-1 relative h-2 bg-white/[0.08] rounded-full">
                <div
                  className="absolute h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full"
                  style={{ width: `${((speechRate - 0.5) / 1.5) * 100}%` }}
                />
                <input
                  type="range"
                  min="0.5" max="2.0" step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(+e.target.value)}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <button
                onClick={() => setSpeechRate(Math.min(2.0, +(speechRate + 0.1).toFixed(1)))}
                className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>

          {/* Emotion */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Эмоция</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOTIONS.map((em) => (
                <button
                  key={em.id}
                  onClick={() => setEmotion(em.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    emotion === em.id
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20'
                      : 'bg-white/[0.08] border border-white/[0.12] text-white'
                  }`}
                >
                  {em.label}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar prompt */}
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold">Промпт аватара <span className="text-white font-normal">(необязательно)</span></label>
            <textarea
              value={avatarPrompt}
              onChange={(e) => setAvatarPrompt(e.target.value)}
              placeholder="Действия, эмоции, жесты персонажа..."
              rows={3}
              className="w-full bg-white/[0.10] border border-white/[0.14] rounded-xl backdrop-blur-md p-4 text-sm font-medium resize-none outline-none placeholder-slate-400 text-white focus:border-violet-500/50 transition-colors"
            />
          </div>
        </>
      )}

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
        ) : !hasCredits ? (
          'Недостаточно кредитов'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <IconVideo size={18} />
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

      {/* ─── Loading ─── */}
      {loading && !videoUrl && (
        <div className="bg-white/[0.08] border border-white/[0.12] rounded-2xl p-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <svg className="animate-pulse" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-4v12l-6-4V10z"/>
            </svg>
          </div>
          <p className="text-white text-sm font-semibold">Генерирую видео...</p>
          <p className="text-slate-200 text-xs font-medium">Обычно 1–3 минуты</p>
        </div>
      )}

      {/* ─── Result ─── */}
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
              {history.map((item) => (
                <div key={item.id} className="bg-white/[0.08] border border-white/[0.12] rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{item.prompt || item.type}</p>
                    <p className="text-slate-400 text-xs">{new Date(item.createdAt).toLocaleDateString('ru')} · {item.cost} кр.</p>
                  </div>
                  <a
                    href={item.resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          )
        )}
      </div>

    </div>
  );
}
