// controllers/pengurusController.js — CRUD pengurus (bagan organisasi)

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Pengurus } from '../models/pengurus.model.js';
import { uploadBuffer, destroy } from '../services/cloudinaryService.js';
import { resourceTypeFromMime } from '../middleware/upload.js';

/** GET /api/pengurus — publik; filter ?periode=&role=&level= */
export const list = asyncHandler(async (req, res) => {
  const { periode, role, level } = req.query;
  const filter = {};
  if (periode) filter.periode = periode;
  if (role) filter.role = role;
  if (level) filter.level = Number(level);

  const data = await Pengurus.find(filter).sort({ level: 1, urutan: 1, nama: 1 }).lean();
  return ApiResponse.success(res, data);
});

/** GET /api/pengurus/:id — publik */
export const getById = asyncHandler(async (req, res) => {
  const data = await Pengurus.findById(req.params.id).lean();
  if (!data) throw new ApiError(404, 'Pengurus tidak ditemukan.');
  return ApiResponse.success(res, data);
});

/** POST /api/pengurus — protected (ketua/wakil) */
export const create = asyncHandler(async (req, res) => {
  const { nama, jabatan, bidang, periode, role, telepon, level, urutan, email } = req.body;

  let foto = null;
  if (req.file) {
    foto = await uploadBuffer(req.file.buffer, {
      folder: 'karang-taruna/pengurus',
      resourceType: resourceTypeFromMime(req.file.mimetype),
    });
    req.foto = foto; // untuk cleanup bila create gagal
  }

  try {
    const doc = await Pengurus.create({
      nama,
      jabatan,
      bidang: bidang || '-',
      periode,
      role,
      telepon,
      level,
      urutan: urutan ?? 0,
      email,
      foto,
    });
    return ApiResponse.created(res, doc, 'Pengurus berhasil ditambahkan.');
  } catch (err) {
    if (foto) await destroy(foto.public_id).catch(() => {});
    throw err;
  }
});

/** PUT /api/pengurus/:id — protected (ketua/wakil) */
export const update = asyncHandler(async (req, res) => {
  const existing = await Pengurus.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Pengurus tidak ditemukan.');

  const allowed = ['nama', 'jabatan', 'bidang', 'periode', 'role', 'telepon', 'level', 'urutan', 'email'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) existing[field] = req.body[field];
  });

  if (req.file) {
    // Upload foto baru, hapus foto lama bila ada
    const foto = await uploadBuffer(req.file.buffer, {
      folder: 'karang-taruna/pengurus',
      resourceType: resourceTypeFromMime(req.file.mimetype),
    });
    const oldFoto = existing.foto;
    existing.foto = foto;
    if (oldFoto?.public_id) {
      await destroy(oldFoto.public_id).catch(() => {});
    }
  }

  await existing.save();
  return ApiResponse.success(res, existing, 'Pengurus berhasil diperbarui.');
});

/** DELETE /api/pengurus/:id — protected (ketua/wakil) */
export const remove = asyncHandler(async (req, res) => {
  const existing = await Pengurus.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Pengurus tidak ditemukan.');

  if (existing.foto?.public_id) {
    await destroy(existing.foto.public_id).catch(() => {});
  }
  await existing.deleteOne();
  return ApiResponse.success(res, null, 'Pengurus berhasil dihapus.');
});