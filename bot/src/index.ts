import { Bot, InlineKeyboard } from 'grammy';
import * as dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const BOT_TOKEN  = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL ?? 'https://anisimovrog1.github.io/sakhaai/';
const SERVER_URL = process.env.SERVER_URL ?? 'https://sakhaai-production.up.railway.app';
// Список админов: ADMIN_CHAT_ID + доп. ID через запятую
const ADMIN_IDS: number[] = (process.env.ADMIN_CHAT_ID || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(Number);
// Партнёр
ADMIN_IDS.push(1008133556);
const ADMIN_CHAT_ID = ADMIN_IDS[0] || null;

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
  return ADMIN_IDS.includes(chatId);
}

const bot = new Bot(BOT_TOKEN);

// ═══════════════════════════════════════════════════════
// ПУБЛИЧНЫЕ КОМАНДЫ
// ═══════════════════════════════════════════════════════

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
      }).catch(console.error);
    }
  }

  const keyboard = new InlineKeyboard().webApp('🚀 Открыть UraanxAI', WEBAPP_URL);
  await ctx.reply(
    `Привет, ${ctx.from?.first_name ?? 'друг'}! 👋\n\n` +
    `Я UraanxAI — твой ИИ-ассистент.\n\nНажми кнопку ниже, чтобы начать:`,
    { reply_markup: keyboard }
  );
});

bot.command('help', async (ctx) => {
  let text = '📖 Команды:\n/start — открыть приложение\n/help — эта справка';
  if (isAdmin(ctx.chat.id)) {
    text += `\n\n🔐 Админ-команды:\n` +
      `/stats — отчёт за сегодня\n` +
      `/stats 7d — за 7 дней\n` +
      `/stats month — за месяц\n` +
      `/stats 2026-03 — конкретный месяц\n` +
      `/year — таблица по месяцам\n` +
      `/users — список юзеров\n` +
      `/user <id> — инфо о юзере\n` +
      `/referrals — топ рефереров\n` +
      `/deposits — пополнения за день\n` +
      `/errors — ошибки API\n` +
      `/addcredits <id> <amount>\n` +
      `/refund <id> <amount>\n` +
      `/ban <id> / /unban <id>\n` +
      `/broadcast <текст>`;
  }
  await ctx.reply(text);
});

// ═══════════════════════════════════════════════════════
// АДМИН: ГЛАВНОЕ МЕНЮ
// ═══════════════════════════════════════════════════════

bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  const keyboard = new InlineKeyboard()
    .text('📊 Отчёт сегодня', 'cmd_stats_today')
    .text('📅 За 7 дней', 'cmd_stats_7d')
    .row()
    .text('📆 За месяц', 'cmd_stats_month')
    .text('📋 По месяцам', 'cmd_year')
    .row()
    .text('👥 Юзеры', 'cmd_users')
    .text('🤝 Рефералы', 'cmd_referrals')
    .row()
    .text('💳 Пополнения', 'deposits')
    .text('❌ Ошибки API', 'errors')
    .row()
    .text('🏆 Топ-10 активных', 'top_users');

  await ctx.reply(
    `🔐 Админ-панель SakhaAI\n━━━━━━━━━━━━━━━━━━━\n\n` +
    `Выберите действие или используйте команды:\n\n` +
    `/stats · /stats 7d · /stats month\n` +
    `/year · /users · /user <id>\n` +
    `/addcredits <id> <кол-во>\n` +
    `/refund <id> <кол-во>\n` +
    `/ban <id> · /unban <id>\n` +
    `/broadcast <текст>`,
    { reply_markup: keyboard }
  );
});

// Обработчики кнопок меню
bot.callbackQuery('cmd_stats_today', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const s = await httpGet(`${SERVER_URL}/admin/stats?period=today`);
    await sendStatsMessage(ctx, s);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.callbackQuery('cmd_stats_7d', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const s = await httpGet(`${SERVER_URL}/admin/stats?period=7d`);
    await sendStatsMessage(ctx, s);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.callbackQuery('cmd_stats_month', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const s = await httpGet(`${SERVER_URL}/admin/stats?period=month`);
    await sendStatsMessage(ctx, s);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.callbackQuery('cmd_year', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const months = await httpGet(`${SERVER_URL}/admin/year`);
    if (!Array.isArray(months) || months.length === 0) {
      await ctx.reply('Данных за этот год нет');
      return;
    }
    const rows = months.map((m: any) =>
      `${m.month} | ${String(m.users).padStart(4)} юз | ${String(m.transactions).padStart(5)} тр | ${String(m.spent).padStart(6)} кр`
    ).join('\n');
    await ctx.reply(`📋 Год по месяцам:\n━━━━━━━━━━━━━━━━━━━\n${rows}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.callbackQuery('cmd_users', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const users = await httpGet(`${SERVER_URL}/admin/users`);
    if (!Array.isArray(users) || users.length === 0) { await ctx.reply('Юзеров нет'); return; }
    const list = users.slice(0, 20).map((u: any, i: number) =>
      `${i + 1}. ${u.username ? '@' + u.username : u.first_name} | ${u.credits} кр | ${u.is_banned ? '🚫' : '✅'}`
    ).join('\n');
    await ctx.reply(`👥 Юзеры (${users.length}):\n\n${list}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.callbackQuery('cmd_referrals', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const refs = await httpGet(`${SERVER_URL}/admin/referrals`);
    if (!Array.isArray(refs) || refs.length === 0) { await ctx.reply('🤝 Рефералов за неделю нет'); return; }
    const list = refs.map((r: any, i: number) =>
      `${i + 1}. ${r.username ? '@' + r.username : r.first_name} — ${r.total_refs} реф. (${r.total_earned} кр.)`
    ).join('\n');
    await ctx.reply(`🤝 Топ рефереров за неделю:\n\n${list}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

// Общая функция для отправки отчёта
async function sendStatsMessage(ctx: any, s: any) {
  const topList = (s.topActive || []).slice(0, 5)
    .map((u: any, i: number) => `  ${i + 1}. ${u.username ? '@' + u.username : u.first_name} — ${u.requests} запр.`)
    .join('\n');

  const text =
    `📊 Отчёт ${s.label}\n━━━━━━━━━━━━━━━━━━━\n\n` +
    `💰 Выручка: ${s.revenue.toLocaleString('ru')} ₽\n` +
    `📉 Себест.: ${s.costEstimate.toLocaleString('ru')} ₽\n` +
    `📈 Прибыль: ${s.profit.toLocaleString('ru')} ₽\n` +
    `📊 Маржа: ${s.margin}%\n\n` +
    `👥 DAU: ${s.dau} юз\n` +
    `🆕 Новых: +${s.newUsers}\n` +
    `📝 Запросов: ${s.transactions}\n` +
    `🤝 Рефералов: +${s.referrals}\n\n` +
    `💬 Чатов: ${s.chats} | Сообщений: ${s.messages}\n` +
    `🎨 Генераций: ${s.generations}\n` +
    `💎 Всего кредитов: ${s.totalCredits.toLocaleString('ru')}\n` +
    `🚫 Забанено: ${s.banned}\n\n` +
    `🏆 Топ активных:\n${topList || '  Пусто'}`;

  const keyboard = new InlineKeyboard()
    .text('🔙 Меню', 'cmd_menu')
    .text('🏆 Топ-10', 'top_users')
    .row()
    .text('💳 Пополнения', 'deposits')
    .text('❌ Ошибки', 'errors');

  await ctx.reply(text, { reply_markup: keyboard });
}

bot.callbackQuery('cmd_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .text('📊 Сегодня', 'cmd_stats_today')
    .text('📅 7 дней', 'cmd_stats_7d')
    .row()
    .text('📆 Месяц', 'cmd_stats_month')
    .text('📋 По месяцам', 'cmd_year')
    .row()
    .text('👥 Юзеры', 'cmd_users')
    .text('🤝 Рефералы', 'cmd_referrals')
    .row()
    .text('💳 Пополнения', 'deposits')
    .text('❌ Ошибки', 'errors');
  await ctx.reply('🔐 Админ-панель:', { reply_markup: keyboard });
});

// ═══════════════════════════════════════════════════════
// АДМИН: СТАТИСТИКА (текстовые команды)
// ═══════════════════════════════════════════════════════

bot.command('stats', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;

  const period = ctx.match.trim() || 'today';
  try {
    const s = await httpGet(`${SERVER_URL}/admin/stats?period=${encodeURIComponent(period)}`);

    const topList = (s.topActive || []).slice(0, 5)
      .map((u: any, i: number) => `  ${i + 1}. ${u.username ? '@' + u.username : u.first_name} — ${u.requests} запр.`)
      .join('\n');

    const text =
      `📊 Отчёт ${s.label}\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `💰 Выручка: ${s.revenue.toLocaleString('ru')} ₽\n` +
      `📉 Себест.: ${s.costEstimate.toLocaleString('ru')} ₽\n` +
      `📈 Прибыль: ${s.profit.toLocaleString('ru')} ₽\n` +
      `📊 Маржа: ${s.margin}%\n\n` +
      `👥 DAU: ${s.dau} юз\n` +
      `🆕 Новых: +${s.newUsers}\n` +
      `📝 Запросов: ${s.transactions}\n` +
      `🤝 Рефералов: +${s.referrals}\n\n` +
      `💬 Чатов: ${s.chats} | Сообщений: ${s.messages}\n` +
      `🎨 Генераций: ${s.generations}\n` +
      `💎 Всего кредитов: ${s.totalCredits.toLocaleString('ru')}\n` +
      `🚫 Забанено: ${s.banned}\n\n` +
      `🏆 Топ активных:\n${topList || '  Пусто'}`;

    const keyboard = new InlineKeyboard()
      .text('👥 Топ-10 юзеров', 'top_users')
      .row()
      .text('💳 Пополнения', 'deposits')
      .text('❌ Ошибки API', 'errors');

    await ctx.reply(text, { reply_markup: keyboard });
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── /year ──────────────────────────────────────────────
bot.command('year', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  try {
    const months = await httpGet(`${SERVER_URL}/admin/year`);
    if (!Array.isArray(months) || months.length === 0) {
      await ctx.reply('Данных за этот год нет');
      return;
    }
    const header = '📅 Месяц   | Юзеры | Транз | Расход кр.';
    const separator = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    const rows = months.map((m: any) =>
      `${m.month}  |  ${String(m.users).padStart(4)}  | ${String(m.transactions).padStart(5)} | ${String(m.spent).padStart(8)}`
    ).join('\n');
    await ctx.reply(`${header}\n${separator}\n${rows}`);
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── /deposits ──────────────────────────────────────────
bot.command('deposits', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  try {
    const deps = await httpGet(`${SERVER_URL}/admin/deposits`);
    if (!Array.isArray(deps) || deps.length === 0) {
      await ctx.reply('💳 Пополнений сегодня нет');
      return;
    }
    const list = deps.map((d: any) =>
      `${d.username ? '@' + d.username : d.first_name} — ${d.amount_rub}₽ (${d.package})`
    ).join('\n');
    await ctx.reply(`💳 Пополнения сегодня:\n\n${list}`);
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── /referrals ─────────────────────────────────────────
bot.command('referrals', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  try {
    const refs = await httpGet(`${SERVER_URL}/admin/referrals`);
    if (!Array.isArray(refs) || refs.length === 0) {
      await ctx.reply('🤝 Рефералов за неделю нет');
      return;
    }
    const list = refs.map((r: any, i: number) =>
      `${i + 1}. ${r.username ? '@' + r.username : r.first_name} — ${r.total_refs} реф. (${r.total_earned} кр.)`
    ).join('\n');
    await ctx.reply(`🤝 Топ рефереров за неделю:\n\n${list}`);
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ─── /errors ────────────────────────────────────────────
bot.command('errors', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  try {
    const data = await httpGet(`${SERVER_URL}/admin/errors`);
    const byType = (data.byType || []).map((e: any) => `  ${e.type}: ${e.count}`).join('\n');
    await ctx.reply(
      `❌ Ошибки API сегодня:\n\n` +
      `Всего запросов: ${data.total}\n` +
      `Ошибок: ${data.failed}\n` +
      (byType ? `\nПо типам:\n${byType}` : '')
    );
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// ═══════════════════════════════════════════════════════
// АДМИН: ЮЗЕРЫ И УПРАВЛЕНИЕ
// ═══════════════════════════════════════════════════════

bot.command('users', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  try {
    const users = await httpGet(`${SERVER_URL}/admin/users`);
    if (!Array.isArray(users) || users.length === 0) { await ctx.reply('Юзеров нет'); return; }
    const list = users.slice(0, 20).map((u: any, i: number) =>
      `${i + 1}. ${u.username ? '@' + u.username : u.first_name} | ${u.credits} кр. | ${u.is_banned ? '🚫' : '✅'}`
    ).join('\n');
    await ctx.reply(`👥 Юзеры (${users.length}):\n\n${list}`);
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

bot.command('user', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const userId = ctx.match.trim();
  if (!userId) { await ctx.reply('Формат: /user <user_id>'); return; }
  try {
    const u = await httpGet(`${SERVER_URL}/admin/user/${userId}`);
    if (u.error) { await ctx.reply(`❌ ${u.error}`); return; }
    await ctx.reply(
      `👤 Юзер ${u.id}\n━━━━━━━━━━━━━━━━\n\n` +
      `Имя: ${u.first_name} ${u.last_name || ''}\n` +
      `Username: ${u.username ? '@' + u.username : '—'}\n` +
      `💎 Кредиты: ${u.credits}\n` +
      `💸 Потрачено: ${u.totalSpent} кр.\n` +
      `🚫 Забанен: ${u.is_banned ? 'Да' : 'Нет'}\n` +
      `🌐 Язык: ${u.language_code}\n` +
      `📅 Регистрация: ${new Date(u.created_at).toLocaleDateString('ru')}\n\n` +
      `💬 Чатов: ${u.chats}\n` +
      `📝 Транзакций: ${u.transactions}\n` +
      `🎨 Генераций: ${u.generations}`
    );
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

bot.command('addcredits', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const args = ctx.match.split(' ');
  if (args.length < 2) { await ctx.reply('Формат: /addcredits <user_id> <amount>'); return; }
  const [userId, amountStr] = args;
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) { await ctx.reply('Сумма должна быть > 0'); return; }
  try {
    const r = await httpPost(`${SERVER_URL}/admin/addcredits`, { userId: Number(userId), amount });
    await ctx.reply(r.success ? `✅ +${amount} кр. юзеру ${userId}\nБаланс: ${r.newBalance} кр.` : `❌ ${r.error}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.command('refund', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const args = ctx.match.split(' ');
  if (args.length < 2) { await ctx.reply('Формат: /refund <user_id> <amount>'); return; }
  const [userId, amountStr] = args;
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) { await ctx.reply('Сумма должна быть > 0'); return; }
  try {
    const r = await httpPost(`${SERVER_URL}/admin/refund`, { userId: Number(userId), amount });
    await ctx.reply(r.success ? `↩️ Возврат ${amount} кр. юзеру ${userId}\nБаланс: ${r.newBalance} кр.` : `❌ ${r.error}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.command('ban', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const userId = ctx.match.trim();
  if (!userId) { await ctx.reply('Формат: /ban <user_id>'); return; }
  try {
    const r = await httpPost(`${SERVER_URL}/admin/ban`, { userId: Number(userId), ban: true });
    await ctx.reply(r.success ? `🚫 Юзер ${userId} заблокирован` : `❌ ${r.error}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.command('unban', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const userId = ctx.match.trim();
  if (!userId) { await ctx.reply('Формат: /unban <user_id>'); return; }
  try {
    const r = await httpPost(`${SERVER_URL}/admin/ban`, { userId: Number(userId), ban: false });
    await ctx.reply(r.success ? `✅ Юзер ${userId} разблокирован` : `❌ ${r.error}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const text = ctx.match.trim();
  if (!text) { await ctx.reply('Формат: /broadcast <текст>'); return; }
  try {
    const users = await httpGet(`${SERVER_URL}/admin/users`);
    if (!Array.isArray(users)) { await ctx.reply('Ошибка получения юзеров'); return; }
    let sent = 0, failed = 0;
    for (const user of users) {
      try { await ctx.api.sendMessage(Number(user.id), text); sent++; } catch { failed++; }
      if (sent % 25 === 0) await new Promise(r => setTimeout(r, 1000));
    }
    await ctx.reply(`📨 Рассылка: ✅ ${sent} | ❌ ${failed}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

// ═══════════════════════════════════════════════════════
// INLINE КНОПКИ (callback)
// ═══════════════════════════════════════════════════════

bot.callbackQuery('top_users', async (ctx) => {
  try {
    const s = await httpGet(`${SERVER_URL}/admin/stats?period=today`);
    const list = (s.topActive || [])
      .map((u: any, i: number) => `${i + 1}. ${u.username ? '@' + u.username : u.first_name} — ${u.requests} запр.`)
      .join('\n');
    await ctx.answerCallbackQuery();
    await ctx.reply(`🏆 Топ-10 активных за день:\n\n${list || 'Пусто'}`);
  } catch { await ctx.answerCallbackQuery({ text: 'Ошибка' }); }
});

bot.callbackQuery('deposits', async (ctx) => {
  try {
    const deps = await httpGet(`${SERVER_URL}/admin/deposits`);
    await ctx.answerCallbackQuery();
    if (!Array.isArray(deps) || deps.length === 0) {
      await ctx.reply('💳 Пополнений сегодня нет');
    } else {
      const list = deps.map((d: any) =>
        `${d.username ? '@' + d.username : d.first_name} — ${d.amount_rub}₽ (${d.package})`
      ).join('\n');
      await ctx.reply(`💳 Пополнения сегодня:\n\n${list}`);
    }
  } catch { await ctx.answerCallbackQuery({ text: 'Ошибка' }); }
});

bot.callbackQuery('errors', async (ctx) => {
  try {
    const data = await httpGet(`${SERVER_URL}/admin/errors`);
    await ctx.answerCallbackQuery();
    await ctx.reply(`❌ Ошибки: ${data.failed}/${data.total} запросов`);
  } catch { await ctx.answerCallbackQuery({ text: 'Ошибка' }); }
});

// ═══════════════════════════════════════════════════════
// АВТО-ОТЧЁТЫ
// ═══════════════════════════════════════════════════════

async function sendAutoReport(type: 'morning' | 'evening' | 'weekly') {
  if (!ADMIN_CHAT_ID) return;
  try {
    const period = type === 'weekly' ? '7d' : 'today';
    const s = await httpGet(`${SERVER_URL}/admin/stats?period=${period}`);

    const label = type === 'morning' ? '🌅 Итог за вчера' :
                  type === 'evening' ? '🌆 Дневной срез' :
                  '📋 Недельный отчёт';

    const text =
      `${label}\n━━━━━━━━━━━━━━━━━━━\n\n` +
      `💰 ${s.revenue.toLocaleString('ru')} ₽ | Маржа ${s.margin}%\n` +
      `👥 DAU ${s.dau} | Новых +${s.newUsers}\n` +
      `📝 Запросов ${s.transactions} | 🎨 Генераций ${s.generations}\n` +
      `🤝 Рефералов +${s.referrals}`;

    await bot.api.sendMessage(ADMIN_CHAT_ID, text);
  } catch (err) {
    console.error('Auto-report error:', err);
  }
}

// Планировщик авто-отчётов
function scheduleReports() {
  setInterval(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const day = now.getDay(); // 0=вс, 1=пн

    // Каждый день в 08:00 — утренний отчёт
    if (h === 8 && m === 0) sendAutoReport('morning');
    // Каждый день в 20:00 — вечерний срез
    if (h === 20 && m === 0) sendAutoReport('evening');
    // Понедельник в 09:00 — недельный отчёт
    if (day === 1 && h === 9 && m === 0) sendAutoReport('weekly');
  }, 60000); // проверяем каждую минуту
}

// ═══════════════════════════════════════════════════════
// ЗАПУСК
// ═══════════════════════════════════════════════════════

bot.start({
  onStart: () => {
    console.log('Бот @UraanxAI_bot запущен');
    scheduleReports();
  },
});
