// routes/article.routes.js

import { Router } from 'express';
import { body } from 'express-validator';
import * as articleController from '../controllers/articleController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { ROLE_CONTENT } from '../utils/constants.js';

const router = Router();

const articleRules = [
  body('title').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('category').trim().notEmpty().withMessage('Kategori wajib diisi'),
  body('author').trim().notEmpty().withMessage('Penulis wajib diisi'),
  body('content').notEmpty().withMessage('Isi artikel wajib diisi'),
  body('slug').optional().trim().isSlug().withMessage('Slug hanya huruf kecil, angka, dan tanda hubung'),
  body('date').optional().isISO8601().withMessage('Tanggal format YYYY-MM-DD'),
  body('excerpt').optional().trim(),
  body('imageAlt').optional().trim(),
  body('isPublished').optional().isBoolean().withMessage('isPublished harus boolean'),
];

/** GET /api/articles — publik */
router.get('/', articleController.list);

/** GET /api/articles/slug/:slug — publik */
router.get('/slug/:slug', articleController.getBySlug);

/** GET /api/articles/:id — publik */
router.get('/:id', articleController.getById);

/** POST /api/articles — protected (ketua/wakil/sekretaris) */
router.post(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_CONTENT),
  uploadImage.single('cover'),
  validate(articleRules),
  articleController.create
);

/** PUT /api/articles/:id — protected */
router.put(
  '/:id',
  verifyAccessToken,
  roleGuard(...ROLE_CONTENT),
  uploadImage.single('cover'),
  validate(articleRules.map((rule) => rule.optional({ values: 'falsy' }))),
  articleController.update
);

/** DELETE /api/articles/:id — protected */
router.delete('/:id', verifyAccessToken, roleGuard(...ROLE_CONTENT), articleController.remove);

export default router;