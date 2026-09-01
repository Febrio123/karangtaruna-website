// routes/prediksi.routes.js — prediksi anggaran WMA + override

import { Router } from 'express';
import { body, param } from 'express-validator';
import * as prediksiController from '../controllers/prediksiController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { prediksiLimiter } from '../middleware/rateLimit.js';
import { ROLE_PARAMETER } from '../utils/constants.js';

const router = Router();

const namaEventRule = param('nama_event').trim().notEmpty().withMessage('nama_event wajib diisi');

/** GET /api/prediksi-anggaran/:nama_event — hitung prediksi (publik / opsional) */
router.get(
  '/:nama_event',
  prediksiLimiter,
  validate([namaEventRule]),
  prediksiController.hitung
);

/** GET /api/prediksi-anggaran/:nama_event/riwayat-override — histori override (publik) */
router.get(
  '/:nama_event/riwayat-override',
  validate([namaEventRule]),
  prediksiController.riwayatOverride
);

/** POST /api/prediksi-anggaran/:nama_event/override — protected (ketua/wakil) */
router.post(
  '/:nama_event/override',
  verifyAccessToken,
  roleGuard(...ROLE_PARAMETER),
  validate([
    namaEventRule,
    body('tahun_prediksi').isInt({ min: 2000, max: 2100 }).withMessage('tahun_prediksi tidak valid'),
    body('anggaran_final').isFloat({ min: 0 }).withMessage('anggaran_final angka >= 0'),
    body('catatan').optional().trim(),
  ]),
  prediksiController.override
);

export default router;