import { useState } from 'react'
import { ImagePlus, Trash2, Image as ImageIcon, X } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { galeri as initialData, galeriKategori } from '../data/galeri.js'
import { formatDateShort } from '../utils/format.js'

const emptyForm = {
  judul: '',
  kategori: 'Kegiatan Rutin',
  tanggal: '',
}

export default function Galeri() {
  const [galeri, setGaleri] = useState(initialData)
  const [filter, setFilter] = useState('Semua')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [lightbox, setLightbox] = useState(null)

  const filtered = galeri.filter((g) => filter === 'Semua' || g.kategori === filter)

  function openAdd() {
    setForm({ ...emptyForm, tanggal: new Date().toISOString().slice(0, 10) })
    setModalOpen(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleSave(e) {
    e.preventDefault()
    const newId = Math.max(...galeri.map((g) => g.id)) + 1
    setGaleri((list) => [
      {
        id: newId,
        ...form,
        warna: ['#094986', '#C75B2A', '#2C5F8A', '#5A3E18', '#44709C'][newId % 5],
      },
      ...list,
    ])
    setModalOpen(false)
  }

  function handleDelete(id) {
    setGaleri((list) => list.filter((g) => g.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-caption text-text-muted">{galeri.length} foto tersimpan dalam galeri.</p>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <ImagePlus size={18} aria-hidden="true" /> Unggah Foto
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {galeriKategori.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`px-3 py-2 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              filter === k
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary border border-border-light hover:bg-bg-alt'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada foto di kategori ini"
          description="Unggah foto kegiatan untuk memperkaya galeri."
          action={
            <button type="button" className="btn-primary" onClick={openAdd}>
              <ImagePlus size={18} aria-hidden="true" /> Unggah Foto
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="group relative rounded-lg overflow-hidden border border-border-light shadow-sm aspect-[4/3] bg-bg-alt">
              {/* Mock image placeholder */}
              <button
                type="button"
                onClick={() => setLightbox(g)}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-white transition-transform group-hover:scale-[1.02] focus-visible:outline-none"
                style={{ background: `linear-gradient(135deg, ${g.warna}, ${g.warna}99)` }}
                aria-label={`Lihat ${g.judul}`}
              >
                <ImageIcon size={32} strokeWidth={1.4} aria-hidden="true" />
              </button>

              {/* Delete overlay */}
              <button
                type="button"
                onClick={() => handleDelete(g.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-md bg-black/40 text-white flex items-center justify-center hover:bg-danger opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Hapus ${g.judul}`}
              >
                <Trash2 size={15} />
              </button>

              {/* Caption */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 text-left">
                <p className="text-white text-xs font-medium leading-snug line-clamp-1">{g.judul}</p>
                <p className="text-white/70 text-[10px]">{formatDateShort(g.tanggal)}</p>
              </div>

              <div className="absolute top-2 left-2">
                <Badge variant="neutral" className="bg-black/40 text-white !bg-black/40">{g.kategori}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Unggah Foto"
        subtitle="Tambahkan dokumentasi kegiatan baru ke galeri."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="border-2 border-dashed border-border-light rounded-lg p-8 text-center">
            <ImagePlus size={28} className="mx-auto text-text-muted mb-2" aria-hidden="true" />
            <p className="text-sm text-text-secondary">Klik untuk memilih foto</p>
            <p className="text-xs text-text-muted mt-1">PNG, JPG, atau WebP. Maks. 5 MB.</p>
            <button type="button" className="btn-secondary mt-4">Pilih Foto</button>
          </div>
          <div>
            <label className="label" htmlFor="judul">Judul Foto</label>
            <input id="judul" name="judul" type="text" required className="input" value={form.judul} onChange={handleChange} placeholder="Deskripsi singkat" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="kategori">Kategori</label>
              <select id="kategori" name="kategori" className="select" value={form.kategori} onChange={handleChange}>
                {galeriKategori.filter((k) => k !== 'Semua').map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="tanggal">Tanggal</label>
              <input id="tanggal" name="tanggal" type="date" className="input" value={form.tanggal} onChange={handleChange} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn-primary">Simpan Foto</button>
          </div>
        </form>
      </Modal>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={lightbox.judul}>
          <div className="absolute inset-0 bg-black/75" onClick={() => setLightbox(null)} aria-hidden="true" />
          <div className="relative bg-surface rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-md bg-black/40 text-white flex items-center justify-center hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
              aria-label="Tutup pratinjau"
            >
              <X size={18} />
            </button>
            <div
              className="w-full aspect-video flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${lightbox.warna}, ${lightbox.warna}99)` }}
            >
              <ImageIcon size={56} strokeWidth={1.2} className="text-white/80" aria-hidden="true" />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-semibold text-text">{lightbox.judul}</h3>
                <p className="text-xs text-text-muted mt-0.5">{lightbox.kategori} · {formatDateShort(lightbox.tanggal)}</p>
              </div>
              <Badge variant="accent">Pratinjau</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
