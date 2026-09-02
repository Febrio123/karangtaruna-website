import { User } from 'lucide-react';
import useApiData from '../../hooks/useApiData';
import { orgStructure as staticOrgStructure } from '../../data/team';
import { adaptOrgStructure } from '../../lib/adapters';

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
  );
}

export default function OrgChart() {
  // LIVE pengurus -> bagan. Rendered seketika memakai data statis, lalu
  // diperbarui dari API; kalau gagal tetap pakai statis (graceful fallback).
  const { data: orgStructure } = useApiData({
    url: '/pengurus',
    initial: staticOrgStructure,
    fallback: staticOrgStructure,
    adapter: (raw) => adaptOrgStructure(raw),
  });

  // Defensif: `orgStructure` bisa null/parsial saat API gagal atau belum
  // selesai. Akses semua level dengan optional chaining agar halaman tidak
  // pernah blank/throw walau data kosong.
  const structure = orgStructure && typeof orgStructure === 'object' ? orgStructure : {};
  const ketua = structure.ketua || {};
  const wakil = structure.wakil || {};
  const sekretaris = structure.sekretaris || {};
  const bendahara = structure.bendahara || {};
  const bidang = Array.isArray(structure.bidang) ? structure.bidang : [];

  const empty =
    !ketua.name && !wakil.name && !sekretaris.name && !bendahara.name && bidang.length === 0;

  if (empty) {
    return (
      <div className="rounded-md border border-dashed border-border bg-bg px-6 py-10 text-center">
        <p className="font-body text-body-base text-text-secondary">
          Belum ada struktur yang dimuat.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-4">
      <div className="min-w-[640px] flex flex-col items-center">
        {/* Ketua */}
        <OrgNode
          name={ketua.name ?? '—'}
          position={ketua.position ?? '—'}
          isTop
        />

        {/* Vertical line from ketua */}
        <div className="w-0.5 h-6 bg-border" />

        {/* Level 2: Wakil, Sekretaris, Bendahara */}
        <div className="relative w-full max-w-lg">
          {/* Horizontal line */}
          <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-border" />

          <div className="flex justify-between px-4 pt-6">
            <OrgNode
              name={wakil.name ?? '—'}
              position={wakil.position ?? '—'}
            />
            <OrgNode
              name={sekretaris.name ?? '—'}
              position={sekretaris.position ?? '—'}
            />
            <OrgNode
              name={bendahara.name ?? '—'}
              position={bendahara.position ?? '—'}
            />
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
            {bidang.map((bidang) => (
              <div
                key={bidang.name ?? 'bidang'}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mb-1 border-2 border-accent/20">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <p className="font-heading text-caption font-semibold text-text leading-tight">
                  {bidang.name ?? '—'}
                </p>
                <p className="font-body text-[11px] text-text-muted">
                  {bidang.leader ?? '—'}
                </p>
                <p className="font-body text-[11px] text-text-muted">
                  {bidang.members} anggota
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
