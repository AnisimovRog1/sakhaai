import { useState } from 'react';
import { api } from '../api/client';
import type { User, Screen } from '../types';

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

  const tgPhotoUrl = user.photoUrl;

  async function startChat(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msg = text.trim();
      // 1. Создаём чат
      const chat = await api.createChat(msg.slice(0, 40));
      // 2. Отправляем сообщение и ЖДЁМ ответа
      await api.sendMessage(chat.id, msg);
      // 3. Только после ответа переходим в чат — там уже будет история
      onNavigate({ name: 'chat', chatId: chat.id, chatTitle: chat.title });
    } catch {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startChat(input);
    }
  }

  return (
    <div className="flex flex-col justify-between px-4" style={{ minHeight: 'calc(var(--tg-viewport-height, 100vh) - 130px)' }}>

      {/* ─── Top ─── */}
      <div>
        <div className="flex items-center justify-between pb-2">
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
      </div>

      {/* ─── Greeting ─── */}
      <div className="flex-1 flex items-center justify-center px-4">
        {sending ? (
          <div className="text-center space-y-4">
            <div className="flex gap-2 justify-center">
              {[0,1,2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-slate-300 text-sm font-medium">Отправляю и жду ответ AI...</p>
          </div>
        ) : (
          <p className="text-3xl font-bold text-center text-white leading-snug">
            Здравствуйте,
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {user.firstName}!
            </span>
          </p>
        )}
      </div>

      {/* ─── Bottom: actions + input ─── */}
      <div className="space-y-3 pb-2">
        {/* Quick Actions */}
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
            className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow-md shadow-blue-500/25 flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
