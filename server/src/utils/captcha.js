// Captcha sederhana sisi server (tanpa library eksternal berat).
// Strategi: generate teks acak, simpan di Map in-memory dengan TTL,
// render teks menjadi SVG data-URI agar tidak bisa dibaca bot scrapper.
//
// CATATAN KEAMANAN (fase 04 dapat memperkuat):
// - Store in-memory => reset saat server restart. Untuk multi-instance
//   gunakan Redis/MongoDB TTL.
// - Untuk produksi publik, disarankan migrasi ke reCAPTCHA/hCaptcha
//   (memerlukan library + secret key eksternal).

import crypto from 'node:crypto';
import { CAPTCHA_LENGTH, CAPTCHA_TTL_MS } from './constants.js';

// Karakter aman (menghindari 0/O, 1/I/l yang membingungkan)
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Map<captchaId, { code, expiresAt }> */
const store = new Map();

// Pembersih berkala — jangan sampai memory bocor.
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt < now) store.delete(id);
  }
}, CAPTCHA_TTL_MS);
sweeper.unref?.();

function generateCode(len = CAPTCHA_LENGTH) {
  const bytes = crypto.randomBytes(len);
  let code = '';
  for (let i = 0; i < len; i += 1) code += CHARSET[bytes[i] % CHARSET.length];
  return code;
}

/** Render kode 5 karakter menjadi SVG sederhana (data URI). */
function renderSvg(code) {
  const width = 140;
  const height = 50;
  const chars = [...code];
  const spacing = width / (chars.length + 1);

  // Warna latar & garis noise acak
  const bg = `hsl(${Math.floor(Math.random() * 360)}, 30%, 92%)`;
  const noise = Array.from({ length: 4 }, () => {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>`;
  }).join('');

  const texts = chars
    .map((ch, i) => {
      const x = Math.round(spacing * (i + 1));
      const y = Math.round(30 + (Math.random() * 10 - 1));
      const rot = (Math.random() * 30 - 15).toFixed(1);
      const color = `hsl(${Math.floor(Math.random() * 360)}, 55%, 35%)`;
      return `<text x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y})" font-family="monospace" font-size="26" font-weight="bold" fill="${color}" text-anchor="middle">${ch}</text>`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bg}"/>${noise}${texts}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Buat captcha baru.
 * @returns {{ captchaId: string, image: string (data URI SVG) }}
 */
export function generateCaptcha() {
  const captchaId = crypto.randomUUID();
  const code = generateCode();
  store.set(captchaId, { code, expiresAt: Date.now() + CAPTCHA_TTL_MS });
  return { captchaId, image: renderSvg(code) };
}

/**
 * Verifikasi + sekali pakai (otomatis dihapus setelah cek).
 * @returns {boolean}
 */
export function verifyCaptcha(captchaId, answer) {
  if (!captchaId || !answer) return false;
  const entry = store.get(captchaId);
  store.delete(captchaId); // sekali pakai
  if (!entry || entry.expiresAt < Date.now()) return false;
  return entry.code.toLowerCase() === String(answer).trim().toLowerCase();
}

/**
 * Cek apakah captcha aktif (OPT-IN secara default).
 * Captcha NONAKTIF kecuali env `CAPTCHA_ENABLED` eksplisit `'true'`.
 * Berguna untuk tahap uji coba/live: captcha tidak mengganggu sampai
 * sengaja diaktifkan (mis. `CAPTCHA_ENABLED=true` di Vercel).
 */
export function isCaptchaEnabled() {
  return process.env.CAPTCHA_ENABLED === 'true';
}