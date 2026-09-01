import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink,
  Info,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { parameterEkonomi as dummyParameter } from '../data/prediksi.js'
import { formatDateShort } from '../utils/format.js'

const BI_INFLASI_URL = 'https://www.bi.go.id/id/statistik/indikator/data-inflasi.aspx'

export default function ParameterEkonomi() {
  const [daftar, setDaftar] = useState(dummyParameter)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ tahun: '', persentase: '' })
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  function openAdd() {
    setEditingId(null)
    setForm({ tahun: '', persentase: '' })
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({ tahun: String(item.tahun), persentase: String(item.persentase) })
    setErrors({})
    setModalOpen(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const errs = {}
    if (!form.tahun || Number(form.tahun) <= 0) errs.tahun = 'Tahun wajib diisi (angka).'
    if (form.persentase === '' || isNaN(Number(form.persentase)))
      errs.persentase = 'Persentase inflasi wajib diisi (desimal, misal 2.8).'
    return errs
  }

  function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const year = Number(form.tahun)
    const persen = Number(form.persentase)
    if (editingId) {
      setDaftar((d) =>
        d.map((i) => (i.id === editingId ? { ...i, tahun: year, persentase: persen } : i))
      )
    } else {
      const newId = Math.max(0, ...daftar.map((i) => i.id)) + 1
      setDaftar((d) => [
        { id: newId, tahun: year, persentase: persen, createdAt: new Date().toISOString().slice(0, 10) },
        ...d,
      ])
    }
    setModalOpen(false)
    setSuccessMsg(editingId ? 'Data inflasi berhasil diperbarui.' : 'Data inflasi berhasil disimpan.')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleDelete(id) {
    setDaftar((d) => d.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Header + tombol balik */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <Link
            to="/prediksi-anggaran"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            <ChevronLeft size={16} aria-hidden="true" /> Kembali ke Prediksi
          </Link>
          <h2 className="font-heading font-bold text-h2 text-text">Parameter Ekonomi</h2>
          <p className="text-caption text-text-muted mt-0.5">
            Kelola asumsi inflasi yang dipakai dalam perhitungan prediksi anggaran.
          </p>
        </div>
        <button type="button" className="btn-primary shrink-0" onClick={openAdd}>
          <Plus size={16} aria-hidden="true" /> Tambah Inflasi
        </button>
      </div>

      {/* Kotak info referensi BI */}
      <div className="card p-5 bg-primary-light/50 border-primary/20">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
            <Info size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">
              Cek data inflasi terbaru di:{' '}
              <a
                href={BI_INFLASI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-primary-hover inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              >
                Data Inflasi — Bank Indonesia
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </p>
            <p className="text-caption text-text-secondary mt-1">
              Admin disarankan mengecek angka inflasi resmi dari Bank Indonesia sebelum menginput
              data di bawah ini.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="card p-4 bg-[#E7F4EC] border border-primary/20 text-primary flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={18} aria-hidden="true" /> {successMsg}
        </div>
      )}

      {/* Tabel riwayat inflasi */}
      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-border-light">
          <h3 className="font-heading font-semibold text-h3 text-text">Riwayat Inflasi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light bg-bg-alt/50">
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Tahun</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Persentase</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Tanggal Input</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {[...daftar]
                .sort((a, b) => Number(b.tahun) - Number(a.tahun))
                .map((item) => (
                  <tr key={item.id} className="hover:bg-primary-light/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-text">{item.tahun}</td>
                    <td className="px-5 py-3 text-sm font-medium text-text">
                      {String(item.persentase).replace('.', ',')}%
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{formatDateShort(item.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="btn-icon w-9 h-9"
                          onClick={() => openEdit(item)}
                          aria-label={`Edit inflasi tahun ${item.tahun}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon w-9 h-9 hover:text-danger hover:bg-[#FBE8E6]"
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Hapus inflasi tahun ${item.tahun}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && (
          <EmptyState
            title="Belum ada data inflasi"
            description="Tambahkan parameter inflasi untuk memperhitungkan prediksi anggaran event."
            action={
              <button type="button" className="btn-primary" onClick={openAdd}>
                <Plus size={18} aria-hidden="true" /> Tambah Inflasi
              </button>
            }
          />
        )}
      </div>

      {/* Modal tambah/edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Parameter Inflasi' : 'Tambah Parameter Inflasi'}
        subtitle="Asumsi inflasi tahunan untuk perhitungan prediksi anggaran."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label" htmlFor="tahun">Tahun</label>
            <input
              id="tahun"
              name="tahun"
              type="number"
              min="2000"
              required
              className="input"
              value={form.tahun}
              onChange={handleChange}
              placeholder="cth: 2026"
            />
            {errors.tahun && <p className="text-xs text-danger mt-1">{errors.tahun}</p>}
          </div>
          <div>
            <label className="label" htmlFor="persentase">Persentase Inflasi</label>
            <input
              id="persentase"
              name="persentase"
              type="number"
              step="0.1"
              min="0"
              required
              className="input"
              value={form.persentase}
              onChange={handleChange}
              placeholder="cth: 2.8"
            />
            {errors.persentase && <p className="text-xs text-danger mt-1">{errors.persentase}</p>}
            <p className="text-xs text-text-muted mt-1">Desimal, contoh 2.8 berarti 2,8%.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
