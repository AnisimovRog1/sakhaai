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
import SpaceBackground from './components/SpaceBackground';
import { LangProvider } from './LangContext';
import { getDeviceFingerprint } from './utils/fingerprint';
import type { Lang } from './i18n';

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? '';
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang] = useState<Lang>('ru');

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

    const timezoneOffset = -(new Date().getTimezoneOffset()); // минуты от UTC (положительное = восток)

    // Собираем device fingerprint для антифрода
    getDeviceFingerprint()
      .then((fp) => api.auth(initData, referralCode, timezoneOffset, fp.deviceId, fp.headless))
      .then(({ token, user }) => {
        setToken(token);
        setUser(user);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <img src={`${import.meta.env.BASE_URL}logo-mammoth.png`} alt="" className="w-80 h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070b14] p-6">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0f0520] via-[#1a0a3e] to-[#0d1033]" />
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

  return (
    <LangProvider initialLang={lang}>
    <div className="flex flex-col min-h-screen text-slate-100 relative">

      {/* ─── Космический фон: звёзды + кометы + спутники ─── */}
      <SpaceBackground />

      {/* ─── Контент экранов ─── */}
      {screen.name === 'chat' ? (
        <Chat
          chatId={screen.chatId}
          chatTitle={screen.chatTitle}
          onBack={() => setScreen({ name: 'chatList' })}
        />
      ) : (
        <div className="flex-1 overflow-y-auto overscroll-y-contain" style={{ paddingTop: 'calc(var(--safe-top, 0px) + 4rem)', paddingBottom: 'calc(5rem + var(--safe-bottom, 0px))', overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}>
          <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
            <div style={{ display: screen.name === 'home' ? 'block' : 'none' }}>
              <Home user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />
            </div>
            <div style={{ display: screen.name === 'chatList' ? 'block' : 'none' }}>
              <ChatList user={user} onNavigate={setScreen} />
            </div>
            <div style={{ display: screen.name === 'imageGen' ? 'block' : 'none' }}>
              <ImageGen user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />
            </div>
            <div style={{ display: screen.name === 'videoGen' ? 'block' : 'none' }}>
              <VideoGen user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />
            </div>
            <div style={{ display: screen.name === 'friends' ? 'block' : 'none' }}>
              <Friends user={user} />
            </div>
          </div>
        </div>
      )}

      {screen.name !== 'chat' && (
        <BottomNav current={screen.name} onNavigate={setScreen} />
      )}
    </div>
    </LangProvider>
  );
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: { start_param?: string; user?: { photo_url?: string } };
        platform?: string;
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
