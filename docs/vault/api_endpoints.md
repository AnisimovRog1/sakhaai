# API Endpoints

## Public (JWT auth)

| Method | Path | Описание | Стоимость |
|--------|------|----------|-----------|
| POST | /auth | Логин через Telegram initData | — |
| GET | /chats | Список чатов юзера | — |
| POST | /chats | Создать чат | — |
| GET | /chats/:id/messages | История сообщений | — |
| POST | /chats/:id/messages | Отправить + получить ответ AI | 1 кр × multiplier |
| DELETE | /chats/:id | Удалить чат | — |
| POST | /image/generate | Генерация 1-4 картинок | 155-556 кр |
| POST | /video/generate | Text→Video (async) | 290-2338 кр |
| POST | /video/motion | Motion control (async) | 840-1680 кр |
| POST | /video/avatar | Avatar lip-sync (sync) | 817-2686 кр |
| POST | /video/tts-preview | Превью голоса | — |
| GET | /video/task-status/:id | Статус async задачи | — |
| GET | /video/tasks | Все задачи юзера | — |
| GET | /balance | Текущий баланс | — |
| GET | /balance/transactions | История транзакций | — |
| GET | /referral/friends | Список рефералов | — |
| GET | /referral/stats | Статистика рефералов | — |
| POST | /payment/create | Создать заказ | — |
| GET | /payment/status/:id | Статус заказа | — |
| GET | /generations | История генераций | — |

## Webhook (без auth)
| Method | Path | Описание |
|--------|------|----------|
| GET | /payment/unitpay | UnitPay callback (подпись SHA256) |

## Admin (Bearer BOT_TOKEN или ADMIN_PASSWORD)

| Method | Path | Описание |
|--------|------|----------|
| GET | /admin/stats | Дашборд статистика |
| GET | /admin/users | Список юзеров |
| GET | /admin/user/:id | Детали юзера |
| POST | /admin/addcredits | Начислить кредиты |
| POST | /admin/refund | Рефанд |
| POST | /admin/ban | Бан/разбан |
| GET | /admin/push/sequences | Список пуш-цепочек |
| POST | /admin/push/sequences | Создать/обновить цепочку |
| GET | /admin/push/sequences/pending | Pending пуши для бота |
| POST | /admin/push/sequences/mark-sent | Отметить отправленным |
| POST | /admin/upload-photo | Загрузить медиа → file_id |
| GET | /admin/file-url/:fileId | Получить URL файла |

## Admin Panel
| Method | Path | Описание |
|--------|------|----------|
| GET | /panel | HTML веб-интерфейс |
| POST | /panel/login | Логин (ADMIN_PASSWORD) |
