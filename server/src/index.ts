import cluster from 'cluster';
import os from 'os';
import express from 'express';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { migrate } from './db/migrate';
import { pool } from './db/pool';
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
import { serveTempFile, saveTempBuffer } from './services/kling-direct';
// processHeldReferrals убран — бонус реферу начисляется сразу при оплате
import { startTaskWorker } from './services/task-worker';
import { seedPushSequences } from './services/push-seed';
import { seedMarketingPlan } from './db/migrate';
import { initExchangeRate, updateExchangeRate, getRateInfo } from './services/exchange-rate';
import { LANDING_HTML } from './landing';
import { LINK_PAGE_HTML } from './link-page';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 3000;
const WORKERS = Math.max(os.cpus().length, 2);

// ═══════════════════════════════════════════════════════
// CLUSTER: Master форкает воркеры, каждый запускает Express
// ═══════════════════════════════════════════════════════

if (cluster.isPrimary) {
  console.log(`🚀 Master ${process.pid}: запуск ${WORKERS} воркеров`);

  // Миграции + seed — только в master, до форка воркеров
  migrate()
    .then(() => {
      console.log('✅ Миграции выполнены');

      // Форкаем воркеры
      for (let i = 0; i < WORKERS; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code) => {
        console.error(`⚠️ Worker ${worker.process.pid} упал (code=${code}), рестарт...`);
        cluster.fork();
      });

      // Task worker — только в master (чтобы не дублировать polling)
      startTaskWorker();

      // Курс ЦБ — только в master
      initExchangeRate().catch(console.error);
      setTimeout(updateExchangeRate, 10_000);
      setInterval(updateExchangeRate, 7 * 24 * 60 * 60 * 1000);

      // Seed пушей — только в master
      seedPushSequences().then(n => { if (n) console.log('📥 Seed пушей: ' + n); }).catch(e => console.error('❌ Seed пушей:', e));

      // Seed маркетингового плана
      seedMarketingPlan().catch(e => console.error('❌ Seed плана:', e));
    })
    .catch((err) => {
      console.error('❌ Ошибка миграции:', err);
      process.exit(1);
    });

} else {
  // ═══════════════════════════════════════════════════════
  // WORKER: Express сервер
  // ═══════════════════════════════════════════════════════
  startWorker();
}

function startWorker() {
  const app = express();
  app.set('trust proxy', 1);

  // В проде разрешаем только домен Vercel, в dev — всё
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];

  app.use(compression());
  app.use(cors({
    origin: (origin, callback) => {
      // origin = undefined у server-to-server запросов и curl — пропускаем
      // Также пропускаем свой же домен (для admin panel)
      if (!origin || allowedOrigins.includes(origin) || origin === 'https://sakhaai-production.up.railway.app') return callback(null, true);
      callback(new Error(`CORS: origin ${origin} не разрешён`));
    },
  }));
  app.use(express.json({ limit: '50mb' }));

  // Rate limiting (x10 для масштаба, per-worker)
  app.use(rateLimit({ windowMs: 60000, max: 3000, message: { error: 'Слишком много запросов' } }));
  app.use('/auth', rateLimit({ windowMs: 60000, max: 60, message: { error: 'Слишком много попыток авторизации' } }));
  app.use('/image', rateLimit({ windowMs: 60000, max: 120, message: { error: 'Слишком много запросов генерации' } }));
  app.use('/video', rateLimit({ windowMs: 60000, max: 60, message: { error: 'Слишком много запросов генерации' } }));
  app.use('/panel/login', rateLimit({ windowMs: 60000, max: 15, message: { error: 'Слишком много попыток входа' } }));

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
    res.json({ status: 'ok', service: 'sakhaai-server', worker: process.pid });
  });

  // Публичный endpoint: общее число генераций (кэш 5 мин)
  app.get('/stats/public', async (_req, res) => {
    try {
      const cached = (app as any).__statsCache;
      if (cached && Date.now() - cached.ts < 300000) {
        res.json(cached.data);
        return;
      }
      const r = await pool.query('SELECT COUNT(*)::int AS total FROM generations');
      const data = { totalGenerations: r.rows[0].total };
      (app as any).__statsCache = { data, ts: Date.now() };
      res.json(data);
    } catch {
      res.json({ totalGenerations: 0 });
    }
  });

  // Публичный endpoint: текущий курс и множитель (для фронта)
  app.get('/exchange-rate', (_req, res) => {
    res.json(getRateInfo());
  });

  // Временные файлы для Kling API и скачивания (shared disk storage)
  app.get('/tmp-upload/:id', (req, res) => {
    const file = serveTempFile(req.params.id);
    if (!file) { res.status(404).send('Not found'); return; }
    const name = (req.query.name as string) || 'uraanxai-file';
    res.setHeader('Content-Type', file.mime);
    res.setHeader('Content-Length', file.buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.setHeader('Access-Control-Allow-Origin', 'https://web.telegram.org');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(file.buffer);
  });

  // Сохранить data: URL как временный файл → вернуть HTTPS URL (для Telegram downloadFile)
  app.post('/api/tmp-save', express.json({ limit: '20mb' }), (req, res) => {
    try {
      const { dataUrl, fileName } = req.body;
      if (!dataUrl) { res.status(400).json({ error: 'dataUrl required' }); return; }
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
      if (!match) { res.status(400).json({ error: 'Invalid data URL' }); return; }
      const buffer = Buffer.from(match[2], 'base64');
      const httpsUrl = saveTempBuffer(buffer, match[1]);
      res.json({ url: httpsUrl });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Proxy-скачивание файлов (обход CORS для Telegram Desktop)
  app.get('/download', async (req, res) => {
    try {
      const url = req.query.url as string;
      const name = (req.query.name as string) || 'uraanxai-file';
      if (!url) { res.status(400).send('url required'); return; }

      // Data URL → бинарный файл
      if (url.startsWith('data:')) {
        const match = url.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) { res.status(400).send('Invalid data URL'); return; }
        const buffer = Buffer.from(match[2], 'base64');
        res.setHeader('Content-Type', match[1]);
        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
        return;
      }

      // Внешний URL → fetch + proxy
      const resp = await fetch(url);
      if (!resp.ok) { res.status(502).send('Fetch failed'); return; }
      const contentType = resp.headers.get('content-type') || 'application/octet-stream';
      const buffer = Buffer.from(await resp.arrayBuffer());
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (err: any) {
      console.error('Download proxy error:', err.message);
      res.status(500).send('Download error');
    }
  });

  // Лендинг (перенесён с / на /landing — корень теперь отдаёт SPA)
  app.get('/landing', (_req, res) => {
    res.type('text/html').send(LANDING_HTML);
  });

  // Link-in-bio для Instagram
  app.get('/go', (_req, res) => {
    res.type('text/html').send(LINK_PAGE_HTML);
  });

  // ─── Share page с OG-превью для Telegram ───
  app.get('/s/:sharerId/:genId', async (req, res) => {
    try {
      const { sharerId, genId } = req.params;
      const { rows } = await pool.query(
        'SELECT type, result_url, prompt FROM generations WHERE id = $1',
        [genId]
      );
      const gen = rows[0];
      const botUsername = 'UraanxAI_bot';
      const deepLink = `https://t.me/${botUsername}?start=share_${sharerId}_${genId}`;

      const isVideo = gen && ['video', 'motion', 'avatar'].includes(gen.type);
      const mediaUrl = gen?.result_url || '';
      const title = 'Создано с помощью UraanxAI';
      const desc = gen?.prompt ? gen.prompt.substring(0, 150) : 'Фото и видео за секунды с помощью нейросети';

      res.type('text/html').send(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
${isVideo
  ? `<meta property="og:type" content="video.other"><meta property="og:video" content="${mediaUrl}"><meta property="og:video:type" content="video/mp4">`
  : `<meta property="og:type" content="article"><meta property="og:image" content="${mediaUrl}">`}
<meta property="og:url" content="${deepLink}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${deepLink}">
<title>${title}</title>
</head><body style="background:#070b14;color:#fff;font-family:sans-serif;text-align:center;padding:40px">
<p>Перенаправляю в UraanxAI...</p>
<a href="${deepLink}" style="color:#8b5cf6">Открыть</a>
</body></html>`);
    } catch (e) {
      res.redirect('https://t.me/UraanxAI_bot');
    }
  });

  // ─── /app → SPA для Telegram Mini App ───
  app.get('/app', (_req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.sendFile(path.join(path.resolve(__dirname, '../webapp-dist'), 'index.html'));
  });

  // ─── Корень / → лендинг (для UnitPay, модерации, обычных браузеров) ───
  app.get('/', (_req, res) => {
    res.type('text/html').send(LANDING_HTML);
  });

  // ─── Webapp SPA (React) ─────────────────────────────────
  const webappDist = path.resolve(__dirname, '../webapp-dist');

  // Статика (JS/CSS/images) — кэш на 1 год (хэш в имени файла)
  app.use('/assets', express.static(path.join(webappDist, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }));

  // index.html — кэш 5 мин (снижает нагрузку при повторных визитах)
  app.use(express.static(webappDist, {
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=300');
    },
  }));

  // SPA fallback — все неизвестные роуты → index.html
  app.get('*', (_req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.sendFile(path.join(webappDist, 'index.html'));
  });

  // Запуск воркера
  const server = app.listen(PORT, () => {
    console.log(`✅ Worker ${process.pid} слушает порт ${PORT}`);
  });

  // Production таймауты
  server.timeout = 300_000;          // 5 мин (было 30 мин)
  server.keepAliveTimeout = 65_000;  // 65 сек (стандарт)
  server.headersTimeout = 66_000;    // 66 сек (чуть больше keepAlive)
}
