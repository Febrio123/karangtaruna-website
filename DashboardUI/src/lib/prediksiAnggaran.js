// Fungsi murni perhitungan Prediksi Anggaran (Weighted Moving Average).
// Mudah diuji unit — tidak bergantung pada state/komponen React.

/**
 * Hitung Weighted Moving Average (WMA) dari array data anggaran.
 *
 * Rumus: WMA = (D1*W1 + D2*W2 + ... + Dn*Wn) / (W1+W2+...+Wn)
 * Bobot dimulai dari 1 untuk data terlama, naik +1 tiap periode menuju terbaru.
 *
 * @param {Array<{tahun:number, anggaran:number}>} dataAnggaran Data yang sudah
 *   terurut menaik berdasarkan tahun (terlama → terbaru).
 * @returns {{ wma: number, detail: Array<{tahun, anggaran, bobot}>, jumlahBobot: number }}
 */
export function hitungWMA(dataAnggaran) {
  const list = [...dataAnggaran]
    .slice()
    .sort((a, b) => Number(a.tahun) - Number(b.tahun))

  const detail = list.map((d, idx) => ({
    tahun: d.tahun,
    anggaran: d.anggaran,
    bobot: idx + 1, // terlama = bobot 1, makin baru makin besar
  }))

  const jumlahBobot = detail.reduce((s, d) => s + d.bobot, 0)
  const wma =
    jumlahBobot === 0
      ? 0
      : detail.reduce((s, d) => s + d.anggaran * d.bobot, 0) / jumlahBobot

  return { wma, detail, jumlahBobot }
}

/**
 * Terapkan persentase inflasi pada nilai WMA untuk mendapat prediksi final.
 *
 * @param {number} wma Nilai Weighted Moving Average.
 * @param {number} persentaseInflasi Angka inflasi dalam persen (contoh 2.8).
 * @returns {number} Prediksi akhir = wma * (1 + inflasi/100).
 */
export function hitungPrediksiFinal(wma, persentaseInflasi) {
  return wma * (1 + Number(persentaseInflasi || 0) / 100)
}

/**
 * Gabungkan proses: hitung WMA lalu terapkan inflasi untuk satu event.
 *
 * @param {Array<{tahun:number, anggaran:number}>} histori Histori anggaran event.
 * @param {number} persentaseInflasi Persentase inflasi yang digunakan.
 * @param {number} tahunPrediksi Tahun yang diprediksi (default 0 → dihitung dari histori terbaru + 1).
 * @returns {object} Hasil prediksi lengkap, atau { error } bila histori < 2 data.
 */
export function prediksiEvent(histori, persentaseInflasi, tahunPrediksi = 0) {
  if (!histori || histori.length < 2) {
    return {
      error:
        'Data historis event ini belum cukup untuk menghitung prediksi (minimal 2 data)',
    }
  }

  const { wma, detail, jumlahBobot } = hitungWMA(histori)
  const wmaBeras = hitungPrediksiFinal(wma, persentaseInflasi)

  const tahunTerakhir = Math.max(...histori.map((d) => Number(d.tahun)))
  const tahunPred = tahunPrediksi || tahunTerakhir + 1

  return {
    nama_event: histori[0]?.nama_event || '',
    tahun_prediksi: tahunPred,
    histori_digunakan: detail, // [{tahun, anggaran, bobot}]
    wma,
    persentase_inflasi_digunakan: Number(persentaseInflasi),
    prediksi_final: wmaBeras,
    jumlah_bobot: jumlahBobot,
  }
}
