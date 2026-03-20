# SakhaAI / UraanxAI — Project Guide

> Последнее обновление: 2026-03-18. Шаги 1–6 и Шаг 9 (редизайн) выполнены.

## Стек
- **webapp** — React 19 + TypeScript + Vite 8 + Tailwind 3 → Netlify
- **server** — Node.js + Express 4 + PostgreSQL + Gemini AI → Railway (сервис `sakhaai`)
- **bot** — grammY → Railway (сервис `focused-clarity`)

## Деплой
```bash
# Webapp
cd webapp && npm run build && npx netlify-cli deploy --dir=dist --prod

# Server / Bot
git push  # Railway автодеплой по main
```

## Ключевые URL
| Что | URL |
|---|---|
| Webapp (Netlify) | https://dreamy-churros-2c46d7.netlify.app |
| Server (Railway) | https://sakhaai-production.up.railway.app |
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
| `WEBAPP_URL` | https://dreamy-churros-2c46d7.netlify.app |

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
- Стоимости: чат = 1 кр., картинка = 79 кр., видео = 608–810 кр.

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
