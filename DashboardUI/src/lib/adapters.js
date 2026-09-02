// ============================================================================
// lib/adapters.js — Pemetaan dua arah: respons API ⇄ bentuk data UI dashboard
// Semua fungsi mengikuti pola penamaan field yang dipakai halaman (data/*.js).
// ============================================================================

/** Pemetaan lintas bentuk list: array mentah vs { items, pagination }. */
export function apiList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  return []
}

export function apiPagination(data) {
  return data && typeof data === 'object' && data.pagination ? data.pagination : null
}

const touched = (v) => (v === undefined || v === null ? '' : v)

// ---------------------------------------------------------------------------
// Pengurus — backend: {nama,email,jabatan,bidang,periode,role,level,urutan,telepon,foto}
// ---------------------------------------------------------------------------
export const LEVEL_BY_ROLE = { ketua: 1, 'wakil-ketua': 2, sekretaris: 2, bendahara: 2, anggota: 3 }

/** level wajib untuk route POST/PUT — di-derive dari role di sisi client. */
export function levelFromRole(role) {
  return LEVEL_BY_ROLE[role] || 3
}

export const pengurusAdapter = {
  toFrontend(b) {
    return {
      id: b._id,
      nama: touched(b.nama),
      email: touched(b.email),
      jabatan: touched(b.jabatan),
      bidang: touched(b.bidang) === 'intranet' ? '-' : touched(b.bidang),
      periode: touched(b.periode),
      role: b.role || 'anggota',
      telepon: touched(b.telepon),
      foto: b.foto || '',
    }
  },
  toBody(f) {
    return {
      nama: String(f.nama || '').trim(),
      email: String(f.email || '').trim(),
      jabatan: String(f.jabatan || '').trim(),
      bidang: f.bidang ? String(f.bidang) : '',
      periode: String(f.periode || '').trim(),
      role: f.role || 'anggota',
      level: levelFromRole(f.role || 'anggota'),
      urutan: Number(f.urutan) || undefined,
      telepon: String(f.telepon || '').trim() || undefined,
    }
  },
}

// ---------------------------------------------------------------------------
// Artikel/Berita — backend: {slug,title,category,date,author,excerpt,content,imageAlt,isPublished}
// ---------------------------------------------------------------------------
export function slugify(title) {
  const base = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return base || `artikel-${Date.now().toString(36)}`
}

export const artikelAdapter = {
  toFrontend(b) {
    return {
      id: b._id,
      slug: b.slug || '',
      judul: touched(b.title),
      kategori: touched(b.category),
      penulis: touched(b.author),
      tanggal: touched(b.date).slice(0, 10),
      content: touched(b.content),
      status: b.isPublished ? 'published' : 'draft',
      views: Number(b.views || 0),
    }
  },
  toBody(f, existing) {
    return {
      slug: (existing && existing.slug) || slugify(f.judul),
      title: String(f.judul || '').trim(),
      category: String(f.kategori || '').trim(),
      date: f.tanggal || new Date().toISOString().slice(0, 10),
      author: String(f.penulis || '').trim(),
      excerpt: String(f.excerpt || '').trim(),
      content: String(f.content || ''),
      imageAlt: String(f.imageAlt || '').trim(),
      isPublished: f.status !== 'draft',
    }
  },
  toFormData(f, file, existing) {
    const fd = new FormData()
    if (file) fd.append('cover', file)
    fd.append('slug', (existing && existing.slug) || slugify(f.judul))
    fd.append('title', String(f.judul || '').trim())
    fd.append('category', String(f.kategori || '').trim())
    fd.append('date', f.tanggal || new Date().toISOString().slice(0, 10))
    fd.append('author', String(f.penulis || '').trim())
    fd.append('excerpt', String(f.excerpt || '').trim())
    fd.append('content', String(f.content || ''))
    fd.append('imageAlt', String(f.imageAlt || '').trim())
    fd.append('isPublished', f.status !== 'draft' ? 'true' : 'false')
    return fd
  },
}

// ---------------------------------------------------------------------------
// Event — backend: {title,type('event'|'pengumuman'),date,time,location,status,budget.amount,description,isPublished,year}
// ---------------------------------------------------------------------------
export const eventAdapter = {
  toFrontend(b) {
    return {
      id: b._id,
      judul: touched(b.title),
      tipe: (b.type === 'pengumuman' ? 'Pengumuman' : 'Event'),
      tanggal: (b.date || '').slice(0, 10),
      waktu: touched(b.time),
      lokasi: touched(b.location),
      status: touched(b.status),
      anggaran: Number(b.budget?.amount || 0),
    }
  },
  toBody(f, existing) {
    return {
      title: String(f.judul || '').trim(),
      type: (f.tipe || 'Event') === 'Pengumuman' ? 'pengumuman' : 'event',
      date: f.tanggal || new Date().toISOString().slice(0, 10),
      time: f.waktu || '',
      location: String(f.lokasi || '').trim(),
      status: String(f.status || 'Akan Datang').trim(),
      budget: { amount: Number(f.anggaran || 0) },
      description: String(f.deskripsi || '').trim(),
      isPublished: true,
      imageUrl: existing?.imageUrl || undefined,
    }
  },
}

// ---------------------------------------------------------------------------
// Galeri — backend: {title,category,description,type('image'|'video'),media.secure_url,year,isPublished}
// ---------------------------------------------------------------------------
export const galeriAdapter = {
  toFrontend(b) {
    return {
      id: b._id,
      judul: touched(b.title),
      kategori: touched(b.category),
      tanggal: (b.createdAt || b.year || '').slice(0, 10),
      tipe: b.type === 'video' ? 'video' : 'image',
      mediaUrl: b.media?.secure_url || (b.type === 'video' ? b.videoUrl : '') || '',
      deskripsi: touched(b.description),
      warna: '', // placeholder UI non-admin
    }
  },
  toFormData(f, file) {
    const fd = new FormData()
    if (file) fd.append('file', file)
    fd.append('title', String(f.judul || '').trim())
    fd.append('category', String(f.kategori || '').trim())
    fd.append('type', (f.tipe || 'image') === 'video' ? 'video' : 'image')
    fd.append('year', String(f.tahun || new Date().getFullYear()))
    fd.append('description', String(f.deskripsi || '').trim())
    fd.append('isPublished', 'true')
    return fd
  },
}

// ---------------------------------------------------------------------------
// Transaksi Anggaran — backend: {tahun,jenis('pemasukan'|'pengeluaran'),kategori,tanggal,deskripsi,jumlah}
// ---------------------------------------------------------------------------
export const transaksiAdapter = {
  toFrontend(b) {
    return {
      id: b._id,
      tanggal: (b.tanggal || '').slice(0, 10),
      keterangan: touched(b.deskripsi),
      kategori: touched(b.kategori),
      jumlah: Number(b.jumlah || 0),
      jenis: b.jenis || 'pemasukan',
    }
  },
  toBody(f, tahun, jenis) {
    return {
      tahun: Number(f.tahun || tahun),
      jenis,
      kategori: String(f.kategori || '').trim() || undefined,
      tanggal: f.tanggal || new Date().toISOString().slice(0, 10),
      deskripsi: String(f.keterangan || '').trim(),
      jumlah: Number(f.jumlah || 0),
    }
  },
}

// ---------------------------------------------------------------------------
// Anggaran Event (histori prediksi) — backend: {nama_event,tahun,anggaran}
// ---------------------------------------------------------------------------
export const anggaranEventAdapter = {
  toBody(f) {
    return {
      nama_event: String(f.nama_event || '').trim(),
      tahun: Number(f.tahun),
      anggaran: Number(f.anggaran || 0),
    }
  },
}

// ---------------------------------------------------------------------------
// Parameter Ekonomi — backend: {tahun,persentase_inflasi}
// ---------------------------------------------------------------------------
export const parameterAdapter = {
  toFrontend(b) {
    return {
      id: b._id,
      tahun: Number(b.tahun || 0),
      persentase: Number(b.persentase_inflasi || 0),
      createdAt: touched(b.createdAt),
    }
  },
  toBody(f) {
    return {
      tahun: Number(f.tahun),
      persentase_inflasi: Number(f.persentase),
    }
  },
}

// ---------------------------------------------------------------------------
// User / Akun — backend: {username,email,role,nama,isActive,lastLoginAt,createdAt,pengurusId}
// ---------------------------------------------------------------------------
export const userAdapter = {
  toFrontend(b) {
    return {
      id: b._id ?? b.id,
      username: b.username ?? '',
      nama: b.nama ?? '',
      email: b.email ?? '',
      role: b.role ?? 'anggota',
      isActive: b.isActive !== false,
      lastLogin: b.lastLoginAt
        ? new Date(b.lastLoginAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
        : '—',
      createdAt: b.createdAt || '',
    }
  },
  toBody(f) {
    const body = {}
    if (f.username?.trim()) body.username = String(f.username).trim().toLowerCase()
    if (f.email?.trim()) body.email = String(f.email).trim().toLowerCase()
    if (f.password) body.password = f.password
    if (f.role) body.role = f.role
    if (f.nama !== undefined) body.nama = String(f.nama || '').trim() || null
    if (f.isActive !== undefined) body.isActive = !!f.isActive
    return body
  },
}

// ---------------------------------------------------------------------------
// Site Config / Profil — backend doc profil tunggal
// ---------------------------------------------------------------------------
export const siteConfigAdapter = {
  toFrontend(b) {
    const base = b || {}
    const social = base.socialMedia || {}
    const stats = base.stats || {}
    const info = Array.isArray(base.information) ? base.information : []
    const mission = Array.isArray(base.mission) ? base.mission : []
    return {
      nama: touched(base.name),
      singkatan: touched(base.shortName),
      tagline: touched(base.tagline),
      tentang: touched(base.history?.summary) || touched(base.vision),
      visi: touched(base.vision),
      misi: mission.length ? mission : [],
      alamat: touched(base.address),
      kota: '',
      provinsi: '',
      telepon: touched(base.phone),
      email: touched(base.email),
      sekretariat: '',
      jamOperasional: touched(base.operatingHours),
      socialLinks: [
        { platform: 'Instagram', handle: social.instagram || '', url: social.instagram || '' },
        { platform: 'Facebook', handle: social.facebook || '', url: social.facebook || '' },
        { platform: 'YouTube', handle: social.youtube || '', url: social.youtube || '' },
        { platform: 'TikTok', handle: social.tiktok || '', url: social.tiktok || '' },
      ].filter((s) => s.url),
      statsProfil: [
        { label: 'Anggota Aktif', nilai: String(stats.members ?? '') },
        { label: 'Program Kerja', nilai: String(stats.programs ?? '') },
        { label: 'Tahun Berjalan', nilai: String(stats.yearsActive ?? '') },
      ],
      infoUmum: info.map((i, idx) => ({
        id: i.id || `info-${idx}`,
        judul: touched(i.title),
        deskripsi: touched(i.description),
        aktif: true,
      })),
    }
  },
  toBody(f) {
    const social = {}
    ;(f.socialLinks || []).forEach((s) => {
      if (['Instagram', 'Facebook', 'YouTube', 'TikTok'].includes(s.platform) && s.url) {
        social[s.platform.toLowerCase()] = s.url
      }
    })
    const stats = f.statsProfil || []
    const num = (v) => {
      const n = Number(String(v || '').replace(/[^\d]/g, ''))
      return Number.isFinite(n) ? n : 0
    }
    return {
      name: String(f.nama || '').trim(),
      shortName: String(f.singkatan || '').trim(),
      tagline: String(f.tagline || '').trim(),
      address: [f.alamat, f.kota, f.provinsi].filter(Boolean).map((s) => String(s).trim()).join(', '),
      phone: String(f.telepon || '').trim(),
      email: String(f.email || '').trim(),
      operatingHours: String(f.jamOperasional || '').trim(),
      socialMedia: social,
      stats: {
        members: num(stats.find((s) => s.label === 'Anggota Aktif')?.nilai),
        programs: num(stats.find((s) => s.label === 'Program Kerja')?.nilai),
        yearsActive: num(stats.find((s) => s.label === 'Tahun Berjalan')?.nilai),
      },
      vision: String(f.visi || '').trim(),
      mission: (f.misi || []).map((m) => String(m).trim()).filter(Boolean),
      information: (f.infoUmum || []).map((i, idx) => ({
        id: i.id || `info-${idx}`,
        title: String(i.judul || '').trim(),
        description: String(i.deskripsi || '').trim(),
        content: String(i.deskripsi || '').trim(),
      })),
    }
  },
}

/** Format tanggal ISO ke "YYYY-MM-DD" (aman untuk <input type="date">). */
export function toDateInput(iso) {
  if (!iso) return new Date().toISOString().slice(0, 10)
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10)
  return d.toISOString().slice(0, 10)
}