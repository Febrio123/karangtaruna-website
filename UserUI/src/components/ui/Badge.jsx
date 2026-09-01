import { clsx } from 'clsx';

const variants = {
  primary: 'bg-primary-light text-primary',
  accent: 'bg-accent-light text-accent',
  success: 'bg-green-50 text-success',
  danger: 'bg-red-50 text-danger',
  neutral: 'bg-bg text-text-secondary',
};

export default function Badge({ variant = 'primary', children, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 font-body',
        'text-overline uppercase rounded-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
