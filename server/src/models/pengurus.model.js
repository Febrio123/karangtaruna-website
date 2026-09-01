// pengurus — struktur organisasi & daftar pengurus (koleksi: pengurus)
// Referensi skema: memory/01-database-design.md §2.2 + shared/team.js

import mongoose from 'mongoose';
import { ROLES } from '../utils/constants.js';

const pengurusSchema = new mongoose.Schema(
  {
    nama: { type: String, required: [true, 'Nama pengurus wajib diisi'], trim: true },
    jabatan: { type: String, required: [true, 'Jabatan wajib diisi'], trim: true },
    bidang: {
      type: String,
      default: '-',
      trim: true,
      // '-' dipakai pengurus inti; koordinator wajib memilih dari bidangList
    },
    periode: {
      type: String,
      required: [true, 'Periode wajib diisi'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Format periode harus YYYY-YYYY'],
    },
    role: {
      type: String,
      required: [true, 'Role wajib diisi'],
      enum: { values: ROLES, message: 'Role tidak valid' },
    },
    telepon: { type: String, trim: true, default: null },
    level: {
      type: Number,
      required: [true, 'Level wajib diisi'],
      min: [1, 'Level minimal 1'],
      max: [3, 'Level maksimal 3'],
      // 1=ketua, 2=wakil/sekretaris/bendahara, 3=koordinator bidang
    },
    urutan: { type: Number, default: 0 },
    email: { type: String, trim: true, lowercase: true, default: null },
    foto: {
      public_id: { type: String, default: null },
      secure_url: { type: String, default: null },
    },
  },
  { timestamps: true }
);

// Urutan tampil bagan: level naik, lalu urutan
pengurusSchema.index({ level: 1, urutan: 1 });
pengurusSchema.index({ role: 1 });
pengurusSchema.index({ periode: 1 });

export const Pengurus = mongoose.model('Pengurus', pengurusSchema);