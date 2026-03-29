import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { migrate } from './db/migrate';
import { authRouter } from './routes/auth';
import { chatRouter } from './routes/chat';
import { imageRouter } from './routes/image';
import { videoRouter } from './routes/video';
import { balanceRouter } from './routes/balance';
import { referralRouter } from './routes/referral';
import { paymentRouter } from './routes/payment';
import { generationsRouter } from './routes/generations';
import { adminRouter } from './routes/admin';
import { adminPanelRouter } from './routes/admin-panel';
import { processHeldReferrals } from './services/referral';
import { seedPushData } from './db/migrate';
import { LANDING_HTML } from './landing';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// В проде разрешаем только домен Vercel, в dev — всё
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // origin = undefined у server-to-server запросов и curl — пропускаем
    // Также пропускаем свой же домен (для admin panel)
    if (!origin || allowedOrigins.includes(origin) || origin?.includes('railway.app')) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} не разрешён`));
  },
}));
app.use(express.json({ limit: '50mb' }));

// Статические файлы (верификация UnitPay и т.д.)
app.use(express.static(path.resolve(__dirname, '../public')));

// Роуты
app.use('/auth',     authRouter);
app.use('/chats',    chatRouter);
app.use('/image',    imageRouter);
app.use('/video',    videoRouter);
app.use('/balance',  balanceRouter);
app.use('/referral', referralRouter);
app.use('/payment', paymentRouter);
app.use('/generations', generationsRouter);
app.use('/admin', adminRouter);
app.use('/panel', adminPanelRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sakhaai-server' });
});

// Лендинг (перенесён с / на /landing — корень теперь отдаёт SPA)
app.get('/landing', (_req, res) => {
  res.type('text/html').send(LANDING_HTML);
});

// ─── Webapp SPA (React) ─────────────────────────────────
// Собранный фронтенд копируется в server/webapp-dist/ при билде на Railway
const webappDist = path.resolve(__dirname, '../webapp-dist');

// Статика (JS/CSS/images) — кэш на 1 год (хэш в имени файла)
app.use('/assets', express.static(path.join(webappDist, 'assets'), {
  maxAge: '1y',
  immutable: true,
}));

// Всё остальное (index.html, favicon) — без кэша
app.use(express.static(webappDist, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  },
}));

// SPA fallback — все неизвестные роуты → index.html (React Router)
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.sendFile(path.join(webappDist, 'index.html'));
});

// Запуск
migrate()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Сервер запущен на порту ${PORT}`);
    });
    // Таймаут 10 минут — видео-генерация через fal.ai может занимать 5+ минут
    server.timeout = 600_000;
    server.keepAliveTimeout = 620_000;

    // Планировщик: проверяем held-рефералы каждые 15 минут
    // Простой setInterval — без внешних зависимостей
    const runProcessor = () => {
      processHeldReferrals()
        .then((n) => { if (n > 0) console.log(`💰 Выплачено рефералов: ${n}`); })
        .catch(console.error);
    };

    runProcessor(); // сразу при старте
    setInterval(runProcessor, 15 * 60 * 1000); // каждые 15 мин

    // Заполняем пуш-последовательности при первом запуске
    seedPushData().then(n => { if (n) console.log('📥 Seed пушей: ' + n); }).catch(e => console.error('❌ Seed пушей:', e));
  })
  .catch((err) => {
    console.error('❌ Ошибка миграции:', err);
    process.exit(1);
  });
