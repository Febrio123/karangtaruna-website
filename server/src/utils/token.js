// Helper token JWT: sign access/refresh, hash refresh token (sha256),
// dan set/clear cookie httpOnly.

import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { COOKIE_NAME, TOKEN_EXPIRED_CODE } from './constants.js';

/** Konversi durasi "15m" | "7d" | "30d" | "2h" -> milidetik (untuk expiresAt DB). */
export function parseDurationToMs(value, fallbackMs = 7 * 24 * 60 * 60 * 1000) {
  if (!value) return fallbackMs;
  const match = String(value).trim().match(/^(\d+)\s*(ms|s|m|h|d|w)?$/i);
  if (!match) return fallbackMs;
  const n = Number(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();
  const unitMs = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 };
  return n * (unitMs[unit] || 1);
}

export function signAccessToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, username: user.username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

export function signRefreshToken(user, expiresIn) {
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_REFRESH_SECRET, { expiresIn });
}

/** Hash token sebelum disimpan di DB — refresh token TIDAK pernah plaintext. */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function baseCookieOptions() {
  // Di production (HTTPS) paksa SameSite=Strict & secure=true untuk pertahanan CSRF
  // yang lebih kuat. Di dev, ikuti env (default lax).
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd ? true : process.env.COOKIE_SECURE === 'true',
    sameSite: isProd ? 'strict' : (process.env.COOKIE_SAMESITE || 'lax'),
    path: '/',
  };
}

/**
 * Set cookie httpOnly berisi refresh token.
 * Umur cookie mengikuti `maxAgeMs`.
 */
export function setRefreshCookie(res, refreshToken, maxAgeMs) {
  res.cookie(COOKIE_NAME, refreshToken, {
    ...baseCookieOptions(),
    maxAge: maxAgeMs,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(COOKIE_NAME, baseCookieOptions());
}

/**
 * Verifikasi access token dari header Authorization: Bearer <token>.
 * Melempar object { code: TOKEN_EXPIRED_CODE } jika kedaluwarsa,
 * agar middleware auth bisa memberi sinyal refresh ke frontend.
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const e = new Error('Access token kedaluwarsa');
      e.code = TOKEN_EXPIRED_CODE;
      e.isExpired = true;
      throw e;
    }
    throw err;
  }
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}