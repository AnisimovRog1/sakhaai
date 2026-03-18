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
        {/* Aurora orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-2xl">✦</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 animate-bounce"
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
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-sm bg-white/[0.04] border border-white/[0.06] rounded-3xl p-6 text-center space-y-3">
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

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-100 relative">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/3 w-96 h-96 bg-violet-600/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-cyan-500/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-1/4 w-64 h-64 bg-indigo-600/[0.06] rounded-full blur-3xl" />
      </div>

      {/* Screen content */}
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
