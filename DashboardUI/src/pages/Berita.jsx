import { useState } from 'react'
import { FilePlus, Pencil, Trash2, Search, Eye, FileText } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { berita as initialData, beritaKategori } from '../data/berita.js'
import { formatDate } from '../utils/format.js'

const emptyForm = {
  judul: '',
  kategori: beritaKategori[0],
  penulis: '',
  tanggal: '',
  status: 'draft',
}

export default function Berita() {
  const [berita, setBerita] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = berita.filter((b) => {
    const matchSearch =
      b.judul.toLowerCase().includes(search.toLowerCase()) ||
      b.penulis.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || b.status === filter
    return matchSearch && matchFilter
  })

  const published = berita.filter((b) => b.status === 'published').length
  const draft = berita.filter((b) => b.status === 'draft').length

  function openAdd() {
    setEditingId(null)
    setForm({ ...emptyForm, tanggal: new Date().toISOString().slice(0, 10) })
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      judul: item.judul,
      kategori: item.kategori,
      penulis: item.penulis,
      tanggal: item.tanggal,
      status: item.status,
    })
    setModalOpen(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      setBerita((list) => list.map((b) => (b.id === editingId ? { ...b, ...form } : b)))
    } else {
      const newId = Math.max(...berita.map((b) => b.id)) + 1
      setBerita((list) => [{ id: newId, views: 0, ...form }, ...list])
    }
    setModalOpen(false)
  }

  function handleDelete(id) {
    setBerita((list) => list.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-caption text-text-muted">
          {published} berita terbit · {draft} draf belum dirilis.
        </p>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <FilePlus size={18} aria-hidden="true" /> Tulis Berita Baru
        </button>
      </div>

      {/* Filter + search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2 bg-surface border border-border-light rounded-md px-3 flex-1 md:max-w-sm">
          <Search size={17} className="text-text-muted shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="py-2.5 outline-none w-full bg-transparent text-sm placeholder:text-text-muted"
            placeholder="Cari judul atau penulis..."
            aria-label="Cari berita"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'published', label: 'Terbit' },
            { value: 'draft', label: 'Draft' },
          ].map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                filter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary border border-border-light hover:bg-bg-alt'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light bg-bg-alt/50">
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Judul</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Kategori</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Penulis</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Tanggal</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Dilihat</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={17} className="text-accent shrink-0" aria-hidden="true" />
                      <p className="font-medium text-text text-sm line-clamp-2">{b.judul}</p>
                    </div>
                    <p className="text-xs text-text-muted sm:hidden mt-1">
                      {b.kategori} · {formatDate(b.tanggal)}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="neutral">{b.kategori}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary hidden lg:table-cell">{b.penulis}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{formatDate(b.tanggal)}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                      <Eye size={14} aria-hidden="true" /> {b.views.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={b.status === 'published' ? 'success' : 'neutral'} dot>
                      {b.status === 'published' ? 'Terbit' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" className="btn-icon w-9 h-9" onClick={() => openEdit(b)} aria-label={`Edit ${b.judul}`}>
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon w-9 h-9 hover:text-danger hover:bg-[#FBE8E6]"
                        onClick={() => handleDelete(b.id)}
                        aria-label={`Hapus ${b.judul}`}
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

        {filtered.length === 0 && (
          <EmptyState
            title={search || filter !== 'all' ? 'Berita tidak ditemukan' : 'Belum ada berita'}
            description="Tulis berita pertama untuk memperbarui konten website."
            action={
              <button type="button" className="btn-primary" onClick={openAdd}>
                <FilePlus size={18} aria-hidden="true" /> Tulis Berita
              </button>
            }
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Berita' : 'Tulis Berita Baru'}
        subtitle="Atur judul, kategori, dan status publikasi artikel."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label" htmlFor="judul">Judul Berita</label>
            <input
              id="judul"
              name="judul"
              type="text"
              required
              className="input"
              value={form.judul}
              onChange={handleChange}
              placeholder="Judul artikel"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label" htmlFor="kategori">Kategori</label>
              <select id="kategori" name="kategori" className="select" value={form.kategori} onChange={handleChange}>
                {beritaKategori.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="penulis">Penulis</label>
              <input id="penulis" name="penulis" type="text" className="input" value={form.penulis} onChange={handleChange} placeholder="Nama penulis" />
            </div>
            <div>
              <label className="label" htmlFor="tanggal">Tanggal</label>
              <input id="tanggal" name="tanggal" type="date" className="input" value={form.tanggal} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <div className="flex gap-3">
              {[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Terbit' },
              ].map((s) => (
                <label key={s.value} className="inline-flex items-center gap-2 text-sm text-text cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s.value}
                    checked={form.status === s.value}
                    onChange={handleChange}
                    className="accent-primary w-4 h-4"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn-primary">{editingId ? 'Simpan Perubahan' : 'Terbitkan Berita'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
