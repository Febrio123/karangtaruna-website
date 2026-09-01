// ============================================================================
// Vercel Serverless Function — catch-all untuk seluruh request /api/*
// Menjalankan Express `app` (dari src/app.js) sebagai handler serverless.
//
// Catatan penting:
// - file ini adalah konvensi Vercel Node runtime: `api/[...slug].js` menangkap
//   SEMUA path di bawah /api/* sehingga path tetap (mis. /api/health,
//   /api/auth/login, /api/prediksi-anggaran/17%20Agustusan) diteruskan apa adanya
//   ke Express app. Tidak perlu vercel.json "rewrites" — catch-all jauh lebih
//   rapi untuk ESM + Express yang sudah mount route di /api.
// - Koneksi MongoDB di-buffer di module level (singleton promise) sehingga
//   antar warm invocations koneksi di-reuse, bukan dibuka per request.
// - TIDAK memanggil app.listen / server.js. TIDAK memanggil validateEnv
//   (Vercel env vars yang menjaga; bila env kritis kosong, connectDB akan throw
//   dan handler merespons 500 generik tanpa bocorkan detail).
// ============================================================================

import 'dotenv/config';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// --- Lazy singleton koneksi DB (cached antar warm invocations) ---
let connPromise = null;

function ensureDb() {
  if (!connPromise) {
    connPromise = connectDB().catch((e) => {
      // Reset agar request berikutnya mencoba lagi (tidak terjebak promise reject).
      connPromise = null;
      throw e;
    });
  }
  return connPromise;
}

// Express app adalah fungsi (req, res) yang valid sebagai Vercel handler.
export default async function handler(req, res) {
  try {
    await ensureDb();
  } catch (e) {
    // Log ke console (Vercel Function Logs) tanpa membocorkan secret/detail.
    console.error('[api] Gagal menghubungkan database:', e.message);
    res.status(500).json({ status: 'error', message: 'Gagal menghubungkan database' });
    return;
  }

  return app(req, res);
}
