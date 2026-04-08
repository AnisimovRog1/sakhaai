import { useState, useEffect, useRef, useCallback } from 'react';
import { downloadMedia } from '../utils/download';

type HistoryItem = {
  id: number;
  type: string;
  prompt: string | null;
  resultUrl: string;
  cost: number;
  createdAt: string;
};

type Props = {
  items: HistoryItem[];
  startIndex: number;
  onClose: () => void;
};

export function GenerationViewer({ items, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [sheetOpen, setSheetOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const item = items[index];
  const isVideo = item?.type === 'video' || item?.type === 'motion' || item?.type === 'avatar';

  useEffect(() => {
    const timer = setTimeout(() => setSheetOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [index]);

  const prev = useCallback(() => {
    if (index > 0) setIndex(index - 1);
  }, [index]);

  const next = useCallback(() => {
    if (index < items.length - 1) setIndex(index + 1);
  }, [index, items.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (touchDeltaX.current > 60) prev();
    else if (touchDeltaX.current < -60) next();
  }

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!item || saving) return;
    const fileName = isVideo ? 'uraanxai-video.mp4' : 'uraanxai-image.png';
    setSaving(true);
    await downloadMedia(item.resultUrl, fileName);
    setSaving(false);
  }

  if (!item) return null;

  const date = new Date(item.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Media — видео cover, фото contain (чтобы было видно целиком) */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={item.resultUrl}
          loop
          playsInline
          autoPlay
          muted
          className="absolute w-full h-full object-cover"
          style={{ top: '-30px', left: 0, right: 0, bottom: 0 }}
        />
      ) : (
        <img
          src={item.resultUrl}
          alt={item.prompt || ''}
          className="absolute w-full object-cover"
          style={{ top: 0, left: 0, right: 0, bottom: '140px' }}
        />
      )}

      {/* Counter */}
      {items.length > 1 && (
        <div
          className="absolute z-20 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-semibold"
          style={{ top: 'calc(var(--safe-top, 0px) + 50px)', left: '16px' }}
        >
          {index + 1} / {items.length}
        </div>
      )}

      {/* Close */}
      <button
        className="absolute z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/25 active:scale-90 transition-transform"
        style={{ top: 'calc(var(--safe-top, 0px) + 50px)', right: '16px' }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Arrows (desktop) */}
      {index > 0 && (
        <button
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform hidden md:flex"
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {index < items.length - 1 && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform hidden md:flex"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}

      {/* Bottom sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-transform duration-300 ease-out ${sheetOpen ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-t from-black via-black/95 to-transparent px-4 pt-10 space-y-3" style={{ paddingBottom: 'calc(5rem + var(--safe-bottom, 0px))' }}>
          <div className="w-10 h-1 rounded-full bg-white/30 mx-auto -mt-6 mb-2" />

          {item.prompt && (
            <p className="text-white/80 text-xs leading-snug line-clamp-3">
              {item.prompt}
            </p>
          )}

          <div className="flex items-center justify-between text-white/50 text-[11px]">
            <span>{date}</span>
            <span>{item.cost} кр.</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-violet-500/25 active:scale-[0.97] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3a9 9 0 019 9"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            )}
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
