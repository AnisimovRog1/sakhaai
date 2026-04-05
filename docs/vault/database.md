# База данных — ВСЕ таблицы

## FK Constraints (порядок удаления: сверху вниз)
```
messages       → chats(id) ON DELETE CASCADE
chats          → users(id)
transactions   → users(id)
user_ips       → users(id)
referrals      → users(id) × 2 (referrer + referee)
orders         → users(id)
generations    → users(id)
pending_tasks  → (нет FK, но user_id ссылается на users)
pending_motion → (нет FK)
push_sent      → users(id), push_sequences(id) ON DELETE CASCADE
device_fingerprints → users(id)
push_log       → push_templates(id) ON DELETE CASCADE
```

**ВАЖНО:** Для массового удаления юзеров — ТОЛЬКО `TRUNCATE ... CASCADE`, Railway не выполняет DELETE с FK.

## Таблицы

### users (PK: BIGINT = Telegram ID)
| Колонка | Тип | Default | Описание |
|---------|-----|---------|----------|
| id | BIGINT | — | Telegram user ID |
| username | TEXT | NULL | @username |
| first_name | TEXT | NOT NULL | Имя |
| last_name | TEXT | NULL | Фамилия |
| language_code | TEXT | 'ru' | 'ru' или 'sah' |
| credits | INTEGER | 0 | Баланс кредитов |
| referred_by | BIGINT | NULL | FK→users (кто пригласил) |
| is_banned | BOOLEAN | false | Заблокирован |
| timezone_offset | INTEGER | 540 | Минуты от UTC (540=UTC+9) |
| fraud_score | INTEGER | NULL | 0-10+ антифрод |
| welcome_bonus_granted | BOOLEAN | false | Бонус начислен |
| credits_zero_at | TIMESTAMPTZ | NULL | Когда кредиты стали 0 |
| last_seen | TIMESTAMPTZ | NULL | Для реактивации |
| created_at | TIMESTAMPTZ | NOW() | |
| updated_at | TIMESTAMPTZ | NOW() | |

### chats
| Колонка | Тип | FK | Описание |
|---------|-----|----|----------|
| id | SERIAL PK | — | |
| user_id | BIGINT | users(id) | |
| title | TEXT | — | Default 'Новый чат' |

### messages
| Колонка | Тип | FK | Описание |
|---------|-----|----|----------|
| id | SERIAL PK | — | |
| chat_id | INTEGER | chats(id) CASCADE | |
| role | TEXT | — | 'user' или 'model' |
| content | TEXT | — | |

### transactions
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | SERIAL PK | |
| user_id | BIGINT FK | |
| type | TEXT | chat/image/video/motion/avatar/topup/referral |
| amount | INTEGER | + = пополнение, - = списание |
| description | TEXT | |

### generations
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | SERIAL PK | |
| user_id | BIGINT FK | |
| type | TEXT | image/video/motion/avatar |
| prompt | TEXT | |
| result_url | TEXT | URL или base64 |
| cost | INTEGER | |

### orders (платежи)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | TEXT PK | UUID |
| user_id | BIGINT FK | |
| package | TEXT | start/basic/pro/max |
| amount_rub | INTEGER | 99/299/799/1990 |
| credits | INTEGER | 1100/3500/10000/28000 |
| status | TEXT | pending → paid |

### referrals
| Колонка | Тип | Описание |
|---------|-----|----------|
| referrer_id | BIGINT FK | Кто пригласил |
| referee_id | BIGINT FK UNIQUE | Кого пригласили |
| status | TEXT | pending → paid |
| package | TEXT | Пакет реферала |
| reward_credits | INTEGER | 310/930/2500/6200 (25%) |

### pending_tasks (async генерации)
| Колонка | Тип | Описание |
|---------|-----|----------|
| task_id | TEXT UNIQUE | UUID клиента |
| kling_task_id | TEXT | ID задачи Kling |
| user_id | BIGINT | |
| type | TEXT | video/motion/motion-control |
| kling_endpoint | TEXT | /v1/videos/text2video и т.д. |
| cost | INTEGER | Списанные кредиты |
| status | TEXT | pending→processing→succeed/failed |
| result_url | TEXT | URL видео |
| metadata | JSONB | {model, mode, duration...} |

### push_sequences (авто-триггеры)
| Колонка | Тип | Описание |
|---------|-----|----------|
| trigger_type | TEXT | no_purchase/after_purchase/low_credits/zero_credits/daily/welcome/reactivation/first_generation |
| delay_minutes | INTEGER | Задержка в цепочке |
| credits_threshold | INTEGER | Для low_credits |
| text | TEXT | Текст сообщения |
| media_type | TEXT | photo/video/NULL |
| media_file_id | TEXT | Telegram file_id |
| is_active | BOOLEAN | Включён |
| ab_text | TEXT | A/B вариант |
| is_deleted | BOOLEAN | Soft delete |
| greeting_mode | TEXT | none/dynamic/fixed |

### push_sent (дедупликация)
| Колонка | Тип | Описание |
|---------|-----|----------|
| user_id | BIGINT FK | |
| sequence_id | INTEGER FK CASCADE | |
| sent_at | TIMESTAMPTZ | |

### device_fingerprints (антифрод)
| Колонка | Тип | Описание |
|---------|-----|----------|
| user_id | BIGINT FK | |
| fingerprint_hash | TEXT | UNIQUE(user_id, hash) |
