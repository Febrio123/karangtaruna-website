import { User } from 'lucide-react';
import useApiData from '../../hooks/useApiData';
import { orgStructure as staticOrgStructure } from '../../data/team';
import { adaptOrgStructure } from '../../lib/adapters';

function OrgNode({ people, defaultTitle, isTop = false }) {
  const items = Array.isArray(people)
    ? people.filter(Boolean)
    : people && typeof people === 'object' && (people.name || people.position)
    ? [people]
    : [];

  const list =
    items.length > 0
      ? items
      : [{ name: '—', position: defaultTitle || '—' }];

  return (
    <div className={`flex flex-col items-center text-center ${isTop ? 'mb-2' : ''}`}>
      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-1.5 border-2 border-primary/20 shrink-0">
        <User className="w-7 h-7 text-primary" />
      </div>
      <div className="flex flex-col items-center gap-1.5 max-w-[160px]">
        {list.map((item, idx) => (
          <div key={item.id || item.name || idx} className="flex flex-col items-center w-full">
            {idx > 0 && <div className="w-10 h-px bg-border/60 my-1" />}
            <p className="font-heading text-body-base font-semibold text-text leading-tight">
              {item.name ?? '—'}
            </p>
            <p className="font-body text-caption text-primary leading-tight">
              {item.position ?? defaultTitle ?? '—'}
            </p>
          </div>
        ))}
      </div>
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

  const toPeopleArray = (item, defaultPos) => {
    if (Array.isArray(item)) return item;
    if (item && typeof item === 'object' && (item.name || item.position)) return [item];
    return [];
  };

  const ketuaList = toPeopleArray(structure.ketua, 'Ketua');
  const wakilList = toPeopleArray(structure.wakil, 'Wakil Ketua');
  const sekretarisList = toPeopleArray(structure.sekretaris, 'Sekretaris');
  const bendaharaList = toPeopleArray(structure.bendahara, 'Bendahara');
  const bidang = Array.isArray(structure.bidang) ? structure.bidang : [];

  const empty =
    ketuaList.length === 0 &&
    wakilList.length === 0 &&
    sekretarisList.length === 0 &&
    bendaharaList.length === 0 &&
    bidang.length === 0;

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
          people={ketuaList}
          defaultTitle="Ketua"
          isTop
        />

        {/* Vertical line from ketua */}
        <div className="w-0.5 h-6 bg-border" />

        {/* Level 2: Wakil, Sekretaris, Bendahara */}
        <div className="relative w-full max-w-xl">
          {/* Horizontal line */}
          <div className="absolute top-0 left-[18%] right-[18%] h-0.5 bg-border" />

          <div className="flex justify-between px-2 pt-6 items-start">
            <OrgNode
              people={wakilList}
              defaultTitle="Wakil Ketua"
            />
            <OrgNode
              people={sekretarisList}
              defaultTitle="Sekretaris"
            />
            <OrgNode
              people={bendaharaList}
              defaultTitle="Bendahara"
            />
          </div>

          {/* Vertical lines down */}
          <div className="absolute top-0 left-[18%] w-0.5 h-6 bg-border" />
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-border -translate-x-0.5" />
          <div className="absolute top-0 right-[18%] w-0.5 h-6 bg-border" />
        </div>


        {/* Vertical lines to bidang */}
        <div className="w-0.5 h-6 bg-border" />

        {/* Level 3: Bidang-bidang */}
        <div className="relative w-full max-w-3xl">
          <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-border" />

          <div className="flex justify-between px-2 pt-6">
            {bidang.map((bidang) => {
              // Guard: `members` boleh array nama ATAU number (fallback lama).
              // Jangan pernah tampilkan "N anggota" — tampilkan daftar nama.
              const members = Array.isArray(bidang.members)
                ? bidang.members
                : bidang.members
                  ? [bidang.leader]
                  : [];

              return (
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
                  <ul className="mt-1 space-y-0.5 text-center">
                    {members.map((m) => (
                      <li key={m} className="font-body text-[11px] text-text-muted">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
