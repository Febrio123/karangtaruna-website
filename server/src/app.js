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
import { connectDB } from './config/db.js';

const app = express();

// --- trust proxy (rate-limit butuh IP yang benar di belakang reverse proxy) ---
app.set('trust proxy', 1);

// ============================================================================
// 1. CORS — WAJIB DIPASANG PALING PERTAMA.
// Refleksikan req.headers.origin secara dinamis + izinkan credentials.
// ============================================================================
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ============================================================================
// 2. KONEKSI DB (Serverless Lazy Connection)
// Dipasang SETELAH CORS agar jika koneksi DB error/timeout, header CORS
// sudah terpasang di response dan browser menerima JSON 500 yang valid.
// ============================================================================
let connPromise = null;
function ensureDb() {
  if (!connPromise) {
    connPromise = connectDB().catch((e) => {
      connPromise = null;
      throw e;
    });
  }
  return connPromise;
}

app.use(async (req, res, next) => {
  // OPTIONS request (CORS preflight) langsung lewat tanpa perlu DB
  if (req.method === 'OPTIONS') return next();
  
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

// --- Compression (gzip) ---
app.use(compression());

// --- Security headers ---
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