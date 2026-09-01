// controllers/eventController.js — CRUD event/pengumuman + sinkronisasi anggaran_event

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Event } from '../models/event.model.js';
import { AnggaranEvent } from '../models/anggaranEvent.model.js';
import { uploadBuffer, destroy } from '../services/cloudinaryService.js';
import { resourceTypeFromMime } from '../middleware/upload.js';
import { invalidateKey, invalidatePrefix } from '../utils/memoryCache.js';

/**
 * Sinkronisasi events.budget + year -> anggaran_event (upsert oleh kombinasi unik
 * nama_event + tahun). Sumber selalu 'dari-event' agar bisa dibedakan dari input
 * manual admin pada koleksi anggaran_event.
 */
async function syncAnggaranEvent(event) {
  if (!event.budget?.amount || !event.year) return;

  await AnggaranEvent.findOneAndUpdate(
    { nama_event: event.title, tahun: event.year, eventId: event._id, sumber: 'dari-event' },
    {
      $set: { anggaran: event.budget.amount },
      $setOnInsert: { eventId: event._id, sumber: 'dari-event' },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  // Histori berubah → invalidasi cache dropdown nama event & prediksi.
  invalidateKey('anggaran-event:nama');
  invalidatePrefix(`prediksi:${event.title}:`);
}

/** Bersihkan histori anggaran yang bersumber dari event tertentu (saat delete). */
async function removeAnggaranEventByEvent(eventId) {
  await AnggaranEvent.updateMany(
    { eventId, sumber: 'dari-event' },
    { $set: { eventId: null, sumber: 'manual' } }
  );
  // Hapus histori yang sudah tidak bernama (event=null) — kini jadi input manual
  // yang tidak boleh hilang walau event dihapus: biarkan, hanya lepaskan referensi.
}

/** GET /api/events — publik; filter ?type=&status=&year=&published=true&page=&limit= */
export const list = asyncHandler(async (req, res) => {
  const { type, status, year } = req.query;
  const filter = {};
  if (req.query.published !== 'false') filter.isPublished = true;
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (year) filter.year = Number(year);

  const pageNum = Math.max(1, Number(req.query.page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

  const [data, total] = await Promise.all([
    Event.find(filter).sort({ date: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Event.countDocuments(filter),
  ]);

  return ApiResponse.success(res, {
    items: data,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

/** GET /api/events/:id — publik */
export const getById = asyncHandler(async (req, res) => {
  const data = await Event.findById(req.params.id).lean();
  if (!data) throw new ApiError(404, 'Event tidak ditemukan.');
  return ApiResponse.success(res, data);
});

/** POST /api/events — protected (ketua/wakil/sekretaris) */
export const create = asyncHandler(async (req, res) => {
  const { title, type, date, time, location, status, description, budget, isPublished } = req.body;

  let image = null;
  if (req.file) {
    image = await uploadBuffer(req.file.buffer, {
      folder: 'karang-taruna/events',
      resourceType: resourceTypeFromMime(req.file.mimetype),
    });
  }

  try {
    const doc = await Event.create({
      title,
      type: type || 'event',
      date: date ? new Date(date) : new Date(),
      time,
      location,
      status: status || 'Mendatang',
      description,
      budget: {
        amount: budget?.amount ?? 0,
        label: budget?.label || null,
      },
      image,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    await syncAnggaranEvent(doc);
    return ApiResponse.created(res, doc, 'Event berhasil dibuat.');
  } catch (err) {
    if (image) await destroy(image.public_id).catch(() => {});
    throw err;
  }
});

/** PUT /api/events/:id — protected */
export const update = asyncHandler(async (req, res) => {
  const existing = await Event.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Event tidak ditemukan.');

  const allowed = ['title', 'type', 'date', 'time', 'location', 'status', 'description', 'budget', 'isPublished'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) existing[field] = req.body[field];
  });

  if (req.file) {
    const image = await uploadBuffer(req.file.buffer, {
      folder: 'karang-taruna/events',
      resourceType: resourceTypeFromMime(req.file.mimetype),
    });
    const oldImage = existing.image;
    existing.image = image;
    if (oldImage?.public_id) await destroy(oldImage.public_id).catch(() => {});
  }

  await existing.save();
  await syncAnggaranEvent(existing);
  return ApiResponse.success(res, existing, 'Event berhasil diperbarui.');
});

/** DELETE /api/events/:id — protected */
export const remove = asyncHandler(async (req, res) => {
  const existing = await Event.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Event tidak ditemukan.');

  if (existing.image?.public_id) {
    await destroy(existing.image.public_id).catch(() => {});
  }
  await existing.deleteOne();
  await removeAnggaranEventByEvent(existing._id);
  return ApiResponse.success(res, null, 'Event berhasil dihapus.');
});

export { syncAnggaranEvent };