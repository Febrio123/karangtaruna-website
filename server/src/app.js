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
// CORS: Refleksikan origin request secara dinamis (origin: true) agar
// selalu menyertakan Access-Control-Allow-Origin & Credentials untuk semua domain.
// ============================================================================
const corsOptions = {
  origin: true, // Refleksikan req.headers.origin secara otomatis
  credentials: true, // Izinkan cookie & header autentikasi lintas origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

// Pasang CORS middleware di posisi paling atas
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