// anggaran_event — histori anggaran per event per tahun (input prediksi WMA)
// Referensi skema: memory/01-database-design.md §2.8
// Nama field snake_case PERSIS sesuai requirement (nama_event, tahun, anggaran).

import mongoose from 'mongoose';

const anggaranEventSchema = new mongoose.Schema(
  {
    nama_event: { type: String, required: [true, 'Nama event wajib diisi'], trim: true },
    tahun: { type: Number, required: [true, 'Tahun wajib diisi'], min: [2000, 'Tahun tidak valid'] },
    anggaran: {
      type: Number,
      required: [true, 'Anggaran wajib diisi'],
      min: [0, 'Anggaran tidak boleh negatif'],
    },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    sumber: {
      type: String,
      enum: { values: ['manual', 'dari-event'], message: 'Sumber harus manual atau dari-event' },
      default: 'manual',
    },
  },
  { timestamps: true }
);

// Satu anggaran per event per tahun
anggaranEventSchema.index({ nama_event: 1, tahun: 1 }, { unique: true });
anggaranEventSchema.index({ tahun: 1 });

export const AnggaranEvent = mongoose.model('AnggaranEvent', anggaranEventSchema);