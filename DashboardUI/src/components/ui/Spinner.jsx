import { Loader2 } from 'lucide-react'

/**
 * Spinner inline kecil untuk tombol aksi (simpan/hapus/unggah) saat proses
 * berlangsung. Memakai `animate-spin` bawaan Tailwind + ikon lucide Loader2.
 */
export default function Spinner({ size = 14, className = '' }) {
  return <Loader2 size={size} className={`animate-spin shrink-0 ${className}`} aria-hidden="true" />
}