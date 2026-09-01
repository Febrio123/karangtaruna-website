import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Belum ada data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-bg-alt flex items-center justify-center text-text-muted mb-4">
        <Inbox size={24} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="font-heading font-semibold text-h3 text-text">{title}</h3>
      {description && (
        <p className="text-caption text-text-muted mt-1.5 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
