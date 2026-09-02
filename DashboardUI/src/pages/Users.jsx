import { useEffect, useState } from 'react'
import { UserCog, UserPlus, Pencil, Trash2, KeyRound, Search } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import InlineNotice from '../components/ui/InlineNotice.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { apiFetch } from '../lib/api'
import { userAdapter } from '../lib/adapters.js'
import { useAuth } from '../context/AuthContext.jsx'

const roleOptions = [
  { value: 'ketua', label: 'Ketua' },
  { value: 'wakil-ketua', label: 'Wakil Ketua' },
  { value: 'sekretaris', label: 'Sekretaris' },
  { value: 'bendahara', label: 'Bendahara' },
  { value: 'anggota', label: 'Anggota' },
]

/**
 * Role yang boleh dipilih oleh masing-masing pengguna yang sedang login.
 * Sekretaris tidak boleh menetapkan/mengubah role ke 'ketua'.
 * Ketua & wakil-ketua bisa menetapkan semua role.
 */
function getAllowedRoleOptions(currentUserRole) {
  if (currentUserRole === 'sekretaris') {
    return roleOptions.filter((r) => r.value !== 'ketua')
  }
  return roleOptions
}

const roleVariant = {
  'ketua': 'primary',
  'wakil-ketua': 'accent',
  'sekretaris': 'info',
  'bendahara': 'success',
  'anggota': 'neutral',
}

const emptyForm = {
  username: '',
  email: '',
  nama: '',
  password: '',
  role: 'anggota',
  isActive: true,
}

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  // Modal ganti password
  const [passwordModal, setPasswordModal] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState(null)
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const data = await apiFetch('/users')
      const list = Array.isArray(data) ? data : data?.items || []
      setUsers(list.map(userAdapter.toFrontend))
      setFallback(false)
    } catch (err) {
      console.log('[api] fallback: users', err)
      setFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.username.toLowerCase().includes(q) ||
      u.nama.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  const activeCount = users.filter((u) => u.isActive).length
  const inactiveCount = users.length - activeCount

  // RBAC: sekretaris tidak boleh kelola akun ber-role 'ketua'
  const canManageKetua = currentUser?.role !== 'sekretaris'
  // Daftar role yang bisa dipilih berdasarkan role pengguna yang login
  const allowedRoleOptions = getAllowedRoleOptions(currentUser?.role)

  function openAdd() {
    setEditingId(null)
    setForm({ ...emptyForm, role: 'anggota', isActive: true })
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      username: item.username,
      email: item.email || '',
      nama: item.nama || '',
      password: '',
      role: item.role,
      isActive: item.isActive,
    })
    setSaveError('')
    setModalOpen(true)
  }

  function openPassword(item) {
    setPasswordTarget(item)
    setPasswordValue('')
    setPasswordError('')
    setPasswordModal(true)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleRoleChange(e) {
    setForm((f) => ({ ...f, role: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.username.trim()) {
      setSaveError('Username wajib diisi.')
      return
    }
    if (!form.email.trim()) {
      setSaveError('Email wajib diisi.')
      return
    }
    if (!editingId && !form.password) {
      setSaveError('Password wajib diisi untuk akun baru.')
      return
    }
    setSaving(true)
    setSaveError('')
    const body = userAdapter.toBody(form)
    try {
      if (editingId) {
        await apiFetch(`/users/${editingId}`, { method: 'PUT', body })
      } else {
        await apiFetch('/users', { method: 'POST', body })
      }
      setModalOpen(false)
      await loadData()
    } catch (err) {
      setSaveError(err?.message || 'Gagal menyimpan akun.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    if (!passwordTarget) return
    if (!passwordValue) {
      setPasswordError('Password wajib diisi.')
      return
    }
    setChangingPassword(true)
    setPasswordError('')
    try {
      await apiFetch(`/users/${passwordTarget.id}/password`, {
        method: 'PUT',
        body: { password: passwordValue },
      })
      setPasswordModal(false)
      setPasswordTarget(null)
      setPasswordValue('')
    } catch (err) {
      setPasswordError(err?.message || 'Gagal mengganti password.')
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleDelete(id, username) {
    if (!window.confirm(`Hapus akun "${username}"?`)) return
    setDeletingId(id)
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' })
      setUsers((list) => list.filter((u) => u.id !== id))
      if (currentUser?.id === id) {
        window.alert('Anda menghapus akun yang sedang digunakan.')
      }
    } catch (err) {
      window.alert(err?.message || 'Gagal menghapus akun.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-caption text-text-muted">
          Kelola akun pengguna dashboard dan hak akses (RBAC) tiap role.
        </p>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <UserPlus size={18} aria-hidden="true" /> Tambah Akun
        </button>
      </div>

      {/* Info RBAC */}
      <div className="rounded-md border border-border-light bg-bg-alt px-4 py-3 text-sm text-text-secondary">
        <p className="font-medium text-text mb-1">Hak Akses Menu Ini (RBAC)</p>
        <ul className="list-disc list-inside space-y-0.5 text-xs text-text-muted">
          <li><strong>Ketua & Wakil Ketua</strong>: dapat mengelola semua akun termasuk role ketua.</li>
          <li><strong>Sekretaris</strong>: dapat mengelola akun, namun tidak dapat menetapkan role ketua.</li>
          <li><strong>Bendahara & Anggota</strong>: tidak memiliki akses ke menu ini.</li>
        </ul>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="primary" className="px-3 py-1.5">Total: {users.length} akun</Badge>
        <Badge variant="success" className="px-3 py-1.5">Aktif: {activeCount}</Badge>
        <Badge variant="neutral" className="px-3 py-1.5">Nonaktif: {inactiveCount}</Badge>
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
          placeholder="Cari username, nama, atau email..."
          aria-label="Cari akun"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingState label="Memuat akun..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light bg-bg-alt/50">
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Username</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Nama</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Terakhir Login</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-primary-light/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserCog size={17} className="text-accent shrink-0" aria-hidden="true" />
                          <p className="font-medium text-text text-sm">@{u.username}</p>
                        </div>
                        <p className="text-xs text-text-muted sm:hidden mt-1">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">
                        {u.nama || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary hidden lg:table-cell">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={roleVariant[u.role]}>
                          {roleOptions.find((r) => r.value === u.role)?.label || u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.isActive ? 'success' : 'neutral'} dot>
                          {u.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary hidden md:table-cell">{u.lastLogin}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="btn-icon w-9 h-9"
                            onClick={() => openEdit(u)}
                            aria-label={`Edit akun ${u.username}`}
                            disabled={!canManageKetua && u.role === 'ketua'}
                            title={!canManageKetua && u.role === 'ketua' ? 'Sekretaris tidak dapat mengedit akun Ketua' : undefined}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon w-9 h-9"
                            onClick={() => openPassword(u)}
                            aria-label={`Ganti password ${u.username}`}
                            disabled={!canManageKetua && u.role === 'ketua'}
                            title={!canManageKetua && u.role === 'ketua' ? 'Sekretaris tidak dapat mengubah password Ketua' : undefined}
                          >
                            <KeyRound size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon w-9 h-9 hover:text-danger hover:bg-[#FBE8E6]"
                            onClick={() => handleDelete(u.id, u.username)}
                            disabled={deletingId === u.id || (!canManageKetua && u.role === 'ketua')}
                            title={!canManageKetua && u.role === 'ketua' ? 'Sekretaris tidak dapat menghapus akun Ketua' : undefined}
                            aria-label={`Hapus akun ${u.username}`}
                          >
                            {deletingId === u.id ? <Spinner size={15} /> : <Trash2 size={16} />}
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
                title={search ? 'Akun tidak ditemukan' : 'Belum ada akun'}
                description="Tambahkan akun pengguna untuk memberi akses pada dashboard."
                action={
                  <button type="button" className="btn-primary" onClick={openAdd}>
                    <UserPlus size={18} aria-hidden="true" /> Tambah Akun
                  </button>
                }
              />
            )}
          </>
        )}
      </div>

      {/* Modal tambah/edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Akun' : 'Tambah Akun'}
        subtitle={editingId ? 'Perbarui data akun dan status akses.' : 'Buat akun baru beserta role akses.'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <InlineNotice>{saveError}</InlineNotice>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input"
                value={form.username}
                onChange={handleChange}
                placeholder="cth: ahmad_fauzi"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label" htmlFor="nama">Nama Lengkap (opsional)</label>
              <input
                id="nama"
                name="nama"
                type="text"
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
                required
                className="input"
                value={form.email}
                onChange={handleChange}
                placeholder="cth: ahmad@karangtaruna.id"
              />
            </div>
            {editingId ? (
              <div className="sm:col-span-2">
                <label className="label" htmlFor="role">Role Akses (RBAC)</label>
                <select
                  id="role"
                  name="role"
                  className="select"
                  value={form.role}
                  onChange={handleRoleChange}
                >
                  {allowedRoleOptions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <p className="text-xs text-text-muted mt-1.5">
                  Role menentukan menu &apos;route yang dapat diakses pada dashboard.
                  {currentUser?.role === 'sekretaris' && (
                    <span className="text-warning font-medium"> Sekretaris tidak dapat menetapkan role Ketua.</span>
                  )}
                </p>
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className="label" htmlFor="role">Role Akses (RBAC)</label>
                <select
                  id="role"
                  name="role"
                  className="select"
                  value={form.role}
                  onChange={handleRoleChange}
                >
                  {allowedRoleOptions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <p className="text-xs text-text-muted mt-1.5">
                  Role menentukan menu &apos;route yang dapat diakses pada dashboard.
                  {currentUser?.role === 'sekretaris' && (
                    <span className="text-warning font-medium"> Sekretaris tidak dapat menetapkan role Ketua.</span>
                  )}
                </p>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="label" htmlFor="password">
                {editingId ? 'Password Baru (kosongkan jika tetap)' : 'Password'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required={!editingId}
                className="input"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
              />
            </div>
            {editingId && (
              <div className="sm:col-span-2">
                <label className="label">Status Akun</label>
                <div className="flex gap-3">
                  {[
                    { value: true, label: 'Aktif' },
                    { value: false, label: 'Nonaktif' },
                  ].map((s) => (
                    <label key={String(s.value)} className="inline-flex items-center gap-2 text-sm text-text cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={form.isActive === s.value}
                        onChange={() => setForm((f) => ({ ...f, isActive: s.value }))}
                        className="accent-primary w-4 h-4"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
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
              {saving ? (
                <>
                  <Spinner size={14} /> Menyimpan...
                </>
              ) : editingId ? (
                'Simpan Perubahan'
              ) : (
                'Simpan Akun'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal ganti password */}
      <Modal
        open={passwordModal}
        onClose={() => setPasswordModal(false)}
        title="Ganti Password"
        subtitle={passwordTarget ? `Akun: @${passwordTarget.username}` : ''}
        size="sm"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && <InlineNotice>{passwordError}</InlineNotice>}
          <div>
            <label className="label" htmlFor="pw">Password Baru</label>
            <input
              id="pw"
              name="pw"
              type="password"
              required
              className="input"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setPasswordModal(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Spinner size={14} /> Menyimpan...
                </>
              ) : (
                'Simpan Password'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
