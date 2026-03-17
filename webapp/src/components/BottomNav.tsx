import type { Screen } from '../types';

type Props = {
  current: string;
  onNavigate: (screen: Screen) => void;
};

const items = [
  { name: 'home' as const,     label: 'Главная',   icon: '🏠' },
  { name: 'chatList' as const, label: 'Чаты',      icon: '💬' },
  { name: 'imageGen' as const, label: 'Картинки',  icon: '🎨' },
  { name: 'videoGen' as const, label: 'Видео',     icon: '🎬' },
];

export function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1d27] border-t border-white/10 flex">
      {items.map((item) => (
        <button
          key={item.name}
          onClick={() => onNavigate({ name: item.name })}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
            current === item.name
              ? 'text-violet-400'
              : 'text-gray-500 active:text-gray-300'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
