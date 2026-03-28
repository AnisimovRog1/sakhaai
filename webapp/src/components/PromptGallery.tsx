import { useState, useEffect } from 'react';
import { useLang } from '../LangContext';
import { CATEGORIES, PROMPT_TEMPLATES, type TemplateCategory, type PromptTemplate } from '../data/promptTemplates';

type Props = {
  onSelectTemplate: (prompt: string, imageUrl?: string) => void;
};

// Полноэкранный просмотр картинки с bottom sheet
function FullscreenViewer({ tpl, onClose, onUse, useLabel }: {
  tpl: PromptTemplate;
  onClose: () => void;
  onUse: () => void;
  useLabel: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSheetOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black" onClick={onClose}>
      {/* Картинка на весь экран без зазоров */}
      <img
        src={tpl.previewUrl}
        alt={tpl.label.ru}
        className="absolute w-full h-full object-cover"
        style={{ top: '-30px', left: 0, right: 0, bottom: 0 }}
      />

      {/* Кнопка закрытия */}
      <button
        className="absolute z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/25 active:scale-90 transition-transform"
        style={{ top: 'calc(var(--safe-top, 0px) + 50px)', right: '16px' }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Bottom sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-transform duration-300 ease-out ${sheetOpen ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-t from-black via-black/95 to-transparent px-4 pb-8 pt-10 space-y-3">
          <div className="w-10 h-1 rounded-full bg-white/30 mx-auto -mt-6 mb-2" />

          <p className="text-white text-sm font-bold">
            {tpl.label.ru}
          </p>
          <p className="text-white/80 text-xs leading-snug line-clamp-4">
            {tpl.prompt}
          </p>

          <button
            onClick={onUse}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-violet-500/25 active:scale-[0.97] transition-transform"
          >
            {useLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromptGallery({ onSelectTemplate }: Props) {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTpl, setSelectedTpl] = useState<PromptTemplate | null>(null);

  const filtered = activeCategory === 'all'
    ? PROMPT_TEMPLATES
    : PROMPT_TEMPLATES.filter(tpl => tpl.category === activeCategory);

  const handleUse = (tpl: PromptTemplate) => {
    setSelectedTpl(null);
    onSelectTemplate(tpl.prompt, tpl.previewUrl);
  };

  return (
    <div className="space-y-4">
      {/* ─── Category pills ─── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {CATEGORIES.map((cat) => (
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {filtered.map((tpl, i) => (
          <div
            key={tpl.id}
            className="relative rounded-xl overflow-hidden border border-white/[0.10] bg-white/[0.05] active:scale-[0.97] transition-transform"
            onClick={() => setSelectedTpl(tpl)}
          >
            <img
              src={tpl.previewUrl}
              alt={tpl.label.ru}
              loading={i < 4 ? 'eager' : 'lazy'}
              className="w-full aspect-[3/4] object-cover"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 pt-6">
              <p className="text-white text-xs font-bold leading-tight">
                {tpl.label.ru}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Полноэкранный просмотр с bottom sheet */}
      {selectedTpl && (
        <FullscreenViewer
          tpl={selectedTpl}
          onClose={() => setSelectedTpl(null)}
          onUse={() => handleUse(selectedTpl)}
          useLabel={t('image.useTemplate')}
        />
      )}
    </div>
  );
}
