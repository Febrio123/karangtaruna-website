// ============================================================================
// Vercel Serverless Function — `api/index.js`
// Menjalankan Express `app` (dari src/app.js) sebagai handler serverless untuk
// SELURUH request di bawah `/api/*`.
// ============================================================================

import 'dotenv/config';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// --- Lazy singleton koneksi DB (cached antar warm invocations) ---
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

export default async function handler(req, res) {
  // 1. Request OPTIONS (CORS preflight) langsung ditangani oleh Express app
  //    tanpa perlu menunggu koneksi database.
  if (req.method === 'OPTIONS') {
    return app(req, res);
  }

  // 2. Hubungkan database untuk request metode HTTP lainnya
  try {
    await ensureDb();
  } catch (e) {
    console.error('[api] Gagal menghubungkan database:', e.message);
    // Pastikan header CORS tetap dikirimkan jika terjadi error koneksi database
    if (req.headers.origin) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.status(500).json({ status: 'error', message: 'Gagal menghubungkan database' });
    return;
  }

  return app(req, res);
}
