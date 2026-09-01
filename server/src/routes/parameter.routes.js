// routes/parameter.routes.js — parameter ekonomi (inflasi per tahun)

import { Router } from 'express';
import { body } from 'express-validator';
import * as parameterController from '../controllers/parameterController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { ROLE_PARAMETER } from '../utils/constants.js';

const router = Router();

const parameterRules = [
  body('tahun').isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid'),
  body('persentase_inflasi').isFloat({ min: -5, max: 100 }).withMessage('Persentase inflasi harus angka (misal 2.8)'),
];

/** GET /api/parameter-ekonomi — publik */
router.get('/', parameterController.list);

/** GET /api/parameter-ekonomi/:tahun — publik */
router.get('/:tahun', parameterController.getByTahun);

/** POST /api/parameter-ekonomi — protected (ketua/wakil) */
router.post(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_PARAMETER),
  validate(parameterRules),
  parameterController.create
);

/** PUT /api/parameter-ekonomi/:id — protected */
router.put(
  '/:id',
  verifyAccessToken,
  roleGuard(...ROLE_PARAMETER),
  validate(parameterRules.map((rule) => rule.optional({ values: 'falsy' }))),
  parameterController.update
);

/** DELETE /api/parameter-ekonomi/:id — protected */
router.delete('/:id', verifyAccessToken, roleGuard(...ROLE_PARAMETER), parameterController.remove);

export default router;