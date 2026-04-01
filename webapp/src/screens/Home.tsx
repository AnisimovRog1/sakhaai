import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { User } from '../types';
import { useLang } from '../LangContext';

type Props = {
  user: User;
  onCreditsUpdate?: (credits: number) => void;
};

type PaymentMethod = 'card' | 'sbp' | 'crypto';

const PACKAGES = [
  { key: 'start', labelKey: 'home.start' as const, price: '99₽',   credits: 1100,  popular: false },
  { key: 'basic', labelKey: 'home.basic' as const, price: '299₽',  credits: 3500,  popular: false },
  { key: 'pro',   labelKey: 'home.pro' as const,   price: '799₽',  credits: 10000, popular: true  },
  { key: 'max',   labelKey: 'home.max' as const,   price: '1990₽', credits: 28000, popular: false },
];

const PAYMENT_METHODS: { id: PaymentMethod; labelKey: 'home.card' | 'home.sbp' | 'home.crypto'; icon: React.ReactNode }[] = [
  {
    id: 'card',
    labelKey: 'home.card',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'sbp',
    labelKey: 'home.sbp',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    id: 'crypto',
    labelKey: 'home.crypto',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.5 8h5a2.5 2.5 0 010 5H9.5V8z"/><path d="M9.5 13h5.5a2.5 2.5 0 010 5H9.5v-5z"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="18" x2="12" y2="20"/>
      </svg>
    ),
  },
];

function getLevel(credits: number) {
  if (credits < 1100)  return { levelKey: 'home.start' as const,   next: 1100  };
  if (credits < 3500)  return { levelKey: 'home.basic' as const, next: 3500  };
  if (credits < 10000) return { levelKey: 'home.pro' as const,     next: 10000 };
  return                      { levelKey: 'home.max' as const,    next: 28000 };
}

export function Home({ user, onCreditsUpdate }: Props) {
  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const { t } = useLang();

  // Обновляем баланс при входе на главный экран
  useEffect(() => {
    api.getBalance().then(({ credits }) => {
      if (onCreditsUpdate && credits !== user.credits) onCreditsUpdate(credits);
    }).catch(() => {});
  }, []);
  const { levelKey, next } = getLevel(user.credits);
  const progress = Math.min((user.credits / next) * 100, 100);

  const displayName = user.username ? `@${user.username}` : user.firstName;

  function handlePay() {
    if (!selectedPkg) return;
    setShowPayment(true);
  }

  function handleConfirmPay() {
    // TODO: интеграция UnitPay — вызов API с selectedPkg и paymentMethod
    setShowPayment(false);
  }

  return (
    <div className="flex flex-col px-5 md:px-8" style={{ minHeight: 'calc(var(--tg-viewport-height, 100vh) - var(--safe-top, 0px) - 8rem)' }}>

      {/* ─── Top content ─── */}
      <div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200/70 text-sm font-medium tracking-wide">{t('home.welcome')}</p>
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

        {/* Balance Card — флаг Якутии */}
        <div className="relative rounded-2xl p-6 overflow-hidden shadow-xl glow-animate home-balance" style={{ marginTop: '4vh' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a6bc4] via-[#155da8] to-[#0e4a8a]" />
          <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full bg-white/[0.12] blur-xl" />
          <div className="absolute top-3 right-4 w-10 h-10 rounded-full bg-white/[0.15] shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
          <div className="absolute bottom-0 left-0 right-0 h-[6px] flex">
            <div className="flex-1 bg-gradient-to-r from-red-500 to-red-400" />
            <div className="flex-1 bg-gradient-to-r from-green-500 to-green-400" />
          </div>
          <div className="relative space-y-4">
            <p className="text-blue-100/90 text-[11px] font-semibold uppercase tracking-[0.15em]">{t('home.balance')}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">{user.credits.toLocaleString('ru')}</p>
              <span className="text-lg font-medium text-blue-100/80">кр.</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-blue-100/80">{t('home.level')}: <span className="text-white font-bold">{t(levelKey)}</span></span>
                <span className="text-blue-100/80">{user.credits.toLocaleString('ru')} / {next.toLocaleString('ru')}</span>
              </div>
              <div className="h-3 bg-white/[0.15] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 progress-shimmer"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #8B5CF6, #06B6D4, #8B5CF6, #06B6D4)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="space-y-3 home-packages" style={{ marginTop: '4vh' }}>
          <p className="text-white text-base font-bold text-center">{t('home.buy')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PACKAGES.map((pkg) => {
              const sel = selectedPkg?.key === pkg.key;
              return (
                <button
                  key={pkg.key}
                  onClick={() => setSelectedPkg(sel ? null : pkg)}
                  className={`relative rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] ${
                    sel
                      ? 'bg-blue-500/20 border-2 border-blue-400/60 shadow-lg shadow-blue-500/15'
                      : 'glass-neon'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-3 bg-gradient-to-r from-red-500 to-red-400 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">{t('home.popular')}</span>
                  )}
                  {sel && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                  )}
                  <p className="text-2xl font-extrabold text-white">{pkg.price}</p>
                  <p className="text-slate-200 text-sm font-semibold mt-1">{t(pkg.labelKey)}</p>
                  <p className="text-blue-300/80 text-xs mt-0.5 font-medium">{pkg.credits.toLocaleString('ru')} кр.</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Payment Button ─── */}
      <div style={{ marginTop: '4vh' }} className="pb-1 home-pay">
        <button
          onClick={handlePay}
          disabled={!selectedPkg}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
            selectedPkg
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 active:scale-[0.98] text-white'
              : 'glass-neon text-slate-500 cursor-not-allowed'
          }`}
        >
          {selectedPkg ? `${t('home.pay')} ${selectedPkg.price}` : t('home.selectPackage')}
        </button>
      </div>

      {/* ─── Support Button ─── */}
      <div className="pb-3 pt-2">
        <button
          onClick={() => window.Telegram?.WebApp?.openTelegramLink?.('https://t.me/UraanxAI_support')}
          className="glass-neon w-full py-3 rounded-2xl text-sm font-semibold text-slate-400 active:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
        >
          {t('home.support')}
        </button>
      </div>

      {/* ─── Payment Method Modal ─── */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowPayment(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Bottom sheet */}
          <div
            className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md bg-[#0f1420] border-t border-white/[0.12] rounded-t-3xl p-5 pb-8 space-y-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex items-center justify-between">
              <h2 className="text-white text-lg font-bold uppercase tracking-wide">{t('home.paymentTitle')}</h2>
              <button onClick={() => setShowPayment(false)} className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Methods */}
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => {
                const selected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 ${
                      selected
                        ? 'bg-white/[0.08] border-2 border-violet-500/60 shadow-lg shadow-violet-500/10'
                        : 'bg-white/[0.04] border border-white/[0.10]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={selected ? 'text-violet-400' : 'text-slate-400'}>{m.icon}</span>
                      <span className={`text-base font-semibold ${selected ? 'text-white' : 'text-slate-300'}`}>{t(m.labelKey)}</span>
                    </div>
                    {/* Radio */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selected ? 'border-violet-500' : 'border-slate-500'
                    }`}>
                      {selected && <div className="w-3 h-3 rounded-full bg-violet-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirmPay}
              className="w-full py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all"
            >
              {t('home.next')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
