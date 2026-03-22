import { Bot, InlineKeyboard } from 'grammy';
import * as dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const BOT_TOKEN  = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL ?? 'https://anisimovrog1.github.io/sakhaai/';
const SERVER_URL = process.env.SERVER_URL ?? 'https://sakhaai-production.up.railway.app';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID ? Number(process.env.ADMIN_CHAT_ID) : null;

if (!BOT_TOKEN) throw new Error('BOT_TOKEN не задан');

// ─── HTTP helpers ───────────────────────────────────────
function httpRequest(method: string, url: string, data?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : undefined;
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': String(Buffer.byteLength(body)) } : {}),
      },
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(responseData)); } catch { resolve({}); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function httpGet(url: string) { return httpRequest('GET', url); }
function httpPost(url: string, data: object) { return httpRequest('POST', url, data); }

function isAdmin(chatId: number): boolean {
  return ADMIN_CHAT_ID !== null && chatId === ADMIN_CHAT_ID;
}

const bot = new Bot(BOT_TOKEN);

// ─── /start ─────────────────────────────────────────────
bot.command('start', async (ctx) => {
  const payload = ctx.match;

  if (payload && ctx.from) {
    const match = payload.match(/^ref_(\d+)$/);
    if (match) {
      const referrerId = parseInt(match[1], 10);
      httpPost(`${SERVER_URL}/referral/preregister`, {
        refereeId: ctx.from.id,
        refereeFirstName: ctx.from.first_name,
        refereeUsername: ctx.from.username ?? null,
        referrerId,
      }).then((res) => console.log(`🤝 Preregister: ${JSON.stringify(res)}`))
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

// ─── /help ──────────────────────────────────────────────
bot.command('help', async (ctx) => {
  const adminHelp = isAdmin(ctx.chat.id) ? `\n\nАдмин-команды:\n/stats — статистика\n/addcredits <user_id> <amount>\n/ban <user_id>\n/unban <user_id>\n/user <user_id> — инфо о юзере\n/users — список юзеров\n/broadcast <текст> — рассылка всем` : '';

  await ctx.reply(
    'Команды:\n' +
    '/start — открыть приложение\n' +
    '/help — эта справка' +
    adminHelp
  );
});

// ─── ADMIN: /stats ──────────────────────────────────────
bot.command('stats', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  try {
    const stats = await httpGet(`${SERVER_URL}/admin/stats`);
    const topList = (stats.topUsers || [])
      .map((u: any, i: number) => `${i + 1}. ${u.username ? '@' + u.username : u.first_name} — ${u.credits} кр.`)
      .join('\n');

    await ctx.reply(
      `📊 Статистика SakhaAI\n\n` +
      `👥 Юзеров: ${stats.users} (сегодня: +${stats.todayUsers})\n` +
      `🚫 Забанено: ${stats.banned}\n` +
      `💬 Чатов: ${stats.chats}\n` +
      `📝 Сообщений: ${stats.messages}\n` +
      `🎨 Генераций: ${stats.generations}\n` +
      `💰 Всего кредитов: ${stats.totalCredits}\n` +
      `📈 Транзакций сегодня: ${stats.todayTransactions}\n\n` +
      `🏆 Топ-5 юзеров:\n${topList || 'Пусто'}`
    );
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── ADMIN: /addcredits <user_id> <amount> ──────────────
bot.command('addcredits', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  const args = ctx.match.split(' ');
  if (args.length < 2) {
    await ctx.reply('Формат: /addcredits <user_id> <amount>\nПример: /addcredits 5120526651 1000');
    return;
  }

  const userId = args[0];
  const amount = parseInt(args[1], 10);
  if (isNaN(amount) || amount <= 0) {
    await ctx.reply('Сумма должна быть положительным числом');
    return;
  }

  try {
    const result = await httpPost(`${SERVER_URL}/admin/addcredits`, { userId: Number(userId), amount });
    if (result.success) {
      await ctx.reply(`✅ Начислено ${amount} кр. юзеру ${userId}\nНовый баланс: ${result.newBalance} кр.`);
    } else {
      await ctx.reply(`❌ Ошибка: ${result.error}`);
    }
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── ADMIN: /ban <user_id> ──────────────────────────────
bot.command('ban', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  const userId = ctx.match.trim();
  if (!userId) { await ctx.reply('Формат: /ban <user_id>'); return; }

  try {
    const result = await httpPost(`${SERVER_URL}/admin/ban`, { userId: Number(userId), ban: true });
    if (result.success) {
      await ctx.reply(`🚫 Юзер ${userId} заблокирован`);
    } else {
      await ctx.reply(`❌ Ошибка: ${result.error}`);
    }
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── ADMIN: /unban <user_id> ────────────────────────────
bot.command('unban', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  const userId = ctx.match.trim();
  if (!userId) { await ctx.reply('Формат: /unban <user_id>'); return; }

  try {
    const result = await httpPost(`${SERVER_URL}/admin/ban`, { userId: Number(userId), ban: false });
    if (result.success) {
      await ctx.reply(`✅ Юзер ${userId} разблокирован`);
    } else {
      await ctx.reply(`❌ Ошибка: ${result.error}`);
    }
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── ADMIN: /user <user_id> ─────────────────────────────
bot.command('user', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  const userId = ctx.match.trim();
  if (!userId) { await ctx.reply('Формат: /user <user_id>'); return; }

  try {
    const u = await httpGet(`${SERVER_URL}/admin/user/${userId}`);
    if (u.error) { await ctx.reply(`❌ ${u.error}`); return; }

    await ctx.reply(
      `👤 Юзер ${u.id}\n\n` +
      `Имя: ${u.first_name} ${u.last_name || ''}\n` +
      `Username: ${u.username ? '@' + u.username : '—'}\n` +
      `Кредиты: ${u.credits}\n` +
      `Забанен: ${u.is_banned ? 'Да' : 'Нет'}\n` +
      `Язык: ${u.language_code}\n` +
      `Регистрация: ${new Date(u.created_at).toLocaleDateString('ru')}\n\n` +
      `💬 Чатов: ${u.chats}\n` +
      `📝 Транзакций: ${u.transactions}\n` +
      `🎨 Генераций: ${u.generations}`
    );
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── ADMIN: /users ──────────────────────────────────────
bot.command('users', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  try {
    const users = await httpGet(`${SERVER_URL}/admin/users`);
    if (!Array.isArray(users) || users.length === 0) {
      await ctx.reply('Юзеров нет');
      return;
    }

    const list = users.slice(0, 20).map((u: any) =>
      `${u.username ? '@' + u.username : u.first_name} | ${u.credits} кр. | ${u.is_banned ? '🚫' : '✅'}`
    ).join('\n');

    await ctx.reply(`👥 Юзеры (${users.length}):\n\n${list}`);
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── ADMIN: /broadcast <text> ───────────────────────────
bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  const text = ctx.match.trim();
  if (!text) { await ctx.reply('Формат: /broadcast <текст сообщения>'); return; }

  try {
    const users = await httpGet(`${SERVER_URL}/admin/users`);
    if (!Array.isArray(users)) { await ctx.reply('Не удалось получить юзеров'); return; }

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await ctx.api.sendMessage(Number(user.id), text);
        sent++;
      } catch {
        failed++;
      }
      // Telegram rate limit: 30 сообщений в секунду
      if (sent % 25 === 0) await new Promise(r => setTimeout(r, 1000));
    }

    await ctx.reply(`📨 Рассылка завершена\n\nОтправлено: ${sent}\nОшибок: ${failed}`);
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── Запуск ─────────────────────────────────────────────
bot.start({
  onStart: () => console.log('Бот @UraanxAI_bot запущен'),
});
