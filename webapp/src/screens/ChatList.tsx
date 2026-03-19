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

  const tgPhotoUrl = (window.Telegram?.WebApp as any)?.initDataUnsafe?.user?.photo_url as string | undefined;
  const firstName = user.firstName || 'друг';

  async function startChat(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const chat = await api.createChat(text.trim().slice(0, 40));
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
    <div className="flex flex-col" style={{ minHeight: 'calc(var(--tg-viewport-height, 100vh) - 64px)' }}>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        {/* Menu placeholder for balance */}
        <div className="w-9" />
        {/* App name */}
        <div className="text-center">
          <p className="text-white text-lg font-bold">UraanxAI</p>
        </div>
        {/* TG Avatar */}
        {tgPhotoUrl ? (
          <img
            src={tgPhotoUrl}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/20">
            {firstName[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* ─── Greeting ─── */}
      <div className="flex-1 flex items-center justify-center px-8">
        <p className="text-3xl font-bold text-center text-white leading-snug">
          Здравствуйте,
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">{firstName}!</span>
        </p>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="px-5 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => startChat(action)}
              disabled={sending}
              className="flex-shrink-0 bg-white/[0.08] border border-white/[0.12] rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-200 active:bg-white/[0.14] transition-all whitespace-nowrap"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Input ─── */}
      <div className="px-5 pb-5">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-white/[0.08] border border-white/[0.12] rounded-2xl px-4 py-3 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спросите UraanxAI"
              disabled={sending}
              className="flex-1 bg-transparent text-sm font-medium text-white placeholder-slate-400 outline-none"
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
