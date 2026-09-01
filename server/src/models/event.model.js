// events — event & pengumuman (koleksi: events)
// Referensi skema: memory/01-database-design.md §2.4 + UserUI/src/data/events.js

import mongoose from 'mongoose';
import { EVENT_TYPE, EVENT_STATUS } from '../utils/constants.js';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Judul event wajib diisi'], trim: true },
    slug: { type: String, trim: true, lowercase: true },
    type: {
      type: String,
      required: [true, 'Tipe wajib diisi'],
      enum: { values: EVENT_TYPE, message: 'Tipe harus event atau pengumuman' },
      default: 'event',
    },
    date: { type: Date, required: [true, 'Tanggal event wajib diisi'] },
    year: { type: Number, default: null }, // turunan date.getFullYear() untuk prediksi
    time: { type: String, trim: true, default: null }, // misal "14:00 WIB"
    location: { type: String, trim: true, default: null },
    status: {
      type: String,
      required: [true, 'Status wajib diisi'],
      enum: { values: EVENT_STATUS, message: 'Status harus Mendatang atau Selesai' },
      default: 'Mendatang',
    },
    description: { type: String, trim: true, default: null },
    image: {
      public_id: { type: String, default: null },
      secure_url: { type: String, default: null },
    },
    budget: {
      amount: { type: Number, default: 0, min: [0, 'Anggaran tidak boleh negatif'] },
      label: { type: String, trim: true, default: null },
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventSchema.index({ type: 1, status: 1, date: -1 });
eventSchema.index({ year: 1 });
eventSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Set year = tahun dari date; timpa label budget bila belum diisi
eventSchema.pre('validate', function deriveYear(next) {
  if (this.date) this.year = new Date(this.date).getFullYear();
  if (this.budget?.amount && !this.budget.label) {
    this.budget.label = `Total anggaran acara Rp ${Number(this.budget.amount).toLocaleString('id-ID')}`;
  }
  next();
});

// Auto slug bila kosong
eventSchema.pre('validate', function ensureSlug(next) {
  if (!this.slug && this.title) {
    this.slug = `${this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')}-${this.year || ''}`;
  }
  next();
});

export const Event = mongoose.model('Event', eventSchema);