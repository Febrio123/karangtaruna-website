import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export default function MobileDrawer({ isOpen, onClose, navItems }) {
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 left-0 w-[280px] bg-surface z-50 shadow-xl transition-transform duration-200 ease-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Close button */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border-light">
          <span className="font-heading text-body-lg font-bold text-primary">
            Menu
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text rounded-md hover:bg-bg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-2 overflow-y-auto" aria-label="Navigasi mobile">
          {navItems.map((item) => (
            <div key={item.href}>
              <NavLink
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-between px-4 py-3 text-body-base font-body',
                    'transition-colors duration-150',
                    isActive
                      ? 'text-primary font-semibold bg-primary-light'
                      : 'text-text-secondary hover:text-text hover:bg-bg'
                  )
                }
              >
                {item.label}
                {item.children && (
                  <ChevronRight className="w-4 h-4 opacity-50" />
                )}
              </NavLink>

              {/* Sub items */}
              {item.children && (
                <div className="ml-4 border-l-2 border-border-light">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.href}
                      to={child.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          'block px-6 py-2.5 text-body-base font-body',
                          'transition-colors duration-150',
                          isActive
                            ? 'text-primary font-semibold bg-primary-light'
                            : 'text-text-muted hover:text-text-secondary hover:bg-bg'
                        )
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
