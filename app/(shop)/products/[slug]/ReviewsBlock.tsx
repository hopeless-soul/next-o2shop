"use client";

import { useState, useMemo, type FormEvent } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import ReviewItem from "@/components/products/ReviewItem";
import {
  listReviewsByProductClient,
  createReview,
} from "@/lib/api/reviews-client";
import StarRating from "@/components/ui/StarRating";

type SortOrder = "most-recent" | "highest" | "lowest";

interface ReviewsBlockProps {
  productId: string;
  initialReviews: Review[];
  totalReviews: number;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Star
      size={24}
      aria-hidden="true"
      fill={filled ? "var(--color-primary)" : "var(--color-border)"}
      stroke={filled ? "var(--color-primary)" : "var(--color-border)"}
    />
  );
}

export default function ReviewsBlock({
  productId,
  initialReviews,
  totalReviews,
}: ReviewsBlockProps) {
  const [displayedReviews, setDisplayedReviews] =
    useState<Review[]>(initialReviews);
  const [total, setTotal] = useState(totalReviews);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("most-recent");

  const [formOpen, setFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formContent, setFormContent] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const avgRating =
    displayedReviews.length > 0
      ? displayedReviews.reduce((s, r) => s + r.rating, 0) /
      displayedReviews.length /
      2
      : 0;

  const sortedReviews = useMemo(() => {
    const copy = [...displayedReviews];
    if (sortOrder === "most-recent")
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    if (sortOrder === "highest") return copy.sort((a, b) => b.rating - a.rating);
    if (sortOrder === "lowest") return copy.sort((a, b) => a.rating - b.rating);
    return copy;
  }, [displayedReviews, sortOrder]);

  const hasMore = displayedReviews.length < total;

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await listReviewsByProductClient(productId, {
        page: page + 1,
        limit: 20,
      });
      setDisplayedReviews((prev) => [...prev, ...res.data]);
      setPage((p) => p + 1);
      setTotal(res.total);
    } finally {
      setLoadingMore(false);
    }
  }

  function openForm() {
    setFormSuccess(false);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setFormRating(0);
    setHoveredRating(0);
    setFormContent("");
    setFormName("");
    setFormEmail("");
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (formRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    setFormSubmitting(true);
    setFormError(null);
    try {
      await createReview(productId, {
        rating: formRating * 2,
        content: formContent,
        displayName: formName,
        email: formEmail,
      });
      closeForm();
      setFormSuccess(true);
    } catch {
      setFormError("Failed to submit your review. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-secondary)",
    fontSize: "13px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 10px",
    width: "100%",
    color: "var(--color-foreground-dark)",
    backgroundColor: "var(--color-input)",
    outline: "none",
  };

  return (
    <div
      className="mt-6 border-t pt-6"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Header row: "REVIEWS" left + aggregate stars + chevron right */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="font-sans text-[13px] uppercase tracking-[0.3px]"
          style={{ color: "var(--color-foreground-dark)" }}
        >
          Reviews
        </h2>
        {displayedReviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={avgRating} size={14} />
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="var(--color-foreground-dark)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}
      </div>

      {/* Summary row: star + score + count inline, Write a review button right */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2" style={{ fontSize: "32px" }}>
          <Star
            aria-hidden="true"
            style={{ flexShrink: 0, width: "1em", height: "1em" }}
            fill="var(--color-star)"
            stroke="var(--color-star)"
          />
          {displayedReviews.length > 0 ? (
            <>
              <span
                style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "32px",
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                  color: "var(--color-foreground-strong)",
                  marginLeft: "8px",
                  lineHeight: 1,
                }}
              >
                {avgRating.toFixed(1)} / 5
              </span>
              <span
                style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "12px",
                  letterSpacing: "0.3px",
                  color: "rgb(156,156,156)",
                }}
              >
                Based on {total} {total === 1 ? "review" : "reviews"}
              </span>
            </>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "12px",
                color: "rgb(156,156,156)",
              }}
            >
              No reviews yet
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={formOpen ? closeForm : openForm}
          className="w-full sm:w-auto sm:shrink-0"
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.3px",
            backgroundColor: "var(--color-primary)",
            color: "#ffffff",
            border: "2px solid var(--color-primary)",
            borderRadius: "4px",
            padding: "8px 32px",
            cursor: "pointer",
            transition: "var(--transition-base)",
            whiteSpace: "nowrap",
            lineHeight: "14px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          }}
        >
          {formOpen ? "Cancel review" : "Write a review"}
        </button>
      </div>

      {/* Sort dropdown */}
      {displayedReviews.length > 0 && (
        <div className="flex items-center gap-1 mb-2 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
          <div className="relative inline-flex items-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "14px",
                letterSpacing: "normal",
                color: "rgb(0,0,0)",
                background: "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
                padding: "4px 20px 4px 0px",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              <option value="most-recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="var(--color-foreground-dark)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", right: 0, pointerEvents: "none" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      )}

      {/* Success message */}
      {formSuccess && (
        <div
          className="mb-4 px-4 py-3 text-[13px]"
          style={{
            fontFamily: "var(--font-secondary)",
            backgroundColor: "var(--color-status-success-bg)",
            color: "var(--color-status-success-fg)",
            border: "1px solid var(--color-border)",
          }}
        >
          Thanks! Your review has been submitted and is pending approval.
        </div>
      )}

      {/* Inline write review form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mb-6 pt-4 border-t"
          style={{ borderColor: "var(--color-border-light)", borderRadius: '24px' }}
        >
          <p
            className="text-[14px] uppercase tracking-[0.3px] font-sans"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            Write a Review
          </p>

          {/* Star picker */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[12px] uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Rating
            </label>
            <div
              className="flex gap-1"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormRating(n)}
                  onMouseEnter={() => setHoveredRating(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="p-0.5"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <StarIcon filled={n <= (hoveredRating || formRating)} />
                </button>
              ))}
            </div>
          </div>

          {/* Review content */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[12px] uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Review
            </label>
            <textarea
              rows={4}
              required
              placeholder="Share your experience..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[12px] uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Display Name
            </label>
            <input
              type="text"
              required
              placeholder="Jane D."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[12px] uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          {formError && (
            <p
              className="text-[12px]"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-destructive)",
              }}
            >
              {formError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeForm}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={formSubmitting}
            >
              {formSubmitting ? "Submitting…" : "Submit Review"}
            </Button>
          </div>
        </form>
      )}

      {/* Review list */}
      <div>
        {sortedReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="primary"
            size="base"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
