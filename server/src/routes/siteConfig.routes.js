// routes/siteConfig.routes.js

import { Router } from 'express';
import { body } from 'express-validator';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { ROLE_SITE_CONFIG } from '../utils/constants.js';
import { validate } from '../middleware/validate.js';
import * as siteConfigController from '../controllers/siteConfigController.js';

const router = Router();

/** GET /api/site-config — publik */
router.get('/', siteConfigController.get);

/**
 * PUT /api/site-config — protected (ketua/wakil/sekretaris).
 * Validasi tipe top-level ringan; konten & whitelist di-handle controller.
 */
router.put(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_SITE_CONFIG),
  validate([
    body('name').optional().isString().withMessage('name harus string'),
    body('shortName').optional().isString().withMessage('shortName harus string'),
    body('tagline').optional().isString().withMessage('tagline harus string'),
    body('address').optional().isString().withMessage('address harus string'),
    body('phone').optional().isString().withMessage('phone harus string'),
    body('email').optional().isEmail().withMessage('email tidak valid'),
    body('operatingHours').optional().isString().withMessage('operatingHours harus string'),
    body('socialMedia').optional().isObject().withMessage('socialMedia harus objek'),
    body('map').optional().isObject().withMessage('map harus objek'),
    body('stats').optional().isObject().withMessage('stats harus objek'),
    body('vision').optional().isString().withMessage('vision harus string'),
    body('mission').optional().isArray().withMessage('mission harus array'),
    body('history').optional().isObject().withMessage('history harus objek'),
    body('information').optional().isArray().withMessage('information harus array'),
  ]),
  siteConfigController.update
);

export default router;