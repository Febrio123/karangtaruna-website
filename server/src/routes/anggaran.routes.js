// routes/anggaran.routes.js — transaksi kas + histori anggaran event
// Mengekspor DUA router agar bisa di-mount dengan prefix berbeda:
//   /api/transaksi-anggaran/*  -> transaksiRouter
//   /api/anggaran-event/*      -> anggaranEventRouter

import { Router } from 'express';
import { body } from 'express-validator';
import * as anggaranController from '../controllers/anggaranController.js';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken, roleGuard } from '../middleware/auth.js';
import { ROLE_ANGGARAN, TRANSAKSI_JENIS } from '../utils/constants.js';

const transaksiRules = [
  body('tahun').isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid'),
  body('jenis').isIn(TRANSAKSI_JENIS).withMessage(`Jenis harus ${TRANSAKSI_JENIS.join(' atau ')}`),
  body('jumlah').isFloat({ min: 0 }).withMessage('Jumlah angka >= 0'),
  body('deskripsi').trim().notEmpty().withMessage('Deskripsi wajib diisi'),
  body('kategori').optional().trim(),
  body('tanggal').optional().isISO8601().withMessage('Tanggal format YYYY-MM-DD'),
  body('eventId').optional().isMongoId().withMessage('eventId tidak valid'),
];

// ---------------------------------------------------------------------------
// Router transaksi kas — mount di /api/transaksi-anggaran
// ---------------------------------------------------------------------------
const transaksiRouter = Router();

/** GET /api/transaksi-anggaran — publik */
transaksiRouter.get('/', anggaranController.listTransaksi);

/** GET /api/transaksi-anggaran/ringkasan — publik (harus sebelum /:id) */
transaksiRouter.get('/ringkasan', anggaranController.ringkasan);

/** POST /api/transaksi-anggaran — protected (ketua/wakil/bendahara) */
transaksiRouter.post(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_ANGGARAN),
  validate(transaksiRules),
  anggaranController.createTransaksi
);

/** PUT /api/transaksi-anggaran/:id — protected */
transaksiRouter.put(
  '/:id',
  verifyAccessToken,
  roleGuard(...ROLE_ANGGARAN),
  validate(transaksiRules.map((rule) => rule.optional({ values: 'falsy' }))),
  anggaranController.updateTransaksi
);

/** DELETE /api/transaksi-anggaran/:id — protected */
transaksiRouter.delete('/:id', verifyAccessToken, roleGuard(...ROLE_ANGGARAN), anggaranController.removeTransaksi);

// ---------------------------------------------------------------------------
// Router anggaran event — mount di /api/anggaran-event
// ---------------------------------------------------------------------------
const anggaranEventRouter = Router();

/** GET /api/anggaran-event — publik; ?nama_event= (output PERSIS requirement) */
anggaranEventRouter.get('/', anggaranController.listAnggaranEvent);

/** GET /api/anggaran-event/nama — daftar nama event unik (dropdown). */
anggaranEventRouter.get('/nama', anggaranController.listNamaEvent);

/** POST /api/anggaran-event — protected; input manual histori { nama_event, tahun, anggaran } */
anggaranEventRouter.post(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_ANGGARAN),
  validate([
    body('nama_event').trim().notEmpty().withMessage('nama_event wajib diisi'),
    body('tahun').isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid'),
    body('anggaran').isFloat({ min: 0 }).withMessage('Anggaran angka >= 0'),
  ]),
  anggaranController.createAnggaranEvent
);

/** DELETE /api/anggaran-event — protected; hapus histori { ?nama_event=&tahun= } */
anggaranEventRouter.delete(
  '/',
  verifyAccessToken,
  roleGuard(...ROLE_ANGGARAN),
  anggaranController.removeAnggaranEvent
);

export { transaksiRouter, anggaranEventRouter };