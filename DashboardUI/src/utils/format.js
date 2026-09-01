// Utility fungsi format mata uang & tanggal Indonesia.

/**
 * Format angka menjadi mata uang Rupiah (id-ID).
 * @param {number} value - Nilai nominal.
 * @returns {string} Contoh: "Rp 1.250.000"
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format tanggal menjadi format Indonesia (misal "15 Agustus 2026").
 * @param {string|Date} date - Tanggal.
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Format tanggal pendek (misal "15 Agu 2026").
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateShort(date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Ambil inisial (2 huruf) dari nama lengkap.
 * @param {string} nama
 * @returns {string}
 */
export function getInitials(nama) {
  const parts = nama.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + last).toUpperCase();
}

/**
 * Tentukan warna latar untuk avatar berdasarkan nama (hash sederhana).
 * @param {string} nama
 * @returns {string} class tailwind
 */
export function avatarColor(nama) {
  const colors = [
    'bg-primary',
    'bg-accent',
    'bg-[#2C5F8A]',
    'bg-[#5A3E18]',
    'bg-[#44709C]',
    'bg-[#163A5F]',
  ];
  let hash = 0;
  for (let i = 0; i < nama.length; i++) {
    hash = nama.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
