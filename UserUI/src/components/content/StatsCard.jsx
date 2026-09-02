import { memo } from 'react';
import Card from '../ui/Card';
import Reveal from '../ui/Reveal';

function StatsCard({ value, label, index = 0 }) {
  return (
    <Reveal delay={Math.min(index * 0.08, 0.3)}>
      <Card className="text-center">
        <p className="font-heading text-display md:text-h1 text-primary mb-1">{value}</p>
        <p className="font-body text-body-base text-text-secondary">{label}</p>
      </Card>
    </Reveal>
  );
}

export default memo(StatsCard);
