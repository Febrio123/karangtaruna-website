import { useEffect, useState } from 'react'
import { CalendarPlus, Pencil, Trash2, MapPin, Clock, Wallet, Megaphone, CalendarDays } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import InlineNotice from '../components/ui/InlineNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { apiFetch } from '../lib/api'
import { eventAdapter } from '../lib/adapters.js'
import { events as initialData, eventCategories } from '../data/event.js'
import { formatDate, formatCurrency } from '../utils/format.js'

const emptyForm = {
  judul: '',
  tipe: 'Event',
  tanggal: '',
  waktu: '',
  lokasi: '',
  status: 'Mendatang',
  anggaran: '',
  deskripsi: '',
}

export default function Event() {
  const [events, setEvents] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      // published=false → ambil semua event (publik + draf) untuk admin.
      const data = await apiFetch('/events?published=false&limit=100')
      const list = Array.isArray(data) ? data : data?.items || []
      setEvents(list.map(eventAdapter.toFrontend))
      setFallback(false)
    } catch (err) {
      console.log('[api] fallback: events', err)
      setFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = events.filter((e) => filter === 'all' || e.tipe === filter)

  function openAdd() {
    setEditingId(null)
    setForm({ ...emptyForm, tanggal: new Date().toISOString().slice(0, 10) })
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      judul: item.judul,
      tipe: item.tipe,
      tanggal: item.tanggal,
      waktu: item.waktu,
      lokasi: item.lokasi,
      status: item.status,
      anggaran: String(item.anggaran || ''),
      deskripsi: '',
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
    if (!form.judul.trim()) return
    setSaving(true)
    setSaveError('')
    const body = eventAdapter.toBody(form, form)
    try {
      if (editingId) {
        await apiFetch(`/events/${editingId}`, { method: 'PUT', body })
      } else {
        await apiFetch('/events', { method: 'POST', body })
      }
      setModalOpen(false)
      await loadData()
    } catch (err) {
      setSaveError(err?.message || 'Gagal menyimpan event.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id, judul) {
    if (!window.confirm(`Hapus event/pengumuman "${judul}"?`)) return
    setDeletingId(id)
    try {
      await apiFetch(`/events/${id}`, { method: 'DELETE' })
      setEvents((list) => list.filter((ev) => ev.id !== id))
    } catch (err) {
      window.alert(err?.message || 'Gagal menghapus event.')
    } finally {
      setDeletingId(null)
    }
  }

  const totalAnggaran = events.filter((e) => e.tipe === 'Event').reduce((sum, e) => sum + e.anggaran, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-caption text-text-muted">
          {events.filter((e) => e.status === 'Mendatang').length} event mendatang · Total anggaran event: {formatCurrency(totalAnggaran)}
        </p>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <CalendarPlus size={18} aria-hidden="true" /> Tambah Event
        </button>
      </div>

      {fallback && !loading && (
        <InlineNotice variant="warning">
          Server tidak dapat diakses — menampilkan data cadangan lokal, perubahan tidak tersimpan.
        </InlineNotice>
      )}

      {/* Filter */}
      <div className="flex items-center gap-1.5">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'Event', label: 'Event' },
          { value: 'Pengumuman', label: 'Pengumuman' },
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

      {/* Event list */}
      {loading ? (
        <LoadingState label="Memuat event..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Belum ada event"
          description="Jadwalkan event atau buat pengumuman untuk pengunjung."
          action={
            <button type="button" className="btn-primary" onClick={openAdd}>
              <CalendarPlus size={18} aria-hidden="true" /> Tambah Event
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ev) => (
            <div key={ev.id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {ev.tipe === 'Event' ? (
                    <span className="w-9 h-9 rounded-md bg-accent-light text-accent flex items-center justify-center">
                      <CalendarDays size={18} aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="w-9 h-9 rounded-md bg-primary-light text-primary flex items-center justify-center">
                      <Megaphone size={18} aria-hidden="true" />
                    </span>
                  )}
                  <div>
                    <Badge variant={ev.tipe === 'Event' ? 'accent' : 'primary'}>{ev.tipe}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button type="button" className="btn-icon w-9 h-9" onClick={() => openEdit(ev)} aria-label={`Edit ${ev.judul}`}>
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon w-9 h-9 hover:text-danger hover:bg-[#FBE8E6]"
                    onClick={() => handleDelete(ev.id, ev.judul)}
                    disabled={deletingId === ev.id}
                    aria-label={`Hapus ${ev.judul}`}
                  >
                    {deletingId === ev.id ? <Spinner size={15} /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>

              <h3 className="font-heading font-semibold text-h4 text-text mt-3 leading-snug">{ev.judul}</h3>

              <div className="mt-3 space-y-1.5 text-sm text-text-secondary flex-1">
                <p className="inline-flex items-center gap-2">
                  <Clock size={15} className="text-text-muted" aria-hidden="true" /> {formatDate(ev.tanggal)} {ev.waktu !== '-' && `· ${ev.waktu}`}
                </p>
                {ev.lokasi && (
                  <p className="inline-flex items-center gap-2">
                    <MapPin size={15} className="text-text-muted" aria-hidden="true" /> {ev.lokasi}
                  </p>
                )}
                {ev.anggaran > 0 && (
                  <p className="inline-flex items-center gap-2">
                    <Wallet size={15} className="text-text-muted" aria-hidden="true" /> {formatCurrency(ev.anggaran)}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant={ev.status === 'Mendatang' ? 'success' : 'neutral'} dot>{ev.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Event' : 'Tambah Event Baru'}
        subtitle="Jadwalkan event atau buat pengumuman penting."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <InlineNotice>{saveError}</InlineNotice>}
          <div>
            <label className="label" htmlFor="judul">Judul</label>
            <input id="judul" name="judul" type="text" required className="input" value={form.judul} onChange={handleChange} placeholder="Judul event atau pengumuman" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label" htmlFor="tipe">Tipe</label>
              <select id="tipe" name="tipe" className="select" value={form.tipe} onChange={handleChange}>
                {eventCategories.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="tanggal">Tanggal</label>
              <input id="tanggal" name="tanggal" type="date" className="input" value={form.tanggal} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="waktu">Waktu</label>
              <input id="waktu" name="waktu" type="text" className="input" value={form.waktu} onChange={handleChange} placeholder="08:00 WIB" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="lokasi">Lokasi</label>
            <input id="lokasi" name="lokasi" type="text" className="input" value={form.lokasi} onChange={handleChange} placeholder="Tempat pelaksanaan" />
          </div>
          {form.tipe === 'Event' && (
            <div>
              <label className="label" htmlFor="anggaran">Anggaran Acara (Rp)</label>
              <input id="anggaran" name="anggaran" type="number" min="0" className="input" value={form.anggaran} onChange={handleChange} placeholder="cth: 1500000" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" className="select" value={form.status} onChange={handleChange}>
              <option value="Mendatang">Mendatang</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size={14} /> Menyimpan...
                </>
              ) : editingId ? (
                'Simpan Perubahan'
              ) : (
                'Simpan Event'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}