// ============================================================================
// test/health.integration.test.js
// Integration test — GET /api/health tanpa MongoDB (app.js tidak konek DB)
// Jalankan: npm test
// ============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Setup env SEBELUM import app
process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_integration_testing_32ch';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_integration_testing32ch';
process.env.NODE_ENV = 'development';

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');

describe('GET /api/health', () => {
  test('return 200 + status:"success" + service info', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.service, 'Karang Taruna API');
    assert.equal(typeof res.body.data.uptime, 'number');
    assert.equal(typeof res.body.data.timestamp, 'string');
    assert.equal(res.body.data.env, 'development');
  });

  test('health check TIDAK terpengaruh rate limit', async () => {
    // Kirim banyak request health — harus selalu 200 (rate limit bypass)
    const promises = Array.from({ length: 20 }, () => request(app).get('/api/health'));
    const results = await Promise.all(promises);
    for (const r of results) {
      assert.equal(r.status, 200, `health request harus 200, got ${r.status}`);
    }
  });
});
