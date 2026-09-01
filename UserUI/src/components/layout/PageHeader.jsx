import Breadcrumbs from '../ui/Breadcrumbs';
import Container from './Container';

export default function PageHeader({ title, description, breadcrumbs }) {
  return (
    <div className="bg-surface border-b border-border-light pt-6 pb-8 md:pt-8 md:pb-10">
      <Container>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {title ? (
          <h1 className="font-heading text-h1 md:text-display text-text mb-2">
            {title}
          </h1>
        ) : null}
        {description && (
          <p className="font-body text-body-lg text-text-secondary max-w-content">
            {description}
          </p>
        )}
      </Container>
    </div>
  );
}
