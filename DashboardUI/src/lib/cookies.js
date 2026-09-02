// ============================================================================
// lib/cookies.js — Helper cookie minimal (tanpa dependency)
// ============================================================================
// Digunakan untuk mempertahankan sesi DI SISI BROWSER. Access token disimpan
// di cookie `jwt_access_token` (readable oleh JS) agar sesi tetap hidup saat
// halaman di-refresh (access token tak lagi hanya di memori).
//
// Catatan keamanan: `jwt_access_token` readable oleh JS (bukan httpOnly) —
// trade-off agar bisa dibaca & dikirim lewat header `Authorization: Bearer`.
// `jwt_refresh_token` TETAP httpOnly dari backend, sehingga tak bisa dibaca
// JS (lebih aman); kami hanya mencadangkan namanya di sini.

export function setCookie(name, value, maxAgeSeconds = 12 * 60 * 60) {
  const enc = encodeURIComponent(value)
  document.cookie = `${name}=${enc}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

export function getCookie(name) {
  const parts = document.cookie.split('; ')
  for (const p of parts) {
    const idx = p.indexOf('=')
    if (idx > -1 && p.slice(0, idx) === name) {
      try {
        return decodeURIComponent(p.slice(idx + 1))
      } catch {
        return p.slice(idx + 1)
      }
    }
  }
  return null
}

export function clearCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export const ACCESS_COOKIE = 'jwt_access_token'
export const REFRESH_COOKIE = 'jwt_refresh_token' // dicadangkan (backend set httpOnly; tak bisa dibaca — tapi siap)
