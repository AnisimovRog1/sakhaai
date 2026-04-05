# Архитектура SakhaAI

## Сервисы
```
┌─ Telegram Bot (@UraanxAI_bot) ──┐     ┌─ Webapp (React+TS+Vite) ─┐
│  Railway: focused-clarity        │     │  Раздаётся Express       │
│  grammY, polling mode            │     │  /assets/*, index.html   │
│  Команды, пуши, авторепорты     │     │  SPA, Tailwind, Aurora   │
└──────────┬───────────────────────┘     └──────────┬───────────────┘
           │ HTTP (BOT_TOKEN auth)                   │ HTTP (JWT auth)
           ↓                                         ↓
┌─ Express Server (sakhaai) ──────────────────────────────────────┐
│  Railway: sakhaai-production.up.railway.app                      │
│                                                                  │
│  Routes:                                                         │
│  ├─ /auth         → JWT + антифрод + welcome бонус              │
│  ├─ /chats        → Gemini AI чат                               │
│  ├─ /image        → Gemini генерация картинок                   │
│  ├─ /video        → Kling видео/motion/аватар                   │
│  ├─ /balance      → баланс + транзакции                         │
│  ├─ /payment      → UnitPay webhook                             │
│  ├─ /referral     → реферальная система                         │
│  ├─ /generations  → история генераций                           │
│  ├─ /admin        → API админки (BOT_TOKEN/ADMIN_PASSWORD)      │
│  ├─ /panel        → веб-интерфейс админки (HTML inline)         │
│  └─ /landing      → лендинг + документы                         │
│                                                                  │
│  Background:                                                     │
│  ├─ task-worker.ts  → polling pending_tasks каждые 30с          │
│  └─ seedPushSequences() → при старте сервера                    │
└──────────────────────────────────────────────────────────────────┘
           ↓              ↓              ↓            ↓
      PostgreSQL       Kling Direct   Gemini 2.5   fal.ai
      (Railway)        (Singapore)    Flash         (аватары)

## ВСЕ файлы проекта

### Server (31 файл)
| Компонент | Файл | Описание |
|-----------|------|----------|
| Точка входа | server/src/index.ts | Express app, порядок init: migrate → seed → task-worker → routes |
| Лендинг | server/src/landing.ts | HTML лендинг + документы + контакты (ИП Ураанхаев) |
| JWT middleware | server/src/middleware/auth.ts | requireAuth — проверка JWT из header Authorization |
| PostgreSQL | server/src/db/pool.ts | Пул подключений (DATABASE_URL) |
| Redis | server/src/db/redis.ts | Кеш баланса (TTL 60с), fallback если Redis недоступен |
| Миграции | server/src/db/migrate.ts | ВСЕ таблицы, constraints, seed данные |
| Auth | server/src/routes/auth.ts | Telegram login + антифрод + welcome бонус + JWT |
| Чат | server/src/routes/chat.ts | Gemini AI чат, 1 кр/сообщение |
| Картинки | server/src/routes/image.ts | Gemini image gen, 155-556 кр |
| Видео | server/src/routes/video.ts | Kling video/motion/avatar, async задачи |
| Баланс | server/src/routes/balance.ts | GET баланс + транзакции |
| Платежи | server/src/routes/payment.ts | UnitPay создание/webhook/статус |
| Рефералы | server/src/routes/referral.ts | Друзья + статистика |
| Генерации | server/src/routes/generations.ts | История генераций юзера |
| Админ API | server/src/routes/admin.ts | Статистика, юзеры, пуши, upload |
| Админ UI | server/src/routes/admin-panel.ts | Встроенный HTML (backtick literal!) |
| Баланс сервис | server/src/services/balance.ts | deduct/addCredits с FOR UPDATE |
| Антифрод | server/src/services/welcome-antifraud.ts | 6 слоёв, 0/50/300 бонус |
| Пуши | server/src/services/push-sequences.ts | 8 триггеров, цепочки, timezone |
| Seed пушей | server/src/services/push-seed.ts | 22+ шаблона (is_active=false) |
| Task worker | server/src/services/task-worker.ts | Polling pending_tasks каждые 30с |
| Telegram push | server/src/services/telegram-push.ts | Push при готовности генерации |
| Kling Direct | server/src/services/kling-direct.ts | Kling API + JWT + temp files |
| Kling (deprecated) | server/src/services/kling.ts | Старый через fal.ai, НЕ ИСПОЛЬЗОВАТЬ |
| fal.ai аватар | server/src/services/fal-avatar.ts | TTS + lip-sync (ТОЛЬКО аватары) |
| Gemini | server/src/services/gemini.ts | sendToGemini (чат, мультимодал) |
| Gemini client | server/src/services/genai-client.ts | GoogleGenerativeAI инициализация |
| Nanabanana | server/src/services/nanabanana.ts | Gemini image gen + translate |
| Рефералы | server/src/services/referral.ts | registerReferral + антифрод рефов |
| Генерации | server/src/services/generations.ts | saveGeneration в БД |
| Курс валют | server/src/services/exchange-rate.ts | USD/RUB multiplier |

### Webapp (20 файлов)
| Компонент | Файл | Описание |
|-----------|------|----------|
| App shell | webapp/src/App.tsx | Init Telegram SDK, auth, routing |
| Entry | webapp/src/main.tsx | React render |
| API клиент | webapp/src/api/client.ts | fetch wrapper, JWT в памяти (НЕ localStorage) |
| Типы | webapp/src/types/index.ts | TypeScript interfaces |
| i18n | webapp/src/i18n.ts | Переводы ru/sah (якутский) |
| LangContext | webapp/src/LangContext.tsx | React context для языка |
| Fingerprint | webapp/src/utils/fingerprint.ts | Device fingerprint для антифрода |
| Home | webapp/src/screens/Home.tsx | Главный экран, пакеты, баланс |
| ChatList | webapp/src/screens/ChatList.tsx | Список чатов |
| Chat | webapp/src/screens/Chat.tsx | Чат с AI |
| ImageGen | webapp/src/screens/ImageGen.tsx | Генерация картинок |
| VideoGen | webapp/src/screens/VideoGen.tsx | Генерация видео/motion/аватар |
| Friends | webapp/src/screens/Friends.tsx | Рефералы + документы |
| BottomNav | webapp/src/components/BottomNav.tsx | Навигация внизу (5 табов) |
| GenerationViewer | webapp/src/components/GenerationViewer.tsx | Просмотр результатов |
| PromptGallery | webapp/src/components/PromptGallery.tsx | Шаблоны картинок (41 шт) |
| VideoPromptGallery | webapp/src/components/VideoPromptGallery.tsx | Шаблоны видео (20 шт) |
| SpaceBackground | webapp/src/components/SpaceBackground.tsx | Aurora фон |
| Шаблоны фото | webapp/src/data/promptTemplates.ts | 41 шаблон, 6 категорий |
| Шаблоны видео | webapp/src/data/videoPromptTemplates.ts | 20 видео + 36 motion + 13 аватаров |

### Bot (1 файл)
| Компонент | Файл | Описание |
|-----------|------|----------|
| Бот | bot/src/index.ts | Команды, пуши, репорты, поддержка, автопоследовательности |
```
