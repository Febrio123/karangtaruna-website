import { motion } from 'framer-motion';

/**
 * Reveal — fade-up saat elemen masuk ke viewport.
 * Dipakai untuk kartu/list/section agar animasi konsisten (0.3s, easeOut,
 * hanya sekali). Prop `delay` dipakai untuk stagger sederhana antar item.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  ...props
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}