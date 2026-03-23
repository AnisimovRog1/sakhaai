import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { User, Screen, Chat } from '../types';
import { useLang } from '../LangContext';

type Props = {
  user: User;
  onNavigate: (screen: Screen) => void;
};

export function ChatList({ user, onNavigate }: Props) {
  const { t } = useLang();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    api.getChats()
      .then(setChats)
      .catch(console.error)
      .finally(() => setLoadingChats(false));
  }, []);

  function openChat(chat: Chat) {
    onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title });
  }

  async function createNewChat() {
    if (creatingChat) return;
    setCreatingChat(true);
    try {
      const chat = await api.createChat('Новый чат');
      onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title });
    } catch (e) {
      console.error(e);
      setCreatingChat(false);
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

  // Группировка чатов по дате
  function groupChats(list: Chat[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;
    const monthAgo = today - 30 * 86400000;

    const groups: { label: string; items: Chat[] }[] = [
      { label: t('chatList.today'), items: [] },
      { label: t('chatList.yesterday'), items: [] },
      { label: t('chatList.week'), items: [] },
      { label: t('chatList.month'), items: [] },
      { label: t('chatList.earlier'), items: [] },
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

  const grouped = groupChats(chats);

  return (
    <div className="flex flex-col pb-24" style={{ minHeight: 'calc(var(--tg-viewport-height, 100vh) - 130px)' }}>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold text-white">UraanxAI</h1>
        <div className="flex items-center gap-2">
          {/* Поиск */}
          <button className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          {/* Аватар */}
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/20">
              {user.firstName[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>

      {/* ─── Loading ─── */}
      {loadingChats && (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex gap-2">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}
          </div>
        </div>
      )}

      {/* ─── Пустое состояние ─── */}
      {!loadingChats && chats.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <p className="text-white text-lg font-bold mb-2">{t('chatList.startChat')}</p>
          <p className="text-slate-400 text-sm">{t('chatList.startDesc')}</p>
        </div>
      )}

      {/* ─── Список чатов ─── */}
      {!loadingChats && chats.length > 0 && (
        <div className="flex-1 px-3 space-y-5 overflow-y-auto">
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest px-2 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((chat) => (
                  <div key={chat.id} className="relative">
                    {deleteId === chat.id ? (
                      /* Режим удаления */
                      <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="flex-1 text-white text-sm font-medium truncate">{chat.title}</p>
                        <button
                          onClick={() => handleDelete(chat.id)}
                          className="px-3 py-1.5 bg-red-500 rounded-lg text-white text-xs font-bold active:opacity-80"
                        >
                          {t('chatList.delete')}
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="px-3 py-1.5 bg-white/[0.10] rounded-lg text-slate-300 text-xs font-bold active:opacity-80"
                        >
                          {t('chatList.cancel')}
                        </button>
                      </div>
                    ) : (
                      /* Обычный чат */
                      <div className="flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] rounded-xl px-4 py-3.5 backdrop-blur-sm">
                        <button
                          onClick={() => openChat(chat)}
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                            </svg>
                          </div>
                          <span className="text-white text-sm font-semibold truncate">{chat.title}</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteId(chat.id); }}
                          className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.10] flex items-center justify-center flex-shrink-0 active:bg-white/[0.15] transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Кнопка "Новый чат" — фиксирована внизу ─── */}
      <div className="fixed bottom-[68px] right-5 z-10">
        <button
          onClick={createNewChat}
          disabled={creatingChat}
          className="w-14 h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 shadow-xl shadow-violet-500/30 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        >
          {creatingChat ? (
            <div className="flex gap-1">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}
            </div>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          )}
        </button>
      </div>

    </div>
  );
}
