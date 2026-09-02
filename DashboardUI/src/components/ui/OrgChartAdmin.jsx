// OrgChartAdmin — Bagan Struktur Organisasi (dashboard admin).
// Visual IDENTIK dengan OrgChart.jsx UserUI.
// Dibaca dari state `pengurus` yang sama dengan tabel.

import { User } from 'lucide-react'
import { bidangList } from '../../data/pengurus.js'

function OrgNode({ name, position, isTop = false }) {
  return (
    <div className={`flex flex-col items-center ${isTop ? 'mb-2' : ''}`}>
      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-1 border-2 border-primary/20">
        <User className="w-7 h-7 text-primary" />
      </div>
      <p className="font-heading text-body-base font-semibold text-text text-center leading-tight">
        {name}
      </p>
      <p className="font-body text-caption text-primary text-center">{position}</p>
    </div>
  )
}

export default function OrgChartAdmin({ pengurus = [] }) {
  // Level 1 — Ketua (role 'ketua')
  const ketua = pengurus.find((p) => p.role === 'ketua')

  // Level 2 — Wakil, Sekretaris, Bendahara
  const intiRoles = ['wakil-ketua', 'sekretaris', 'bendahara']
  const inti = intiRoles.map((role) => pengurus.find((p) => p.role === role))

  // Level 3 — Satu kartu per bidang, members = nama anggota
  const level3 = bidangList.map((bidang) => ({
    nama: bidang,
    members: pengurus
      .filter((p) => p.role === 'anggota' && p.bidang === bidang)
      .map((p) => p.nama),
  }))

  return (
    <div className="overflow-x-auto py-4">
      <div className="min-w-[640px] flex flex-col items-center">
        {/* Level 1: Ketua */}
        <OrgNode
          name={ketua?.nama || '—'}
          position={ketua?.jabatan || '—'}
          isTop
        />

        {/* Vertical line from ketua */}
        <div className="w-0.5 h-6 bg-border" />

        {/* Level 2: Wakil, Sekretaris, Bendahara */}
        <div className="relative w-full max-w-lg">
          {/* Horizontal line */}
          <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-border" />

          <div className="flex justify-between px-4 pt-6">
            {inti.map((p) => (
              <OrgNode
                key={p?.role ?? Math.random()}
                name={p?.nama || '—'}
                position={p?.jabatan || '—'}
              />
            ))}
          </div>

          {/* Vertical lines down */}
          <div className="absolute top-0 left-[20%] w-0.5 h-6 bg-border" />
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-border -translate-x-0.5" />
          <div className="absolute top-0 right-[20%] w-0.5 h-6 bg-border" />
        </div>

        {/* Vertical lines to bidang */}
        <div className="w-0.5 h-6 bg-border" />

        {/* Level 3: Bidang-bidang */}
        <div className="relative w-full max-w-3xl">
          <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-border" />

          <div className="flex justify-between px-2 pt-6">
            {level3.map((bidang) => (
              <div
                key={bidang.nama}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mb-1 border-2 border-accent/20">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <p className="font-heading text-caption font-semibold text-text leading-tight">
                  {bidang.nama}
                </p>
                <ul className="mt-1 space-y-0.5 text-center">
                  {bidang.members.length > 0 ? (
                    bidang.members.map((m) => (
                      <li key={m} className="font-body text-[11px] text-text-muted">
                        {m}
                      </li>
                    ))
                  ) : (
                    <li className="font-body text-[11px] text-text-muted">—</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
