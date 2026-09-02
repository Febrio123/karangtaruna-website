// ============================================================================
// Vercel Serverless Function — `api/index.js`
// Menjalankan Express `app` (dari src/app.js) sebagai handler serverless untuk
// SELURUH request di bawah `/api/*`.
// ============================================================================

import app from '../src/app.js';

export default function handler(req, res) {
  return app(req, res);
}
