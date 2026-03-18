import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { Message } from '../types';

type Props = {
  chatId: number;
  chatTitle: string;
  onBack: () => void;
};

export function Chat({ chatId, chatTitle, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getMessages(chatId)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    const tempMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const reply = await api.sendMessage(chatId, text);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'model', content: `❌ ${msg}`, created_at: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-[#070b14]/90 backdrop-blur-xl border-b border-white/[0.06] flex-shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/[0.06] active:bg-white/[0.10] flex items-center justify-center transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-md shadow-violet-500/20 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <p className="font-semibold text-slate-100 truncate flex-1">{chatTitle}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex flex-col gap-2 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className={`h-12 w-3/4 rounded-2xl animate-pulse bg-white/[0.04] ${i % 2 === 0 ? 'ml-auto' : ''}`} />
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-white/[0.06] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <p className="text-slate-400 text-sm">Напиши что-нибудь — отвечу!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm shadow-violet-500/20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-sm shadow-md shadow-violet-500/20'
                  : 'bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-500/20">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3.5">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-[#070b14]/90 backdrop-blur-xl border-t border-white/[0.06] flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            rows={1}
            className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm resize-none outline-none placeholder-slate-600 text-slate-100 max-h-32 focus:border-violet-500/40 transition-colors"
            style={{ lineHeight: '1.4' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-11 h-11 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow-md shadow-violet-500/25 flex-shrink-0"
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
