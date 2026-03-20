// Сервис сохранения и получения истории генераций

import { pool } from '../db/pool';

export type GenerationType = 'image' | 'video' | 'motion' | 'avatar';

export type Generation = {
  id: number;
  type: GenerationType;
  prompt: string | null;
  resultUrl: string;
  cost: number;
  createdAt: string;
};

// Сохранить результат генерации
export async function saveGeneration(
  userId: number,
  type: GenerationType,
  prompt: string | null,
  resultUrl: string,
  cost: number
): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO generations (user_id, type, prompt, result_url, cost)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, type, prompt, resultUrl, cost]
  );
  return rows[0].id;
}

// Получить историю генераций пользователя
export async function getGenerations(
  userId: number,
  type?: GenerationType,
  limit = 20,
  offset = 0
): Promise<Generation[]> {
  let query = `SELECT id, type, prompt, result_url, cost, created_at
               FROM generations WHERE user_id = $1`;
  const params: (number | string)[] = [userId];

  if (type) {
    params.push(type);
    query += ` AND type = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    prompt: r.prompt,
    resultUrl: r.result_url,
    cost: r.cost,
    createdAt: r.created_at,
  }));
}
