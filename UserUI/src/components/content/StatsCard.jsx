import { memo } from 'react';
import Card from '../ui/Card';

function StatsCard({ value, label }) {
  return (
    <Card className="text-center">
      <p className="font-heading text-display md:text-h1 text-primary mb-1">{value}</p>
      <p className="font-body text-body-base text-text-secondary">{label}</p>
    </Card>
  );
}

export default memo(StatsCard);
