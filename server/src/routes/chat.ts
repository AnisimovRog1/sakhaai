import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import { sendToGemini, ChatMessage } from '../services/gemini';
import { deduct } from '../services/balance';
import { markAiRequest } from '../services/referral';

// Стоимость одного сообщения (0.097 руб / 0.1 руб/кредит ≈ 1 кредит)
const CHAT_COST = 1;

export const chatRouter = Router();

// Все роуты чатов требуют авторизации
chatRouter.use(requireAuth);

// ─────────────────────────────────────
// GET /chats — список всех чатов юзера
// ─────────────────────────────────────
chatRouter.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, title, created_at, updated_at
       FROM chats
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /chats error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─────────────────────────────────────
// POST /chats — создать новый чат
// ─────────────────────────────────────
chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title = 'Новый чат' } = req.body;
    const result = await pool.query(
      `INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *`,
      [req.userId, title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /chats error:', err);
    res.status(500).json({ error: 'Ошибка создания чата' });
  }
});

// ─────────────────────────────────────
// GET /chats/:id/messages — история сообщений
// ─────────────────────────────────────
chatRouter.get('/:id/messages', async (req: Request, res: Response) => {
  try {
    const chatId = Number(req.params.id);

    const chat = await pool.query(
      `SELECT id FROM chats WHERE id = $1 AND user_id = $2`,
      [chatId, req.userId]
    );
    if (chat.rowCount === 0) {
      res.status(404).json({ error: 'Чат не найден' });
      return;
    }

    const result = await pool.query(
      `SELECT id, role, content, created_at
       FROM messages
       WHERE chat_id = $1
       ORDER BY created_at ASC`,
      [chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /chats/:id/messages error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─────────────────────────────────────
// POST /chats/:id/messages — отправить сообщение
// ─────────────────────────────────────
chatRouter.post('/:id/messages', async (req: Request, res: Response) => {
  try {
  const chatId = Number(req.params.id);
  const { message } = req.body;

  if (!message?.trim()) {
    res.status(400).json({ error: 'Сообщение не может быть пустым' });
    return;
  }

  // 1. Проверяем доступ к чату
  const chatResult = await pool.query(
    `SELECT id FROM chats WHERE id = $1 AND user_id = $2`,
    [chatId, req.userId]
  );
  if (chatResult.rowCount === 0) {
    res.status(404).json({ error: 'Чат не найден' });
    return;
  }

  // 2. Списываем кредиты (сначала — чтобы не тратить Gemini при нехватке баланса)
  const creditsLeft = await deduct(
    req.userId!,
    CHAT_COST,
    'chat',
    `Чат: ${message.slice(0, 50)}`
  ).catch((err: Error & { status?: number }) => {
    res.status(err.status ?? 500).json({ error: err.message });
    return null;
  });
  if (creditsLeft === null) return;

  // 3. Получаем язык пользователя
  const userResult = await pool.query(
    `SELECT language_code FROM users WHERE id = $1`,
    [req.userId]
  );
  const language = userResult.rows[0]?.language_code ?? 'ru';

  // 4. Загружаем историю чата (последние 6 сообщений для контекста)
  const historyResult = await pool.query(
    `SELECT role, content FROM messages
     WHERE chat_id = $1
     ORDER BY created_at ASC`,
    [chatId]
  );
  const history: ChatMessage[] = historyResult.rows;

  // 5. Сохраняем сообщение пользователя в БД
  await pool.query(
    `INSERT INTO messages (chat_id, role, content) VALUES ($1, 'user', $2)`,
    [chatId, message]
  );

  // 5. Отправляем в Gemini и получаем ответ
  const aiReply = await sendToGemini(history, message, language);

  // 6. Сохраняем ответ AI в БД
  const savedReply = await pool.query(
    `INSERT INTO messages (chat_id, role, content)
     VALUES ($1, 'model', $2)
     RETURNING id, role, content, created_at`,
    [chatId, aiReply]
  );

  // 8. Обновляем время последней активности чата
  await pool.query(
    `UPDATE chats SET updated_at = NOW() WHERE id = $1`,
    [chatId]
  );

  // Правило 4: отмечаем первый AI-запрос (асинхронно, не блокируем ответ)
  markAiRequest(req.userId!).catch(console.error);

  res.json({ ...savedReply.rows[0], creditsLeft });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('POST /chats/:id/messages error:', msg);
    res.status(500).json({ error: msg });
  }
});

// ─────────────────────────────────────
// DELETE /chats/:id — удалить чат
// ─────────────────────────────────────
chatRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const chatId = Number(req.params.id);
    const result = await pool.query(
      `DELETE FROM chats WHERE id = $1 AND user_id = $2`,
      [chatId, req.userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Чат не найден' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /chats/:id error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
