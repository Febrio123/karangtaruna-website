// site_config — profil organisasi singleton (koleksi: site_config)
// Referensi skema: memory/01-database-design.md §2.7 + UserUI/src/data/siteConfig.js

import mongoose from 'mongoose';

const informationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    icon: { type: String, default: 'FileText' },
    description: { type: String, default: null },
    content: { type: String, default: null },
    requirements: [{ type: String }],
    articles: [{ type: String }],
    programs: [
      {
        name: { type: String },
        frequency: { type: String },
        status: { type: String },
      },
    ],
    services: [
      {
        name: { type: String },
        location: { type: String },
        schedule: { type: String },
      },
    ],
  },
  { _id: false }
);

const siteConfigSchema = new mongoose.Schema(
  {
    _key: { type: String, required: true, default: 'main' },
    name: { type: String, default: 'Karang Taruna Mekar Jaya' },
    shortName: { type: String, default: 'KT Mekar Jaya' },
    tagline: { type: String, default: null },
    address: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    operatingHours: { type: String, default: null },
    socialMedia: {
      instagram: { type: String, default: null },
      facebook: { type: String, default: null },
      youtube: { type: String, default: null },
      tiktok: { type: String, default: null },
    },
    map: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      zoom: { type: Number, default: 15 },
    },
    stats: {
      members: { type: Number, default: 0 },
      programs: { type: Number, default: 0 },
      yearsActive: { type: Number, default: 0 },
    },
    vision: { type: String, default: null },
    mission: [{ type: String }],
    history: {
      summary: { type: String, default: null },
      timeline: [
        {
          year: { type: String },
          title: { type: String },
          description: { type: String },
        },
      ],
    },
    information: { type: [informationSchema], default: [] },
  },
  { timestamps: true }
);

// Singleton: hanya satu dokumen _key='main'
siteConfigSchema.index({ _key: 1 }, { unique: true });

export const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);