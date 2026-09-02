// ============================================================================
// scripts/migrateIdentitas.js — MIGRASI SATU KALI (manual oleh operator)
// ----------------------------------------------------------------------------
// Tujuan: meng-update data yang SUDAH TERSIMPAN di MongoDB dari identitas lama
//   "Karang Taruna Mekar Jaya" menjadi "Karang Taruna Mangga Dua Selatan".
//   (Perbaikan statis sudah ada di seed/controller — script ini menangani
//   dokumen lama yang masih berisi string lama di DB live.)
//
// Cara menjalankan (dari folder server/):
//   npm run migrate-identitas
//   # atau: node src/scripts/migrateIdentitas.js
//
// Keamanan & sifat:
//   - TIDAK menghapus dokumen apa pun (hanya $set / $unset field).
//   - Idempotent: setelah "Mekar Jaya" hilang, run ulang tidak mengubah apa pun.
//   - Email & sosial media hanya ditimpa bila masih berisi identitas lama;
//     nilai yang sudah diubah operator secara manual DIBIARKAN.
//   - Pengurus: nama orang (field `nama`) TIDAK dipindai.
//   - Jangan dijalankan terhadap database produksi tanpa persetujuan operator.
// ============================================================================

import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { SiteConfig } from '../models/siteConfig.model.js';
import { Article } from '../models/article.model.js';
import { Event } from '../models/event.model.js';
import { Pengurus } from '../models/pengurus.model.js';
import { Galeri } from '../models/galeri.model.js';

// ---------------------------------------------------------------------------
// Konstanta identitas lama → baru
// ---------------------------------------------------------------------------
const OLD = 'Mekar Jaya';
const NEW = 'Mangga Dua Selatan';

const NAME_NEW = 'Karang Taruna Mangga Dua Selatan';
const SHORT_NAME_NEW = 'KT Mangga Dua Selatan';
const EMAIL_OLD = 'kt.mekarjaya@gmail.com'; // placeholder lama
const EMAIL_NEW = 'kt.mangga-dua-selatan@gmail.com';
const INSTAGRAM_OLD_HANDLE = 'kt.mekarjaya'; // substring handler lama (URL lama)
const INSTAGRAM_NEW = 'https://instagram.com/katar010.mds';

// Batas aman per koleksi agar run pertama tetap cepat (jumlah data kecil).
const MAX_DOCS_PER_COLLECTION = 500;

// Pengurus: field yang dipindai. `nama` (nama orang) TIDAK dimasukkan.
// Catatan: substring "Mekar Jaya" (dengan spasi, kapital) tidak akan cocok
// dengan email/URL/handle (mis. mekarjaya@gmail.com, instagram.com/kt.mekarjaya)
// karena formatnya berbeda — jadi aman dari perubahan yang keliru.
const PENGURUS_FIELDS = ['jabatan', 'bidang', 'telepon', 'email', 'periode'];

// ---------------------------------------------------------------------------
// Helper string & rekursif
// ---------------------------------------------------------------------------
function replaceAll(str) {
  return str.split(OLD).join(NEW);
}

function hasOld(value) {
  return typeof value === 'string' && value.includes(OLD);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** true bila ada string "Mekar Jaya" di pohon nilai (string/array/object). */
function containsOld(node) {
  if (typeof node === 'string') return node.includes(OLD);
  if (Array.isArray(node)) return node.some(containsOld);
  if (node && typeof node === 'object') {
    return Object.keys(node).some((key) => containsOld(node[key]));
  }
  return false;
}

/**
 * Mutasi in-place: ganti "Mekar Jaya" di setiap nilai string pada pohon objek.
 * Nilai non-string (number, boolean, ObjectId, Date, null) dibiarkan.
 * Tidak menyentuh nama key — hanya nilai.
 */
function replaceStringsDeep(node) {
  if (typeof node === 'string') return replaceAll(node);
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) node[i] = replaceStringsDeep(node[i]);
    return node;
  }
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) node[key] = replaceStringsDeep(node[key]);
    return node;
  }
  return node;
}

// ---------------------------------------------------------------------------
// Migrasi site_config (singleton _key: 'main')
// ---------------------------------------------------------------------------
async function migrateSiteConfig() {
  const cfg = await SiteConfig.findOne({ _key: 'main' });
  if (!cfg) {
    console.log('[migrate] site_config tidak ditemukan — dilewati.');
    return false;
  }

  let changed = false;

  // 1) Nama & nama singkat — selalu diarahkan ke identitas baru (idempotent).
  if (cfg.name !== NAME_NEW) {
    cfg.name = NAME_NEW;
    changed = true;
  }
  if (cfg.shortName !== SHORT_NAME_NEW) {
    cfg.shortName = SHORT_NAME_NEW;
    changed = true;
  }

  // 2) Email — HANYA ditimpa bila masih placeholder lama; email yang sudah
  //    diubah operator lain dibiarkan apa adanya.
  if (cfg.email === EMAIL_OLD) {
    cfg.email = EMAIL_NEW;
    changed = true;
  }

  // 3) Alamat — ganti substring "Mekar Jaya" di nama jalan & kelurahan.
  //    "Kec. Sukmajaya" tidak mengandung "Mekar Jaya" → kecamatan aman.
  if (hasOld(cfg.address)) {
    cfg.address = replaceAll(cfg.address);
    changed = true;
  }

  // 4) Media sosial — set instagram baru bila masih lama; hapus facebook;
  //    field lain (youtube/tiktok) dipertahankan bila ada nilainya.
  if (cfg.socialMedia) {
    const ig = cfg.socialMedia.instagram;
    if (typeof ig === 'string' && ig.includes(INSTAGRAM_OLD_HANDLE)) {
      cfg.socialMedia.instagram = INSTAGRAM_NEW;
      changed = true;
    }
    if (cfg.socialMedia.facebook != null) {
      cfg.socialMedia.facebook = undefined; // mongoose → $unset, bukan hapus dokumen
      changed = true;
    }
    cfg.markModified('socialMedia');
  }

  // 5) Teks identitas lain (vision, mission, history, information) —
  //    ganti substring secara rekursif; hanya node string yang berubah.
  if (hasOld(cfg.vision)) {
    cfg.vision = replaceAll(cfg.vision);
    changed = true;
  }
  if (containsOld(cfg.mission)) {
    replaceStringsDeep(cfg.mission);
    cfg.markModified('mission');
    changed = true;
  }
  if (containsOld(cfg.history)) {
    // summary + timeline[].title/description
    replaceStringsDeep(cfg.history);
    cfg.markModified('history');
    changed = true;
  }
  if (containsOld(cfg.information)) {
    // description/content/requirements/articles/programs/services (rekursif)
    replaceStringsDeep(cfg.information);
    cfg.markModified('information');
    changed = true;
  }

  if (!changed) {
    console.log('[migrate] site_config unchanged');
    return false;
  }

  // validateBeforeSave:false → hanya menulis perubahan field di atas,
  // tanpa memicu validasi/hook lain yang bisa menambah perubahan.
  await cfg.save({ validateBeforeSave: false });
  console.log('[migrate] site_config updated');
  return true;
}

// ---------------------------------------------------------------------------
// Migrasi koleksi konten (baca → ubah → save per dokumen)
// ---------------------------------------------------------------------------
async function migrateCollection(label, Model, fields) {
  const query = {
    $or: fields.map((field) => ({ [field]: { $regex: escapeRegExp(OLD) } })),
  };

  const docs = await Model.find(query).limit(MAX_DOCS_PER_COLLECTION);

  let changed = 0;
  for (const doc of docs) {
    let didChange = false;

    for (const field of fields) {
      if (hasOld(doc[field])) {
        doc[field] = replaceAll(doc[field]);
        didChange = true;
      }
    }

    if (didChange) {
      // validateBeforeSave:false → menghindari hook pre('validate') (mis. slug
      // otomatis, turunan year event, label budget) yang bisa menambah perubahan
      // tak diinginkan; hanya field identitas di atas yang ditulis.
      await doc.save({ validateBeforeSave: false });
      changed += 1;
    }
  }

  console.log(`[migrate] ${label}: ${changed} dari ${docs.length} dokumen dipindai diubah.`);
  return changed;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`[migrate] Menjalankan migrasi identitas "${OLD}" → "${NEW}"...`);
  console.log('[migrate] Memperbarui data yang SUDAH TERSIMPAN; tidak ada dokumen yang dihapus.\n');

  try {
    await connectDB();

    const siteConfigUpdated = await migrateSiteConfig();
    const articlesUpdated = await migrateCollection('articles', Article, ['title', 'excerpt', 'content']);
    const eventsUpdated = await migrateCollection('events', Event, ['title', 'description', 'location']);
    const pengurusUpdated = await migrateCollection('pengurus', Pengurus, PENGURUS_FIELDS);
    const galeriUpdated = await migrateCollection('galeri', Galeri, ['title', 'description']);

    console.log('\n[migrate] ===== Ringkasan =====');
    console.log(`[migrate] site_config : ${siteConfigUpdated ? 'updated' : 'unchanged'}`);
    console.log(`[migrate] articles    : ${articlesUpdated} dokumen diubah`);
    console.log(`[migrate] events      : ${eventsUpdated} dokumen diubah`);
    console.log(`[migrate] pengurus    : ${pengurusUpdated} dokumen diubah`);
    console.log(`[migrate] galeri      : ${galeriUpdated} dokumen diubah`);
    console.log('[migrate] Selesai.');
  } catch (err) {
    console.error('[migrate] Gagal menjalankan migrasi:', err.message);
    process.exitCode = 1;
  } finally {
    try {
      await disconnectDB();
    } catch (err) {
      console.error('[migrate] Gagal menutup koneksi MongoDB:', err.message);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error('[migrate] Error fatal:', err);
  process.exit(1);
});