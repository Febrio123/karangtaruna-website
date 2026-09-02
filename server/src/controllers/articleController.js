// controllers/articleController.js — CRUD artikel/berita

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Article } from '../models/article.model.js';
import { uploadBuffer, destroy } from '../services/cloudinaryService.js';
import { resourceTypeFromMime } from '../middleware/upload.js';
import { safeSearchRegex, detectDangerousHtml } from '../utils/sanitize.js';

const PAGE_SIZE_DEFAULT = 12;

/** parse boolean API — dukung string "true"/"false" (FormData) & boolean asli (JSON). */
function parseBool(v) {
  if (v === undefined || v === null) return undefined
  if (typeof v === 'boolean') return v
  if (String(v).toLowerCase() === 'false' || String(v) === '0') return false
  return true // "true", "1", dan string lain dianggap true
}

// Proyeksi list artikel: JANGAN kirim field berat `content` (HTML panjang) ke
// kartu/list — cukup metadata kartu. Detail diambil via GET /:id & /slug/:slug.
// Ini memangkas payload hingga puluhan-kali lipat pada list.
const LIST_PROJECTION =
  'title slug category date author excerpt cover imageAlt isPublished publishedAt createdAt updatedAt';

/**
 * GET /api/articles — publik.
 * Query: ?category=&q=&page=&limit=&published=true
 */
export const list = asyncHandler(async (req, res) => {
  const { category, q, page = 1, limit = PAGE_SIZE_DEFAULT } = req.query;

  const filter = {};
  if (req.query.published !== 'false') filter.isPublished = true;
  if (category && category !== 'Semua') filter.category = category;
  if (q) {
    const safeRegex = safeSearchRegex(q);
    filter.$or = [
      { title: safeRegex },
      { excerpt: safeRegex },
      { content: safeRegex },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || PAGE_SIZE_DEFAULT));

  const [data, total] = await Promise.all([
    Article.find(filter)
      .select(LIST_PROJECTION)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Article.countDocuments(filter),
  ]);

  return ApiResponse.success(res, {
    items: data,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

/** GET /api/articles/slug/:slug — publik (detail SEO) */
export const getBySlug = asyncHandler(async (req, res) => {
  const data = await Article.findOne({ slug: req.params.slug, isPublished: true }).lean();
  if (!data) throw new ApiError(404, 'Artikel tidak ditemukan.');
  return ApiResponse.success(res, data);
});

/** GET /api/articles/:id — publik */
export const getById = asyncHandler(async (req, res) => {
  const data = await Article.findById(req.params.id).lean();
  if (!data) throw new ApiError(404, 'Artikel tidak ditemukan.');
  return ApiResponse.success(res, data);
});

/** POST /api/articles — protected (ketua/wakil/sekretaris) */
export const create = asyncHandler(async (req, res) => {
  const { slug, title, category, date, author, excerpt, content, imageAlt, isPublished } = req.body;

  // Guard basic stored-XSS: tolak konten dengan pola berbahaya alih-alih menyimpannya.
  const dangerous = detectDangerousHtml(content);
  if (dangerous.length > 0) {
    throw new ApiError(400, `Konten artikel mengandung pola yang tidak diizinkan: ${dangerous.join(', ')}.`, { code: 'XSS_BLOCKED' });
  }

  let cover = null;
  if (req.file) {
    cover = await uploadBuffer(req.file.buffer, {
      folder: 'karang-taruna/articles',
      resourceType: resourceTypeFromMime(req.file.mimetype),
    });
  }

  try {
    const doc = await Article.create({
      slug,
      title,
      category,
      date: date || new Date(),
      author,
      excerpt,
      content,
      cover,
      imageAlt,
      isPublished: parseBool(isPublished) !== undefined ? parseBool(isPublished) : true,
    });
    return ApiResponse.created(res, doc, 'Artikel berhasil dibuat.');
  } catch (err) {
    if (cover) await destroy(cover.public_id).catch(() => {});
    throw err;
  }
});

/** PUT /api/articles/:id — protected */
export const update = asyncHandler(async (req, res) => {
  const existing = await Article.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Artikel tidak ditemukan.');

  // Guard basic stored-XSS pada konten (bila ikut diupdate)
  if (req.body.content !== undefined) {
    const dangerous = detectDangerousHtml(req.body.content);
    if (dangerous.length > 0) {
      throw new ApiError(400, `Konten artikel mengandung pola yang tidak diizinkan: ${dangerous.join(', ')}.`, { code: 'XSS_BLOCKED' });
    }
  }

  const allowed = ['slug', 'title', 'category', 'date', 'author', 'excerpt', 'content', 'imageAlt'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) existing[field] = req.body[field];
  });
  if (req.body.isPublished !== undefined) existing.isPublished = parseBool(req.body.isPublished);

  if (req.file) {
    const cover = await uploadBuffer(req.file.buffer, {
      folder: 'karang-taruna/articles',
      resourceType: resourceTypeFromMime(req.file.mimetype),
    });
    const oldCover = existing.cover;
    existing.cover = cover;
    if (oldCover?.public_id) await destroy(oldCover.public_id).catch(() => {});
  }

  await existing.save();
  return ApiResponse.success(res, existing, 'Artikel berhasil diperbarui.');
});

/** DELETE /api/articles/:id — protected */
export const remove = asyncHandler(async (req, res) => {
  const existing = await Article.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Artikel tidak ditemukan.');

  if (existing.cover?.public_id) {
    await destroy(existing.cover.public_id).catch(() => {});
  }
  await existing.deleteOne();
  return ApiResponse.success(res, null, 'Artikel berhasil dihapus.');
});