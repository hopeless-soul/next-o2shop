import type { Review } from "@/lib/types";
import StarRating from "@/components/ui/StarRating";

interface ReviewItemProps {
  review: Review;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewItem({ review }: ReviewItemProps) {
  return (
    <div
      className="py-6 border-b"
      style={{ borderColor: "var(--color-border-light)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className="font-sans text-[14px] uppercase tracking-[0.3px]"
          style={{ color: "var(--color-foreground-dark)" }}
        >
          {review.displayName}
        </span>
        <span
          className="text-[12px]"
          style={{
            fontFamily: "var(--font-secondary)",
            color: "var(--color-foreground-subtle)",
          }}
        >
          {formatDate(review.createdAt)}
        </span>
      </div>

      <StarRating rating={review.rating / 2} size={13} className="mb-3" />

      <p
        className="text-sm leading-relaxed"
        style={{
          fontFamily: "var(--font-secondary)",
          color: "var(--color-foreground)",
        }}
      >
        {review.content}
      </p>
    </div>
  );
}
