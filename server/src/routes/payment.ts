import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import { pool } from '../db/pool';
import { addCredits } from '../services/balance';

export const paymentRouter = Router();

// UnitPay настройки
const UNITPAY_SECRET = process.env.UNITPAY_SECRET || 'e0c0cae5a534ef08048e8a987a6562d9';
const UNITPAY_PROJECT_ID = process.env.UNITPAY_PROJECT_ID || '445145';
const UNITPAY_PUBLIC_KEY = process.env.UNITPAY_PUBLIC_KEY || '445145-176dc';

const PACKAGES: Record<string, { label: string; amountRub: number; credits: number }> = {
  start: { label: 'Старт',   amountRub: 99,   credits: 1100  },
  basic: { label: 'Базовый', amountRub: 299,  credits: 3500  },
  pro:   { label: 'Про',     amountRub: 799,  credits: 10000 },
  max:   { label: 'Макс',    amountRub: 1990, credits: 28000 },
};

const REFERRAL_REWARDS: Record<string, number> = {
  start: 200, basic: 600, pro: 1500, max: 4000,
};

// ── Подпись UnitPay ──────────────────────────────────
function unitpaySign(method: string, params: Record<string, string>): string {
  // Сортируем параметры по ключу, добавляем метод и секрет
  const sorted = Object.keys(params).sort().map(k => params[k]);
  const str = method + '{up}' + sorted.join('{up}') + '{up}' + UNITPAY_SECRET;
  return crypto.createHash('sha256').update(str).digest('hex');
}

// ── POST /payment/create — создать заказ и вернуть URL оплаты ──
paymentRouter.post('/create', requireAuth, async (req: Request, res: Response) => {
  try {
    const { package: pkg, paymentMethod } = req.body;
    const pack = PACKAGES[pkg];
    if (!pack) { res.status(400).json({ error: 'Неизвестный пакет' }); return; }

    const orderId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO orders (id, user_id, package, amount_rub, credits) VALUES ($1, $2, $3, $4, $5)`,
      [orderId, req.userId, pkg, pack.amountRub, pack.credits],
    );

    // Формируем URL оплаты UnitPay
    const params: Record<string, string> = {
      sum: String(pack.amountRub),
      account: orderId,
      desc: `UraanxAI — пакет "${pack.label}"`,
      currency: 'RUB',
    };

    const sign = unitpaySign('initPayment', params);

    const paymentUrl = `https://unitpay.ru/pay/${UNITPAY_PUBLIC_KEY}?sum=${params.sum}&account=${params.account}&desc=${encodeURIComponent(params.desc)}&currency=RUB&signature=${sign}` +
      (paymentMethod ? `&paymentType=${paymentMethod}` : '');

    res.json({ orderId, paymentUrl });
  } catch (err: any) {
    console.error('payment/create error:', err);
    res.status(500).json({ error: 'Ошибка создания заказа' });
  }
});

// ── GET /payment/unitpay — webhook от UnitPay ──────────
// UnitPay отправляет GET-запрос с параметрами
paymentRouter.get('/unitpay', async (req: Request, res: Response) => {
  try {
    const method = req.query.method as string; // check | pay | error
    const params = req.query.params as any;

    if (!method || !params) {
      res.json({ error: { message: 'Неверный запрос' } });
      return;
    }

    // Проверяем подпись
    const incomingSign = params.signature || params.sign;
    const paramsCopy = { ...params };
    delete paramsCopy.signature;
    delete paramsCopy.sign;
    const expectedSign = unitpaySign(method, paramsCopy);

    if (incomingSign !== expectedSign) {
      console.error('UnitPay: неверная подпись', { incomingSign, expectedSign });
      res.json({ error: { message: 'Неверная подпись' } });
      return;
    }

    const account = params.account; // orderId
    const amount = parseFloat(params.orderSum || params.sum);

    if (method === 'check') {
      // Проверяем: существует ли заказ, совпадает ли сумма
      const orderResult = await pool.query(
        `SELECT * FROM orders WHERE id = $1 AND status = 'pending'`,
        [account]
      );
      const order = orderResult.rows[0];

      if (!order) {
        res.json({ error: { message: 'Заказ не найден' } });
        return;
      }

      if (Math.abs(amount - order.amount_rub) > 1) {
        res.json({ error: { message: `Сумма не совпадает: ожидается ${order.amount_rub}₽` } });
        return;
      }

      // Всё ок — подтверждаем
      res.json({ result: { message: 'Заказ подтверждён' } });
      return;
    }

    if (method === 'pay') {
      // Оплата прошла — начисляем кредиты
      const orderResult = await pool.query(
        `SELECT * FROM orders WHERE id = $1`,
        [account]
      );
      const order = orderResult.rows[0];

      if (!order) {
        res.json({ error: { message: 'Заказ не найден' } });
        return;
      }

      if (order.status === 'paid') {
        // Уже обработан — просто подтверждаем
        res.json({ result: { message: 'Уже обработан' } });
        return;
      }

      // Начисляем кредиты
      await addCredits(
        order.user_id,
        order.credits,
        'topup',
        `Пакет "${PACKAGES[order.package]?.label}" — ${order.amount_rub}₽`
      );

      // Обновляем заказ
      await pool.query(
        `UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1`,
        [account]
      );

      // Обновляем реферал — переводим в held
      const rewardCredits = REFERRAL_REWARDS[order.package] || 0;
      if (rewardCredits > 0) {
        await pool.query(
          `UPDATE referrals SET status = 'held', package = $1, reward_credits = $2, paid_at = NOW()
           WHERE referee_id = $3 AND status = 'pending'`,
          [order.package, rewardCredits, order.user_id]
        );
      }

      console.log(`✅ Оплата UnitPay: user=${order.user_id}, пакет=${order.package}, +${order.credits} кр.`);

      // Уведомляем админов через бота (если BOT_TOKEN есть)
      notifyAdmins(order).catch(console.error);

      res.json({ result: { message: 'Оплата обработана' } });
      return;
    }

    if (method === 'error') {
      console.error('UnitPay error:', params.errorMessage);
      res.json({ result: { message: 'Ошибка получена' } });
      return;
    }

    res.json({ error: { message: 'Неизвестный метод' } });
  } catch (err: any) {
    console.error('UnitPay webhook error:', err);
    res.json({ error: { message: 'Внутренняя ошибка сервера' } });
  }
});

// Уведомление админов о новой оплате
async function notifyAdmins(order: any) {
  const botToken = process.env.BOT_TOKEN;
  const adminIds = (process.env.ADMIN_CHAT_ID || '').split(',').filter(Boolean);
  if (!botToken || !adminIds.length) return;

  const user = await pool.query('SELECT username, first_name FROM users WHERE id = $1', [order.user_id]);
  const u = user.rows[0];
  const name = u?.username ? '@' + u.username : u?.first_name || order.user_id;
  const text = `💳 Пополнение\n\n${name} оплатил ${order.amount_rub} ₽ (${PACKAGES[order.package]?.label})\n+${order.credits} кредитов`;

  for (const adminId of adminIds) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminId.trim(), text }),
    }).catch(() => {});
  }
}

// ── GET /payment/status/:orderId ──
paymentRouter.get('/status/:orderId', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, package, amount_rub, credits, status, created_at, paid_at FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.orderId, req.userId],
    );
    if (!result.rows[0]) { res.status(404).json({ error: 'Заказ не найден' }); return; }
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Ошибка' });
  }
});
