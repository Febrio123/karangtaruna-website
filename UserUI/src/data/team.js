// ============================================================================
// UserUI/src/data/team.js — Derivasi dari shared/team.js (SINGLE SOURCE)
// ============================================================================
// Jangan edit data di sini; edit di shared/team.js.
// File ini mengkonversi format pengurus (dashboard) ke format yang dibutuhkan
// UserUI: teamMembers dan orgStructure.
// ============================================================================

import { pengurus, roles } from '@shared/team.js';

// --- Helper: map role value ke label division untuk pengurus inti ---
const intiDivisionMap = {
  ketua: 'Ketua Umum',
  'wakil-ketua': 'Wakil Ketua Umum',
  sekretaris: 'Sekretariat',
  bendahara: 'Bendahara',
};

// --- Pengelompokan anggota per bidang (untuk org chart) ---
// Tidak ada dummyMemberCounts — members adalah array nama anggota, bukan angka.

/**
 * teamMembers — daftar pengurus dalam format yang dipakai UserUI.
 *
 * Field: id, name, position, division, period, phone, photo, photoAlt
 */
export const teamMembers = pengurus.map((p) => ({
  id: p.id,
  name: p.nama,
  position: p.jabatan,
  division: p.bidang === '-' ? (intiDivisionMap[p.role] || p.jabatan) : p.bidang,
  period: p.periode,
  phone: p.telepon,
  photo: null,
  photoAlt: `Foto profil ${p.nama} sebagai ${p.jabatan} Karang Taruna`,
}));

/**
 * orgStructure — struktur organisasi untuk visualisasi org chart.
 *
 * Field: ketua, wakil, sekretaris, bendahara (masing-masing {name, position}),
 *        bidang (array of {name, leader, members})
 */
function findPengurusList(roleValue) {
  const items = pengurus.filter((item) => item.role === roleValue);
  return items.map((p) => ({ id: p.id, name: p.nama, position: p.jabatan }));
}

// Kumpulkan data bidang dari pengurus role 'anggota' — group by bidang unik.
// `members` = array nama semua anggota di bidang tsb (bukan angka).
const bidangMembers = pengurus
  .filter((p) => p.role === 'anggota' && p.bidang && p.bidang !== '-')
  .reduce((acc, p) => {
    const b = p.bidang;
    if (!acc[b]) acc[b] = { name: b, leader: p.nama, members: [] };
    acc[b].members.push(p.nama);
    return acc;
  }, {});
const bidangData = Object.values(bidangMembers);

export const orgStructure = {
  ketua: findPengurusList('ketua'),
  wakil: findPengurusList('wakil-ketua'),
  sekretaris: findPengurusList('sekretaris'),
  bendahara: findPengurusList('bendahara'),
  bidang: bidangData,
};

