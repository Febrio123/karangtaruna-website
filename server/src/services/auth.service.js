// ============================================================================
// services/auth.service.js — business logic autentikasi
// ============================================================================
// Login/logout, rotasi & revoke refresh token, manajemen percobaan gagal.
// Service TIDAK menyentuh HTTP response — controller yang set cookie.

import { isCaptchaEnabled, verifyCaptcha } from '../utils/captcha.js';
import { ApiError } from '../utils/ApiError.js';
import { RefreshToken } from '../models/refreshToken.model.js';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  parseDurationToMs,
} from '../utils/token.js';

const DEFAULT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const REMEMBER_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN_REMEMBER || '30d';
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 menit

/**
 * bcrypt dummy — menjaga durasi respons login tetap seragam (anti timing-enumeration)
 * agar attacker tidak bisa membedakan "username ada vs tidak ada".
 */
async function bcryptDummy() {
  try {
    await bcrypt.hash('dummy-timing-constant', 10);
  } catch {
    /* abaikan */
  }
}

/** Kunci akun setelah N gagal → lockedUntil sekarang + 15 menit */
async function registerFailedAttempt(user) {
  const attempts = (user.loginAttempts || 0) + 1;
  const locked = attempts >= MAX_FAILED_ATTEMPTS;
  await User.findByIdAndUpdate(user._id, {
    loginAttempts: attempts,
    ...(locked ? { lockedUntil: new Date(Date.now() + LOCK_DURATION_MS) } : {}),
  });
  return locked;
}

/**
 * Login: verifikasi username+password (+locked), issue token pair,
 * simpan refresh token (hash) ke koleksi refresh_tokens.
 * @returns {{ user, accessToken, refreshToken, expiresInMs }}
 */
export async function login({ username, password, remember = false, captchaId = null, captcha = null }) {
  if (isCaptchaEnabled()) {
    if (!verifyCaptcha(captchaId, captcha)) {
      throw new ApiError(400, 'Captcha salah atau kedaluwarsa. Silakan muat ulang dan coba lagi.', { code: 'CAPTCHA_INVALID' });
    }
  }

  const user = await User.findOne({ username: String(username).trim().toLowerCase() }).select('+passwordHash');
  if (!user) {
    // Anti user-enumeration (timing) + anti-enumeration pesan:
    // lakukan bcrypt dummy agar durasi respons selaras dengan "password salah".
    await new Promise((resolve) => bcryptDummy(resolve));
    throw new ApiError(401, 'Username atau password salah.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Akun dinonaktifkan. Hubungi administrator.');
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new ApiError(423, `Akun terkunci sementara. Coba lagi setelah ${user.lockedUntil.toLocaleTimeString('id-ID')}.`, { code: 'ACCOUNT_LOCKED' });
  }

  const passwordOk = await user.comparePassword(password);
  if (!passwordOk) {
    const locked = await registerFailedAttempt(user);
    if (locked) {
      throw new ApiError(423, 'Terlalu banyak percobaan gagal. Akun dikunci 15 menit.', { code: 'ACCOUNT_LOCKED' });
    }
    throw new ApiError(401, 'Username atau password salah.');
  }

  // Sukses — reset counter & catat waktu login
  user.loginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  const pair = await issueTokenPair(user, remember);

  return {
    user,
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    expiresInMs: pair.expiresInMs,
  };
}

/**
 * Issue access + refresh token, simpan hash refresh token ke DB.
 */
export async function issueTokenPair(user, remember = false) {
  const refreshExpiresIn = remember ? REMEMBER_EXPIRES_IN : DEFAULT_REFRESH_EXPIRES_IN;

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, refreshExpiresIn);
  const expiresInMs = parseDurationToMs(refreshExpiresIn);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + expiresInMs),
    createdAt: new Date(),
  });

  return { accessToken, refreshToken, expiresInMs };
}

/**
 * Rotasi refresh token: cari token lama (hash), revoke, issue pasangan baru.
 * Mendukung detection: token lama yang sudah dipakai kembali => curigai pencurian
 * (famili token di-revoke semua).
 */
export async function rotateRefreshToken(refreshToken, { userAgent = null, ip = null } = {}) {
  if (!refreshToken) throw new ApiError(401, 'Sesi tidak valid. Silakan login ulang.', { code: 'REFRESH_MISSING' });

  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({ tokenHash }).populate('userId');

  if (!stored) {
    throw new ApiError(401, 'Sesi tidak valid. Silakan login ulang.', { code: 'REFRESH_INVALID' });
  }

  const user = stored.userId;
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Akun tidak ditemukan atau dinonaktifkan.', { code: 'REFRESH_INVALID' });
  }

  // Token sudah dirotasi (replacedBy terisi) lalu dipakai lagi
  // → kemungkinan dicuri → revoke seluruh token user yang masih aktif
  if (stored.replacedBy) {
    await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
    throw new ApiError(401, 'Refresh token terdeteksi dipakai berulang. Sesi diakhiri demi keamanan. Silakan login ulang.', { code: 'REFRESH_REUSE' });
  }

  if (stored.revokedAt) {
    throw new ApiError(401, 'Sesi tidak valid. Silakan login ulang.', { code: 'REFRESH_INVALID' });
  }

  // Token lama yang sudah kedaluwarsa — tolak (defense-in-depth selain JWT expiry)
  if (stored.expiresAt <= new Date()) {
    throw new ApiError(401, 'Sesi kedaluwarsa. Silakan login ulang.', { code: 'REFRESH_EXPIRED' });
  }

  const pair = await issueTokenPair(user, false); // rotasi tidak mengubah "ingat saya"

  // Tandai TOKEN LAMA: revokedAt + replacedBy -> id token pengganti
  const newStored = await RefreshToken.findOne({ tokenHash: hashToken(pair.refreshToken) });
  stored.revokedAt = new Date();
  stored.replacedBy = newStored ? newStored._id : null;
  stored.userAgent = userAgent || stored.userAgent;
  stored.ip = ip || stored.ip;
  await stored.save();

  return {
    user,
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    expiresInMs: pair.expiresInMs,
  };
}

/**
 * Logout: revoke refresh token yang dikirim (opsional), tanpa error bila tak ditemukan.
 */
export async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(refreshToken), revokedAt: null },
    { revokedAt: new Date() }
  );
}

/** Hash generator untuk captcha (re-export agar controller cukup memanggil service ini) */
export { generateCaptcha } from '../utils/captcha.js';