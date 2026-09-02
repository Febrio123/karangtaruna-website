// routes/index.js — mount semua route di bawah /api

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import pengurusRoutes from './pengurus.routes.js';
import articleRoutes from './article.routes.js';
import eventRoutes from './event.routes.js';
import galeriRoutes from './galeri.routes.js';
import { transaksiRouter, anggaranEventRouter } from './anggaran.routes.js';
import siteConfigRoutes from './siteConfig.routes.js';
import parameterRoutes from './parameter.routes.js';
import prediksiRoutes from './prediksi.routes.js';
import userRoutes from './users.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      service: 'Karang Taruna API',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/pengurus', pengurusRoutes);
router.use('/articles', articleRoutes);
router.use('/events', eventRoutes);
router.use('/galeri', galeriRoutes);
router.use('/transaksi-anggaran', transaksiRouter);
router.use('/anggaran-event', anggaranEventRouter);
router.use('/site-config', siteConfigRoutes);
router.use('/parameter-ekonomi', parameterRoutes);
router.use('/prediksi-anggaran', prediksiRoutes);
router.use('/users', userRoutes);

export default router;