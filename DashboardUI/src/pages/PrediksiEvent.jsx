import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Calculator,
  Percent,
  ArrowRight,
  ChevronDown,
  Info,
  HandCoins,
  Plus,
  X,
} from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import InlineNotice from '../components/ui/InlineNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import {
  historiAnggaranEvent as fallbackHistori,
  parameterEkonomi as fallbackParameter,
  getDaftarEvent as getFallbackDaftar,
} from '../data/prediksi.js'
import { prediksiEvent } from '../lib/prediksiAnggaran.js'
import { apiFetch } from '../lib/api'
import { anggaranEventAdapter, parameterAdapter } from '../lib/adapters.js'
import { formatCurrency } from '../utils/format.js'

// Inflasi yang dipakai = tahun terbaru dari parameter-ekonomi, fallback 2.8%.
function inflasiTerkini(list) {
  if (!list || list.length === 0) return 2.8
  return list.reduce((a, b) => (a.tahun > b.tahun ? a : b)).persentase
}

// Pastikan bentuk hasil prediksi API sama dengan hasil lib lokal.
function normalizeHasil(d) {
  const hd = Array.isArray(d?.histori_digunakan)
    ? d.histori_digunakan.map((x, i) => ({
        tahun: x.tahun,
        anggaran: Number(x.anggaran || 0),
        bobot: Number(x.bobot ?? i + 1),
      }))
    : []
  return {
    ...d,
    histori_digunakan: hd,
    jumlah_bobot: Number(d?.jumlah_bobot ?? hd.reduce((s, x) => s + x.bobot, 0)),
  }
}

export default function PrediksiEvent() {
  const [historiList, setHistoriList] = useState(fallbackHistori)
  const [parameter, setParameter] = useState(fallbackParameter)
  const [daftarEvent, setDaftarEvent] = useState(getFallbackDaftar())
  const [selectedEvent, setSelectedEvent] = useState('')
  const [apiHasil, setApiHasil] = useState(null)
  const [apiErrorMsg, setApiErrorMsg] = useState('')
  const [loadingRef, setLoadingRef] = useState(true)
  const [predLoading, setPredLoading] = useState(false)
  const [fallback, setFallback] = useState(false)
  const [showRumus, setShowRumus] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [historiForm, setHistoriForm] = useState({
    tahun: String(new Date().getFullYear()),
    anggaran: '',
  })
  const [formError, setFormError] = useState('')
  const [savingHistori, setSavingHistori] = useState(false)

  const tahunBerjalan = new Date().getFullYear()
  const tahunPrediksi = tahunBerjalan + 1

  async function loadReferences() {
    setLoadingRef(true)
    try {
      const [hist, names, params] = await Promise.all([
        apiFetch('/anggaran-event'),
        apiFetch('/anggaran-event/nama'),
        apiFetch('/parameter-ekonomi'),
      ])
      const h = Array.isArray(hist) ? hist : hist?.items || []
      if (h.length) setHistoriList(h)

      const nameList = Array.isArray(names)
        ? names
        : Array.isArray(names?.nama_event)
          ? names.nama_event
          : names?.items || []
      if (nameList.length) setDaftarEvent(nameList)

      const p = Array.isArray(params) ? params : params?.items || []
      setParameter(p.length ? p.map(parameterAdapter.toFrontend) : fallbackParameter)
      setFallback(false)
    } catch (err) {
      console.log('[api] fallback: anggaran-event/parameter', err)
      setFallback(true)
    } finally {
      setLoadingRef(false)
    }
  }

  useEffect(() => {
    loadReferences()
  }, [])

  useEffect(() => {
    if (!selectedEvent && daftarEvent.length) setSelectedEvent(daftarEvent[0])
  }, [daftarEvent, selectedEvent])

  const histori = useMemo(
    () => historiList.find((e) => e.nama_event === selectedEvent)?.histori || [],
    [historiList, selectedEvent]
  )

  const inflasi = inflasiTerkini(parameter)

  // Ambil hasil prediksi dari server setiap event berubah.
  useEffect(() => {
    if (!selectedEvent) return
    let active = true
    setPredLoading(true)
    setApiHasil(null)
    setApiErrorMsg('')
    apiFetch(`/prediksi-anggaran/${encodeURIComponent(selectedEvent)}?tahun_prediksi=${tahunPrediksi}`)
      .then((data) => {
        if (active) setApiHasil(normalizeHasil(data))
      })
      .catch((err) => {
        if (active) setApiErrorMsg(err?.message || 'Perhitungan prediksi gagal.')
      })
      .finally(() => {
        if (active) setPredLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent, histori.length])

  // Jika sedang proses prediksi API → hash hasil kosong; fallback ke perhitungan lokal
  // (memakai histori dari server, atau data cadangan bila API histori gagal).
  const hasil = useMemo(() => {
    if (apiHasil) return apiHasil
    if (predLoading) return null
    return prediksiEvent(histori, inflasi, tahunPrediksi)
  }, [apiHasil, predLoading, histori, inflasi, tahunPrediksi])

  async function handleSimpanHistori(e) {
    e.preventDefault()
    if (!historiForm.tahun || !historiForm.anggaran) {
      setFormError('Tahun dan anggaran wajib diisi.')
      return
    }
    setSavingHistori(true)
    setFormError('')
    try {
      await apiFetch('/anggaran-event', {
        method: 'POST',
        body: anggaranEventAdapter.toBody({ nama_event: selectedEvent, ...historiForm }),
      })
      setShowInput(false)
      setHistoriForm({ tahun: String(new Date().getFullYear()), anggaran: '' })
      await loadReferences()
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan anggaran historis.')
    } finally {
      setSavingHistori(false)
    }
  }

  const tahunHistori =
    histori.length > 0
      ? ` (${Math.min(...histori.map((h) => h.tahun))}–${Math.max(...histori.map((h) => h.tahun))})`
      : ''

  return (
    <div className="space-y-5">
      {/* Header bar: judul + aksi ke Parameter Ekonomi */}
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-bold text-h2 text-text">Prediksi Anggaran per Event</h2>
          <p className="text-caption text-text-muted mt-0.5">
            Estimasi anggaran event tahun depan memakai Weighted Moving Average + inflasi.
          </p>
        </div>
        <Link
          to="/prediksi-anggaran/parameter"
          className="btn-secondary shrink-0"
        >
          <Calculator size={16} aria-hidden="true" /> Kelola Parameter Ekonomi
        </Link>
      </div>

      {fallback && (
        <InlineNotice variant="warning">
          Server tidak dapat diakses — menampilkan data cadangan lokal (hasil perhitungan mungkin tidak mutakhir).
        </InlineNotice>
      )}

      {/* Memilih event */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 max-w-md">
            <label className="label" htmlFor="pilih-event">
              Pilih Event
            </label>
            <div className="relative">
              <select
                id="pilih-event"
                className="select pr-9 w-full"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={loadingRef && daftarEvent.length === 0}
              >
                {daftarEvent.map((nama) => (
                  <option key={nama} value={nama}>{nama}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
          {histori.length > 0 && (
            <Badge variant="primary" dot>
              {histori.length} tahun historis{tahunHistori}
            </Badge>
          )}
        </div>
      </div>

      {predLoading && !apiHasil ? (
        <LoadingState label="Menghitung prediksi anggaran..." />
      ) : hasil?.error ? (
        /* Kasus < 2 data historis */
        <div className="card p-5">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-14 h-14 rounded-full bg-accent-light text-accent flex items-center justify-center mb-4">
              <Info size={24} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h3 className="font-heading font-semibold text-h3 text-text">
              Data historis belum cukup
            </h3>
            <p className="text-caption text-text-muted mt-1.5 max-w-md">
              {apiErrorMsg || hasil.error}.
              {histori.length > 0 && (
                <>
                  {' '}Event &ldquo;{selectedEvent}&rdquo; baru tercatat pada{' '}
                  {histori[0]?.tahun} dengan anggaran{' '}
                  {formatCurrency(histori[0]?.anggaran)}.
                </>
              )}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm text-text-secondary">
              <HandCoins size={16} aria-hidden="true" />
              Anda bisa menambahkan anggaran historis untuk event ini secara manual.
            </div>

            <button
              type="button"
              className="btn-secondary mt-5 inline-flex items-center gap-2"
              onClick={() => {
                setShowInput((s) => !s)
                setFormError('')
              }}
            >
              {showInput ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
              {showInput ? 'Batalkan Input' : 'Input Anggaran Manual'}
            </button>

            {showInput && (
              <form onSubmit={handleSimpanHistori} className="mt-5 w-full max-w-sm space-y-3 text-left">
                {formError && <InlineNotice>{formError}</InlineNotice>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor="hist-tahun">Tahun</label>
                    <input
                      id="hist-tahun"
                      type="number"
                      min="2000"
                      required
                      className="input"
                      value={historiForm.tahun}
                      onChange={(e) => setHistoriForm((f) => ({ ...f, tahun: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="hist-anggaran">Anggaran (Rp)</label>
                    <input
                      id="hist-anggaran"
                      type="number"
                      min="0"
                      required
                      className="input"
                      value={historiForm.anggaran}
                      onChange={(e) => setHistoriForm((f) => ({ ...f, anggaran: e.target.value }))}
                      placeholder="cth: 2500000"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={savingHistori}>
                  {savingHistori ? (
                    <>
                      <Spinner size={14} /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Anggaran Historis'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : !hasil ? null : (
        <>
          {/* Summary besar: prediksi final */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-6 lg:col-span-2 bg-primary text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-11 h-11 rounded-lg bg-white/15 text-white flex items-center justify-center">
                  <TrendingUp size={22} aria-hidden="true" />
                </span>
                <p className="text-caption text-white/80 font-medium">
                  Prediksi Anggaran {tahunPrediksi}
                </p>
              </div>
              <p className="font-heading font-bold text-3xl sm:text-4xl text-white mt-1">
                {formatCurrency(hasil.prediksi_final)}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-white/85">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70" aria-hidden="true" />
                  Event: {selectedEvent}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70" aria-hidden="true" />
                  Inflasi: {hasil.persentase_inflasi_digunakan}%
                </span>
              </div>
            </div>

            {/* Kartu kecil: WMA + inflasi */}
            <div className="space-y-4">
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                    <Calculator size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-caption text-text-muted">WMA (tanpa inflasi)</p>
                    <p className="font-heading font-bold text-lg text-text mt-0.5">
                      {formatCurrency(hasil.wma)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-accent-light text-accent flex items-center justify-center">
                    <Percent size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-caption text-text-muted">Persentase Inflasi</p>
                    <p className="font-heading font-bold text-lg text-text mt-0.5">
                      {hasil.persentase_inflasi_digunakan}%
                      <span className="text-xs text-text-muted font-normal ml-1">(tahun terbaru)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Penjelasan rumus (accordion) */}
          <div className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRumus((s) => !s)}
              aria-expanded={showRumus}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-bg-alt/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="inline-flex items-center gap-2 font-heading font-semibold text-text">
                <Info size={17} aria-hidden="true" /> Bagaimana angka ini dihitung? (Weighted Moving Average)
              </span>
              <ChevronDown
                size={18}
                className={`text-text-muted transition-transform ${showRumus ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {showRumus && (
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed space-y-3 border-t border-border-light pt-4">
                <p>
                  <strong className="text-text">Rumus WMA:</strong> WMA = (D<sub>1</sub>·W<sub>1</sub> + D<sub>2</sub>·W<sub>2</sub> + … + D<sub>n</sub>·W<sub>n</sub>) / (W<sub>1</sub> + W<sub>2</sub> + … + W<sub>n</sub>)
                </p>
                <p>
                  D adalah anggaran event periode lalu, W adalah bobot — tahun terlama berbobot 1,
                  dan semakin baru tahunnya semakin besar bobotnya (+1 tiap periode).
                </p>
                <p>
                  <strong className="text-text">Prediksi final:</strong> WMA × (1 + inflasi/100) ={' '}
                  {formatCurrency(hasil.wma)} × (1 + {hasil.persentase_inflasi_digunakan}/100) ={' '}
                  <strong className="text-text">{formatCurrency(hasil.prediksi_final)}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Tabel histori yang digunakan */}
          <div className="card overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-border-light flex items-center justify-between">
              <h3 className="font-heading font-semibold text-h3 text-text">Histori yang Digunakan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light bg-bg-alt/50">
                    <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Tahun</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Anggaran</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Bobot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {hasil.histori_digunakan.map((d) => (
                    <tr key={d.tahun} className="hover:bg-primary-light/30 transition-colors">
                      <td className="px-5 py-3 text-sm text-text">{d.tahun}</td>
                      <td className="px-5 py-3 text-sm text-primary font-medium text-right whitespace-nowrap">
                        {formatCurrency(d.anggaran)}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary text-right">
                        <Badge variant="neutral">{d.bobot}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-bg-alt/50">
                    <td className="px-5 py-3 text-sm text-text" colSpan="2">
                      Jumlah bobot
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-text text-right">
                      {hasil.jumlah_bobot}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Catatan kecil */}
          <p className="text-xs text-text-muted inline-flex items-center gap-1.5">
            <ArrowRight size={13} aria-hidden="true" />
            Estimasi {tahunPrediksi} dihitung dari histori anggaran {selectedEvent} dan inflasi terbaru.
            Hasil bersifat indikatif untuk perencanaan.
          </p>
        </>
      )}
    </div>
  )
}