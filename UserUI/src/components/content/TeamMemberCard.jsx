import { memo } from 'react';
import { User } from 'lucide-react';
import Card from '../ui/Card';
import Reveal from '../ui/Reveal';
import CloudinaryImage from './CloudinaryImage';

function TeamMemberCard({ member, index = 0 }) {
  return (
    <Reveal delay={Math.min(index * 0.05, 0.3)} className="h-full">
      <Card className="flex flex-col items-center text-center h-full">
      {/* Photo (lazy Cloudinary) or placeholder */}
      {member.photo ? (
        <CloudinaryImage
          publicId={member.media?.public_id ?? member.photo}
          src={member.media?.secure_url ?? null}
          alt={member.name}
          aspect="square"
          className="w-24 h-24 rounded-full mb-3 overflow-hidden"
          sizes="96px"
          imgClassName="rounded-full"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-3">
          <User className="w-10 h-10 text-primary" />
        </div>
      )}

      <h3 className="font-heading text-h4 text-text mb-0.5">{member.name}</h3>
      <p className="font-body text-body-base text-primary font-medium mb-1">
        {member.position}
      </p>
      <p className="font-body text-caption text-text-muted">{member.division}</p>
      </Card>
    </Reveal>
  );
}

export default memo(TeamMemberCard);
