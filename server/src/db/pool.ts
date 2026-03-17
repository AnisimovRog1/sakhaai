import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Pool — это "пул соединений" с базой данных.
// Вместо открывать/закрывать соединение на каждый запрос,
// держим несколько готовых соединений и переиспользуем их.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Ошибка PostgreSQL pool:', err);
});
