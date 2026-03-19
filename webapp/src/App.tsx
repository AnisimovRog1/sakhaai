import { useEffect, useState } from 'react';
import { api, setToken } from './api/client';
import type { User, Screen } from './types';
import { Home } from './screens/Home';
import { ChatList } from './screens/ChatList';
import { Chat } from './screens/Chat';
import { ImageGen } from './screens/ImageGen';
import { VideoGen } from './screens/VideoGen';
import { Friends } from './screens/Friends';
import { BottomNav } from './components/BottomNav';

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? '';
}

// Фоновые фото для каждого экрана
const base = import.meta.env.BASE_URL;
const BG: Record<string, string> = {
  home:     `${base}bg-home.jpg`,
  chatList: `${base}bg-chatlist.jpg`,
  chat:     `${base}bg-chat.jpg`,
  imageGen: `${base}bg-chat.jpg`,
  videoGen: `${base}bg-video.jpg`,
  friends:  `${base}bg-frends.jpg`,
};

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

  // Синхронизируем CSS-переменную с реальной высотой viewport Telegram
  useEffect(() => {
    function updateHeight() {
      const vh = window.Telegram?.WebApp?.viewportHeight || window.innerHeight;
      document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
    }
    updateHeight();
    window.addEventListener('resize', updateHeight);
    // Telegram WebApp event
    (window.Telegram?.WebApp as any)?.onEvent?.('viewportChanged', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    const wa = window.Telegram?.WebApp;
    wa?.ready();
    wa?.expand();

    // Безопасно пробуем включить полный экран и тёмный хедер
    setTimeout(() => {
      try {
        const w = window.Telegram?.WebApp as any;
        if (w?.requestFullscreen) w.requestFullscreen();
        if (w?.setHeaderColor) w.setHeaderColor('#070b14');
        if (w?.setBackgroundColor) w.setBackgroundColor('#070b14');
        if (w?.disableVerticalSwipes) w.disableVerticalSwipes();
      } catch (e) { /* старая версия Telegram — игнорируем */ }
    }, 100);

    const initData = getInitData();
    const referralCode =
      window.Telegram?.WebApp?.initDataUnsafe?.start_param ||
      new URLSearchParams(window.location.search).get('ref') ||
      undefined;

    if (!initData) {
      setError('Открой приложение через Telegram-бота @UraanxAI_bot');
      setLoading(false);
      return;
    }

    api.auth(initData, referralCode)
      .then(({ token, user }) => {
        setToken(token);
        // Берём реальные данные из Telegram
        const tgU = (window.Telegram?.WebApp as any)?.initDataUnsafe?.user;
        if (tgU?.first_name) user.firstName = tgU.first_name;
        if (tgU?.photo_url) user.photoUrl = tgU.photo_url;
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 text-2xl font-bold text-white">
            U
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
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
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-white font-bold">Ошибка входа</p>
          <p className="text-slate-300 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentBg = BG[screen.name] ?? BG.home;

  return (
    <div className="flex flex-col min-h-screen text-slate-100 relative">

      {/* ─── Фиксированный фон (фото + оверлей + силуэты) ─── */}
      <div className="fixed inset-0 -z-10 max-w-full mx-auto overflow-hidden">
        {/* Фотография */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: `url(${currentBg})` }}
        />
        {/* Тёмный градиент сверху вниз */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-[#070b14]/55 to-[#070b14]/92" />
        {/* Сэргэ на экране видео */}
        {screen.name === 'videoGen' && <SergeSilhouette />}
      </div>

      {/* ─── Контент экранов ─── */}
      {screen.name === 'chat' ? (
        <Chat
          chatId={screen.chatId}
          chatTitle={screen.chatTitle}
          onBack={() => setScreen({ name: 'chatList' })}
        />
      ) : (
        <div className="flex-1 overflow-y-auto pb-20 pt-14">
          {screen.name === 'home' && <Home user={user} />}
          {screen.name === 'chatList' && <ChatList user={user} onNavigate={setScreen} />}
          {screen.name === 'imageGen' && <ImageGen user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />}
          {screen.name === 'videoGen' && <VideoGen user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />}
          {screen.name === 'friends' && <Friends user={user} />}
        </div>
      )}

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
        initDataUnsafe?: { start_param?: string; user?: { photo_url?: string } };
        viewportHeight?: number;
        ready: () => void;
        expand: () => void;
        close: () => void;
        openTelegramLink: (url: string) => void;
        onEvent?: (event: string, callback: () => void) => void;
      };
    };
  }
}

export default App;
