import { useState } from 'react';
import type { User, Screen } from '../types';

type Props = {
  user: User;
  onNavigate: (screen: Screen) => void;
};

const PACKAGES = [
  { label: 'Старт',   price: '99₽',   credits: 1100,  popular: false },
  { label: 'Базовый', price: '299₽',  credits: 3500,  popular: false },
  { label: 'Про',     price: '799₽',  credits: 10000, popular: true  },
  { label: 'Макс',    price: '1990₽', credits: 28000, popular: false },
];

function getLevel(credits: number) {
  if (credits < 1100)  return { level: 'Старт',   next: 1100,  from: 'from-slate-500',   to: 'to-slate-400'   };
  if (credits < 3500)  return { level: 'Базовый', next: 3500,  from: 'from-blue-600',    to: 'to-blue-400'    };
  if (credits < 10000) return { level: 'Про',     next: 10000, from: 'from-violet-600',  to: 'to-violet-400'  };
  return                      { level: 'Макс',    next: 28000, from: 'from-amber-500',   to: 'to-yellow-400'  };
}

export function Home({ user, onNavigate }: Props) {
  const [copied, setCopied] = useState(false);
  const { level, next, from, to } = getLevel(user.credits);
  const progress = Math.min((user.credits / next) * 100, 100);

  const botUsername = import.meta.env.VITE_BOT_USERNAME ?? 'UraanxAI_bot';
  const refLink = `https://t.me/${botUsername}?start=ref_${user.id}`;

  function copyRefLink() {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-5 space-y-4 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-slate-400 text-sm">Добро пожаловать</p>
          <p className="text-xl font-bold text-slate-100">{user.firstName}</p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-violet-500/30">
          {user.firstName[0].toUpperCase()}
        </div>
      </div>

      {/* Balance card */}
      <div className="relative bg-gradient-to-br from-violet-700/80 via-indigo-700/75 to-cyan-700/70 rounded-3xl p-5 overflow-hidden shadow-2xl shadow-violet-500/30 backdrop-blur-sm border border-white/10">
        {/* Decorative aurora orbs inside card */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative space-y-3">
          <p className="text-violet-200 text-xs font-medium uppercase tracking-widest">Баланс кредитов</p>
          <p className="text-5xl font-bold text-white tracking-tight">
            {user.credits.toLocaleString('ru')}
            <span className="text-xl font-normal text-violet-200 ml-2">кр.</span>
          </p>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-violet-200/80">
              <span>Уровень: <span className="text-white font-medium">{level}</span></span>
              <span>{user.credits.toLocaleString('ru')} / {next.toLocaleString('ru')}</span>
            </div>
            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${from} ${to} rounded-full transition-all duration-700`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <button
        onClick={() => onNavigate({ name: 'chatList' })}
        className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-2xl py-4 font-semibold text-base shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        Написать AI
      </button>

      {/* Tools row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate({ name: 'imageGen' })}
          className="bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm rounded-2xl p-4 text-left active:bg-white/[0.07] transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-600/30 to-violet-600/30 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e879f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <p className="text-slate-100 text-sm font-semibold">Картинки</p>
          <p className="text-slate-500 text-xs mt-0.5">79 кр. за генерацию</p>
        </button>
        <button
          onClick={() => onNavigate({ name: 'videoGen' })}
          className="bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm rounded-2xl p-4 text-left active:bg-white/[0.07] transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="14" height="12" rx="2"/>
              <path d="M16 10l6-4v12l-6-4V10z"/>
            </svg>
          </div>
          <p className="text-slate-100 text-sm font-semibold">Видео</p>
          <p className="text-slate-500 text-xs mt-0.5">от 608 кр.</p>
        </button>
      </div>

      {/* Packages */}
      <div className="space-y-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Пополнить баланс</p>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.label}
              className={`relative bg-white/[0.04] border rounded-2xl p-4 text-left active:bg-white/[0.07] transition-all ${
                pkg.popular
                  ? 'border-violet-500/40'
                  : 'border-white/[0.06]'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Популярный
                </span>
              )}
              <p className={`text-xl font-bold ${pkg.popular ? 'bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent' : 'text-slate-100'}`}>
                {pkg.price}
              </p>
              <p className="text-slate-300 text-sm font-medium mt-0.5">{pkg.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{pkg.credits.toLocaleString('ru')} кр.</p>
            </button>
          ))}
        </div>
        <p className="text-slate-600 text-xs text-center">Оплата появится в ближайшее время</p>
      </div>

      {/* Referral */}
      <div className="bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <p className="text-slate-100 text-sm font-semibold">Реферальная программа</p>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          Приглашай друзей и получай кредиты после их первой оплаты
        </p>
        <button
          onClick={copyRefLink}
          className="w-full bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.08] rounded-xl py-2.5 px-3 text-left transition-all"
        >
          <p className="text-slate-500 text-[11px] truncate">{refLink}</p>
          <p className={`text-xs mt-0.5 font-medium transition-colors ${copied ? 'text-cyan-400' : 'text-violet-400'}`}>
            {copied ? '✓ Скопировано' : 'Нажми чтобы скопировать'}
          </p>
        </button>
      </div>

    </div>
  );
}
