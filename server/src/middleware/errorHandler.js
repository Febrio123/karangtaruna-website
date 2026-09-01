// Error handling terpusat: 404 untuk route tak dikenal + formatter error JSON.

import mongoose from 'mongoose';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server.';
  let details = err.details || null;
  let code = err.code || null;

  // Normalisasi error umum menjadi respons API
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validasi data gagal.';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Format ID tidak valid.';
  } else if (err.code === 11000 || err.code === 11001) {
    statusCode = 409;
    message = 'Data sudah ada (duplikat). Periksa field unik.';
    details = Object.keys(err.keyPattern || {}).map((k) => ({ field: k, message: `Nilai "${k}" sudah dipakai.` }));
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran file melebihi batas maksimum.' : `Upload gagal: ${err.message}`;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Body request bukan JSON yang valid.';
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== 'development') {
    message = 'Terjadi kesalahan pada server.';
    details = null;
    console.error('[error]', err);
  } else if (statusCode >= 500) {
    console.error('[error]', err);
  }

  const body = { status: 'error', message };
  if (code) body.code = code;
  if (details) body.details = details;

  return res.status(statusCode).json(body);
}