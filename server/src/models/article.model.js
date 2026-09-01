// articles — berita / artikel kegiatan (koleksi: articles)
// Referensi skema: memory/01-database-design.md §2.3 + UserUI/src/data/articles.js

import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug wajib diisi'],
      trim: true,
      lowercase: true,
    },
    title: { type: String, required: [true, 'Judul artikel wajib diisi'], trim: true },
    category: {
      type: String,
      required: [true, 'Kategori wajib diisi'],
      trim: true,
      // Keagamaan, Olahraga, Sosial, Keorganisasian, Lingkungan, dll (bebas)
    },
    date: { type: Date, required: [true, 'Tanggal publikasi wajib diisi'], default: Date.now },
    author: { type: String, required: [true, 'Penulis wajib diisi'], trim: true },
    excerpt: { type: String, trim: true, default: null },
    content: { type: String, required: [true, 'Isi artikel wajib diisi'] },
    cover: {
      public_id: { type: String, default: null },
      secure_url: { type: String, default: null },
    },
    imageAlt: { type: String, trim: true, default: null },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ category: 1, date: -1 });
articleSchema.index({ date: -1 });

// Auto-generate slug dari judul bila kosong
articleSchema.pre('validate', function ensureSlug(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Saat publish (isPublished=true) dan publishedAt belum ada -> set now
articleSchema.pre('save', function setPublishedAt(next) {
  if (this.isPublished && !this.publishedAt) this.publishedAt = new Date();
  next();
});

export const Article = mongoose.model('Article', articleSchema);