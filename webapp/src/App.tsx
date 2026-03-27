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
import { LangProvider } from './LangContext';
import type { Lang } from './i18n';

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? '';
}

// Фоновые фото — всегда грузим десктопные (HD), на мобиле тоже ок
const base = import.meta.env.BASE_URL;
const BG: Record<string, string> = {
  home:     `${base}bg-home-desktop.jpg`,
  chatList: `${base}bg-chatlist-desktop.jpg`,
  chat:     `${base}bg-chat-desktop.jpg`,
  imageGen: `${base}bg-chat-desktop.jpg`,
  videoGen: `${base}bg-video-desktop.jpg`,
  friends:  `${base}bg-frends-desktop.jpg`,
};

// Разные оверлеи для каждого экрана — подчёркивают уникальность каждого фото
const OVERLAYS: Record<string, string> = {
  // Ледяные скульптуры + Ленские столбы — лёгкий, максимально показываем красоту
  home:     'bg-gradient-to-b from-transparent via-[#070b14]/30 to-[#070b14]/85',
  // Цветные столбы — лёгкий синий оттенок сверху, тёмный низ для контента
  chatList: 'bg-gradient-to-b from-indigo-950/20 via-[#070b14]/40 to-[#070b14]/90',
  // Маяк + северное сияние — потемнее для читаемости чата
  chat:     'bg-gradient-to-b from-[#070b14]/40 via-[#070b14]/65 to-[#070b14]/95',
  // Генерация картинок — фиолетовый акцент (творчество)
  imageGen: 'bg-gradient-to-b from-purple-950/25 via-[#070b14]/50 to-[#070b14]/90',
  // Сэргэ-дерево — бирюзовый оттенок авроры
  videoGen: 'bg-gradient-to-b from-teal-950/20 via-[#070b14]/35 to-[#070b14]/88',
  // Ураса + сэргэ столбы — тёплый оттенок, снизу тёмный чтобы скрыть снег
  friends:  'bg-gradient-to-b from-amber-950/15 via-[#070b14]/35 to-[#070b14]/95',
};

// Предзагрузка всех фонов
const preloadedImages = new Set<string>();
function preloadAllBGs() {
  Object.values(BG).forEach((src) => {
    if (preloadedImages.has(src)) return;
    preloadedImages.add(src);
    const img = new Image();
    img.src = src;
  });
}
preloadAllBGs();

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
      window.location.href = '/landing';
      return;
    }

    const timezoneOffset = -(new Date().getTimezoneOffset()); // минуты от UTC (положительное = восток)
    api.auth(initData, referralCode, timezoneOffset)
      .then(({ token, user }) => {
        setToken(token);
        setUser(user);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-black bg-contain bg-center bg-no-repeat flex flex-col items-center justify-end pb-24"
        style={{ backgroundImage: `url(${base}logo-mammoth-sm.png)` }}
      >
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-cyan-400 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s`, transform: 'rotate(45deg)', borderRadius: '2px' }}
            />
          ))}
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

  const currentOverlay = OVERLAYS[screen.name] ?? OVERLAYS.home;

  return (
    <LangProvider initialLang={lang}>
    <div className="flex flex-col min-h-screen text-slate-100 relative">

      {/* ─── Фиксированный фон: все картинки рендерятся сразу, переключаем opacity ─── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Все фоновые картинки — предзагружены, мгновенный crossfade */}
        {Object.entries(BG).map(([key, src]) => (
          <img
            key={key}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              (BG[screen.name] ?? BG.home) === src ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Градиентный оверлей — разный для каждого экрана */}
        <div className={`absolute inset-0 ${currentOverlay} transition-all duration-500`} />
        {/* Сэргэ на экране видео */}
        {/* Силуэт сэргэ убран */}
      </div>

      {/* ─── Контент экранов ─── */}
      {screen.name === 'chat' ? (
        <Chat
          chatId={screen.chatId}
          chatTitle={screen.chatTitle}
          onBack={() => setScreen({ name: 'chatList' })}
        />
      ) : (
        <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'calc(var(--safe-top, 0px) + 5.5rem)', paddingBottom: 'calc(5rem + var(--safe-bottom, 0px))' }}>
          <div className="max-w-lg mx-auto">
            {screen.name === 'home' && <Home user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />}
            {screen.name === 'chatList' && <ChatList user={user} onNavigate={setScreen} />}
            {screen.name === 'imageGen' && <ImageGen user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />}
            {screen.name === 'videoGen' && <VideoGen user={user} onCreditsUpdate={(c) => setUser({ ...user, credits: c })} />}
            {screen.name === 'friends' && <Friends user={user} />}
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
