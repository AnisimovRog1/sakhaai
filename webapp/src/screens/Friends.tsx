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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

export function Friends({ user }: Props) {
  const [stats, setStats]     = useState<ReferralStats | null>(null);
  const [friends, setFriends] = useState<ReferralFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  const botUsername = import.meta.env.VITE_BOT_USERNAME ?? 'UraanxAI_bot';
  const refLink = `https://t.me/${botUsername}?startapp=ref_${user.id}`;

  useEffect(() => {
    Promise.all([api.getReferralStats(), api.getReferralFriends()])
      .then(([s, f]) => { setStats(s); setFriends(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-5 space-y-4 pb-6">

      {/* Header */}
      <div className="pt-2">
        <p className="text-xl font-bold text-slate-100">Партнёрская программа</p>
        <p className="text-slate-400 text-sm mt-0.5">Приглашай друзей — получай кредиты</p>
      </div>

      {/* Условия */}
      <div className="bg-white/[0.07] border border-white/[0.10] rounded-2xl p-4 space-y-3 backdrop-blur-sm">
        <p className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Награды за приглашение</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(REWARDS).map(([pkg, cr]) => (
            <div key={pkg} className="bg-white/[0.05] rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-slate-300 text-sm">{PACKAGE_LABELS[pkg]}</span>
              <span className="text-violet-300 text-sm font-semibold">+{cr} кр.</span>
            </div>
          ))}
        </div>
      </div>

      {/* Статистика */}
      {loading ? (
        <div className="bg-white/[0.07] border border-white/[0.10] rounded-2xl p-5 backdrop-blur-sm flex items-center justify-center h-24">
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : stats && (
        <div className="bg-white/[0.07] border border-white/[0.10] rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-slate-300 text-xs font-semibold uppercase tracking-wide mb-3">Статистика</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-100">{stats.totalEarned}</p>
              <p className="text-slate-400 text-xs mt-0.5">кр. получено</p>
            </div>
            <div className="text-center border-x border-white/[0.08]">
              <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
              <p className="text-slate-400 text-xs mt-0.5">друзей</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-100">{stats.thisMonth}<span className="text-slate-500 text-base">/{stats.monthlyLimit}</span></p>
              <p className="text-slate-400 text-xs mt-0.5">в этом месяце</p>
            </div>
          </div>
        </div>
      )}

      {/* Список друзей */}
      {!loading && friends.length > 0 && (
        <div className="bg-white/[0.07] border border-white/[0.10] rounded-2xl overflow-hidden backdrop-blur-sm">
          {/* Шапка таблицы */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2.5 border-b border-white/[0.08]">
            <span className="text-slate-500 text-xs font-medium">Пользователь</span>
            <span className="text-slate-500 text-xs font-medium text-center w-20">План</span>
            <span className="text-slate-500 text-xs font-medium text-right w-20">Награда</span>
          </div>

          {/* Строки */}
          {friends.map(friend => (
            <div key={friend.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-4 py-3 border-b border-white/[0.04] last:border-0">
              {/* Username */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600/60 to-cyan-500/60 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                  {(friend.username ?? friend.firstName)[0].toUpperCase()}
                </div>
                <span className="text-slate-200 text-sm truncate">
                  {friend.username ? `@${friend.username}` : friend.firstName}
                </span>
              </div>

              {/* Plan */}
              <div className="w-20 text-center">
                {friend.package ? (
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-white/[0.08] text-slate-300">
                    {PACKAGE_LABELS[friend.package] ?? friend.package}
                  </span>
                ) : (
                  <span className="text-slate-600 text-xs">—</span>
                )}
              </div>

              {/* Reward + status */}
              <div className="w-20 flex items-center justify-end gap-1.5">
                {friend.rewardCredits > 0 ? (
                  <>
                    <span className="text-sm font-semibold text-slate-200">+{friend.rewardCredits}</span>
                    {friend.status === 'paid'
                      ? <CheckIcon />
                      : <ClockIcon />
                    }
                  </>
                ) : (
                  <span className="text-slate-600 text-xs">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пусто */}
      {!loading && friends.length === 0 && (
        <div className="bg-white/[0.07] border border-white/[0.10] rounded-2xl p-8 backdrop-blur-sm flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center text-slate-500">
            <UsersIcon />
          </div>
          <p className="text-slate-300 font-medium">Друзей пока нет</p>
          <p className="text-slate-500 text-sm">Пригласи первого — получи кредиты!</p>
        </div>
      )}

      {/* Кнопка пригласить */}
      <button
        onClick={copyLink}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 font-semibold text-white active:scale-[0.98] transition-transform"
      >
        <CopyIcon />
        {copied ? 'Ссылка скопирована!' : 'Пригласить друга'}
      </button>

      {/* Легенда */}
      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <ClockIcon />
          <span className="text-slate-500 text-xs">на проверке</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckIcon />
          <span className="text-slate-500 text-xs">начислено</span>
        </div>
      </div>

    </div>
  );
}
