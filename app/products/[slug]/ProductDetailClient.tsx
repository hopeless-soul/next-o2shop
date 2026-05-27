"use client";

import { useState } from "react";
import type { Product, Review, ProductColor, ProductSize } from "@/lib/types";
import VariantPicker from "@/components/products/VariantPicker";
import StarRating from "@/components/ui/StarRating";
import ReviewsBlock from "./ReviewsBlock";

interface Props {
  product: Product;
  reviews: Review[];
  totalReviews: number;
}

export default function ProductDetailClient({ product, reviews, totalReviews }: Props) {
  const uniqueColors: ProductColor[] = product.variants.reduce<ProductColor[]>(
    (acc, v) => {
      if (!acc.find((c) => c.name === v.colorName)) {
        acc.push({ name: v.colorName, hex: v.colorValue, available: v.available });
      }
      return acc;
    },
    [],
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(
    uniqueColors[0]?.name ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const uniqueSizes: ProductSize[] = selectedColor
    ? product.variants
      .filter((v) => v.colorName === selectedColor)
      .reduce<ProductSize[]>((acc, v) => {
        if (!acc.find((s) => s.label === v.size)) {
          acc.push({ label: v.size, available: v.available });
        }
        return acc;
      }, [])
    : product.variants.reduce<ProductSize[]>((acc, v) => {
      if (!acc.find((s) => s.label === v.size)) {
        acc.push({ label: v.size, available: v.available });
      }
      return acc;
    }, []);

  // ratings are 1–10 in API; normalise to 0–5 for StarRating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length / 2
      : 0;

  const mainBg =
    product.variants.find((v) => v.colorName === selectedColor)?.colorValue ??
    product.variants[0]?.colorValue ??
    "#e8e8e8";

  const descBlocks = product.description?.blocks ?? [];
  const textBlock = descBlocks.find((b) => b.type === "text");
  const pointsBlock = descBlocks.find((b) => b.type === "points");
  const detailItems = pointsBlock?.type === "points" ? pointsBlock.items : [];

  return (
    <div style={{ paddingTop: "var(--header-height-desktop)", marginTop: 8 }}>
      {/* Breadcrumbs - Depricated*/}
      {/* <div
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
          <Link href="/" className="hover:opacity-70" style={{ transition: "var(--transition-nav)" }}>
            Home
          </Link>
          {" / "}
          <Link
            href="/products"
            className="hover:opacity-70"
            style={{ transition: "var(--transition-nav)" }}
          >
            {product.subCategory?.displayName ?? "Products"}
          </Link>
          {" / "}
          <span style={{ color: "var(--color-foreground-dark)" }}>{product.displayName}</span>
        </p>
      </div> */}

      {/* Main layout */}
      <div
        className="flex flex-col md:flex-row"
        style={{
          paddingTop: "var(--space-10)",
          paddingBottom: "var(--space-10)",
        }}
      >
        {/* ── Left: image gallery (50%) ── */}
        <div className="md:w-1/2 md:h-screen">
          <div className="flex flex-col md:flex-row md:h-full gap-2 md:gap-1">

            {/* Thumbnails — 3-col grid on mobile, scrollable vertical strip on desktop */}
            <div
              className="order-2 md:order-1 grid grid-cols-3 md:grid-cols-1 auto-rows-max gap-2 md:gap-1 md:w-[17%] md:min-h-0 md:overflow-y-auto md:pl-2"
              style={{ scrollbarWidth: "none" }}
            >
              {[mainBg, "#d0d0d0", "#b8b8b8", "#b8b8b8", "#b8b8b8", "#b8b8b8", "#b8b8b8", "#b8b8b8"].map((bg, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className="w-full aspect-[4/5]"
                  style={{
                    backgroundColor: bg,
                    opacity: selectedImage === i ? 1 : 0.5,
                    border: selectedImage === i
                      ? "2px solid var(--color-foreground-dark)"
                      : "2px solid transparent",
                    transition: "var(--transition-base)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {/* Main image — aspect ratio on mobile, fills container height on desktop */}
            <div
              className="order-1 md:order-2 flex-1 aspect-[4/5] md:aspect-auto md:h-full relative flex items-center justify-center"
              style={{ backgroundColor: mainBg, opacity: 0.45 }}
            >
              <span
                className="font-sans text-[13px] uppercase tracking-widest opacity-50 absolute"
                style={{ color: "var(--color-foreground)" }}
              >
                {product.displayName}
              </span>
            </div>

          </div>
        </div>

        {/* ── Right: product info (50%) ── */}
        <div
          className="md:w-1/2 flex flex-col gap-5 mt-8 md:mt-0 md:pr-10"
          style={{ paddingLeft: "var(--space-10)" }}
        >
          {/* {badge && <Badge variant={badge} className="self-start" />} */}
          <p>{product.type ?? 'Nice Hoodie'}</p>
          <h1
            className="font-sans uppercase leading-tight"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.6rem)",
              letterSpacing: "0.84px",
              color: "var(--color-foreground-strong)",
              textTransform: "capitalize",
              WebkitTextStroke: '1.4px var(--color-foreground-strong)'
            }}
          >
            {product.displayName}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.compareAtPrice && (
                <span
                  className="font-sans text-[16px] line-through opacity-50"
                  style={{ color: "var(--color-foreground)" }}
                >
                  ${product.compareAtPrice}
                </span>
              )}
              <span
                className="font-sans text-[22px] tracking-[0.44px]"
                style={{ color: "var(--color-foreground-dark)" }}
              >
                ${product.basePrice}
              </span>
            </div>
            {/* Header Reviews are depricated */}
            {/* {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={avgRating} size={14} />
                <span
                  className="text-[12px]"
                  style={{
                    fontFamily: "var(--font-secondary)",
                    color: "var(--color-foreground-subtle)",
                  }}
                >
                  ({reviews.length})
                </span>
              </div>
            )} */}
          </div>

          <VariantPicker
            colors={uniqueColors}
            sizes={uniqueSizes}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onColorChange={setSelectedColor}
            onSizeChange={setSelectedSize}
          />

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

          {textBlock?.type === "text" && (
            <p
              className="text-sm leading-6"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground)",
              }}
            >
              {textBlock.content}
            </p>
          )}

          <div className="border-t" style={{ borderColor: "var(--color-border)" }}>
            {[
              { label: "Product Details", items: detailItems },
              {
                label: "Shipping & Returns",
                items: ["Free shipping on orders over $75", "Free 30-day returns"],
              },
              {
                label: "Care Instructions",
                items: ["Machine wash cold", "Tumble dry low", "Do not iron print"],
              },
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

          {/* ── Reviews ── */}
          <ReviewsBlock
            productId={product.id}
            initialReviews={reviews}
            totalReviews={totalReviews}
          />
        </div>
      </div>
    </div>
  );
}
