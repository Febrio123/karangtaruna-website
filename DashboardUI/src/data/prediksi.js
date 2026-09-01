// Data mockup untuk fitur Prediksi Anggaran (Weighted Moving Average).
// Frontend-only — dummy data, TANPA backend.

// Histori anggaran event per tahun (diurutkan menaik per event).
// Catatan: "Bakti Sosial" sengaja hanya punya 1 data → contoh kasus error
// (data historis tidak cukup, minimal 2 data).
export const historiAnggaranEvent = [
  {
    nama_event: '17 Agustusan',
    histori: [
      { tahun: 2024, anggaran: 2000000 },
      { tahun: 2025, anggaran: 2300000 },
      { tahun: 2026, anggaran: 2500000 },
    ],
  },
  {
    nama_event: 'Ramadhan',
    histori: [
      { tahun: 2024, anggaran: 1500000 },
      { tahun: 2025, anggaran: 1700000 },
      { tahun: 2026, anggaran: 1900000 },
    ],
  },
  {
    nama_event: 'Maulid Nabi',
    histori: [
      { tahun: 2024, anggaran: 1200000 },
      { tahun: 2025, anggaran: 1350000 },
    ],
  },
  {
    nama_event: 'Bakti Sosial',
    histori: [{ tahun: 2025, anggaran: 2000000 }],
  },
]

// Parameter ekonomi (inflasi) yang diinput manual oleh admin.
export const parameterEkonomi = [
  { id: 1, tahun: 2026, persentase: 2.8, createdAt: '2026-08-01' },
  { id: 2, tahun: 2025, persentase: 2.5, createdAt: '2025-07-15' },
]

// Daftar nama event unik (dipakai untuk dropdown pilih event).
export function getDaftarEvent() {
  return historiAnggaranEvent.map((e) => e.nama_event)
}

// Ambil event berdasarkan nama.
export function getEventByName(nama) {
  return historiAnggaranEvent.find((e) => e.nama_event === nama) || null
}
