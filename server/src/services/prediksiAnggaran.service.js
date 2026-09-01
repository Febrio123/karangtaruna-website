// ============================================================================
// services/prediksiAnggaran.service.js
// ============================================================================
// Logika murni perhitungan Prediksi Anggaran (WMA + faktor inflasi).
// TIDAK menyentuh HTTP / DB — murni fungsi → mudah di-unit-test (lihat test/).
//
// Rumus (persis sesuai requirement):
//   WMA          = (D1×W1 + D2×W2 + ... + Dn×Wn) / (W1+W2+...+Wn)
//   Prediksi_final = WMA × (1 + persentase_inflasi/100)
//
// Contoh requirement (event "17 Agustusan", prediksi 2027):
//   histori 2024/2.000.000, 2025/2.300.000, 2026/2.500.000 (bobot 1,2,3)
//   WMA = 14.100.000 / 6 = 2.350.000
//   Prediksi_final = 2.350.000 × (1 + 0,028) = 2.415.800
// ============================================================================

/** Error khusus prediksi — controller memetakannya ke HTTP 422. */
export class PrediksiError extends Error {
  constructor(message, code = 'PREDIKSI_ERROR') {
    super(message);
    this.name = 'PrediksiError';
    this.code = code;
    this.isPrediksiError = true;
  }
}

export const MINIMAL_DATA = 2;

export const PESAN_DATA_KURANG =
  'Data historis event ini belum cukup untuk menghitung prediksi (minimal 2 data)';

/**
 * hitungWMA(data, bobot)
 * @param {Array<{tahun:number, anggaran:number}>} data  — histori urut tahun ascending
 * @param {number[]} [bobot] — bobot WMA; default 1..n (tahun terlama = 1)
 * @returns {number} WMA dibulatkan ke Rupiah (integer)
 */
export function hitungWMA(data = [], bobot = null) {
  if (!Array.isArray(data) || data.length === 0) return 0;

  const weights = resolveBobot(data, bobot);
  const numerator = data.reduce((sum, d, i) => sum + d.anggaran * weights[i], 0);
  const denominator = weights.reduce((a, b) => a + b, 0);

  if (denominator === 0) return 0;
  return Math.round(numerator / denominator);
}

/**
 * Prediksi_final = WMA × (1 + inflasi/100)
 * @param {number} wma
 * @param {number} persentaseInflasi — misal 2.8 (satuan persen)
 * @returns {number} dibulatkan ke Rupiah (integer)
 */
export function hitungPrediksiFinal(wma, persentaseInflasi) {
  return Math.round(wma * (1 + Number(persentaseInflasi) / 100));
}

/**
 * Validasi minimal data historis.
 * @param {number} n
 * @returns {boolean}
 */
export function validasiCukupData(n) {
  return Number(n) >= MINIMAL_DATA;
}

/**
 * Parsing query bobot "1,2,3" -> [1,2,3].
 * @param {string|number[]|null|undefined} bobotStr
 * @returns {number[]|null}
 * @throws {PrediksiError} bila nilai bukan angka positif
 */
export function parseBobot(bobotStr) {
  if (bobotStr === null || bobotStr === undefined || bobotStr === '') return null;

  let arr = null;
  if (Array.isArray(bobotStr)) {
    arr = bobotStr;
  } else if (typeof bobotStr === 'string') {
    arr = bobotStr.split(',').map((s) => s.trim());
  } else if (typeof bobotStr === 'number') {
    arr = [bobotStr];
  }

  if (!Array.isArray(arr) || arr.length === 0) return null;

  const weights = arr.map((w) => Number(w));
  const invalid = weights.some((w) => !Number.isFinite(w) || w <= 0);
  if (invalid) {
    throw new PrediksiError('Bobot harus berupa angka positif, dipisah koma (contoh: 1,2,3).', 'BOBOT_INVALID');
  }
  return weights;
}

/** Resolve bobot: custom jika jumlah cocok, else default 1..n. */
function resolveBobot(data, bobot) {
  if (Array.isArray(bobot) && bobot.length === data.length) {
    return bobot.map((w) => Number(w));
  }
  return data.map((_, i) => i + 1);
}

/**
 * Hitung prediksi lengkap dari data historis + parameter inflasi.
 * Murni fungsi — controller mengambil data dari DB lalu memanggil ini.
 *
 * @param {Object} params
 * @param {string} params.namaEvent
 * @param {number} params.tahunPrediksi
 * @param {Array<{tahun:number, anggaran:number}>} params.histori  — sorted by tahun asc
 * @param {number} params.persentaseInflasi — misal 2.8
 * @param {number[]|string|null} [params.bobot] — custom bobot (akan di-parse)
 * @returns {{
 *   nama_event: string,
 *   tahun_prediksi: number,
 *   histori_digunakan: Array<{tahun:number, anggaran:number, bobot:number}>,
 *   wma: number,
 *   persentase_inflasi_digunakan: number,
 *   prediksi_final: number
 * }}
 * @throws {PrediksiError} jika histori < 2 data
 */
export function hitungPrediksi({ namaEvent, tahunPrediksi, histori, persentaseInflasi, bobot = null }) {
  if (!Array.isArray(histori)) {
    throw new PrediksiError(PESAN_DATA_KURANG, 'DATA_KURANG');
  }
  if (!validasiCukupData(histori.length)) {
    throw new PrediksiError(PESAN_DATA_KURANG, 'DATA_KURANG');
  }

  // Sortir histori ascending by tahun (anggap data sudah urut — tetap amankan)
  const sorted = [...histori].sort((a, b) => a.tahun - b.tahun);

  const customBobot = parseBobot(bobot);
  if (customBobot && customBobot.length !== sorted.length) {
    throw new PrediksiError(
      `Jumlah bobot (${customBobot.length}) tidak sama dengan jumlah data historis (${sorted.length}).`,
      'BOBOT_LENGTH_MISMATCH'
    );
  }
  const weights = customBobot || sorted.map((_, i) => i + 1);

  const wma = hitungWMA(sorted, weights);
  const persentaseInflasiNum = Number(persentaseInflasi);
  const prediksiFinal = hitungPrediksiFinal(wma, persentaseInflasiNum);

  return {
    nama_event: namaEvent,
    tahun_prediksi: tahunPrediksi,
    histori_digunakan: sorted.map((d, i) => ({
      tahun: d.tahun,
      anggaran: d.anggaran,
      bobot: weights[i],
    })),
    wma,
    persentase_inflasi_digunakan: persentaseInflasiNum,
    prediksi_final: prediksiFinal,
  };
}

/**
 * Ambil tahun prediksi default = tahun berjalan + 1.
 */
export function tahunPrediksiDefault(now = new Date()) {
  return now.getFullYear() + 1;
}