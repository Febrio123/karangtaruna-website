// ============================================================================
// server.js — entry point: konek DB lalu listen. Import app dari app.js.
// ============================================================================

import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/env.js';

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    // Validasi env kritis SEBELUM server berjalan (secret tidak boleh kosong/placeholder)
    validateEnv();

    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[server] Karang Taruna API berjalan di http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`[server] ${signal} diterima — menutup server...`);
      server.close(() => {
        console.log('[server] Server ditutup.');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[server] Gagal memulai server:', err.message);
    process.exit(1);
  }
}

start();