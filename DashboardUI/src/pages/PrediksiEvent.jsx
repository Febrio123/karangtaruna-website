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
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Save,
} from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import InlineNotice from '../components/ui/InlineNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Modal from '../components/ui/Modal.jsx'
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
  const [showInputCard, setShowInputCard] = useState(false)

  const tahunBerjalan = new Date().getFullYear()
  const tahunPrediksi = tahunBerjalan + 1

  const [historiForm, setHistoriForm] = useState({
    nama_event: '',
    isCustomEvent: false,
    tahun: String(tahunBerjalan),
    anggaran: '',
  })
  const [formError, setFormError] = useState('')
  const [savingHistori, setSavingHistori] = useState(false)

  // State Hapus Modal
  const [deleteTarget, setDeleteTarget] = useState(null) // { nama_event, tahun }
  const [deleting, setDeleting] = useState(false)

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

  // Fallback ke lib lokal jika API bermasalah.
  const hasil = useMemo(() => {
    if (apiHasil) return apiHasil
    if (predLoading) return null
    return prediksiEvent(histori, inflasi, tahunPrediksi)
  }, [apiHasil, predLoading, histori, inflasi, tahunPrediksi])

  // Reset form saat modal/kartu input dibuka
  function handleOpenInput(targetData = null) {
    if (targetData) {
      // Form edit data tertentu
      setHistoriForm({
        nama_event: selectedEvent,
        isCustomEvent: false,
        tahun: String(targetData.tahun),
        anggaran: String(targetData.anggaran),
      })
    } else {
      // Form input baru
      setHistoriForm({
        nama_event: selectedEvent || (daftarEvent[0] || ''),
        isCustomEvent: false,
        tahun: String(tahunBerjalan),
        anggaran: '',
      })
    }
    setFormError('')
    setShowInputCard(true)
  }

  async function handleSimpanHistori(e) {
    e.preventDefault()
    const targetEventName = historiForm.isCustomEvent
      ? historiForm.nama_event.trim()
      : historiForm.nama_event || selectedEvent

    if (!targetEventName) {
      setFormError('Nama event wajib diisi.')
      return
    }
    if (!historiForm.tahun || !historiForm.anggaran) {
      setFormError('Tahun dan nominal anggaran wajib diisi.')
      return
    }
    if (Number(historiForm.anggaran) < 0) {
      setFormError('Nominal anggaran tidak boleh negatif.')
      return
    }

    setSavingHistori(true)
    setFormError('')
    try {
      await apiFetch('/anggaran-event', {
        method: 'POST',
        body: anggaranEventAdapter.toBody({
          nama_event: targetEventName,
          tahun: historiForm.tahun,
          anggaran: historiForm.anggaran,
        }),
      })
      setShowInputCard(false)
      setSelectedEvent(targetEventName)
      await loadReferences()
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan anggaran event.')
    } finally {
      setSavingHistori(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiFetch(
        `/anggaran-event?nama_event=${encodeURIComponent(deleteTarget.nama_event)}&tahun=${deleteTarget.tahun}`,
        { method: 'DELETE' }
      )
      setDeleteTarget(null)
      await loadReferences()
    } catch (err) {
      alert(err?.message || 'Gagal menghapus data anggaran event.')
    } finally {
      setDeleting(false)
    }
  }

  const tahunHistori =
    histori.length > 0
      ? ` (${Math.min(...histori.map((h) => h.tahun))}–${Math.max(...histori.map((h) => h.tahun))})`
      : ''

  return (
    <div className="space-y-5">
      {/* Header bar: Judul + tombol aksi */}
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-h2 text-text">Prediksi & Kelola Anggaran Event</h2>
            <Badge variant="accent">WMA + Inflasi</Badge>
          </div>
          <p className="text-caption text-text-muted mt-1">
            Kelola input anggaran event (tahun ini & historis) untuk menghitung estimasi anggaran event tahun depan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleOpenInput()}
          >
            <Plus size={16} aria-hidden="true" /> Input Manual Anggaran Event
          </button>
          <Link
            to="/prediksi-anggaran/parameter"
            className="btn-secondary"
          >
            <Calculator size={16} aria-hidden="true" /> Parameter Ekonomi
          </Link>
        </div>
      </div>

      {fallback && (
        <InlineNotice variant="warning">
          Server tidak dapat diakses — menampilkan data cadangan lokal.
        </InlineNotice>
      )}

      {/* Form Input/Edit Anggaran Event (Card Collapse) */}
      {showInputCard && (
        <div className="card p-5 border-2 border-primary/20 bg-primary-light/10 relative">
          <button
            type="button"
            onClick={() => setShowInputCard(false)}
            className="absolute top-4 right-4 text-text-muted hover:text-text p-1 rounded-lg hover:bg-bg-alt transition-colors"
            title="Tutup Form"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <HandCoins size={18} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text text-base">
                Form Input / Update Manual Anggaran Event
              </h3>
              <p className="text-xs text-text-muted">
                Masukkan realisasi anggaran event tahun ini ({tahunBerjalan}) atau tahun sebelumnya.
              </p>
            </div>
          </div>

          {formError && <InlineNotice className="mb-4">{formError}</InlineNotice>}

          <form onSubmit={handleSimpanHistori} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event selection or custom name */}
              <div>
                <label className="label" htmlFor="input-event-name">
                  Nama Event
                </label>
                {!historiForm.isCustomEvent ? (
                  <div className="space-y-1.5">
                    <select
                      id="input-event-name"
                      className="select w-full"
                      value={historiForm.nama_event}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setHistoriForm((f) => ({ ...f, isCustomEvent: true, nama_event: '' }))
                        } else {
                          setHistoriForm((f) => ({ ...f, nama_event: e.target.value }))
                        }
                      }}
                    >
                      {daftarEvent.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                      <option value="__NEW__">+ Buat Event Baru...</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        className="input w-full"
                        placeholder="Contoh: HUT Karang Taruna"
                        value={historiForm.nama_event}
                        onChange={(e) => setHistoriForm((f) => ({ ...f, nama_event: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="btn-secondary text-xs shrink-0 py-2.5 px-3"
                        onClick={() => setHistoriForm((f) => ({ ...f, isCustomEvent: false, nama_event: selectedEvent }))}
                      >
                        Pilih Ada
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tahun */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="input-tahun">
                    Tahun
                  </label>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => setHistoriForm((f) => ({ ...f, tahun: String(tahunBerjalan) }))}
                    >
                      Tahun Ini ({tahunBerjalan})
                    </button>
                  </div>
                </div>
                <input
                  id="input-tahun"
                  type="number"
                  min="2000"
                  max="2100"
                  required
                  className="input w-full"
                  value={historiForm.tahun}
                  onChange={(e) => setHistoriForm((f) => ({ ...f, tahun: e.target.value }))}
                />
              </div>

              {/* Anggaran */}
              <div>
                <label className="label" htmlFor="input-anggaran">
                  Anggaran Event (Rp)
                </label>
                <input
                  id="input-anggaran"
                  type="number"
                  min="0"
                  step="50000"
                  required
                  className="input w-full"
                  placeholder="Contoh: 2500000"
                  value={historiForm.anggaran}
                  onChange={(e) => setHistoriForm((f) => ({ ...f, anggaran: e.target.value }))}
                />
              </div>
            </div>

            {/* Shortcut Tombol Preset Tahun */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-light">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Sparkles size={14} className="text-primary" />
                <span>Preset cepat:</span>
                <button
                  type="button"
                  className="px-2 py-1 bg-bg-alt hover:bg-primary-light hover:text-primary rounded text-xs transition-colors"
                  onClick={() => setHistoriForm((f) => ({ ...f, tahun: String(tahunBerjalan) }))}
                >
                  Tahun Ini ({tahunBerjalan})
                </button>
                <button
                  type="button"
                  className="px-2 py-1 bg-bg-alt hover:bg-primary-light hover:text-primary rounded text-xs transition-colors"
                  onClick={() => setHistoriForm((f) => ({ ...f, tahun: String(tahunBerjalan - 1) }))}
                >
                  {tahunBerjalan - 1}
                </button>
                <button
                  type="button"
                  className="px-2 py-1 bg-bg-alt hover:bg-primary-light hover:text-primary rounded text-xs transition-colors"
                  onClick={() => setHistoriForm((f) => ({ ...f, tahun: String(tahunBerjalan - 2) }))}
                >
                  {tahunBerjalan - 2}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={() => setShowInputCard(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm min-w-[130px]"
                  disabled={savingHistori}
                >
                  {savingHistori ? (
                    <>
                      <Spinner size={14} /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Simpan Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Memilih Event Aktif */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="label" htmlFor="pilih-event">
              Pilih Event yang Ingin Diprediksi / Dikelola
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
                  <option key={nama} value={nama}>
                    {nama}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {histori.length > 0 && (
              <Badge variant="primary" dot>
                {histori.length} tahun data historis tercatat{tahunHistori}
              </Badge>
            )}
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => handleOpenInput()}
            >
              <Plus size={14} /> Input Anggaran Event ({selectedEvent})
            </button>
          </div>
        </div>
      </div>

      {/* Konten Hasil Prediksi */}
      {predLoading && !apiHasil ? (
        <LoadingState label="Menghitung prediksi anggaran WMA..." />
      ) : hasil?.error ? (
        /* Kasus < 2 data historis */
        <div className="card p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-light text-accent flex items-center justify-center mx-auto mb-4">
            <Info size={24} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h3 className="font-heading font-semibold text-h3 text-text">
            Data Historis Belum Cukup ({histori.length}/2 Tahun)
          </h3>
          <p className="text-caption text-text-muted mt-2 max-w-md mx-auto">
            {apiErrorMsg || hasil.error}. Untuk menggunakan algoritma Weighted Moving Average (WMA), dibutuhkan minimal 2 tahun data anggaran historis.
            {histori.length === 1 && (
              <span className="block mt-1 font-medium text-text">
                Event &ldquo;{selectedEvent}&rdquo; baru tercatat 1 tahun ({histori[0]?.tahun}: {formatCurrency(histori[0]?.anggaran)}). Tambahkan data anggaran tahun ini ({tahunBerjalan}) atau tahun lainnya.
              </span>
            )}
          </p>

          <button
            type="button"
            className="btn-primary mt-5 inline-flex items-center gap-2"
            onClick={() => handleOpenInput()}
          >
            <Plus size={16} /> Input Manual Anggaran Event Tahun Ini / Historis
          </button>
        </div>
      ) : !hasil ? null : (
        <>
          {/* Summary besar: prediksi final */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-6 lg:col-span-2 bg-primary text-white relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-11 h-11 rounded-lg bg-white/15 text-white flex items-center justify-center">
                  <TrendingUp size={22} aria-hidden="true" />
                </span>
                <p className="text-caption text-white/80 font-medium">
                  Hasil Prediksi Anggaran {tahunPrediksi}
                </p>
              </div>
              <p className="font-heading font-bold text-3xl sm:text-4xl text-white mt-1">
                {formatCurrency(hasil.prediksi_final)}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-white/85">
                <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md">
                  Event: <strong>{selectedEvent}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md">
                  Inflasi Digunakan: <strong>{hasil.persentase_inflasi_digunakan}%</strong>
                </span>
              </div>
            </div>

            {/* Kartu ringkasan kecil */}
            <div className="space-y-4">
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                    <Calculator size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-caption text-text-muted">Hasil WMA (Murni)</p>
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
                    <p className="text-caption text-text-muted">Faktor Inflasi Terkini</p>
                    <p className="font-heading font-bold text-lg text-text mt-0.5">
                      +{hasil.persentase_inflasi_digunakan}%
                      <span className="text-xs text-text-muted font-normal ml-1">(parameter ekonomi)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rumus Accordion */}
          <div className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRumus((s) => !s)}
              aria-expanded={showRumus}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-bg-alt/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="inline-flex items-center gap-2 font-heading font-semibold text-text">
                <Info size={17} aria-hidden="true" /> Rincian Perhitungan Algoritma Weighted Moving Average (WMA)
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
                  <strong className="text-text">Prinsip WMA:</strong> Data anggaran terbaru mendapat bobot terbesar.
                </p>
                <p>
                  <strong className="text-text">Formula WMA:</strong> (Data<sub>1</sub>×1 + Data<sub>2</sub>×2 + ... + Data<sub>n</sub>×n) / Jumlah Bobot
                </p>
                <p>
                  <strong className="text-text">Penyesuaian Inflasi:</strong> Hasil WMA ({formatCurrency(hasil.wma)}) × (1 + {hasil.persentase_inflasi_digunakan}/100) = <strong className="text-primary font-bold">{formatCurrency(hasil.prediksi_final)}</strong>.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* TABEL PENGELOLAAN ANGGARAN HISTORIS (Tahun Ini & Lalu) */}
      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-semibold text-h3 text-text flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Kelola & Riwayat Anggaran Event: <span className="text-primary">{selectedEvent}</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Daftar data anggaran historis yang digunakan sebagai input perhitungan algoritma WMA.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary text-xs shrink-0"
            onClick={() => handleOpenInput()}
          >
            <Plus size={14} /> Input Anggaran Event
          </button>
        </div>

        {histori.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            Belum ada riwayat anggaran untuk event &ldquo;{selectedEvent}&rdquo;. Klik tombol &ldquo;Input Anggaran Event&rdquo; untuk menambahkan data tahun ini atau tahun sebelumnya.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light bg-bg-alt/50">
                  <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Tahun</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Nominal Anggaran</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-center">Status / Bobot WMA</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-center">Aksi Pengelolaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {histori
                  .slice()
                  .sort((a, b) => b.tahun - a.tahun)
                  .map((d, index) => {
                    const isCurrentYear = d.tahun === tahunBerjalan
                    // Bobot urut dari tahun terkecil
                    const sortedAsc = histori.slice().sort((a, b) => a.tahun - b.tahun)
                    const bobotIndex = sortedAsc.findIndex((x) => x.tahun === d.tahun) + 1

                    return (
                      <tr key={d.tahun} className="hover:bg-primary-light/20 transition-colors">
                        <td className="px-5 py-3.5 text-sm text-text font-medium">
                          <div className="flex items-center gap-2">
                            <span>{d.tahun}</span>
                            {isCurrentYear && (
                              <Badge variant="primary" dot>
                                Tahun Ini
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-primary font-bold text-right whitespace-nowrap">
                          {formatCurrency(d.anggaran)}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-center">
                          <Badge variant="neutral">Bobot: {bobotIndex}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1"
                              title="Edit Nominal / Tahun"
                              onClick={() => handleOpenInput(d)}
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn-secondary text-xs text-error hover:bg-error-light/30 px-2.5 py-1 flex items-center gap-1"
                              title="Hapus Data Anggaran ini"
                              onClick={() => setDeleteTarget({ nama_event: selectedEvent, tahun: d.tahun })}
                            >
                              <Trash2 size={13} /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <Modal
          title="Konfirmasi Hapus Data Anggaran"
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Apakah Anda yakin ingin menghapus data anggaran event <strong>{deleteTarget.nama_event}</strong> untuk tahun <strong>{deleteTarget.tahun}</strong>? Perhitungan prediksi WMA akan diperbarui secara otomatis.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-primary bg-error hover:bg-error/90 border-error"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? <Spinner size={14} /> : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}