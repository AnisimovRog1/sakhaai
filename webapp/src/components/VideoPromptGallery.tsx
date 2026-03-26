import { useState } from 'react';
import { useLang } from '../LangContext';
import {
  VIDEO_TEMPLATES, MOTION_TEMPLATES, AVATAR_TEMPLATES,
  VIDEO_TAB_CATEGORIES, MOTION_TAB_CATEGORIES, AVATAR_TAB_CATEGORIES,
  type VideoTemplateTab, type AnyCategory,
} from '../data/videoPromptTemplates';

type Props = {
  tab: VideoTemplateTab;
  onSelectTemplate: (prompt: string) => void;
};

export function VideoPromptGallery({ tab, onSelectTemplate }: Props) {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<AnyCategory>('all');

  const templates = tab === 'video' ? VIDEO_TEMPLATES
    : tab === 'motion' ? MOTION_TEMPLATES
    : AVATAR_TEMPLATES;

  const categories = tab === 'video' ? VIDEO_TAB_CATEGORIES
    : tab === 'motion' ? MOTION_TAB_CATEGORIES
    : AVATAR_TAB_CATEGORIES;

  const filtered = activeCategory === 'all'
    ? templates
    : templates.filter(tpl => tpl.category === activeCategory);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* ─── Category pills ─── */}
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
              </div>

              {/* Play icon overlay */}
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
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
