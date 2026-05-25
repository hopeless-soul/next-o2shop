interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}

export default function StarRating({
  rating,
  max = 5,
  size = 14,
  className = "",
}: StarRatingProps) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of ${max} stars`}
      role="img"
    >
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        const isPartial = fill > 0 && fill < 1;
        const percent = Math.round(fill * 100);
        const gradId = `sg-${i}-${String(rating).replace(".", "_")}`;

        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20">
            {isPartial && (
              <defs>
                <linearGradient id={gradId}>
                  <stop
                    offset={`${percent}%`}
                    stopColor="var(--color-accent)"
                  />
                  <stop offset={`${percent}%`} stopColor="#e0e0e0" />
                </linearGradient>
              </defs>
            )}
            <polygon
              points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
              fill={
                fill >= 1
                  ? "var(--color-accent)"
                  : isPartial
                  ? `url(#${gradId})`
                  : "#e0e0e0"
              }
            />
          </svg>
        );
      })}
    </div>
  );
}
