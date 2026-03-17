import { Router, Request, Response } from 'express';
import { parse, validate } from '@telegram-apps/init-data-node';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { saveUserIp, registerReferral } from '../services/referral';

export const authRouter = Router();

// Достаём реальный IP с учётом прокси/Railway/Vercel
function getIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip ?? '';
}

// POST /auth
authRouter.post('/', async (req: Request, res: Response) => {
  const { initData, referralCode } = req.body;
  // referralCode — передаётся webapp'ом, если URL был ?start=ref_123

  if (!initData) {
    res.status(400).json({ error: 'initData обязателен' });
    return;
  }

  // 1. Проверяем подпись Telegram (HMAC-SHA256)
  try {
    validate(initData, process.env.BOT_TOKEN!);
  } catch {
    res.status(401).json({ error: 'Невалидный initData' });
    return;
  }

  // 2. Парсим пользователя
  const data = parse(initData);
  const tgUser = data.user;
  if (!tgUser) {
    res.status(400).json({ error: 'Нет данных пользователя' });
    return;
  }

  const ip = getIp(req);

  // 3. Upsert пользователя
  // xmax = 0 означает INSERT (новый юзер), иначе UPDATE (существующий)
  const result = await pool.query(
    `INSERT INTO users (id, username, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE
       SET username   = EXCLUDED.username,
           first_name = EXCLUDED.first_name,
           last_name  = EXCLUDED.last_name,
           updated_at = NOW()
     RETURNING id, username, first_name, credits, language_code, is_banned,
               (xmax = 0) AS is_new`,
    [tgUser.id, tgUser.username ?? null, tgUser.firstName, tgUser.lastName ?? null]
  );

  const user = result.rows[0];

  if (user.is_banned) {
    res.status(403).json({ error: 'Аккаунт заблокирован' });
    return;
  }

  // 4. Сохраняем IP (асинхронно, не блокируем ответ)
  saveUserIp(Number(tgUser.id), ip).catch(console.error);

  // 5. Реферальная связь — только для новых юзеров
  if (user.is_new && referralCode) {
    // referralCode = "ref_5120526651" → парсим ID реферера
    const match = String(referralCode).match(/^ref_(\d+)$/);
    if (match) {
      const referrerId = parseInt(match[1], 10);
      registerReferral(Number(tgUser.id), referrerId, ip)
        .then((res) => {
          if (!res.ok) {
            console.log(`Реферал отклонён: ${res.reason} (referee=${tgUser.id}, referrer=${referrerId})`);
          }
        })
        .catch(console.error);
    }
  }

  // 6. Выдаём JWT токен на 30 дней
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      credits: user.credits,
      languageCode: user.language_code,
    },
  });
});
