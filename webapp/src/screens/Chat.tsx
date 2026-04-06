import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { Message } from '../types';
import { useLang } from '../LangContext';

type Props = {
  chatId: number;
  chatTitle: string;
  onBack: () => void;
};

export function Chat({ chatId, chatTitle, onBack }: Props) {
  const { t } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getMessages(chatId)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function addFile(file: File) {
    if (attachments.length >= 4) return;
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachments(prev => [...prev, reader.result as string]);
    };
    reader.onerror = () => { console.error('FileReader error'); };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) addFile(files[i]);
    e.currentTarget.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) addFile(files[i]);
  }

  function removeAttachment(idx: number) {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  }

  async function sendMessage() {
    const text = input.trim();
    if ((!text && attachments.length === 0) || sending) return;

    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);
    setSending(true);

    const displayText = text || (currentAttachments.length > 0 ? '📎 Вложение' : '');
    const tempMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: displayText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const reply = await api.sendMessage(
        chatId,
        text,
        currentAttachments.length > 0 ? currentAttachments : undefined
      );
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      if (msg.includes('Лимит 50') || msg.includes('limit_reached')) {
        setLimitReached(true);
      }
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'model', content: msg, created_at: new Date().toISOString() },
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
    <div
      className="flex flex-col tg-viewport max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto w-full"
      style={{ paddingTop: 'calc(var(--safe-top, 0px) + 2.5rem)' }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >

      {/* Drag overlay */}
      {dragging && (
        <div className="fixed inset-0 z-50 bg-violet-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-[#0f1520] border-2 border-dashed border-violet-500 rounded-2xl px-8 py-6 text-white font-bold text-lg">
            Перетащите файл сюда
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#070b14]/90 backdrop-blur-xl border-b border-white/[0.08] flex-shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/[0.08] active:bg-white/[0.14] flex items-center justify-center transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-md shadow-violet-500/20 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <p className="font-bold text-white truncate flex-1">{chatTitle}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex flex-col gap-2 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className={`h-12 w-3/4 rounded-2xl animate-pulse bg-white/[0.05] ${i % 2 === 0 ? 'ml-auto' : ''}`} />
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white rounded-br-sm'
                  : 'glass-neon text-slate-100 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div className="glass-neon rounded-2xl rounded-bl-sm px-4 py-3.5">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative flex-shrink-0">
              <img src={att} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/[0.15]" />
              <button
                onClick={() => removeAttachment(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input or Limit Reached */}
      <div className="px-4 py-3 bg-[#070b14]/90 backdrop-blur-xl border-t border-white/[0.08] flex-shrink-0 pb-safe">
        {limitReached ? (
          <div className="text-center space-y-2">
            <p className="text-slate-400 text-sm">Лимит 50 сообщений достигнут</p>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-violet-500/25"
            >
              Создать новый чат
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            {/* Скрепка */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/[0.10] flex items-center justify-center active:bg-white/[0.15] transition-colors flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              rows={1}
              className="flex-1 bg-white/[0.08] border border-white/[0.10] rounded-2xl px-4 py-3 text-base font-medium resize-none outline-none placeholder-slate-500 text-white max-h-32 focus:border-violet-500/50 transition-colors"
              style={{ lineHeight: '1.4' }}
            />
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && attachments.length === 0) || sending}
              className="w-11 h-11 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow-md shadow-violet-500/25 flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
