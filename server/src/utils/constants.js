// Konstanta global backend Karang Taruna.

export const ROLES = ['ketua', 'wakil-ketua', 'sekretaris', 'bendahara', 'anggota'];

// Matriks izin RBAC (dari fase UML §1.2). Izin paling ketat: pengurus & prediksi.
export const ROLE_PENGURUS = ['ketua', 'wakil-ketua']; // kelola struktur organisasi
export const ROLE_CONTENT = ['ketua', 'wakil-ketua', 'sekretaris']; // artikel, event, galeri
export const ROLE_ANGGARAN = ['ketua', 'wakil-ketua', 'bendahara']; // transaksi kas
export const ROLE_SITE_CONFIG = ['ketua', 'wakil-ketua', 'sekretaris'];
export const ROLE_PARAMETER = ['ketua', 'wakil-ketua']; // parameter ekonomi + prediksi/override
export const ROLE_REGISTER = ['ketua', 'wakil-ketua']; // membuat akun user baru

export const EVENT_TYPE = ['event', 'pengumuman'];
export const EVENT_STATUS = ['Mendatang', 'Selesai'];

export const GALERI_TYPE = ['image', 'video'];

export const TRANSAKSI_JENIS = ['pemasukan', 'pengeluaran'];

export const COOKIE_NAME = process.env.COOKIE_REFRESH_NAME || 'rt_refresh_token';

// Akses token expire -> kode agar frontend tahu harus refresh
export const TOKEN_EXPIRED_CODE = 'TOKEN_EXPIRED';

export const DEFAULT_FOLDER_CLOUDINARY = process.env.CLOUDINARY_FOLDER || 'karang-taruna';

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB