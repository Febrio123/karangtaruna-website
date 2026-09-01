import { useEffect, useState } from 'react'
import { ImagePlus, Trash2, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import InlineNotice from '../components/ui/InlineNotice.jsx'
import { apiFetch } from '../lib/api'
import { galeriAdapter } from '../lib/adapters.js'
import { galeri as initialData, galeriKategori } from '../data/galeri.js'
import { formatDateShort } from '../utils/format.js'

const emptyForm = {
  judul: '',
  kategori: 'Kegiatan Rutin',
  tahun: String(new Date().getFullYear()),
  tipe: 'image',
  deskripsi: '',
}

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/ogg'
// Batas aman < 4.5 MB (limit body request Vercel serverless) — 4 MB agar
// request tidak ditolak prematur. CATATAN: 502 tidak selalu = body terlalu
// besar; bisa juga dari gagal upload ke Cloudinary (backend mengirim detail
// asli lewat err.message). Batas ini tetap dicek SEBELUM request dikirim.
const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 MB

export default function Galeri() {
  const [galeri, setGaleri] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)
  const [filter, setFilter] = useState('Semua')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [saveError, setSaveError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [lightbox, setLightbox] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const data = await apiFetch('/galeri?published=false&limit=100')
      const list = Array.isArray(data) ? data : data?.items || []
      setGaleri(list.map(galeriAdapter.toFrontend))
      setFallback(false)
    } catch (err) {
      console.log('[api] fallback: galeri', err)
      setFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = galeri.filter((g) => filter === 'Semua' || g.kategori === filter)

  function openAdd() {
    setForm(emptyForm)
    setFile(null)
    setPreview('')
    setSaveError('')
    setModalOpen(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null
    setSaveError('')
    if (!selected) {
      setFile(null)
      setPreview('')
      return
    }
    // Tolak segera saat file melebihi batas 4 MB — jangan kirim request besar
    // ke server (Vercel bisa menolak payload besar). Batas ini bagian dari
    // validasi UX; bukan penentu satu-satunya penyebab 502 (lihat catch upload).
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null)
      setPreview('')
      e.target.value = '' // izinkan memilih file yang sama lagi di lain waktu
      const isVideo = selected.type.startsWith('video')
      setSaveError(
        isVideo
          ? 'Ukuran video melebihi 4 MB (batas platform). Pilih video yang lebih kecil atau kompres dulu — video biasanya mudah melebihi 4 MB.'
          : 'Ukuran file maksimal 4 MB (batas platform). Pilih file lebih kecil.'
      )
      return
    }
    setFile(selected)
    const objectUrl = URL.createObjectURL(selected)
    setPreview(objectUrl)
    // Tentukan tipe media dari MIME file
    setForm((f) => ({ ...f, tipe: selected.type.startsWith('video') ? 'video' : 'image' }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.judul.trim()) return
    if (!file) {
      setSaveError('Pilih file foto/video terlebih dahulu.')
      return
    }
    // Jaga-jaga: tetap validasi di sini walau sudah dicek saat memilih file.
    if (file.size > MAX_FILE_SIZE) {
      const isVideo = file.type.startsWith('video')
      setSaveError(
        isVideo
          ? 'Ukuran video melebihi 4 MB (batas platform). Pilih video yang lebih kecil atau kompres dulu — video biasanya mudah melebihi 4 MB.'
          : 'Ukuran file maksimal 4 MB (batas platform). Pilih file lebih kecil.'
      )
      return
    }
    setUploading(true)
    setSaveError('')
    try {
      const fd = galeriAdapter.toFormData(form, file)
      await apiFetch('/galeri', { method: 'POST', body: fd })
      setModalOpen(false)
      await loadData()
      setSuccessMsg('Foto berhasil diunggah ke galeri.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      // Tampilkan pesan error ASLI dari backend — untuk 502, backend melempar
      // ApiError(502, 'Upload media gagal: <detail Cloudinary>'). JANGAN timpa
      // dengan teks generik agar detail sebenarnya bisa didiagnosa.
      if (err?.status === 502 && err?.message) {
        setSaveError(`Gagal mengunggah ke layanan media: ${err.message}`)
      } else if (err?.status === 413) {
        setSaveError(
          'File terlalu besar (HTTP 413): server menolak payload. Gunakan media berukuran maksimal 4 MB atau kompres file Anda terlebih dahulu.'
        )
      } else {
        setSaveError(err?.message || 'Gagal mengunggah media ke galeri.')
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id, judul) {
    if (!window.confirm(`Hapus media "${judul}" dari galeri?`)) return
    try {
      await apiFetch(`/galeri/${id}`, { method: 'DELETE' })
      setGaleri((list) => list.filter((g) => g.id !== id))
    } catch (err) {
      window.alert(err?.message || 'Gagal menghapus media.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-caption text-text-muted">{galeri.length} media tersimpan dalam galeri.</p>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <ImagePlus size={18} aria-hidden="true" /> Unggah Foto/Video
        </button>
      </div>

      {fallback && !loading && (
        <InlineNotice variant="warning">
          Server tidak dapat diakses — menampilkan data cadangan lokal, perubahan tidak tersimpan.
        </InlineNotice>
      )}

      {successMsg && (
        <div className="card p-4 bg-[#E7F4EC] border border-primary/20 text-primary flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={18} aria-hidden="true" /> {successMsg}
        </div>
      )}

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
      {loading ? (
        <LoadingState label="Memuat galeri..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada media di kategori ini"
          description="Unggah foto/video kegiatan untuk memperkaya galeri."
          action={
            <button type="button" className="btn-primary" onClick={openAdd}>
              <ImagePlus size={18} aria-hidden="true" /> Unggah Foto/Video
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="group relative rounded-lg overflow-hidden border border-border-light shadow-sm aspect-[4/3] bg-bg-alt">
              {/* Media / placeholder */}
              <button
                type="button"
                onClick={() => setLightbox(g)}
                className="absolute inset-0 w-full h-full block focus-visible:outline-none"
                style={
                  g.mediaUrl
                    ? undefined
                    : { background: `linear-gradient(135deg, ${g.warna || '#2C5F8A'}, ${(g.warna || '#2C5F8A')}99)` }
                }
                aria-label={`Lihat ${g.judul}`}
              >
                {g.mediaUrl ? (
                  g.tipe === 'video' ? (
                    <video
                      src={g.mediaUrl}
                      className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                      muted
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                    />
                  ) : (
                    <img
                      src={g.mediaUrl}
                      alt={g.judul}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  )
                ) : (
                  <span className="flex flex-col items-center justify-center w-full h-full text-white">
                    <ImageIcon size={32} strokeWidth={1.4} aria-hidden="true" />
                  </span>
                )}
              </button>

              {/* Delete overlay */}
              <button
                type="button"
                onClick={() => handleDelete(g.id, g.judul)}
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
                <Badge variant="neutral" className="text-white !bg-black/40">{g.kategori}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Unggah Foto/Video"
        subtitle="Tambahkan dokumentasi kegiatan baru ke galeri."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <InlineNotice>{saveError}</InlineNotice>}
          <div className="border-2 border-dashed border-border-light rounded-lg p-6 text-center">
            {preview ? (
              form.tipe === 'video' ? (
                <video src={preview} className="mx-auto max-h-40 rounded-md" controls muted playsInline aria-label="Pratinjau video" />
              ) : (
                <img src={preview} alt="Pratinjau media" className="mx-auto max-h-40 rounded-md object-contain" />
              )
            ) : (
              <ImagePlus size={28} className="mx-auto text-text-muted mb-2" aria-hidden="true" />
            )}
            <p className="text-sm text-text-secondary mt-2">Pilih file foto atau video</p>
            <p className="text-xs text-text-muted mt-1">PNG, JPG, WebP, GIF, MP4. Maks. 4 MB.</p>
            <p className="text-xs text-text-muted mt-0.5">Video biasanya melebihi 4 MB — disarankan pakai foto atau kompres videonya.</p>
            <input
              id="file"
              name="file"
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file" className="btn-secondary mt-4 cursor-pointer inline-block">
              Pilih File
            </label>
          </div>
          <div>
            <label className="label" htmlFor="judul">Judul Media</label>
            <input id="judul" name="judul" type="text" required className="input" value={form.judul} onChange={handleChange} placeholder="Deskripsi singkat" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label" htmlFor="kategori">Kategori</label>
              <select id="kategori" name="kategori" className="select" value={form.kategori} onChange={handleChange}>
                {galeriKategori.filter((k) => k !== 'Semua').map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="tahun">Tahun</label>
              <input id="tahun" name="tahun" type="number" min="2000" className="input" value={form.tahun} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="tipe">Tipe Media</label>
              <select id="tipe" name="tipe" className="select" value={form.tipe} onChange={handleChange}>
                <option value="image">Foto</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Mengunggah...' : 'Simpan Media'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={lightbox.judul}>
          <div className="absolute inset-0 bg-black/75" onClick={() => setLightbox(null)} aria-hidden="true" />
          <div className="relative bg-surface rounded-lg shadow-xl max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-md bg-black/40 text-white flex items-center justify-center hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
              aria-label="Tutup pratinjau"
            >
              <X size={18} />
            </button>
            <div className="flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden">
              {lightbox.tipe === 'video' || lightbox.mediaUrl?.toLowerCase().includes('video') ? (
                <video src={lightbox.mediaUrl} controls autoPlay className="w-full max-h-[60vh] object-contain" playsInline />
              ) : (
                <img
                  src={lightbox.mediaUrl}
                  alt={lightbox.judul}
                  className="max-h-[60vh] w-full object-contain"
                  style={lightbox.mediaUrl ? undefined : { display: 'none' }}
                />
              )}
              {!lightbox.mediaUrl && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${lightbox.warna || '#2C5F8A'}, ${(lightbox.warna || '#2C5F8A')}99)` }}
                >
                  <ImageIcon size={56} strokeWidth={1.2} className="text-white/80" aria-hidden="true" />
                </div>
              )}
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