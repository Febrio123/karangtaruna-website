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

// ============================================================================
// CORS — HARUS DIPASANG PERTAMA, sebelum helmet / compression / rate-limiter.
// Alasan: browser mengirim OPTIONS (preflight) sebelum request asli; bila
// middleware lain dieksekusi lebih dulu, response bisa tidak punya header
// Access-Control-Allow-Origin dan preflight gagal (CORS blocked).
// ============================================================================

// Domain production yang selalu diizinkan (fallback bila env CORS_ORIGIN kosong)
const PRODUCTION_ORIGINS = [
  'https://karangtaruna-website-dashboard.vercel.app',
  'https://karangtaruna-website.vercel.app',
];

// Ambil dari env (Vercel Dashboard → Environment Variables → CORS_ORIGIN)
const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Gabung + deduplicate: env origins selalu include production fallback
const allowedOrigins = [...new Set([...envOrigins, ...PRODUCTION_ORIGINS])];

const corsOptions = {
  origin(requestOrigin, callback) {
    // Izinkan request tanpa Origin header (curl, Postman, server-to-server)
    if (!requestOrigin) return callback(null, true);

    if (allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }

    // Izinkan localhost semua port (development lokal)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)) {
      return callback(null, true);
    }

    const err = new Error(`CORS: origin tidak diizinkan — ${requestOrigin}`);
    err.statusCode = 403;
    return callback(err);
  },
  credentials: true, // wajib: cookie httpOnly refresh token lintas origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // beberapa browser lama perlu 200 bukan 204
};

// Jawab semua preflight OPTIONS di sini — SEBELUM middleware apapun.
app.options('*', cors(corsOptions));
// Terapkan CORS header ke semua response.
app.use(cors(corsOptions));

// --- Compression (gzip) ---
app.use(compression());

// --- Security headers (setelah CORS agar helmet tidak menimpa CORS headers) ---
app.use(helmet());

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