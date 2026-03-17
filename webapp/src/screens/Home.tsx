import { useState } from 'react';
import type { User, Screen } from '../types';

type Props = {
  user: User;
  onNavigate: (screen: Screen) => void;
};

// Пакеты пополнения из бизнес-плана
const PACKAGES = [
  { label: 'Старт', price: '99₽', credits: 1100 },
  { label: 'Базовый', price: '299₽', credits: 3500 },
  { label: 'Про', price: '799₽', credits: 10000 },
  { label: 'Макс', price: '1990₽', credits: 28000 },
];

// Прогресс до следующего уровня
function getLevel(credits: number) {
  if (credits < 1100) return { level: 'Старт', next: 1100, color: 'bg-gray-500' };
  if (credits < 3500) return { level: 'Базовый', next: 3500, color: 'bg-blue-500' };
  if (credits < 10000) return { level: 'Про', next: 10000, color: 'bg-violet-500' };
  return { level: 'Макс', next: 28000, color: 'bg-yellow-500' };
}

export function Home({ user, onNavigate }: Props) {
  const [copied, setCopied] = useState(false);
  const { level, next, color } = getLevel(user.credits);
  const progress = Math.min((user.credits / next) * 100, 100);

  // Реферальная ссылка
  const botUsername = import.meta.env.VITE_BOT_USERNAME ?? 'sakhaai_bot';
  const refLink = `https://t.me/${botUsername}?start=ref_${user.id}`;

  function copyRefLink() {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-4 space-y-4">
      {/* Шапка */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-gray-400 text-sm">Привет,</p>
          <p className="text-xl font-bold">{user.firstName}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-lg">
          {user.firstName[0]}
        </div>
      </div>

      {/* Карточка баланса */}
      <div className="bg-[#1a1d27] rounded-2xl p-5 space-y-3">
        <p className="text-gray-400 text-sm">Баланс кредитов</p>
        <p className="text-4xl font-bold text-white">
          {user.credits.toLocaleString('ru')}
          <span className="text-lg text-gray-400 ml-1">кр.</span>
        </p>

        {/* Прогресс-бар до следующего уровня */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Уровень: {level}</span>
            <span>{user.credits} / {next}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Кнопка — начать чат */}
      <button
        onClick={() => onNavigate({ name: 'chatList' })}
        className="w-full bg-violet-600 active:bg-violet-700 rounded-2xl py-4 font-semibold text-lg transition-colors"
      >
        💬 Написать AI
      </button>

      {/* Пакеты пополнения */}
      <div>
        <p className="text-gray-400 text-sm mb-3">Пополнить баланс</p>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.label}
              className="bg-[#1a1d27] rounded-2xl p-4 text-left active:bg-[#22263a] transition-colors"
            >
              <p className="text-violet-400 font-bold text-lg">{pkg.price}</p>
              <p className="text-white font-semibold">{pkg.label}</p>
              <p className="text-gray-400 text-xs">{pkg.credits.toLocaleString('ru')} кр.</p>
            </button>
          ))}
        </div>
        <p className="text-gray-600 text-xs text-center mt-2">Оплата скоро появится</p>
      </div>

      {/* Реферальная ссылка */}
      <div className="bg-[#1a1d27] rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold">👥 Реферальная программа</p>
        <p className="text-gray-400 text-xs">
          Приглашай друзей и получай кредиты после их первой оплаты
        </p>
        <button
          onClick={copyRefLink}
          className="w-full bg-white/5 active:bg-white/10 rounded-xl py-2 px-3 text-left transition-colors"
        >
          <p className="text-xs text-gray-400 truncate">{refLink}</p>
          <p className="text-violet-400 text-xs mt-1 font-medium">
            {copied ? '✅ Скопировано!' : '📋 Нажми чтобы скопировать'}
          </p>
        </button>
      </div>
    </div>
  );
}
