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

export const anggaranByTahun = {
  '2026': {
    pemasukan: [
      { id: 1, tanggal: '2026-01-05', keterangan: 'Iuran anggota bulanan', jumlah: 1250000 },
      { id: 2, tanggal: '2026-01-15', keterangan: 'Dana bantuan desa', jumlah: 5000000 },
      { id: 3, tanggal: '2026-02-10', keterangan: 'Donasi masyarakat', jumlah: 750000 },
      { id: 4, tanggal: '2026-03-08', keterangan: 'Kas usaha koperasi', jumlah: 2000000 },
      { id: 5, tanggal: '2026-04-12', keterangan: 'Iuran kegiatan keagamaan', jumlah: 850000 },
      { id: 6, tanggal: '2026-05-20', keterangan: 'Sumbangan sponsor event', jumlah: 3000000 },
      { id: 7, tanggal: '2026-07-02', keterangan: 'Iuran anggota bulanan', jumlah: 1250000 },
    ],
    pengeluaran: [
      { id: 1, tanggal: '2026-01-18', keterangan: 'Belanja ATK kesekretariatan', jumlah: 350000 },
      { id: 2, tanggal: '2026-02-22', keterangan: 'Konsumsi rapat bulanan', jumlah: 250000 },
      { id: 3, tanggal: '2026-03-15', keterangan: 'Sewa tenda acara 17 Agustus', jumlah: 1200000 },
      { id: 4, tanggal: '2026-04-05', keterangan: 'Dana transportasi bakti sosial', jumlah: 800000 },
      { id: 5, tanggal: '2026-06-28', keterangan: 'Hadiah lomba pemuda', jumlah: 1100000 },
      { id: 6, tanggal: '2026-07-19', keterangan: 'Media promosi & cetak', jumlah: 450000 },
    ],
  },
  '2025': {
    pemasukan: [
      { id: 1, tanggal: '2025-01-08', keterangan: 'Iuran anggota', jumlah: 1200000 },
      { id: 2, tanggal: '2025-03-10', keterangan: 'Dana bantuan desa', jumlah: 4000000 },
      { id: 3, tanggal: '2025-06-15', keterangan: 'Donasi kegiatan', jumlah: 950000 },
    ],
    pengeluaran: [
      { id: 1, tanggal: '2025-02-05', keterangan: 'ATK & alat tulis', jumlah: 300000 },
      { id: 2, tanggal: '2025-04-12', keterangan: 'Konsumsi kegiatan', jumlah: 420000 },
      { id: 3, tanggal: '2025-08-20', keterangan: 'Dekorasi 17 Agustus', jumlah: 980000 },
    ],
  },
  '2024': {
    pemasukan: [
      { id: 1, tanggal: '2024-02-02', keterangan: 'Iuran anggota', jumlah: 1000000 },
      { id: 2, tanggal: '2024-05-20', keterangan: 'Bantuan desa', jumlah: 3500000 },
    ],
    pengeluaran: [
      { id: 1, tanggal: '2024-03-01', keterangan: 'Belanja kegiatan', jumlah: 500000 },
      { id: 2, tanggal: '2024-07-10', keterangan: 'Konsumsi rapat', jumlah: 280000 },
    ],
  },
};
