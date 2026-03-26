import { useState, useRef, useEffect, useCallback } from 'react';
import { useLang } from '../LangContext';
import {
  VIDEO_TEMPLATES, MOTION_TEMPLATES, AVATAR_TEMPLATES,
  VIDEO_TAB_CATEGORIES, MOTION_TAB_CATEGORIES, AVATAR_TAB_CATEGORIES,
  type VideoTemplateTab, type AnyCategory, type VideoPromptTemplate,
} from '../data/videoPromptTemplates';

type Props = {
  tab: VideoTemplateTab;
  onSelectTemplate: (prompt: string) => void;
};

// Lazy video — autoplay только когда видно на экране
function LazyVideo({ src, poster, className }: { src: string; poster?: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = ref.current;
        if (!video) return;
        if (entry.isIntersecting) {
          if (!video.src) video.src = src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={containerRef} className={className}>
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function TemplateCard({ tpl, lang, isExpanded, onTap, onUse, useLabel }: {
  tpl: VideoPromptTemplate;
  lang: string;
  isExpanded: boolean;
  onTap: () => void;
  onUse: () => void;
  useLabel: string;
}) {
  return (
    <div
      className="relative group rounded-xl overflow-hidden border border-white/[0.10] bg-white/[0.05]"
      onClick={onTap}
    >
      {tpl.isVideo ? (
        <LazyVideo
          src={tpl.previewUrl}
          poster={tpl.posterUrl}
          className="w-full aspect-[3/4]"
        />
      ) : (
        <img
          src={tpl.previewUrl}
          alt={lang === 'sah' ? tpl.label.sah : tpl.label.ru}
          loading="lazy"
          className="w-full aspect-[3/4] object-cover"
        />
      )}

      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-8">
        <p className="text-white text-xs font-bold leading-tight">
          {lang === 'sah' ? tpl.label.sah : tpl.label.ru}
        </p>
      </div>

      {/* Expanded overlay */}
      {isExpanded && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col justify-between p-3 animate-fade-in">
          <p className="text-white/90 text-[11px] leading-snug line-clamp-6 font-medium">
            {tpl.prompt}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onUse(); }}
            className="mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 active:scale-[0.97] transition-transform"
          >
            {useLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export function VideoPromptGallery({ tab, onSelectTemplate }: Props) {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<AnyCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const templates = tab === 'video' ? VIDEO_TEMPLATES
    : tab === 'motion' ? MOTION_TEMPLATES
    : AVATAR_TEMPLATES;

  const categories = tab === 'video' ? VIDEO_TAB_CATEGORIES
    : tab === 'motion' ? MOTION_TAB_CATEGORIES
    : AVATAR_TAB_CATEGORIES;

  const filtered = activeCategory === 'all'
    ? templates
    : templates.filter(tpl => tpl.category === activeCategory);

  const handleUse = useCallback((prompt: string) => {
    onSelectTemplate(prompt);
  }, [onSelectTemplate]);

  return (
    <div className="space-y-4">
      {/* Category pills — скрываем если только "Все" */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20'
                  : 'bg-white/[0.08] border border-white/[0.12] text-slate-200 active:bg-white/[0.12]'
              }`}
            >
              {lang === 'sah' ? cat.labelSah : cat.labelRu}
            </button>
          ))}
        </div>
      )}

      {/* Templates grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            lang={lang}
            isExpanded={expandedId === tpl.id}
            onTap={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}
            onUse={() => handleUse(tpl.prompt)}
            useLabel={t('video.useTemplate')}
          />
        ))}
      </div>
    </div>
  );
}
