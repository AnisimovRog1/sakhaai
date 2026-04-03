<!-- ВАЖНО: Если чат стал длинным (>50 сообщений туда-обратно) — напомни: "Игорь, чат стал длинным, для лучшей работы создай новый чат. Я не потеряю контекст проекта — CLAUDE.md и память загрузятся автоматически." -->

# SakhaAI / UraanxAI — Project Guide

> Последнее обновление: 2026-04-03. Шаги 1–6, 9 выполнены + шаблоны + пуш-система + антифрод + ценообразование.

## Стек
- **webapp** — React 19 + TypeScript + Vite 8 + Tailwind 3 → Railway (раздаётся через Express)
- **server** — Node.js + Express 4 + PostgreSQL + Gemini AI → Railway (сервис `sakhaai`)
- **bot** — grammY → Railway (сервис `focused-clarity`)

## Деплой
```bash
# Всё через Railway автодеплой по main
git push
```

## Ключевые URL
| Что | URL |
|---|---|
| Webapp + Server (Railway) | https://sakhaai-production.up.railway.app |
| Health check | https://sakhaai-production.up.railway.app/health |
| Bot | @UraanxAI_bot |

## Переменные окружения

### Railway — сервис `sakhaai` (server)
| Переменная | Описание |
|---|---|
| `DATABASE_URL` | PostgreSQL Railway (выдаётся автоматически) |
| `BOT_TOKEN` | Токен @UraanxAI_bot от BotFather |
| `JWT_SECRET` | Случайная строка для подписи JWT |
| `GEMINI_API_KEY` | Ключ Google AI Studio — используется для чата И генерации картинок (gemini-2.5-flash-image) |
| `FAL_KEY` | Ключ fal.ai — используется для видео (Kling) и аватаров (Kling Avatar v2) |
| `ALLOWED_ORIGINS` | https://dreamy-churros-2c46d7.netlify.app |

### Railway — сервис `focused-clarity` (bot)
| Переменная | Описание |
|---|---|
| `BOT_TOKEN` | Токен @UraanxAI_bot |
| `WEBAPP_URL` | https://sakhaai-production.up.railway.app |

### webapp/.env.production
```
VITE_API_URL=https://sakhaai-production.up.railway.app
VITE_BOT_USERNAME=UraanxAI_bot
```

## Архитектура

### Авторизация
1. Telegram Mini App передаёт `initData` (подписанный HMAC-SHA256)
2. `POST /auth` — валидирует подпись через `BOT_TOKEN`, делает upsert пользователя
3. Возвращает JWT на 30 дней → хранится в памяти модуля `api/client.ts`
4. Все защищённые роуты используют `requireAuth` middleware

### Кредиты
- Новые пользователи: `credits = 0`
- Начислить вручную через Railway PostgreSQL → Data → Query:
  ```sql
  UPDATE users SET credits = credits + 1000 WHERE id = <telegram_id>;
  ```
- Стоимости: чат = 5 кр., картинка = 155–556 кр., видео = 290–2338 кр., аватар = 817–2686 кр. (динамически по курсу × 1007.75)

### База данных (таблицы)
`users`, `chats`, `messages`, `transactions`, `user_ips`, `referrals`
Миграции запускаются при каждом старте сервера (`migrate.ts`).

## Важные технические детали

| Проблема | Решение |
|---|---|
| Express 4 не ловит async ошибки | Все route handlers в try/catch с `res.status(500).json({ error: msg })` |
| `window.Telegram.WebApp` не определён | Скрипт `<script src="https://telegram.org/js/telegram-web-app.js">` в `index.html` |
| Gemini 2.0-flash квота исчерпана | Используем `gemini-2.5-flash` |
| CORS | `ALLOWED_ORIGINS` в Railway Variables, формат: URL без слеша |
| Token не передаётся | Хранится в памяти модуля `api/client.ts`, не в localStorage |

## Дизайн-система (Aurora Theme)

**Цвета:**
- Фон: `#070b14`
- Поверхность: `bg-white/[0.07] border border-white/[0.10] backdrop-blur-sm`
- Акцент: `bg-gradient-to-r from-violet-600 to-cyan-500`
- Текст: `text-slate-100` / `text-slate-400` / `text-slate-600`

**Фоновые фото (Unsplash, фиксированные):**
- Home: aurora над лесом + SVG-силуэт Ленских столбов
- ChatList: аврора над одиноким деревом
- Chat: яркая зелёная аврора
- ImageGen: зимняя сибирская река / тайга
- VideoGen: аврора над снегом + SVG-силуэт сэргэ

**Иконки:** SVG inline (не emoji), стиль Lucide

**Кнопки CTA:** `bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 active:scale-[0.98]`

---

## Прогресс по шагам

### ✅ Шаг 1 — Деплой server/ на Railway
PostgreSQL, миграции, auth через Telegram initData.

### ✅ Шаг 2 — Сборка webapp/ и деплой на Netlify
`_redirects` для SPA, `.env.production` заполнен.

### ✅ Шаг 3 — BotFather: Menu Button
URL: https://dreamy-churros-2c46d7.netlify.app

### ✅ Шаг 4 — ALLOWED_ORIGINS на Railway
Netlify-домен прописан в переменных.

### ✅ Шаг 5 — Деплой bot/ на Railway
Сервис `focused-clarity`. `/start` показывает кнопку Mini App.

### ✅ Шаг 6 — End-to-end тест
Авторизация ✅ | Создание чата ✅ | Чат с Gemini ✅

### ⬜ Шаг 7 — API ключи NanaBanana + Kling
- Получить ключи на сайтах NanaBanana и Kling AI
- Прописать `NANABANANA_API_KEY` и `KLING_API_KEY` в Railway Variables (сервис `sakhaai`)
- Проверить `server/src/routes/image.ts` и `routes/video.ts` + `services/kling.ts`, `services/nanabanana.ts`
- Протестировать генерацию картинки и видео из Mini App

### ⬜ Шаг 8 — YooMoney оплата
- Интеграция платёжного виджета YooMoney
- Webhook `/payment/yoomoney` для начисления кредитов после оплаты
- Привязать к пакетам на экране Home (99₽ / 299₽ / 799₽ / 1990₽)
- Пакеты: Старт (1100 кр.), Базовый (3500 кр.), Про (10000 кр.), Макс (28000 кр.)

### ✅ Шаг 9 — Редизайн webapp (Aurora Theme)
- Aurora-тема с северным сиянием (якутская идентичность)
- Реальные фото с Unsplash как фоны (5 разных, по одному на экран)
- SVG-силуэт Ленских столбов на главном экране
- SVG-силуэт сэргэ (якутских столбов) на экране видео
- Glassmorphism карточки, SVG-иконки, gradient кнопки
- Плавные переходы между фонами (1s transition)

### ⬜ Шаг 10 — Admin Bot
- Команды в боте для администратора (по `ADMIN_CHAT_ID`)
- `/stats` — кол-во пользователей, транзакции
- `/addcredits <user_id> <amount>` — начисление кредитов
- `/ban <user_id>` — блокировка пользователя
- `/broadcast <text>` — рассылка всем пользователям

---

## Сессия 26-27 марта 2026

### ✅ Сделано

**Шаблоны картинок (Higgsfield Community):**
- 41 шаблон с гарантированными парами src+prompt (скрапинг из DOM: `alt` + `src`)
- 6 категорий: Портреты (7), Мода (14), Интерьер (5), Натюрморт (5), Фэнтези (5), Арт (5)
- Все промпты на русском, проверены визуально через скачивание каждого изображения (OpenCV)
- Полноэкранный просмотр с bottom sheet + кнопка «Использовать» → переход на «Редактирование» с референсом
- Крестик закрытия: `top: 130px` (не перекрывается Telegram header) — на всех экранах

**Шаблоны видео (Kling AI):**
- 20 реальных mp4 с Kling CDN (получены через performance.getEntriesByType)
- Промпты написаны на основе анализа кадров (скачаны через OpenCV, проанализированы визуально)
- Motion: 36 пресетов Higgsfield (промпты описывают типы движений)
- Аватары: 13 персонажей с описаниями по реальным кадрам (Sophie=оператор, Amy=врач, Noah=малыш, и т.д.)

**Пуш-система (автоматические последовательности):**
- Таблицы: `push_sequences` (шаблоны) + `push_sent` (дедупликация) + `users.credits_zero_at`
- 4 триггера: `no_purchase` (11 пушей), `after_purchase` (1), `low_credits` (3), `zero_credits` (7)
- 22 маркетинговых текста на русском с фото из Higgsfield CDN
- Фоновый воркер в боте: каждые 2 мин проверяет pending, отправляет
- Timezone-aware (9:00–22:00 по времени юзера), дедупликация
- При покупке — цепочка `no_purchase` останавливается, при пополнении — `zero_credits` сбрасывается
- Seed: 22 пуша вставляются при миграции автоматически (is_active=false по умолчанию)

**Админка (/panel → Пуши):**
- UI цепочек с вертикальным таймлайном
- 4 таба: Не купил / Купил / Мало кредитов / Ноль
- Inline редактирование текста, URL фото, тайминга, часов
- Панель форматирования: жирный, курсив, эмодзи (через data-атрибуты)
- Удаление/добавление фото, вкл/выкл каждого пуша
- API: CRUD `/admin/push/sequences`

### Известные проблемы
- Kling CDN mp4 ссылки могут истечь (временные) — нужно проверить через несколько дней
- Фоны webapp грузятся долго (~1 мин) — нужна оптимизация (WebP, lazy load, сжатие)
- Видео-шаблоны: промпты не на 100% соответствуют видео (анализ по одному кадру)

### Что делать дальше
- ⬜ **Шаг 7**: Прописать API ключи (NANABANANA_API_KEY, KLING_API_KEY) → тестировать генерацию
- ⬜ **Шаг 8**: Интеграция UnitPay/YooMoney для оплаты пакетов
- ⬜ Оптимизация фонов (сжатие JPG → WebP, уменьшение размера)
- ⬜ Больше Kling видео (скрипт сбора mp4 через performance API уже есть)
- ⬜ Проверить и активировать пуш-последовательности через админку
