# Ключевые Flow

## 1. Auth Flow (регистрация + вход)
```
Webapp открывается → window.Telegram.WebApp.initData
    ↓
POST /auth {initData, deviceId, timezoneOffset, referralCode}
    ↓
Валидация HMAC-SHA256 (через BOT_TOKEN)
    ↓
Upsert user (INSERT ON CONFLICT → xmax=0 = новый)
    ↓
Проверка is_banned
    ↓
[ASYNC — не блокирует ответ]
  ├─ Антифрод (6 слоёв) → fraud_score
  ├─ Welcome бонус (0/50/300 кр) ← СРАЗУ после антифрода
  ├─ Сохранить device fingerprint
  ├─ Сохранить timezone
  ├─ Mark welcome push as sent
  ├─ Сохранить IP
  └─ Зарегистрировать реферал
    ↓
Fetch Telegram avatar (Bot API)
    ↓
JWT (30 дней) → клиенту
```

**КРИТИЧНО:** Бонус начисляется в auth.ts ASYNC после антифрода. Не в chat/image/video.

## 2. Credit Flow (списание)
```
Юзер нажимает "Генерировать"
    ↓
Рассчитать стоимость (pricing)
    ↓
deduct(userId, cost, type, description)
  ├─ BEGIN transaction
  ├─ SELECT credits FOR UPDATE (блокировка строки)
  ├─ Проверка: credits >= amount
  ├─ UPDATE credits = credits - amount
  ├─ INSERT transaction
  ├─ COMMIT
  ├─ Invalidate Redis cache
  └─ Если credits ≤ 0 → markCreditsZero()
    ↓
Вызвать AI API
    ↓
Если ошибка → addCredits() рефанд
```

## 3. Push Flow (автоматические пуши)
```
Бот каждые 2 мин → GET /admin/push/sequences/pending
    ↓
findPendingPushes():
  ├─ Для каждого trigger_type:
  │   ├─ Найти подходящих юзеров
  │   ├─ Проверить timezone (9:00-22:00)
  │   ├─ Проверить цепочку (предыдущий шаг отправлен?)
  │   └─ Проверить дедупликацию (push_sent)
  └─ Вернуть массив pending pushes
    ↓
Бот для каждого:
  ├─ A/B тест (50/50)
  ├─ Greeting (dynamic/fixed/none)
  ├─ sendVideo/sendPhoto/sendMessage
  ├─ POST /admin/push/sequences/mark-sent
  └─ Rate limit: 1с каждые 25 sends
```

**ВАЖНО:** Seed вставляет пуши с is_active=false. Нужно включить в /panel.

## 4. Payment Flow
```
POST /payment/create {package, paymentMethod}
    ↓
Создать order (status=pending)
    ↓
Вернуть UnitPay URL → юзер платит
    ↓
UnitPay webhook → GET /payment/unitpay?method=pay&params={...}
    ↓
Проверить подпись SHA256
    ↓
ATOMIC транзакция:
  ├─ order.status → paid
  ├─ referral.status → paid
  ├─ referral.reward_credits = 25% от пакета
  ├─ addCredits(buyer, packageCredits)
  └─ addCredits(referrer, rewardCredits)
```

## 5. Async Video Flow
```
POST /video/generate → deduct credits → submit to Kling → return taskId
    ↓
pending_tasks: status=pending
    ↓
task-worker.ts (каждые 30с):
  ├─ Проверить статус через Kling API
  ├─ succeed → saveGeneration + Telegram push юзеру
  ├─ failed → refund credits + error push
  └─ timeout (>60 мин) → auto-refund
```

## 6. Антифрод (6 слоёв)
```
1. Device Fingerprint → 3-5 очков если multiaccounting
2. Telegram Account → -3 premium, +1 свежий/без username/без фото
3. IP Intelligence → 2-4 очка если 3+ аккаунтов без покупок
4. Rate Limiting → 3-4 очка если 3+ регистраций за 24ч
5. Headless Browser → 1-5 очков
6. Итог:
   - Score < 3: 300 кредитов (полный бонус)
   - Score 3-4: 50 кредитов (подозрительный)
   - Score ≥ 5: 0 кредитов (заблокирован)
```
