// Konstanta global backend Karang Taruna.

export const ROLES = ['ketua', 'wakil-ketua', 'sekretaris', 'bendahara', 'anggota'];

// Matriks izin RBAC — PETA AKSES (keputusan owner). Nilai tiap konstanta adalah
// daftar role yang BOLEH mengakses/menulis area tsb; role lain ditolak (403).
//
// | Menu / area                          | ketua | wakil | sekretaris | bendahara | anggota |
// |--------------------------------------|:-----:|:-----:|:----------:|:---------:|:-------:|
// | Dashboard (home utama)               |   ✅  |  ✅   |     ✅     |    ✅     |   ✅    |
// | Kelola Pengurus (struktur)           |   ✅  |  ✅   |     ✅     |    ✅     |   ❌    |
// | Berita / Event & Pengumuman / Galeri |   ✅  |  ✅   |     ✅     |    ✅     |   ✅    |
// | Kelola Anggaran (transaksi)          |   ✅  |  ✅   |     ❌     |    ✅     |   ❌    |
// | Prediksi Anggaran (+ Parameter)      |   ✅  |  ✅   |     ❌     |    ✅     |   ❌    |
// | Kelola Akun User (users)             |   ✅  |  ✅   |     ✅     |    ❌     |   ❌    |
// | Profil & Informasi (site-config)     |   ✅  |  ✅   |     ✅     |    ✅     |   ✅    |
//
export const ROLE_PENGURUS = ['ketua', 'wakil-ketua', 'sekretaris', 'bendahara']; // kelola struktur organisasi
export const ROLE_CONTENT = ['ketua', 'wakil-ketua', 'sekretaris', 'bendahara', 'anggota']; // artikel, event, galeri
export const ROLE_ANGGARAN = ['ketua', 'wakil-ketua', 'bendahara']; // transaksi kas (sekretaris & anggota tidak bisa)
export const ROLE_SITE_CONFIG = ['ketua', 'wakil-ketua', 'sekretaris', 'bendahara', 'anggota']; // site config / profil
export const ROLE_PARAMETER = ['ketua', 'wakil-ketua', 'bendahara']; // parameter ekonomi + prediksi/override (sekretaris & anggota tidak bisa)
export const ROLE_REGISTER = ['ketua', 'wakil-ketua', 'sekretaris']; // membuat akun user baru (via auth/register)
export const ROLE_USERS = ['ketua', 'wakil-ketua', 'sekretaris']; // kelola akun user: list/create/update/password/remove (bendahara & anggota tidak bisa)

export const EVENT_TYPE = ['event', 'pengumuman'];
export const EVENT_STATUS = ['Mendatang', 'Selesai'];

export const GALERI_TYPE = ['image', 'video'];

export const TRANSAKSI_JENIS = ['pemasukan', 'pengeluaran'];

export const COOKIE_NAME = process.env.COOKIE_REFRESH_NAME || 'rt_refresh_token';

// Akses token expire -> kode agar frontend tahu harus refresh
export const TOKEN_EXPIRED_CODE = 'TOKEN_EXPIRED';

export const DEFAULT_FOLDER_CLOUDINARY = process.env.CLOUDINARY_FOLDER || 'karang-taruna';

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB