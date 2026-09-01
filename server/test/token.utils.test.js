// ============================================================================
// test/token.utils.test.js
// Unit test untuk utils/token.js — JWT sign/verify, hash, cookie, parseDuration
// Tanpa MongoDB. Jalankan: npm test
// ============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

// --- Setup env sebelum import module yang bergantung pada env ---
const ORIG_ACCESS = process.env.JWT_ACCESS_SECRET;
const ORIG_REFRESH = process.env.JWT_REFRESH_SECRET;
const ORIG_ENV = process.env.NODE_ENV;

process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_unit_testing_purpose_32ch';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_unit_testing_purpose32ch';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'development';

import jwt from 'jsonwebtoken';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  setRefreshCookie,
  clearRefreshCookie,
  parseDurationToMs,
} from '../src/utils/token.js';
import { COOKIE_NAME } from '../src/utils/constants.js';

// --- Mock user object ---
const mockUser = {
  _id: { toString: () => '6650a1b2c3d4e5f6a7b8c9d0' },
  role: 'ketua',
  username: 'ketua',
};

after(() => {
  // Restore env asli
  if (ORIG_ACCESS === undefined) delete process.env.JWT_ACCESS_SECRET;
  else process.env.JWT_ACCESS_SECRET = ORIG_ACCESS;
  if (ORIG_REFRESH === undefined) delete process.env.JWT_REFRESH_SECRET;
  else process.env.JWT_REFRESH_SECRET = ORIG_REFRESH;
  if (ORIG_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = ORIG_ENV;
});

// ---- signAccessToken ----
describe('signAccessToken', () => {
  test('menghasilkan JWT string yang bisa di-verify', () => {
    const token = signAccessToken(mockUser);
    assert.equal(typeof token, 'string');
    assert.ok(token.split('.').length === 3, 'JWT harus 3 bagian (header.payload.signature)');
    const payload = verifyAccessToken(token);
    assert.equal(payload.id, '6650a1b2c3d4e5f6a7b8c9d0');
    assert.equal(payload.role, 'ketua');
    assert.equal(payload.username, 'ketua');
  });

  test('token expired sesuai JWT_ACCESS_EXPIRES_IN (15m)', () => {
    const token = signAccessToken(mockUser);
    const payload = verifyAccessToken(token);
    // JWT library sets 'exp' — should be present
    assert.ok(typeof payload.exp === 'number', 'payload harus punya field exp');
    assert.ok(typeof payload.iat === 'number', 'payload harus punya field iat');
    // exp - iat ~= 15 min = 900s (toleransi +-10s untuk clock)
    const diff = payload.exp - payload.iat;
    assert.ok(diff >= 890 && diff <= 910, `selisih exp-iat harus ~900s, actual: ${diff}`);
  });
});

// ---- signRefreshToken ----
describe('signRefreshToken', () => {
  test('menghasilkan JWT dengan hanya id (tidak ada role/username)', () => {
    const token = signRefreshToken(mockUser, '7d');
    const payload = verifyRefreshToken(token);
    assert.equal(payload.id, '6650a1b2c3d4e5f6a7b8c9d0');
    assert.equal(typeof payload.role, 'undefined', 'refresh token tidak boleh punya role');
  });

  test('durasi 30d menghasilkan exp ~30 hari', () => {
    const token = signRefreshToken(mockUser, '30d');
    const payload = verifyRefreshToken(token);
    const diff = payload.exp - payload.iat;
    const thirtyDays = 30 * 86400;
    assert.ok(diff >= thirtyDays - 10 && diff <= thirtyDays + 10, `exp-iat harus ~30 hari (${thirtyDays}s)`);
  });
});

// ---- verifyAccessToken ----
describe('verifyAccessToken', () => {
  test('token valid -> payload', () => {
    const token = signAccessToken(mockUser);
    const payload = verifyAccessToken(token);
    assert.equal(payload.id, mockUser._id.toString());
  });

  test('token expired -> throw error dengan code TOKEN_EXPIRED', async () => {
    // Buat token yang sudah expired (exp 1 detik yang lalu)
    const fakePayload = { id: 'abc', role: 'ketua', username: 'test' };
    const token = jwt.sign(fakePayload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1s' });
    // Tunggu 1.1 detik agar expired
    await new Promise((r) => setTimeout(r, 1100));
    assert.throws(
      () => verifyAccessToken(token),
      (err) => {
        assert.equal(err.code, 'TOKEN_EXPIRED');
        assert.equal(err.isExpired, true);
        return true;
      }
    );
  });

  test('token invalid (secret berbeda) -> throw error biasa', () => {
    const token = jwt.sign({ id: 'x' }, 'wrong_secret_completely_wrong_32', { expiresIn: '1h' });
    assert.throws(() => verifyAccessToken(token));
  });
});

// ---- hashToken ----
describe('hashToken', () => {
  test('menghasilkan hex string 64 karakter (SHA-256)', () => {
    const hash = hashToken('hello world');
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    assert.ok(/^[0-9a-f]{64}$/.test(hash), 'harus hex lowercase 64 char');
  });

  test('input sama -> hash sama (deterministic)', () => {
    const h1 = hashToken('token_abc_123');
    const h2 = hashToken('token_abc_123');
    assert.equal(h1, h2);
  });

  test('input berbeda -> hash berbeda', () => {
    const h1 = hashToken('token_abc');
    const h2 = hashToken('token_xyz');
    assert.notEqual(h1, h2);
  });

  test('hash dari string kosong != hash dari string null', () => {
    const h1 = hashToken('');
    const h2 = hashToken('null');
    assert.notEqual(h1, h2);
  });
});

// ---- setRefreshCookie / clearRefreshCookie ----
describe('setRefreshCookie & clearRefreshCookie', () => {
  test('setRefreshCookie men-set cookie dengan maxAge', () => {
    // Mock res object
    const cookies = [];
    const res = {
      cookie(name, value, opts) {
        cookies.push({ name, value, opts });
      },
      clearCookie(name, opts) {
        cookies.push({ name, cleared: true, opts });
      },
    };
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    setRefreshCookie(res, 'refresh_jwt_token', maxAgeMs);
    assert.equal(cookies.length, 1);
    assert.equal(cookies[0].name, COOKIE_NAME);
    assert.equal(cookies[0].value, 'refresh_jwt_token');
    assert.equal(cookies[0].opts.maxAge, maxAgeMs);
    assert.equal(cookies[0].opts.httpOnly, true);
    assert.equal(cookies[0].opts.path, '/');
  });

  test('clearRefreshCookie memanggil clearCookie dengan nama benar', () => {
    const cookies = [];
    const res = {
      cookie(name, value, opts) {
        cookies.push({ name, value, opts });
      },
      clearCookie(name, opts) {
        cookies.push({ name, cleared: true, opts });
      },
    };
    clearRefreshCookie(res);
    assert.equal(cookies.length, 1);
    assert.equal(cookies[0].name, COOKIE_NAME);
    assert.equal(cookies[0].cleared, true);
  });
});

// ---- Cookie options: secure & SameSite ----
describe('Cookie options (production vs development)', () => {
  test('di production: sameSite=none (cross-site Vercel), secure=true', () => {
    process.env.NODE_ENV = 'production';
    const cookies = [];
    const res = {
      cookie(name, value, opts) { cookies.push(opts); },
      clearCookie() {},
    };
    setRefreshCookie(res, 'tok', 1000);
    assert.equal(cookies[0].sameSite, 'none');
    assert.equal(cookies[0].secure, true);
    // Reset
    process.env.NODE_ENV = 'development';
  });

  test('di development: sameSite=lax (default), secure=true selalu (HTTPS)', () => {
    process.env.NODE_ENV = 'development';
    const cookies = [];
    const res = {
      cookie(name, value, opts) { cookies.push(opts); },
      clearCookie() {},
    };
    setRefreshCookie(res, 'tok', 1000);
    assert.equal(cookies[0].sameSite, 'lax');
    assert.equal(cookies[0].secure, true);
  });
});

// ---- parseDurationToMs ----
describe('parseDurationToMs', () => {
  test('parse "15m" -> 900000', () => {
    assert.equal(parseDurationToMs('15m'), 15 * 60 * 1000);
  });

  test('parse "7d" -> 604800000', () => {
    assert.equal(parseDurationToMs('7d'), 7 * 86400 * 1000);
  });

  test('parse "30d" -> 2592000000', () => {
    assert.equal(parseDurationToMs('30d'), 30 * 86400 * 1000);
  });

  test('parse "2h" -> 7200000', () => {
    assert.equal(parseDurationToMs('2h'), 2 * 3600 * 1000);
  });

  test('parse "1000ms" -> 1000', () => {
    assert.equal(parseDurationToMs('1000ms'), 1000);
  });

  test('parse "30s" -> 30000', () => {
    assert.equal(parseDurationToMs('30s'), 30 * 1000);
  });

  test('null/undefined -> fallback (7 hari)', () => {
    const fallback = 7 * 24 * 60 * 60 * 1000;
    assert.equal(parseDurationToMs(null), fallback);
    assert.equal(parseDurationToMs(undefined), fallback);
    assert.equal(parseDurationToMs(''), fallback);
  });

  test('string tidak valid -> fallback', () => {
    const fallback = 7 * 24 * 60 * 60 * 1000;
    assert.equal(parseDurationToMs('abc'), fallback);
  });

  test('angka tanpa unit -> ms', () => {
    assert.equal(parseDurationToMs('500'), 500);
  });
});
