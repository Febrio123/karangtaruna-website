import { clsx } from 'clsx';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface text-text border border-border hover:bg-bg',
  ghost: 'text-text-secondary hover:bg-bg hover:text-text',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizes = {
  sm: 'px-3 py-1.5 text-caption',
  md: 'px-4 py-2 text-body-base',
  lg: 'px-6 py-3 text-body-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-md',
        'transition-colors duration-150 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
