import Redis from 'ioredis';

// Подключаемся к Redis (кэш для балансов)
export const redis = new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  lazyConnect: true, // подключаемся только при первом использовании
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis подключён');
});
