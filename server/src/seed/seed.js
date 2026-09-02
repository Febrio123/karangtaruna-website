// ============================================================================
// seed/seed.js — seed data awal: admin, pengurus (dari shared/team.js),
// site_config, anggaran_event demo, parameter ekonomi, artikel/event/transaksi.
//
// Jalankan: npm run seed            (idempotent — upsert, aman diulang)
//           npm run seed:reset      (hapus koleksi dulu lalu seed ulang)
// ============================================================================

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Pengurus } from '../models/pengurus.model.js';
import { SiteConfig } from '../models/siteConfig.model.js';
import { AnggaranEvent } from '../models/anggaranEvent.model.js';
import { ParameterEkonomi } from '../models/parameterEkonomi.model.js';
import { Article } from '../models/article.model.js';
import { Event } from '../models/event.model.js';
import { TransaksiAnggaran } from '../models/transaksiAnggaran.model.js';

// Single source of truth pengurus (shared/team.js)
import { roles, bidangList, pengurus } from '../../../shared/team.js';

const SHARED_ROLE_VALUES = roles.map((r) => r.value);

/** Level bagan organisasi berdasarkan role (1=ketua, 2=inti, 3=koordinator). */
function levelForRole(role) {
  if (role === 'ketua') return 1;
  if (['wakil-ketua', 'sekretaris', 'bendahara'].includes(role)) return 2;
  return 3;
}

async function seedAdmin() {
  const username = (process.env.SEED_ADMIN_USERNAME || 'ketua').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const email = process.env.SEED_ADMIN_EMAIL || `${username}@mds.local`;

  // Cari sosok pengurus "Ketua" untuk dikaitkan (pengurusId)
  const ketuaPengurus = await Pengurus.findOne({ role: 'ketua' }).lean();

  const admin = await User.findOne({ username }).select('+passwordHash');
  if (admin) {
    admin.isActive = true;
    admin.pengurusId = ketuaPengurus?._id || admin.pengurusId;
    await admin.save();
    console.log(`[seed] Admin "${username}" sudah ada — diaktifkan & dikaitkan ke pengurus ketua.`);
    return;
  }

  await User.create({
    username,
    email,
    passwordHash: password, // di-hash otomatis di pre-save hook
    role: 'ketua',
    nama: ketuaPengurus?.nama || 'Ketua Karang Taruna',
    pengurusId: ketuaPengurus?._id || null,
  });
  console.log(`[seed] Admin "${username}" dibuat (role: ketua). Password default: ${password}`);
  console.log('[seed] UBAH PASSWORD DEFAULT setelah login pertama!');
}

async function seedPengurus() {
  if (!pengurus || pengurus.length === 0) {
    console.warn('[seed] shared/team.js tidak berisi data pengurus — dilewati.');
    return;
  }

  const urutanPerLevel = {};
  let created = 0;
  let updated = 0;

  for (const item of pengurus) {
    const role = SHARED_ROLE_VALUES.includes(item.role) ? item.role : 'anggota';
    const level = levelForRole(role);
    const urutan = urutanPerLevel[level] ?? 0;
    urutanPerLevel[level] = urutan + 1;

    const payload = {
      nama: item.nama,
      jabatan: item.jabatan,
      bidang: item.bidang || '-',
      periode: item.periode || '2025-2027',
      role,
      telepon: item.telepon || null,
      level,
      urutan,
      email: null,
      foto: null,
    };

    const existing = await Pengurus.findOne({ nama: item.nama, periode: payload.periode });
    if (existing) {
      await Pengurus.updateOne({ _id: existing._id }, { $set: payload });
      updated += 1;
    } else {
      await Pengurus.create(payload);
      created += 1;
    }
  }

  console.log(`[seed] Pengurus: ${created} dibuat, ${updated} diperbarui (total ${pengurus.length}).`);
  if (bidangList?.length) console.log(`[seed] BidangList siap: ${bidangList.join(', ')}`);
}

async function seedSiteConfig() {
  const existing = await SiteConfig.findOne({ _key: 'main' });
  if (existing) {
    console.log('[seed] site_config sudah ada — dibiarkan (edit via dashboard).');
    return;
  }
  await SiteConfig.create({
    _key: 'main',
    name: 'Karang Taruna Mangga Dua Selatan',
    shortName: 'KT Mangga Dua Selatan',
    tagline: 'Membangun generasi muda yang aktif, kreatif, dan bertanggung jawab.',
    address: 'Jl. Raya Mangga Dua Selatan No. 12, Kel. Mangga Dua Selatan, Kec. Sukmajaya, Kota Depok, Jawa Barat 16411',
    phone: '0812-3456-7890',
    email: 'kt.mangga-dua-selatan@gmail.com',
    operatingHours: 'Senin - Jumat, 08:00 - 17:00 WIB',
    socialMedia: {
      instagram: 'https://instagram.com/katar010.mds',
    },
    map: { lat: -6.4025, lng: 106.8525, zoom: 15 },
    stats: { members: 150, programs: 12, yearsActive: 8 },
    vision: 'Terwujudnya pemuda yang beriman, bertaqwa, cerdas, kreatif, dan berperan aktif dalam pembangunan masyarakat yang sejahtera dan berkeadilan.',
    mission: [
      'Meningkatkan keimanan dan ketaqwaan pemuda melalui kegiatan keagamaan dan kegiatan sosial yang bermanfaat.',
      'Mengembangkan potensi dan kreativitas pemuda melalui program kerja yang inovatif dan berkelanjutan.',
      'Membangun semangat gotong royong dan kepedulian sosial terhadap masyarakat sekitar.',
      'Menjadi wadah aspirasi pemuda dan menjembatani komunikasi antara pemuda dengan pemerintah desa.',
      'Mendorong partisipasi aktif pemuda dalam pembangunan desa yang inklusif dan berkelanjutan.',
    ],
    history: {
      summary: 'Karang Taruna Mangga Dua Selatan didirikan pada tahun 2018 oleh sekelompok pemuda pemudi yang memiliki semangat tinggi untuk berkontribusi bagi kemajuan desa.',
      timeline: [
        { year: '2018', title: 'Pendirian Karang Taruna', description: 'Berdiri dengan 30 anggota pendiri.' },
        { year: '2022', title: 'Program Lingkungan Hijau', description: 'Penanaman pohon & bank sampah.' },
        { year: '2025', title: 'Ekspansi Program', description: '150 anggota, program kerja bertambah.' },
      ],
    },
    information: [],
  });
  console.log('[seed] site_config default dibuat.');
}

async function seedAnggaranEvent() {
  // Data contoh PERSIS dari requirement (event "17 Agustusan", prediksi 2027)
  const historiContoh = [
    { nama_event: '17 Agustusan', tahun: 2024, anggaran: 2000000 },
    { nama_event: '17 Agustusan', tahun: 2025, anggaran: 2300000 },
    { nama_event: '17 Agustusan', tahun: 2026, anggaran: 2500000 },
    // Event lain agar dropdown prediksi kaya
    { nama_event: 'Ramadhan', tahun: 2024, anggaran: 4800000 },
    { nama_event: 'Ramadhan', tahun: 2025, anggaran: 5200000 },
    { nama_event: 'Ramadhan', tahun: 2026, anggaran: 5600000 },
    { nama_event: 'Maulid Nabi', tahun: 2025, anggaran: 2750000 },
    { nama_event: 'Maulid Nabi', tahun: 2026, anggaran: 2900000 },
    { nama_event: 'Turnamen Futsal', tahun: 2025, anggaran: 5500000 },
    { nama_event: 'Turnamen Futsal', tahun: 2026, anggaran: 5750000 },
    // Event dengan 1 data — untuk demo error "minimal 2 data"
    { nama_event: 'Bakti Sosial Akbar', tahun: 2026, anggaran: 7000000 },
  ];

  let dibuat = 0;
  for (const item of historiContoh) {
    await AnggaranEvent.findOneAndUpdate(
      { nama_event: item.nama_event, tahun: item.tahun },
      { $set: { anggaran: item.anggaran, sumber: 'manual', eventId: null } },
      { upsert: true, setDefaultsOnInsert: true }
    );
    dibuat += 1;
  }
  console.log(`[seed] anggaran_event: ${dibuat} histori di-upsert (termasuk contoh requirement 17 Agustusan).`);
}

async function seedParameterEkonomi() {
  const data = [
    { tahun: 2025, persentase_inflasi: 2.5 },
    { tahun: 2026, persentase_inflasi: 2.8 }, // dipakai contoh prediksi 2027
  ];

  let dibuat = 0;
  for (const item of data) {
    await ParameterEkonomi.findOneAndUpdate(
      { tahun: item.tahun },
      { $set: { persentase_inflasi: item.persentase_inflasi } },
      { upsert: true, setDefaultsOnInsert: true }
    );
    dibuat += 1;
  }
  console.log(`[seed] parameter_ekonomi: ${dibuat} entri inflasi di-upsert.`);
}

async function seedKontenDemo() {
  // Artikel demo
  const artikel = [
    {
      slug: 'pengajian-bulan-ramadhan-2026',
      title: 'Pengajian Bulan Ramadhan dan Berbagi Takjil',
      category: 'Keagamaan',
      date: new Date('2026-03-15'),
      author: 'Ahmad Fauzi',
      excerpt: 'Karang Taruna Mangga Dua Selatan menggelar pengajian rutin sepanjang bulan Ramadhan dan membagikan takjil gratis.',
      content: '<p>Karang Taruna Mangga Dua Selatan kembali menggelar pengajian rutin yang diikuti lebih dari 80 peserta.</p>',
      isPublished: true,
    },
    {
      slug: 'turnamen-futsal-piala-karang-taruna-2026',
      title: 'Turnamen Futsal Piala Karang Taruna 2026 Resmi Digelar',
      category: 'Olahraga',
      date: new Date('2026-02-20'),
      author: 'Rizki Pratama',
      excerpt: '16 tim berkompetisi memperebutkan piala bergilir Karang Taruna.',
      content: '<p>Turnamen diikuti oleh 16 tim dari berbagai RT se-Kelurahan Mangga Dua Selatan.</p>',
      isPublished: true,
    },
    {
      slug: 'kerja-bakti-lingkungan-2026',
      title: 'Kerja Bakti Lingkungan Bersama Warga',
      category: 'Sosial',
      date: new Date('2026-01-10'),
      author: 'Budi Santoso',
      excerpt: 'Gotong royong membersihkan lingkungan RT 01-10.',
      content: '<p>Kerja bakti rutin bulanan membersihkan lingkungan dan saluran air.</p>',
      isPublished: true,
    },
  ];

  let artikelDibuat = 0;
  for (const a of artikel) {
    await Article.findOneAndUpdate({ slug: a.slug }, { $set: a }, { upsert: true, setDefaultsOnInsert: true });
    artikelDibuat += 1;
  }
  console.log(`[seed] articles: ${artikelDibuat} demo di-upsert.`);

  // Event demo (year otomatis diambil dari date; budget -> label auto)
  const eventDemo = [
    {
      title: 'Turnamen Futsal Piala Karang Taruna 2026',
      type: 'event',
      date: new Date('2026-03-22'),
      time: '14:00 WIB',
      location: 'Lapangan Futsal Mangga Dua Selatan',
      status: 'Mendatang',
      description: 'Babak final Turnamen Futsal Piala Karang Taruna 2026.',
      budget: { amount: 5500000, label: 'Total anggaran acara Rp 5.500.000' },
      isPublished: true,
    },
    {
      title: 'Kerja Bakti Bulanan Maret',
      type: 'event',
      date: new Date('2026-03-08'),
      time: '07:00 WIB',
      location: 'Lingkungan RT 01-10',
      status: 'Selesai',
      description: 'Kerja bakti rutin membersihkan lingkungan.',
      budget: { amount: 1500000, label: 'Total anggaran acara Rp 1.500.000' },
      isPublished: true,
    },
    {
      title: 'Pengumuman: Pendaftaran Anggota Baru Dibuka',
      type: 'pengumuman',
      date: new Date('2026-01-05'),
      time: '08:00 WIB',
      location: 'Sekretariat Karang Taruna',
      status: 'Selesai',
      description: 'Pendaftaran anggota baru periode 2026-2028.',
      budget: { amount: 500000, label: 'Total anggaran acara Rp 500.000' },
      isPublished: true,
    },
  ];

  let eventDibuat = 0;
  for (const e of eventDemo) {
    await Event.findOneAndUpdate(
      { title: e.title, date: e.date },
      { $set: e },
      { upsert: true, setDefaultsOnInsert: true }
    );
    eventDibuat += 1;
  }
  console.log(`[seed] events: ${eventDibuat} demo di-upsert.`);

  // Transaksi anggaran demo (beberapa saja, cukup utk ringkasan)
  const transaksi = [
    { tahun: 2026, jenis: 'pemasukan', kategori: 'Iuran', tanggal: new Date('2026-01-01'), deskripsi: 'Iuran anggota bulanan (150 orang x Rp 10.000)', jumlah: 1500000 },
    { tahun: 2026, jenis: 'pemasukan', kategori: 'Donasi', tanggal: new Date('2026-01-15'), deskripsi: 'Dana kegiatan sosial dari warga', jumlah: 2000000 },
    { tahun: 2026, jenis: 'pemasukan', kategori: 'Sponsor', tanggal: new Date('2026-02-10'), deskripsi: 'Sponsor Turnamen Futsal', jumlah: 3000000 },
    { tahun: 2026, jenis: 'pengeluaran', kategori: 'Operasional', tanggal: new Date('2026-01-05'), deskripsi: 'Belanja ATK dan kebutuhan sekretariat', jumlah: 250000 },
    { tahun: 2026, jenis: 'pengeluaran', kategori: 'Kegiatan', tanggal: new Date('2026-01-25'), deskripsi: 'Pembelian sembako bakti sosial (100 paket)', jumlah: 3500000 },
    { tahun: 2026, jenis: 'pengeluaran', kategori: 'Kegiatan', tanggal: new Date('2026-02-10'), deskripsi: 'Perlengkapan Turnamen Futsal', jumlah: 2000000 },
  ];

  let transaksiDibuat = 0;
  for (const t of transaksi) {
    await TransaksiAnggaran.findOneAndUpdate(
      { tahun: t.tahun, tanggal: t.tanggal, deskripsi: t.deskripsi },
      { $set: t },
      { upsert: true, setDefaultsOnInsert: true }
    );
    transaksiDibuat += 1;
  }
  console.log(`[seed] transaksi_anggaran: ${transaksiDibuat} demo di-upsert.`);
}

async function resetCollections() {
  const collections = [
    'users',
    'pengurus',
    'articles',
    'events',
    'galeri',
    'transaksi_anggaran',
    'site_configs',
    'anggaran_events',
    'parameter_ekonomis',
    'prediksi_overrides',
    'refresh_tokens',
  ];
  for (const name of collections) {
    try {
      await mongoose.connection.db.dropCollection(name);
      console.log(`[seed] --reset: koleksi "${name}" dihapus.`);
    } catch {
      // koleksi mungkin belum ada — abaikan
    }
  }
}

async function main() {
  const shouldReset = process.argv.includes('--reset');
  console.log(`[seed] Menjalankan seed${shouldReset ? ' dengan --reset' : ''}...`);

  await connectDB();

  if (shouldReset) {
    await resetCollections();
    await mongoose.connection.syncIndexes();
  }

  await seedPengurus(); // dahulukan: admin butuh pengurusId ketua
  await seedAdmin();
  await seedSiteConfig();
  await seedAnggaranEvent();
  await seedParameterEkonomi();
  await seedKontenDemo();

  console.log('\n[seed] Selesai. Jalankan `npm run dev` lalu login dengan akun admin.');
}

main()
  .catch((err) => {
    console.error('[seed] Gagal:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });