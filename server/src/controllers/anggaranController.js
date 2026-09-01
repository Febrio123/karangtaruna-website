// controllers/anggaranController.js — transaksi kas + anggaran_event (histori prediksi)

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { TransaksiAnggaran } from '../models/transaksiAnggaran.model.js';
import { AnggaranEvent } from '../models/anggaranEvent.model.js';
import { safeSearchRegex } from '../utils/sanitize.js';
import { getCached, setCache, invalidateKey, invalidatePrefix } from '../utils/memoryCache.js';

const PAGE_SIZE_DEFAULT = 20;

// ---------------------------------------------------------------------------
// TRANSAKSI KAS
// ---------------------------------------------------------------------------

/** GET /api/transaksi-anggaran — publik; filter ?tahun=&jenis=&kategori=&q=&page=&limit= */
export const listTransaksi = asyncHandler(async (req, res) => {
  const { tahun, jenis, kategori, q, page = 1, limit = PAGE_SIZE_DEFAULT } = req.query;

  const filter = {};
  if (tahun) filter.tahun = Number(tahun);
  if (jenis) filter.jenis = jenis;
  if (kategori) filter.kategori = kategori;
  if (q) filter.deskripsi = safeSearchRegex(q);

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || PAGE_SIZE_DEFAULT));

  const [items, total] = await Promise.all([
    TransaksiAnggaran.find(filter).sort({ tanggal: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    TransaksiAnggaran.countDocuments(filter),
  ]);

  return ApiResponse.success(res, {
    items,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

/**
 * GET /api/transaksi-anggaran/ringkasan — publik.
 * Agregasi per tahun: total pemasukan/pengeluaran/saldo + rincian per bulan (utk chart)
 * + rincian per kategori.
 * Query opsional: ?tahun= (default tahun berjalan).
 */
export const ringkasan = asyncHandler(async (req, res) => {
  const tahun = Number(req.query.tahun) || new Date().getFullYear();

  // Agregasi ringkasan di-cache ringan (transaksi jarang berubah; halaman
  // transparansi sering dibuka publik). Di-invalidate saat transaksi di-CRUD.
  const cacheKey = `transaksi:ringkasan:${tahun}`;
  const cached = getCached(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const pipeline = [
    { $match: { tahun } },
    {
      $group: {
        _id: { jenis: '$jenis', bulan: { $month: '$tanggal' } },
        total: { $sum: '$jumlah' },
        jumlahTransaksi: { $sum: 1 },
      },
    },
  ];
  const rows = await TransaksiAnggaran.aggregate(pipeline);

  const perBulan = { pemasukan: [], pengeluaran: [] };
  for (let bulan = 1; bulan <= 12; bulan += 1) {
    perBulan.pemasukan.push({ bulan, total: 0, jumlahTransaksi: 0 });
    perBulan.pengeluaran.push({ bulan, total: 0, jumlahTransaksi: 0 });
  }
  rows.forEach((row) => {
    const jenis = row._id.jenis;
    const monthIdx = row._id.bulan - 1;
    if (jenis === 'pemasukan' || jenis === 'pengeluaran') {
      perBulan[jenis][monthIdx] = {
        bulan: row._id.bulan,
        total: row.total,
        jumlahTransaksi: row.jumlahTransaksi,
      };
    }
  });

  // Ringkasan total + per kategori
  const [totals, perKategori] = await Promise.all([
    TransaksiAnggaran.aggregate([
      { $match: { tahun } },
      { $group: { _id: '$jenis', total: { $sum: '$jumlah' }, jumlah: { $sum: 1 } } },
    ]),
    TransaksiAnggaran.aggregate([
      { $match: { tahun } },
      { $group: { _id: { jenis: '$jenis', kategori: '$kategori' }, total: { $sum: '$jumlah' }, jumlah: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
  ]);

  const totalPemasukan = totals.find((t) => t._id === 'pemasukan')?.total ?? 0;
  const totalPengeluaran = totals.find((t) => t._id === 'pengeluaran')?.total ?? 0;

  const result = {
    tahun,
    totalPemasukan,
    totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
    jumlahPemasukan: totals.find((t) => t._id === 'pemasukan')?.jumlah ?? 0,
    jumlahPengeluaran: totals.find((t) => t._id === 'pengeluaran')?.jumlah ?? 0,
    perBulan,
    perKategori: perKategori.map((k) => ({
      jenis: k._id.jenis,
      kategori: k._id.kategori || 'Umum',
      total: k.total,
      jumlah: k.jumlah,
    })),
  };

  setCache(cacheKey, result, 5 * 60 * 1000);
  return ApiResponse.success(res, result);
});

/** POST /api/transaksi-anggaran — protected (ketua/wakil/bendahara) */
export const createTransaksi = asyncHandler(async (req, res) => {
  const { tahun, jenis, kategori, tanggal, deskripsi, jumlah, eventId } = req.body;

  const doc = await TransaksiAnggaran.create({
    tahun,
    jenis,
    kategori: kategori || null,
    tanggal: tanggal ? new Date(tanggal) : new Date(),
    deskripsi,
    jumlah: Math.abs(Number(jumlah)), // arah masuk/keluar ditentukan field jenis
    eventId: eventId || null,
  });

  invalidatePrefix('transaksi:ringkasan');
  return ApiResponse.created(res, doc, 'Transaksi berhasil ditambahkan.');
});

/** PUT /api/transaksi-anggaran/:id — protected */
export const updateTransaksi = asyncHandler(async (req, res) => {
  const existing = await TransaksiAnggaran.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Transaksi tidak ditemukan.');

  const allowed = ['tahun', 'jenis', 'kategori', 'tanggal', 'deskripsi', 'jumlah', 'eventId'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) existing[field] = req.body[field];
  });

  await existing.save();
  invalidateAllRingkasan();
  return ApiResponse.success(res, existing, 'Transaksi berhasil diperbarui.');
});

/** DELETE /api/transaksi-anggaran/:id — protected */
export const removeTransaksi = asyncHandler(async (req, res) => {
  const existing = await TransaksiAnggaran.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Transaksi tidak ditemukan.');
  await existing.deleteOne();
  invalidateAllRingkasan();
  return ApiResponse.success(res, null, 'Transaksi berhasil dihapus.');
});

// Helper: invalidasi seluruh cache ringkasan transaksi (semua tahun).
function invalidateAllRingkasan() {
  invalidatePrefix('transaksi:ringkasan');
}

// ---------------------------------------------------------------------------
// ANGGARAN EVENT (histori prediksi WMA)
// ---------------------------------------------------------------------------

/**
 * GET /api/anggaran-event — publik.
 * Output PERSIS contoh requirement: dikelompokkan per nama_event, urut tahun.
 * Query opsional ?nama_event=
 */
export const listAnggaranEvent = asyncHandler(async (req, res) => {
  const { nama_event } = req.query;
  const filter = {};
  if (nama_event) filter.nama_event = nama_event;

  const docs = await AnggaranEvent.find(filter).sort({ tahun: 1 }).lean();

  const grouped = new Map();
  for (const d of docs) {
    if (!grouped.has(d.nama_event)) grouped.set(d.nama_event, []);
    grouped.get(d.nama_event).push({ tahun: d.tahun, anggaran: d.anggaran });
  }

  const data = [...grouped.entries()].map(([nama, histori]) => ({ nama_event: nama, histori }));
  return ApiResponse.success(res, data);
});

/** GET /api/anggaran-event/nama — daftar nama event unik (dropdown). */
export const listNamaEvent = asyncHandler(async (_req, res) => {
  const CACHE_KEY = 'anggaran-event:nama';
  const cached = getCached(CACHE_KEY);
  if (cached) return ApiResponse.success(res, cached);

  const names = await AnggaranEvent.distinct('nama_event');
  const sorted = names.sort();
  setCache(CACHE_KEY, sorted, 10 * 60 * 1000);
  return ApiResponse.success(res, sorted);
});

/**
 * POST /api/anggaran-event — protected (ketua/wakil/bendahara).
 * Input manual histori anggaran event (tahun + nominal) untuk prediksi.
 * Body: { nama_event, tahun, anggaran } — upsert kombinasi unik nama_event+tahun.
 */
export const createAnggaranEvent = asyncHandler(async (req, res) => {
  const { nama_event, tahun, anggaran } = req.body;

  const doc = await AnggaranEvent.findOneAndUpdate(
    { nama_event: nama_event.trim(), tahun },
    { $set: { anggaran, sumber: 'manual' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  invalidateKey('anggaran-event:nama');
  // Histori berubah → prediksi WMA untuk event ini tidak valid lagi.
  invalidatePrefix(`prediksi:${nama_event.trim()}:`);
  return ApiResponse.success(res, doc, 'Riwayat anggaran event disimpan.');
});