import type { Review } from "@/lib/types";
import StarRating from "@/components/ui/StarRating";

interface ReviewItemProps {
  review: Review;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ReviewItem({ review }: ReviewItemProps) {
  return (
    <div
      className="py-4"
      style={{ borderTop: "0.667px solid rgba(0,0,0,0.1)" }}
    >
      {/* Row 1: stars + date */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <StarRating rating={review.rating / 2} size={13} />
        <span
          style={{
            fontFamily: "var(--font-secondary)",
            fontSize: "12px",
            color: "rgb(123,123,123)",
            letterSpacing: "0.3px",
          }}
        >
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* Row 2: author + verified badge */}
      <div className="flex items-center gap-2 mb-1">
        <span
          style={{
            fontFamily: "var(--font-secondary)",
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "0.3px",
            color: "var(--color-foreground-strong)",
          }}
        >
          {review.displayName}
        </span>
        <span
          style={{
            fontFamily: "var(--font-secondary)",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.3px",
            color: "#ffffff",
            backgroundColor: "rgb(156,156,156)",
            padding: "3px 6px",
          }}
        >
          Verified
        </span>
      </div>

      {/* Row 3: content */}
      <p
        style={{
          fontFamily: "var(--font-secondary)",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "0.3px",
          lineHeight: "19.6px",
          color: "rgb(115,115,115)",
        }}
      >
        {review.content}
      </p>
    </div>
  );
}
