// ============================================================================
// Vercel Serverless Function — `api/index.js`
// Menjalankan Express `app` (dari src/app.js) sebagai handler serverless untuk
// SELURUH request di bawah `/api/*`.
//
// Konfigurasi route:
// - Semua request `/api/*` diteruskan ke fungsi ini via `vercel.json` `rewrites`:
//     { "source": "/api/:path*", "destination": "/api" }
//   Ketika Vercel memanggil `api/index.js`, `req.url` TETAP memuat path asli
//   (mis. `/api/health`, `/api/auth/login`, `/api/prediksi-anggaran/17%20Agustusan`),
//   sehingga Express `app` yang sudah di-mount di `/api` menangkapnya dengan benar.
// - File ini sengaja DINAMAI `index.js` (nama modul normal, tanpa karakter
//   bracket `[ ]`) — berbeda dari pendekatan catch-all `[...slug].js`. Ini
//   menghilangkan karakter `[`/`]` dari nama modul yang di-parse Vercel sebagai
//   sumber potensial parse error runtime (`SyntaxError: Invalid or unexpected token`).
//
// Catatan penting:
// - Koneksi MongoDB di-buffer di module level (singleton promise) sehingga antar
//   warm invocations koneksi di-reuse, bukan dibuka per request.
// - TIDAK memanggil app.listen / server.js. TIDAK memanggil validateEnv
//   (env vars di-jaga Vercel; bila env kritis kosong, connectDB akan throw dan
//   handler merespons 500 generik tanpa bocorkan detail).
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
