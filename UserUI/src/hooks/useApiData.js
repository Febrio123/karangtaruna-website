// ============================================================================
// UserUI/src/hooks/useApiData.js — fetch-on-mount dengan loading/error/data +
// fallback ke data statis.
// ============================================================================
// Dipakai di semua halaman yang BUTUH data API. Pola:
//   - `loading` true awal >> tampilkan spinner/skeleton.
//   - sukses >> set data hasil adapter.
//   - gagal >> set `error` (untuk banner + tombol retry) dan SEKALIGUS set
//     `data` ke `fallback` (data statis src/data/*) supaya halaman tetap terisi
//     (graceful degradation). Log '[api] fallback: <url>' dicetak.
//
// `initial` (opsional): nilai yang dirender IMMEDIATELY tanpa spinner (misal
// statis siteConfig untuk Navbar/Footer/Hero) lalu di-refresh diam-diam dari
// API saat mount. Ini menjaga komponen layout selalu terisi dan test tetap hijau.
//
// PENTING untuk stabilitas render: berikan `url`, `adapter`, `fallback` yang
// STABIL (konstanta impor/global), bukan objek inline, agar `useEffect` tidak
// memicu loop. Kecuali `url` yang memang berubah sesuai prop (mis. slug).
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { getJson } from '../lib/api';

export default function useApiData({
  url,
  initial,
  fallback,
  adapter = (d) => d,
  enabled = true,
}) {
  const hasInitial = initial !== undefined;
  const [data, setData] = useState(hasInitial ? initial : null);
  const [loading, setLoading] = useState(hasInitial ? false : true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getJson(url)
      .then((raw) => {
        if (!cancelled) {
          const next = adapter(raw);
          setData(next || null);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.log(`[api] fallback: ${url}`);
        setError(err && err.message ? err.message : 'Gagal memuat data.');
        if (fallback !== undefined) {
          setData(typeof fallback === 'function' ? fallback() : fallback);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, attempt, enabled]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { data, loading, error, retry };
}
