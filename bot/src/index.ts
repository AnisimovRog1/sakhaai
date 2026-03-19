import { Bot, InlineKeyboard } from 'grammy';
import * as dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const BOT_TOKEN  = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL ?? 'https://anisimovrog1.github.io/sakhaai/';
const SERVER_URL = process.env.SERVER_URL ?? 'https://sakhaai-production.up.railway.app';

if (!BOT_TOKEN) throw new Error('BOT_TOKEN не задан');

// HTTP POST через https модуль (работает на любой версии Node.js)
function httpPost(url: string, data: object, headers: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(responseData)); } catch { resolve({}); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const bot = new Bot(BOT_TOKEN);

bot.command('start', async (ctx) => {
  const payload = ctx.match; // "ref_5120526651" или ""

  // Если пришёл реф-код — регистрируем реферал прямо сейчас на сервере
  if (payload && ctx.from) {
    const match = payload.match(/^ref_(\d+)$/);
    if (match) {
      const referrerId = parseInt(match[1], 10);
      httpPost(`${SERVER_URL}/referral/preregister`, {
        refereeId:        ctx.from.id,
        refereeFirstName: ctx.from.first_name,
        refereeUsername:  ctx.from.username ?? null,
        referrerId,
      }, {
        'Authorization': `Bearer ${BOT_TOKEN}`,
      })
        .then((res) => console.log(`🤝 Preregister: ${JSON.stringify(res)}`))
        .catch((err) => console.error('preregister failed:', err));
    }
  }

  const keyboard = new InlineKeyboard().webApp('🚀 Открыть UraanxAI', WEBAPP_URL);

  await ctx.reply(
    `Привет, ${ctx.from?.first_name ?? 'друг'}! 👋\n\n` +
    `Я UraanxAI — твой ИИ-ассистент.\n\n` +
    `Нажми кнопку ниже, чтобы начать:`,
    { reply_markup: keyboard }
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Команды:\n' +
    '/start — открыть приложение\n' +
    '/help — эта справка'
  );
});

bot.start({
  onStart: () => console.log('Бот @UraanxAI_bot запущен'),
});
