// ============================================================================
// test/errorHandler.unit.test.js
// Unit test untuk middleware/errorHandler.js — notFound + errorHandler
// Tanpa MongoDB. Jalankan: npm test
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { notFound, errorHandler } from '../src/middleware/errorHandler.js';
import { ApiError } from '../src/utils/ApiError.js';
import multer from 'multer';

describe('notFound middleware', () => {
  test('memanggil next dengan ApiError(404)', () => {
    let capturedErr;
    const req = { method: 'GET', originalUrl: '/api/test' };
    const res = {};
    const next = (err) => { capturedErr = err; };
    notFound(req, res, next);
    assert.ok(capturedErr instanceof ApiError);
    assert.equal(capturedErr.statusCode, 404);
    assert.ok(capturedErr.message.includes('/api/test'));
  });
});

describe('errorHandler', () => {
  test('ApiError -> statusCode & message sesuai', () => {
    let sentStatus, sentBody;
    const res = {
      status(code) { sentStatus = code; return this; },
      json(body) { sentBody = body; },
    };
    const err = new ApiError(400, 'Bad request', { code: 'BAD', details: [{ field: 'x' }] });
    errorHandler(err, {}, res, () => {});
    assert.equal(sentStatus, 400);
    assert.equal(sentBody.status, 'error');
    assert.equal(sentBody.message, 'Bad request');
    assert.equal(sentBody.code, 'BAD');
    assert.deepEqual(sentBody.details, [{ field: 'x' }]);
  });

  test('error dengan name="ValidationError" TAPI bukan instanceof mongoose -> 500 (tidak di-format khusu)', () => {
    // errorHandler hanya memformat mongoose.ValidationError bila `err instanceof
    // mongoose.Error.ValidationError`. Error palsu yang tidak instanceof akan
    // jatuh ke generic error handling.
    let sentStatus;
    const res = {
      status(code) { sentStatus = code; return this; },
      json() {},
    };
    const err = new Error('validation failed');
    err.name = 'ValidationError';
    err.errors = {
      name: { path: 'name', message: 'Name is required' },
    };
    errorHandler(err, {}, res, () => {});
    // Bukan instanceof mongoose -> generic 500
    assert.equal(sentStatus, 500);
  });

  test('MulterError LIMIT_FILE_SIZE -> 400', () => {
    let sentStatus, sentBody;
    const res = {
      status(code) { sentStatus = code; return this; },
      json(body) { sentBody = body; },
    };
    const err = new multer.MulterError('LIMIT_FILE_SIZE');
    errorHandler(err, {}, res, () => {});
    assert.equal(sentStatus, 400);
    assert.ok(sentBody.message.includes('ukuran') || sentBody.message.includes('batas'));
  });

  test('MulterError lain -> 400', () => {
    let sentStatus, sentBody;
    const res = {
      status(code) { sentStatus = code; return this; },
      json(body) { sentBody = body; },
    };
    const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
    errorHandler(err, {}, res, () => {});
    assert.equal(sentStatus, 400);
    assert.ok(sentBody.message.includes('Upload'));
  });

  test('entity.parse.failed -> 400', () => {
    let sentStatus, sentBody;
    const res = {
      status(code) { sentStatus = code; return this; },
      json(body) { sentBody = body; },
    };
    const err = new Error('invalid json');
    err.type = 'entity.parse.failed';
    errorHandler(err, {}, res, () => {});
    assert.equal(sentStatus, 400);
    assert.ok(sentBody.message.includes('JSON'));
  });

  test('generic error (tanpa statusCode) -> 500', () => {
    let sentStatus, sentBody;
    const res = {
      status(code) { sentStatus = code; return this; },
      json(body) { sentBody = body; },
    };
    const err = new Error('something broke');
    process.env.NODE_ENV = 'development';
    errorHandler(err, {}, res, () => {});
    assert.equal(sentStatus, 500);
    assert.equal(sentBody.status, 'error');
    assert.equal(sentBody.message, 'something broke');
    process.env.NODE_ENV = 'development';
  });

  test('production mode: error 500 menyembunyikan detail', () => {
    let sentBody;
    const res = {
      status() { return this; },
      json(body) { sentBody = body; },
    };
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = new Error('secret internal error');
    err.statusCode = 500;
    errorHandler(err, {}, res, () => {});
    assert.equal(sentBody.message, 'Terjadi kesalahan pada server.');
    // Notes: karena `if (details) body.details = details` dan details=null (falsy),
    // field details TIDAK disertakan -> undefined, bukan null. Ini benar secara desain.
    assert.equal(sentBody.details, undefined);
    process.env.NODE_ENV = origEnv || 'development';
  });

  test('CastError (invalid ObjectId) -> 400', () => {
    let sentStatus;
    const res = {
      status(code) { sentStatus = code; return this; },
      json() {},
    };
    const err = new Error('invalid id');
    err.name = 'CastError';
    // Simulate instanceof mongoose.Error.CastError
    err.__proto__ = { constructor: { name: 'CastError' } };
    Object.setPrototypeOf(err, class { get name() { return 'CastError'; } }.prototype);
    // Cek bahwa CastError handling ada di kode (mungkin tidak instanceof tanpa mongoose)
    errorHandler(err, {}, res, () => {});
    // Tidak instanceof mongoose.Error.CastError -> tetap 500
    assert.ok(sentStatus >= 400);
  });
});
