import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, Wallet, TrendingUp, TrendingDown, ChevronDown, Search } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import InlineNotice from '../components/ui/InlineNotice.jsx'
import KasChartCard from '../components/ui/KasChartCard.jsx'
import { apiFetch } from '../lib/api'
import { transaksiAdapter } from '../lib/adapters.js'
import { anggaranByTahun, getTahunList, tahunBerjalan } from '../data/anggaran.js'
import { formatCurrency, formatDateShort } from '../utils/format.js'

const BULAN_NAMA = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// Ambil index bulan (0-11) dari tanggal "YYYY-MM-DD" — aman dari zona waktu.
function bulanIndex(tanggal) {
  const [, m] = String(tanggal).split('-').map(Number)
  if (m >= 1 && m <= 12) return m - 1
  return new Date(tanggal).getMonth()
}

// Agregat list transaksi menjadi total per bulan (Jan-Des) untuk chart.
function aggregatePerBulan(list) {
  const total = Array(12).fill(0)
  list.forEach((item) => {
    const idx = bulanIndex(item.tanggal)
    if (idx >= 0 && idx < 12) total[idx] += item.jumlah
  })
  return total
}

const emptyForm = (jenis) => ({
  jenis,
  tanggal: new Date().toISOString().slice(0, 10),
  keterangan: '',
  jumlah: '',
})

export default function Anggaran() {
  const [tahun, setTahun] = useState(tahunBerjalan)
  const [tab, setTab] = useState('pemasukan')
  const [tahunList, setTahunList] = useState(getTahunList())
  const [data, setData] = useState(anggaranByTahun) // {tahun:{pemasukan[],pengeluaran[]}}
  const [ringkasan, setRingkasan] = useState({}) // {tahun:{totalPemasukan,totalPengeluaran,saldo}}
  const [loading, setLoading] = useState(false)
  const [fallback, setFallback] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm('pemasukan'))
  const [filterBulan, setFilterBulan] = useState('semua')
  const [cari, setCari] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  // Proteksi race condition saat user cepat berpindah tahun.
  const reqSeq = useRef(0)

  async function loadTahun(t) {
    const seq = ++reqSeq.current
    setLoading(true)
    try {
      const [ring, list] = await Promise.all([
        apiFetch(`/transaksi-anggaran/ringkasan?tahun=${t}`),
        apiFetch(`/transaksi-anggaran?tahun=${t}&limit=200`),
      ])
      if (seq !== reqSeq.current) return
      const items = (Array.isArray(list) ? list : list?.items || []).map(transaksiAdapter.toFrontend)
      const grouped = {
        pemasukan: items.filter((i) => i.jenis === 'pemasukan'),
        pengeluaran: items.filter((i) => i.jenis === 'pengeluaran'),
      }
      setData((d) => ({ ...d, [t]: grouped }))
      setRingkasan((m) => ({ ...m, [t]: ring || {} }))
      setTahunList((l) =>
        l.includes(String(t)) ? l : [...l, String(t)].sort((a, b) => Number(b) - Number(a))
      )
      setFallback(false)
    } catch (err) {
      if (seq !== reqSeq.current) return
      console.log('[api] fallback: transaksi-anggaran', err)
      setFallback(true)
    } finally {
      if (seq === reqSeq.current) setLoading(false)
    }
  }

  useEffect(() => {
    loadTahun(tahun)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun])

  const current = data[tahun] || { pemasukan: [], pengeluaran: [] }
  const ring = ringkasan[tahun] || {}

  // Total prioritas dari endpoint ringkasan; fallback agregat dari list.
  const totalMasuk =
    ring.totalPemasukan ?? current.pemasukan.reduce((s, i) => s + i.jumlah, 0)
  const totalKeluar =
    ring.totalPengeluaran ?? current.pengeluaran.reduce((s, i) => s + i.jumlah, 0)
  const saldo = ring.saldo ?? totalMasuk - totalKeluar

  // Data chart: agregat per bulan dari transaksi (konsisten dengan tabel).
  const pemasukanBulan = aggregatePerBulan(current.pemasukan)
  const pengeluaranBulan = aggregatePerBulan(current.pengeluaran)

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm(tab))
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      jenis: item.jenis || tab,
      tanggal: item.tanggal,
      keterangan: item.keterangan,
      jumlah: String(item.jumlah),
    })
    setSaveError('')
    setModalOpen(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.keterangan.trim() || form.jumlah === '') return
    setSaving(true)
    setSaveError('')
    const body = transaksiAdapter.toBody({ ...form, tahun }, tahun, form.jenis)
    try {
      if (editingId) {
        await apiFetch(`/transaksi-anggaran/${editingId}`, { method: 'PUT', body })
      } else {
        await apiFetch('/transaksi-anggaran', { method: 'POST', body })
      }
      setModalOpen(false)
      await loadTahun(tahun)
    } catch (err) {
      setSaveError(err?.message || 'Gagal menyimpan transaksi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus transaksi ini?')) return
    try {
      await apiFetch(`/transaksi-anggaran/${id}`, { method: 'DELETE' })
      await loadTahun(tahun)
    } catch (err) {
      window.alert(err?.message || 'Gagal menghapus transaksi.')
    }
  }

  const rows = tab === 'pemasukan' ? current.pemasukan : current.pengeluaran
  const totalRows = tab === 'pemasukan' ? totalMasuk : totalKeluar

  // Filter baris tabel berdasarkan bulan & pencarian keterangan.
  // SUMMARY CARDS tetap memakai total tahunan penuh (tidak terfilter).
  const rowsFiltered = rows.filter(
    (item) =>
      (filterBulan === 'semua' || bulanIndex(item.tanggal) === Number(filterBulan)) &&
      (cari === '' || item.keterangan.toLowerCase().includes(cari.toLowerCase()))
  )
  const totalFiltered = rowsFiltered.reduce((s, i) => s + i.jumlah, 0)

  const clearFilter = () => {
    setFilterBulan('semua')
    setCari('')
  }

  return (
    <div className="space-y-5">
      {/* Year selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-caption text-text-muted mr-1">Periode:</span>
        {tahunList.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTahun(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              tahun === t
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-text-secondary border border-border-light hover:bg-bg-alt'
            }`}
          >
            {t}
          </button>
        ))}
        <div className="relative ml-auto">
          <select
            className="select pr-9 w-auto"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            aria-label="Pilih periode lain"
          >
            {tahunList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
        </div>
      </div>

      {fallback && !loading && (
        <InlineNotice variant="warning">
          Server tidak dapat diakses — menampilkan data cadangan lokal, perubahan tidak tersimpan.
        </InlineNotice>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              <TrendingUp size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-caption text-text-muted">Pemasukan</p>
              <p className="font-heading font-bold text-xl text-text mt-0.5">{formatCurrency(totalMasuk)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-[#FBE8E6] text-danger flex items-center justify-center">
              <TrendingDown size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-caption text-text-muted">Pengeluaran</p>
              <p className="font-heading font-bold text-xl text-text mt-0.5">{formatCurrency(totalKeluar)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              saldo >= 0 ? 'bg-primary-light text-primary' : 'bg-[#FBE8E6] text-danger'
            }`}>
              <Wallet size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-caption text-text-muted">Saldo {tahun}</p>
              <p className="font-heading font-bold text-xl text-text mt-0.5">{formatCurrency(saldo)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Perbandingan kas — double chart Chart.js (Line | Bar), agregat per bulan */}
      <KasChartCard
        title={`Perbandingan Kas ${tahun}`}
        subtitle="Rekap pemasukan vs pengeluaran per bulan"
        labels={BULAN_NAMA}
        pemasukan={pemasukanBulan}
        pengeluaran={pengeluaranBulan}
        defaultMode="bar"
      />

      {/* Detail tables */}
      <div className="card overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-border-light px-4 pt-3">
          <div className="flex gap-1">
            {[
              { value: 'pemasukan', label: 'Pemasukan' },
              { value: 'pengeluaran', label: 'Pengeluaran' },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary relative ${
                  tab === t.value
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn-primary mb-1.5 !min-h-0 !h-10" onClick={openAdd}>
            <Plus size={17} aria-hidden="true" /> Tambah
          </button>
        </div>

        {/* Filter bar: bulan + pencarian keterangan */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border-light bg-bg-alt/30">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Cari keterangan..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              aria-label="Cari keterangan transaksi"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-caption text-text-muted" htmlFor="filter-bulan">Bulan</label>
            <div className="relative">
              <select
                id="filter-bulan"
                className="select pr-9 w-auto"
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                aria-label="Filter berdasarkan bulan"
              >
                <option value="semua">Semua Bulan</option>
                {BULAN_NAMA.map((b, i) => (
                  <option key={i} value={i}>{b}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
            </div>
          </div>
          {(filterBulan !== 'semua' || cari !== '') && (
            <button
              type="button"
              className="text-sm text-primary hover:text-primary-hover font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              onClick={clearFilter}
            >
              Reset filter
            </button>
          )}
        </div>

        {loading ? (
          <LoadingState label={`Memuat data kas ${tahun}...`} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light bg-bg-alt/50">
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Tanggal</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Keterangan</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Jumlah (Rp)</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {rowsFiltered.map((item) => (
                    <tr key={item.id} className="hover:bg-primary-light/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{formatDateShort(item.tanggal)}</td>
                      <td className="px-4 py-3 text-sm text-text">{item.keterangan}</td>
                      <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${
                        tab === 'pemasukan' ? 'text-primary' : 'text-danger'
                      }`}>
                        {tab === 'pemasukan' ? '+' : '-'}{formatCurrency(item.jumlah)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" className="btn-icon w-9 h-9" onClick={() => openEdit(item)} aria-label={`Edit transaksi ${item.keterangan}`}>
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon w-9 h-9 hover:text-danger hover:bg-[#FBE8E6]"
                            onClick={() => handleDelete(item.id)}
                            aria-label={`Hapus transaksi ${item.keterangan}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-bg-alt/50 font-medium">
                    <td className="px-4 py-3 text-sm text-text" colSpan="2">Total {tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} {tahun}</td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${tab === 'pemasukan' ? 'text-primary' : 'text-danger'}`}>{formatCurrency(totalFiltered)}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {rowsFiltered.length === 0 && rows.length > 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-text-secondary">Tidak ada hasil untuk filter ini.</p>
                <button type="button" className="btn-secondary mt-3" onClick={clearFilter}>
                  Reset filter
                </button>
              </div>
            )}

            {rows.length === 0 && (
              <EmptyState
                title={`Belum ada data ${tab}`}
                description="Tambahkan transaksi untuk memulai pencatatan kas tahun ini."
                action={
                  <button type="button" className="btn-primary" onClick={openAdd}>
                    <Plus size={18} aria-hidden="true" /> Tambah {tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                  </button>
                }
              />
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? `Edit ${form.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}` : `Tambah ${form.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`}
        subtitle={`Pencatatan kas periode ${tahun}.`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <InlineNotice>{saveError}</InlineNotice>}
          <div>
            <label className="label">Jenis Transaksi</label>
            <div className="flex gap-2">
              {[
                { value: 'pemasukan', label: 'Pemasukan' },
                { value: 'pengeluaran', label: 'Pengeluaran' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, jenis: t.value }))}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    form.jenis === t.value
                      ? t.value === 'pemasukan' ? 'bg-primary text-white' : 'bg-danger text-white'
                      : 'bg-bg-alt text-text-secondary hover:bg-bg'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="tanggal">Tanggal</label>
              <input id="tanggal" name="tanggal" type="date" required className="input" value={form.tanggal} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="jumlah">Jumlah (Rp)</label>
              <input id="jumlah" name="jumlah" type="number" min="0" required className="input" value={form.jumlah} onChange={handleChange} placeholder="cth: 1000000" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="keterangan">Keterangan</label>
            <input id="keterangan" name="keterangan" type="text" required className="input" value={form.keterangan} onChange={handleChange} placeholder="Deskripsi transaksi" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}