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

const API_BASE = String(import.meta.env.VITE_API_URL || 'https://karangtaruna-website-server.vercel.app/api').replace(/\/+$/, '')

// --- Token di memori (non-persistent) ---------------------------------------
let accessToken = null
let refreshPromise = null
let onUnauthorized = null

export function setAccessToken(token) {
  accessToken = token || null
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
  accessToken = null
  if (typeof onUnauthorized === 'function') onUnauthorized()
}

/** Refresh access token memakai refresh cookie (httpOnly). Single-flight. */
async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      const payload = await parseResponse(res)
      if (!res.ok || !payload?.data?.accessToken) {
        accessToken = null
        return false
      }
      accessToken = payload.data.accessToken
      return true
    } catch {
      accessToken = null
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
    throw new ApiClientError(
      payload?.message || `Terjadi kesalahan pada server (${res.status}).`,
      { status: res.status, code: payload?.code || null, details: payload?.details || null }
    )
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