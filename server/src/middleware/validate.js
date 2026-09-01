// Wrapper validasi express-validator: jalankan rules lalu format error terpusat.

import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * validate([ ...body('x').notEmpty() ]) — middleware yang menjalankan
 * semua rule dan melempar ApiError(400) bila ada field tidak valid.
 */
export const validate = (validations) => async (req, _res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));

  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true }).map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }));
    return next(new ApiError(400, 'Validasi gagal. Periksa kembali input Anda.', { details: errors }));
  }
  return next();
};