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
app.use(express.json());

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

// Главная страница с мета-тэгом UnitPay
app.get('/', (_req, res) => {
  res.type('text/html').send(`<!DOCTYPE html><html><head><meta name="verification" content="16693ad0a9f05ceba9ce1b6a59b655" /><title>SakhaAI</title></head><body>SakhaAI Server</body></html>`);
});

// Запуск
migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Сервер запущен на порту ${PORT}`);
    });

    // Планировщик: проверяем held-рефералы каждые 15 минут
    // Простой setInterval — без внешних зависимостей
    const runProcessor = () => {
      processHeldReferrals()
        .then((n) => { if (n > 0) console.log(`💰 Выплачено рефералов: ${n}`); })
        .catch(console.error);
    };

    runProcessor(); // сразу при старте
    setInterval(runProcessor, 15 * 60 * 1000); // каждые 15 мин
  })
  .catch((err) => {
    console.error('❌ Ошибка миграции:', err);
    process.exit(1);
  });
