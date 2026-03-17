import { Bot } from 'grammy';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN не задан в .env');
}

const bot = new Bot(BOT_TOKEN);

bot.command('start', (ctx) => {
  ctx.reply('Привет! Я SakhaAI бот. Скоро здесь будет кое-что интересное 🚀');
});

bot.start();
console.log('Бот запущен...');
