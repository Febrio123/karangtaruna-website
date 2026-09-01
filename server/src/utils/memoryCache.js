// ============================================================================
// utils/memoryCache.js — in-memory cache ringan (Map + TTL)
// ============================================================================
// Cocok untuk data yang jarang berubah & sering dibaca (site_config,
// parameter_ekonomi, daftar nama event untuk dropdown, dsb).
// TIDAK menggunakan Redis — sesuai skala kecil (10-30 user, single instance).
//
// Catatan: cache ini HILANG saat server restart (cold start). Acceptable untuk
// data statis/config yang akan ter-cache ulang secara otomatis.
// ============================================================================

const store = new Map();

/**
 * Ambil data dari cache. Return null bila tidak ada atau sudah expired.
 * @param {string} key
 * @returns {*} cached data atau null
 */
export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Simpan data ke cache.
 * @param {string} key
 * @param {*} data
 * @param {number} [ttlMs=300000] — TTL dalam ms (default 5 menit)
 */
export function setCache(key, data, ttlMs = 5 * 60 * 1000) {
  store.set(key, { data, ts: Date.now(), ttl: ttlMs });
}

/**
 * Hapus (invalidate) cache berdasarkan key prefix.
 * @param {string} prefix — semua key yang diawali prefix ini dihapus
 */
export function invalidatePrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/**
 * Hapus satu key cache.
 * @param {string} key
 */
export function invalidateKey(key) {
  store.delete(key);
}

/**
 * Hapus seluruh cache.
 */
export function clearAll() {
  store.clear();
}
