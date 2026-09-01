import { useEffect, useState } from 'react'
import { UserPlus, Pencil, Trash2, Search, ShieldCheck, Users } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import InlineNotice from '../components/ui/InlineNotice.jsx'
import OrgChartAdmin from '../components/ui/OrgChartAdmin.jsx'
import { apiFetch } from '../lib/api'
import { pengurusAdapter } from '../lib/adapters.js'
import { pengurus as initialData, roles, bidangList } from '../data/pengurus.js'
import { getInitials, avatarColor } from '../utils/format.js'

const roleVariant = {
  'ketua': 'primary',
  'wakil-ketua': 'accent',
  'sekretaris': 'info',
  'bendahara': 'success',
  'anggota': 'neutral',
}

const emptyForm = {
  nama: '',
  email: '',
  jabatan: 'Anggota',
  bidang: '',
  periode: '2025-2027',
  role: 'anggota',
  telepon: '',
}

export default function Pengurus() {
  const [pengurus, setPengurus] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const data = await apiFetch('/pengurus')
      const list = Array.isArray(data) ? data : data?.items || []
      setPengurus(list.map(pengurusAdapter.toFrontend))
      setFallback(false)
    } catch (err) {
      console.log('[api] fallback: pengurus', err)
      setFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = pengurus.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.bidang.toLowerCase().includes(search.toLowerCase()) ||
    p.jabatan.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      nama: item.nama,
      email: item.email || '',
      jabatan: item.jabatan,
      bidang: item.bidang,
      periode: item.periode,
      role: item.role,
      telepon: item.telepon,
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
    if (!form.nama.trim()) return
    setSaving(true)
    setSaveError('')
    const body = pengurusAdapter.toBody(form)
    try {
      if (editingId) {
        await apiFetch(`/pengurus/${editingId}`, { method: 'PUT', body })
      } else {
        await apiFetch('/pengurus', { method: 'POST', body })
      }
      setModalOpen(false)
      await loadData()
    } catch (err) {
      setSaveError(err?.message || 'Gagal menyimpan data pengurus.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id, nama) {
    if (!window.confirm(`Hapus pengurus "${nama}"?`)) return
    try {
      await apiFetch(`/pengurus/${id}`, { method: 'DELETE' })
      setPengurus((list) => list.filter((p) => p.id !== id))
    } catch (err) {
      window.alert(err?.message || 'Gagal menghapus pengurus.')
    }
  }

  const counts = {
    total: pengurus.length,
    ketua: pengurus.filter((p) => p.role === 'ketua').length,
    inti: pengurus.filter((p) => p.role !== 'anggota').length,
    anggota: pengurus.filter((p) => p.role === 'anggota').length,
  }

  return (
    <div className="space-y-5">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-caption text-text-muted">
          Kelola susunan pengurus dan hak akses (RBAC) periode berjalan.
        </p>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <UserPlus size={18} aria-hidden="true" /> Tambah Pengurus
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="primary" className="px-3 py-1.5">Total: {counts.total} pengurus</Badge>
        <Badge variant="neutral" className="px-3 py-1.5">Pengurus inti: {counts.inti}</Badge>
        <Badge variant="neutral" className="px-3 py-1.5">Anggota bidang: {counts.anggota}</Badge>
      </div>

      {fallback && !loading && (
        <InlineNotice variant="warning">
          Server tidak dapat diakses — menampilkan data cadangan lokal, perubahan tidak tersimpan.
        </InlineNotice>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 bg-surface border border-border-light rounded-md px-3 max-w-md">
        <Search size={17} className="text-text-muted shrink-0" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="py-2.5 outline-none w-full bg-transparent text-sm placeholder:text-text-muted"
          placeholder="Cari nama, jabatan, atau bidang..."
          aria-label="Cari pengurus"
        />
      </div>

      {/* Susunan Organisasi */}
      <div className="card p-5">
        <h3 className="font-heading font-semibold text-h3 text-text mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" aria-hidden="true" /> Susunan Organisasi
        </h3>
        <OrgChartAdmin pengurus={pengurus} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingState label="Memuat data pengurus..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light bg-bg-alt/50">
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Pengurus</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Jabatan</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Bidang</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Periode</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-primary-light/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-heading font-semibold text-sm shrink-0 ${avatarColor(p.nama)}`}>
                            {getInitials(p.nama)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-text text-sm truncate">{p.nama}</p>
                            <p className="text-xs text-text-muted truncate sm:hidden">{p.jabatan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary hidden md:table-cell">{p.jabatan}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{p.bidang}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary hidden lg:table-cell">{p.periode}</td>
                      <td className="px-4 py-3">
                        <Badge variant={roleVariant[p.role]} dot>
                          <ShieldCheck size={12} className="mr-0.5" aria-hidden="true" />
                          {roles.find((r) => r.value === p.role)?.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="btn-icon w-9 h-9"
                            onClick={() => openEdit(p)}
                            aria-label={`Edit ${p.nama}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon w-9 h-9 hover:text-danger hover:bg-[#FBE8E6]"
                            onClick={() => handleDelete(p.id, p.nama)}
                            aria-label={`Hapus ${p.nama}`}
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
                title="Pengurus tidak ditemukan"
                description="Coba ubah kata kunci pencarian atau tambahkan pengurus baru."
                action={
                  <button type="button" className="btn-primary" onClick={openAdd}>
                    <UserPlus size={18} aria-hidden="true" /> Tambah Pengurus
                  </button>
                }
              />
            )}
          </>
        )}
      </div>

      {/* Modal form */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Pengurus' : 'Tambah Pengurus'}
        subtitle="Lengkapi data pengurus dan tentukan role akses (RBAC)."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <InlineNotice>{saveError}</InlineNotice>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="nama">Nama Lengkap</label>
              <input
                id="nama"
                name="nama"
                type="text"
                required
                className="input"
                value={form.nama}
                onChange={handleChange}
                placeholder="cth: Ahmad Fauzi"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                value={form.email}
                onChange={handleChange}
                placeholder="cth: ahmad@karangtaruna.id"
              />
            </div>
            <div>
              <label className="label" htmlFor="jabatan">Jabatan</label>
              <input
                id="jabatan"
                name="jabatan"
                type="text"
                required
                className="input"
                value={form.jabatan}
                onChange={handleChange}
                placeholder="cth: Ketua, Sekretaris, Anggota"
              />
            </div>
            <div>
              <label className="label" htmlFor="bidang">Bidang</label>
              <select
                id="bidang"
                name="bidang"
                className="select"
                value={form.bidang}
                onChange={handleChange}
              >
                <option value="-">-</option>
                {bidangList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="periode">Periode</label>
              <input
                id="periode"
                name="periode"
                type="text"
                className="input"
                value={form.periode}
                onChange={handleChange}
                placeholder="cth: 2025-2027"
              />
            </div>
            <div>
              <label className="label" htmlFor="telepon">No. Telepon</label>
              <input
                id="telepon"
                name="telepon"
                type="tel"
                className="input"
                value={form.telepon}
                onChange={handleChange}
                placeholder="cth: 0812-xxxx-xxxx"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="role">Role Akses (RBAC)</label>
              <select
                id="role"
                name="role"
                className="select"
                value={form.role}
                onChange={handleChange}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-1.5">
                Role menentukan hak akses pengguna pada dashboard ini.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Pengurus'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}