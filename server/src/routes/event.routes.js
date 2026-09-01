// routes/event.routes.js

import { Router } from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/eventController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { ROLE_CONTENT, EVENT_TYPE, EVENT_STATUS } from '../utils/constants.js';

const router = Router();

const eventRules = [
  body('title').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('type').optional().isIn(EVENT_TYPE).withMessage(`Tipe harus ${EVENT_TYPE.join(' atau ')}`),
  body('date').optional().isISO8601().withMessage('Tanggal format YYYY-MM-DD'),
  body('status').optional().isIn(EVENT_STATUS).withMessage(`Status harus ${EVENT_STATUS.join(' atau ')}`),
  body('time').optional().trim(),
  body('location').optional().trim(),
  body('description').optional().trim(),
  body('budget.amount').optional().isFloat({ min: 0 }).withMessage('Anggaran angka >= 0'),
  body('budget.label').optional().trim(),
  body('isPublished').optional().isBoolean().withMessage('isPublished harus boolean'),
];

/** GET /api/events — publik */
router.get('/', eventController.list);

/** GET /api/events/:id — publik */
router.get('/:id', eventController.getById);

/** POST /api/events — protected (ketua/wakil/sekretaris) */
router.post(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_CONTENT),
  uploadImage.single('image'),
  validate(eventRules),
  eventController.create
);

/** PUT /api/events/:id — protected */
router.put(
  '/:id',
  verifyAccessToken,
  roleGuard(...ROLE_CONTENT),
  uploadImage.single('image'),
  validate(eventRules.map((rule) => rule.optional({ values: 'falsy' }))),
  eventController.update
);

/** DELETE /api/events/:id — protected */
router.delete('/:id', verifyAccessToken, roleGuard(...ROLE_CONTENT), eventController.remove);

export default router;