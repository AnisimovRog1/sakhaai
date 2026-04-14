import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import { pool } from '../db/pool';
import { addCredits } from '../services/balance';
import { REFERRAL_REWARDS } from '../services/referral';

export const paymentRouter = Router();

// UnitPay настройки
const UNITPAY_SECRET = process.env.UNITPAY_SECRET || '';
const UNITPAY_PROJECT_ID = process.env.UNITPAY_PROJECT_ID || '';
const UNITPAY_PUBLIC_KEY = process.env.UNITPAY_PUBLIC_KEY || '';

const PACKAGES: Record<string, { label: string; amountRub: number; credits: number }> = {
  start: { label: 'Старт',   amountRub: 99,   credits: 1100  },
  basic: { label: 'Базовый', amountRub: 299,  credits: 3500  },
  pro:   { label: 'Про',     amountRub: 799,  credits: 10000 },
  max:   { label: 'Макс',    amountRub: 1990, credits: 28000 },
};

// ── Подпись UnitPay ──────────────────────────────────
function unitpaySign(method: string, params: Record<string, string>): string {
  // Сортируем параметры по ключу, добавляем метод и секрет
  const sorted = Object.keys(params).sort().map(k => params[k]);
  const str = method + '{up}' + sorted.join('{up}') + '{up}' + UNITPAY_SECRET;
  return crypto.createHash('sha256').update(str).digest('hex');
}

// ── POST /payment/validate-promo — проверить промокод ──
paymentRouter.post('/validate-promo', requireAuth, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) { res.json({ valid: false, reason: 'Введите промокод' }); return; }

    const promoResult = await pool.query(
      'SELECT * FROM promo_codes WHERE LOWER(code) = LOWER($1) AND is_active = true',
      [code.trim()]
    );
    const promo = promoResult.rows[0];
    if (!promo) { res.json({ valid: false, reason: 'Промокод не найден' }); return; }

    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      res.json({ valid: false, reason: 'Промокод исчерпан' }); return;
    }

    const usedResult = await pool.query(
      'SELECT id FROM promo_uses WHERE user_id = $1',
      [req.userId]
    );
    if (usedResult.rows.length > 0) {
      res.json({ valid: false, reason: 'Вы уже использовали промокод' }); return;
    }

    res.json({ valid: true, bonusCredits: promo.bonus_credits, code: promo.code });
  } catch (err: any) {
    console.error('validate-promo error:', err);
    res.status(500).json({ valid: false, reason: 'Ошибка сервера' });
  }
});

// ── POST /payment/create — создать заказ и вернуть URL оплаты ──
paymentRouter.post('/create', requireAuth, async (req: Request, res: Response) => {
  try {
    const { package: pkg, paymentMethod, promoCode } = req.body;
    const pack = PACKAGES[pkg];
    if (!pack) { res.status(400).json({ error: 'Неизвестный пакет' }); return; }

    // Проверяем скидку -30% (одноразовая, 24ч)
    let finalAmount = pack.amountRub;
    let discountPercent = 0;
    try {
      const discRow = await pool.query(
        `SELECT discount_type, discount_expires_at, discount_used FROM users WHERE id = $1`,
        [req.userId]
      );
      const disc = discRow.rows[0];
      if (disc && !disc.discount_used && disc.discount_expires_at && new Date(disc.discount_expires_at) > new Date()) {
        if (disc.discount_type === 'pro' && pkg === 'pro') {
          finalAmount = Math.round(pack.amountRub * 0.7); // 559₽
          discountPercent = 30;
        } else if (disc.discount_type === 'max' && pkg === 'max') {
          finalAmount = Math.round(pack.amountRub * 0.7); // 1393₽
          discountPercent = 30;
        }
      }
    } catch (err) {
      console.error('Discount check error:', err);
      // При ошибке — обычная цена, не ломаем оплату
    }

    if (discountPercent > 0) {
      console.log(`💰 Скидка -${discountPercent}%: user=${req.userId}, pkg=${pkg}, ${pack.amountRub}₽ → ${finalAmount}₽`);
    }

    // Промокод — валидация и сохранение
    let validPromoCode: string | null = null;
    let promoBonus = 0;
    if (promoCode) {
      const promoResult = await pool.query(
        'SELECT * FROM promo_codes WHERE LOWER(code) = LOWER($1) AND is_active = true',
        [promoCode.trim()]
      );
      const promo = promoResult.rows[0];
      if (promo && (!promo.max_uses || promo.used_count < promo.max_uses)) {
        const usedResult = await pool.query('SELECT id FROM promo_uses WHERE user_id = $1', [req.userId]);
        if (usedResult.rows.length === 0) {
          validPromoCode = promo.code;
          promoBonus = promo.bonus_credits;
        }
      }
    }

    const orderId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO orders (id, user_id, package, amount_rub, credits, discount_percent, promo_code, promo_bonus) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, req.userId, pkg, finalAmount, pack.credits, discountPercent, validPromoCode, promoBonus],
    );

    // Вызываем UnitPay API — initPayment
    const apiParams = new URLSearchParams({
      method: 'initPayment',
      'params[projectId]': UNITPAY_PROJECT_ID,
      'params[secretKey]': UNITPAY_SECRET,
      'params[sum]': String(finalAmount),
      'params[account]': orderId,
      'params[desc]': `UraanxAI — пакет "${pack.label}"`,
      'params[currency]': 'RUB',
      'params[paymentType]': paymentMethod || 'sbp',
    });

    const apiRes = await fetch(`https://unitpay.money/api?${apiParams.toString()}`);
    const apiData = await apiRes.json() as any;

    if (apiData.error) {
      console.error('UnitPay initPayment error:', apiData.error);
      res.status(400).json({ error: apiData.error.message || 'Ошибка UnitPay' });
      return;
    }

    const paymentUrl = apiData.result?.redirectUrl || null;
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
      // Оплата прошла — начисляем кредиты (с блокировкой от двойного начисления)
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const orderResult = await client.query(
          `SELECT * FROM orders WHERE id = $1 FOR UPDATE`,
          [account]
        );
        const order = orderResult.rows[0];

        if (!order) {
          await client.query('ROLLBACK');
          res.json({ error: { message: 'Заказ не найден' } });
          return;
        }

        if (order.status === 'paid') {
          await client.query('ROLLBACK');
          res.json({ result: { message: 'Уже обработан' } });
          return;
        }

        // Обновляем заказ + реферал внутри одной транзакции
        await client.query(
          `UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1`,
          [account]
        );

        // Реферальный бонус — обновляем статус внутри транзакции
        const rewardCredits = REFERRAL_REWARDS[order.package] || 0;
        let referrerId: number | null = null;
        if (rewardCredits > 0) {
          const refRow = await client.query(
            `UPDATE referrals SET status = 'paid', package = $1, reward_credits = $2, paid_at = NOW(), reward_paid_at = NOW()
             WHERE referee_id = $3 AND status = 'pending'
             RETURNING referrer_id`,
            [order.package, rewardCredits, order.user_id]
          );
          if (refRow.rows[0]) referrerId = refRow.rows[0].referrer_id;
        }

        // Начисляем кредиты покупателю ВНУТРИ транзакции
        await client.query(
          `UPDATE users SET credits = credits + $1, updated_at = NOW() WHERE id = $2`,
          [order.credits, order.user_id]
        );

        // Помечаем скидку как использованную (только при реальной оплате)
        if (order.discount_percent > 0) {
          await client.query(
            `UPDATE users SET discount_used = true WHERE id = $1`,
            [order.user_id]
          );
        }
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'topup', $2, $3)`,
          [order.user_id, order.credits, `Пакет "${PACKAGES[order.package]?.label}" — ${order.amount_rub}₽`]
        );

        // Начисляем бонус реферу ВНУТРИ транзакции
        if (referrerId && rewardCredits > 0) {
          await client.query(
            `UPDATE users SET credits = credits + $1, updated_at = NOW() WHERE id = $2`,
            [rewardCredits, referrerId]
          );
          await client.query(
            `INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'referral', $2, $3)`,
            [referrerId, rewardCredits, `Реферальная награда (${PACKAGES[order.package]?.label}): +${rewardCredits} кр.`]
          );
          console.log(`🎁 Реферал: +${rewardCredits} кр. реферу ${referrerId}`);
        }

        // Промо-бонус (если есть)
        if (order.promo_code && order.promo_bonus > 0) {
          await client.query(
            `UPDATE users SET credits = credits + $1, updated_at = NOW() WHERE id = $2`,
            [order.promo_bonus, order.user_id]
          );
          await client.query(
            `INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'topup', $2, $3)`,
            [order.user_id, order.promo_bonus, `Промо-бонус "${order.promo_code}": +${order.promo_bonus} кр.`]
          );
          // Записываем использование промокода
          const promoRow = await client.query('SELECT id FROM promo_codes WHERE code = $1', [order.promo_code]);
          if (promoRow.rows[0]) {
            await client.query(
              `INSERT INTO promo_uses (promo_id, user_id, order_id, credits_awarded) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO NOTHING`,
              [promoRow.rows[0].id, order.user_id, order.id, order.promo_bonus]
            );
            await client.query(
              `UPDATE promo_codes SET used_count = used_count + 1 WHERE id = $1`,
              [promoRow.rows[0].id]
            );
          }
          console.log(`🎟️ Промо: +${order.promo_bonus} кр. юзеру ${order.user_id} (${order.promo_code})`);
        }

        await client.query('COMMIT');

        console.log(`✅ Оплата UnitPay: user=${order.user_id}, пакет=${order.package}, +${order.credits} кр.${order.promo_bonus ? ` + ${order.promo_bonus} промо` : ''}`);
        // Прибавляем к цели
        pool.query('UPDATE marketing_goals SET current_revenue = current_revenue + $1', [order.amount_rub]).catch(console.error);
        notifyAdmins(order).catch(console.error);

        res.json({ result: { message: 'Оплата обработана' } });
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
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
    }).then(async (r) => {
      if (!r.ok) console.error(`notifyAdmins failed for ${adminId}:`, await r.text().catch(() => r.status));
    }).catch((e) => {
      console.error(`notifyAdmins fetch error for ${adminId}:`, e.message);
    });
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
