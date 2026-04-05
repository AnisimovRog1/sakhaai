import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { User, ReferralStats, ReferralFriend } from '../types';
import { useLang } from '../LangContext';

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
  start:  310,
  basic:  930,
  pro:    2500,
  max:    6200,
};

export function Friends({ user }: Props) {
  const { t } = useLang();
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
`Пока ты думаешь - другие уже генерят контент будущего 🚀

Фото и видео за секунды. Нейросеть прямо в Telegram.
Без подписок, без ожидания - просто открой и создавай.

Попробуй, пока это бесплатно 👇`;

  function shareLink() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`;
    window.Telegram?.WebApp?.openTelegramLink?.(url);
  }

  return (
    <div className="p-5 md:p-8 pb-28 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">{t('friends.title')}</h1>
        <p className="text-slate-300 text-sm mt-1.5 font-medium">{t('friends.subtitle')}</p>
      </div>

      {/* Награды */}
      <div className="glass-neon rounded-2xl p-5 space-y-4">
        <p className="text-white text-sm font-bold uppercase tracking-wider">{t('friends.rewards')}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {Object.entries(REWARDS).map(([pkg, cr]) => (
            <div key={pkg} className="glass-neon rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white text-sm font-bold">{PACKAGE_LABELS[pkg]}</span>
              <span className="text-green-400 text-sm font-extrabold">+{cr} кр.</span>
            </div>
          ))}
        </div>
      </div>

      {/* Статистика */}
      {loading ? (
        <div className="glass-neon rounded-2xl p-6 flex items-center justify-center h-28">
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : stats && (
        <div className="glass-neon rounded-2xl p-5">
          <p className="text-white text-sm font-bold uppercase tracking-wider mb-4">{t('friends.stats')}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white">{stats.totalEarned}</p>
              <p className="text-slate-300 text-xs mt-1.5 font-semibold">{t('friends.earned')}</p>
            </div>
            <div className="text-center border-x border-white/[0.12]">
              <p className="text-3xl font-extrabold text-white">{stats.total}</p>
              <p className="text-slate-300 text-xs mt-1.5 font-semibold">{t('friends.friendsCount')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white">{stats.thisMonth}<span className="text-slate-400 text-lg font-bold">/{stats.monthlyLimit}</span></p>
              <p className="text-slate-300 text-xs mt-1.5 font-semibold">{t('friends.thisMonth')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Список друзей */}
      {!loading && friends.length > 0 && (
        <div className="glass-neon rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-5 py-3 border-b border-white/[0.10]">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">Пользователь</span>
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider text-center w-20">План</span>
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider text-right w-20">Награда</span>
          </div>

          {friends.map((friend: ReferralFriend) => (
            <div key={friend.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-5 py-3.5 border-b border-white/[0.06] last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/60 to-cyan-500/60 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                  {(friend.username ?? friend.firstName)[0].toUpperCase()}
                </div>
                <span className="text-white text-sm font-bold truncate">
                  {friend.username ? `@${friend.username}` : friend.firstName}
                </span>
              </div>

              <div className="w-20 text-center">
                {friend.package ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/[0.10] text-white">
                    {PACKAGE_LABELS[friend.package] ?? friend.package}
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm font-medium">—</span>
                )}
              </div>

              <div className="w-20 flex items-center justify-end gap-2">
                {friend.rewardCredits > 0 ? (
                  <>
                    <span className="text-sm font-extrabold text-white">+{friend.rewardCredits}</span>
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
                  <span className="text-slate-500 text-sm font-medium">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пусто */}
      {!loading && friends.length === 0 && (
        <div className="glass-neon rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <p className="text-white text-base font-bold">{t('friends.noFriends')}</p>
          <p className="text-slate-300 text-sm font-medium">{t('friends.noFriendsDesc')}</p>
        </div>
      )}

      {/* Легенда */}
      <div className="flex items-center gap-5 justify-center">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span className="text-slate-300 text-xs font-semibold">{t('friends.checking')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span className="text-slate-300 text-xs font-semibold">{t('friends.credited')}</span>
        </div>
      </div>

      {/* Документы и контакты */}
      <div className="glass-neon rounded-2xl p-4 space-y-3 opacity-70">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Документы и контакты</p>
        <div className="space-y-2 text-xs text-slate-400">
          <button
            onClick={() => (window.Telegram?.WebApp as any)?.openLink?.('https://sakhaai-production.up.railway.app/landing#terms')}
            className="flex items-center gap-2 hover:text-white transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            Пользовательское соглашение
          </button>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
            uraanx.ai.project@gmail.com
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            @UraanxAI_support
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ИП Ураанхаев · Республика Саха (Якутия)
          </div>
        </div>
      </div>

      {/* ─── Кнопка пригласить — фиксирована внизу ─── */}
      <div className="fixed left-0 right-0 px-5 pb-3 pt-4 bg-gradient-to-t from-[#070b14] via-[#070b14]/95 to-transparent" style={{ bottom: 'calc(68px + var(--safe-bottom, 0px))' }}>
        <button
          onClick={shareLink}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 font-bold text-base text-white active:scale-[0.98] transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          {t('friends.invite')}
        </button>
      </div>

    </div>
  );
}
