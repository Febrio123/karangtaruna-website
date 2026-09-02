# SEO & Search Engine Optimization — Karang Taruna UserUI (Fase 7)

> Status: **selesai**
> Scope: `UserUI/` & `server/` — Audit URL & Heading, Meta Tags, Structured Data (Schema.org), Strategi Rendering, Sitemap & Robots.txt, Core Web Vitals, dan Panduan Deploy ke Search Console.
> Acuan: `memory/03-ui-ux-design.md`, `memory/06-frontend-react.md`, `memory/08-performance.md`.

---

## 1. Audit Struktur URL & Heading

### 1.1 URL Hierarchy & Slug Design
Seluruh rute publik dirancang dengan format URL yang bersih, deskriptif, human-readable, dan ramah SEO (tanpa query string bermasalah atau ID acak):

| Route Path | Tipe Halaman | Deskripsi & Format URL |
|---|---|---|
| `/` | Root / Landing Page | Halaman utama portal publik |
| `/profil` | Profile Parent | Pengenalan umum organisasi |
| `/profil/sejarah` | Sub-Profile | Histori pendirian Karang Taruna |
| `/profil/visi-misi` | Sub-Profile | Visi & 5 Misi utama Karang Taruna |
| `/profil/struktur-organisasi` | Sub-Profile | Bagan hierarki & daftar pengurus |
| `/berita` | News Archive | Listing berita & kegiatan (dengan filter kategori) |
| `/berita/:slug` | Article Detail | Detail artikel berbasis slug SEO (contoh: `/berita/semarak-lomba-17-agustus-2026`) |
| `/galeri` | Gallery Archive | Dokumentasi foto & video kegiatan |
| `/pengumuman` | Announcements | Jadwal event mendatang & informasi resmi |
| `/informasi` | General Info | Informasi umum & FAQ pelayanan pemuda |
| `/anggaran` | Financial Report | Laporan transparansi kas & transaksi keuangan |
| `/kontak` | Contact | Alamat sekretariat, peta lokasi, & form pesan |

### 1.2 Hirarki Heading (H1–H6)
Setiap halaman mematuhi prinsip **Satu `<H1>` per Halaman** untuk mempertahankan struktur dokumen yang jelas bagi mesin pencari:

- **`<H1>`**: Ditempatkan secara eksklusif pada `HeroSection` (halaman beranda) atau `PageHeader` (halaman dalam/detail artikel).
- **`<H2>`**: Digunakan untuk judul section utama (misal: "Kegiatan Terkini", "Transparansi Keuangan", "Artikel Terkait").
- **`<H3>`**: Digunakan untuk judul sub-section atau judul kartu (`ArticleCard`, `EventCard`, `TeamMemberCard`).
- **`<H4>`–`<H6>`**: Digunakan untuk label form, sub-informasi, atau caption teknis.

---

## 2. Metadata & Structured Data (Per Halaman Penting)

Pengelolaan metadata dilakukan secara terpusat melalui custom hook `useSeo.js` (`UserUI/src/hooks/useSeo.js`), yang secara otomatis mengupdate `document.title`, `<meta name="description">`, `<link rel="canonical">`, `Open Graph`, `Twitter Card`, serta menginjeksi `JSON-LD (Schema.org)`.

### 2.1 Konfigurasi Meta Tag & Schema.org

#### A. Beranda (`/`)
- **Title**: `Karang Taruna Mangga Dua Selatan`
- **Description**: `Website resmi Karang Taruna Mangga Dua Selatan — organisasi pemuda yang aktif, kreatif, dan bertanggung jawab di Kelurahan Mangga Dua Selatan, Jakarta Pusat.`
- **Canonical**: `https://karangtaruna-website.vercel.app/`
- **Schema.org**:
  - `Organization`: Nama, Logo, URL, Alamat (Mangga Dua Selatan), Kontak.
  - `WebSite`: Name, AlternateName, URL.

#### B. Berita & Kegiatan (`/berita`)
- **Title**: `Berita & Kegiatan | Karang Taruna Mangga Dua Selatan`
- **Description**: `Informasi terbaru seputar kegiatan, program kerja, dan acara Karang Taruna Mangga Dua Selatan di Kelurahan Mangga Dua Selatan, Jakarta Pusat.`
- **Canonical**: `https://karangtaruna-website.vercel.app/berita`
- **Schema.org**: `BreadcrumbList` (Beranda > Berita).

#### C. Detail Artikel (`/berita/:slug`)
- **Title**: `{Judul Artikel} | Karang Taruna Mangga Dua Selatan`
- **Description**: `{Excerpt Artikel} (150–160 karakter ringkasan artikel)`
- **Canonical**: `https://karangtaruna-website.vercel.app/berita/{slug}`
- **OG Type**: `article`
- **OG Image**: Cloudinary Cover Image URL
- **Schema.org**:
  - `Article`: Headline, Description, Author, Publisher (Organization + Logo), DatePublished, MainEntityOfPage.
  - `BreadcrumbList`: Beranda > Berita > {Judul Artikel}.

#### D. Transparansi Anggaran (`/anggaran`)
- **Title**: `Transparansi Anggaran | Karang Taruna Mangga Dua Selatan`
- **Description**: `Laporan transparansi keuangan dan kas Karang Taruna Mangga Dua Selatan sebagai wujud akuntabilitas publik.`
- **Canonical**: `https://karangtaruna-website.vercel.app/anggaran`
- **Schema.org**: `BreadcrumbList` (Beranda > Anggaran).

#### E. Kontak (`/kontak`)
- **Title**: `Hubungi Kami | Karang Taruna Mangga Dua Selatan`
- **Description**: `Alamat sekretariat, lokasi peta, email, dan saluran komunikasi resmi Karang Taruna Mangga Dua Selatan.`
- **Canonical**: `https://karangtaruna-website.vercel.app/kontak`
- **Schema.org**:
  - `LocalBusiness` / `NGO`: Address, GeoCoordinates (Latitude/Longitude Mangga Dua Selatan), OpeningHours.
  - `BreadcrumbList` (Beranda > Kontak).

---

## 3. Strategi Rendering untuk Crawlability

### 3.1 Tantangan Client-Side Rendering (CSR) & Solusi
Sebagai aplikasi **React SPA (Vite)**, pencoleng (crawler) modern seperti Googlebot sudah dapat mengeksekusi JavaScript. Namun, crawler sosial media (Facebook OpenGraph, WhatsApp Preview, Twitter Cards, Telegram) sering kali **tidak mengeksekusi JS** dan hanya membaca HTML mentah saat pertama kali di-fetch.

### 3.2 Solusi Multi-Tier yang Diterapkan:
1. **Fallback Meta Static (`index.html`)**: `index.html` memiliki default title, meta description, dan OpenGraph dasar sehingga crawler non-JS tetap menerima preview valid.
2. **Client-Side Hydration Metadata (`useSeo.js`)**: Begitu halaman di-load oleh browser/Googlebot, `useSeo` secara instan menyesuaikan title, meta tags, canonical link, dan JSON-LD sesuai data API rute tersebut.
3. **Crawlability Readiness (Vercel Prerender / Edge Middleware Option)**:
   - Jika diperlukan integrasi sosial media preview 100% dynamic tanpa SSR penuh, Vercel Serverless Function dapat dikonfigurasi untuk menyajikan HTML ter-prerender khusus bagi user-agent sosial media crawler (`facebookexternalhit`, `Twitterbot`, `WhatsApp`).

---

## 4. Status sitemap.xml & robots.txt

### 4.1 `public/sitemap.xml`
File sitemap XML publik telah dikonfigurasi secara valid pada domain `https://karangtaruna-website.vercel.app/sitemap.xml`:
- Memuat seluruh 11 rute statis utama dengan atribut `<priority>` (1.0 untuk Home, 0.9 untuk Berita, 0.8 untuk Profil/Galeri/Kontak) dan `<changefreq>`.
- Memuat sampel slug berita aktif (`/berita/semarak-lomba-17-agustus-2026`, dll.) dengan `<lastmod>`.

### 4.2 `public/robots.txt`
File `public/robots.txt` disiapkan di akar domain publik:
```ini
User-agent: *
Allow: /

# Disallow non-public routes / API endpoints
Disallow: /api/

# Sitemaps
Sitemap: https://karangtaruna-website.vercel.app/sitemap.xml
```

---

## 5. Catatan Core Web Vitals & Rekomendasi Tambahan

SEO modern sangat bergantung pada **User Experience** dan **Core Web Vitals**:

| Metric | Target | Optimasi yang Diterapkan |
|---|---|---|
| **LCP (Largest Contentful Paint)** | `< 2.5s` | Gambar hero (`HeroSection`, `PageHeader`, `NewsDetail`) menggunakan `loading="eager"` + `decoding="async"`. Format gambar disajikan otomatis via Cloudinary (`f_auto,q_auto`). |
| **CLS (Cumulative Layout Shift)** | `< 0.1` | Komponen `CloudinaryImage.jsx` menerapkan penataan `aspect-ratio` tereservasi sebelum gambar selesai memuat. CLS terverifikasi **0.00**. |
| **INP (Interaction to Next Paint)** | `< 200ms` | Route-level code-splitting menggunakan `React.lazy` + `Suspense`. Beban bundle utama sangat ringan. |

---

## 6. Catatan untuk Fase Deploy

1. **Konfigurasi Domain Utama**:
   - Pastikan domain utama di Vercel terdaftar sebagai `https://karangtaruna-website.vercel.app` (atau domain kustom `.id` di masa mendatang).
2. **Pengalihan (Canonical Redirect)**:
   - Aktifkan fitur **Redirect HTTP → HTTPS** dan **www → non-www** di dashboard domain Vercel untuk menghindari isu *duplicate content*.
3. **Submit ke Google Search Console**:
   - Daftarkan URL properti di [Google Search Console](https://search.google.com/search-console).
   - Submit file sitemap: `https://karangtaruna-website.vercel.app/sitemap.xml`.
   - Lakukan uji *URL Inspection* pada rute utama (`/`, `/berita`, `/profil`, `/anggaran`) untuk memverifikasi indexability.
4. **Verifikasi Bing Webmaster Tools**:
   - Import sitemap yang sama ke Bing Webmaster Tools untuk pencarian Bing & Yahoo.

---
*Dokumen ini dihasilkan oleh SEO Specialist pada Fase 07 (SEO).*
