import { pool } from '../db/pool';

// ═══════════════════════════════════════════════════
// Начальное наполнение пуш-последовательностей
// Все тексты из URAANXAI_ПУШИ_ТРИГГЕРЫ_CLAUDE_CODE.md
// ═══════════════════════════════════════════════════

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
  send_mode?: string;
  strict_time?: string;
  preferred_time?: string;
  weekday?: string;
  greeting_mode?: string;
  greeting_fixed?: string;
  allow_hour_from?: number;
  allow_hour_to?: number;
}

const seeds: Seed[] = [
  // ═══════════════════════════════════════════════════
  // TRIGGER_1 — WELCOME (приветственный)
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'welcome',
    delay_minutes: 0,
    label: 'Приветственный пуш',
    greeting_mode: 'dynamic',
    allow_hour_from: 9,
    allow_hour_to: 21,
    text: `<<Добро пожаловать в UraanxAI>> 🎤✨

Слушай, это реально круто что ты здесь.
Сейчас объясню за 10 секунд что это такое.

Ты просто пишешь идею — а UraanxAI
превращает её в готовый визуал.
Фото, видео, образ — из одного промпта 🔥

Без фотошопа. Без сложных программ.
Без лишних шагов.

Что здесь можно делать:
📸 <<Фото>> — в любом стиле и эстетике
🎬 <<Видео>> — из одного промпта
🎨 <<Образы и арты>> — для контента и идей

💎 <<Бесплатные кредиты уже на балансе>>
Попробуй первый промпт прямо сейчас ✨`,
    media_url: IMG.fashion,
  },

  // ═══════════════════════════════════════════════════
  // TRIGGER_2 — НЕ КУПИЛ (4 пуша)
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'no_purchase',
    delay_minutes: 120,
    label: '2 часа — посмотри что создают',
    send_mode: 'immediate',
    allow_hour_from: 10,
    allow_hour_to: 20,
    text: `<<Посмотри что уже создают в UraanxAI>> 🎨🔥

Слушай — пока ты думаешь,
другие уже дропают визуалы 📈

Трендовые эстетики, образы как из кино,
арты с вайбом который хочется сохранить.
И всё это из одного промпта ✨

💎 <<Попробуй за 99 руб>> — 1 100 кредитов.
Хватит чтобы почувствовать флоу
и понять что хочешь создать дальше 🔥`,
    media_url: IMG.fantasy,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 720,
    label: '12 часов — ещё здесь?',
    send_mode: 'preferred_time',
    preferred_time: '12',
    allow_hour_from: 10,
    allow_hour_to: 20,
    text: `Эй, ты ещё здесь? 👋

<<Пока ты без старта — другие уже в процессе>> 📈

В UraanxAI прямо сейчас собирают:
🎨 Арты с нужной эстетикой
📸 Образы для профилей и контента
🎬 Видео из одного промпта

Всё это доступно тебе прямо сейчас.
<<Старт всего за 99 руб>> — и ты в потоке 🔥`,
    media_url: IMG.portrait,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 1440,
    label: '24 часа — 3 вещи',
    send_mode: 'preferred_time',
    preferred_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    allow_hour_from: 10,
    allow_hour_to: 20,
    text: `<<3 вещи которые можно создать прямо сейчас>> ✨

Прошёл уже день — и я хочу показать
конкретно что ты можешь сделать:

🖼 <<Аватар>> — в любой эстетике: dark, soft, cinematic
🎬 <<Ролик>> — для Reels или TikTok из промпта
🎨 <<Арт>> — для поста, сторис или мудборда

Всё в одном месте. Без сложного сетапа.
Просто промпт — и аутпут готов 🔥

💎 <<Старт за 99 руб>> — кредиты сразу на балансе ✨`,
    media_url: IMG.dancer,
  },
  {
    trigger_type: 'no_purchase',
    delay_minutes: 2880,
    label: '48 часов — финальное',
    send_mode: 'preferred_time',
    preferred_time: '19',
    greeting_mode: 'fixed',
    greeting_fixed: 'Добрый вечер!',
    allow_hour_from: 10,
    allow_hour_to: 20,
    text: `Честно — я немного переживаю 😔

<<Уже 2 дня как ты здесь, но старт ещё не активирован>> ⏳

Идей за это время наверняка накопилось.
И знаешь что — самый лучший момент
чтобы начать это прямо сейчас 💡

UraanxAI превращает любую идею
в визуал который хочется показать 🔥

<<99 руб — и твой первый проект уже в работе>> 🎨`,
    media_url: IMG.vintage,
  },

  // ═══════════════════════════════════════════════════
  // TRIGGER_3 — КУПИЛ (1 пуш)
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'after_purchase',
    delay_minutes: 0,
    label: 'Благодарность за покупку',
    send_mode: 'immediate',
    allow_hour_from: 7,
    allow_hour_to: 24,
    text: `<<Отлично — кредиты на балансе>> 🎉✨

Серьёзно, хорошее решение 👍
Теперь самое интересное.

С чего начать прямо сейчас:

📸 <<Создай фото>> — опиши образ и получи визуал
в нужной эстетике за секунды

🎬 <<Собери видео>> — из одного промпта
в кино-стиле или трендовом формате

🪄 <<Оживи картинку>> — добавь движение
и преврати статику в живой кадр

🫧 <<Воплоти идею>> — любую сцену,
образ или арт — просто опиши

Не жди идеального момента.
Лучший промпт — тот который запустишь сейчас 🔥`,
  },

  // ═══════════════════════════════════════════════════
  // TRIGGER_4 — МАЛО КРЕДИТОВ (3 пуша)
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'low_credits',
    delay_minutes: 0,
    credits_threshold: 500,
    label: '< 500 кредитов',
    greeting_mode: 'dynamic',
    allow_hour_from: 9,
    allow_hour_to: 21,
    text: `<<Запас кредитов снижается>> 📊✨

На балансе меньше <<500 кредитов>> — около 6 картинок.

Лучше пополнить заранее
чем останавливаться на середине хорошей идеи 🔥

Выбери свой темп:
💚 <<Старт>> — 99 руб — 1 100 кредитов
💙 <<Базовый>> — 299 руб — 3 500 кредитов
💜 <<Про>> ⭐ — 799 руб — 10 000 кредитов
🖤 <<Макс>> — 1999 руб — 28 000 кредитов

Пополни на главной и держи флоу 🎨`,
  },
  {
    trigger_type: 'low_credits',
    delay_minutes: 0,
    credits_threshold: 350,
    label: '< 350 кредитов',
    allow_hour_from: 9,
    allow_hour_to: 21,
    text: `Эй, смотри 👀

<<Осталось меньше 350 кредитов>> ⚡

Это ещё несколько генераций.
Но если ты сейчас в потоке и ловишь нужный вайб —
лучше не тормозить на середине 🔥

Честно говоря <<Базовый за 299 руб>> — самый чёткий выбор.
<<3 500 кредитов>> — хватит надолго ✨

Пополни и не теряй флоу 🎨`,
    media_url: IMG.fashion,
  },
  {
    trigger_type: 'low_credits',
    delay_minutes: 0,
    credits_threshold: 150,
    label: '< 150 кредитов',
    greeting_mode: 'dynamic',
    allow_hour_from: 9,
    allow_hour_to: 22,
    text: `Стоп — это важно 🔴

<<Кредиты почти на нуле>>

Осталось меньше <<150>> — это буквально 1-2 картинки.
Генерация встанет в самый неподходящий момент.

Не обрывай идею — выбери пакет:

💚 <<Старт>> — 99 руб — 1 100 кредитов
Быстрый перезапуск флоу

💙 <<Базовый>> — 299 руб — 3 500 кредитов
Комфортный запас для регулярного контента

💜 <<Про>> ⭐ — 799 руб — 10 000 кредитов
<<Самый популярный>> — хватит на 130+ картинок

🖤 <<Макс>> — 1999 руб — 28 000 кредитов
Максимум свободы для больших планов и видео

Пополни на главной странице ✨`,
  },

  // ═══════════════════════════════════════════════════
  // TRIGGER_5 — НОЛЬ КРЕДИТОВ (5 пушей)
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'zero_credits',
    delay_minutes: 0,
    label: 'Сразу — кредиты закончились',
    allow_hour_from: 9,
    allow_hour_to: 21,
    text: `<<Кредиты закончились — но идеи-то остались>> 💡✨

Слушай, ты только что создавал контент.
Наверное в голове уже рождается следующий проект 🎨

Пополни баланс на главной странице
и возвращайся к визуалам которые хочется
сохранить, показать и выложить 🔥📸

<<Старт от 99 руб>> — флоу восстанавливается мгновенно ✨`,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 300,
    label: '5 часов — соскучился по контенту',
    send_mode: 'preferred_time',
    preferred_time: '12',
    allow_hour_from: 10,
    allow_hour_to: 21,
    text: `Прошло 5 часов 👋

<<Соскучился по контенту который реально цепляет?>> 🎨✨

Пока ты на паузе — трендовые визуалы,
новые эстетики и сильные аутпуты
продолжают появляться в UraanxAI 🔥

Самое время вернуться:

💜 <<Про>> — <<10 000 кредитов за 799 руб>>

Хватит на 130+ картинок или 12+ видео.
Тот самый объём при котором
не нужно экономить на идеях 🎨✨`,
    media_url: IMG.fantasy,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 480,
    label: '8 часов — вечерний',
    send_mode: 'preferred_time',
    preferred_time: '19',
    greeting_mode: 'fixed',
    greeting_fixed: 'Добрый вечер!',
    allow_hour_from: 10,
    allow_hour_to: 21,
    text: `<<8 часов — и в UraanxAI уже дропнули новый контент>> 🔥

Серьёзно, пока ты был на паузе —
другие собрали эффектные проекты,
атмосферные кадры и визуалы с сильным вайбом ✨🎬📸

Твоя идея ещё живая?
Тогда возвращайся — пополни баланс
и создай следующий проект пока не остыло 💡🔥`,
    media_url: IMG.dancer,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 600,
    label: '10 часов — пакеты',
    allow_hour_from: 10,
    allow_hour_to: 21,
    text: `Окей, давай разберёмся вместе 🤝✨

<<Прошло 10 часов>> — за это время
наверняка появились новые идеи для проектов 💡

Вот как выбрать пакет без лишних раздумий:

🟢 <<Старт — 99 руб>>
Зайти в процесс и снова поймать флоу

🔵 <<Базовый — 299 руб>>
Оптимально для регулярного контента без экономии

🟣 <<Про — 799 руб>> ⭐
Лучший выбор если любишь масштаб и хороший темп

⚫ <<Макс — 1999 руб>>
Максимум свободы — создавай без оглядки

Выбирай и возвращайся к своему проекту 🎨✨`,
  },
  {
    trigger_type: 'zero_credits',
    delay_minutes: 2880,
    label: '2 дня — обновления',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Два дня прошло — и я решил написать 👋

<<В UraanxAI кое-что обновилось пока тебя не было>> 🎨🔥

Появились:
✨ <<Новые модели>> для фото и видео
🎨 <<Свежие эстетики>> и трендовые стили
🎬 <<Обновлённые видео-пресеты>>

Самое время вернуться, пополнить баланс
и собрать проект в новом вайбе 🎨

<<Старт от 99 руб>> — и ты снова в флоу ✨`,
    media_url: IMG.couple,
  },

  // ═══════════════════════════════════════════════════
  // TRIGGER_6 — ЕЖЕДНЕВНЫЕ (7 дней недели)
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Понедельник — вдохновение',
    weekday: 'MON',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Новая неделя — новый дроп 🎨✨

Знаешь что я заметил — люди которые
начинают неделю с нового проекта
заканчивают её с сильным результатом 🔥

<<Что создать сегодня:>>
📸 Новый аватар в трендовой эстетике
🎨 Арт для следующего поста или сторис
🎬 Ролик с вайбом который сложно проскроллить

UraanxAI уже ждёт твою идею 💡🔥`,
    media_url: IMG.fashion,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Вторник — обучение промпт',
    weekday: 'TUE',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Разберём как писать промпты
которые дают крутой результат 💡✨

Формула сильного промпта:
<<КТО + ЧТО ДЕЛАЕТ + ГДЕ + СТИЛЬ + СВЕТ>>

Слабый промпт:
«девушка на улице»

Сильный промпт:
«Молодая девушка стоит на ночной улице Токио,
неоновые огни отражаются в мокром асфальте,
кинематографичный кадр, золотой свет фонаря,
cinematic style, 35mm lens»

Чем больше деталей — тем точнее аутпут 🎯
Попробуй прямо сейчас в UraanxAI 🔥`,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Среда — трендовые эстетики',
    weekday: 'WED',
    send_mode: 'strict_time',
    strict_time: '12',
    greeting_mode: 'fixed',
    greeting_fixed: 'Добрый день!',
    text: `Середина недели — самое время 🎨✨

Пока другие ждут пятницу —
ты можешь дропнуть что-то сильное прямо сейчас 🔥

<<Трендовые эстетики прямо сейчас:>>
🌑 Dark core — атмосфера, тени, глубина
🤍 Soft aesthetic — нежно, воздушно, чисто
🎬 Cinematic — как кадр из хорошего фильма
⚡ Cyberpunk — неон, дождь, будущее

Один промпт — и твой аутпут готов ✨`,
    media_url: IMG.portrait,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Четверг — обучение видео',
    weekday: 'THU',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Знаешь как сделать
чтобы фото стало живым видео? 🪄✨

Это называется img2video — и это проще чем кажется.

<<Как оживить фото в UraanxAI:>>
1. Загрузи своё фото
2. Опиши движение которое хочешь добавить
3. Получи живой кадр

<<Примеры движений для промпта:>>
▸ «волосы развеваются на ветру, лёгкое движение»
▸ «камера медленно отдаляется, cinematic zoom out»
▸ «дождь падает на лицо, капли в замедлении»
▸ «взгляд поворачивается к камере, плавно»

Загрузи любое фото — и посмотри что получится 🔥`,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Пятница — хайп и контент',
    weekday: 'FRI',
    send_mode: 'strict_time',
    strict_time: '11',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Пятница — самый хайповый день 🔥✨

Посты и сторис в пятницу набирают
больше всего охватов — это факт 📈

Создай визуал с сильным вайбом прямо сейчас:
📸 <<Фото>> в трендовой эстетике
🎬 <<Видео>> которое хочется переслать
🎨 <<Арт>> с нужным лором и настроением

Твой следующий промпт уже ждёт в UraanxAI 💡🎨`,
    media_url: IMG.pion,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Суббота — обучение кинопромпт',
    weekday: 'SAT',
    send_mode: 'strict_time',
    strict_time: '11',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Суббота — идеальный день
чтобы сделать что-то с настоящим кино-вайбом 🎬✨

<<Формула кинематографичного промпта для видео:>>
СЦЕНА + ДВИЖЕНИЕ КАМЕРЫ + СВЕТ + АТМОСФЕРА + СТИЛЬ

<<Пример слабого промпта:>>
«человек идёт по городу»

<<Пример кинематографичного промпта:>>
«Мужчина в плаще идёт по пустой улице Нью-Йорка,
камера следует сзади на уровне плеч,
жёлтый свет фонарей, туман, осенний дождь,
slow motion, cinematic 4K, film grain»

<<Слова которые делают видео кинематографичным:>>
▸ slow motion / slow pan
▸ film grain / 35mm look
▸ cinematic lighting
▸ camera follows / tracking shot
▸ golden hour / blue hour

Один сильный промпт — и твоё видео выглядит
как кадр из настоящего фильма 🔥`,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Воскресенье — мудборд',
    weekday: 'SUN',
    send_mode: 'strict_time',
    strict_time: '11',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Воскресенье — день для мудборда и новых идей 🫧✨

Никакой спешки, просто ты и твои идеи 🎨

<<Что можно сделать сегодня:>>
🖼 Собери мудборд из трендовых визуалов
🎨 Протестируй новую эстетику или образ
📸 Заготовь контент который выйдет на неделе

UraanxAI поможет превратить воскресный вайб
в сильный контент-план на всю неделю 🔥`,
    media_url: IMG.ocean,
  },

  // ═══════════════════════════════════════════════════
  // TRIGGER_6 доп. — ОБУЧАЮЩИЕ ПУШИ (чередуются по неделям)
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Обучение — портретный промпт',
    weekday: 'TUE',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Сегодня про портреты 📸✨

Портрет с сильной подачей = правильный промпт.

<<Формула:>>
ВНЕШНОСТЬ + ЭМОЦИЯ + СВЕТ + СТИЛЬ СЪЁМКИ

<<Пример:>>
«Молодая девушка с тёмными глазами,
уверенный взгляд в камеру, естественный макияж,
мягкий боковой свет из окна, тёплые тона,
editorial style, shot on 85mm lens»

<<Слова которые работают для портрета:>>
▸ soft bokeh / shallow depth of field
▸ golden hour light / window light
▸ editorial / vogue style
▸ natural skin texture / no filter look
▸ confident expression / candid

Попробуй и сравни результат 🎯🔥`,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Обучение — атмосфера в кадре',
    weekday: 'THU',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Разберём как сделать кадр
с настоящей атмосферой 🫧✨

Атмосфера = детали окружения + свет + погода

<<Добавь в промпт одно из этого:>>
🌧 Дождь — «heavy rain, wet streets, reflections»
🌫 Туман — «morning fog, misty atmosphere»
🌅 Закат — «golden sunset, warm orange glow»
🌃 Ночь — «neon city lights, dark ambiance»
❄ Зима — «snowfall, cold blue tones, breath visible»

<<Пример до:>>
«девушка в парке»

<<Пример после:>>
«Девушка стоит в осеннем парке,
листья падают вокруг, утренний туман,
мягкий серый свет, cinematic mood»

Атмосфера делает кадр живым 🔥`,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Обучение — тренды стилей 2025',
    weekday: 'TUE',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Вот стили которые
сейчас в хайпе — сохрани себе 🎨✨

<<Топ стилей прямо сейчас:>>

📷 «Film photography» — зернистость, тёплые тона,
как будто снято на плёнку в 90-х

🔍 «Hyperrealism» — настолько реалистично
что кажется настоящей фотографией

🌸 «Anime cinematic» — аниме но с кино-качеством,
Ghibli или Makoto Shinkai стиль

🤍 «Dark luxury» — дорого, тёмно, минималистично,
чёрный + золото + мрамор

🤍 «Clean aesthetic» — белый фон, мягкий свет,
нежно и воздушно

<<Просто добавь название стиля в промпт>>
и UraanxAI сделает остальное 🔥`,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Обучение — slow motion видео',
    weekday: 'THU',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Сегодня про slow motion —
один из самых красивых эффектов в видео 🎬✨

<<Как добавить замедление в промпт:>>
Просто добавь эти слова:
▸ «slow motion» — общее замедление
▸ «bullet time» — эффект Матрицы
▸ «120fps cinematic slow mo» — кинематографично
▸ «time-lapse» — ускорение (обратное)

<<Пример промпта:>>
«Девушка оборачивается на камеру,
волосы развеваются на ветру,
slow motion 120fps, cinematic lighting,
золотой час, лёгкий туман»

<<Что красиво снимать в slow motion:>>
💧 Капли воды / дождь
🔥 Огонь и искры
💨 Развевающиеся волосы и ткани
🌸 Лепестки цветов

Попробуй — это выглядит реально круто 🔥`,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Обучение — образ из референса',
    weekday: 'SAT',
    send_mode: 'strict_time',
    strict_time: '11',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Лайфхак для тех
кто хочет точный результат 🎯✨

Видел крутой кадр и хочешь похожий?
Опиши его детально — и AI повторит стиль.

<<Что описывать в референсном промпте:>>
▸ Цветовая палитра — «тёплые янтарные тона»
▸ Тип освещения — «жёсткий свет сбоку, резкие тени»
▸ Угол камеры — «снято снизу вверх, wide angle»
▸ Эпоха и стиль — «эстетика 70-х, film look»
▸ Детали одежды — «оверсайз пальто, водолазка»

<<Пример:>>
«Портрет в стиле Vogue 90-х,
высококонтрастное чёрно-белое фото,
резкий студийный свет, взгляд в сторону,
модельная поза, editorial fashion»

Чем точнее описание — тем ближе к референсу 🔥`,
  },
  {
    trigger_type: 'daily',
    delay_minutes: 0,
    label: 'Обучение — аватарный промпт',
    weekday: 'SAT',
    send_mode: 'strict_time',
    strict_time: '11',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Сегодня про аватары —
самый популярный запрос в UraanxAI 🎯✨

<<Формула идеального аватара:>>
ТИП КАДРА + СТИЛЬ + ФОН + РАКУРС

<<Примеры готовых промптов для аватара:>>

🔥 Киношный:
«Портрет крупным планом, cinematic lighting,
тёмный размытый фон, взгляд в камеру,
уверенное выражение, film grain»

📸 Мягкий:
«Мягкий портрет, пастельные тона,
естественный свет из окна, лёгкая улыбка,
clean aesthetic, soft bokeh»

⚡ Дерзкий:
«Портрет с неоновой подсветкой,
тёмный фон, cyberpunk атмосфера,
взгляд снизу вверх, dramatic lighting»

Какой аватар хочешь — просто напиши промпт 🎯🔥`,
  },

  // ═══════════════════════════════════════════════════
  // TRIGGER_7 — РЕАКТИВАЦИЯ (7+ дней)
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'reactivation',
    delay_minutes: 0,
    label: 'Реактивация — 7+ дней',
    send_mode: 'strict_time',
    strict_time: '10',
    greeting_mode: 'fixed',
    greeting_fixed: 'Доброе утро!',
    text: `Эй, давно не виделись 👋

Честно — немного скучал 😊

<<Пока тебя не было в UraanxAI кое-что поменялось:>>

🎨 Новые модели для фото и видео
🎨 Свежие эстетики которых раньше не было
🎬 Новые видео-пресеты и стили

Твои кредиты всё ещё ждут тебя.
Самое время вернуться и создать
что-то с по-настоящему сильным вайбом 💡

<<Старт от 99 руб>> — если нужно пополнить ✨`,
    media_url: IMG.jellyfish,
  },

  // ═══════════════════════════════════════════════════
  // TRIGGER_8 — ПЕРВАЯ ГЕНЕРАЦИЯ
  // ═══════════════════════════════════════════════════
  {
    trigger_type: 'first_generation',
    delay_minutes: 5,
    label: 'После первой генерации',
    allow_hour_from: 9,
    allow_hour_to: 21,
    text: `Вот это начало 🔥✨

Серьёзно — первый аутпут это только начало.
Дальше будет интереснее 🎨

<<Попробуй теперь:>>
▸ Другой стиль или эстетику
▸ То же лицо — но новый образ и лор
▸ Видео версию того что уже создал

Каждый следующий промпт
сильнее предыдущего 💡🔥`,
  },
];

export async function seedPushSequences(force = false): Promise<number> {
  if (force) {
    await pool.query(`DELETE FROM push_sent`);
    await pool.query(`DELETE FROM push_sequences`);
  }

  // Вставляем только отсутствующие (по label + trigger_type)
  const existing = await pool.query(`SELECT label, trigger_type FROM push_sequences WHERE is_deleted = false`);
  const existingSet = new Set(existing.rows.map((r: any) => r.trigger_type + '::' + r.label));

  let count = 0;
  for (const s of seeds) {
    const key = s.trigger_type + '::' + s.label;
    if (existingSet.has(key)) continue;

    await pool.query(`
      INSERT INTO push_sequences (trigger_type, delay_minutes, credits_threshold, text, media_type, media_url, label, send_mode, strict_time, preferred_time, weekday, greeting_mode, greeting_fixed, allow_hour_from, allow_hour_to, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, false)
    `, [
      s.trigger_type,
      s.delay_minutes,
      s.credits_threshold || null,
      s.text,
      s.media_url ? 'photo' : null,
      s.media_url || null,
      s.label,
      s.send_mode || 'immediate',
      s.strict_time || null,
      s.preferred_time || null,
      s.weekday || null,
      s.greeting_mode || 'none',
      s.greeting_fixed || null,
      s.allow_hour_from ?? 9,
      s.allow_hour_to ?? 22,
    ]);
    count++;
  }

  if (count > 0) console.log(`✅ Добавлено ${count} новых пуш-последовательностей`);
  else console.log(`⏭ push_sequences: все ${seeds.length} seed-ов уже есть`);
  return count;
}
