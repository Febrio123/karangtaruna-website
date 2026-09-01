export const budgetData = {
  2026: {
    year: 2026,
    period: "Januari - Maret 2026 (aktif)",
    income: [
      { date: "2026-01-01", description: "Iuran anggota bulanan (150 orang x Rp 10.000)", amount: 1500000 },
      { date: "2026-01-15", description: "Dana kegiatan sosial dari warga", amount: 2000000 },
      { date: "2026-01-20", description: "Bantuan operasional dari Kelurahan", amount: 5000000 },
      { date: "2026-02-01", description: "Iuran anggota bulanan Februari", amount: 1500000 },
      { date: "2026-02-10", description: "Sponsor Turnamen Futsal", amount: 3000000 },
      { date: "2026-02-20", description: "Donasi warga untuk bakti sosial", amount: 2000000 },
      { date: "2026-03-01", description: "Iuran anggota bulanan Maret", amount: 1500000 },
    ],
    expenses: [
      { date: "2026-01-05", description: "Belanja ATK dan kebutuhan sekretariat", amount: 250000 },
      { date: "2026-01-10", description: "Sewa tempat acara Musyawarah Besar", amount: 500000 },
      { date: "2026-01-15", description: "Konsumsi pengajian rutin Ramadhan", amount: 800000 },
      { date: "2026-01-25", description: "Pembelian sembako bakti sosial (100 paket)", amount: 3500000 },
      { date: "2026-02-01", description: "Pembuatan spanduk dan banner", amount: 300000 },
      { date: "2026-02-10", description: "Perlengkapan Turnamen Futsal", amount: 2000000 },
      { date: "2026-02-15", description: "Konsumsi kegiatan sosialisasi", amount: 400000 },
      { date: "2026-02-20", description: "Pembelian takjil untuk dibagikan", amount: 1200000 },
      { date: "2026-03-01", description: "Perawatan pohon program Seribu Pohon", amount: 500000 },
      { date: "2026-03-05", description: "Operasional bulanan Maret", amount: 350000 },
    ],
  },
  2025: {
    year: 2025,
    period: "Januari - Desember 2025",
    income: [
      { date: "2025-01-01", description: "Iuran anggota bulanan", amount: 12000000 },
      { date: "2025-03-10", description: "Bantuan Kelurahan", amount: 8000000 },
      { date: "2025-05-15", description: "Donasi program lingkungan", amount: 3000000 },
      { date: "2025-08-01", description: "Sponsor kegiatan", amount: 5000000 },
      { date: "2025-10-20", description: "Dana sumbangan warga", amount: 4000000 },
    ],
    expenses: [
      { date: "2025-01-15", description: "Operasional sekretariat tahunan", amount: 3000000 },
      { date: "2025-03-20", description: "Bakti sosial dan sembako", amount: 8000000 },
      { date: "2025-05-10", description: "Program penanaman pohon", amount: 4000000 },
      { date: "2025-07-15", description: "Turnamen Futsal 2025", amount: 3500000 },
      { date: "2025-09-01", description: "Seminar kewirausahaan", amount: 4000000 },
      { date: "2025-11-20", description: "Bimbingan belajar - peralatan", amount: 2000000 },
      { date: "2025-12-15", description: "Akhir tahun - konsumsi dan evaluasi", amount: 2500000 },
    ],
  },
  2024: {
    year: 2024,
    period: "Januari - Desember 2024",
    income: [
      { date: "2024-01-01", description: "Iuran anggota bulanan", amount: 9600000 },
      { date: "2024-04-10", description: "Bantuan Kelurahan", amount: 6000000 },
      { date: "2024-07-15", description: "Donasi warga", amount: 2500000 },
      { date: "2024-10-01", description: "Sponsor kegiatan", amount: 3000000 },
    ],
    expenses: [
      { date: "2024-02-10", description: "Operasional sekretariat", amount: 2500000 },
      { date: "2024-04-15", description: "Bakti sosial Ramadhan", amount: 6000000 },
      { date: "2024-06-20", description: "Program bank sampah", amount: 2000000 },
      { date: "2024-08-10", description: "Turnamen Futsal", amount: 3000000 },
      { date: "2024-10-15", description: "Bimbingan belajar - operasional", amount: 1500000 },
      { date: "2024-12-01", description: "Evaluasi akhir tahun", amount: 2000000 },
    ],
  },
};

export function getBudgetSummary(year) {
  const data = budgetData[year];
  if (!data) return null;

  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);

  return {
    year: data.year,
    period: data.period,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    incomeCount: data.income.length,
    expenseCount: data.expenses.length,
  };
}
