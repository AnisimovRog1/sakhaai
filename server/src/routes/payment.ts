import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import { pool } from '../db/pool';
import { addCredits } from '../services/balance';

export const paymentRouter = Router();

const PACKAGES: Record<string, { label: string; amountRub: number; credits: number }> = {
  start: { label: 'Старт',   amountRub: 99,   credits: 1100  },
  basic: { label: 'Базовый', amountRub: 299,  credits: 3500  },
  pro:   { label: 'Про',     amountRub: 799,  credits: 10000 },
  max:   { label: 'Макс',    amountRub: 1990, credits: 28000 },
};

// ── POST /payment/create — создать заказ ──────────────────
paymentRouter.post('/create', requireAuth, async (req: Request, res: Response) => {
  try {
    const { package: pkg } = req.body;
    const pack = PACKAGES[pkg];
    if (!pack) {
      res.status(400).json({ error: 'Неизвестный пакет' });
      return;
    }

    const orderId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO orders (id, user_id, package, amount_rub, credits) VALUES ($1, $2, $3, $4, $5)`,
      [orderId, req.userId, pkg, pack.amountRub, pack.credits],
    );

    // Формируем ссылку на YooMoney quickpay
    // Пока YooMoney не подключён — возвращаем orderId и данные для будущей интеграции
    const yooWallet = process.env.YOOMONEY_WALLET;
    if (yooWallet) {
      const paymentUrl =
        `https://yoomoney.ru/quickpay/confirm.xml` +
        `?receiver=${yooWallet}` +
        `&quickpay-form=button` +
        `&paymentType=AC` +
        `&sum=${pack.amountRub}` +
        `&label=${orderId}` +
        `&successURL=${process.env.WEBAPP_URL || 'https://anisimovrog1.github.io/sakhaai/'}`;

      res.json({ orderId, paymentUrl });
    } else {
      // YooMoney ещё не настроен — заглушка
      res.json({
        orderId,
        paymentUrl: null,
        message: 'Оплата временно недоступна. Скоро подключим!',
      });
    }
  } catch (err: any) {
    console.error('payment/create error:', err);
    res.status(500).json({ error: 'Ошибка создания заказа' });
  }
});

// ── POST /payment/yoomoney — webhook от YooMoney ──────────
// YooMoney отправляет POST с данными платежа
paymentRouter.post('/yoomoney', async (req: Request, res: Response) => {
  try {
    const {
      notification_type,
      operation_id,
      amount,
      currency,
      datetime,
      sender,
      codepro,
      label, // наш orderId
      sha1_hash,
    } = req.body;

    const secret = process.env.YOOMONEY_SECRET;
    if (!secret) {
      console.error('YOOMONEY_SECRET не задан');
      res.status(500).send('Server not configured');
      return;
    }

    // Проверяем подпись
    const checkString = [
      notification_type,
      operation_id,
      amount,
      currency,
      datetime,
      sender,
      codepro,
      secret,
      label,
    ].join('&');

    const hash = crypto.createHash('sha1').update(checkString).digest('hex');
    if (hash !== sha1_hash) {
      console.error('YooMoney webhook: неверная подпись');
      res.status(403).send('Invalid signature');
      return;
    }

    // codepro=true — платёж требует подтверждения, пропускаем
    if (codepro === 'true') {
      res.status(200).send('OK');
      return;
    }

    // Ищем заказ
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND status = 'pending'`,
      [label],
    );
    const order = orderResult.rows[0];
    if (!order) {
      console.error('YooMoney webhook: заказ не найден или уже оплачен:', label);
      res.status(200).send('OK');
      return;
    }

    // Проверяем сумму (YooMoney может прислать чуть меньше из-за комиссии)
    const receivedAmount = parseFloat(amount);
    if (receivedAmount < order.amount_rub * 0.95) {
      console.error(`YooMoney webhook: сумма ${receivedAmount} < ожидаемой ${order.amount_rub}`);
      res.status(200).send('OK');
      return;
    }

    // Начисляем кредиты
    await addCredits(order.user_id, order.credits, 'topup', `Пакет "${PACKAGES[order.package]?.label}" — ${order.amount_rub}₽`);

    // Обновляем заказ
    await pool.query(
      `UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1`,
      [label],
    );

    // Обновляем реферал (если есть) — переводим в held
    await pool.query(
      `UPDATE referrals SET status = 'held', package = $1, reward_credits = $2, paid_at = NOW()
       WHERE referee_id = $3 AND status = 'pending'`,
      [order.package, Math.floor(order.credits * 0.10), order.user_id],
    );

    console.log(`✅ Оплата: user=${order.user_id}, пакет=${order.package}, +${order.credits} кр.`);
    res.status(200).send('OK');
  } catch (err: any) {
    console.error('YooMoney webhook error:', err);
    res.status(500).send('Error');
  }
});

// ── GET /payment/status/:orderId — проверить статус заказа ──
paymentRouter.get('/status/:orderId', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, package, amount_rub, credits, status, created_at, paid_at FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.orderId, req.userId],
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: 'Заказ не найден' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('payment/status error:', err);
    res.status(500).json({ error: 'Ошибка' });
  }
});
