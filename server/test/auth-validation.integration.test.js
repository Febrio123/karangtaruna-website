// ============================================================================
// test/auth-validation.integration.test.js
// Integration test — validasi input pada endpoint auth (tanpa DB)
//   - POST /api/auth/login tanpa body -> 400 (validasi gagal)
//   - POST /api/auth/login tanpa captcha -> 400 CAPTCHA_INVALID
//   - POST /api/auth/register tanpa auth -> 401 TOKEN_MISSING
//   - POST /api/auth/refresh tanpa cookie -> 401 REFRESH_MISSING
//   - GET /api/auth/me tanpa token -> 401 TOKEN_MISSING
// Jalankan: npm test
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_integration_testing_32ch';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_integration_testing32ch';
process.env.NODE_ENV = 'development';
process.env.CAPTCHA_ENABLED = 'false';

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');

describe('POST /api/auth/login — validasi input (tanpa DB)', () => {
  test('body kosong -> 400 (validasi gagal: username & password wajib)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.ok(
      res.body.message.includes('Validasi') || res.body.message.includes('validasi'),
      `pesan harus berisi info validasi, got: "${res.body.message}"`
    );
  });

  test('hanya username tanpa password -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin' })
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 400);
    assert.ok(
      res.body.details || res.body.message.includes('validasi') || res.body.message.includes('Validasi'),
    );
  });

  test('body bukan JSON -> 400 (entity.parse.failed)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('NOT_JSON');

    assert.equal(res.status, 400);
    assert.ok(res.body.message.includes('JSON'));
  });
});

describe('POST /api/auth/register — tanpa auth -> 401', () => {
  test('tanpa token -> 401 TOKEN_MISSING', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 'test@test.com', password: '123456', role: 'anggota' })
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_MISSING');
  });

  test('token palsu -> 401 TOKEN_INVALID', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 'test@test.com', password: '123456', role: 'anggota' })
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer invalid_token_string');

    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_INVALID');
  });
});

describe('POST /api/auth/refresh — tanpa cookie -> 401', () => {
  test('tanpa cookie refresh token -> 401 REFRESH_MISSING', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'REFRESH_MISSING');
  });
});

describe('GET /api/auth/me — tanpa auth -> 401', () => {
  test('tanpa token -> 401 TOKEN_MISSING', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_MISSING');
  });
});
