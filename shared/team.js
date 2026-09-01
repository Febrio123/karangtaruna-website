// ============================================================================
// shared/team.js — SINGLE SOURCE OF TRUTH untuk data pengurus Karang Taruna
// ============================================================================
// Data canonical berasal dari DashboardUI.
// Kedua proyek (DashboardUI & UserUI) mengimport dari file ini.
// Edit di sini saja untuk mengubah data pengurus di kedua proyek.
// ============================================================================

/**
 * Daftar role yang tersedia di organisasi.
 * Setiap role punya value (ID), label (tampilan), dan color (varian badge).
 */
export const roles = [
  { value: 'ketua', label: 'Ketua', color: 'primary' },
  { value: 'wakil-ketua', label: 'Wakil Ketua', color: 'accent' },
  { value: 'sekretaris', label: 'Sekretaris', color: 'info' },
  { value: 'bendahara', label: 'Bendahara', color: 'success' },
  { value: 'anggota', label: 'Anggota', color: 'neutral' },
];

/**
 * Daftar bidang yang ada di organisasi.
 */
export const bidangList = [
  'Keagamaan',
  'Sosial & Kemanusiaan',
  'Olahraga',
  'Seni & Budaya',
  'Pendidikan',
  'Kewirausahaan',
  'Kesehatan',
];

/**
 * Daftar pengurus — DATA CANONICAL.
 *
 * Field:
 *   id       — unique identifier (number)
 *   nama     — nama lengkap pengurus (string)
 *   jabatan  — jabatan organisasi (string)
 *   bidang   — bidang kerja; '-' untuk pengurus inti (string)
 *   periode  — masa jabatan, format "YYYY-YYYY" (string)
 *   role     — role RBAC; harus salah satu dari roles[].value (string)
 *   telepon  — nomor telepon (string)
 */
export const pengurus = [
  { id: 1, nama: 'Ahmad Fauzi', jabatan: 'Ketua', bidang: '-', periode: '2025-2027', role: 'ketua', telepon: '0812-3456-7890' },
  { id: 2, nama: 'Siti Rahmawati', jabatan: 'Wakil Ketua', bidang: '-', periode: '2025-2027', role: 'wakil-ketua', telepon: '0813-2211-3344' },
  { id: 3, nama: 'Budi Santoso', jabatan: 'Sekretaris', bidang: '-', periode: '2025-2027', role: 'sekretaris', telepon: '0812-9988-7766' },
  { id: 4, nama: 'Dewi Anggraini', jabatan: 'Bendahara', bidang: '-', periode: '2025-2027', role: 'bendahara', telepon: '0857-1122-3344' },
  { id: 5, nama: 'Rudi Hartono', jabatan: 'Koordinator Bidang', bidang: 'Keagamaan', periode: '2025-2027', role: 'anggota', telepon: '0822-4455-6677' },
  { id: 6, nama: 'Rina Maharani', jabatan: 'Koordinator Bidang', bidang: 'Sosial & Kemanusiaan', periode: '2025-2027', role: 'anggota', telepon: '0811-5566-7788' },
  { id: 7, nama: 'Joko Prasetyo', jabatan: 'Koordinator Bidang', bidang: 'Olahraga', periode: '2025-2027', role: 'anggota', telepon: '0856-2233-4455' },
  { id: 8, nama: 'Lestari Putri', jabatan: 'Koordinator Bidang', bidang: 'Seni & Budaya', periode: '2025-2027', role: 'anggota', telepon: '0821-3344-5566' },
  { id: 9, nama: 'Andi Firmansyah', jabatan: 'Koordinator Bidang', bidang: 'Pendidikan', periode: '2025-2027', role: 'anggota', telepon: '0819-8877-6655' },
];
