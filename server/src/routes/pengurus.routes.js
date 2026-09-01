// routes/pengurus.routes.js

import { Router } from 'express';
import { body } from 'express-validator';
import * as pengurusController from '../controllers/pengurusController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { ROLES, ROLE_PENGURUS } from '../utils/constants.js';

const router = Router();

const pengurusRules = [
  body('nama').trim().notEmpty().withMessage('Nama wajib diisi'),
  body('jabatan').trim().notEmpty().withMessage('Jabatan wajib diisi'),
  body('periode').matches(/^\d{4}-\d{4}$/).withMessage('Periode format YYYY-YYYY'),
  body('role').isIn(ROLES).withMessage(`Role harus salah satu dari: ${ROLES.join(', ')}`),
  body('level').isInt({ min: 1, max: 3 }).withMessage('Level 1-3'),
  body('urutan').optional().isInt({ min: 0 }).withMessage('Urutan angka >= 0'),
  body('bidang').optional().trim(),
  body('telepon').optional().trim(),
  body('email').optional().isEmail().withMessage('Email tidak valid'),
];

/** GET /api/pengurus — publik */
router.get('/', pengurusController.list);

/** GET /api/pengurus/:id — publik */
router.get('/:id', pengurusController.getById);

/** POST /api/pengurus — protected (ketua/wakil) */
router.post(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_PENGURUS),
  uploadImage.single('foto'),
  validate(pengurusRules),
  pengurusController.create
);

/** PUT /api/pengurus/:id — protected (ketua/wakil) */
router.put(
  '/:id',
  verifyAccessToken,
  roleGuard(...ROLE_PENGURUS),
  uploadImage.single('foto'),
  validate(pengurusRules.map((rule) => rule.optional({ values: 'falsy' }))),
  pengurusController.update
);

/** DELETE /api/pengurus/:id — protected (ketua/wakil) */
router.delete('/:id', verifyAccessToken, roleGuard(...ROLE_PENGURUS), pengurusController.remove);

export default router;