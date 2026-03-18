import { useEffect, useState } from 'react';
import { api, setToken } from './api/client';
import type { User, Screen } from './types';
import { Home } from './screens/Home';
import { ChatList } from './screens/ChatList';
import { Chat } from './screens/Chat';
import { ImageGen } from './screens/ImageGen';
import { VideoGen } from './screens/VideoGen';
import { BottomNav } from './components/BottomNav';

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? '';
}

// Фоновые фото для каждого экрана
const BG: Record<string, string> = {
  // Северное сияние над тёмным лесом — имитация Ленских столбов
  home:
    'https://images.unsplash.com/photo-1743677527481-e7927f07c77c?w=1080&q=90&fit=crop&crop=top',
  // Аврора над одиноким деревом в снегу
  chatList:
    'https://images.unsplash.com/photo-1769779672756-3531f3313163?w=1080&q=90&fit=crop',
  // Яркая аврора над ночным пейзажем
  chat:
    'https://images.unsplash.com/photo-1742309515288-b42bb61da9c7?w=1080&q=90&fit=crop',
  // Сибирская река зимой — тайга Якутии
  imageGen:
    'https://images.unsplash.com/photo-1644155807115-8b9f4858472f?w=1080&q=90&fit=crop',
  // Зелёная аврора над снежным ночным пейзажем
  videoGen:
    'https://images.unsplash.com/photo-1771258086117-110d15f19e53?w=1080&q=90&fit=crop',
};

// Силуэт Ленских столбов — уникальные скальные колонны Якутии
function LenaPillars() {
  return (
    <svg
      viewBox="0 0 390 220"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-0 left-0 w-full"
      preserveAspectRatio="xMidYMax meet"
    >
      <path
        d="
          M0,220 L0,160
          L8,155 L12,130 L15,125 L18,140 L22,135 L25,105
          L28,98 L31,90 L34,85 L36,92 L38,80 L41,75 L44,88
          L46,82 L49,70 L52,62 L54,58 L56,65 L58,55 L61,48
          L63,52 L65,40 L67,35 L69,42 L71,30 L73,25 L75,32
          L77,20 L79,15 L81,22 L83,30 L85,25 L87,18 L89,14
          L91,20 L93,28 L95,22 L97,15 L99,10 L101,16 L103,24
          L105,18 L107,12 L109,8  L111,14 L113,22 L115,16
          L117,28 L119,22 L121,30 L123,35 L125,28 L127,38
          L129,30 L131,42 L133,36 L135,48 L137,40 L139,52
          L141,45 L143,55 L145,48 L147,62 L149,55 L151,68
          L153,60 L155,72 L157,65 L159,75 L161,68 L163,80
          L165,72 L167,85 L169,78 L171,92 L173,85 L175,98
          L177,90 L179,105 L181,95 L183,112 L185,102 L187,118
          L189,108 L191,125 L193,115 L195,130 L197,120 L199,138
          L201,128 L203,142 L205,132 L207,148 L209,138 L211,152
          L213,142 L215,155 L217,145 L219,158 L221,150 L225,155
          L230,148 L234,160 L238,152 L242,162 L246,155 L250,165
          L255,158 L260,168 L265,160 L270,170 L275,162 L280,172
          L285,165 L290,175 L295,168 L300,175 L305,170 L310,178
          L315,172 L320,180 L325,174 L330,182 L335,176 L340,184
          L345,178 L350,186 L355,180 L360,188 L365,183 L370,190
          L375,185 L380,192 L385,188 L390,192
          L390,220 Z
        "
        fill="#070b14"
        opacity="0.97"
      />
      {/* Река у подножия */}
      <ellipse cx="195" cy="215" rx="200" ry="6" fill="#0a1628" opacity="0.6" />
    </svg>
  );
}

// Силуэт сэргэ — традиционные якутские столбы с аурой на площади
function SergeSilhouette() {
  return (
    <svg
      viewBox="0 0 390 260"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-0 left-0 w-full"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Земля / площадь */}
      <rect x="0" y="220" width="390" height="40" fill="#070b14" />

      {/* Сэргэ 1 — центральный, высокий */}
      <rect x="183" y="80" width="10" height="140" fill="#070b14" opacity="0.95" rx="2" />
      {/* Перекладина центральная */}
      <rect x="168" y="110" width="40" height="6" fill="#070b14" opacity="0.95" rx="2" />
      {/* Декоративный навершие */}
      <polygon points="188,75 193,85 183,85" fill="#070b14" opacity="0.95" />
      {/* Горизонтальная секция */}
      <rect x="178" y="140" width="20" height="4" fill="#070b14" opacity="0.95" rx="1" />

      {/* Сэргэ 2 — левый */}
      <rect x="110" y="110" width="8" height="110" fill="#070b14" opacity="0.92" rx="2" />
      <rect x="98" y="138" width="32" height="5" fill="#070b14" opacity="0.92" rx="2" />
      <polygon points="114,106 118,114 110,114" fill="#070b14" opacity="0.92" />
      <rect x="106" y="160" width="16" height="3" fill="#070b14" opacity="0.92" rx="1" />

      {/* Сэргэ 3 — правый */}
      <rect x="268" y="115" width="8" height="105" fill="#070b14" opacity="0.92" rx="2" />
      <rect x="256" y="140" width="32" height="5" fill="#070b14" opacity="0.92" rx="2" />
      <polygon points="272,111 276,119 268,119" fill="#070b14" opacity="0.92" />
      <rect x="264" y="163" width="16" height="3" fill="#070b14" opacity="0.92" rx="1" />

      {/* Маленький сэргэ 4 */}
      <rect x="48" y="145" width="6" height="75" fill="#070b14" opacity="0.85" rx="1" />
      <rect x="39" y="165" width="24" height="4" fill="#070b14" opacity="0.85" rx="1" />

      {/* Маленький сэргэ 5 */}
      <rect x="334" y="150" width="6" height="70" fill="#070b14" opacity="0.85" rx="1" />
      <rect x="326" y="168" width="22" height="4" fill="#070b14" opacity="0.85" rx="1" />

      {/* Ленты/отражение света от авроры на сэргэ */}
      <line x1="188" y1="116" x2="182" y2="135" stroke="#7c3aed" strokeWidth="1" opacity="0.3" />
      <line x1="114" y1="143" x2="108" y2="158" stroke="#06b6d4" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();

    const initData = getInitData();
    const referralCode = window.Telegram?.WebApp?.initDataUnsafe?.start_param ?? undefined;

    if (!initData) {
      setError('Открой приложение через Telegram-бота @UraanxAI_bot');
      setLoading(false);
      return;
    }

    api.auth(initData, referralCode)
      .then(({ token, user }) => {
        setToken(token);
        setUser(user);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070b14]">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG.home})` }}
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-[#070b14]/60 to-[#070b14]/95" />
        <div className="relative flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/40 text-2xl font-bold">
            ✦
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070b14] p-6">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG.home})` }}
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/50 to-[#070b14]/95" />
        <div className="relative w-full max-w-sm bg-white/[0.06] border border-white/[0.08] rounded-3xl p-6 text-center space-y-3 backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-slate-100 font-semibold">Ошибка входа</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentBg = BG[screen.name] ?? BG.home;

  return (
    <div className="flex flex-col min-h-screen text-slate-100 relative">

      {/* ─── Фиксированный фон (фото + оверлей + силуэты) ─── */}
      <div className="fixed inset-0 -z-10 max-w-[480px] mx-auto overflow-hidden">
        {/* Фотография */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: `url(${currentBg})` }}
        />
        {/* Тёмный градиент сверху вниз */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-[#070b14]/55 to-[#070b14]/92" />
        {/* Ленские столбы на главном экране */}
        {screen.name === 'home' && <LenaPillars />}
        {/* Сэргэ на экране видео */}
        {screen.name === 'videoGen' && <SergeSilhouette />}
      </div>

      {/* ─── Контент экранов ─── */}
      <div className="flex-1 overflow-y-auto pb-20">
        {screen.name === 'home' && (
          <Home user={user} onNavigate={setScreen} />
        )}
        {screen.name === 'chatList' && (
          <ChatList onNavigate={setScreen} />
        )}
        {screen.name === 'chat' && (
          <Chat
            chatId={screen.chatId}
            chatTitle={screen.chatTitle}
            onBack={() => setScreen({ name: 'chatList' })}
          />
        )}
        {screen.name === 'imageGen' && (
          <ImageGen user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />
        )}
        {screen.name === 'videoGen' && (
          <VideoGen user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />
        )}
      </div>

      {screen.name !== 'chat' && (
        <BottomNav current={screen.name} onNavigate={setScreen} />
      )}
    </div>
  );
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: { start_param?: string };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export default App;
