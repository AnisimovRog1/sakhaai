import { useState } from 'react';
import { api } from '../api/client';
import type { User, Screen } from '../types';

type Props = {
  user: User;
  onNavigate: (screen: Screen) => void;
};

const PACKAGES = [
  { label: 'Старт',   price: '99₽',   priceNum: 99,   credits: 1100,  popular: false },
  { label: 'Базовый', price: '299₽',  priceNum: 299,  credits: 3500,  popular: false },
  { label: 'Про',     price: '799₽',  priceNum: 799,  credits: 10000, popular: true  },
  { label: 'Макс',    price: '1990₽', priceNum: 1990, credits: 28000, popular: false },
];

function getLevel(credits: number) {
  if (credits < 1100)  return { level: 'Старт',   next: 1100,  from: 'from-slate-500',  to: 'to-slate-400'  };
  if (credits < 3500)  return { level: 'Базовый', next: 3500,  from: 'from-blue-600',   to: 'to-blue-400'   };
  if (credits < 10000) return { level: 'Про',     next: 10000, from: 'from-violet-600', to: 'to-violet-400' };
  return                      { level: 'Макс',    next: 28000, from: 'from-amber-500',  to: 'to-yellow-400' };
}

export function Home({ user, onNavigate }: Props) {
  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const { level, next, from, to } = getLevel(user.credits);
  const progress = Math.min((user.credits / next) * 100, 100);

  // Аватарка из Telegram initDataUnsafe
  const tgPhotoUrl = (window.Telegram?.WebApp as any)?.initDataUnsafe?.user?.photo_url as string | undefined;
  const displayName = user.username ? `@${user.username}` : user.firstName;

  async function handlePayment() {
    if (!selectedPkg) return;
    setPayLoading(true);
    setPayError(null);
    try {
      const pkgKey = selectedPkg.label === 'Старт' ? 'start'
        : selectedPkg.label === 'Базовый' ? 'basic'
        : selectedPkg.label === 'Про' ? 'pro' : 'max';
      const { paymentUrl, message } = await api.createPayment(pkgKey);
      if (paymentUrl) {
        window.open(paymentUrl, '_blank');
      } else {
        setPayError(message || 'Оплата временно недоступна');
      }
    } catch (err: any) {
      setPayError(err.message || 'Ошибка');
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div className="p-5 space-y-4 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-slate-400 text-sm">Добро пожаловать</p>
          <p className="text-lg font-bold text-slate-100">{displayName}</p>
        </div>
        {tgPhotoUrl ? (
          <img
            src={tgPhotoUrl}
            alt="avatar"
            className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-violet-500/30"
          />
        ) : (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-violet-500/30">
            {user.firstName[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Balance card */}
      <div className="relative bg-gradient-to-br from-violet-700/80 via-indigo-700/75 to-cyan-700/70 rounded-3xl p-5 overflow-hidden shadow-2xl shadow-violet-500/30 backdrop-blur-sm border border-white/10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-300/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative space-y-3">
          <p className="text-violet-200 text-xs font-medium uppercase tracking-widest">Баланс кредитов</p>
          <p className="text-5xl font-bold text-white tracking-tight">
            {user.credits.toLocaleString('ru')}
            <span className="text-xl font-normal text-violet-200 ml-2">кр.</span>
          </p>
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

      {/* Tools */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate({ name: 'imageGen' })}
          className="bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm rounded-2xl p-4 text-left active:bg-white/[0.12] transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-600/30 to-violet-600/30 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e879f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <p className="text-slate-100 text-sm font-semibold">Картинки</p>
          <p className="text-slate-500 text-xs mt-0.5">79 кр. за генерацию</p>
        </button>
        <button
          onClick={() => onNavigate({ name: 'videoGen' })}
          className="bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm rounded-2xl p-4 text-left active:bg-white/[0.12] transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-4v12l-6-4V10z"/>
            </svg>
          </div>
          <p className="text-slate-100 text-sm font-semibold">Видео</p>
          <p className="text-slate-500 text-xs mt-0.5">от 608 кр.</p>
        </button>
      </div>

      {/* Packages */}
      <div className="space-y-3">
        <p className="text-slate-300 text-sm font-semibold">Купить AI-кредиты</p>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPkg?.label === pkg.label;
            return (
              <button
                key={pkg.label}
                onClick={() => setSelectedPkg(isSelected ? null : pkg)}
                className={`relative rounded-2xl p-4 text-left transition-all active:scale-[0.97] ${
                  isSelected
                    ? 'bg-gradient-to-br from-violet-600/40 to-cyan-600/30 border-2 border-violet-400/60 shadow-lg shadow-violet-500/20'
                    : 'bg-white/[0.05] border border-white/[0.08]'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Популярный
                  </span>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                )}
                <p className={`text-xl font-bold ${isSelected ? 'text-white' : pkg.popular ? 'bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent' : 'text-slate-100'}`}>
                  {pkg.price}
                </p>
                <p className="text-slate-300 text-sm font-medium mt-0.5">{pkg.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{pkg.credits.toLocaleString('ru')} кр.</p>
              </button>
            );
          })}
        </div>

        {/* Payment button */}
        <button
          onClick={handlePayment}
          disabled={!selectedPkg || payLoading}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 ${
            selectedPkg && !payLoading
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 active:scale-[0.98] text-white'
              : 'bg-white/[0.04] border border-white/[0.06] text-slate-600 cursor-not-allowed'
          }`}
        >
          {payLoading
            ? 'Создаём заказ...'
            : selectedPkg
              ? `Оплатить ${selectedPkg.price}`
              : 'Выберите пакет'}
        </button>
        {payError && (
          <p className="text-center text-amber-400 text-sm">{payError}</p>
        )}
      </div>

    </div>
  );
}
