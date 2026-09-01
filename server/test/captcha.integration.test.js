// ============================================================================
// test/captcha.integration.test.js
// Integration test — GET /api/auth/captcha tanpa MongoDB
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

describe('GET /api/auth/captcha', () => {
  test('return 200 + captchaId + SVG image', async () => {
    const res = await request(app).get('/api/auth/captcha');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(typeof res.body.data.captchaId, 'string');
    assert.ok(res.body.data.captchaId.length > 0);
    assert.equal(typeof res.body.data.image, 'string');
    assert.ok(res.body.data.image.startsWith('data:image/svg+xml;base64,'));
  });

  test('tiap request menghasilkan captchaId unik', async () => {
    const a = await request(app).get('/api/auth/captcha');
    const b = await request(app).get('/api/auth/captcha');
    assert.notEqual(a.body.data.captchaId, b.body.data.captchaId);
  });
});
