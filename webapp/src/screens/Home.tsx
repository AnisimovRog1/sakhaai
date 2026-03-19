import { useState } from 'react';
import type { User } from '../types';

type Props = {
  user: User;
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

export function Home({ user }: Props) {
  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  const { level, next, color } = getLevel(user.credits);
  const progress = Math.min((user.credits / next) * 100, 100);

  const tgPhotoUrl = (window.Telegram?.WebApp as any)?.initDataUnsafe?.user?.photo_url as string | undefined;
  const displayName = user.username ? `@${user.username}` : user.firstName;

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(var(--tg-viewport-height, 100vh) - 64px)' }}>

      {/* ─── Scrollable content ─── */}
      <div className="flex-1 p-5 space-y-5">

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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" />
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-blue-400/15 rounded-full blur-2xl" />
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
                  <p className="text-2xl font-extrabold text-white">
                    {pkg.price}
                  </p>
                  <p className="text-slate-200 text-sm font-semibold mt-1">{pkg.label}</p>
                  <p className="text-blue-300/70 text-xs mt-0.5 font-medium">{pkg.credits.toLocaleString('ru')} кр.</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ─── Payment Button — прижата к низу ─── */}
      <div className="px-5 pb-4 pt-2">
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
