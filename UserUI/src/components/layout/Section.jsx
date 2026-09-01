import { clsx } from 'clsx';
import Container from './Container';

export default function Section({ children, className, containerClassName, ...props }) {
  return (
    <section className={clsx('py-10 md:py-12', className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
