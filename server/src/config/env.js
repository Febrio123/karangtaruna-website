// config/env.js — validasi environment variables saat startup (dipanggil di server.js)
// TIDAK dipanggil dari app.js agar app tetap bisa di-import untuk testing tanpa env lengkap.

const REQUIRED_PROD = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];

/**
 * Validasi konfigurasi env. Melakukan pemeriksaan di saat server mulai.
 * @throws {Error} bila ada var kritis kosong / placeholder
 */
export function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';

  // --- Secret kunci harus ada & bukan placeholder ---
  const access = process.env.JWT_ACCESS_SECRET || '';
  const refresh = process.env.JWT_REFRESH_SECRET || '';

  if (!access || access.includes('CHANGE_ME')) {
    throw new Error('JWT_ACCESS_SECRET wajib diisi dengan string acak >= 32 karakter (bukan CHANGE_ME).');
  }
  if (!refresh || refresh.includes('CHANGE_ME')) {
    throw new Error('JWT_REFRESH_SECRET wajib diisi dengan string acak >= 32 karakter (bukan CHANGE_ME).');
  }
  if (access.length < 32 || refresh.length < 32) {
    throw new Error('JWT_ACCESS_SECRET dan JWT_REFRESH_SECRET minimal 32 karakter.');
  }

  // --- Di production, pastikan secret / config tambahan aman ---
  if (isProd) {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost')) {
      throw new Error('MONGO_URI production tidak boleh kosong / localhost.');
    }
    // Di production, cookie HARUS secure (HTTPS)
    if (process.env.COOKIE_SECURE !== 'true') {
      throw new Error('COOKIE_SECURE wajib "true" di production (HTTPS).');
    }
    // CORS tidak boleh kosong di production (hindari wildcard + credentials)
    const origins = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);
    if (origins.length === 0) {
      throw new Error('CORS_ORIGIN wajib diisi daftar origin diizinkan di production (jangan kosong).');
    }
  }

  return true;
}

export { REQUIRED_PROD };
