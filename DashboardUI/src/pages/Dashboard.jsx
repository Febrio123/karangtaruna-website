import {
  Users,
  FileText,
  CalendarDays,
  Wallet,
  Activity,
  Calendar as CalendarIcon,
  MapPin,
  ChevronRight,
} from 'lucide-react'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import KasChartCard from '../components/ui/KasChartCard.jsx'
import {
  stats,
  kasChart,
  recentActivities,
  upcomingEvents,
} from '../data/overview.js'
import { formatCurrency, formatDateShort } from '../utils/format.js'

const activityIconMap = {
  FileText,
  Calendar: CalendarIcon,
  Wallet,
  UserPlus: Users,
  Image: 'Image',
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-h1 text-text">Selamat datang, Ahmad</h2>
          <p className="text-caption text-text-muted mt-1">
            Ringkasan kegiatan dan keuangan Karang Taruna Sukamaju hari ini.
          </p>
        </div>
        <span className="text-caption text-text-muted">Senin, 30 Agustus 2026</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Pengurus"
          value={stats.totalPengurus}
          sublabel="5 pengurus inti"
          trend="+2 bulan ini"
          trendDirection="up"
        />
        <StatCard
          icon={FileText}
          label="Total Berita"
          value={stats.totalBerita}
          sublabel="6 draf menunggu"
          trend="+4 minggu ini"
          trendDirection="up"
        />
        <StatCard
          icon={CalendarDays}
          label="Total Event"
          value={stats.totalEvent}
          sublabel="3 event mendatang"
          trend="+1 ini bulan"
          trendDirection="up"
        />
        <StatCard
          icon={Wallet}
          label="Saldo Kas"
          value={formatCurrency(stats.saldoKas)}
          sublabel="Kas periode berjalan"
          trend="Naik 8%"
          trendDirection="up"
        />
      </div>

      {/* Chart + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Rekap kas — double chart Chart.js (Line | Bar) */}
        <KasChartCard
          className="xl:col-span-2"
          title="Rekap Kas 2026"
          subtitle="Pemasukan vs pengeluaran per bulan"
          labels={kasChart.months.map((m) => m.bulan)}
          pemasukan={kasChart.months.map((m) => m.pemasukan)}
          pengeluaran={kasChart.months.map((m) => m.pengeluaran)}
          defaultMode="bar"
        />

        {/* Aktivitas terbaru */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-h3 text-text">Aktivitas Terbaru</h3>
            <span className="inline-flex text-xs text-primary font-medium">Lihat semua</span>
          </div>
          <ul className="space-y-4">
            {recentActivities.map((item) => {
              const Icon = activityIconMap[item.ikon]
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
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Kelola event <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.map((ev) => (
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
