import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, sublabel, trend, trendDirection }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className="w-12 h-12 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
        <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-caption text-text-muted">{label}</p>
        <p className="font-heading font-bold text-2xl text-text mt-0.5 truncate">{value}</p>
        {sublabel && (
          <p className="text-xs text-text-muted mt-1">{sublabel}</p>
        )}
        {trend && (
          <p
            className={`inline-flex items-center gap-1 text-xs font-medium mt-1.5 ${
              trendDirection === 'down' ? 'text-danger' : 'text-primary'
            }`}
          >
            {trendDirection === 'down' ? (
              <ArrowDownRight size={13} aria-hidden="true" />
            ) : (
              <ArrowUpRight size={13} aria-hidden="true" />
            )}
            {trend}
          </p>
        )}
      </div>
    </div>
  )
}
