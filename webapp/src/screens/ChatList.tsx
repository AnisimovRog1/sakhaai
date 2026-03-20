import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { User, Screen, Chat } from '../types';

type Props = {
  user: User;
  onNavigate: (screen: Screen) => void;
};

const QUICK_ACTIONS = [
  'Проведи исследование',
  'Помоги написать текст',
  'Дай совет',
  'Переведи на якутский',
];

export function ChatList({ user, onNavigate }: Props) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const tgPhotoUrl = user.photoUrl;

  // Загружаем историю чатов
  useEffect(() => {
    api.getChats()
      .then((list) => setChats(list))
      .catch(console.error)
      .finally(() => setLoadingChats(false));
  }, []);

  async function startChat(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msg = text.trim();
      const chat = await api.createChat(msg.slice(0, 40));
      await api.sendMessage(chat.id, msg);
      onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title });
    } catch {
      setSending(false);
    }
  }

  async function handleDelete(chatId: number) {
    try {
      await api.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (e) {
      console.error(e);
    }
    setDeleteId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startChat(input);
    }
  }

  function openChat(chat: Chat) {
    onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title });
  }

  // Группировка чатов по дате
  function groupChats(list: Chat[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;
    const monthAgo = today - 30 * 86400000;

    const groups: { label: string; items: Chat[] }[] = [
      { label: 'Сегодня', items: [] },
      { label: 'Вчера', items: [] },
      { label: 'Последние 7 дней', items: [] },
      { label: 'Последние 30 дней', items: [] },
      { label: 'Ранее', items: [] },
    ];

    for (const chat of list) {
      const t = new Date(chat.updated_at || chat.created_at).getTime();
      if (t >= today) groups[0].items.push(chat);
      else if (t >= yesterday) groups[1].items.push(chat);
      else if (t >= weekAgo) groups[2].items.push(chat);
      else if (t >= monthAgo) groups[3].items.push(chat);
      else groups[4].items.push(chat);
    }

    return groups.filter((g) => g.items.length > 0);
  }

  const hasChats = chats.length > 0;
  const grouped = hasChats ? groupChats(chats) : [];

  return (
    <div className="flex flex-col px-4" style={{ minHeight: 'calc(var(--tg-viewport-height, 100vh) - 130px)' }}>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between pb-3">
        <div className="w-9" />
        <p className="text-white text-lg font-bold">UraanxAI</p>
        {tgPhotoUrl ? (
          <img src={tgPhotoUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/20">
            {user.firstName[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* ─── Если нет чатов — приветствие (как раньше) ─── */}
      {!hasChats && !loadingChats && (
        <div className="flex-1 flex items-center justify-center px-4">
          {sending ? (
            <div className="text-center space-y-4">
              <div className="flex gap-2 justify-center">
                {[0,1,2].map(i => (
                  <div key={i} className="w-3 h-3 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-slate-300 text-sm font-medium">Отправляю и жду ответ AI...</p>
            </div>
          ) : (
            <p className="text-3xl font-bold text-center text-white leading-snug">
              Здравствуйте,
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                {user.firstName}!
              </span>
            </p>
          )}
        </div>
      )}

      {/* ─── История чатов ─── */}
      {hasChats && (
        <div className="flex-1 space-y-4 pb-3 overflow-y-auto">
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider px-1 mb-2">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((chat) => (
                  <div key={chat.id} className="relative group">
                    <button
                      onClick={() => openChat(chat)}
                      className="w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 active:bg-white/[0.08] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                      </div>
                      <span className="text-white text-sm font-medium truncate flex-1">{chat.title}</span>
                    </button>

                    {/* Кнопка удаления — при свайпе или long press */}
                    {deleteId === chat.id ? (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
                        <button
                          onClick={() => handleDelete(chat.id)}
                          className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold"
                        >
                          Удалить
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="px-3 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded-lg text-slate-300 text-xs font-bold"
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(chat.id); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loadingChats && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-2">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}
          </div>
        </div>
      )}

      {/* ─── Bottom: actions + input ─── */}
      <div className="space-y-3 pb-2 pt-2">
        {/* Quick Actions */}
        {!sending && (
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => startChat(action)}
                disabled={sending}
                className="flex-shrink-0 bg-white/[0.08] border border-white/[0.12] rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-200 active:bg-white/[0.14] transition-all whitespace-nowrap disabled:opacity-40"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 bg-white/[0.08] border border-white/[0.12] rounded-2xl px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спросите UraanxAI"
              disabled={sending}
              className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-400 outline-none"
            />
          </div>
          <button
            onClick={() => startChat(input)}
            disabled={!input.trim() || sending}
            className="w-11 h-11 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow-md shadow-violet-500/25 flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        {/* Sending indicator */}
        {sending && hasChats && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}
            </div>
            <span className="text-slate-300 text-xs font-medium">Создаю чат...</span>
          </div>
        )}
      </div>

    </div>
  );
}
