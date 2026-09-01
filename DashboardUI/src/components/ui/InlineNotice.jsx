/** Notifikasi inline kecil: error (API gagal) atau warning (mode cadangan). */
export default function InlineNotice({ variant = 'error', children, className = '' }) {
  const styles = {
    error: 'bg-[#FBE8E6] text-danger',
    warning: 'bg-accent-light text-accent-dark',
    success: 'bg-[#E7F4E8] text-success',
  }
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-md px-3.5 py-2.5 text-sm ${styles[variant]} ${className}`}
    >
      {children}
    </div>
  )
}