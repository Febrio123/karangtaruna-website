// ============================================================================
// UserUI/src/hooks/useSiteConfig.js — beranda/profil/kontak membaca site config.
// ============================================================================
// Menggabungkan data LIVE `/api/site-config` dengan data statis sebagai
// `initial`/`fallback`:
//   - Halaman dirender IMMEDIATELY pakai siteConfig statis (tanpa spinner),
//     lalu data API menimpanya begitu tiba (silent refresh).
//   - Bila API gagal, tetap pakai statis (graceful degradation), tanpa interupsi
//     layout/navbar/footer/hero yang mengandalkan nilai ini.
// Ini menjaga seluruh komponen layout dan test integration tetap stabil.
// ============================================================================

import useApiData from './useApiData';
import { siteConfig as staticSiteConfig } from '../data/siteConfig';
import { adaptSiteConfig } from '../lib/adapters';

export default function useSiteConfig() {
  return useApiData({
    url: '/site-config',
    initial: staticSiteConfig,
    fallback: staticSiteConfig,
    adapter: adaptSiteConfig,
  });
}
