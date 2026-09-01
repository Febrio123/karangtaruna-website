// Rate limiting — proteksi brute-force login & abuse API umum.

import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 menit
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.',
    });
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Terlalu banyak percobaan login. Tunggu 15 menit.' },
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Terlalu banyak percobaan login. Tunggu 15 menit.',
    });
  },
});

// Sedikit ketat untuk perhitungan prediksi (loop bisa mahal)
export const prediksiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ status: 'error', message: 'Terlalu banyak permintaan prediksi.' });
  },
});

export { ApiError };