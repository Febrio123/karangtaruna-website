// ============================================================================
// UserUI/src/lib/adapters.js — pemetaan field backend -> struktur frontend.
// ============================================================================
// Backend mengirim nama field sendiri (Mongoose / snake_case untuk data bisnis
// requirement). Komponen UserUI memakai struktur statis src/data/*.js. Adaptor
// ini menjembatani keduanya sehingga kita bisa menukar sumber data statis ke
// LIVE API tanpa mengubah komponen/layout yang sudah ada.
//
// Prinsip:
//  - id unik SEMUA memakai `_id` (fallback ke slug/nama bila _id hilang).
//  - Tanggal dinormalisasi ke `YYYY-MM-DD` karena komponen memakai util
//    formatDate yang meng-append 'T00:00:00' (ISO penuh API akan jadi invalid).
//  - Gambar: backend menaruh {public_id, secure_url}; frontend hanya butuh
//    URL (gambar null -> placeholder).
//  - Selalu defensif (optional chaining + default) agar data parsial tidak
//    membuat render error.
// ============================================================================

// --- Utilitas umum ----------------------------------------------------------

/** Normalisasi tanggal apapun (ISO, Date, atau 'YYYY-MM-DD') ke 'YYYY-MM-DD'. */
export function normalizeDate(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/** 
 * Ambil public_id dari objek `{public_id, secure_url}` (bisa null).
 * Komponen gambar UserUI (CloudinaryImage) mengharapkan **public_id** 
 * (bukan URL penuh), jadi kita prioritaskan public_id dan fallback secure_url.
 */
export function mediaUrl(media) {
  if (!media || typeof media !== 'object') return null;
  return media.public_id || media.secure_url || null;
}

/**
 * Salin objek media mentah `{public_id, secure_url}` ke struktur frontend.
 * CloudinaryImage kini dual-source: `publicId` (Cloudinary) ATAU `src`
 * (URL/data-URI). Media mode uji-coba menyimpan `data:` / URL di
 * `secure_url` dengan `public_id = null`; produksi Cloudinary memakai
 * `public_id`. Kita selalu terima keduanya agar komponen memprioritaskan
 * `src` bila ada dan fallback ke `publicId` bila `secure_url` kosong.
 */
export function cloneMedia(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    public_id: raw.public_id ?? null,
    secure_url: raw.secure_url ?? null,
  };
}

function keyFor(item, fallback) {
  return item._id || item.id || fallback;
}

// --- Pengurus ----------------------------------------------------------------
// Backend: _id, nama, jabatan, bidang, periode, role, telepon, level, urutan,
//          email, foto{public_id,secure_url}
// Frontend teamMembers: { id, name, position, division, period, phone, photo,
//                          photoAlt }
// Frontend orgStructure: { ketua, wakil, sekretaris, bendahara, bidang[] }

const INTI_DIVISION_MAP = {
  ketua: 'Ketua Umum',
  'wakil-ketua': 'Wakil Ketua Umum',
  sekretaris: 'Sekretariat',
  bendahara: 'Bendahara',
};

export function adaptTeamMember(p) {
  return {
    id: keyFor(p, p.nama),
    name: p.nama,
    position: p.jabatan,
    division:
      p.bidang === '-' || !p.bidang
        ? INTI_DIVISION_MAP[p.role] || p.jabatan
        : p.bidang,
    period: p.periode,
    phone: p.telepon,
    photo: mediaUrl(p.foto),
    media: cloneMedia(p.foto),
    photoAlt: `Foto profil ${p.nama} sebagai ${p.jabatan} Karang Taruna`,
  };
}

export function adaptTeamList(list) {
  return (list || []).map(adaptTeamMember);
}

/** Bangun orgStructure (bagan) dari daftar pengurus backend. */
export function adaptOrgStructure(list) {
  const arr = list || [];
  const findAll = (roleVal) => {
    const matched = arr.filter((x) => x.role === roleVal);
    return matched.map((p) => {
      const adapted = adaptTeamMember(p);
      return { id: adapted.id, name: adapted.name, position: adapted.position };
    });
  };

  // Group anggota per bidang unik — `members` = array nama, bukan angka.
  const grouped = arr
    .filter((p) => p.role === 'anggota' && p.bidang && p.bidang !== '-')
    .reduce((acc, p) => {
      const b = p.bidang;
      if (!acc[b]) acc[b] = { name: b, leader: p.nama, members: [] };
      acc[b].members.push(p.nama);
      return acc;
    }, {});

  const bidang = Object.values(grouped);

  return {
    ketua: findAll('ketua'),
    wakil: findAll('wakil-ketua'),
    sekretaris: findAll('sekretaris'),
    bendahara: findAll('bendahara'),
    bidang,
  };
}


// --- Artikel / Berita --------------------------------------------------------
// Backend list fields: _id, slug, title, category, date, author, excerpt,
//                      cover{public_id,secure_url}, imageAlt, ...
// Backend detail: + content (HTML).
// Frontend articles: { id, slug, title, category, date, author, excerpt,
//                      content, image, imageAlt }

export function adaptArticle(a) {
  return {
    id: keyFor(a, a.slug),
    slug: a.slug,
    title: a.title,
    category: a.category,
    date: normalizeDate(a.date),
    author: a.author,
    excerpt: a.excerpt,
    content: a.content,
    image: mediaUrl(a.cover),
    media: cloneMedia(a.cover),
    imageAlt: a.imageAlt,
  };
}

export function adaptArticleList(resp) {
  const items = resp && Array.isArray(resp.items) ? resp.items : [];
  return items.map(adaptArticle);
}

// --- Event / Pengumuman ------------------------------------------------------
// Backend: _id, title, date, time, location, description, status, budget,
//          image{public_id,secure_url}, type, year
// Frontend events.js: { id, title, date, time, location, status, description,
//                       type, budget:{amount,label} }

export function adaptEvent(e) {
  return {
    id: keyFor(e, e.title),
    title: e.title,
    date: normalizeDate(e.date),
    time: e.time,
    location: e.location,
    status: e.status, // 'Mendatang' | 'Selesai'
    description: e.description,
    type: e.type || 'event',
    budget:
      e.budget && typeof e.budget.amount === 'number'
        ? { amount: e.budget.amount, label: e.budget.label }
        : null,
  };
}

export function adaptEventList(resp) {
  const items = resp && Array.isArray(resp.items) ? resp.items : [];
  return items.map(adaptEvent);
}

// --- Galeri ------------------------------------------------------------------
// Backend: _id, title, category, year, type, description,
//          media{public_id,secure_url}, imageAlt
// Frontend gallery.js: { id, title, category, year, type, description,
//                        image, imageAlt }

export function adaptGalleryItem(g) {
  return {
    id: keyFor(g, g.title),
    title: g.title,
    category: g.category,
    year: g.year,
    type: g.type || 'image',
    description: g.description,
    image: mediaUrl(g.media),
    media: cloneMedia(g.media),
    imageAlt: g.imageAlt,
  };
}

export function adaptGalleryList(resp) {
  const items = resp && Array.isArray(resp.items) ? resp.items : [];
  return items.map(adaptGalleryItem);
}

// --- Site Config / Profil ----------------------------------------------------
// Backend: name, shortName, tagline, address, phone, email, operatingHours,
//          vision, mission[], socialMedia{instagram}
//          map{lat,lng,zoom}, stats{members,programs,yearsActive},
//          history{summary,timeline[]}, information[]
// Frontend tampilannya identik dgn data statis; kita isi nilai null/undefined
// dengan fallback agar halaman tidak kosong saat field belum diinput.

export function adaptSiteConfig(c) {
  if (!c || typeof c !== 'object') return null;
  return {
    name: c.name,
    shortName: c.shortName,
    tagline: c.tagline,
    address: c.address,
    phone: c.phone,
    email: c.email,
    operatingHours: c.operatingHours,
    socialMedia: c.socialMedia || {},
    map:
      c.map && typeof c.map.lat === 'number'
        ? c.map
        : { lat: null, lng: null, zoom: 15 },
    stats: c.stats || {},
    vision: c.vision,
    mission: c.mission || [],
    history: c.history || { summary: null, timeline: [] },
    information: c.information || [],
  };
}

// --- Anggaran / Transparansi kas ---------------------------------------------
// Backend ringkasan: { tahun, totalPemasukan, totalPengeluaran, saldo,
//   jumlahPemasukan, jumlahPengeluaran, perBulan{pemasukan[],pengeluaran[]},
//   perKategori[] }
// Backend transaksi individual: { _id, tahun, jenis, kategori, tanggal,
//   deskripsi, jumlah, eventId }
// Frontend budget.js: { year, period, income:[{date,description,amount}],
//   expenses:[{date,description,amount}] } + summary via getBudgetSummary().

/** Konversi satu transaksi backend ke baris tabel ({date,description,amount}). */
export function adaptTransaksiRow(t) {
  return {
    date: normalizeDate(t.tanggal || t.date),
    description: t.deskripsi || t.description || '',
    amount: Number(t.jumlah ?? t.amount) || 0,
  };
}

  /** Konversi list transaksi menjadi {income[], expenses[]}. */
  export function adaptTransaksiToBudget(resp) {
    const list = resp && Array.isArray(resp.items) ? resp.items : Array.isArray(resp) ? resp : [];
    const income = [];
    const expenses = [];
    list.forEach((t) => {
    const row = adaptTransaksiRow(t);
    if (t.jenis === 'pemasukan') income.push(row);
    else expenses.push(row);
  });
  return { income, expenses };
}

/** Hitung ringkasan ({totalIncome,totalExpenses,balance,incomeCount,...
    expenseCount}) dari list transaksi. Dipakai bila endpoint ringkasan gagal. */
export function deriveBudgetSummary({ income, expenses }) {
  const sum = (arr) => arr.reduce((acc, x) => acc + (Number(x.amount) || 0), 0);
  const totalIncome = sum(income);
  const totalExpenses = sum(expenses);
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    incomeCount: income.length,
    expenseCount: expenses.length,
  };
}

/** Konversi objek ringkasan API menjadi struktur ringkasan frontend. */
export function adaptBudgetSummaryRaw(r) {
  if (!r) return null;
  return {
    tahun: r.tahun,
    totalIncome: Number(r.totalPemasukan) || 0,
    totalExpenses: Number(r.totalPengeluaran) || 0,
    balance: Number(r.saldo) || 0,
    incomeCount: Number(r.jumlahPemasukan) || 0,
    expenseCount: Number(r.jumlahPengeluaran) || 0,
    perBulan: r.perBulan,
    perKategori: r.perKategori,
  };
}

// --- Parameter Ekonomi + Prediksi ---------------------------------------------
// Backend /parameter-ekonomi -> array { tahun, persentase_inflasi }.
// Backend /prediksi-anggaran/:nama_event -> objek { nama_event, tahun_prediksi,
//   histori_digunakan[], wma, persentase_inflasi_digunakan, prediksi_final }.

export function adaptParameterEkonomi(list) {
  return (list || []).map((p) => ({
    tahun: p.tahun,
    persentase_inflasi: Number(p.persentase_inflasi) || 0,
  }));
}

export function adaptPrediksi(p) {
  return p && typeof p === 'object' ? p : null;
}
