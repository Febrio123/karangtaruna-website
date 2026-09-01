// ============================================================================
// test/error-response.utils.test.js
// Unit test untuk utils/ApiError.js dan utils/ApiResponse.js
// Tanpa MongoDB. Jalankan: npm test
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, isApiError } from '../src/utils/ApiError.js';
import { ApiResponse } from '../src/utils/ApiResponse.js';

// ---- ApiError ----
describe('ApiError', () => {
  test('membuat error dengan statusCode & message', () => {
    const err = new ApiError(404, 'Not found');
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, 'Not found');
    assert.equal(err.name, 'ApiError');
    assert.equal(err.isOperational, true);
    assert.ok(err instanceof Error);
  });

  test('code & details opsional', () => {
    const err = new ApiError(400, 'Validation failed', {
      code: 'VALIDATION_ERROR',
      details: [{ field: 'email', message: 'invalid' }],
    });
    assert.equal(err.code, 'VALIDATION_ERROR');
    assert.deepEqual(err.details, [{ field: 'email', message: 'invalid' }]);
  });

  test('code & details default null', () => {
    const err = new ApiError(500, 'Server error');
    assert.equal(err.code, null);
    assert.equal(err.details, null);
  });

  test('isApiError mengenali ApiError', () => {
    const err = new ApiError(401, 'Unauthorized');
    assert.equal(isApiError(err), true);
  });

  test('isApiError menolak Error biasa', () => {
    assert.equal(isApiError(new Error('test')), false);
  });

  test('isApiError menolak non-Error', () => {
    assert.equal(isApiError('string'), false);
    assert.equal(isApiError(null), false);
    assert.equal(isApiError(42), false);
  });
});

// ---- ApiResponse ----
describe('ApiResponse', () => {
  test('success mengirim status 200 + body {status:"success", data}', () => {
    let sentStatus, sentBody;
    const res = {
      status(code) { sentStatus = code; return this; },
      json(body) { sentBody = body; },
    };
    ApiResponse.success(res, { id: 1 }, 'OK');
    assert.equal(sentStatus, 200);
    assert.equal(sentBody.status, 'success');
    assert.deepEqual(sentBody.data, { id: 1 });
    assert.equal(sentBody.message, 'OK');
  });

  test('success tanpa message -> body tanpa field message', () => {
    let sentBody;
    const res = {
      status() { return this; },
      json(body) { sentBody = body; },
    };
    ApiResponse.success(res, 'data');
    assert.equal(sentBody.message, undefined);
    assert.equal(sentBody.data, 'data');
  });

  test('success tanpa data -> body tanpa field data', () => {
    let sentBody;
    const res = {
      status() { return this; },
      json(body) { sentBody = body; },
    };
    ApiResponse.success(res);
    assert.equal(sentBody.data, undefined);
  });

  test('success data null -> body tanpa field data', () => {
    let sentBody;
    const res = {
      status() { return this; },
      json(body) { sentBody = body; },
    };
    ApiResponse.success(res, null);
    assert.equal(sentBody.data, undefined);
  });

  test('created mengirim status 201', () => {
    let sentStatus;
    const res = {
      status(code) { sentStatus = code; return this; },
      json() {},
    };
    ApiResponse.created(res, { id: 'new' }, 'Created');
    assert.equal(sentStatus, 201);
  });

  test('custom statusCode', () => {
    let sentStatus;
    const res = {
      status(code) { sentStatus = code; return this; },
      json() {},
    };
    ApiResponse.success(res, null, 'Partial', 206);
    assert.equal(sentStatus, 206);
  });
});
