import type { Screen } from '../types';

type Props = {
  current: string;
  onNavigate: (screen: Screen) => void;
};

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V13h6v8"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="14" height="12" rx="2"/>
    <path d="M16 10l6-4v12l-6-4V10z"/>
  </svg>
);

const FriendsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const items = [
  { name: 'home'     as const, label: 'Главная',  Icon: HomeIcon    },
  { name: 'chatList' as const, label: 'Чаты',     Icon: ChatIcon    },
  { name: 'imageGen' as const, label: 'Картинки', Icon: ImageIcon   },
  { name: 'videoGen' as const, label: 'Видео',    Icon: VideoIcon   },
  { name: 'friends'  as const, label: 'Друзья',   Icon: FriendsIcon },
];

export function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-[#070b14]/95 backdrop-blur-xl border-t border-white/[0.08]">
      <div className="flex">
        {items.map(({ name, label, Icon }) => {
          const active = current === name;
          return (
            <button
              key={name}
              onClick={() => onNavigate({ name })}
              className="flex-1 flex flex-col items-center gap-1 py-3 px-1 transition-all duration-200 relative"
            >
              <div className={`transition-all duration-200 ${active ? 'text-blue-400' : 'text-slate-500'}`}>
                <Icon />
              </div>
              <span className={`text-[10px] font-bold transition-all duration-200 ${
                active
                  ? 'text-blue-400'
                  : 'text-slate-500'
              }`}>
                {label}
              </span>
              {active && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="h-safe-bottom" />
    </nav>
  );
}
