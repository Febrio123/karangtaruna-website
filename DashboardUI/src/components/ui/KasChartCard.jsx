// Kartu rekap kas dengan DOUBLE CHART (Chart.js): bisa ditampilkan sebagai
// bar chart ATAU line chart via toggle kecil di header — dipakai di Dashboard
// (Rekap Kas 2026) dan Anggaran (Perbandingan Kas {tahun}).
import { useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { ChartBar, ChartLine } from 'lucide-react'
import '../../lib/chart.js'
import { formatCurrency } from '../../utils/format.js'

// Warna konsisten dengan token desain biru gelap (primary) & oranye (accent).
const COLOR_PEMASUKAN = '#094986'
const COLOR_PEMASUKAN_HOVER = '#073D71'
const COLOR_PENGELUARAN = '#C75B2A'
const COLOR_PENGELUARAN_HOVER = '#A84A20'
const COLOR_TOOLTIP_BG = '#041D36'

/** Format ringkas untuk label sumbu Y, misal "Rp 12 rb" / "Rp 4,5 jt". */
function compactRp(value) {
  if (value >= 1_000_000) {
    const juta = value / 1_000_000
    const teks = Number.isInteger(juta) ? juta : juta.toFixed(1).replace('.', ',')
    return `Rp ${teks} jt`
  }
  if (value >= 1_000) return `Rp ${Math.round(value / 1_000)} rb`
  return `Rp ${value}`
}

const tooltipBase = (activeColor) => ({
  backgroundColor: COLOR_TOOLTIP_BG,
  titleColor: '#ffffff',
  bodyColor: 'rgba(255,255,255,0.9)',
  padding: 10,
  cornerRadius: 8,
  boxPadding: 4,
  callbacks: {
    label: (ctx) =>
      ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? ctx.parsed.v ?? 0)}`,
  },
})

const barDataset = (label, data, color, hover) => ({
  label,
  data,
  backgroundColor: color,
  hoverBackgroundColor: hover,
  borderRadius: 6,
  borderSkipped: false,
  maxBarThickness: 26,
})

const lineDataset = (label, data, color) => ({
  label,
  data,
  borderColor: color,
  backgroundColor: color,
  pointBackgroundColor: '#ffffff',
  pointBorderColor: color,
  pointBorderWidth: 2,
  pointRadius: 3.5,
  pointHoverRadius: 5,
  borderWidth: 2.5,
  tension: 0.35,
  fill: false,
})

export default function KasChartCard({
  title,
  subtitle,
  labels,
  pemasukan = [],
  pengeluaran = [],
  defaultMode = 'bar',
  className = '',
}) {
  const [mode, setMode] = useState(defaultMode)

  const totalMasuk = pemasukan.reduce((s, v) => s + v, 0)
  const totalKeluar = pengeluaran.reduce((s, v) => s + v, 0)

  const data = {
    labels,
    datasets:
      mode === 'bar'
        ? [
            barDataset('Pemasukan', pemasukan, COLOR_PEMASUKAN, COLOR_PEMASUKAN_HOVER),
            barDataset('Pengeluaran', pengeluaran, COLOR_PENGELUARAN, COLOR_PENGELUARAN_HOVER),
          ]
        : [
            lineDataset('Pemasukan', pemasukan, COLOR_PEMASUKAN),
            lineDataset('Pengeluaran', pengeluaran, COLOR_PENGELUARAN),
          ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: tooltipBase(),
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: 'rgba(0,0,0,0.08)' },
        ticks: { color: '#8A8A8A', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        border: { display: false },
        ticks: {
          color: '#8A8A8A',
          font: { size: 11 },
          maxTicksLimit: 6,
          callback: (value) => compactRp(value),
        },
      },
    },
  }

  const toggleBtn = (value, label, Icon) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      aria-pressed={mode === value}
      className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        mode === value
          ? 'bg-surface text-primary shadow-sm'
          : 'text-text-muted hover:text-text'
      }`}
    >
      <Icon size={15} aria-hidden="true" /> {label}
    </button>
  )

  return (
    <div className={`card p-5 ${className}`}>
      {/* Header: judul + legenda + toggle double chart */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-heading font-semibold text-h3 text-text">{title}</h3>
          <p className="text-caption text-text-muted mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLOR_PEMASUKAN }}
                aria-hidden="true"
              />
              Pemasukan
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLOR_PENGELUARAN }}
                aria-hidden="true"
              />
              Pengeluaran
            </span>
          </div>
          <div
            className="flex items-center gap-1 bg-bg rounded-md p-0.5"
            role="group"
            aria-label="Pilih mode chart"
          >
            {toggleBtn('bar', 'Bar', ChartBar)}
            {toggleBtn('line', 'Line', ChartLine)}
          </div>
        </div>
      </div>

      {/* Ringkasan total */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 pb-4 border-b border-border-light">
        <p className="text-sm text-text-secondary inline-flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: COLOR_PEMASUKAN }}
            aria-hidden="true"
          />
          Total masuk:
          <span className="font-semibold text-text">{formatCurrency(totalMasuk)}</span>
        </p>
        <p className="text-sm text-text-secondary inline-flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: COLOR_PENGELUARAN }}
            aria-hidden="true"
          />
          Total keluar:
          <span className="font-semibold text-text">{formatCurrency(totalKeluar)}</span>
        </p>
      </div>

      {/* Area chart (tinggi tetap → responsif via maintainAspectRatio:false) */}
      <div className="relative h-72">
        {mode === 'bar' ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
      </div>
    </div>
  )
}