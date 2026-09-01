// prediksi_override — audit trail hasil prediksi yang di-override admin
// Referensi skema: memory/01-database-design.md §2.10
// Nama field snake_case PERSIS sesuai requirement (nama_event, tahun_prediksi, anggaran_final, catatan).

import mongoose from 'mongoose';

const prediksiOverrideSchema = new mongoose.Schema(
  {
    nama_event: { type: String, required: [true, 'Nama event wajib diisi'], trim: true },
    tahun_prediksi: { type: Number, required: [true, 'Tahun prediksi wajib diisi'], min: [2000, 'Tahun tidak valid'] },
    anggaran_final: {
      type: Number,
      required: [true, 'Anggaran final wajib diisi'],
      min: [0, 'Anggaran tidak boleh negatif'],
    },
    catatan: { type: String, trim: true, default: null },
    dibuat_oleh: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

prediksiOverrideSchema.index({ nama_event: 1, tahun_prediksi: -1, createdAt: -1 });

export const PrediksiOverride = mongoose.model('PrediksiOverride', prediksiOverrideSchema);