import { useState } from 'react';
import type { User } from '../types';

type Props = {
  user: User;
};

const PACKAGES = [
  { key: 'start', label: 'Старт',   price: '99₽',   credits: 1100,  popular: false },
  { key: 'basic', label: 'Базовый', price: '299₽',  credits: 3500,  popular: false },
  { key: 'pro',   label: 'Про',     price: '799₽',  credits: 10000, popular: true  },
  { key: 'max',   label: 'Макс',    price: '1990₽', credits: 28000, popular: false },
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

  const displayName = user.username ? `@${user.username}` : user.firstName;

  return (
    <div className="flex flex-col justify-between px-5" style={{ minHeight: 'calc(var(--tg-viewport-height, 100vh) - 130px)' }}>

      {/* ─── Top content ─── */}
      <div className="space-y-6">

        {/* Header — отступ сверху чтобы не перекрывался кнопкой Закрыть */}
        <div className="flex items-center justify-between pt-8">
          <div>
            <p className="text-blue-200/70 text-sm font-medium tracking-wide">Добро пожаловать</p>
            <p className="text-xl font-bold text-white mt-1">{displayName}</p>
          </div>
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/40 shadow-lg" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-lg text-white ring-2 ring-blue-400/30 shadow-lg">
              {user.firstName[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Balance Card — отступ от хедера */}
        <div className="relative rounded-2xl p-5 overflow-hidden shadow-xl mt-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" />
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-green-500" />
          <div className="relative space-y-3">
            <p className="text-blue-100/80 text-[10px] font-semibold uppercase tracking-[0.15em]">Баланс кредитов</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-white">{user.credits.toLocaleString('ru')}</p>
              <span className="text-base font-medium text-blue-200/70">кр.</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-blue-100/70">Уровень: <span className="text-white font-semibold">{level}</span></span>
                <span className="text-blue-100/70">{user.credits.toLocaleString('ru')} / {next.toLocaleString('ru')}</span>
              </div>
              <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Packages — центрированы, побольше, отступ от баланса */}
        <div className="space-y-3 mt-2">
          <p className="text-white text-base font-bold text-center">Купить AI-кредиты</p>
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => {
              const sel = selectedPkg?.key === pkg.key;
              return (
                <button
                  key={pkg.key}
                  onClick={() => setSelectedPkg(sel ? null : pkg)}
                  className={`relative rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] ${
                    sel
                      ? 'bg-blue-500/20 border-2 border-blue-400/60 shadow-lg shadow-blue-500/15'
                      : 'bg-white/[0.06] border border-white/[0.10]'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-3 bg-gradient-to-r from-red-500 to-red-400 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">Популярный</span>
                  )}
                  {sel && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                  )}
                  <p className="text-2xl font-extrabold text-white">{pkg.price}</p>
                  <p className="text-slate-200 text-sm font-semibold mt-1">{pkg.label}</p>
                  <p className="text-blue-300/60 text-xs mt-0.5 font-medium">{pkg.credits.toLocaleString('ru')} кр.</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Payment Button — прижата к низу ─── */}
      <div className="pt-5 pb-3">
        <button
          disabled={!selectedPkg}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
            selectedPkg
              ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25 active:scale-[0.98] text-white'
              : 'bg-white/[0.05] border border-white/[0.08] text-slate-500 cursor-not-allowed'
          }`}
        >
          {selectedPkg ? `Оплатить ${selectedPkg.price}` : 'Выберите пакет'}
        </button>
      </div>

    </div>
  );
}
