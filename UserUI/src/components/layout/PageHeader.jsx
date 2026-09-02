import { motion } from 'framer-motion';
import Breadcrumbs from '../ui/Breadcrumbs';
import Container from './Container';
import defaultHero from '../../assets/hero2.png';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  image,
}) {
  const heroImage = image || defaultHero;

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-900"
      role="banner"
    >
      {/* Background image — full bleed */}
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        decoding="async"
        aria-hidden="true"
      />

      {/* Dark gradient overlay for text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35"
        aria-hidden="true"
      />

      <Container className="relative z-10 py-20 md:py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {breadcrumbs && (
            <div className="[&_a]:text-white/80 [&_a]:hover:text-white [&_span]:text-white/60 [&_svg]:text-white/50">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}
          {title && (
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mb-3">
              {title}
            </h1>
          )}
          {description && (
            <p className="font-body text-base md:text-lg text-white/85 max-w-2xl">
              {description}
            </p>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
