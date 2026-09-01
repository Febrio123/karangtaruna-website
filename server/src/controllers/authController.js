// controllers/authController.js — captcha, register, login, refresh, logout, me

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { setRefreshCookie, clearRefreshCookie, parseDurationToMs } from '../utils/token.js';
import { generateCaptcha } from '../utils/captcha.js';
import * as authService from '../services/auth.service.js';
import { User } from '../models/user.model.js';
import { ROLES } from '../utils/constants.js';

const COOKIE_REFRESH_NAME = process.env.COOKIE_REFRESH_NAME || 'rt_refresh_token';

/** GET /api/auth/captcha — teks acak (SVG data-URI) + captchaId sekali pakai */
export const captcha = asyncHandler(async (_req, res) => {
  const { captchaId, image } = generateCaptcha();
  return ApiResponse.success(res, { captchaId, image }, 'Captcha dihasilkan, berlaku 5 menit.');
});

/**
 * POST /api/auth/register — buat akun admin.
 * Route ini diproteksi roleGuard(ketua/wakil-ketua) di level route.
 * Cegah privilege escalation: wakil-ketua tidak boleh membuat akun ber-role ketua.
 */
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role = 'anggota', nama = null, pengurusId = null } = req.body;

  // Anti privilege-escalation: non-ketua hanya boleh membuat akun ber-role di bawahnya.
  // Hanya role 'ketua' yang boleh membuat akun 'ketua' lain.
  if (role === 'ketua' && req.user.role !== 'ketua') {
    throw new ApiError(403, 'Hanya akun ber-role ketua yang dapat membuat akun ketua lainnya.');
  }

  const existing = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
  if (existing) {
    // Pesan generik agar tidak membocorkan field mana yang bertabrakan (anti-enumeration)
    throw new ApiError(409, 'Username atau email sudah terdaftar.');
  }
  if (!ROLES.includes(role)) {
    throw new ApiError(400, `Role harus salah satu dari: ${ROLES.join(', ')}.`);
  }
  if (password.length > 72) {
    // bcryptjs memotong pada 72 byte — tolak eksplisit agar tidak ada hash yang mengecoh
    throw new ApiError(400, 'Password maksimal 72 karakter.');
  }

  const user = await User.create({
    username,
    email,
    passwordHash: password, // di-hash otomatis di pre-save hook
    role,
    nama,
    pengurusId,
  });

  return ApiResponse.created(res, { user: user.toPublicJSON() }, 'Akun berhasil dibuat.');
});

/** POST /api/auth/login — username + password + captcha + ingat saya */
export const login = asyncHandler(async (req, res) => {
  const { username, password, remember = false, captchaId = null, captcha: captchaAnswer = null } = req.body;

  const result = await authService.login({
    username,
    password,
    remember,
    captchaId,
    captcha: captchaAnswer,
  });

  // Refresh token hanya lewat cookie httpOnly — TIDAK dikirim di body
  setRefreshCookie(res, result.refreshToken, result.expiresInMs);

  return ApiResponse.success(
    res,
    {
      user: result.user.toPublicJSON(),
      accessToken: result.accessToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshTokenExpiresInMs: result.expiresInMs,
    },
    'Login berhasil.'
  );
});

/** POST /api/auth/refresh — rotasi refresh token dari cookie */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[COOKIE_REFRESH_NAME];
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token tidak ditemukan di cookie. Silakan login ulang.', { code: 'REFRESH_MISSING' });
  }

  const result = await authService.rotateRefreshToken(refreshToken, {
    userAgent: req.headers['user-agent'] || null,
    ip: req.ip || null,
  });

  setRefreshCookie(res, result.refreshToken, result.expiresInMs);

  return ApiResponse.success(
    res,
    {
      user: result.user.toPublicJSON(),
      accessToken: result.accessToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    },
    'Refresh token berhasil diperbarui.'
  );
});

/** POST /api/auth/logout — revoke refresh token & hapus cookie */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[COOKIE_REFRESH_NAME];
  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken);
  }
  clearRefreshCookie(res);
  return ApiResponse.success(res, null, 'Logout berhasil.');
});

/** GET /api/auth/me — info user yang sedang login (protected) */
export const me = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { user: req.user.toPublicJSON() });
});