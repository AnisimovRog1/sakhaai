# SakhaAI / UraanxAI — Project Guide

## Стек
- **webapp** — React + TypeScript + Vite + Tailwind → Netlify
- **server** — Node.js + Express 4 + PostgreSQL + Gemini AI → Railway (`sakhaai`)
- **bot** — grammY (Telegram Bot) → Railway (`focused-clarity`)

## Деплой
- Webapp: `cd webapp && npm run build && npx netlify-cli deploy --dir=dist --prod`
- Server/Bot: `git push` → Railway автодеплой

## Ключевые URL
- Webapp: https://dreamy-churros-2c46d7.netlify.app
- Server: https://sakhaai-production.up.railway.app
- Bot: @UraanxAI_bot

## Переменные окружения (Railway — сервис `sakhaai`)
- `DATABASE_URL` — PostgreSQL Railway
- `BOT_TOKEN` — токен @UraanxAI_bot
- `JWT_SECRET`
- `GEMINI_API_KEY` — ключ от второго Google-аккаунта
- `ALLOWED_ORIGINS` — https://dreamy-churros-2c46d7.netlify.app

## Важные детали
- Express 4 не ловит async ошибки — все route handlers должны быть в try/catch
- Gemini модель: `gemini-2.5-flash` (у `gemini-2.0-flash` квота исчерпана)
- Token хранится в памяти модуля (`client.ts`) — не в localStorage
- `window.Telegram.WebApp` требует `<script src="https://telegram.org/js/telegram-web-app.js">` в index.html
- Новые пользователи получают `credits = 0` — нужно начислять вручную или через топап

## Прогресс по шагам

### ✅ Шаг 1 — Деплой server/ на Railway
- PostgreSQL подключён, миграции применяются при старте
- Auth через Telegram initData (HMAC-SHA256)

### ✅ Шаг 2 — Сборка и деплой webapp/ на Netlify
- `.env.production` с `VITE_API_URL` и `VITE_BOT_USERNAME`
- SPA роутинг через `public/_redirects`

### ✅ Шаг 3 — BotFather: Menu Button настроен
- URL: https://dreamy-churros-2c46d7.netlify.app

### ✅ Шаг 4 — ALLOWED_ORIGINS на Railway
- Добавлен Netlify домен

### ✅ Шаг 5 — Деплой bot/ на Railway
- Сервис: `focused-clarity`
- /start показывает кнопку с Mini App

### ✅ Шаг 6 — End-to-end тест
- Авторизация ✅
- Создание чата ✅
- Чат с Gemini ✅

### ⬜ Шаг 7 — API ключи NanaBanana (картинки) и Kling (видео)
- Прописать в Railway Variables: `NANABANANA_API_KEY`, `KLING_API_KEY`
- Проверить routes/image.ts и routes/video.ts

### ⬜ Шаг 8 — YooMoney оплата
- Интеграция платёжного виджета
- Webhook для начисления кредитов

### ⬜ Шаг 9 — Admin Bot + редизайн
- Admin команды для управления пользователями
- UI редизайн webapp
