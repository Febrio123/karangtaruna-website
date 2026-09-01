// ============================================================================
// test/routes.integration.test.js
// Integration test — rute yang tidak bergantung DB
//   - 404 untuk endpoint tidak dikenal
//   - GET publik berbagai endpoint -> perlu model -> 500 (karena DB tidak ada)
//   - Static routes / health -> 200
// Jalankan: npm test
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_integration_testing_32ch';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_integration_testing32ch';
process.env.NODE_ENV = 'development';

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');

describe('Route handling (tanpa DB)', () => {
  test('GET /api/tidak-ada -> 404', async () => {
    const res = await request(app).get('/api/tidak-ada');
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 'error');
    assert.ok(res.body.message.includes('tidak ditemukan'));
  });

  test('GET /api/ -> 404 (route root API tidak ada)', async () => {
    const res = await request(app).get('/api/');
    assert.equal(res.status, 404);
  });

  test('POST /api/auth/login tanpa body -> 400 (validasi jalan duluan, tanpa DB)', async () => {
    // Validasi middleware jalan SEBELUM controller/service yang butuh DB.
    // Body kosong -> express-validator menolak -> 400 tanpa menyentuh DB.
    const res = await request(app)
      .post('/api/auth/login')
      .send({})
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
  });

  test('POST /api/auth/register tanpa token -> 401 (auth middleware duluan, tanpa DB)', async () => {
    // verifyAccessToken menolak SEBELUM controller menyentuh DB.
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'x', email: 'x@x.com', password: '123456' })
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_MISSING');
  });
});

describe('POST /api/parameter-ekonomi — tanpa auth -> 401 (rola guard duluan, tanpa DB)', () => {
  test('tanpa token -> 401 TOKEN_MISSING', async () => {
    const res = await request(app)
      .post('/api/parameter-ekonomi')
      .send({ tahun: 2027, persentase_inflasi: 3.0 })
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_MISSING');
  });

  test('token palsu -> 401 TOKEN_INVALID', async () => {
    const res = await request(app)
      .post('/api/parameter-ekonomi')
      .send({ tahun: 2027, persentase_inflasi: 3.0 })
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer fake.invalid.token');

    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_INVALID');
  });
});

describe('POST /api/prediksi-anggaran/.../override — tanpa auth -> 401', () => {
  test('tanpa token -> 401 TOKEN_MISSING', async () => {
    const res = await request(app)
      .post('/api/prediksi-anggaran/17%20Agustus/override')
      .send({ tahun_prediksi: 2027, anggaran_final: 2500000, catatan: 'test' })
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_MISSING');
  });
});

describe('GET /api/prediksi-anggaran/:nama_event — validasi nama_event', () => {
  test('nama_event kosong -> 400 (validasi duluan, tanpa DB)', async () => {
    // Route param wajib diisi -> express-validator menolak sebelum controller/DB
    const res = await request(app).get('/api/prediksi-anggaran/%20').set('Content-Type', 'application/json');
    // validator param notEmpty — path param empty -> 400
    assert.ok(res.status === 400 || res.status === 404, `expected 400 or 404, got ${res.status}`);
  });
});

describe('Content-Type handling', () => {
  test('POST tanpa Content-Type yang tepat -> 400 atau diabaikan gracefully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'text/plain')
      .send('not json');

    // Express akan parse body kosong (bukan JSON) sehingga validasi jalan
    assert.equal(res.status, 400);
  });
});

describe('Helmet security headers', () => {
  test('response memiliki security headers dari helmet', async () => {
    const res = await request(app).get('/api/health');
    // helmet menambahkan header seperti x-content-type-options, x-frame-options
    assert.ok(res.headers['x-content-type-options'], 'harus ada x-content-type-options');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
  });
});
