// transaksi_anggaran — kas organisasi, satu dokumen per transaksi (koleksi: transaksi_anggaran)
// Referensi skema: memory/01-database-design.md §2.6 + UserUI/src/data/budget.js

import mongoose from 'mongoose';
import { TRANSAKSI_JENIS } from '../utils/constants.js';

const transaksiAnggaranSchema = new mongoose.Schema(
  {
    tahun: { type: Number, required: [true, 'Tahun wajib diisi'], min: [2000, 'Tahun tidak valid'], max: [2100, 'Tahun tidak valid'] },
    jenis: {
      type: String,
      required: [true, 'Jenis wajib diisi'],
      enum: { values: TRANSAKSI_JENIS, message: 'Jenis harus pemasukan atau pengeluaran' },
    },
    kategori: { type: String, trim: true, default: null }, // Iuran, Donasi, Sponsor, Operasional, Kegiatan...
    tanggal: { type: Date, required: [true, 'Tanggal transaksi wajib diisi'], default: Date.now },
    deskripsi: { type: String, required: [true, 'Deskripsi wajib diisi'], trim: true },
    jumlah: {
      type: Number,
      required: [true, 'Jumlah wajib diisi'],
      min: [0, 'Jumlah tidak boleh negatif'],
    },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  },
  { timestamps: true }
);

transaksiAnggaranSchema.index({ tahun: 1, jenis: 1, tanggal: -1 });
transaksiAnggaranSchema.index({ tahun: 1, kategori: 1 });

export const TransaksiAnggaran = mongoose.model('TransaksiAnggaran', transaksiAnggaranSchema);