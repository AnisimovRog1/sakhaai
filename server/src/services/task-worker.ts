// Фоновый worker: каждые 30 сек проверяет pending задачи через Kling Direct API
// Юзеру не нужно держать приложение открытым — worker сам обработает результат

import { pool } from '../db/pool';
import { checkTaskStatus } from './kling-direct';
import { saveGeneration } from './generations';
import { addCredits, TxType } from './balance';
import { sendTelegramPush } from './telegram-push';

const POLL_INTERVAL = 30_000;  // 30 секунд
const TASK_TIMEOUT = 60 * 60 * 1000;  // 60 минут

let isRunning = false;

export function startTaskWorker() {
  console.log('[task-worker] запущен, интервал:', POLL_INTERVAL / 1000, 'сек');

  const run = async () => {
    if (isRunning) return; // не накладывать циклы
    isRunning = true;
    try {
      const { rows } = await pool.query(
        `SELECT * FROM pending_tasks WHERE status IN ('pending', 'processing') ORDER BY created_at ASC`
      );

      if (rows.length === 0) return;
      console.log(`[task-worker] проверяю ${rows.length} задач`);

      for (const task of rows) {
        try {
          await processTask(task);
        } catch (err) {
          console.error(`[task-worker] ошибка задачи ${task.id}:`, (err as Error).message);
        }
      }
    } catch (err) {
      console.error('[task-worker] poll error:', (err as Error).message);
    } finally {
      isRunning = false;
    }
  };

  // Первый запуск через 10 сек (дать серверу подняться)
  setTimeout(run, 10_000);
  setInterval(run, POLL_INTERVAL);
}

async function processTask(task: any) {
  const age = Date.now() - new Date(task.created_at).getTime();

  // Таймаут — рефанд
  if (age > TASK_TIMEOUT) {
    await handleTimeout(task);
    return;
  }

  const result = await checkTaskStatus(task.kling_endpoint, task.kling_task_id);

  if (result.status === 'succeed' && result.resultUrl) {
    await handleSuccess(task, result.resultUrl);
  } else if (result.status === 'failed') {
    await handleFailure(task, result.errorMsg || 'Kling generation failed');
  } else if (result.status === 'processing' || result.status === 'submitted') {
    // Обновить статус (submitted/processing — ждём)
    if (task.status === 'pending') {
      await pool.query(
        `UPDATE pending_tasks SET status = 'processing', updated_at = NOW() WHERE id = $1`,
        [task.id]
      );
    }
  } else {
    // Неизвестный статус — логируем, таймаут разберётся
    console.warn(`[task-worker] unknown status '${result.status}' for task ${task.task_id}`);
  }
}

async function handleSuccess(task: any, resultUrl: string) {
  // Сохранить генерацию + обновить статус в ОДНОЙ транзакции
  // Без транзакции: если saveGeneration упадёт, task помечается succeed но генерация потеряна
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const genType = task.type === 'motion-control' ? 'motion' : task.type;
    if (task.type !== 'tts') {
      await client.query(
        `INSERT INTO generations (user_id, type, prompt, result_url, cost) VALUES ($1, $2, $3, $4, $5)`,
        [task.user_id, genType, task.prompt, resultUrl, task.cost]
      );
    }
    await client.query(
      `UPDATE pending_tasks SET status = 'succeed', result_url = $1, updated_at = NOW() WHERE id = $2`,
      [resultUrl, task.id]
    );
    await client.query('COMMIT');
  } catch (e: any) {
    await client.query('ROLLBACK');
    console.error('[task-worker] handleSuccess TRANSACTION FAILED:', e.message, 'task:', task.id);
    return; // Не помечаем succeed — worker повторит на следующем цикле
  } finally {
    client.release();
  }

  await sendTelegramPush(task.user_id, task.type, 'succeed', resultUrl, task.prompt).catch(e =>
    console.error('[task-worker] push error:', e.message)
  );

  console.log(`[task-worker] задача ${task.id} (${task.type}) завершена успешно`);
}

async function handleFailure(task: any, errorMsg: string) {
  const txType = (task.type === 'motion-control' ? 'motion' : task.type) as TxType;
  await addCredits(task.user_id, task.cost, txType, `Рефанд: ${errorMsg.substring(0, 100)}`).catch(e =>
    console.error('[task-worker] refund error:', e.message)
  );

  await pool.query(
    `UPDATE pending_tasks SET status = 'failed', error_msg = $1, updated_at = NOW() WHERE id = $2`,
    [errorMsg, task.id]
  );

  await sendTelegramPush(task.user_id, task.type, 'failed', undefined, task.prompt, errorMsg).catch(e =>
    console.error('[task-worker] push error:', e.message)
  );

  console.log(`[task-worker] задача ${task.id} (${task.type}) провалилась: ${errorMsg.substring(0, 80)}`);
}

async function handleTimeout(task: any) {
  console.log(`[task-worker] задача ${task.id} (${task.type}) таймаут (>60 мин)`);
  await handleFailure(task, 'Таймаут генерации (>60 мин). Кредиты возвращены.');
}
