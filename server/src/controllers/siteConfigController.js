// controllers/siteConfigController.js — profil organisasi singleton

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { SiteConfig } from '../models/siteConfig.model.js';
import { detectDangerousHtml } from '../utils/sanitize.js';
import { getCached, setCache, invalidateKey } from '../utils/memoryCache.js';

// Cache untuk GET publik site-config (jarang berubah, sering dibaca beranda).
// TTL 5 menit; di-invalidate saat update lewat PUT.
const SITE_CONFIG_CACHE_KEY = 'site-config:main';

export const DEFAULT_SITE_CONFIG = {
  _key: 'main',
  name: 'Karang Taruna Mekar Jaya',
  shortName: 'KT Mekar Jaya',
  tagline: 'Membangun generasi muda yang aktif, kreatif, dan bertanggung jawab.',
  address: null,
  phone: null,
  email: null,
  operatingHours: 'Senin - Jumat, 08:00 - 17:00 WIB',
  socialMedia: { instagram: null, facebook: null, youtube: null, tiktok: null },
  map: { lat: null, lng: null, zoom: 15 },
  stats: { members: 0, programs: 0, yearsActive: 0 },
  vision: null,
  mission: [],
  history: { summary: null, timeline: [] },
  information: [],
};

// Whitelist top-level field yang boleh diubah via PUT (anti mass-assignment).
// `_key` TIDAK boleh diubah; field di luar daftar ini diabaikan.
const ALLOWED_FIELDS = [
  'name',
  'shortName',
  'tagline',
  'address',
  'phone',
  'email',
  'operatingHours',
  'socialMedia',
  'map',
  'stats',
  'vision',
  'mission',
  'history',
  'information',
];

/**
 * Guard basic stored-XSS: periksa field konten (string) dari pola berbahaya.
 * Dipakai untuk field berisi teks/HTML yang akan dirender publik.
 */
function rejectDangerousFields(payload) {
  const candidates = [];
  const push = (val) => {
    if (typeof val === 'string') candidates.push(val);
  };

  push(payload.vision);
  push(payload.tagline);
  (payload.mission || []).forEach(push);
  push(payload.history?.summary);
  (payload.history?.timeline || []).forEach((t) => {
    push(t.title);
    push(t.description);
  });
  (payload.information || []).forEach((info) => {
    push(info.title);
    push(info.description);
    push(info.content);
    (info.requirements || []).forEach(push);
    (info.articles || []).forEach(push);
    (info.programs || []).forEach((p) => push(p.name));
    (info.services || []).forEach((s) => push(s.name));
  });

  for (const text of candidates) {
    const found = detectDangerousHtml(text);
    if (found.length > 0) {
      throw new ApiError(400, `Konten mengandung pola yang tidak diizinkan: ${found.join(', ')}.`, { code: 'XSS_BLOCKED' });
    }
  }
}

/** Ambil singleton; buat default bila belum ada (agar UI selalu dapat data). */
export async function getSiteConfigDoc() {
  let config = await SiteConfig.findOne({ _key: 'main' });
  if (!config) {
    config = await SiteConfig.create(DEFAULT_SITE_CONFIG);
  }
  return config;
}

/** GET /api/site-config — publik (dgn cache in-memory 5 mnt) */
export const get = asyncHandler(async (_req, res) => {
  const cached = getCached(SITE_CONFIG_CACHE_KEY);
  if (cached) return ApiResponse.success(res, cached);

  const config = await getSiteConfigDoc();
  setCache(SITE_CONFIG_CACHE_KEY, config.toObject());
  return ApiResponse.success(res, config);
});

/**
 * PUT /api/site-config — protected (ketua/wakil/sekretaris); update konten profil.
 * Hanya field dalam ALLOWED_FIELDS yang diterima; `_key` selalu 'main'.
 */
export const update = asyncHandler(async (req, res) => {
  const config = await getSiteConfigDoc();

  const whitelisted = {};
  for (const field of ALLOWED_FIELDS) {
    if (req.body[field] !== undefined) whitelisted[field] = req.body[field];
  }

  rejectDangerousFields(whitelisted);

  Object.assign(config, whitelisted, { _key: 'main' });
  await config.save();

  // Konten berubah → invalidate cache publik agar UI langsung dapat data terbaru.
  invalidateKey(SITE_CONFIG_CACHE_KEY);

  return ApiResponse.success(res, config, 'Profil organisasi berhasil diperbarui.');
});