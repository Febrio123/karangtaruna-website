// ============================================================================
// lib/api.js — HTTP client untuk backend Karang Taruna (LIVE API + AUTH JWT)
// ============================================================================
// Strategi auth (sesuai fase backend & security):
//   - Access token (JWT, ±15mnt) disimpan DI MEMORI (bukan localStorage),
//     dikirim via header `Authorization: Bearer <token>`.
//   - Refresh token (JWT 7d/30d) dipegang browser sebagai cookie httpOnly —
//     otomatis terkirim berkat `credentials: 'include'`.
//   - Saat respons 401 (TOKEN_EXPIRED / sesi kedaluwarsa) pada endpoint
//     non-auth: coba refresh sekali (POST /auth/refresh), lalu ulangi request.
//     Kalau refresh gagal → panggil onUnauthorized (redirect ke /login).
// Format respons backend: { status:'success'|'error', data?, message?, code?, details? }
//   - List  -> data.items + data.pagination
//   - Single -> data (objek)
// ============================================================================

import { getCookie, ACCESS_COOKIE } from './cookies.js'
import { setAccessCookie } from './http.js'
import http from './http.js' // axios instance (dipakai untuk /auth/refresh)

const API_BASE = String(import.meta.env.VITE_API_URL || 'https://karangtaruna-website-server.vercel.app/api').replace(/\/+$/, '')

// --- Token: seed dari cookie (persist antar refresh) ------------------------
// Access token disimpan BAIK di memori (fast-path) MAUPUN di cookie browser
// (jwt_access_token) agar sesi tidak hilang saat halaman di-reload. `setAccessToken`
// selalu sinkronkan cookie; `setAccessCookie` dari http.js memastikan satu titik
// set/clear cookie agar axios (http.js) juga kebagian token yang sama.
let accessToken = getCookie(ACCESS_COOKIE) || null
let refreshPromise = null
let onUnauthorized = null

export function setAccessToken(token) {
  accessToken = token || null
  setAccessCookie(accessToken) // tulis/hapus cookie jwt_access_token
}

export function getAccessToken() {
  return accessToken
}

/** Daftarkan callback ketika sesi tidak valid (refresh gagal) → redirect login. */
export function setOnUnauthorized(fn) {
  onUnauthorized = typeof fn === 'function' ? fn : null
}

/** Error standar API client — `message` dari field `message` backend. */
export class ApiClientError extends Error {
  constructor(message, { status = 0, code = null, details = null } = {}) {
    super(message || 'Terjadi kesalahan pada server.')
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Bangun pesan error satu kalimat yang jelas dari payload error backend.
 * Urutan prioritas:
 *   1. `payload.message` (string non-empty) → dipakai apa adanya (di-trim),
 *      mis. "Username atau password salah." / "Captcha salah atau kedaluwarsa."
 *   2. `payload.details` (array non-empty) → gabung tiap item (`.message` /
 *      `.msg`) dengan pemisah "; " — mis. detail validasi per-field.
 *   3. Fallback generik yang menyertakan status HTTP — mis. body non-JSON
 *      atau backend tidak mengirim pesan sama sekali.
 */
function readableError(payload, res) {
  const message = typeof payload?.message === 'string' ? payload.message.trim() : ''
  if (message) return message

  if (Array.isArray(payload?.details) && payload.details.length > 0) {
    const parts = payload.details
      .map((d) => {
        const text = typeof d === 'string' ? d : d?.message ?? d?.msg
        return typeof text === 'string' ? text.trim() : ''
      })
      .filter(Boolean)
    if (parts.length > 0) return parts.join('; ')
  }

  return `Terjadi kesalahan pada server (HTTP ${res?.status ?? '?'}).`
}

async function parseResponse(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function forceLogout() {
  setAccessToken(null) // clear memori + cookie jwt_access_token
  if (typeof onUnauthorized === 'function') onUnauthorized()
}

/** Refresh access token memakai refresh cookie (httpOnly). Single-flight.
 *  Request refresh dilewatkan ke axios instance (http.js) yang mengirim cookie
 *  httpOnly secara otomatis (withCredentials). Token baru di-set via
 *  setAccessToken agar cookie browser ikut ter-update. */
async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const { data } = await http.post('/auth/refresh')
      const token = data?.data?.accessToken
      if (!token) {
        setAccessToken(null)
        return false
      }
      setAccessToken(token)
      return true
    } catch {
      setAccessToken(null)
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

/**
 * Request inti — selalu `credentials:'include'` (cookie httpOnly refresh).
 * Body objek biasa dikirim sebagai application/json; FormData TIDAK diberi
 * Content-Type manual (biar browser set boundary).
 */
async function request(path, { method = 'GET', body, headers = {}, ...rest } = {}, { retried = false } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const reqHeaders = { Accept: 'application/json', ...headers }
  if (accessToken) reqHeaders.Authorization = `Bearer ${accessToken}`
  if (body !== undefined && !isFormData) reqHeaders['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: reqHeaders,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    })
  } catch {
    throw new ApiClientError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', { status: 0 })
  }

  // 401 pada endpoint NON-auth → coba refresh sekali, lalu ulangi permintaan asli.
  if (res.status === 401 && !path.startsWith('/auth/') && !retried) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request(path, { method, body, headers, ...rest }, { retried: true })
    }
    forceLogout()
    throw new ApiClientError('Sesi berakhir. Silakan login ulang.', { status: 401, code: 'AUTH_REQUIRED' })
  }

  const payload = await parseResponse(res)
  if (!res.ok) {
    // Pesan selalu informatif: message backend → details → fallback + status.
    throw new ApiClientError(readableError(payload, res), {
      status: res.status,
      code: payload?.code || null,
      details: payload?.details || null,
    })
  }
  return payload
}

/**
 * apiFetch(path, opts) — panggil endpoint, kembalikan `data` (sudah di-unwrap
 * dari wrapper { status, data, message }). Untuk list: `data.items`+pagination
 * tetap utuh; untuk single: objek.
 */
export function apiFetch(path, opts) {
  return request(path, opts).then((payload) => payload?.data ?? payload)
}

export default apiFetch