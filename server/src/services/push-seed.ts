import { pool } from '../db/pool';

// ═══════════════════════════════════════════════════
// Начальное наполнение пуш-последовательностей
// Маркетинговый контент на русском языке
// ═══════════════════════════════════════════════════

// Лучшие картинки из наших шаблонов для пушей
const IMG = {
  fashion: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260217_175012_2482b23d-7762-4366-b718-3fde133ac10e.png',
  portrait: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_142019_2da23ac9-1bf0-4ba6-8b0c-11e45297c26e.png',
  fantasy: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260207_193655_711f3c26-8d2b-4e66-89e4-8357c0100b62.png',
  interior: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_134706_11f7c352-78f2-4a8e-a5cd-0ab9cfe0fcac.png',
  ocean: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260218_122714_a722e28d-e551-46fe-894d-db88c7c8b7ad.png',
  dog: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_140800_3330a6bc-1ef6-47ef-92a0-404a1ce2f200.png',
  jellyfish: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260217_184432_7af6e3df-a5ad-4e8a-a3b4-c6d8637ce85c.png',
  vintage: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260218_140810_000df2f5-c22c-490b-ba58-1bc267964f2d.png',
  couple: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_174359_0bb5e528-8943-4765-ae11-42c58f518025.png',
  dancer: 'https://dqv0cqkoy5oj7.cloudfront.net/user_35h9Zqn0Bk5qurQOPUM7laOSfXO/hf_20260217_212611_922a5d2b-2a21-4b76-bae2-cf3d73bcbc12.png',
  pion: 'https://dqv0cqkoy5oj7.cloudfront.net/user_36Hwty94QweUxs82UEGsxmReIrf/hf_20260218_124914_3497c398-0398-44f7-a5b7-395d6c832886.png',
};

interface Seed {
  trigger_type: string;
  delay_minutes: number;
  credits_threshold?: number;
  label: string;
  text: string;
  media_url?: string;
}

const seeds: Seed[] = [
  // ═══════════════════════════════════════════════════
  // NO_PURCHASE — Не купил пакет
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'no_purchase',
    delay_minutes: 0,
    label: 'Приветствие',
    text: `Добро пожаловать в UraanxAI! 🎨

Ты только что открыл доступ к самым мощным AI-инструментам:

🖼 Генерация картинок — от фэшн-фото до фэнтези
🎬 Создание видео — реалистичные ролики за минуты
🤖 AI-чат — умный помощник на русском и якутском

У тебя есть бесплатные кредиты — попробуй прямо сейчас!`,
    media_url: IMG.fashion,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 10,
    label: '10 мин — покажи возможности картинок',
    text: `Посмотри что создают наши пользователи 🔥

Это не фотошоп — это AI-генерация за 30 секунд. Просто опиши что хочешь увидеть, и нейросеть создаст это.

Попробуй бесплатно — у тебя ещё есть кредиты!`,
    media_url: IMG.fantasy,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 20,
    label: '20 мин — покажи видео',
    text: `А ты знал, что можно создать видео из текста? 🎬

Опиши сцену — AI сгенерирует реалистичный ролик. Люди, природа, спецэффекты — всё возможно.

Зайди в раздел «Видео» и попробуй!`,
    media_url: IMG.ocean,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 35,
    label: '35 мин — социальное доказательство',
    text: `Уже тысячи людей создают контент с UraanxAI 📈

Блогеры генерируют обложки, предприниматели — рекламные материалы, художники — вдохновение.

А что создашь ты?`,
    media_url: IMG.portrait,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 90,
    label: '1.5 часа — предложение',
    text: `Специально для тебя 🎁

Пакет «Старт» — всего 99₽:
• 1 100 кредитов
• ~14 картинок или 1-2 видео
• Безлимитный AI-чат

Это дешевле чашки кофе, а возможности — безграничные!`,
    media_url: IMG.jellyfish,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 210,
    label: '3.5 часа — образование',
    text: `3 идеи что можно создать с AI прямо сейчас:

1. 🖼 Аватар для соцсетей в любом стиле
2. 🎬 Короткий ролик для TikTok/Reels
3. 💬 Перевод текста на якутский язык

Всё это — в одном приложении. Открой и попробуй!`,
    media_url: IMG.dancer,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 300,
    label: '5 часов — что упускаешь',
    text: `Пока ты думаешь, другие уже создают 🚀

За последний час наши пользователи сгенерировали сотни картинок и десятки видео.

Не упусти свой шанс — начни создавать!`,
    media_url: IMG.pion,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 480,
    label: '8 часов — истории успеха',
    text: `Как люди используют UraanxAI:

📸 Фотограф создаёт мудборды за минуты
🎥 Блогер генерирует обложки без дизайнера
🏠 Дизайнер визуализирует интерьеры мгновенно

Начни свою историю — от 99₽!`,
    media_url: IMG.interior,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 600,
    label: '10 часов — последний шанс',
    text: `Твои бесплатные кредиты скоро закончатся ⏰

Используй их, пока есть возможность! А если понравится — пакет «Старт» за 99₽ даст в 20 раз больше.

Открой приложение →`,
    media_url: IMG.couple,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 1440,
    label: '24 часа — новый день',
    text: `Доброе утро! ☀️

Вчера ты открыл UraanxAI — сегодня самое время попробовать. Мы добавляем новые шаблоны каждую неделю.

Зайди и создай что-нибудь крутое!`,
    media_url: IMG.dog,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 2880,
    label: '48 часов — финальное',
    text: `Мы заметили, что ты ещё не попробовал все возможности 👀

UraanxAI умеет:
• Генерировать фото любого стиля
• Создавать видео из текста
• Переносить движения на персонажей
• Общаться как умный помощник

Всего 99₽ за полный доступ. Попробуй!`,
    media_url: IMG.vintage,
  },

  // ═══════════════════════════════════════════════════
  // AFTER_PURCHASE — Купил пакет
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'after_purchase',
    delay_minutes: 0,
    label: 'Благодарность за покупку',
    text: `Спасибо за покупку! 🎉

Кредиты уже на твоём балансе. Вот с чего начать:

1. Открой «Картинки» → выбери шаблон → нажми «Использовать»
2. Или напиши свой промпт с нуля
3. Попробуй «Видео» — это впечатляет!

Создавай без ограничений! 💫`,
  },

  // ═══════════════════════════════════════════════════
  // LOW_CREDITS — Мало кредитов
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'low_credits',
    delay_minutes: 0,
    credits_threshold: 500,
    label: 'Осталось < 500 кредитов',
    text: `На балансе осталось менее 500 кредитов 📊

Этого хватит примерно на:
• 6 картинок
• Или 500 сообщений в чате

Пополни баланс, чтобы не прерывать творчество!`,
  },
  {
    trigger_type: 'low_credits',
    delay_minutes: 0,
    credits_threshold: 350,
    label: 'Осталось < 350 кредитов',
    text: `Кредиты заканчиваются — осталось менее 350 ⚡

Пакет «Базовый» за 299₽ даст 3 500 кредитов — хватит надолго!

Пополни сейчас, чтобы не потерять вдохновение.`,
    media_url: IMG.fashion,
  },
  {
    trigger_type: 'low_credits',
    delay_minutes: 0,
    credits_threshold: 150,
    label: 'Осталось < 150 кредитов',
    text: `Внимание! Осталось менее 150 кредитов 🔴

Это всего 1-2 картинки. Пополни баланс прямо сейчас:

• Старт — 99₽ (1 100 кр.)
• Базовый — 299₽ (3 500 кр.)
• Про — 799₽ (10 000 кр.) ⭐ Популярный

Не дай творчеству остановиться!`,
  },

  // ═══════════════════════════════════════════════════
  // ZERO_CREDITS — Кредиты закончились
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'zero_credits',
    delay_minutes: 5,
    label: '5 мин — кредиты закончились',
    text: `Кредиты закончились 😔

Но это не конец! Пополни баланс и продолжай создавать:

• Старт — 99₽ → 1 100 кредитов
• Базовый — 299₽ → 3 500 кредитов
• Про — 799₽ → 10 000 кредитов

Нажми «Купить AI-кредиты» на главном экране!`,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 60,
    label: '1 час — покажи что упускаешь',
    text: `Пока ты без кредитов, другие создают невероятное 🌟

Вернись и пополни баланс — всего от 99₽!`,
    media_url: IMG.pion,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 300,
    label: '5 часов — спецпредложение',
    text: `Скучаешь по AI-генерации? 🎨

Пакет «Про» — лучшее соотношение цены:
• 10 000 кредитов за 799₽
• ~130 картинок или 12+ видео
• Безлимитный AI-чат

Вернись и твори!`,
    media_url: IMG.fantasy,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 480,
    label: '8 часов — FOMO',
    text: `За сегодня наши пользователи создали тысячи AI-генераций 🔥

Не оставайся в стороне — пополни баланс и присоединяйся!`,
    media_url: IMG.dancer,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 600,
    label: '10 часов — сравнение пакетов',
    text: `Какой пакет выбрать? 🤔

💚 Старт (99₽) — попробовать
💙 Базовый (299₽) — для регулярного использования
💜 Про (799₽) — для активных создателей ⭐
🖤 Макс (1990₽) — для профессионалов

Выбери свой и продолжай создавать!`,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 1440,
    label: '24 часа — новый контент',
    text: `Мы обновили шаблоны! 🆕

Новые стили картинок, видео-пресеты и аватары ждут тебя. Пополни баланс и попробуй первым!`,
    media_url: IMG.ocean,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 2880,
    label: '48 часов — финальное',
    text: `Мы скучаем по тебе! 💫

UraanxAI стал ещё лучше. Новые модели, больше возможностей.

Вернись и создай что-то потрясающее — от 99₽!`,
    media_url: IMG.couple,
  },
];

export async function seedPushSequences(): Promise<number> {
  // Проверяем есть ли уже записи
  const { rows } = await pool.query(`SELECT COUNT(*) as cnt FROM push_sequences`);
  if (parseInt(rows[0].cnt) > 0) {
    console.log('⏭ push_sequences уже заполнены, пропускаем seed');
    return 0;
  }

  let count = 0;
  for (const s of seeds) {
    await pool.query(`
      INSERT INTO push_sequences (trigger_type, delay_minutes, credits_threshold, text, media_type, media_url, label)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      s.trigger_type,
      s.delay_minutes,
      s.credits_threshold || null,
      s.text,
      s.media_url ? 'photo' : null,
      s.media_url || null,
      s.label,
    ]);
    count++;
  }

  console.log(`✅ Заполнено ${count} пуш-последовательностей`);
  return count;
}
