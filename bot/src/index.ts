import { Bot, InlineKeyboard } from 'grammy';
import * as dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL ?? 'https://dreamy-churros-2c46d7.netlify.app';

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN не задан');
}

const bot = new Bot(BOT_TOKEN);

bot.command('start', async (ctx) => {
  const payload = ctx.match; // e.g. "ref_123456"
  const webappUrl = payload ? `${WEBAPP_URL}?ref=${payload}` : WEBAPP_URL;

  const keyboard = new InlineKeyboard().webApp('🚀 Открыть UraanxAI', webappUrl);

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
