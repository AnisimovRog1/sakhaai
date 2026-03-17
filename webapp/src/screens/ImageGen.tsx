import { useState } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

type Props = {
  user: User;
  onCreditsUpdate: (credits: number) => void;
};

const IMAGE_COST = 79; // кредитов

export function ImageGen({ user, onCreditsUpdate }: Props) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = prompt.trim().length > 0 && user.credits >= IMAGE_COST && !loading;

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const result = await api.generateImage(prompt.trim());
      setImageUrl(result.imageUrl);
      onCreditsUpdate(result.creditsLeft);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Заголовок */}
      <div className="pt-2">
        <h1 className="text-xl font-bold">🎨 Генерация картинок</h1>
        <p className="text-gray-400 text-sm mt-1">Powered by NanaBanana</p>
      </div>

      {/* Баланс и стоимость */}
      <div className="flex justify-between items-center bg-[#1a1d27] rounded-xl px-4 py-3">
        <span className="text-gray-400 text-sm">Баланс: <span className="text-white font-medium">{user.credits.toLocaleString('ru')} кр.</span></span>
        <span className="text-violet-400 text-sm font-medium">Стоимость: {IMAGE_COST} кр.</span>
      </div>

      {/* Поле промпта */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Опиши изображение</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Якутская женщина в национальном костюме на фоне северного сияния..."
          rows={4}
          className="w-full bg-[#1a1d27] rounded-2xl p-4 text-sm resize-none outline-none placeholder-gray-600 text-white"
        />
      </div>

      {/* Кнопка */}
      <button
        onClick={generate}
        disabled={!canGenerate}
        className="w-full bg-violet-600 rounded-2xl py-4 font-semibold text-lg disabled:opacity-40 active:bg-violet-700 transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Генерирую...
          </span>
        ) : user.credits < IMAGE_COST ? (
          '❌ Недостаточно кредитов'
        ) : (
          '✨ Сгенерировать'
        )}
      </button>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Результат */}
      {loading && !imageUrl && (
        <div className="bg-[#1a1d27] rounded-2xl aspect-square flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-4xl animate-pulse">🎨</div>
            <p className="text-gray-400 text-sm">Создаю шедевр...</p>
            <p className="text-gray-600 text-xs">Обычно 10–30 секунд</p>
          </div>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-3">
          <img
            src={imageUrl}
            alt="Сгенерированное изображение"
            className="w-full rounded-2xl object-cover"
          />
          <div className="flex gap-2">
            <a
              href={imageUrl}
              download="sakhaai-image.png"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-[#1a1d27] rounded-xl py-3 text-center text-sm font-medium active:bg-[#22263a] transition-colors"
            >
              ⬇️ Скачать
            </a>
            <button
              onClick={() => { setImageUrl(null); setPrompt(''); }}
              className="flex-1 bg-violet-600/20 rounded-xl py-3 text-sm font-medium text-violet-400 active:bg-violet-600/30 transition-colors"
            >
              🔄 Новое
            </button>
          </div>
        </div>
      )}

      {/* Примеры промптов */}
      {!imageUrl && !loading && (
        <div className="space-y-2">
          <p className="text-gray-500 text-xs">Попробуй:</p>
          {[
            'Якутская природа, лиственницы в инее, северное сияние',
            'Портрет якутского шамана в традиционном костюме',
            'Современный город Якутск зимой, -50 градусов',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="w-full text-left bg-[#1a1d27] rounded-xl px-3 py-2 text-xs text-gray-400 active:bg-[#22263a] transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
