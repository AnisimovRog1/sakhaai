import { useEffect, useState } from 'react';
import { api, setToken } from './api/client';
import type { User, Screen } from './types';
import { Home } from './screens/Home';
import { ChatList } from './screens/ChatList';
import { Chat } from './screens/Chat';
import { ImageGen } from './screens/ImageGen';
import { VideoGen } from './screens/VideoGen';
import { BottomNav } from './components/BottomNav';

// Получаем initData из Telegram WebApp API
// В браузере вне Telegram это будет пустая строка (для разработки)
function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? '';
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Сигнализируем Telegram, что приложение готово (убирает лоадер)
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();

    const initData = getInitData();
    // start_param содержит реферальный код вида "ref_123456"
    const referralCode = window.Telegram?.WebApp?.initDataUnsafe?.start_param ?? undefined;

    // Если initData пустой — приложение открыто не через Telegram
    if (!initData) {
      setError('Открой приложение через Telegram-бота @UraanxAI_bot');
      setLoading(false);
      return;
    }

    // Авторизуемся через наш сервер
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
      <div className="flex items-center justify-center min-h-screen bg-[#0f1117]">
        <div className="text-white text-lg animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1117] p-4">
        <div className="text-red-400 text-center">
          <p className="text-xl font-bold mb-2">Ошибка</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#0f1117] text-white">
      {/* Контент экрана */}
      <div className="flex-1 overflow-y-auto pb-20">
        {screen.name === 'home' && (
          <Home
            user={user}
            onNavigate={setScreen}
          />
        )}
        {screen.name === 'chatList' && (
          <ChatList
            onNavigate={setScreen}
          />
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

      {/* Нижняя навигация (скрываем только внутри чата) */}
      {screen.name !== 'chat' && (
        <BottomNav current={screen.name} onNavigate={setScreen} />
      )}
    </div>
  );
}

// Глобальный тип для Telegram WebApp API
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
