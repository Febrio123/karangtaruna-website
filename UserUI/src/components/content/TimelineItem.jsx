export default function TimelineItem({ item, isLast = false }) {
  return (
    <div className="flex gap-4 md:gap-6">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary-light shrink-0" />
        {!isLast && <div className="w-0.5 flex-1 bg-border-light mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-8 md:pb-10">
        <span className="text-overline text-primary font-heading font-semibold uppercase tracking-wider">
          {item.year}
        </span>
        <h3 className="font-heading text-h3 text-text mt-1 mb-2">{item.title}</h3>
        <p className="font-body text-body-base text-text-secondary max-w-content">
          {item.description}
        </p>
      </div>
    </div>
  );
}
