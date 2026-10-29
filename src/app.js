import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import mongoose from 'mongoose';
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
// CORS: never throw (a thrown error returns a 500 without CORS headers, which the browser reports as "failed to fetch").
// Allowed: anything listed in CLIENT_ORIGINS, localhost (testing), and the SES production domain.
const norm = (o) => String(o || '').trim().replace(/\/+$/, '').toLowerCase();
const listed = env.origins.map(norm);
const originOk = (origin) => {
  if (!origin) return true;                                   // curl, server-to-server, same-origin
  const o = norm(origin);
  if (!listed.length || listed.includes(o)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) return true;
  if (/^https:\/\/([a-z0-9-]+\.)*srujaninfotech\.com$/.test(o)) return true;
  return false;
};
app.use(cors({ origin: (origin, cb) => cb(null, originOk(origin)), methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'], maxAge: 86400 }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
if (!env.isProd) app.use(morgan('dev'));

// Root + health (used by Render and by uptime monitors to keep the free instance awake)
app.get('/healthz', (_req, res) => res.json({ success: true, status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' }));

// API
app.use('/api', (req, res, next) => (mongoose.connection.readyState === 1 || req.path === '/health' ? next() : res.status(503).json({ success: false, message: 'Server is waking up / database connecting. Please retry in a few seconds.' })));
app.use('/api', apiLimiter, api);

// If the frontend/ folder sits next to backend/, this server also serves the website (/) and admin (/admin) - no CORS needed.
// If the frontend is hosted elsewhere, this runs as an API only (set CLIENT_ORIGINS to the frontend URL).
if (hasFrontend) {
  app.use('/admin', express.static(ADMIN, { extensions: ['html'] }));
  app.use(express.static(PUBLIC, { extensions: ['html'], maxAge: env.isProd ? '1d' : 0 }));
}

app.use('/api', notFound);
if (!hasFrontend) app.get('/', (_req, res) => res.json({ success: true, service: 'SES API', health: '/api/health', site: '/api/public/site?page=home' }));
app.use((req, res) => (hasFrontend ? res.status(404).sendFile(path.join(PUBLIC, '404.html')) : res.status(404).json({ success: false, message: 'Not found' })));
app.use(errorHandler);

export default app;
