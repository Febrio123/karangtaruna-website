// Konfigurasi Cloudinary dari environment variables.
// Tidak melempar error saat import (biar app tetap bisa di-import tanpa env lengkap);
// layanan upload yang akan menolak dengan pesan jelas jika belum dikonfigurasi.

import cloudinary from 'cloudinary';

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn(
    '[cloudinary] CLOUDINARY_* belum diatur di .env — upload media akan dibatasi. ' +
      'Siapkan Cloudinary + isi .env untuk mengaktifkan upload.'
  );
}

export default cloudinary.v2;
export { isConfigured };