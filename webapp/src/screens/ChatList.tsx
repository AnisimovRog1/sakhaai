import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Chat, Screen } from '../types';

type Props = {
  onNavigate: (screen: Screen) => void;
};

export function ChatList({ onNavigate }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getChats()
      .then(setChats)
      .finally(() => setLoading(false));
  }, []);

  async function createChat() {
    try {
      setError(null);
      const chat = await api.createChat('Новый чат');
      onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания чата');
    }
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

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-0.5">Ассистент</p>
          <h1 className="text-xl font-bold text-slate-100">Мои чаты</h1>
        </div>
        <button
          onClick={createChat}
          className="bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg shadow-violet-500/25 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Новый
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* List */}
      <div className="flex-1 px-5 space-y-2">

        {loading && (
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/[0.03] rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-white/[0.06] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-300 font-semibold">Нет чатов</p>
              <p className="text-slate-500 text-sm mt-1">Начни свой первый разговор с AI</p>
            </div>
            <button
              onClick={createChat}
              className="bg-gradient-to-r from-violet-600 to-cyan-500 rounded-2xl px-6 py-3 font-semibold text-sm shadow-lg shadow-violet-500/25 active:scale-95 transition-all"
            >
              Начать чат
            </button>
          </div>
        )}

        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title })}
            className="w-full bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.07] rounded-2xl px-4 py-3.5 text-left transition-all flex items-center gap-3"
          >
            {/* AI avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-100 font-medium text-sm truncate">{chat.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{formatDate(chat.updated_at)}</p>
            </div>
            {/* Delete */}
            <button
              onClick={(e) => deleteChat(chat.id, e)}
              className="text-slate-700 active:text-red-400 p-1.5 transition-colors rounded-lg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </button>
        ))}

      </div>
    </div>
  );
}
