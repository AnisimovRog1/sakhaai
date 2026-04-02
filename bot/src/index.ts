import { Bot, InlineKeyboard, Keyboard } from 'grammy';
import * as dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const BOT_TOKEN  = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL ?? 'https://sakhaai-production.up.railway.app';
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

  const inlineKb = new InlineKeyboard().webApp('🚀 Открыть UraanxAI', WEBAPP_URL);
  const replyKb = new Keyboard()
    .text('🚀 Открыть приложение')
    .row()
    .text('Поддержка').text('📄 Документы')
    .row()
    .text('👥 Пригласить друга')
    .resized().persistent();

  // Пробуем welcome push из БД, если не получится — fallback
  try {
    const welcomeSeq = await httpGet(`${SERVER_URL}/admin/push/sequences/welcome`) as any;
    if (welcomeSeq && welcomeSeq.text) {
      const media = welcomeSeq.media_file_id || welcomeSeq.media_url;
      const text = formatText(welcomeSeq.text);
      if (welcomeSeq.media_type === 'photo' && media) {
        await ctx.replyWithPhoto(media, { caption: text, parse_mode: 'HTML', reply_markup: inlineKb });
      } else {
        await ctx.reply(text, { parse_mode: 'HTML', reply_markup: inlineKb });
      }
    } else {
      throw new Error('no welcome');
    }
  } catch {
    await ctx.reply(
      `Привет, ${ctx.from?.first_name ?? 'друг'}! 👋\n\nЯ UraanxAI - твой ИИ-ассистент для генерации фото, видео и арта.\n\nНажми кнопку ниже:`,
      { reply_markup: inlineKb }
    );
  }

  // Клавиатура
  await ctx.reply('⬇️', { reply_markup: replyKb });
});


// Обработка кнопок постоянной клавиатуры
bot.hears('🚀 Открыть приложение', async (ctx) => {
  const kb = new InlineKeyboard().webApp('🚀 Открыть UraanxAI', WEBAPP_URL);
  await ctx.reply('🚀 Нажми кнопку чтобы открыть приложение:', { reply_markup: kb });
});

bot.hears('Поддержка', async (ctx) => {
  await ctx.reply(
    `<b>Поддержка UraanxAI</b>\n\n` +
    `Напишите ваш вопрос прямо сюда - мы ответим в ближайшее время.\n\n` +
    `📧 uraanx.ai.project@gmail.com\n` +
    `💬 @UraanxAI_support`,
    { parse_mode: 'HTML' }
  );
});

bot.hears('📄 Документы', async (ctx) => {
  await ctx.reply(
    `📄 <b>Документы UraanxAI</b>\n\n` +
    `Пользовательское соглашение, политика конфиденциальности и другие документы доступны на сайте:\n\n` +
    `https://sakhaai-production.up.railway.app/landing#terms`,
    { parse_mode: 'HTML' }
  );
});

bot.hears('👥 Пригласить друга', async (ctx) => {
  const userId = ctx.from?.id;
  const link = `https://t.me/UraanxAI_bot?start=ref_${userId}`;
  const shareKb = new InlineKeyboard()
    .url('📤 Поделиться ссылкой', `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Пока ты думаешь - другие уже генерят контент будущего 🚀\n\nФото и видео за секунды. Нейросеть прямо в Telegram.\nПопробуй, пока это бесплатно 👇')}`)
    .row()
    .url('🔗 Открыть ссылку', link);
  await ctx.reply(
    `👥 <b>Пригласи друга - получи бонус!</b>\n\n` +
    `Твоя реферальная ссылка:\n${link}\n\n` +
    `Когда друг купит пакет - ты получишь бонусные кредиты 🎁`,
    { parse_mode: 'HTML', reply_markup: shareKb }
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
// ДОКУМЕНТЫ И ПОДДЕРЖКА
// ═══════════════════════════════════════════════════════

bot.command('docs', async (ctx) => {
  await ctx.reply(
    `📄 *Документация UraanxAI*\n\n` +
    `*§1 Пользовательское соглашение (оферта)*\n` +
    `Настоящее соглашение является публичной офертой между администрацией сервиса UraanxAI (Исполнитель) и пользователем (Заказчик).\n\n` +
    `Предмет: AI-сервисы (генерация картинок, видео, аватаров) через Telegram Mini App по кредитной системе.\n` +
    `Акцепт: использование сервиса и/или оплата является безоговорочным акцептом оферты.\n\n` +
    `*§2 Условия возврата*\n` +
    `• Неиспользованные кредиты - возврат в течение 14 дней с момента покупки\n` +
    `• Частичное использование - пропорциональный возврат за вычетом потраченных кредитов\n` +
    `• Срок возврата - до 10 рабочих дней тем же способом оплаты\n` +
    `• Полностью использованные и бесплатные кредиты возврату не подлежат\n\n` +
    `*§3 Политика конфиденциальности*\n` +
    `Собираемые данные: Telegram ID, имя, username, IP-адрес. Данные не передаются третьим лицам.\n\n` +
    `Полная версия: https://sakhaai-production.up.railway.app/landing\n` +
    `Поддержка: /support`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('support', async (ctx) => {
  await ctx.reply(
    `*Поддержка UraanxAI*\n\n` +
    `Напишите ваш вопрос прямо сюда - мы ответим в ближайшее время.\n\n` +
    `📧 uraanx.ai.project@gmail.com\n` +
    `💬 @UraanxAI\\_support`,
    { parse_mode: 'Markdown' }
  );
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
    .text('🏆 Топ-10 активных', 'top_users')
    .row()
    .text('📢 Пуши', 'goto_push');

  await ctx.reply(
    `🔐 Админ-панель SakhaAI\n━━━━━━━━━━━━━━━━━━━\n\n` +
    `📊 /stats · /stats 7d · /stats month\n` +
    `📋 /year · /users · /user <id>\n` +
    `💎 /addcredits <id> <кол-во>\n` +
    `↩️ /refund <id> <кол-во>\n` +
    `🚫 /ban <id> · /unban <id>\n` +
    `📨 /broadcast <текст>\n` +
    `📢 /push — управление пушами`,
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

bot.callbackQuery('goto_push', async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .text('📝 Создать пуш', 'push_create')
    .text('📋 Шаблоны', 'push_templates')
    .row()
    .text('👋 Приветствие', 'push_welcome')
    .text('📊 Лог рассылок', 'push_log');
  await ctx.reply('📢 Управление пушами\n━━━━━━━━━━━━━━━━━━━', { reply_markup: keyboard });
});

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
// ПУШИ — конструктор шаблонов
// ═══════════════════════════════════════════════════════

interface PushDraft {
  step: 'type' | 'media' | 'wait_media' | 'text' | 'time' | 'name' | 'confirm';
  scheduleType?: 'manual' | 'daily' | 'welcome';
  mediaType?: 'photo' | 'video';
  mediaFileId?: string;
  text?: string;
  sendTime?: string;
  name?: string;
}
const pushDrafts = new Map<number, PushDraft>();

// /push — главное меню пушей
bot.command('push', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const keyboard = new InlineKeyboard()
    .text('📝 Создать пуш', 'push_create')
    .text('📋 Мои шаблоны', 'push_templates')
    .row()
    .text('👋 Приветствие', 'push_welcome')
    .text('📊 Лог рассылок', 'push_log');
  await ctx.reply('📢 Управление пушами\n━━━━━━━━━━━━━━━━━━━', { reply_markup: keyboard });
});

// Создать пуш — шаг 1: тип
bot.callbackQuery('push_create', async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .text('📨 Разовый', 'push_type_manual')
    .text('📅 Ежедневный', 'push_type_daily')
    .text('👋 Приветствие', 'push_type_welcome');
  await ctx.reply('Шаг 1/5 — Тип пуша:', { reply_markup: keyboard });
});

bot.callbackQuery(/^push_type_(manual|daily|welcome)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const type = ctx.callbackQuery.data.replace('push_type_', '') as PushDraft['scheduleType'];
  pushDrafts.set(ctx.chat!.id, { step: 'media', scheduleType: type });
  const keyboard = new InlineKeyboard()
    .text('📸 Фото', 'push_media_photo')
    .text('🎬 Видео', 'push_media_video')
    .text('📝 Только текст', 'push_media_none');
  await ctx.reply('Шаг 2/5 — Медиа:', { reply_markup: keyboard });
});

// Шаг 2: медиа
bot.callbackQuery(/^push_media_(photo|video|none)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const media = ctx.callbackQuery.data.replace('push_media_', '');
  const draft = pushDrafts.get(ctx.chat!.id);
  if (!draft) return;

  if (media === 'none') {
    draft.step = 'text';
    draft.mediaType = undefined;
    await ctx.reply('Шаг 3/5 — Отправьте текст сообщения:');
  } else {
    draft.step = 'wait_media';
    draft.mediaType = media as 'photo' | 'video';
    await ctx.reply(`Шаг 2/5 — Отправьте ${media === 'photo' ? 'фото' : 'видео'}:`);
  }
});

// Получение медиа от админа
bot.on('message:photo', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const draft = pushDrafts.get(ctx.chat.id);
  if (draft?.step === 'wait_media') {
    draft.mediaFileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    draft.mediaType = 'photo';
    draft.text = ctx.message.caption || undefined;
    if (draft.text) {
      // Если есть caption — пропускаем шаг текста
      if (draft.scheduleType === 'daily') {
        draft.step = 'time';
        const kb = new InlineKeyboard()
          .text('08:00', 'push_time_08:00').text('10:00', 'push_time_10:00').text('12:00', 'push_time_12:00')
          .row()
          .text('14:00', 'push_time_14:00').text('18:00', 'push_time_18:00').text('20:00', 'push_time_20:00');
        await ctx.reply('Шаг 4/5 — Время отправки (по местному времени юзера):', { reply_markup: kb });
      } else {
        draft.step = 'name';
        await ctx.reply('Шаг 5/5 — Название шаблона (для себя):');
      }
    } else {
      draft.step = 'text';
      await ctx.reply('✅ Фото получено!\n\nШаг 3/5 — Отправьте текст сообщения:');
    }
    return;
  }
  // Быстрая рассылка — если нет draft
  const caption = ctx.message.caption || '';
  const keyboard = new InlineKeyboard()
    .text('📨 Разослать сейчас', `quick_push_${ctx.message.message_id}`)
    .text('❌ Отмена', 'push_cancel');
  await ctx.reply(`📸 Фото${caption ? ': ' + caption : ''}\n\nРазослать всем?`, { reply_markup: keyboard });
});

bot.on('message:video', async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const draft = pushDrafts.get(ctx.chat.id);
  if (draft?.step === 'wait_media') {
    draft.mediaFileId = ctx.message.video.file_id;
    draft.mediaType = 'video';
    draft.text = ctx.message.caption || undefined;
    if (draft.text) {
      if (draft.scheduleType === 'daily') {
        draft.step = 'time';
        const kb = new InlineKeyboard()
          .text('08:00', 'push_time_08:00').text('10:00', 'push_time_10:00').text('12:00', 'push_time_12:00')
          .row()
          .text('14:00', 'push_time_14:00').text('18:00', 'push_time_18:00').text('20:00', 'push_time_20:00');
        await ctx.reply('Шаг 4/5 — Время отправки:', { reply_markup: kb });
      } else {
        draft.step = 'name';
        await ctx.reply('Шаг 5/5 — Название шаблона:');
      }
    } else {
      draft.step = 'text';
      await ctx.reply('✅ Видео получено!\n\nШаг 3/5 — Отправьте текст:');
    }
    return;
  }
  const caption = ctx.message.caption || '';
  const keyboard = new InlineKeyboard()
    .text('📨 Разослать сейчас', `quick_push_${ctx.message.message_id}`)
    .text('❌ Отмена', 'push_cancel');
  await ctx.reply(`🎬 Видео${caption ? ': ' + caption : ''}\n\nРазослать всем?`, { reply_markup: keyboard });
});

// Текст от админа (шаг 3 или шаг 5-name)
bot.on('message:text', async (ctx, next) => {
  if (!isAdmin(ctx.chat.id)) { await next(); return; }
  const draft = pushDrafts.get(ctx.chat.id);
  if (!draft) { await next(); return; }

  if (draft.step === 'text') {
    draft.text = ctx.message.text;
    if (draft.scheduleType === 'daily') {
      draft.step = 'time';
      const kb = new InlineKeyboard()
        .text('08:00', 'push_time_08:00').text('10:00', 'push_time_10:00').text('12:00', 'push_time_12:00')
        .row()
        .text('14:00', 'push_time_14:00').text('18:00', 'push_time_18:00').text('20:00', 'push_time_20:00');
      await ctx.reply('Шаг 4/5 — Время отправки (по местному времени юзера):', { reply_markup: kb });
    } else {
      draft.step = 'name';
      await ctx.reply('Шаг 5/5 — Название шаблона (для себя):');
    }
    return;
  }

  if (draft.step === 'name') {
    draft.name = ctx.message.text;
    // Подтверждение
    const typeLabel = draft.scheduleType === 'daily' ? `📅 Ежедневный (${draft.sendTime})` :
                      draft.scheduleType === 'welcome' ? '👋 Приветственный' : '📨 Разовый';
    const mediaLabel = draft.mediaType === 'photo' ? '📸 Фото' : draft.mediaType === 'video' ? '🎬 Видео' : '📝 Текст';

    const kb = new InlineKeyboard()
      .text('✅ Сохранить', 'push_save')
      .text('📨 Сохранить и отправить', 'push_save_send')
      .row()
      .text('❌ Отмена', 'push_cancel');

    await ctx.reply(
      `📢 Новый пуш\n━━━━━━━━━━━━━━━\n\n` +
      `📌 Название: ${draft.name}\n` +
      `📋 Тип: ${typeLabel}\n` +
      `🖼 Медиа: ${mediaLabel}\n` +
      `📝 Текст: ${draft.text?.slice(0, 100)}${(draft.text?.length ?? 0) > 100 ? '...' : ''}`,
      { reply_markup: kb }
    );
    return;
  }

  await next();
});

// Шаг 4: время
bot.callbackQuery(/^push_time_(\d{2}:\d{2})$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const time = ctx.callbackQuery.data.replace('push_time_', '');
  const draft = pushDrafts.get(ctx.chat!.id);
  if (!draft) return;
  draft.sendTime = time;
  draft.step = 'name';
  await ctx.reply('Шаг 5/5 — Название шаблона (для себя):');
});

// Сохранение шаблона
bot.callbackQuery(/^push_save(_send)?$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const sendNow = ctx.callbackQuery.data === 'push_save_send';
  const draft = pushDrafts.get(ctx.chat!.id);
  if (!draft || !draft.text || !draft.name) { await ctx.reply('Ошибка: данные потеряны'); return; }

  try {
    const tmpl = await httpPost(`${SERVER_URL}/admin/push/templates`, {
      name: draft.name,
      text: draft.text,
      mediaType: draft.mediaType || null,
      mediaFileId: draft.mediaFileId || null,
      scheduleType: draft.scheduleType,
      sendTime: draft.sendTime || null,
      createdBy: ctx.chat!.id,
    });

    pushDrafts.delete(ctx.chat!.id);
    await ctx.reply(`✅ Шаблон "${draft.name}" сохранён!` + (draft.scheduleType === 'daily' ? `\n📅 Будет отправляться в ${draft.sendTime} по местному времени` : ''));

    if (sendNow && tmpl.id) {
      await broadcastTemplate(tmpl, ctx);
    }
  } catch (err) {
    await ctx.reply(`Ошибка: ${err}`);
  }
});

// Быстрая рассылка (без шаблона)
bot.callbackQuery(/^quick_push_(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ text: 'Рассылка запущена...' });
  const msgId = Number(ctx.callbackQuery.data.replace('quick_push_', ''));
  const chatId = ctx.chat?.id;
  if (!chatId) return;
  try {
    const users = await httpGet(`${SERVER_URL}/admin/users`);
    if (!Array.isArray(users)) return;
    let sent = 0, failed = 0;
    for (const user of users) {
      try { await bot.api.copyMessage(Number(user.id), chatId, msgId); sent++; } catch { failed++; }
      if (sent % 25 === 0) await new Promise(r => setTimeout(r, 1000));
    }
    await ctx.reply(`📨 Рассылка: ✅ ${sent} | ❌ ${failed}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

bot.callbackQuery('push_cancel', async (ctx) => {
  pushDrafts.delete(ctx.chat!.id);
  await ctx.answerCallbackQuery({ text: 'Отменено' });
  await ctx.deleteMessage();
});

// Список шаблонов с кнопками удаления
bot.callbackQuery('push_templates', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const tmpls = await httpGet(`${SERVER_URL}/admin/push/templates`);
    if (!Array.isArray(tmpls) || tmpls.length === 0) { await ctx.reply('Шаблонов пока нет'); return; }

    for (const t of tmpls) {
      const icon = t.schedule_type === 'daily' ? '📅' : t.schedule_type === 'welcome' ? '👋' : '📨';
      const active = t.is_active ? '✅' : '⏸';
      const media = t.media_type === 'photo' ? '📸' : t.media_type === 'video' ? '🎬' : '📝';
      const kb = new InlineKeyboard()
        .text('🗑 Удалить', `push_del_${t.id}`)
        .text(t.is_active ? '⏸ Выкл' : '✅ Вкл', `push_toggle_${t.id}`)
        .text('📨 Отправить', `push_send_${t.id}`);
      await ctx.reply(
        `${active} ${icon} ${media} ${t.name}\n` +
        `${t.text?.slice(0, 80)}${(t.text?.length ?? 0) > 80 ? '...' : ''}\n` +
        (t.send_time ? `⏰ ${t.send_time}\n` : ''),
        { reply_markup: kb }
      );
    }
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

// Удалить шаблон
bot.callbackQuery(/^push_del_(\d+)$/, async (ctx) => {
  const id = ctx.callbackQuery.data.replace('push_del_', '');
  try {
    await httpRequest('DELETE', `${SERVER_URL}/admin/push/templates/${id}`);
    await ctx.answerCallbackQuery({ text: 'Удалено' });
    await ctx.deleteMessage();
  } catch { await ctx.answerCallbackQuery({ text: 'Ошибка' }); }
});

// Вкл/выкл шаблон
bot.callbackQuery(/^push_toggle_(\d+)$/, async (ctx) => {
  const id = ctx.callbackQuery.data.replace('push_toggle_', '');
  try {
    const r = await httpRequest('PUT', `${SERVER_URL}/admin/push/templates/${id}/toggle`);
    await ctx.answerCallbackQuery({ text: r.isActive ? 'Включён ✅' : 'Выключен ⏸' });
    await ctx.deleteMessage();
  } catch { await ctx.answerCallbackQuery({ text: 'Ошибка' }); }
});

// Отправить шаблон вручную
bot.callbackQuery(/^push_send_(\d+)$/, async (ctx) => {
  const id = ctx.callbackQuery.data.replace('push_send_', '');
  await ctx.answerCallbackQuery({ text: 'Рассылка запущена...' });
  try {
    const data = await httpPost(`${SERVER_URL}/admin/push/send/${id}`, {});
    if (!data.template || !data.users) { await ctx.reply('Ошибка'); return; }
    await broadcastTemplate(data.template, ctx);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

// Приветственный шаблон
bot.callbackQuery('push_welcome', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const tmpls = await httpGet(`${SERVER_URL}/admin/push/templates?type=welcome&active=true`);
    if (Array.isArray(tmpls) && tmpls.length > 0) {
      const t = tmpls[0];
      await ctx.reply(`👋 Текущий приветственный пуш:\n\n${t.text}\n\nМедиа: ${t.media_type || 'нет'}`);
    } else {
      await ctx.reply('👋 Приветственный пуш не задан.\n\nСоздайте через «Создать пуш» → тип «Приветствие»');
    }
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

// Лог рассылок
bot.callbackQuery('push_log', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const logs = await httpGet(`${SERVER_URL}/admin/push/log`);
    if (!Array.isArray(logs) || logs.length === 0) { await ctx.reply('📊 Рассылок пока не было'); return; }
    const list = logs.slice(0, 10).map((l: any) =>
      `${l.template_name || '?'} — ${new Date(l.started_at).toLocaleDateString('ru')} — ✅${l.sent_count} ❌${l.failed_count}`
    ).join('\n');
    await ctx.reply(`📊 Последние рассылки:\n━━━━━━━━━━━━━━━\n${list}`);
  } catch (err) { await ctx.reply(`Ошибка: ${err}`); }
});

// Функция рассылки шаблона
async function broadcastTemplate(tmpl: any, ctx: any) {
  try {
    const users = await httpGet(`${SERVER_URL}/admin/users`);
    if (!Array.isArray(users)) return;
    let sent = 0, failed = 0;
    for (const user of users) {
      try {
        if (tmpl.media_type === 'photo' && tmpl.media_file_id) {
          await bot.api.sendPhoto(Number(user.id), tmpl.media_file_id, {
            caption: formatText(tmpl.text),
            parse_mode: 'HTML',
          });
        } else if (tmpl.media_type === 'video' && tmpl.media_file_id) {
          await bot.api.sendVideo(Number(user.id), tmpl.media_file_id, {
            caption: formatText(tmpl.text),
            parse_mode: 'HTML',
          });
        } else {
          await bot.api.sendMessage(Number(user.id), formatText(tmpl.text), {
            parse_mode: 'HTML',
          });
        }
        sent++;
      } catch { failed++; }
      if (sent % 25 === 0) await new Promise(r => setTimeout(r, 1000));
    }
    await httpPost(`${SERVER_URL}/admin/push/log`, { templateId: tmpl.id, sentCount: sent, failedCount: failed });
    await ctx.reply(`📨 Рассылка "${tmpl.name}": ✅ ${sent} | ❌ ${failed}`);
  } catch (err) {
    await ctx.reply(`Ошибка рассылки: ${err}`);
  }
}

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

// Таймзон-aware ежедневные пуши
async function processDailyPushes() {
  try {
    const templates = await httpGet(`${SERVER_URL}/admin/push/templates?type=daily&active=true`);
    if (!Array.isArray(templates)) return;

    for (const tmpl of templates) {
      if (!tmpl.send_time) continue;
      const [targetH] = tmpl.send_time.split(':').map(Number);

      // Получаем юзеров у которых сейчас нужный час
      const users = await httpGet(`${SERVER_URL}/admin/push/users-by-tz?hour=${targetH}`);
      if (!Array.isArray(users) || users.length === 0) continue;

      let sent = 0, failed = 0;
      for (const user of users) {
        try {
          if (tmpl.media_type === 'photo' && tmpl.media_file_id) {
            await bot.api.sendPhoto(Number(user.id), tmpl.media_file_id, {
              caption: formatText(tmpl.text),
              parse_mode: 'HTML',
            });
          } else if (tmpl.media_type === 'video' && tmpl.media_file_id) {
            await bot.api.sendVideo(Number(user.id), tmpl.media_file_id, {
              caption: formatText(tmpl.text),
              parse_mode: 'HTML',
            });
          } else {
            await bot.api.sendMessage(Number(user.id), formatText(tmpl.text), {
              parse_mode: 'HTML',
            });
          }
          sent++;
        } catch { failed++; }
        if (sent % 25 === 0) await new Promise(r => setTimeout(r, 1000));
      }

      if (sent > 0) {
        await httpPost(`${SERVER_URL}/admin/push/log`, { templateId: tmpl.id, sentCount: sent, failedCount: failed });
      }
    }
  } catch (err) {
    console.error('Daily push error:', err);
  }
}

// Планировщик
function scheduleReports() {
  setInterval(async () => {
    const now = new Date();
    const utcH = now.getUTCHours();
    const utcM = now.getUTCMinutes();

    // Админ-отчёты (UTC+9 Якутск: 08:00 = 23:00 UTC, 20:00 = 11:00 UTC)
    // Авто-отчёты по МСК (UTC+3)
    if (utcH === 5 && utcM === 0) sendAutoReport('morning');   // 08:00 МСК
    if (utcH === 17 && utcM === 0) sendAutoReport('evening');  // 20:00 МСК
    if (now.getUTCDay() === 1 && utcH === 6 && utcM === 0) sendAutoReport('weekly'); // Пн 09:00 МСК

    // Таймзон-aware daily пуши — каждую минуту в :00
    if (utcM === 0) processDailyPushes();
  }, 60000);
}

// ═══════════════════════════════════════════════════════
// АВТОМАТИЧЕСКИЕ ПУШ-ПОСЛЕДОВАТЕЛЬНОСТИ
// ═══════════════════════════════════════════════════════

// Динамическое приветствие по местному часу юзера
function getGreeting(localHour: number): string {
  if (localHour >= 5 && localHour < 12) return 'Доброе утро';
  if (localHour >= 12 && localHour < 17) return 'Добрый день';
  if (localHour >= 17 && localHour < 22) return 'Добрый вечер';
  return 'Привет';
}

function formatText(raw: string): string {
  // 1. Экранируем HTML спецсимволы
  let t = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // 2. <<жирный>> → <b>жирный</b>
  t = t.replace(/&lt;&lt;([^&]+?)&gt;&gt;/g, '<b>$1</b>');
  // 3. **жирный** → <b>жирный</b>
  t = t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // 4. _курсив_ → <i>курсив</i>
  t = t.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<i>$1</i>');
  return t;
}

async function processAutoSequences() {
  try {
    const pending = await httpGet(`${SERVER_URL}/admin/push/sequences/pending`) as any[];
    if (!pending || !Array.isArray(pending) || pending.length === 0) return;

    let sent = 0;
    for (const p of pending) {
      try {
        // Применяем приветствие
        let text = p.text;
        if (p.greeting_mode === 'dynamic' && p.user_local_hour !== undefined) {
          text = getGreeting(p.user_local_hour) + '! ' + text;
        } else if (p.greeting_mode === 'fixed' && p.greeting_fixed) {
          text = p.greeting_fixed + ' ' + text;
        }

        const media = p.media_file_id || p.media_url;
        if (p.media_type === 'video' && media) {
          await bot.api.sendVideo(Number(p.user_id), media, {
            caption: formatText(text),
            parse_mode: 'HTML',
          });
        } else if (p.media_type === 'photo' && media) {
          await bot.api.sendPhoto(Number(p.user_id), media, {
            caption: formatText(text),
            parse_mode: 'HTML',
          });
        } else {
          await bot.api.sendMessage(Number(p.user_id), formatText(text), {
            parse_mode: 'HTML',
          });
        }
        await httpPost(`${SERVER_URL}/admin/push/sequences/mark-sent`, {
          user_id: p.user_id, sequence_id: p.sequence_id,
        });
        sent++;
        if (sent % 25 === 0) await new Promise(r => setTimeout(r, 1000));
      } catch (e: any) {
        // Пользователь заблокировал бота — помечаем чтобы не спамить
        if (e?.error_code === 403 || e?.message?.includes('403')) {
          await httpPost(`${SERVER_URL}/admin/push/sequences/mark-sent`, {
            user_id: p.user_id, sequence_id: p.sequence_id,
          }).catch(() => {});
        }
      }
    }
    if (sent > 0) console.log(`📨 Автопуши: отправлено ${sent} из ${pending.length}`);
  } catch (_e) {
    // Тихая ошибка — не ломаем бот
  }
}

// ═══════════════════════════════════════════════════════
// ПОДДЕРЖКА: пересылка сообщений юзеров админу
// ═══════════════════════════════════════════════════════

bot.on('message', async (ctx) => {
  // Админ отвечает reply на пересланное → отправляем юзеру
  if (isAdmin(ctx.chat.id) && ctx.message.reply_to_message) {
    const reply = ctx.message.reply_to_message;
    // Ищем ID юзера в forwarded сообщении или в тексте заголовка
    const fwdId = (reply as any).forward_from?.id;
    const textMatch = reply.text?.match(/ID:\s*(\d+)/);
    const targetId = fwdId || (textMatch ? parseInt(textMatch[1]) : null);
    if (targetId && ctx.message.text) {
      try {
        await bot.api.sendMessage(targetId, `💬 <b>Ответ поддержки:</b>\n\n${ctx.message.text}`, { parse_mode: 'HTML' });
        await ctx.reply('✅ Ответ отправлен');
      } catch (e: any) { await ctx.reply('❌ Не удалось: ' + (e.message || e)); }
    }
    return;
  }

  // Обычные юзеры — пересылаем админу
  if (isAdmin(ctx.chat.id)) return;
  if (!ADMIN_CHAT_ID) return;

  const from = ctx.from;
  const name = [from?.first_name, from?.last_name].filter(Boolean).join(' ');
  const username = from?.username ? `@${from.username}` : '';
  const header = `💬 Сообщение от ${name} ${username} (ID: ${from?.id})`;

  try {
    await bot.api.sendMessage(ADMIN_CHAT_ID, header);
    await ctx.forwardMessage(ADMIN_CHAT_ID);
  } catch { /* ignore */ }

  await ctx.reply(
    '✅ Ваше сообщение передано в поддержку. Мы ответим в ближайшее время.\n\n' +
    '📧 Также можете написать: uraanx.ai.project@gmail.com'
  );
});

// ═══════════════════════════════════════════════════════
// ЗАПУСК
// ═══════════════════════════════════════════════════════

bot.start({
  onStart: async () => {
    console.log('Бот @UraanxAI_bot запущен');

    // ─── Профиль бота в Telegram (только имя + короткое описание для поиска) ───
    try {
      await bot.api.setMyName('UraanxAI');
      await bot.api.setMyDescription(
        'Контент будущего уже здесь. Генерируй фото и видео с помощью AI - будь на шаг впереди ✨'
      );
      await bot.api.setMyShortDescription(
        'Контент будущего уже здесь. Генерируй фото и видео с помощью AI - будь на шаг впереди ✨'
      );
      console.log('✅ Профиль бота обновлён');
    } catch (e) {
      console.error('⚠️ Не удалось обновить профиль бота:', e);
    }

    scheduleReports();
    // Автопуши каждые 2 минуты
    setInterval(processAutoSequences, 2 * 60 * 1000);
    setTimeout(processAutoSequences, 30000); // первый запуск через 30 сек
  },
});
