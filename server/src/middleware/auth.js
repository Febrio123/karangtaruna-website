// Middleware autentikasi & RBAC:
//   verifyAccessToken  — WAJIB login (Authorization: Bearer <access token>)
//   optionalAuth       — boleh tanpa token (GET publik yang menampilkan data terbatas)
//   roleGuard(...roles) — cek role (harus dipanggil SETELAH verifyAccessToken)

import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken as verifyAccessTokenJwt } from '../utils/token.js';
import { TOKEN_EXPIRED_CODE } from '../utils/constants.js';
import { User } from '../models/user.model.js';

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

export const verifyAccessToken = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    throw new ApiError(401, 'Autentikasi diperlukan. Token tidak ditemukan.', { code: 'TOKEN_MISSING' });
  }

  let payload;
  try {
    payload = verifyAccessTokenJwt(token);
  } catch (err) {
    if (err.isExpired) {
      throw new ApiError(401, 'Access token kedaluwarsa. Silakan refresh token.', { code: TOKEN_EXPIRED_CODE });
    }
    throw new ApiError(401, 'Access token tidak valid.', { code: 'TOKEN_INVALID' });
  }

  const user = await User.findById(payload.id).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Akun tidak ditemukan atau dinonaktifkan.', { code: 'TOKEN_INVALID' });
  }

  req.user = user;
  return next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessTokenJwt(token);
    const user = await User.findById(payload.id);
    if (user && user.isActive) req.user = user;
  } catch {
    // token invalid/expired pada GET publik — lanjutkan sebagai anonim
  }
  return next();
});

/**
 * roleGuard(...roles) — contoh: roleGuard('ketua', 'wakil-ketua')
 * Wajib berjajar SETELAH verifyAccessToken.
 */
export const roleGuard = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Autentikasi diperlukan.');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Akses ditolak. Role "${req.user.role}" tidak berhak melakukan aksi ini.`);
    }
    return next();
  });