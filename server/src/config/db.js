# Konfigurasi koneksi MongoDB (mongoose)

import mongoose from 'mongoose';

/**
 * Terpisah dari app.js / server.js agar `app` bisa di-import untuk testing
 * tanpa membutuhkan MongoDB aktif.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI belum diatur. Salin .env.example menjadi .env lalu isi MONGO_URI.');
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000, // gagal cepat bila DB tidak terjangkau
  });

  console.log(`[db] MongoDB terhubung: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log('[db] Koneksi MongoDB ditutup.');
}