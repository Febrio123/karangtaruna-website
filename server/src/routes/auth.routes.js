// routes/auth.routes.js

import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { ROLES, ROLE_REGISTER } from '../utils/constants.js';

const router = Router();

/** POST /api/auth/register — protected (ketua/wakil-ketua) */
router.post(
  '/register',
  verifyAccessToken,
  roleGuard(...ROLE_REGISTER),
  validate([
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username 3-30 karakter'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6, max: 72 }).withMessage('Password 6-72 karakter'),
    body('role').optional().isIn(ROLES).withMessage(`Role harus salah satu dari: ${ROLES.join(', ')}`),
  ]),
  authController.register
);

/** POST /api/auth/login — publik (rate limited) */
router.post(
  '/login',
  loginLimiter,
  validate([
    body('username').trim().notEmpty().withMessage('Username wajib diisi'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
    body('remember').optional().isBoolean().withMessage('remember harus boolean'),
  ]),
  authController.login
);

/** POST /api/auth/refresh — publik (via cookie httpOnly) */
router.post('/refresh', authController.refresh);

/** POST /api/auth/logout — public (revoke cookie) */
router.post('/logout', authController.logout);

/** GET /api/auth/me — protected */
router.get('/me', verifyAccessToken, authController.me);

export default router;