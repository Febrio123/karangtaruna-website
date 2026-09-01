// controllers/galeriController.js — galeri foto/video + upload Cloudinary

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Galeri } from '../models/galeri.model.js';
import { uploadBuffer, destroy } from '../services/cloudinaryService.js';
import { resourceTypeFromMime } from '../middleware/upload.js';

/** GET /api/galeri — publik; filter ?category=&year=&type=&published=true&page=&limit= */
export const list = asyncHandler(async (req, res) => {
  const { category, year, type } = req.query;
  const filter = {};
  if (req.query.published !== 'false') filter.isPublished = true;
  if (category && category !== 'Semua') filter.category = category;
  if (year && year !== 'Semua') filter.year = String(year);
  if (type) filter.type = type;

  const pageNum = Math.max(1, Number(req.query.page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

  const [data, total] = await Promise.all([
    Galeri.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Galeri.countDocuments(filter),
  ]);

  return ApiResponse.success(res, {
    items: data,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

/** GET /api/galeri/:id — publik */
export const getById = asyncHandler(async (req, res) => {
  const data = await Galeri.findById(req.params.id).lean();
  if (!data) throw new ApiError(404, 'Item galeri tidak ditemukan.');
  return ApiResponse.success(res, data);
});

/**
 * POST /api/galeri — protected (multipart: field `file` + metadata)
 * Upload buffer -> Cloudinary -> simpan {public_id, secure_url}.
 */
export const create = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'File media wajib diunggah (field "file").');
  }

  const { title, category, year, type, description, imageAlt, isPublished } = req.body;
  const mediaType = type === 'video' ? 'video' : 'image';

  const media = await uploadBuffer(req.file.buffer, {
    folder: 'karang-taruna/galeri',
    resourceType: resourceTypeFromMime(req.file.mimetype),
  });

  try {
    const doc = await Galeri.create({
      title,
      category,
      year: year || String(new Date().getFullYear()),
      type: mediaType,
      description,
      media,
      imageAlt,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });
    return ApiResponse.created(res, doc, 'Item galeri berhasil diunggah.');
  } catch (err) {
    await destroy(media.public_id).catch(() => {});
    throw err;
  }
});

/** PUT /api/galeri/:id — protected (metadata; opsional ganti file) */
export const update = asyncHandler(async (req, res) => {
  const existing = await Galeri.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Item galeri tidak ditemukan.');

  const allowed = ['title', 'category', 'year', 'type', 'description', 'imageAlt', 'isPublished'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) existing[field] = req.body[field];
  });

  if (req.file) {
    const oldMedia = existing.media;
    existing.media = await uploadBuffer(req.file.buffer, {
      folder: 'karang-taruna/galeri',
      resourceType: resourceTypeFromMime(req.file.mimetype),
    });
    if (oldMedia?.public_id) {
      await destroy(oldMedia.public_id, oldMedia.resource_type || 'image').catch(() => {});
    }
  }

  await existing.save();
  return ApiResponse.success(res, existing, 'Item galeri berhasil diperbarui.');
});

/** DELETE /api/galeri/:id — protected; destroy aset Cloudinary lalu hapus dokumen */
export const remove = asyncHandler(async (req, res) => {
  const existing = await Galeri.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Item galeri tidak ditemukan.');

  if (existing.media?.public_id) {
    await destroy(existing.media.public_id, existing.type === 'video' ? 'video' : 'image').catch(() => {});
  }
  await existing.deleteOne();
  return ApiResponse.success(res, null, 'Item galeri berhasil dihapus.');
});