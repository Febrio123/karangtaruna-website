// galeri — galeri foto/video kegiatan (koleksi: galeri)
// Referensi skema: memory/01-database-design.md §2.5 + UserUI/src/data/gallery.js

import mongoose from 'mongoose';
import { GALERI_TYPE } from '../utils/constants.js';

const galeriSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Judul galeri wajib diisi'], trim: true },
    category: { type: String, required: [true, 'Kategori wajib diisi'], trim: true },
    year: { type: String, trim: true, default: null }, // misal "2026" (filter)
    type: {
      type: String,
      required: [true, 'Tipe wajib diisi'],
      enum: { values: GALERI_TYPE, message: 'Tipe harus image atau video' },
      default: 'image',
    },
    description: { type: String, trim: true, default: null },
    media: {
      public_id: { type: String, default: null },
      secure_url: { type: String, default: null },
    },
    imageAlt: { type: String, trim: true, default: null },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

galeriSchema.index({ category: 1, year: -1 });
galeriSchema.index({ type: 1 });
galeriSchema.index({ year: -1 });

export const Galeri = mongoose.model('Galeri', galeriSchema);