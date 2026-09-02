// routes/users.routes.js — Kelola Akun User (RBAC: hanya ketua)
// Semua route: verifyAccessToken + roleGuard(...ROLE_USERS).

import { Router } from 'express';
import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import * as userController from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { ROLES, ROLE_USERS } from '../utils/constants.js';

const router = Router();

// Guard parameter :id harus ObjectId valid → 400 (bukan 500).
const objectIdRule = () =>
  param('id').custom((value) => {
    if (!mongoose.isValidObjectId(value)) {
      throw new Error('ID tidak valid.');
    }
    return true;
  });

// Aturan untuk POST / create.
const createRules = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username 3-30 karakter'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6, max: 72 }).withMessage('Password 6-72 karakter'),
  body('role').optional().isIn(ROLES).withMessage(`Role harus salah satu dari: ${ROLES.join(', ')}`),
  body('nama').optional().trim(),
  body('pengurusId').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (!mongoose.isValidObjectId(value)) throw new Error('pengurusId tidak valid.');
    return true;
  }),
];

// Aturan untuk PUT /:id update — semua field opsional.
const updateRules = [
  body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username 3-30 karakter'),
  body('email').optional().isEmail().withMessage('Email tidak valid'),
  body('role').optional().isIn(ROLES).withMessage(`Role harus salah satu dari: ${ROLES.join(', ')}`),
  body('nama').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive harus boolean'),
  body('pengurusId').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (!mongoose.isValidObjectId(value)) throw new Error('pengurusId tidak valid.');
    return true;
  }),
];

// Aturan untuk PUT /:id/password.
const passwordRules = [
  body('password').isLength({ min: 6, max: 72 }).withMessage('Password 6-72 karakter'),
];

/** GET /api/users — protected (ketua) */
router.get('/', verifyAccessToken, roleGuard(...ROLE_USERS), userController.list);

/** POST /api/users — protected (ketua) */
router.post(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_USERS),
  validate(createRules),
  userController.create
);

/** PUT /api/users/:id/password — protected (ketua) */
router.put(
  '/:id/password',
  verifyAccessToken,
  roleGuard(...ROLE_USERS),
  validate([objectIdRule(), ...passwordRules]),
  userController.changePassword
);

/** PUT /api/users/:id — protected (ketua) */
router.put(
  '/:id',
  verifyAccessToken,
  roleGuard(...ROLE_USERS),
  validate([objectIdRule(), ...updateRules]),
  userController.update
);

/** DELETE /api/users/:id — protected (ketua) */
router.delete(
  '/:id',
  verifyAccessToken,
  roleGuard(...ROLE_USERS),
  validate([objectIdRule()]),
  userController.remove
);

export default router;
