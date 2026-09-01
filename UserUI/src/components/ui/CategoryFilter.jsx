import { clsx } from 'clsx';

export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div
      className="flex flex-wrap gap-2 mb-6"
      role="tablist"
      aria-label="Filter kategori"
    >
      {categories.map((category) => (
        <button
          key={category}
          role="tab"
          aria-selected={active === category}
          onClick={() => onChange(category)}
          className={clsx(
            'px-3 py-1.5 text-caption font-body font-medium rounded-sm',
            'transition-colors duration-150 ease-out',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            active === category
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary border border-border hover:bg-bg hover:text-text'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
