interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
  color?: string;
}

export default function StarRating({
  rating,
  max = 5,
  size = 14,
  className = "",
  color = "var(--color-star)",
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
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
            {isPartial && (
              <defs>
                <linearGradient id={gradId}>
                  <stop
                    offset={`${percent}%`}
                    stopColor={color}
                  />
                  <stop offset={`${percent}%`} stopColor="var(--color-border-light)" />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={
                fill >= 1
                  ? color
                  : isPartial
                  ? `url(#${gradId})`
                  : "var(--color-border-light)"
              }
            />
          </svg>
        );
      })}
    </div>
  );
}
