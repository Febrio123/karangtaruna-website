// ============================================================================
// UserUI/src/lib/api.js — API client untuk situs publik UserUI.
// ============================================================================
// Satu-satunya titik keluar ke backend. Semua halaman memakai getJson().
//
// - BASE_URL diambil dari VITE_API_URL, fallback ke URL produksi.
// - menangani timeout (AbortController) agar fetch tidak menggantung.
// - mengurai respons standar { status, message?, data? } dan mengembalikan
//   bagian `data` langsung (list -> {items, pagination}, single -> objek).
// - melempar Error bila status response bukan 2xx atau status payload error,
//   supaya pemanggil bisa memutuskan fallback ke data statis.
// ============================================================================

export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://karangtaruna-website-server.vercel.app/api';

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * GET JSON singkat ke endpoint API (mount di bawah BASE_URL).
 * @param {string} path  path relatif, contoh: '/articles?published=true'
 * @returns {Promise<any>} nilai `data` dari respons (atau null).
 * @throws {Error} untuk non-2xx, status programatik 'error', atau timeout.
 */
export async function getJson(path) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    let res;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Waktu permintaan habis (timeout).');
      }
      // Network error (offline, DNS, CORS, dsb.)
      throw new Error('Gagal terhubung ke server.');
    }

    if (!res.ok) {
      throw new Error(`Server merespons dengan status ${res.status}.`);
    }

    const payload = await res.json().catch(() => ({}));

    if (payload && payload.status === 'error') {
      throw new Error(payload.message || 'Terjadi kesalahan pada server.');
    }

    return payload && payload.data !== undefined ? payload.data : payload;
  } finally {
    clearTimeout(timer);
  }
}
