import { clsx } from 'clsx';

export default function Container({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'w-full px-4 sm:px-6 md:px-8',
        'lg:max-w-[1200px] lg:mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
