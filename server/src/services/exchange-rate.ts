// Динамический курс ЦБ РФ → множитель для цен
import { pool } from '../db/pool';

const BASE_RATE = 80.62; // Курс при котором рассчитаны все цены
let currentRate = BASE_RATE;
let updatedAt: string | null = null;

/** Синхронный множитель: currentRate / BASE_RATE */
export function getMultiplier(): number {
  return currentRate / BASE_RATE;
}

/** Текущий курс и мета */
export function getRateInfo() {
  return { rate: currentRate, baseRate: BASE_RATE, multiplier: getMultiplier(), updatedAt };
}

/** При старте — читаем из БД */
export async function initExchangeRate(): Promise<void> {
  try {
    const { rows } = await pool.query(
      `SELECT rate, updated_at FROM exchange_rates WHERE currency = 'USD' LIMIT 1`
    );
    if (rows.length && Number(rows[0].rate) > 0) {
      currentRate = Number(rows[0].rate);
      updatedAt = rows[0].updated_at || null;
      console.log(`💱 Курс из БД: $1 = ${currentRate}₽ (×${getMultiplier().toFixed(4)})`);
    } else {
      console.log(`💱 Курс по умолчанию: $1 = ${BASE_RATE}₽`);
    }
  } catch (e) {
    console.error('💱 Не удалось прочитать курс из БД, используем дефолт:', BASE_RATE);
  }
}

/** Fetch курс с ЦБ РФ и обновить */
export async function updateExchangeRate(): Promise<{ rate: number; changed: boolean }> {
  const oldRate = currentRate;

  try {
    const resp = await fetch('https://www.cbr.ru/scripts/XML_daily.asp');
    const buf = Buffer.from(await resp.arrayBuffer());
    // ЦБ отдаёт windows-1251
    const xml = new TextDecoder('windows-1251').decode(buf);

    // Ищем <Valute> с <CharCode>USD</CharCode> → <Value>XX,XXXX</Value>
    const usdMatch = xml.match(
      /<Valute[^>]*>[\s\S]*?<CharCode>USD<\/CharCode>[\s\S]*?<Value>([\d,]+)<\/Value>/
    );
    if (!usdMatch) throw new Error('USD не найден в XML ЦБ');

    const rate = parseFloat(usdMatch[1].replace(',', '.'));
    if (!rate || rate < 10 || rate > 500) throw new Error(`Некорректный курс: ${rate}`);

    currentRate = rate;
    updatedAt = new Date().toISOString();
    await pool.query(
      `INSERT INTO exchange_rates (currency, rate, updated_at)
       VALUES ('USD', $1, NOW())
       ON CONFLICT (currency) DO UPDATE SET rate = $1, updated_at = NOW()`,
      [rate]
    );

    const changed = Math.abs(rate - oldRate) > 0.01;
    console.log(`💱 Курс ЦБ обновлён: $1 = ${rate}₽ (×${getMultiplier().toFixed(4)})${changed ? ' ⚡ ИЗМЕНИЛСЯ' : ''}`);
    return { rate, changed };
  } catch (e: any) {
    console.error('💱 Ошибка обновления курса ЦБ:', e.message, '— используем предыдущий:', currentRate);
    return { rate: currentRate, changed: false };
  }
}
