import { useState } from 'react';
import { useLang } from '../LangContext';
import { VIDEO_CATEGORIES, VIDEO_PROMPT_TEMPLATES, type VideoTemplateCategory, type VideoTemplateTab } from '../data/videoPromptTemplates';

type Props = {
  filterTab?: VideoTemplateTab;
  onSelectTemplate: (prompt: string) => void;
};

export function VideoPromptGallery({ filterTab, onSelectTemplate }: Props) {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<VideoTemplateCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = VIDEO_PROMPT_TEMPLATES
    .filter(tpl => !filterTab || tpl.tab === filterTab)
    .filter(tpl => activeCategory === 'all' || tpl.category === activeCategory);

  // Hide categories with 0 items for current filterTab
  const visibleCategories = VIDEO_CATEGORIES.filter(cat => {
    if (cat.id === 'all') return true;
    return VIDEO_PROMPT_TEMPLATES.some(
      tpl => tpl.category === cat.id && (!filterTab || tpl.tab === filterTab)
    );
  });

  return (
    <div className="space-y-4">
      {/* ─── Category pills ─── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {visibleCategories.map((cat) => (
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

      {/* ─── Templates grid ─── */}
      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((tpl) => {
          const isExpanded = expandedId === tpl.id;
          return (
            <div
              key={tpl.id}
              className="relative group rounded-xl overflow-hidden border border-white/[0.10] bg-white/[0.05]"
              onClick={() => setExpandedId(isExpanded ? null : tpl.id)}
            >
              {/* Preview image */}
              <img
                src={tpl.previewUrl}
                alt={lang === 'sah' ? tpl.label.sah : tpl.label.ru}
                loading="lazy"
                className="w-full aspect-[3/4] object-cover"
              />

              {/* Label overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-8">
                <p className="text-white text-xs font-bold leading-tight">
                  {lang === 'sah' ? tpl.label.sah : tpl.label.ru}
                </p>
                {tpl.tab === 'avatar' && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/80 text-white">
                    Аватар
                  </span>
                )}
              </div>

              {/* Expanded overlay with prompt + use button */}
              {isExpanded && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col justify-between p-3 animate-fade-in">
                  <p className="text-white/90 text-[11px] leading-snug line-clamp-6 font-medium">
                    {tpl.prompt}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(tpl.prompt);
                    }}
                    className="mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 active:scale-[0.97] transition-transform"
                  >
                    {t('video.useTemplate')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
