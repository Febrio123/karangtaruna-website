// controllers/userController.js — Kelola Akun User (RBAC)
// Route ini diproteksi verifyAccessToken + roleGuard(...ROLE_USERS) di level route.
// RBAC (peta akses owner): Kelola Akun boleh diakses ketua/wakil-ketua/sekretaris.

import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { ROLES } from '../utils/constants.js';

/** Validasi id path → ApiError(400) bila bukan ObjectId valid. */
function assertObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'ID tidak valid.');
  }
}

/**
 * Hitung berapa user aktif (isActive) ber-role tertentu.
 * Dipakai untuk guard "ketua terakhir": jangan sampai tidak ada ketua tersisa.
 */
async function countActiveByRole(role) {
  return User.countDocuments({ role, isActive: true });
}

/**
 * GET /api/users — daftar semua akun (protected; ketua/wakil/sekretaris).
 * Anti-informasi: TIDAK menyertakan passwordHash (via toPublicJSON).
 * Sortir createdAt desc.
 */
export const list = asyncHandler(async (_req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  return ApiResponse.success(res, users.map((u) => u.toPublicJSON()));
});

/**
 * POST /api/users — buat akun baru (protected).
 * body: username, email, password, role(ops, default 'anggota'), nama(ops), pengurusId(ops)
 * - role ∈ ROLES; password 6–72.
 * - Anti privilege-escalation: hanya role 'ketua' yang boleh membuat akun ber-role 'ketua'.
 * - Duplikat username/email → 409.
 * Password di-hash otomatis oleh pre-save userSchema (kirim lewat passwordHash).
 */
export const create = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    role = 'anggota',
    nama = null,
    pengurusId = null,
  } = req.body;

  // Validasi role ∈ ROLES (guard tambahan selain express-validator di route).
  if (!ROLES.includes(role)) {
    throw new ApiError(400, `Role harus salah satu dari: ${ROLES.join(', ')}.`);
  }

  // Validasi panjang password (route sudah enforce min 6; ini cegah > 72 byte).
  if (!password || typeof password !== 'string' || password.length < 6 || password.length > 72) {
    throw new ApiError(400, 'Password harus 6-72 karakter.');
  }

  // Anti privilege-escalation: hanya role 'ketua' yang boleh membuat akun ber-role 'ketua'.
  if (role === 'ketua' && req.user.role !== 'ketua') {
    throw new ApiError(403, 'Hanya akun ber-role ketua yang dapat membuat akun ketua lainnya.');
  }

  // Duplikat username/email → 409.
  const existing = await User.findOne({
    $or: [{ username: (username || '').toLowerCase() }, { email: (email || '').toLowerCase() }],
  });
  if (existing) {
    throw new ApiError(409, 'Username atau email sudah terdaftar.');
  }

  const user = await User.create({
    username,
    email,
    passwordHash: password, // di-hash otomatis di pre-save hook
    role,
    nama,
    pengurusId,
  });

  return ApiResponse.created(res, { user: user.toPublicJSON() }, 'Akun berhasil dibuat.');
});

/**
 * PUT /api/users/:id — perbarui akun (protected).
 * Field yang boleh diubah: username, email, role, nama, isActive, pengurusId.
 * Anti-escalation: hanya ketua yang boleh menetapkan role 'ketua' pada orang lain.
 * Anti hilangnya ketua terakhir: tidak boleh menurunkan / menonaktifkan ketua
 * bila itu akan membuat jumlah ketua aktif menjadi 0.
 */
export const update = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Akun tidak ditemukan.');

  const allowed = ['role', 'nama', 'email', 'isActive', 'pengurusId', 'username'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  // Anti privilege-escalation: non-ketua tidak boleh menyetel/membuat role 'ketua'.
  if (user.role === 'ketua' && req.user.role !== 'ketua') {
    throw new ApiError(403, 'Hanya akun ber-role ketua yang dapat menetapkan role ketua.');
  }

  // ---- Guard ketua terakhir ----
  // Jangan sampai role ketua menjadi KOSONG. Berlaku bila aksi mengubah peran
  // si target menjadi non-ketua, atau menonaktifkan target yang ber-role ketua.
  const isTargetActiveKetua = user.isActive && user.role === 'ketua';
  const willRemoveKetuaRole =
    isTargetActiveKetua && req.body.role !== undefined && req.body.role !== 'ketua';
  const willDeactivateKetua = isTargetActiveKetua && req.body.isActive === false;

  if ((willRemoveKetuaRole || willDeactivateKetua) && (await countActiveByRole('ketua')) <= 1) {
    throw new ApiError(
      400,
      'Tidak dapat menurunkan/menonaktifkan ketua terakhir. Tetapkan pengganti ketua terlebih dahulu.'
    );
  }

  await user.save();
  return ApiResponse.success(res, { user: user.toPublicJSON() }, 'Akun berhasil diperbarui.');
});

/**
 * PUT /api/users/:id/password — reset ulang password akun (protected).
 * body: { password } (6–72). Hash diatur ulang via pre-save hook.
 */
export const changePassword = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Akun tidak ditemukan.');

  const password = req.body.password;
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
    throw new ApiError(400, 'Password harus 6-72 karakter.');
  }

  user.passwordHash = password; // di-hash otomatis di pre-save hook
  await user.save();

  return ApiResponse.success(res, { id: user._id }, 'Password berhasil direset.');
});

/**
 * DELETE /api/users/:id — hapus akun (protected).
 * Guard:
 *  - TIDAK boleh menghapus diri sendiri (400).
 *  - TIDAK boleh menghapus ketua terakhir (bila role ketua & count <= 1 → 400).
 */
export const remove = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);

  const targetId = String(req.params.id);

  // Anti self-delete.
  if (targetId === String(req.user._id)) {
    throw new ApiError(400, 'Anda tidak dapat menghapus akun Anda sendiri.');
  }

  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, 'Akun tidak ditemukan.');

  // Anti hilangnya ketua terakhir.
  if (target.role === 'ketua' && (await countActiveByRole('ketua')) <= 1) {
    throw new ApiError(
      400,
      'Tidak dapat menghapus ketua terakhir. Tetapkan pengganti ketua terlebih dahulu.'
    );
  }

  await target.deleteOne();
  return ApiResponse.success(res, null, 'Akun berhasil dihapus.');
};

// Helper ekspor agar mudah dipakai route guard ObjectId bila diperlukan.
export const isValidObjectId = (id) => mongoose.isValidObjectId(id);
