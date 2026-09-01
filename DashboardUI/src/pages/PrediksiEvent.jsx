import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Calculator,
  Percent,
  ArrowRight,
  ChevronDown,
  Info,
  HandCoins,
} from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import {
  historiAnggaranEvent,
  parameterEkonomi,
  getDaftarEvent,
} from '../data/prediksi.js'
import { prediksiEvent } from '../lib/prediksiAnggaran.js'
import { formatCurrency } from '../utils/format.js'

// Inflasi yang dipakai = tahun terbaru dari parameterEkonomi, fallback 2.8%.
function inflasiTerkini(parameterEkonomi) {
  if (!parameterEkonomi || parameterEkonomi.length === 0) return 2.8
  return parameterEkonomi.reduce((a, b) => (a.tahun > b.tahun ? a : b)).persentase
}

export default function PrediksiEvent() {
  const daftarEvent = getDaftarEvent()
  const [selectedEvent, setSelectedEvent] = useState(daftarEvent[0] || '')

  // Cari histori untuk event terpilih.
  const eventData = useMemo(
    () => historiAnggaranEvent.find((e) => e.nama_event === selectedEvent) || null,
    [selectedEvent]
  )

  const histori = eventData?.histori || []

  // Tahun yang diprediksi = tahun berjalan + 1.
  const tahunBerjalan = new Date().getFullYear()
  const tahunPrediksi = tahunBerjalan + 1

  const inflasi = inflasiTerkini(parameterEkonomi)

  const hasil = useMemo(
    () => prediksiEvent(histori, inflasi, tahunPrediksi),
    [histori, inflasi, tahunPrediksi]
  )

  const [showRumus, setShowRumus] = useState(false)

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
          {eventData && (
            <Badge variant="primary" dot>
              {histori.length} tahun historis{tahunHistori}
            </Badge>
          )}
        </div>
      </div>

      {hasil.error ? (
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
              {hasil.error}. Event &ldquo;{selectedEvent}&rdquo; baru tercatat pada{' '}
              {histori[0]?.tahun} dengan anggaran{' '}
              {formatCurrency(histori[0]?.anggaran)}.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm text-text-secondary">
              <HandCoins size={16} aria-hidden="true" />
              Anda masih bisa menginput anggaran secara manual (mockup).
            </div>
          </div>
        </div>
      ) : (
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
