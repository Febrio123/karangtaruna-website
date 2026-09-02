// ============================================================================
// app.js — instance Express (middleware global, mount routes, error handler)
// PENTING: file ini TIDAK menghubungkan DB — bisa di-import untuk testing
// tanpa MongoDB aktif. Koneksi DB hanya terjadi di server.js (connectDB).
// ============================================================================

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';

const app = express();

// --- trust proxy (rate-limit butuh IP yang benar di belakang reverse proxy) ---
app.set('trust proxy', 1);

// --- Compression (gzip) — kurangi ukuran respons JSON/teks hingga ~70% ---
app.use(compression());

// --- Security headers ---
app.use(helmet());

// --- CORS: daftar origin dari env (koma) + fallback domain production ---
// Urutan prioritas:
//   1. CORS_ORIGIN env var (Vercel Dashboard / .env) — pisahkan dengan koma
//   2. PRODUCTION_ORIGINS fallback (domain Vercel yang sudah diketahui)
//   3. Jika keduanya kosong → dev mode (izinkan semua — hanya lokal)
const PRODUCTION_ORIGINS = [
  'https://karangtaruna-website-dashboard.vercel.app',
  'https://karangtaruna-website.vercel.app',
];

const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Gabungkan env + fallback production, hilangkan duplikat
const origins = envOrigins.length > 0
  ? [...new Set([...envOrigins, ...PRODUCTION_ORIGINS])]
  : PRODUCTION_ORIGINS;

const corsOptions = {
  // Di production: origin harus dari daftar whitelist (jangan pernah '*' dgn credentials).
  // Di dev (origins kosong setelah fallback): echo origin untuk convenience lokal.
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser / curl / server-to-server
    if (origins.includes(origin)) return cb(null, true);
    // Origin tidak dikenal — tolak (403).
    const e = new Error(`Origin tidak diizinkan oleh kebijakan CORS: ${origin}`);
    e.statusCode = 403;
    return cb(e);
  },
  credentials: true,            // wajib: cookie httpOnly lintas origin
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
};

// Jawab preflight OPTIONS SEBELUM middleware lain (termasuk rate-limiter & helmet).
// Ini penting agar request OPTIONS tidak kena 429 / block oleh helmet.
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// --- Body & cookie parsers ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// --- Rate limit global (kecuali /health) ---
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  return apiLimiter(req, res, next);
});

// --- Routes ---
app.use('/api', routes);

// --- 404 & error handler terpusat ---
app.use(notFound);
app.use(errorHandler);

export default app;