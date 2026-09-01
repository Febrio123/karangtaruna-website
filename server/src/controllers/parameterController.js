// controllers/parameterController.js — parameter ekonomi (persentase inflasi per tahun)

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { ParameterEkonomi } from '../models/parameterEkonomi.model.js';
import { getCached, setCache, invalidateKey } from '../utils/memoryCache.js';

const LIST_CACHE_KEY = 'parameter-ekonomi:list';
const CACHE_TTL = 10 * 60 * 1000; // 10 menit (data inflasi jarang berubah)

/** GET /api/parameter-ekonomi — semua (urut tahun desc), dgn cache ringan */
export const list = asyncHandler(async (_req, res) => {
  const cached = getCached(LIST_CACHE_KEY);
  if (cached) return ApiResponse.success(res, cached);

  const data = await ParameterEkonomi.find().sort({ tahun: -1 }).lean();
  setCache(LIST_CACHE_KEY, data, CACHE_TTL);
  return ApiResponse.success(res, data);
});

/** GET /api/parameter-ekonomi/:tahun — tahun tertentu */
export const getByTahun = asyncHandler(async (req, res) => {
  const tahun = Number(req.params.tahun);
  const key = `parameter-ekonomi:tahun:${tahun}`;
  const cached = getCached(key);
  if (cached) return ApiResponse.success(res, cached);

  const data = await ParameterEkonomi.findOne({ tahun }).lean();
  if (!data) {
    throw new ApiError(404, `Data inflasi untuk tahun ${req.params.tahun} belum diinput.`);
  }
  setCache(key, data, CACHE_TTL);
  return ApiResponse.success(res, data);
});

/** POST /api/parameter-ekonomi — protected; body { tahun, persentase_inflasi } */
export const create = asyncHandler(async (req, res) => {
  const { tahun, persentase_inflasi } = req.body;

  const dup = await ParameterEkonomi.findOne({ tahun });
  if (dup) {
    throw new ApiError(409, `Data inflasi tahun ${tahun} sudah ada. Gunakan PUT untuk mengubah.`);
  }

  const doc = await ParameterEkonomi.create({ tahun, persentase_inflasi });
  invalidateKey(LIST_CACHE_KEY);
  invalidateKey(`parameter-ekonomi:tahun:${tahun}`);
  return ApiResponse.created(res, doc, 'Parameter ekonomi berhasil disimpan.');
});

/** PUT /api/parameter-ekonomi/:id — protected */
export const update = asyncHandler(async (req, res) => {
  const existing = await ParameterEkonomi.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Data parameter ekonomi tidak ditemukan.');

  if (req.body.tahun !== undefined) existing.tahun = req.body.tahun;
  if (req.body.persentase_inflasi !== undefined) existing.persentase_inflasi = req.body.persentase_inflasi;

  await existing.save();
  invalidateKey(LIST_CACHE_KEY);
  invalidateKey(`parameter-ekonomi:tahun:${existing.tahun}`);
  return ApiResponse.success(res, existing, 'Parameter ekonomi berhasil diperbarui.');
});

/** DELETE /api/parameter-ekonomi/:id — protected */
export const remove = asyncHandler(async (req, res) => {
  const existing = await ParameterEkonomi.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Data parameter ekonomi tidak ditemukan.');
  const tahun = existing.tahun;
  await existing.deleteOne();
  invalidateKey(LIST_CACHE_KEY);
  invalidateKey(`parameter-ekonomi:tahun:${tahun}`);
  return ApiResponse.success(res, null, 'Parameter ekonomi berhasil dihapus.');
});