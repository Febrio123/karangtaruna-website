// Data anggaran kas per tahun.

// Tahun berjalan — otomatis mengikuti tanggal sistem, jadi saat memasuki
// tahun baru dashboard langsung membuka tahun tersebut tanpa set manual.
export const tahunBerjalan = String(new Date().getFullYear());

// Daftar tahun yang tersedia: gabungan tahun yang sudah punya data +
// tahun berjalan, diurutkan menurun (terbaru dulu) dan unik.
// Tahun berjalan dijamin selalu ikut ada walau belum punya data.
export function getTahunList() {
  const set = new Set(Object.keys(anggaranByTahun));
  set.add(tahunBerjalan);
  return Array.from(set).sort((a, b) => Number(b) - Number(a));
}

export const anggaranByTahun = {};
