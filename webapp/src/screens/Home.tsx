import { useState } from 'react';
import type { User, Screen } from '../types';

type Props = {
  user: User;
  onNavigate: (screen: Screen) => void;
};

const PACKAGES = [
  { key: 'start', label: 'Старт',   price: '99₽',   priceNum: 99,   credits: 1100,  popular: false },
  { key: 'basic', label: 'Базовый', price: '299₽',  priceNum: 299,  credits: 3500,  popular: false },
  { key: 'pro',   label: 'Про',     price: '799₽',  priceNum: 799,  credits: 10000, popular: true  },
  { key: 'max',   label: 'Макс',    price: '1990₽', priceNum: 1990, credits: 28000, popular: false },
];

function getLevel(credits: number) {
  if (credits < 1100)  return { level: 'Старт',   next: 1100,  color: 'from-blue-500 to-blue-400'   };
  if (credits < 3500)  return { level: 'Базовый', next: 3500,  color: 'from-blue-500 to-cyan-400'   };
  if (credits < 10000) return { level: 'Про',     next: 10000, color: 'from-blue-500 to-green-400'  };
  return                      { level: 'Макс',    next: 28000, color: 'from-yellow-400 to-red-400'  };
}

export function Home({ user, onNavigate }: Props) {
  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  const { level, next, color } = getLevel(user.credits);
  const progress = Math.min((user.credits / next) * 100, 100);

  const tgPhotoUrl = (window.Telegram?.WebApp as any)?.initDataUnsafe?.user?.photo_url as string | undefined;
  const displayName = user.username ? `@${user.username}` : user.firstName;

  return (
    <div className="p-5 space-y-5 pb-6">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between pt-3">
        <div>
          <p className="text-blue-200/70 text-sm font-medium tracking-wide">Добро пожаловать</p>
          <p className="text-xl font-bold text-white mt-0.5">{displayName}</p>
        </div>
        {tgPhotoUrl ? (
          <img
            src={tgPhotoUrl}
            alt="avatar"
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/30">
            {user.firstName[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* ─── Balance Card ─── */}
      <div className="relative rounded-3xl p-5 overflow-hidden shadow-2xl shadow-blue-900/40">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" />
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-blue-400/15 rounded-full blur-2xl" />
        {/* Red accent stripe (Якутский флаг) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-green-500" />

        <div className="relative space-y-4">
          <p className="text-blue-100/80 text-xs font-semibold uppercase tracking-[0.15em]">Баланс кредитов</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-extrabold text-white tracking-tight">
              {user.credits.toLocaleString('ru')}
            </p>
            <span className="text-lg font-medium text-blue-200/70">кр.</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-100/70">
                Уровень: <span className="text-white font-semibold">{level}</span>
              </span>
              <span className="text-blue-100/70 font-medium">
                {user.credits.toLocaleString('ru')} / {next.toLocaleString('ru')}
              </span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main CTA ─── */}
      <button
        onClick={() => onNavigate({ name: 'chatList' })}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl py-4 font-bold text-base text-white shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2.5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        Написать AI
      </button>

      {/* ─── Tools ─── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate({ name: 'imageGen' })}
          className="bg-white/[0.06] border border-white/[0.10] backdrop-blur-sm rounded-2xl p-4 text-left active:bg-white/[0.10] active:border-white/[0.16] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <p className="text-white text-sm font-bold">Картинки</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">79 кр. за генерацию</p>
        </button>
        <button
          onClick={() => onNavigate({ name: 'videoGen' })}
          className="bg-white/[0.06] border border-white/[0.10] backdrop-blur-sm rounded-2xl p-4 text-left active:bg-white/[0.10] active:border-white/[0.16] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-4v12l-6-4V10z"/>
            </svg>
          </div>
          <p className="text-white text-sm font-bold">Видео</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">от 608 кр.</p>
        </button>
      </div>

      {/* ─── Packages ─── */}
      <div className="space-y-3">
        <p className="text-white text-base font-bold">Купить AI-кредиты</p>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPkg?.key === pkg.key;
            return (
              <button
                key={pkg.key}
                onClick={() => setSelectedPkg(isSelected ? null : pkg)}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] ${
                  isSelected
                    ? 'bg-blue-500/20 border-2 border-blue-400/60 shadow-lg shadow-blue-500/15'
                    : 'bg-white/[0.06] border border-white/[0.10] active:border-white/[0.18]'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-3 bg-gradient-to-r from-red-500 to-red-400 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    Популярный
                  </span>
                )}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                )}
                <p className={`text-2xl font-extrabold ${isSelected ? 'text-white' : 'text-white'}`}>
                  {pkg.price}
                </p>
                <p className="text-slate-200 text-sm font-semibold mt-1">{pkg.label}</p>
                <p className="text-blue-300/70 text-xs mt-0.5 font-medium">{pkg.credits.toLocaleString('ru')} кр.</p>
              </button>
            );
          })}
        </div>

        {/* ─── Payment Button ─── */}
        <button
          disabled={!selectedPkg}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
            selectedPkg
              ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25 active:scale-[0.98] text-white'
              : 'bg-white/[0.05] border border-white/[0.08] text-slate-500 cursor-not-allowed'
          }`}
        >
          {selectedPkg
            ? `Оплатить ${selectedPkg.price}`
            : 'Выберите пакет'}
        </button>
      </div>

    </div>
  );
}
