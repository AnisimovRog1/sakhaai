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
import { processHeldReferrals } from './services/referral';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Роуты
app.use('/auth',     authRouter);
app.use('/chats',    chatRouter);
app.use('/image',    imageRouter);
app.use('/video',    videoRouter);
app.use('/balance',  balanceRouter);
app.use('/referral', referralRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sakhaai-server' });
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
