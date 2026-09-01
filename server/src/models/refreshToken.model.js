// refresh_tokens — manajemen refresh token (rotasi & revoke)
// Referensi skema: memory/01-database-design.md §2.11
// Token disimpan sebagai hash sha256 — BUKAN plaintext.

import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId wajib diisi'],
    },
    tokenHash: {
      type: String,
      required: [true, 'tokenHash wajib diisi'],
    },
    expiresAt: { type: Date, required: [true, 'expiresAt wajib diisi'] },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    revokedAt: { type: Date, default: null },
    replacedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ expiresAt: 1 }); // support cleanup TTL batch bila needed

refreshTokenSchema.methods.isActive = function isActive() {
  return !this.revokedAt && this.expiresAt > new Date();
};

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);