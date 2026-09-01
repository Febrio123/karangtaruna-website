// parameter_ekonomi — persentase inflasi per tahun (input manual admin)
// Referensi skema: memory/01-database-design.md §2.9
// Nama field snake_case PERSIS sesuai requirement (tahun, persentase_inflasi).

import mongoose from 'mongoose';

const parameterEkonomiSchema = new mongoose.Schema(
  {
    tahun: {
      type: Number,
      required: [true, 'Tahun wajib diisi'],
      min: [2000, 'Tahun tidak valid'],
    },
    persentase_inflasi: {
      type: Number,
      required: [true, 'Persentase inflasi wajib diisi'],
      min: [-5, 'Inflasi di luar rentang wajar'],
      max: [100, 'Inflasi di luar rentang wajar'],
    },
  },
  { timestamps: true }
);

parameterEkonomiSchema.index({ tahun: 1 }, { unique: true });

export const ParameterEkonomi = mongoose.model('ParameterEkonomi', parameterEkonomiSchema);