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
// CORS Configuration
// ============================================================================
const defaultOrigins = [
  'https://karangtaruna-website-dashboard.vercel.app',
  'https://karangtaruna-website.vercel.app',
];

const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin(origin, cb) {
    // Izinkan non-browser request (Postman, curl, server-to-server)
    if (!origin) return cb(null, true);

    // Izinkan origin yang terdaftar
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    // Izinkan localhost pada semua port (development lokal)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }

    // Izinkan semua subdomain .vercel.app milik Karang Taruna
    if (/^https:\/\/karangtaruna-website.*\.vercel\.app$/.test(origin)) {
      return cb(null, true);
    }

    // Untuk environment dev/preview tanpa constraint ketat
    if (process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }

    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

// Pasang CORS middleware paling atas
app.use(cors(corsOptions));

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