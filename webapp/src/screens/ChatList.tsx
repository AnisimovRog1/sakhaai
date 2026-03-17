import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Chat, Screen } from '../types';

type Props = {
  onNavigate: (screen: Screen) => void;
};

export function ChatList({ onNavigate }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getChats()
      .then(setChats)
      .finally(() => setLoading(false));
  }, []);

  async function createChat() {
    const chat = await api.createChat('Новый чат');
    onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title });
  }

  async function deleteChat(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    await api.deleteChat(id);
    setChats((prev) => prev.filter((c) => c.id !== id));
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 pt-6">
        <h1 className="text-xl font-bold">Чаты</h1>
        <button
          onClick={createChat}
          className="bg-violet-600 active:bg-violet-700 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          + Новый
        </button>
      </div>

      {/* Список */}
      <div className="flex-1 px-4 space-y-2">
        {loading && (
          <div className="text-center text-gray-400 py-10 animate-pulse">
            Загрузка...
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-5xl">💬</p>
            <p className="text-gray-400">Нет чатов</p>
            <button
              onClick={createChat}
              className="bg-violet-600 rounded-xl px-6 py-3 font-medium"
            >
              Начать первый чат
            </button>
          </div>
        )}

        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title })}
            className="w-full bg-[#1a1d27] active:bg-[#22263a] rounded-2xl p-4 text-left transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-violet-600/30 flex items-center justify-center text-lg flex-shrink-0">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{chat.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{formatDate(chat.updated_at)}</p>
            </div>
            <button
              onClick={(e) => deleteChat(chat.id, e)}
              className="text-gray-600 active:text-red-400 p-1 transition-colors"
            >
              ✕
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
