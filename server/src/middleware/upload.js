// Upload middleware (multer) — memory storage -> diproses ke Cloudinary di service.
// Tanpa ketergantungan server restart / disk storage lokal.

import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { MAX_FILE_SIZE } from '../utils/constants.js';

const storage = multer.memoryStorage();

// Ekstensi yang diperbolehkan untuk gambar & video (whitelist ketat).
const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const ALLOWED_VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v']);

/**
 * Canonicalize nama file asli multer — buang path & karakter berbahaya.
 * Multer sudah mencegah path-traversal pada filename, tapi kami tetap
 * normalisasi agar tidak ada ekstensi/ganda yang menyesatkan.
 */
function safeOriginalname(filename = '') {
  const base = filename.replace(/\\/g, '/').split('/').pop() || '';
  return base.replace(/[^\w.\-]/g, '_');
}

const fileFilter = (allowedMimePatterns, allowedExts) => (req, file, cb) => {
  // 1) MIME-type harus di whitelist
  const okMime = allowedMimePatterns.some((pattern) => file.mimetype.startsWith(pattern));
  if (!okMime) {
    return cb(new ApiError(400, `Tipe file tidak diizinkan: ${file.mimetype}`));
  }

  // 2) BLACKLIST tipe berbahaya walau dimulai image/: SVG bisa membawa <script> (XSS)
  if (file.mimetype === 'image/svg+xml') {
    return cb(new ApiError(400, 'Format SVG tidak diizinkan (risiko XSS). Gunakan JPG/PNG/WebP.'));
  }

  // 3) Ekstensi juga dicek (defense-in-depth; jangan percaya mimetype client saja)
  const original = safeOriginalname(file.originalname || '');
  const parsed = (original.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
  if (!allowedExts.has(parsed)) {
    return cb(new ApiError(400, `Ekstensi file tidak diizinkan: "${parsed || '(tanpa ekstensi)'}".`));
  }

  return cb(null, true);
};

/** Terima gambar (image/*) — untuk cover artikel, foto pengurus, dsb. */
export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(['image/'], ALLOWED_IMAGE_EXT),
});

/** Terima gambar ATAU video (untuk galeri). */
export const uploadMedia = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(['image/', 'video/'], new Set([...ALLOWED_IMAGE_EXT, ...ALLOWED_VIDEO_EXT])),
});

/** Helper: pilih resource_type Cloudinary berdasarkan mimetype. */
export function resourceTypeFromMime(mime = '') {
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  return 'auto';
}