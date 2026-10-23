import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env.js';
import api from './routes/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '../../frontend');   // frontend/ = website, frontend/admin = admin panel
const ADMIN = path.join(PUBLIC, 'admin');
const hasFrontend = fs.existsSync(PUBLIC);                  // false when the backend is deployed alone (API only)

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, cb) => (!origin || !env.origins.length || env.origins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed by CORS'))),
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
if (!env.isProd) app.use(morgan('dev'));

// API
app.use('/api', apiLimiter, api);

// If the frontend/ folder sits next to backend/, this server also serves the website (/) and admin (/admin) - no CORS needed.
// If the frontend is hosted elsewhere, this runs as an API only (set CLIENT_ORIGINS to the frontend URL).
if (hasFrontend) {
  app.use('/admin', express.static(ADMIN, { extensions: ['html'] }));
  app.use(express.static(PUBLIC, { extensions: ['html'], maxAge: env.isProd ? '1d' : 0 }));
}

app.use('/api', notFound);
app.use((req, res) => (hasFrontend ? res.status(404).sendFile(path.join(PUBLIC, '404.html')) : res.status(404).json({ success: false, message: 'Not found' })));
app.use(errorHandler);

export default app;
