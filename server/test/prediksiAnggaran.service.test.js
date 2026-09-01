// ============================================================================
// test/prediksiAnggaran.service.test.js
// Unit test logika prediksi WMA + inflasi — PERSIS contoh requirement:
//   WMA "17 Agustusan" = 2.350.000 ; prediksi_final 2027 = 2.415.800
// Jalankan: npm test  (node --test test/)
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  hitungWMA,
  hitungPrediksiFinal,
  hitungPrediksi,
  parseBobot,
  validasiCukupData,
  PrediksiError,
  PESAN_DATA_KURANG,
  tahunPrediksiDefault,
} from '../src/services/prediksiAnggaran.service.js';

// Data histori contoh PERSIS dari requirement
const historiContoh = [
  { tahun: 2024, anggaran: 2000000 },
  { tahun: 2025, anggaran: 2300000 },
  { tahun: 2026, anggaran: 2500000 },
];

describe('hitungWMA', () => {
  test('contoh requirement: WMA = (2jt*1 + 2,3jt*2 + 2,5jt*3)/(1+2+3) = 2.350.000', () => {
    assert.equal(hitungWMA(historiContoh), 2350000);
  });

  test('bobot default otomatis 1..n untuk data 4 tahun', () => {
    const data = [
      { tahun: 2023, anggaran: 1000 },
      { tahun: 2024, anggaran: 2000 },
      { tahun: 2025, anggaran: 3000 },
      { tahun: 2026, anggaran: 4000 },
    ];
    // (1000*1 + 2000*2 + 3000*3 + 4000*4) / 10 = 30000/10 = 3000
    assert.equal(hitungWMA(data), 3000);
  });

  test('bobot custom dihormati (data terbaru bobot paling kecil => hasil beda)', () => {
    // (2jt*1 + 2,3jt*2 + 2,5jt*3) vs (2jt*3 + 2,3jt*2 + 2,5jt*1) = 13.100.000/6
    const custom = hitungWMA(historiContoh, [3, 2, 1]);
    assert.equal(custom, Math.round(13100000 / 6));
  });

  test('data kosong -> 0 (tidak melempar)', () => {
    assert.equal(hitungWMA([]), 0);
    assert.equal(hitungWMA(null), 0);
  });
});

describe('hitungPrediksiFinal', () => {
  test('contoh requirement: 2.350.000 x (1 + 2,8/100) = 2.415.800', () => {
    assert.equal(hitungPrediksiFinal(2350000, 2.8), 2415800);
  });

  test('inflasi 0 -> prediksi = WMA', () => {
    assert.equal(hitungPrediksiFinal(1000000, 0), 1000000);
  });

  test('inflasi negatif (deflasi) menurunkan prediksi', () => {
    assert.equal(hitungPrediksiFinal(1000000, -1.5), 985000);
  });
});

describe('hitungPrediksi (end-to-end service)', () => {
  test('output PERSIS contoh JSON requirement (17 Agustusan, prediksi 2027)', () => {
    const result = hitungPrediksi({
      namaEvent: '17 Agustusan',
      tahunPrediksi: 2027,
      histori: historiContoh,
      persentaseInflasi: 2.8,
    });

    assert.deepEqual(result, {
      nama_event: '17 Agustusan',
      tahun_prediksi: 2027,
      histori_digunakan: [
        { tahun: 2024, anggaran: 2000000, bobot: 1 },
        { tahun: 2025, anggaran: 2300000, bobot: 2 },
        { tahun: 2026, anggaran: 2500000, bobot: 3 },
      ],
      wma: 2350000,
      persentase_inflasi_digunakan: 2.8,
      prediksi_final: 2415800,
    });
  });

  test('histori kurang dari 2 data -> PrediksiError dengan pesan persis requirement', () => {
    const satuData = [{ tahun: 2026, anggaran: 7000000 }];
    assert.throws(
      () =>
        hitungPrediksi({
          namaEvent: 'Bakti Sosial Akbar',
          tahunPrediksi: 2027,
          histori: satuData,
          persentaseInflasi: 2.8,
        }),
      (err) => {
        assert.ok(err instanceof PrediksiError);
        assert.equal(
          err.message,
          'Data historis event ini belum cukup untuk menghitung prediksi (minimal 2 data)'
        );
        assert.equal(err.code, 'DATA_KURANG');
        return true;
      }
    );
  });

  test('histori kosong -> pesan yang sama', () => {
    assert.throws(
      () =>
        hitungPrediksi({
          namaEvent: 'Event Baru',
          tahunPrediksi: 2027,
          histori: [],
          persentaseInflasi: 2.8,
        }),
      (err) => err.isPrediksiError === true
    );
  });

  test('bobot custom via string "1,2,3" (query param) menghasilkan output sama', () => {
    const result = hitungPrediksi({
      namaEvent: '17 Agustusan',
      tahunPrediksi: 2027,
      histori: historiContoh,
      persentaseInflasi: 2.8,
      bobot: '1,2,3',
    });
    assert.equal(result.wma, 2350000);
    assert.equal(result.prediksi_final, 2415800);
  });

  test('jumlah bobot tidak sama dengan jumlah data -> PrediksiError', () => {
    assert.throws(
      () =>
        hitungPrediksi({
          namaEvent: '17 Agustusan',
          tahunPrediksi: 2027,
          histori: historiContoh,
          persentaseInflasi: 2.8,
          bobot: '1,2',
        }),
      (err) => err.isPrediksiError === true && err.code === 'BOBOT_LENGTH_MISMATCH'
    );
  });

  test('histori tidak urut tetap diurutkan sebelum dihitung', () => {
    const acak = [
      { tahun: 2026, anggaran: 2500000 },
      { tahun: 2024, anggaran: 2000000 },
      { tahun: 2025, anggaran: 2300000 },
    ];
    const result = hitungPrediksi({
      namaEvent: '17 Agustusan',
      tahunPrediksi: 2027,
      histori: acak,
      persentaseInflasi: 2.8,
    });
    assert.equal(result.wma, 2350000);
    assert.deepEqual(
      result.histori_digunakan.map((h) => h.tahun),
      [2024, 2025, 2026]
    );
  });
});

describe('parseBobot & validasi', () => {
  test('parse "1,2,3" -> [1,2,3]', () => {
    assert.deepEqual(parseBobot('1,2,3'), [1, 2, 3]);
  });
  test('parse kosong/null -> null', () => {
    assert.equal(parseBobot(null), null);
    assert.equal(parseBobot(''), null);
    assert.equal(parseBobot(undefined), null);
  });
  test('parse angka negatif / bukan angka -> PrediksiError', () => {
    assert.throws(() => parseBobot('1,-2,3'), (err) => err.isPrediksiError === true);
    assert.throws(() => parseBobot('a,b'), (err) => err.isPrediksiError === true);
  });
  test('validasiCukupData(2) true, validasiCukupData(1) false', () => {
    assert.equal(validasiCukupData(2), true);
    assert.equal(validasiCukupData(3), true);
    assert.equal(validasiCukupData(1), false);
    assert.equal(validasiCukupData(0), false);
  });
});

describe('tahunPrediksiDefault', () => {
  test('default = tahun berjalan + 1', () => {
    const now = new Date('2026-09-01');
    assert.equal(tahunPrediksiDefault(now), 2027);
  });
});

describe('pesan error requirement', () => {
  test('PESAN_DATA_KURANG persis sesuai requirement', () => {
    assert.equal(
      PESAN_DATA_KURANG,
      'Data historis event ini belum cukup untuk menghitung prediksi (minimal 2 data)'
    );
  });
});