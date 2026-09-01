// ============================================================================
// test/env.config.test.js
// Unit test untuk config/env.js — validateEnv menolak placeholder / secret pendek
// Tanpa MongoDB. Jalankan: npm test
// ============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Simpan env asli
const savedEnv = {};
const KEYS = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'NODE_ENV', 'MONGO_URI', 'COOKIE_SECURE', 'CORS_ORIGIN'];

function saveEnv() {
  for (const k of KEYS) savedEnv[k] = process.env[k];
}

function setEnv(key, value) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function restoreEnv() {
  for (const k of KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
}

// Import modul harus SETELAH env diset (menghindari top-level execution effect)
let validateEnv;
describe('config/env.js — validateEnv', () => {
  before(() => {
    saveEnv();
  });

  after(() => {
    restoreEnv();
  });

  // Setup: set secrets valid sebelum import
  test('import validateEnv', async () => {
    setEnv('JWT_ACCESS_SECRET', 'a_valid_secret_that_is_long_enough_32chars!');
    setEnv('JWT_REFRESH_SECRET', 'another_valid_secret_that_is_long_enough32!');
    const mod = await import('../src/config/env.js');
    validateEnv = mod.validateEnv;
    assert.equal(typeof validateEnv, 'function');
  });

  test('secret valid -> return true', () => {
    setEnv('JWT_ACCESS_SECRET', 'a_valid_secret_that_is_long_enough_32chars!');
    setEnv('JWT_REFRESH_SECRET', 'another_valid_secret_that_is_long_enough32!');
    setEnv('NODE_ENV', 'development');
    assert.equal(validateEnv(), true);
  });

  test('JWT_ACCESS_SECRET kosong -> throw', () => {
    setEnv('JWT_ACCESS_SECRET', '');
    setEnv('JWT_REFRESH_SECRET', 'valid_secret_for_refresh_token_testing!!');
    assert.throws(() => validateEnv(), /JWT_ACCESS_SECRET/i);
  });

  test('JWT_REFRESH_SECRET kosong -> throw', () => {
    setEnv('JWT_ACCESS_SECRET', 'valid_secret_for_access_token_testing_32ch!!');
    setEnv('JWT_REFRESH_SECRET', '');
    assert.throws(() => validateEnv(), /JWT_REFRESH_SECRET/i);
  });

  test('JWT_ACCESS_SECRET berisi "CHANGE_ME" -> throw', () => {
    setEnv('JWT_ACCESS_SECRET', 'CHANGE_ME');
    setEnv('JWT_REFRESH_SECRET', 'valid_secret_for_refresh_token_testing!!');
    assert.throws(() => validateEnv(), /CHANGE_ME/i);
  });

  test('JWT_REFRESH_SECRET berisi "CHANGE_ME" -> throw', () => {
    setEnv('JWT_ACCESS_SECRET', 'valid_secret_for_access_token_testing_32ch!!');
    setEnv('JWT_REFRESH_SECRET', 'CHANGE_ME');
    assert.throws(() => validateEnv(), /CHANGE_ME/i);
  });

  test('secret terlalu pendek (< 32 char) -> throw', () => {
    setEnv('JWT_ACCESS_SECRET', 'short');
    setEnv('JWT_REFRESH_SECRET', 'valid_secret_for_refresh_token_testing!!');
    assert.throws(() => validateEnv(), /minimal 32/i);
  });

  test('production: MONGO_URI localhost -> throw', () => {
    setEnv('JWT_ACCESS_SECRET', 'valid_secret_for_access_token_testing_32ch!!');
    setEnv('JWT_REFRESH_SECRET', 'valid_secret_for_refresh_token_testing!!');
    setEnv('NODE_ENV', 'production');
    setEnv('MONGO_URI', 'mongodb://localhost:27017/test');
    setEnv('COOKIE_SECURE', 'true');
    setEnv('CORS_ORIGIN', 'https://example.com');
    assert.throws(() => validateEnv(), /localhost/i);
  });

  test('production: COOKIE_SECURE bukan true -> throw', () => {
    setEnv('JWT_ACCESS_SECRET', 'valid_secret_for_access_token_testing_32ch!!');
    setEnv('JWT_REFRESH_SECRET', 'valid_secret_for_refresh_token_testing!!');
    setEnv('NODE_ENV', 'production');
    setEnv('MONGO_URI', 'mongodb+srv://user:pass@cluster.mongodb.net/db');
    setEnv('COOKIE_SECURE', 'false');
    setEnv('CORS_ORIGIN', 'https://example.com');
    assert.throws(() => validateEnv(), /COOKIE_SECURE/i);
  });

  test('production: CORS_ORIGIN kosong -> throw', () => {
    setEnv('JWT_ACCESS_SECRET', 'valid_secret_for_access_token_testing_32ch!!');
    setEnv('JWT_REFRESH_SECRET', 'valid_secret_for_refresh_token_testing!!');
    setEnv('NODE_ENV', 'production');
    setEnv('MONGO_URI', 'mongodb+srv://user:pass@cluster.mongodb.net/db');
    setEnv('COOKIE_SECURE', 'true');
    setEnv('CORS_ORIGIN', '');
    assert.throws(() => validateEnv(), /CORS_ORIGIN/i);
  });

  test('development: semua aman -> return true', () => {
    setEnv('JWT_ACCESS_SECRET', 'valid_secret_for_access_token_testing_32ch!!');
    setEnv('JWT_REFRESH_SECRET', 'valid_secret_for_refresh_token_testing!!');
    setEnv('NODE_ENV', 'development');
    assert.equal(validateEnv(), true);
  });
});
