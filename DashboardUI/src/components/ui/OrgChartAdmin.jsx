// OrgChartAdmin — Bagan Struktur Organisasi (dashboard admin).
// Dibaca dari state `pengurus` yang sama dengan tabel, sehingga ikut berubah
// saat admin menambah / mengedit / menghapus pengurus.
//
// Struktur 3 level:
//   Level 1 : Ketua
//   Level 2 : Wakil Ketua, Sekretaris, Bendahara
//   Level 3 : Bidang — satu kartu per bidang, menampilkan semua anggota

import { Crown, Users, User } from 'lucide-react'
import Badge from './Badge.jsx'
import { roles, bidangList } from '../../data/pengurus.js'
import { getInitials, avatarColor } from '../../utils/format.js'

const roleVariant = {
  ketua: 'primary',
  'wakil-ketua': 'accent',
  sekretaris: 'info',
  bendahara: 'success',
  anggota: 'neutral',
}

const roleIcon = {
  ketua: Crown,
  'wakil-ketua': User,
  sekretaris: User,
  bendahara: User,
}

function roleLabel(role) {
  return roles.find((r) => r.value === role)?.label || role
}

function NodeCard({ pengurus, accent = 'primary', icon: Icon }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 mb-2 relative">
        <span className={`w-16 h-16 rounded-full flex items-center justify-center font-heading font-semibold text-lg text-white ${avatarColor(pengurus ? pengurus.nama : '?')}`}>
          {pengurus ? getInitials(pengurus.nama) : '-'}
        </span>
        {Icon && (
          <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-border-light flex items-center justify-center shadow-xs text-primary`}>
            <Icon size={14} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="font-heading font-semibold text-sm text-text leading-tight">
        {pengurus ? pengurus.nama : '-'}
      </p>
      <p className="font-body text-xs text-text-muted mt-0.5">{pengurus ? pengurus.jabatan : 'Belum diisi'}</p>
      {pengurus && (
        <Badge variant={roleVariant[pengurus.role] || 'neutral'} className="mt-1">
          {roleLabel(pengurus.role)}
        </Badge>
      )}
    </div>
  )
}

function BidangCard({ nama, members = [] }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center mb-2">
        <Users size={22} className="text-primary" aria-hidden="true" />
      </div>
      <p className="font-heading font-semibold text-xs text-text leading-tight">{nama}</p>
      <div className="text-[11px] text-text-muted mt-1 space-y-0.5">
        {members.length > 0 ? (
          members.map((name) => (
            <p key={name} className="font-medium text-text-secondary">{name}</p>
          ))
        ) : (
          <p className="text-text-muted">—</p>
        )}
      </div>
    </div>
  )
}

export default function OrgChartAdmin({ pengurus = [] }) {
  // Level 1 — Ketua (role 'ketua')
  const ketua = pengurus.find((p) => p.role === 'ketua')

  // Level 2 — Wakil, Sekretaris, Bendahara (urutan sesuai roles)
  const intiRoles = ['wakil-ketua', 'sekretaris', 'bendahara']
  const inti = intiRoles.map((role) => pengurus.find((p) => p.role === role))

  // Level 3 — Satu kartu per bidang (bidangList sebagai referensi),
  // members = semua pengurus role 'anggota' dengan bidang yang cocok.
  const level3 = bidangList.map((bidang) => ({
    nama: bidang,
    members: pengurus
      .filter((p) => p.role === 'anggota' && p.bidang === bidang)
      .map((p) => p.nama),
  }))

  return (
    <div className="overflow-x-auto py-2">
      <div className="min-w-[720px] flex flex-col items-center">
        {/* Level 1: Ketua */}
        <NodeCard pengurus={ketua} icon={Crown} />

        {/* Vertical line */}
        <div className="w-0.5 h-5 bg-border" />

        {/* Level 2: Wakil, Sekretaris, Bendahara */}
        <div className="relative w-full max-w-xl">
          <div className="absolute top-0 left-[16.67%] right-[16.67%] h-0.5 bg-border" />
          <div className="flex justify-between px-6 pt-5">
            <NodeCard pengurus={inti[0]} icon={roleIcon['wakil-ketua']} />
            <NodeCard pengurus={inti[1]} icon={roleIcon.sekretaris} />
            <NodeCard pengurus={inti[2]} icon={roleIcon.bendahara} />
          </div>
          <div className="absolute top-0 left-[16.67%] w-0.5 h-5 bg-border" />
          <div className="absolute top-0 left-1/2 w-0.5 h-5 bg-border -translate-x-1/2" />
          <div className="absolute top-0 right-[16.67%] w-0.5 h-5 bg-border" />
        </div>

        {/* Vertical line to bidang */}
        <div className="w-0.5 h-4 bg-border" />

        {/* Level 3: Bidang */}
        <div className="relative w-full max-w-3xl">
          <div className="absolute top-0 left-[7.14%] right-[7.14%] h-0.5 bg-border" />
          <div className="flex justify-between gap-2 px-1 pt-5">
            {level3.map((b) => (
              <BidangCard key={b.nama} nama={b.nama} members={b.members} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
