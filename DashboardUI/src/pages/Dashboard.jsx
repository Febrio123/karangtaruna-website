import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  FileText,
  CalendarDays,
  Wallet,
  Activity,
  Calendar as CalendarIcon,
  MapPin,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import KasChartCard from '../components/ui/KasChartCard.jsx'
import InlineNotice from '../components/ui/InlineNotice.jsx'
import { apiFetch } from '../lib/api'
import { useAuth } from '../context/AuthContext.jsx'
import {
  stats as fallbackStats,
  kasChart as fallbackChart,
  recentActivities as fallbackActivities,
  upcomingEvents as fallbackEvents,
} from '../data/overview.js'
import { formatCurrency, formatDateShort } from '../utils/format.js'

const activityIconMap = {
  FileText,
  Calendar: CalendarIcon,
  Wallet,
  UserPlus: Users,
  Image: ImageIcon,
}

const BULAN_NAMA = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function bulanIndex(tanggal) {
  const [, m] = String(tanggal).split('-').map(Number)
  if (m >= 1 && m <= 12) return m - 1
  return new Date(tanggal).getMonth()
}

function aggregatePerBulan(list) {
  const total = Array(12).fill(0)
  list.forEach((item) => {
    const idx = bulanIndex(item.tanggal)
    if (idx >= 0 && idx < 12) total[idx] += item.jumlah
  })
  return total
}

function relativeTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diffHari = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diffHari <= 0) return 'Hari ini'
  if (diffHari === 1) return '1 hari lalu'
  if (diffHari < 7) return `${diffHari} hari lalu`
  return formatDateShort(iso)
}

const DEFAULT_CHART = {
  labels: fallbackChart.months.map((m) => m.bulan),
  pemasukan: fallbackChart.months.map((m) => m.pemasukan),
  pengeluaran: fallbackChart.months.map((m) => m.pengeluaran),
}

// Stagger sederhana untuk kartu statistik — durasi pendek + easeOut.
const statGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const statItemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [fallback, setFallback] = useState(false)
  const [stats, setStats] = useState(fallbackStats)
  const [chart, setChart] = useState(DEFAULT_CHART)
  const [activities, setActivities] = useState(fallbackActivities)
  const [upcoming, setUpcoming] = useState(fallbackEvents)

  const displayName = user?.nama || user?.username || 'Admin'

  useEffect(() => {
    let active = true

    async function load() {
      const tahun = String(new Date().getFullYear())
      try {
        // Semua endpoint paralel — 401 akan di-refresh otomatis oleh api.js.
        const [pengurus, articles, events, ringkasan, transaksi] = await Promise.all([
          apiFetch('/pengurus'),
          apiFetch('/articles?published=false&limit=1'),
          apiFetch('/events?published=false&limit=1'),
          apiFetch(`/transaksi-anggaran/ringkasan?tahun=${tahun}`),
          apiFetch(`/transaksi-anggaran?tahun=${tahun}&limit=200`),
        ])

        if (!active) return

        const pengurusList = Array.isArray(pengurus) ? pengurus : pengurus?.items || []
        const pagArtikel = articles?.pagination || {}
        const pagEvent = events?.pagination || {}
        const procesEvents = (Array.isArray(events) ? events : events?.items || [])
        const itemsTransaksi = (Array.isArray(transaksi) ? transaksi : transaksi?.items || []).map((t) => ({
          tanggal: t.tanggal,
          jumlah: Number(t.jumlah || 0),
          jenis: t.jenis,
          keterangan: t.deskripsi || t.keterangan || '',
        }))

        const totalPengurus = pengurusList.length
        const totalBerita = Number(pagArtikel.total || 0)
        const totalEvent = Number(pagEvent.total || 0)
        const saldoKas = Number(ringkasan?.saldo ?? 0)

        const pemasukan = itemsTransaksi.filter((i) => i.jenis === 'pemasukan')
        const pengeluaran = itemsTransaksi.filter((i) => i.jenis === 'pengeluaran')

        setStats({ totalPengurus, totalBerita, totalEvent, saldoKas })
        setChart({
          labels: BULAN_NAMA,
          pemasukan: aggregatePerBulan(pemasukan),
          pengeluaran: aggregatePerBulan(pengeluaran),
        })

        // Aktivitas terbaru — derive dari data asli (berita, event, kas, pengurus).
        const act = []
        procesEvents.slice(0, 2).forEach((e) => {
          act.push({
            id: `ev-${e._id}`,
            ikon: 'Calendar',
            pesan: `Event dijadwalkan: "${e.title}"`,
            waktu: relativeTime(e.date || e.createdAt),
          })
        })
        const artikelPublished = (Array.isArray(articles) ? articles : articles?.items || []).filter(
          (a) => a.isPublished
        )
        artikelPublished.slice(0, 2).forEach((a) => {
          act.push({
            id: `ar-${a._id}`,
            ikon: 'FileText',
            pesan: `Berita diterbitkan: "${a.title}"`,
            waktu: relativeTime(a.date || a.createdAt),
          })
        })
        itemsTransaksi.slice(0, 2).forEach((t) => {
          act.push({
            id: `tr-${t.tanggal}-${t.keterangan}`,
            ikon: 'Wallet',
            pesan: `Kas ${t.jenis}: ${t.keterangan}`,
            waktu: relativeTime(t.tanggal),
          })
        })
        setActivities(act.length ? act.slice(0, 5) : fallbackActivities)

        // Event mendatang (status 'Mendatang'), urut tanggal terdekat.
        const mendatang = procesEvents
          .filter((e) => e.status === 'Mendatang')
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3)
          .map((e) => ({
            id: e._id,
            judul: e.title,
            tanggal: String(e.date).slice(0, 10),
            lokasi: e.location || '-',
            status: e.status,
          }))
        setUpcoming(mendatang.length ? mendatang : fallbackEvents)

        setFallback(false)
      } catch (err) {
        if (!active) return
        console.log('[api] fallback: overview dashboard', err)
        setFallback(true)
        // Pertahankan data mock sebagai cadangan.
      }
    }

    load()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-h1 text-text">Selamat datang, {displayName}</h2>
          <p className="text-caption text-text-muted mt-1">
            Ringkasan kegiatan dan keuangan Karang Taruna Sukamaju hari ini.
          </p>
        </div>
        <span className="text-caption text-text-muted">{tanggalHariIni}</span>
      </div>

      {fallback && (
        <InlineNotice variant="warning">
          Server tidak dapat diakses — menampilkan data cadangan lokal.
        </InlineNotice>
      )}

      {/* Stat cards */}
      <motion.div
        variants={statGridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {[
          {
            icon: Users,
            label: 'Total Pengurus',
            value: stats.totalPengurus,
            sublabel: 'pengurus terdaftar',
            trend: 'Terhubung API',
            trendDirection: 'up',
          },
          {
            icon: FileText,
            label: 'Total Berita',
            value: stats.totalBerita,
            sublabel: 'artikel di website',
            trend: 'Terhubung API',
            trendDirection: 'up',
          },
          {
            icon: CalendarDays,
            label: 'Total Event',
            value: stats.totalEvent,
            sublabel: 'event & pengumuman',
            trend: 'Terhubung API',
            trendDirection: 'up',
          },
          {
            icon: Wallet,
            label: 'Saldo Kas',
            value: formatCurrency(stats.saldoKas),
            sublabel: 'Kas periode berjalan',
            trend: stats.saldoKas >= 0 ? 'Aman' : 'Defisit',
            trendDirection: stats.saldoKas >= 0 ? 'up' : 'down',
          },
        ].map((s) => (
          <motion.div key={s.label} variants={statItemVariants} className="min-w-0">
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Rekap kas — double chart Chart.js (Line | Bar) */}
        <KasChartCard
          className="xl:col-span-2"
          title={`Rekap Kas ${new Date().getFullYear()}`}
          subtitle="Pemasukan vs pengeluaran per bulan"
          labels={chart.labels}
          pemasukan={chart.pemasukan}
          pengeluaran={chart.pengeluaran}
          defaultMode="bar"
        />

        {/* Aktivitas terbaru */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-h3 text-text">Aktivitas Terbaru</h3>
            <span className="inline-flex text-xs text-primary font-medium">Lihat semua</span>
          </div>
          <ul className="space-y-4">
            {activities.map((item) => {
              const Icon = activityIconMap[item.ikon] || Activity
              return (
                <li key={item.id} className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-text leading-snug">{item.pesan}</p>
                    <p className="text-xs text-text-muted mt-0.5">{item.waktu}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Event mendatang */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-h3 text-text">Event Mendatang</h3>
          <Link
            to="/event"
            className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Kelola event <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcoming.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 p-3 rounded-md border border-border-light hover:border-primary/40 hover:bg-primary-light/40 transition-colors">
              <div className="w-11 h-11 rounded-md bg-accent-light text-accent flex flex-col items-center justify-center shrink-0">
                <span className="text-base font-heading font-bold leading-none">
                  {ev.tanggal.slice(8, 10)}
                </span>
                <span className="text-[10px] uppercase">{new Date(ev.tanggal).toLocaleDateString('id-ID', { month: 'short' })}</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-heading font-semibold text-text text-sm leading-snug">{ev.judul}</h4>
                <p className="text-xs text-text-muted mt-1 inline-flex items-center gap-1">
                  <MapPin size={12} aria-hidden="true" /> {ev.lokasi}
                </p>
                <div className="mt-1.5">
                  <Badge variant="success" dot>{ev.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}