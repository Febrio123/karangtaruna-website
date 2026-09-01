// users — akun admin dashboard & RBAC (koleksi: users)
// Referensi skema: memory/01-database-design.md §2.1

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';

const bcryptSaltRounds = 10;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username wajib diisi'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username minimal 3 karakter'],
      maxlength: [30, 'Username maksimal 30 karakter'],
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password wajib diisi'],
      select: false, // jangan ikut ter-bawa di query biasa
    },
    role: {
      type: String,
      required: [true, 'Role wajib diisi'],
      enum: { values: ROLES, message: 'Role tidak valid' },
      default: 'anggota',
    },
    pengurusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pengurus',
      default: null,
    },
    nama: { type: String, trim: true, default: null },
    foto: {
      public_id: { type: String, default: null },
      secure_url: { type: String, default: null },
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password saat create / saat passwordHash diubah
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, bcryptSaltRounds);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Index pendukung query per-role (desain fase 01 §2.1)
userSchema.index({ role: 1 });

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Proyeksi aman: hilangkan field sensitif dari hasil JSON
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    nama: this.nama,
    pengurusId: this.pengurusId,
    foto: this.foto,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model('User', userSchema);