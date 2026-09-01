// Data ringkasan dashboard — statistik, aktivitas terbaru, chart pendapatan vs pengeluaran.

export const stats = {
  totalPengurus: 24,
  totalBerita: 42,
  totalEvent: 18,
  saldoKas: 12850000,
};

export const kasChart = {
  months: [
    { bulan: 'Jan', pemasukan: 2500000, pengeluaran: 1800000 },
    { bulan: 'Feb', pemasukan: 3100000, pengeluaran: 2200000 },
    { bulan: 'Mar', pemasukan: 2800000, pengeluaran: 2600000 },
    { bulan: 'Apr', pemasukan: 3400000, pengeluaran: 2100000 },
    { bulan: 'Mei', pemasukan: 3900000, pengeluaran: 2950000 },
    { bulan: 'Jun', pemasukan: 3600000, pengeluaran: 2400000 },
    { bulan: 'Jul', pemasukan: 4200000, pengeluaran: 3300000 },
    { bulan: 'Agu', pemasukan: 4500000, pengeluaran: 3100000 },
  ],
};

export const recentActivities = [
  { id: 1, tipe: 'berita', ikon: 'FileText', pesan: 'Berita baru diterbitkan: "Gotong Royong Bersih Desa"', waktu: '2 jam lalu' },
  { id: 2, tipe: 'event', ikon: 'Calendar', pesan: 'Event baru dijadwalkan: "Turnamen Futsal Antarpemuda"', waktu: '5 jam lalu' },
  { id: 3, tipe: 'anggaran', ikon: 'Wallet', pesan: 'Pemasukan kas tercatat: Iuran anggota bulan Agustus', waktu: '1 hari lalu' },
  { id: 4, tipe: 'pengurus', ikon: 'UserPlus', pesan: 'Pengurus baru ditambahkan: Rina Maharani (Bidang Sosial)', waktu: '2 hari lalu' },
  { id: 5, tipe: 'galeri', ikon: 'Image', pesan: 'Foto baru diunggah di galeri "17 Agustusan"', waktu: '3 hari lalu' },
];

export const upcomingEvents = [
  { id: 1, judul: 'Turnamen Futsal Antarpemuda', tanggal: '2026-09-12', lokasi: 'Lapangan Desa', status: 'Mendatang' },
  { id: 2, judul: 'Pelatihan Kewirausahaan', tanggal: '2026-09-18', lokasi: 'Aula Balai Desa', status: 'Mendatang' },
  { id: 3, judul: 'Bakti Sosial Panti Asuhan', tanggal: '2026-09-25', lokasi: 'Panti Asuhan Kasih Ibu', status: 'Mendatang' },
];
