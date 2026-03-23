// Локализация: Русский / Сахалыы (Якутский)
// Якутские переводы сделаны через Gemini AI

export type Lang = 'ru' | 'sah';

const translations = {
  // ─── BottomNav ───
  'nav.home': { ru: 'Главная', sah: 'Сүрүн' },
  'nav.chats': { ru: 'Чаты', sah: 'Кэпсэтии' },
  'nav.images': { ru: 'Картинки', sah: 'Ойуу' },
  'nav.video': { ru: 'Видео', sah: 'Видео' },
  'nav.friends': { ru: 'Друзья', sah: 'Доҕоттор' },

  // ─── Home ───
  'home.welcome': { ru: 'Добро пожаловать', sah: 'Нөрүөн нөргүй!' },
  'home.balance': { ru: 'БАЛАНС КРЕДИТОВ', sah: 'КРЕДИТ БАЛАНАҺА' },
  'home.credits': { ru: 'кр.', sah: 'кр.' },
  'home.level': { ru: 'Уровень', sah: 'Таһым' },
  'home.buy': { ru: 'Купить AI-кредиты', sah: 'AI-кредиттары атыылас' },
  'home.start': { ru: 'Старт', sah: 'Саҕалаан' },
  'home.basic': { ru: 'Базовый', sah: 'Түмүк' },
  'home.pro': { ru: 'Про', sah: 'Про' },
  'home.max': { ru: 'Макс', sah: 'Макс' },
  'home.popular': { ru: 'Популярный', sah: 'Сэргэммит' },
  'home.selectPackage': { ru: 'Выберите пакет', sah: 'Пакеты тал' },
  'home.pay': { ru: 'Оплатить', sah: 'Төлөө' },
  'home.paymentTitle': { ru: 'ВЫБРАТЬ ТИП ОПЛАТЫ', sah: 'Төлөбүр көрүҥүн тал' },
  'home.card': { ru: 'Банковская карта', sah: 'Баан каартата' },
  'home.sbp': { ru: 'СБП', sah: 'СБП' },
  'home.crypto': { ru: 'Криптовалютой', sah: 'Криптовалюта' },
  'home.next': { ru: 'Далее', sah: 'Салгыы' },

  // ─── ChatList ───
  'chatList.title': { ru: 'UraanxAI', sah: 'UraanxAI' },
  'chatList.startChat': { ru: 'Начните общение', sah: 'Кэпсэтиини саҕалааҥ' },
  'chatList.startDesc': { ru: 'Задайте вопрос, попросите помочь с текстом или переведите на якутский', sah: 'Ыйытыы биэриҥ, тэкиһинэн көмөлөһүҥ эбэтэр сахалыы тылбаастааҥ' },
  'chatList.today': { ru: 'Сегодня', sah: 'Бүгүн' },
  'chatList.yesterday': { ru: 'Вчера', sah: 'Бэҕэһ' },
  'chatList.week': { ru: 'Последние 7 дней', sah: 'Соңку 7 күн' },
  'chatList.month': { ru: 'Последние 30 дней', sah: 'Соңку 30 күн' },
  'chatList.earlier': { ru: 'Ранее', sah: 'Урдук' },
  'chatList.delete': { ru: 'Удалить', sah: 'Сот' },
  'chatList.cancel': { ru: 'Нет', sah: 'Суох' },

  // ─── Chat ───
  'chat.placeholder': { ru: 'Написать сообщение...', sah: 'Суруйуҥ...' },
  'chat.newChat': { ru: 'Новый чат', sah: 'Саҥа чаат' },

  // ─── ImageGen ───
  'image.title': { ru: 'UraanxAI', sah: 'UraanxAI' },
  'image.edit': { ru: 'Редактирование', sah: 'Көннөрүү' },
  'image.textToImage': { ru: 'Текст в изображение', sah: 'Тиэкис ойууга' },
  'image.model': { ru: 'Модель', sah: 'Модель' },
  'image.uploadRef': { ru: 'Загрузить изображение (референс)', sah: 'Ойууну киллэр (ыйыы)' },
  'image.prompt': { ru: 'Запрос (обязательно)', sah: 'Сорудах (булгуччу)' },
  'image.promptPlaceholder': { ru: 'Что вы хотите создать?', sah: 'Тугу оҥоруоххутун баҕараҕыт?' },
  'image.count': { ru: 'Количество результатов', sah: 'Түмүктэр ахсаана' },
  'image.aspectRatio': { ru: 'Соотношение сторон', sah: 'Өттүн сыһыана' },
  'image.resolution': { ru: 'Разрешение', sah: 'Разрешение' },
  'image.creditsRequired': { ru: 'Требуются кредиты', sah: 'Кредиттар наадалар' },
  'image.create': { ru: 'Создать', sah: 'Оҥор' },
  'image.creating': { ru: 'Создаю...', sah: 'Оҥоробун...' },
  'image.notEnough': { ru: 'Недостаточно кредитов', sah: 'Баал тиийбэт' },
  'image.download': { ru: 'Скачать', sah: 'Түһэр' },
  'image.new': { ru: 'Новое', sah: 'Саҥа' },
  'image.history': { ru: 'Мои генерации', sah: 'Мин оҥоһуктарым' },
  'image.noHistory': { ru: 'Пока нет генераций', sah: 'Билигин оҥоһуктар суохтар' },
  'image.addImage': { ru: 'Добавить', sah: 'Эбэр' },
  'image.uploadHint': { ru: 'Перетащите или нажмите, чтобы загрузить изображение', sah: 'Ойууну киллэрэргэ соһон киллэр эбэтэр баттаа' },

  // ─── VideoGen ───
  'video.title': { ru: 'UraanxAI', sah: 'UraanxAI' },
  'video.tab.video': { ru: 'Видео', sah: 'Видео' },
  'video.tab.motion': { ru: 'Motion', sah: 'Motion' },
  'video.tab.avatar': { ru: 'Аватар', sah: 'Аватар' },
  'video.model': { ru: 'Модель', sah: 'Модель' },
  'video.startFrame': { ru: 'Начальный кадр', sah: 'Саҕаланыы каадыра' },
  'video.optional': { ru: '(необязательно)', sah: '(Булгуччута суох)' },
  'video.description': { ru: 'Описание видео', sah: 'Видео ойуулааһына' },
  'video.descPlaceholder': { ru: 'Опишите сцену, действия, камеру...', sah: 'Көстүүнү, хамсаныылары, камераны... ойуулаа' },
  'video.settings': { ru: 'Настройки', sah: 'Туруоруулар' },
  'video.mode': { ru: 'Режим', sah: 'Режим' },
  'video.duration': { ru: 'Длительность', sah: 'Уһуна' },
  'video.ratio': { ru: 'Соотношение сторон', sah: 'Өттүн сыһыана' },
  'video.count': { ru: 'Количество', sah: 'Ахсаан' },
  'video.nativeAudio': { ru: 'Нативное аудио', sah: 'Төрүт аудио' },
  'video.uploadMaterials': { ru: 'Загрузите материалы', sah: 'Материаллары киллэр' },
  'video.uploadVideo': { ru: 'Видео с движениями персонажа', sah: 'Персонаж хамсаныылаах видеота' },
  'video.uploadImage': { ru: 'Изображение персонажа', sah: 'Персонаж ойуута' },
  'video.orientation': { ru: 'Ориентация персонажа', sah: 'Персонаж хайысхата' },
  'video.byVideo': { ru: 'По видео', sah: 'Видеоҕа' },
  'video.byImage': { ru: 'По изображению', sah: 'Ойууга' },
  'video.facePhoto': { ru: 'Фото лица персонажа', sah: 'Персонаж сирэйин хаартыската' },
  'video.speech': { ru: 'Речь', sah: 'Саҥа' },
  'video.speechPlaceholder': { ru: 'Введите текст, который персонаж произнесёт...', sah: 'Персонаж этиэхтээх тиэкиһи суруйуҥ...' },
  'video.voice': { ru: 'Голос', sah: 'Куолас' },
  'video.speechRate': { ru: 'Скорость речи', sah: 'Саҥа түргэнэ' },
  'video.emotion': { ru: 'Эмоция', sah: 'Эмоция' },
  'video.avatarPrompt': { ru: 'Промпт аватара', sah: 'Аватар ыйытыыта' },
  'video.avatarPlaceholder': { ru: 'Действия, эмоции, жесты персонажа...', sah: 'Персонаж дьайыылара, иэйиилэрэ, туттуулара...' },
  'video.creditsRequired': { ru: 'Требуются кредиты', sah: 'Кредиттар наадалар' },
  'video.create': { ru: 'Создать', sah: 'Оҥор' },
  'video.creating': { ru: 'Создаю...', sah: 'Оҥоробун...' },
  'video.generating': { ru: 'Генерирую видео...', sah: 'Видео оҥоробун...' },
  'video.generatingTime': { ru: 'Обычно 1–3 минуты', sah: 'Үксүн 1-3 мүнүүтэ' },
  'video.download': { ru: 'Скачать', sah: 'Түһэр' },
  'video.new': { ru: 'Новое', sah: 'Саҥа' },
  'video.history': { ru: 'Мои генерации', sah: 'Мин оҥоһуктарым' },
  'video.noHistory': { ru: 'Пока нет генераций', sah: 'Билигин оҥоһуктар суохтар' },

  // ─── Friends ───
  'friends.title': { ru: 'Партнёрская программа', sah: 'Партнерскай программа' },
  'friends.subtitle': { ru: 'Приглашай друзей — получай кредиты', sah: 'Доҕотторгун ыҥыр — кредиттары ыл' },
  'friends.rewards': { ru: 'НАГРАДЫ ЗА ПРИГЛАШЕНИЕ', sah: 'ЫҤЫРЫЫ ИҺИН НАҔАРААДАЛАР' },
  'friends.stats': { ru: 'СТАТИСТИКА', sah: 'СТАТИСТИКА' },
  'friends.earned': { ru: 'кр. получено', sah: 'Кредиттар ылылынна' },
  'friends.friendsCount': { ru: 'друзей', sah: 'Доҕоттор' },
  'friends.thisMonth': { ru: 'в этом мес.', sah: 'Бу ыйга' },
  'friends.user': { ru: 'ПОЛЬЗОВАТЕЛЬ', sah: 'ТУҺАНААЧЧЫ' },
  'friends.plan': { ru: 'ПЛАН', sah: 'ПЛАН' },
  'friends.reward': { ru: 'НАГРАДА', sah: 'БЭЛЭХ' },
  'friends.noFriends': { ru: 'Друзей пока нет', sah: 'Доҕоттор өссө суохтар' },
  'friends.noFriendsDesc': { ru: 'Пригласи первого — получи кредиты!', sah: 'Бастакыны ыҥыр — кредиттэри ыл!' },
  'friends.invite': { ru: 'Пригласить друга', sah: 'Доҕору ыҥырыы' },
  'friends.checking': { ru: 'на проверке', sah: 'Бэрэбиэркэлэнэр' },
  'friends.credited': { ru: 'начислено', sah: 'Суоттаммыт' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.ru ?? key;
}
