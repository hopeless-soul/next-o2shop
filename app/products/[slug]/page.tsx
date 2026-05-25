"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_PRODUCTS, MOCK_REVIEWS } from "@/lib/mock-data";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import VariantPicker from "@/components/products/VariantPicker";
import ReviewItem from "@/components/products/ReviewItem";
import StarRating from "@/components/ui/StarRating";
import Skeleton from "@/components/ui/Skeleton";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug) ?? MOCK_PRODUCTS[0];

  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors[0]?.name ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading] = useState(false);

  const avgRating =
    MOCK_REVIEWS.reduce((acc, r) => acc + r.rating, 0) / MOCK_REVIEWS.length;

  const mainBg =
    product.colors.find((c) => c.name === selectedColor)?.hex ??
    product.colors[0]?.hex ??
    "#e8e8e8";

  return (
    <div style={{ paddingTop: "var(--header-height-desktop)" }}>
      {/* Breadcrumbs */}
      <div
        className="py-4 border-b"
        style={{
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
          borderColor: "var(--color-border-light)",
        }}
      >
        <p
          className="text-[12px] uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-secondary)",
            color: "var(--color-foreground-subtle)",
          }}
        >
          <Link
            href="/"
            className="hover:opacity-70"
            style={{ transition: "var(--transition-nav)" }}
          >
            Home
          </Link>
          {" / "}
          <Link
            href="/products"
            className="hover:opacity-70"
            style={{ transition: "var(--transition-nav)" }}
          >
            {product.type}s
          </Link>
          {" / "}
          <span style={{ color: "var(--color-foreground-dark)" }}>{product.title}</span>
        </p>
      </div>

      {/* Main layout */}
      <div
        className="flex flex-col md:flex-row gap-0"
        style={{
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
          paddingTop: "var(--space-10)",
          paddingBottom: "var(--space-10)",
        }}
      >
        {/* ── Left: image gallery (60%) ── */}
        <div className="md:w-[60%] md:pr-10 flex flex-col gap-3">
          {/* Main image */}
          {loading ? (
            <Skeleton className="w-full rounded-none" style={{ aspectRatio: "4/5" }} />
          ) : (
            <div
              className="w-full flex items-center justify-center"
              style={{
                aspectRatio: "4/5",
                backgroundColor: mainBg,
                opacity: 0.45,
                position: "relative",
              }}
            >
              <span
                className="font-sans text-[13px] uppercase tracking-widest opacity-50"
                style={{
                  color: "var(--color-foreground)",
                  position: "absolute",
                }}
              >
                {product.title}
              </span>
            </div>
          )}

          {/* Thumbnail strip */}
          <div className="flex gap-2">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="rounded-none"
                    style={{ width: "80px", height: "100px" }}
                  />
                ))
              : [mainBg, "#d0d0d0", "#b8b8b8"].map((bg, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="flex-shrink-0"
                    style={{
                      width: "80px",
                      height: "100px",
                      backgroundColor: bg,
                      opacity: selectedImage === i ? 1 : 0.5,
                      border:
                        selectedImage === i
                          ? "2px solid var(--color-foreground-dark)"
                          : "2px solid transparent",
                      transition: "var(--transition-base)",
                    }}
                  />
                ))}
          </div>
        </div>

        {/* ── Right: product info (40%) ── */}
        <div className="md:w-[40%] flex flex-col gap-5 md:pl-4">
          {loading ? (
            <>
              <Skeleton className="h-10 w-3/4 rounded-none" />
              <Skeleton className="h-6 w-1/4 rounded-none" />
              <Skeleton className="h-24 w-full rounded-none" />
              <Skeleton className="h-14 w-full rounded-none" />
            </>
          ) : (
            <>
              {/* Badge */}
              {product.badge && <Badge variant={product.badge} />}

              {/* Title */}
              <h1
                className="font-sans uppercase leading-tight"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.6rem)",
                  letterSpacing: "0.84px",
                  color: "var(--color-foreground-strong)",
                  textTransform: "capitalize",
                }}
              >
                {product.title}
              </h1>

              {/* Price + rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {product.originalPrice && (
                    <span
                      className="font-sans text-[16px] line-through opacity-50"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      ${product.originalPrice}
                    </span>
                  )}
                  <span
                    className="font-sans text-[22px] tracking-[0.44px]"
                    style={{ color: "var(--color-foreground-dark)" }}
                  >
                    ${product.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={avgRating} size={14} />
                  <span
                    className="text-[12px]"
                    style={{
                      fontFamily: "var(--font-secondary)",
                      color: "var(--color-foreground-subtle)",
                    }}
                  >
                    ({MOCK_REVIEWS.length})
                  </span>
                </div>
              </div>

              {/* Variants */}
              <VariantPicker
                colors={product.colors}
                sizes={product.sizes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColorChange={setSelectedColor}
                onSizeChange={setSelectedSize}
              />

              {/* ATC button */}
              <button
                className="w-full font-sans text-[13px] uppercase tracking-widest text-primary-foreground flex items-center justify-center"
                style={{
                  height: "var(--atc-height)",
                  backgroundColor: "var(--color-primary)",
                  borderRadius: "var(--radius-base)",
                  transition: "var(--transition-base)",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
              >
                Add to Cart
              </button>

              {/* Description */}
              <p
                className="text-sm leading-6"
                style={{
                  fontFamily: "var(--font-secondary)",
                  color: "var(--color-foreground)",
                }}
              >
                {product.description}
              </p>

              {/* Details accordion */}
              <div className="border-t" style={{ borderColor: "var(--color-border)" }}>
                {[
                  { label: "Product Details", items: product.details },
                  { label: "Shipping & Returns", items: ["Free shipping on orders over $75", "Free 30-day returns"] },
                  { label: "Care Instructions", items: ["Machine wash cold", "Tumble dry low", "Do not iron print"] },
                ].map((section) => (
                  <details
                    key={section.label}
                    className="border-b"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <summary
                      className="flex items-center justify-between py-4 cursor-pointer font-sans text-[13px] uppercase tracking-widest list-none"
                      style={{ color: "var(--color-foreground-dark)" }}
                    >
                      {section.label}
                      <span className="text-lg opacity-50">+</span>
                    </summary>
                    <ul className="pb-4 pl-1 flex flex-col gap-1">
                      {section.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm"
                          style={{
                            fontFamily: "var(--font-secondary)",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          — {item}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Reviews ── */}
      <div
        className="border-t py-10"
        style={{
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-sans text-[18px] uppercase tracking-[0.36px]"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            Reviews
          </h2>
          <div className="flex items-center gap-3">
            <StarRating rating={avgRating} size={16} />
            <span
              className="text-[14px]"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground-subtle)",
              }}
            >
              {avgRating.toFixed(1)} / 5 &nbsp;·&nbsp; {MOCK_REVIEWS.length} reviews
            </span>
          </div>
        </div>

        <div className="max-w-2xl">
          {MOCK_REVIEWS.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>

        <Button variant="ghost" size="base" className="mt-8">
          Write a Review
        </Button>
      </div>
    </div>
  );
}
