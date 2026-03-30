// Фоновый worker: каждые 30 сек проверяет pending задачи через Kling Direct API
// Юзеру не нужно держать приложение открытым — worker сам обработает результат

import { pool } from '../db/pool';
import { checkTaskStatus, submitLipSync } from './kling-direct';
import { saveGeneration } from './generations';
import { addCredits, TxType } from './balance';
import { sendTelegramPush } from './telegram-push';
import crypto from 'crypto';

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
  } else if (task.status === 'pending' && result.status === 'processing') {
    // Обновить статус
    await pool.query(
      `UPDATE pending_tasks SET status = 'processing', updated_at = NOW() WHERE id = $1`,
      [task.id]
    );
  }
}

async function handleSuccess(task: any, resultUrl: string) {
  const metadata = task.metadata || {};

  // Avatar chain: step1 (image2video) succeed → запустить step2 (lip-sync)
  if (metadata.chain === 'avatar-lipsync' && task.type === 'avatar-step1') {
    // Пометить step1 как завершённый
    await pool.query(
      `UPDATE pending_tasks SET status = 'succeed', result_url = $1, updated_at = NOW() WHERE id = $2`,
      [resultUrl, task.id]
    );

    try {
      console.log(`[task-worker] avatar step1 done, starting lip-sync, kling_task_id: ${task.kling_task_id}`);
      const { klingTaskId } = await submitLipSync({
        originTaskId: task.kling_task_id, // Kling task_id из image2video
        text: metadata.text || '',
        voiceId: metadata.voiceId,
        voiceSpeed: metadata.voiceSpeed,
      });

      // Создать задачу lip-sync (step2)
      const newTaskId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO pending_tasks (task_id, kling_task_id, user_id, type, kling_endpoint, cost, prompt, metadata)
         VALUES ($1, $2, $3, 'avatar', '/v1/videos/lip-sync', $4, $5, $6)`,
        [newTaskId, klingTaskId, task.user_id, task.cost, task.prompt,
         JSON.stringify({ parentTaskId: task.task_id })]
      );
      console.log(`[task-worker] avatar lip-sync task created: ${newTaskId}`);
      return;
    } catch (err) {
      console.error('[task-worker] lip-sync submit failed:', (err as Error).message);
      // Рефанд если lip-sync не запустился
      await addCredits(task.user_id, task.cost, 'avatar' as TxType, `Рефанд: ${(err as Error).message.substring(0, 100)}`).catch(e =>
        console.error('[task-worker] refund error:', e.message)
      );
      await pool.query(
        `UPDATE pending_tasks SET error_msg = $1, updated_at = NOW() WHERE id = $2`,
        [`lip-sync failed: ${(err as Error).message}`, task.id]
      );
      await sendTelegramPush(task.user_id, 'avatar', 'failed', undefined, task.prompt, `Ошибка создания аватара`).catch(console.error);
      return;
    }
  }

  // Обычный succeed — сохранить генерацию + push
  const genType = task.type === 'motion-control' ? 'motion' : task.type;
  if (task.type !== 'tts' && task.type !== 'avatar-step1') {
    await saveGeneration(task.user_id, genType, task.prompt, resultUrl, task.cost).catch(e =>
      console.error('[task-worker] saveGeneration error:', e.message)
    );
  }

  await pool.query(
    `UPDATE pending_tasks SET status = 'succeed', result_url = $1, updated_at = NOW() WHERE id = $2`,
    [resultUrl, task.id]
  );

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
