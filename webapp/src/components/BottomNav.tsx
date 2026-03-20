import type { Screen } from '../types';

type Props = {
  current: string;
  onNavigate: (screen: Screen) => void;
};

// ─── Якутские Aurora-иконки ─────────────────────────────

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {active && (
      <defs>
        <linearGradient id="gHome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
    )}
    {/* Дом с якутским орнаментом-крышей */}
    <path d="M3 10.5L12 3l9 7.5" stroke={active ? 'url(#gHome)' : 'currentColor'} strokeWidth="2"/>
    <path d="M5 9.5V20a1 1 0 001 1h12a1 1 0 001-1V9.5" stroke={active ? 'url(#gHome)' : 'currentColor'} strokeWidth="1.8"/>
    <path d="M9 21V14h6v7" stroke={active ? 'url(#gHome)' : 'currentColor'} strokeWidth="1.8"/>
    {/* Якутский ромбик на крыше */}
    <path d="M12 7l1.5 2h-3L12 7z" fill={active ? '#8B5CF6' : 'none'} stroke={active ? 'url(#gHome)' : 'currentColor'} strokeWidth="0.8"/>
  </svg>
);

const ChatIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {active && (
      <defs>
        <linearGradient id="gChat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
    )}
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={active ? 'url(#gChat)' : 'currentColor'} strokeWidth="1.8"/>
    {/* Три точки — AI думает */}
    {active ? (
      <>
        <circle cx="8" cy="10" r="1.2" fill="url(#gChat)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="12" cy="10" r="1.2" fill="url(#gChat)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="16" cy="10" r="1.2" fill="url(#gChat)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
        </circle>
      </>
    ) : (
      <>
        <circle cx="8" cy="10" r="1" fill="currentColor" opacity="0.5"/>
        <circle cx="12" cy="10" r="1" fill="currentColor" opacity="0.5"/>
        <circle cx="16" cy="10" r="1" fill="currentColor" opacity="0.5"/>
      </>
    )}
  </svg>
);

const ImageIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {active && (
      <defs>
        <linearGradient id="gImg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
    )}
    <rect x="3" y="3" width="18" height="18" rx="3" stroke={active ? 'url(#gImg)' : 'currentColor'} strokeWidth="1.8"/>
    {/* Северное сияние внутри рамки */}
    {active ? (
      <>
        <path d="M3 15l4-4 3 3 4-5 7 6" stroke="url(#gImg)" strokeWidth="1.5" fill="none"/>
        <circle cx="8.5" cy="8.5" r="1.8" fill="url(#gImg)" opacity="0.8">
          <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite"/>
        </circle>
      </>
    ) : (
      <>
        <path d="M3 15l4-4 3 3 4-5 7 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.4"/>
      </>
    )}
  </svg>
);

const VideoIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {active && (
      <defs>
        <linearGradient id="gVid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
    )}
    <rect x="2" y="5" width="15" height="14" rx="2.5" stroke={active ? 'url(#gVid)' : 'currentColor'} strokeWidth="1.8"/>
    <path d="M17 9.5l5-3v11l-5-3v-5z" stroke={active ? 'url(#gVid)' : 'currentColor'} strokeWidth="1.8"/>
    {/* Play-треугольник внутри */}
    {active && (
      <polygon points="8,8.5 8,15.5 13.5,12" fill="url(#gVid)" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
      </polygon>
    )}
  </svg>
);

const FriendsIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {active && (
      <defs>
        <linearGradient id="gFri" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
    )}
    <circle cx="9" cy="7" r="3.5" stroke={active ? 'url(#gFri)' : 'currentColor'} strokeWidth="1.8"/>
    <path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2" stroke={active ? 'url(#gFri)' : 'currentColor'} strokeWidth="1.8"/>
    {/* Второй человек — полупрозрачный */}
    <circle cx="17" cy="8" r="2.5" stroke={active ? 'url(#gFri)' : 'currentColor'} strokeWidth="1.5" opacity={active ? '0.7' : '0.5'}/>
    <path d="M19 21v-1a4 4 0 00-2.5-3.7" stroke={active ? 'url(#gFri)' : 'currentColor'} strokeWidth="1.5" opacity={active ? '0.7' : '0.5'}/>
    {/* Плюсик — добавить друга */}
    {active && (
      <g opacity="0.8">
        <line x1="21" y1="12" x2="21" y2="16" stroke="url(#gFri)" strokeWidth="1.8"/>
        <line x1="19" y1="14" x2="23" y2="14" stroke="url(#gFri)" strokeWidth="1.8"/>
      </g>
    )}
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
              className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1 transition-all duration-300 relative"
            >
              {/* Glow за иконкой */}
              {active && (
                <div className="absolute top-1 w-10 h-10 rounded-full bg-violet-500/20 blur-xl" />
              )}
              <div className={`relative transition-all duration-300 ${active ? 'scale-110' : 'text-slate-500'}`}>
                <Icon active={active} />
              </div>
              <span className={`text-[10px] font-bold transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent'
                  : 'text-slate-500'
              }`}>
                {label}
              </span>
              {active && (
                <div className="absolute bottom-0 w-10 h-[3px] bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="h-safe-bottom" />
    </nav>
  );
}
