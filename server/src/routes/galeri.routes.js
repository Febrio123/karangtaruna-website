// routes/galeri.routes.js

import { Router } from 'express';
import { body } from 'express-validator';
import * as galeriController from '../controllers/galeriController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { uploadMedia } from '../middleware/upload.js';
import { ROLE_CONTENT, GALERI_TYPE } from '../utils/constants.js';

const router = Router();

const galeriRules = [
  body('title').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('category').trim().notEmpty().withMessage('Kategori wajib diisi'),
  body('type').optional().isIn(GALERI_TYPE).withMessage(`Tipe harus ${GALERI_TYPE.join(' atau ')}`),
  body('year').optional().trim(),
  body('description').optional().trim(),
  body('imageAlt').optional().trim(),
  body('isPublished').optional().isBoolean().withMessage('isPublished harus boolean'),
];

/** GET /api/galeri — publik */
router.get('/', galeriController.list);

/** GET /api/galeri/:id — publik */
router.get('/:id', galeriController.getById);

/** POST /api/galeri — protected; multipart: field `file` + metadata */
router.post(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_CONTENT),
  uploadMedia.single('file'),
  validate(galeriRules),
  galeriController.create
);

/** PUT /api/galeri/:id — protected; opsional ganti file */
router.put(
  '/:id',
  verifyAccessToken,
  roleGuard(...ROLE_CONTENT),
  uploadMedia.single('file'),
  validate(galeriRules.map((rule) => rule.optional({ values: 'falsy' }))),
  galeriController.update
);

/** DELETE /api/galeri/:id — protected */
router.delete('/:id', verifyAccessToken, roleGuard(...ROLE_CONTENT), galeriController.remove);

export default router;