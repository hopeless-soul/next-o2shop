import { cn } from "@/lib/utils";

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
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${rating} out of ${max} stars`}
      role="img"
    >
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        const isPartial = fill > 0 && fill < 1;
        const percent = Math.round(fill * 100);
        const gradId = `sg-${i}-${String(rating).replace(".", "_")}`;

        const fillColor =
          fill >= 1 ? color : isPartial ? `url(#${gradId})` : "var(--color-border-light)";
        const strokeColor = fill >= 1 ? color : "var(--color-border-light)";

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isPartial && (
              <defs>
                <linearGradient id={gradId}>
                  <stop offset={`${percent}%`} stopColor={color} />
                  <stop offset={`${percent}%`} stopColor="var(--color-border-light)" />
                </linearGradient>
              </defs>
            )}
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 20.07 12 17 5.82 20.07 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={fillColor}
              stroke={strokeColor}
            />
          </svg>
        );
      })}
    </div>
  );
}
