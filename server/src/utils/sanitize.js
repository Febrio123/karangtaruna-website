// utils/sanitize.js — input sanitization helpers

/**
 * Escape karakter khusus regex agar user input tidak bisa membentuk
 * pola regex berbahaya (ReDoS / NoSQL injection via $regex).
 *
 * Berguna untuk query search `q` yang dimasukkan ke $regex MongoDB.
 */
export function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Batasi panjang string input (defense-in-depth).
 * Mengembalikan string yang sudah dipotong jika melebihi batas.
 */
export function clampLength(str, maxLen = 500) {
  if (typeof str !== 'string') return str;
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

/**
 * Buat regex case-insensitive dari user input yang sudah di-escape.
 */
export function safeSearchRegex(query) {
  return { $regex: escapeRegex(query), $options: 'i' };
}

/**
 * Deteksi pola XSS berbahaya pada konten HTML yang akan disimpan/dirender.
 * Digunakan sebagai basic guard di backend. Catatan: guard ini BUKAN pengganti
 * sanitizer penuh (DOMPurify) — frontend WAJIB memakai DOMPurify / escaping saat
 * me-render konten publik (articles.content, site_config.information[].content, dst).
 *
 * Mengembalikan array pola berbahaya yang ditemukan (kosong = aman).
 */
export function detectDangerousHtml(html) {
  if (typeof html !== 'string') return [];
  const dangerous = [];
  // Tag <script> (termasuk case/space/attribute variants)
  if (/<\s*script[\s>/]/i.test(html)) dangerous.push('tag <script>');
  // Inline event handler attributes: onload=, onclick=, onerror=, dst.
  if (/\son\w+\s*=/i.test(html)) dangerous.push('inline event handler (on*)');
  // javascript: URI di atribut href/src
  if (/href\s*=\s*["']?\s*javascript:/i.test(html)) dangerous.push('javascript: URI di href');
  return dangerous;
}

