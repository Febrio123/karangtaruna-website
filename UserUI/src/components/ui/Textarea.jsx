import { clsx } from 'clsx';

export default function Textarea({
  label,
  error,
  rows = 4,
  id,
  required = false,
  maxLength,
  className,
  ...props
}) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="font-body text-body-base font-medium text-text"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        maxLength={maxLength}
        className={clsx(
          'w-full px-3 py-2 font-body text-body-base rounded-md',
          'border bg-surface text-text resize-y',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
          'placeholder:text-text-muted',
          error ? 'border-danger' : 'border-border'
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="text-caption text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
