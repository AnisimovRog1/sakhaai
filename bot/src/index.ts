import { Bot, InlineKeyboard } from 'grammy';
import * as dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN  = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL ?? 'https://dreamy-churros-2c46d7.netlify.app';
const SERVER_URL = process.env.SERVER_URL ?? 'https://sakhaai-production.up.railway.app';

if (!BOT_TOKEN) throw new Error('BOT_TOKEN не задан');

const bot = new Bot(BOT_TOKEN);

bot.command('start', async (ctx) => {
  const payload = ctx.match; // "ref_5120526651" или ""

  // Если пришёл реф-код — регистрируем реферал прямо сейчас на сервере
  if (payload && ctx.from) {
    const match = payload.match(/^ref_(\d+)$/);
    if (match) {
      const referrerId = parseInt(match[1], 10);
      fetch(`${SERVER_URL}/referral/preregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_TOKEN}`,
        },
        body: JSON.stringify({
          refereeId:        ctx.from.id,
          refereeFirstName: ctx.from.first_name,
          refereeUsername:  ctx.from.username ?? null,
          referrerId,
        }),
      }).catch((err) => console.error('preregister failed:', err));
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
