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

  // Загружаем историю при открытии чата
  useEffect(() => {
    api.getMessages(chatId)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [chatId]);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    // Сразу показываем сообщение пользователя (оптимистичное обновление)
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'model',
          content: '❌ Ошибка. Попробуй ещё раз.',
          created_at: new Date().toISOString(),
        },
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
      {/* Шапка */}
      <div className="flex items-center gap-3 p-4 bg-[#1a1d27] border-b border-white/10 flex-shrink-0">
        <button
          onClick={onBack}
          className="text-gray-400 active:text-white transition-colors text-xl p-1"
        >
          ←
        </button>
        <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center">
          🤖
        </div>
        <p className="font-medium truncate flex-1">{chatTitle}</p>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="text-center text-gray-400 animate-pulse py-4">
            Загрузка...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="text-4xl">🤖</p>
            <p className="text-gray-400 text-sm">Напиши что-нибудь — я отвечу!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-[#1a1d27] text-gray-100 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Индикатор печати */}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-[#1a1d27] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-4 bg-[#0f1117] border-t border-white/10 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            rows={1}
            className="flex-1 bg-[#1a1d27] rounded-2xl px-4 py-3 text-sm resize-none outline-none placeholder-gray-500 text-white max-h-32"
            style={{ lineHeight: '1.4' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-11 h-11 bg-violet-600 rounded-xl flex items-center justify-center disabled:opacity-40 active:bg-violet-700 transition-all flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
