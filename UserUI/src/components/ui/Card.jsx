import { clsx } from 'clsx';

export default function Card({
  hover = false,
  padding = true,
  className,
  children,
  ...props
}) {
  return (
    <div
      className={clsx(
        'bg-surface rounded-md border border-border-light',
        'shadow-sm',
        hover && 'transition-shadow duration-150 ease-out hover:shadow-md',
        padding && 'p-4 md:p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
