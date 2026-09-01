import { clsx } from 'clsx';
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const variants = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', Icon: Info },
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', Icon: CheckCircle },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', Icon: AlertTriangle },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', Icon: AlertCircle },
};

export default function Alert({ variant = 'info', children, className }) {
  const config = variants[variant];

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 p-4 rounded-md border',
        config.bg,
        config.border,
        className
      )}
    >
      <config.Icon className={clsx('w-5 h-5 mt-0.5 shrink-0', config.text)} />
      <div className={clsx('text-body-base', config.text)}>{children}</div>
    </div>
  );
}
