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

// --- CORS: daftar origin dari env (koma) ---
// Di production, CORS_ORIGIN WAJIB diisi (fail-closed); tanpa daftar origin,
// default development mengizinkan semua (untuk convenience lokal saja).
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    // Di production: origin harus dari daftar whitelist (jangan pernah '*' dgn credentials).
    // Di dev: echo origin (hanya untuk convenience lokal).
    origin(origin, cb) {
      if (!origin) return cb(null, true); // non-browser / curl
      if (origins.length === 0) {
        // dev-mode: izinkan semua origin (local convenience).
        return cb(null, true);
      }
      if (origins.includes(origin)) return cb(null, true);
      // Error CORS diteruskan ke errorHandler terpusat (menjadi 403).
      const e = new Error('Origin tidak diizinkan oleh kebijakan CORS.');
      e.statusCode = 403;
      return cb(e);
    },
    credentials: true, // penting: cookie httpOnly lintas origin
  })
);

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