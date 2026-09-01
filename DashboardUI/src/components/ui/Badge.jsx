// Badge untuk status / role / kategori dengan variant warna berbeda.

const variants = {
  primary: 'bg-primary-light text-primary',
  accent: 'bg-accent-light text-accent',
  success: 'bg-primary-light text-primary',
  danger: 'bg-[#FBE8E6] text-danger',
  info: 'bg-primary-light text-primary',
  neutral: 'bg-bg-alt text-text-secondary',
}

export default function Badge({ variant = 'neutral', children, className = '', dot }) {
  const base = variants[variant] || variants.neutral
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium whitespace-nowrap ${base} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}
