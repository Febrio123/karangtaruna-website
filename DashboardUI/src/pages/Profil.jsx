import { useState } from 'react'
import {
  Save,
  Plus,
  Trash2,
  Pencil,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Music2,
  Building2,
} from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { profil as initialProfil, socialLinks as initialSocial, statsProfil, infoUmum as initialInfo } from '../data/profil.js'

const socialIconMap = {
  Instagram,
  Facebook,
  YouTube: Youtube,
  TikTok: Music2,
}

const emptyInfo = { judul: '', deskripsi: '', aktif: true }
const emptySocial = { platform: 'Instagram', handle: '', url: '' }

export default function Profil() {
  const [profil, setProfil] = useState(initialProfil)
  const [social, setSocial] = useState(initialSocial)
  const [info, setInfo] = useState(initialInfo)
  const [saved, setSaved] = useState(false)
  const [infoModal, setInfoModal] = useState(false)
  const [editingInfo, setEditingInfo] = useState(null)
  const [infoForm, setInfoForm] = useState(emptyInfo)
  const [socialModal, setSocialModal] = useState(false)
  const [socialForm, setSocialForm] = useState(emptySocial)

  function handleProfileChange(e) {
    const { name, value } = e.target
    setProfil((p) => ({ ...p, [name]: value }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // Info umum handlers
  function openInfoAdd() {
    setEditingInfo(null)
    setInfoForm(emptyInfo)
    setInfoModal(true)
  }
  function openInfoEdit(item) {
    setEditingInfo(item.id)
    setInfoForm({ judul: item.judul, deskripsi: item.deskripsi, aktif: item.aktif })
    setInfoModal(true)
  }
  function handleInfoChange(e) {
    const { name, value, type, checked } = e.target
    setInfoForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }
  function handleInfoSave(e) {
    e.preventDefault()
    if (editingInfo) {
      setInfo((list) => list.map((i) => (i.id === editingInfo ? { ...i, ...infoForm } : i)))
    } else {
      const newId = Math.max(...info.map((i) => i.id)) + 1
      setInfo((list) => [{ id: newId, ...infoForm }, ...list])
    }
    setInfoModal(false)
  }
  function handleInfoDelete(id) {
    setInfo((list) => list.filter((i) => i.id !== id))
  }

  // Social handlers
  function openSocialAdd() {
    setSocialForm(emptySocial)
    setSocialModal(true)
  }
  function handleSocialSave(e) {
    e.preventDefault()
    const newId = Math.max(...social.map((s) => s.id)) + 1
    setSocial((list) => [...list, { id: newId, ...socialForm, url: socialForm.url || '#' }])
    setSocialModal(false)
  }
  function handleSocialDelete(id) {
    setSocial((list) => list.filter((s) => s.id !== id))
  }
  function handleSocialChange(e) {
    const { name, value } = e.target
    setSocialForm((f) => ({ ...f, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-caption text-text-muted">
          Kelola profil organisasi dan informasi yang tampil di website.
        </p>
        {saved && <Badge variant="success" dot>Perubahan tersimpan</Badge>}
      </div>

      {/* Profil organisasi */}
      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border-light pb-3">
          <Building2 size={18} className="text-primary" aria-hidden="true" />
          <h3 className="font-heading font-semibold text-h3 text-text">Profil Organisasi</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="nama">Nama Organisasi</label>
            <input id="nama" name="nama" type="text" className="input" value={profil.nama} onChange={handleProfileChange} />
          </div>
          <div>
            <label className="label" htmlFor="singkatan">Singkatan</label>
            <input id="singkatan" name="singkatan" type="text" className="input" value={profil.singkatan} onChange={handleProfileChange} />
          </div>
          <div>
            <label className="label" htmlFor="tagline">Tagline</label>
            <input id="tagline" name="tagline" type="text" className="input" value={profil.tagline} onChange={handleProfileChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="tentang">Tentang Organisasi</label>
            <textarea id="tentang" name="tentang" rows="3" className="input resize-none" value={profil.tentang} onChange={handleProfileChange} />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            <Save size={17} aria-hidden="true" /> Simpan Profil
          </button>
        </div>
      </form>

      {/* Kontak */}
      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border-light pb-3">
          <MapPin size={18} className="text-primary" aria-hidden="true" />
          <h3 className="font-heading font-semibold text-h3 text-text">Kontak & Sekretariat</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="alamat">Alamat</label>
            <input id="alamat" name="alamat" type="text" className="input" value={profil.alamat} onChange={handleProfileChange} />
          </div>
          <div>
            <label className="label" htmlFor="kota">Kota / Kabupaten</label>
            <input id="kota" name="kota" type="text" className="input" value={profil.kota} onChange={handleProfileChange} />
          </div>
          <div>
            <label className="label" htmlFor="provinsi">Provinsi / Kode Pos</label>
            <input id="provinsi" name="provinsi" type="text" className="input" value={profil.provinsi} onChange={handleProfileChange} />
          </div>
          <div>
            <label className="label" htmlFor="telepon">Telepon</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input id="telepon" name="telepon" type="tel" className="input pl-9" value={profil.telepon} onChange={handleProfileChange} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input id="email" name="email" type="email" className="input pl-9" value={profil.email} onChange={handleProfileChange} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="sekretariat">Sekretariat</label>
            <input id="sekretariat" name="sekretariat" type="text" className="input" value={profil.sekretariat} onChange={handleProfileChange} />
          </div>
          <div>
            <label className="label" htmlFor="jamOperasional">Jam Operasional</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input id="jamOperasional" name="jamOperasional" type="text" className="input pl-9" value={profil.jamOperasional} onChange={handleProfileChange} />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            <Save size={17} aria-hidden="true" /> Simpan Kontak
          </button>
        </div>
      </form>

      {/* Stats */}
      <div className="card p-5">
        <div className="border-b border-border-light pb-3 mb-4">
          <h3 className="font-heading font-semibold text-h3 text-text">Statistik Website</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsProfil.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-md border border-border-light">
              <input
                type="text"
                defaultValue={s.nilai}
                className="w-16 text-center font-heading font-bold text-h3 text-primary bg-primary-light rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Nilai ${s.label}`}
              />
              <div>
                <p className="text-sm font-medium text-text">{s.label}</p>
                <p className="text-xs text-text-muted">Angka yang tampil</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media sosial */}
      <div className="card p-5">
        <div className="flex items-center justify-between border-b border-border-light pb-3 mb-4">
          <h3 className="font-heading font-semibold text-h3 text-text">Media Sosial</h3>
          <button type="button" className="btn-secondary !min-h-0 !h-9" onClick={openSocialAdd}>
            <Plus size={16} aria-hidden="true" /> Tambah
          </button>
        </div>
        <ul className="space-y-3">
          {social.map((s) => {
            const Icon = socialIconMap[s.platform] || Instagram
            return (
              <li key={s.id} className="flex items-center gap-3 p-3 rounded-md border border-border-light">
                <span className="w-9 h-9 rounded-md bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{s.platform}</p>
                  <p className="text-xs text-text-muted truncate">{s.handle}</p>
                </div>
                <Badge variant="neutral">Terhubung</Badge>
                <button
                  type="button"
                  className="btn-icon w-9 h-9 hover:text-danger hover:bg-[#FBE8E6]"
                  onClick={() => handleSocialDelete(s.id)}
                  aria-label={`Hapus ${s.platform}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Informasi umum */}
      <div className="card p-5">
        <div className="flex items-center justify-between border-b border-border-light pb-3 mb-4">
          <h3 className="font-heading font-semibold text-h3 text-text">Informasi Umum</h3>
          <button type="button" className="btn-secondary !min-h-0 !h-9" onClick={openInfoAdd}>
            <Plus size={16} aria-hidden="true" /> Tambah Section
          </button>
        </div>

        {info.length === 0 ? (
          <EmptyState
            title="Belum ada section informasi"
            description="Tambahkan section informasi yang tampil di halaman website."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {info.map((i) => (
              <div key={i.id} className="flex items-start gap-3 p-4 rounded-md border border-border-light">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-semibold text-text">{i.judul}</h4>
                    <Badge variant={i.aktif ? 'success' : 'neutral'}>{i.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
                  </div>
                  <p className="text-caption text-text-muted mt-1 line-clamp-2">{i.deskripsi}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" className="btn-icon w-9 h-9" onClick={() => openInfoEdit(i)} aria-label={`Edit ${i.judul}`}>
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon w-9 h-9 hover:text-danger hover:bg-[#FBE8E6]"
                    onClick={() => handleInfoDelete(i.id)}
                    aria-label={`Hapus ${i.judul}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info modal */}
      <Modal
        open={infoModal}
        onClose={() => setInfoModal(false)}
        title={editingInfo ? 'Edit Section Informasi' : 'Tambah Section Informasi'}
        subtitle="Section yang tampil di halaman Informasi website."
      >
        <form onSubmit={handleInfoSave} className="space-y-4">
          <div>
            <label className="label" htmlFor="judulInfo">Judul Section</label>
            <input id="judulInfo" name="judul" type="text" required className="input" value={infoForm.judul} onChange={handleInfoChange} placeholder="cth: Keanggotaan" />
          </div>
          <div>
            <label className="label" htmlFor="deskripsiInfo">Deskripsi</label>
            <textarea id="deskripsiInfo" name="deskripsi" rows="3" className="input resize-none" value={infoForm.deskripsi} onChange={handleInfoChange} placeholder="Ringkasan singkat..." />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-text cursor-pointer">
            <input
              type="checkbox"
              name="aktif"
              checked={infoForm.aktif}
              onChange={handleInfoChange}
              className="accent-primary w-4 h-4"
            />
            Tampilkan di website
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setInfoModal(false)}>Batal</button>
            <button type="submit" className="btn-primary">{editingInfo ? 'Simpan Perubahan' : 'Tambahkan Section'}</button>
          </div>
        </form>
      </Modal>

      {/* Social modal */}
      <Modal
        open={socialModal}
        onClose={() => setSocialModal(false)}
        title="Tambah Media Sosial"
        subtitle="Tambahkan akun media sosial organisasi."
      >
        <form onSubmit={handleSocialSave} className="space-y-4">
          <div>
            <label className="label" htmlFor="platform">Platform</label>
            <select id="platform" name="platform" className="select" value={socialForm.platform} onChange={handleSocialChange}>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="YouTube">YouTube</option>
              <option value="TikTok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="handle">Username / Handle</label>
            <input id="handle" name="handle" type="text" required className="input" value={socialForm.handle} onChange={handleSocialChange} placeholder="@karangtaruna" />
          </div>
          <div>
            <label className="label" htmlFor="url">URL Profil</label>
            <input id="url" name="url" type="url" className="input" value={socialForm.url} onChange={handleSocialChange} placeholder="https://..." />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setSocialModal(false)}>Batal</button>
            <button type="submit" className="btn-primary">Tambahkan</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
