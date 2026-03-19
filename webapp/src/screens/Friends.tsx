import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { User, ReferralStats, ReferralFriend } from '../types';

type Props = {
  user: User;
};

const PACKAGE_LABELS: Record<string, string> = {
  start:  'Старт',
  basic:  'Базовый',
  pro:    'Про',
  max:    'Макс',
};

const REWARDS: Record<string, number> = {
  start:  200,
  basic:  600,
  pro:    1500,
  max:    4000,
};

export function Friends({ user }: Props) {
  const [stats, setStats]     = useState<ReferralStats | null>(null);
  const [friends, setFriends] = useState<ReferralFriend[]>([]);
  const [loading, setLoading] = useState(true);

  const botUsername = import.meta.env.VITE_BOT_USERNAME ?? 'UraanxAI_bot';
  const refLink = `https://t.me/${botUsername}?start=ref_${user.id}`;

  useEffect(() => {
    Promise.all([api.getReferralStats(), api.getReferralFriends()])
      .then(([s, f]) => { setStats(s); setFriends(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const shareText =
`Привет! Нашёл(а) крутой Якутский ИИ — работает прямо в Telegram!

✨ Умный AI-чат на Якутском/Русском
🎨 Генерация картинок за секунды
🎬 Создание любого трендового видео

Заходи по ссылке, будь в тренде`;

  function shareLink() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`;
    window.Telegram?.WebApp?.openTelegramLink?.(url);
  }

  return (
    <div className="p-5 space-y-4 pb-6">

      {/* Header */}
      <div className="pt-2">
        <p className="text-xl font-bold text-white">Партнёрская программа</p>
        <p className="text-slate-300 text-sm mt-1 font-medium">Приглашай друзей — получай кредиты</p>
      </div>

      {/* Награды */}
      <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl p-4 space-y-3 backdrop-blur-sm">
        <p className="text-slate-200 text-xs font-bold uppercase tracking-[0.12em]">Награды за приглашение</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(REWARDS).map(([pkg, cr]) => (
            <div key={pkg} className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 flex items-center justify-between">
              <span className="text-white text-sm font-semibold">{PACKAGE_LABELS[pkg]}</span>
              <span className="text-green-400 text-sm font-bold">+{cr} кр.</span>
            </div>
          ))}
        </div>
      </div>

      {/* Статистика */}
      {loading ? (
        <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl p-5 backdrop-blur-sm flex items-center justify-center h-24">
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : stats && (
        <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-slate-200 text-xs font-bold uppercase tracking-[0.12em] mb-3">Статистика</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{stats.totalEarned}</p>
              <p className="text-slate-400 text-xs mt-1 font-medium">кр. получено</p>
            </div>
            <div className="text-center border-x border-white/[0.10]">
              <p className="text-2xl font-extrabold text-white">{stats.total}</p>
              <p className="text-slate-400 text-xs mt-1 font-medium">друзей</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{stats.thisMonth}<span className="text-slate-400 text-base font-bold">/{stats.monthlyLimit}</span></p>
              <p className="text-slate-400 text-xs mt-1 font-medium">в этом мес.</p>
            </div>
          </div>
        </div>
      )}

      {/* Список друзей */}
      {!loading && friends.length > 0 && (
        <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2.5 border-b border-white/[0.10]">
            <span className="text-slate-400 text-xs font-bold">Пользователь</span>
            <span className="text-slate-400 text-xs font-bold text-center w-20">План</span>
            <span className="text-slate-400 text-xs font-bold text-right w-20">Награда</span>
          </div>

          {friends.map((friend: ReferralFriend) => (
            <div key={friend.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-4 py-3 border-b border-white/[0.05] last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500/60 to-blue-600/60 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                  {(friend.username ?? friend.firstName)[0].toUpperCase()}
                </div>
                <span className="text-white text-sm font-semibold truncate">
                  {friend.username ? `@${friend.username}` : friend.firstName}
                </span>
              </div>

              <div className="w-20 text-center">
                {friend.package ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-white/[0.08] text-slate-200">
                    {PACKAGE_LABELS[friend.package] ?? friend.package}
                  </span>
                ) : (
                  <span className="text-slate-500 text-xs font-medium">—</span>
                )}
              </div>

              <div className="w-20 flex items-center justify-end gap-1.5">
                {friend.rewardCredits > 0 ? (
                  <>
                    <span className="text-sm font-bold text-white">+{friend.rewardCredits}</span>
                    {friend.status === 'paid' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500 text-xs font-medium">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пусто */}
      {!loading && friends.length === 0 && (
        <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl p-8 backdrop-blur-sm flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <p className="text-white font-bold">Друзей пока нет</p>
          <p className="text-slate-400 text-sm font-medium">Пригласи первого — получи кредиты!</p>
        </div>
      )}

      {/* Кнопка пригласить */}
      <button
        onClick={shareLink}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 font-bold text-white active:scale-[0.98] transition-transform"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        Пригласить друга
      </button>

      {/* Легенда */}
      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span className="text-slate-400 text-xs font-medium">на проверке</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span className="text-slate-400 text-xs font-medium">начислено</span>
        </div>
      </div>

    </div>
  );
}
