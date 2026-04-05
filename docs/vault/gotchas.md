# Известные ловушки и edge cases

## 1. admin-panel.ts — backtick template literal
**Весь HTML в одном TypeScript template literal (backtick).** Escaping работает иначе:
| Нужно в output | Писать в backtick |
|----------------|-------------------|
| `'` в html строке | `\\x27` |
| `\*` в regex | `\\*` |
| `\w` в regex | `\\w` |
| `\n` (newline) | `\\n` |
| literal `\n` | `\\\\n` |

**При ANY изменении admin-panel.ts → проверить ВСЕ backslash в файле.**

## 2. Railway DELETE с FK = не работает
Railway Query тихо откатывает DELETE при foreign key constraints. Показывает "Query ran successfully" но строки остаются.
**Решение:** `TRUNCATE table1, table2, ... CASCADE;` потом `DELETE FROM users WHERE ...`

## 3. Seed воскрешает удалённые пуши
`seedPushSequences()` при старте сервера проверяет `SELECT FROM push_sequences` (без WHERE is_deleted). Если пуш удалён через админку, seed не вставит дубликат. Фикс уже применён.

## 4. Welcome бонус — где вызывается
`tryGrantWelcomeBonus()` вызывается в:
- **auth.ts** — ASYNC после антифрод проверки (основной)
- chat.ts, image.ts, video.ts — fallback при первом запросе
Флаг `welcome_bonus_granted` предотвращает двойное начисление.

## 5. credits_zero_at tracking
Когда баланс ≤ 0 → `markCreditsZero()` ставит timestamp. Это запускает zero_credits пуш-цепочку. При пополнении → `clearCreditsZero()` + `resetZeroCreditsPushes()`.

## 6. Kling temp files
data: URL'ы конвертируются в временные HTTP URL'ы через `/tmp-upload/{id}`. Автоудаление через 60 мин или при 200+ файлах.

## 7. Аватар — СИНХРОННЫЙ
Avatar (lip-sync) = синхронный запрос (не async как видео). Цепочка: TTS (fal.ai) → lip-sync (fal.ai). Таймаут 30 мин.

## 8. Push sequences — is_active=false по умолчанию
Seed вставляет ВСЕ пуши как неактивные (кроме welcome). Нужно включить в /panel → Пуши.

## 9. Видео width/height для Telegram
При upload видео через админку — размеры берутся из: 1) HTML5 Video API (клиент), 2) Telegram API response (fallback). Передаются в sendVideo для правильного aspect ratio.

## 10. JWT хранится в памяти
Token НЕ в localStorage. Хранится в переменной модуля `api/client.ts`. При перезагрузке — re-auth через initData.

## 11. Реферальная награда — мгновенная
Старая схема: pending → held 24h → paid. Новая: pending → paid мгновенно при оплате покупателем. В одной транзакции с order.

## 12. Multiplier ценообразования
Все цены умножаются на `current_USD_rate / 80.62`. Обновляется из внешнего API. Если курс вырос — цены растут пропорционально.

## 13. Telegram initData — signed but not encrypted
Данные юзера читаемы. Подпись HMAC-SHA256 проверяется на сервере через BOT_TOKEN.

## 14. Express 4 — async handlers
Express 4 НЕ ловит async ошибки. ВСЕ handlers в try/catch с res.status(500).json({error}).

## 15. GET / = Mini App
НИКОГДА не перехватывать GET /. Telegram Mini App открывает `/` и не передаёт initData в URL. Landing = `/landing`.
