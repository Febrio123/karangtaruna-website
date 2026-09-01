// controllers/prediksiController.js — hitung prediksi WMA + override

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { AnggaranEvent } from '../models/anggaranEvent.model.js';
import { ParameterEkonomi } from '../models/parameterEkonomi.model.js';
import { PrediksiOverride } from '../models/prediksiOverride.model.js';
import { getCached, setCache, invalidatePrefix } from '../utils/memoryCache.js';
import {
  hitungPrediksi,
  PrediksiError,
  tahunPrediksiDefault,
} from '../services/prediksiAnggaran.service.js';

/**
 * Cache prediksi per (nama_event, tahun_prediksi, bobot) — hasil perhitungan
 * deterministik dari data yang jarang berubah (histori + inflasi). Hit publik
 * yang sama → reuse hasil tanpa query + hitung ulang. TTL 10 menit.
 * Di-invalidate saat override atau histori anggaran_event berubah.
 */
function prediksiCacheKey(namaEvent, tahunPrediksi, bobot) {
  return `prediksi:${namaEvent}:${tahunPrediksi}:${bobot || 'default'}`;
}

/**
 * GET /api/prediksi-anggaran/:nama_event
 * Query opsional: ?tahun_prediksi= (default tahun berjalan+1) & ?bobot=1,2,3
 * Flow: ambil histori -> validasi >=2 -> hitung WMA -> ambil inflasi (tahun_prediksi-1)
 *       -> prediksi_final = WMA × (1 + inflasi/100)
 */
export const hitung = asyncHandler(async (req, res) => {
  const namaEvent = String(req.params.nama_event || '').trim();
  if (!namaEvent) throw new ApiError(400, 'nama_event wajib diisi.');

  const tahunPrediksi = Number(req.query.tahun_prediksi) || tahunPrediksiDefault();
  const bobot = req.query.bobot;

  // Cache lookup sebelum query DB / hitung ulang.
  const cacheKey = prediksiCacheKey(namaEvent, tahunPrediksi, bobot);
  const cacheHit = getCached(cacheKey);
  if (cacheHit) return ApiResponse.success(res, cacheHit);

  const histori = await AnggaranEvent.find({ nama_event: namaEvent })
    .sort({ tahun: 1 })
    .select('tahun anggaran -_id')
    .lean();

  try {
    if (histori.length < 2) {
      throw new PrediksiError('Data historis event ini belum cukup untuk menghitung prediksi (minimal 2 data)', 'DATA_KURANG');
    }

    // Inflasi: parameter_ekonomi untuk tahun_prediksi - 1 (data tahun terakhir sebelum prediksi)
    const inflasiDoc = await ParameterEkonomi.findOne({ tahun: tahunPrediksi - 1 }).lean();
    if (!inflasiDoc) {
      throw new PrediksiError(
        `Data inflasi untuk tahun ${tahunPrediksi - 1} belum diinput. Lengkapi di menu Parameter Ekonomi terlebih dahulu.`,
        'INFLASI_BELUM_ADA'
      );
    }

    const result = hitungPrediksi({
      namaEvent,
      tahunPrediksi,
      histori: histori.map((h) => ({ tahun: h.tahun, anggaran: h.anggaran })),
      persentaseInflasi: inflasiDoc.persentase_inflasi,
      bobot,
    });

    setCache(cacheKey, result, 10 * 60 * 1000);
    return ApiResponse.success(res, result);
  } catch (err) {
    if (err instanceof PrediksiError) {
      throw new ApiError(422, err.message, { code: err.code });
    }
    throw err;
  }
});

/** GET /api/prediksi-anggaran/:nama_event/riwayat-override — histori override (audit trail). */
export const riwayatOverride = asyncHandler(async (req, res) => {
  const namaEvent = String(req.params.nama_event || '').trim();
  const filter = {};
  if (namaEvent) filter.nama_event = namaEvent;

  const data = await PrediksiOverride.find(filter)
    .sort({ createdAt: -1 })
    .populate('dibuat_oleh', 'username nama role')
    .lean();

  return ApiResponse.success(res, data);
});

/**
 * POST /api/prediksi-anggaran/:nama_event/override — protected (ketua/wakil).
 * Body: { tahun_prediksi, anggaran_final, catatan }
 */
export const override = asyncHandler(async (req, res) => {
  const namaEvent = String(req.params.nama_event || '').trim();
  const { tahun_prediksi, anggaran_final, catatan } = req.body;

  if (!namaEvent) throw new ApiError(400, 'nama_event wajib diisi.');
  if (!tahun_prediksi || !anggaran_final) {
    throw new ApiError(400, 'tahun_prediksi dan anggaran_final wajib diisi.');
  }

  const doc = await PrediksiOverride.create({
    nama_event: namaEvent,
    tahun_prediksi,
    anggaran_final,
    catatan: catatan || null,
    dibuat_oleh: req.user._id,
  });

  // Override mengubah default/dasar prediksi yang bisa di-cache → invalidate.
  invalidatePrefix(`prediksi:${namaEvent}:`);
  return ApiResponse.created(res, doc, 'Override prediksi disimpan sebagai audit trail.');
});