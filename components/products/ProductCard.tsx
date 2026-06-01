"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_COLORS = [
  "#e8e8e8",
  "#d0d0d0",
  "#c0c0c0",
];

export default function ProductCard({ product }: ProductCardProps) {
  const [activeZone, setActiveZone] = useState<"left" | "right" | null>(null);

  const photos      = product.photos ?? [];
  const mainPhoto   = product.primaryPhoto ?? null;
  const hoverPhoto1 = photos.find(p => p.sortOrder === 1) ?? mainPhoto;
  const hoverPhoto2 = photos.find(p => p.sortOrder === 2) ?? mainPhoto;

  // Color fallbacks — used only when mainPhoto is absent
  const mainBg  = product.variants[0]?.colorValue ?? PLACEHOLDER_COLORS[0];
  const hoverBg = product.variants[1]?.colorValue ?? PLACEHOLDER_COLORS[1];

  const badge: "sale" | "new" | "sold-out" | undefined = !product.available
    ? "sold-out"
    : product.compareAtPrice && product.compareAtPrice > product.basePrice
    ? "sale"
    : product.tags?.includes("new")
    ? "new"
    : undefined;

  return (
    <Link href={`/products/${product.name}`} className="block group">
      {/* Image wrapper — 4:5 ratio */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
        {/* Main image */}
        {mainPhoto ? (
          <Image
            src={mainPhoto.url}
            alt={mainPhoto.altText ?? product.displayName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ backgroundColor: mainBg, opacity: 0.35 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-sans text-[11px] uppercase tracking-widest opacity-30"
                style={{ color: "var(--color-foreground)" }}
              >
                {product.currency}
              </span>
            </div>
            {/* Color hover overlay (fallback path only) */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: hoverBg,
                opacity: activeZone ? 0.5 : 0,
                transition: "var(--transition-nav)",
              }}
            />
          </>
        )}

        {/* Hover zone 1 overlay (left) */}
        {hoverPhoto1 && (
          <div
            className="absolute inset-0"
            style={{
              opacity: activeZone === "left" ? 1 : 0,
              transition: "var(--transition-nav)",
            }}
          >
            <Image
              src={hoverPhoto1.url}
              alt={hoverPhoto1.altText ?? product.displayName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        )}

        {/* Hover zone 2 overlay (right) */}
        {hoverPhoto2 && (
          <div
            className="absolute inset-0"
            style={{
              opacity: activeZone === "right" ? 1 : 0,
              transition: "var(--transition-nav)",
            }}
          >
            <Image
              src={hoverPhoto2.url}
              alt={hoverPhoto2.altText ?? product.displayName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={badge} />
          </div>
        )}

        {/* Hover zones */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-pointer"
          onMouseEnter={() => setActiveZone("left")}
          onMouseLeave={() => setActiveZone(null)}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 z-20 cursor-pointer"
          onMouseEnter={() => setActiveZone("right")}
          onMouseLeave={() => setActiveZone(null)}
        />
      </div>

      {/* Product details */}
      <div
        className="flex flex-col gap-[2px]"
        style={{ padding: "var(--space-5)" }}
      >
        {/* Title + price row */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-sans text-[16px] font-medium uppercase tracking-[0.32px] leading-tight flex-1"
            style={{
              color: "var(--color-foreground-dark)",
              transition: "var(--transition-slow)",
            }}
          >
            {product.displayName}
          </h3>
          <span
            className="font-sans text-[16px] font-medium uppercase tracking-[0.3px] whitespace-nowrap"
            style={{
              color: "var(--color-foreground-dark)",
              transition: "var(--transition-slow)",
            }}
          >
            {product.compareAtPrice && (
              <span className="line-through opacity-50 mr-1.5">
                ${product.basePrice}
              </span>
            )}
            ${product.compareAtPrice ? product.compareAtPrice : product.basePrice}
          </span>
        </div>

        {/* Sub row */}
        <div className="flex items-center justify-between">
          <span
            className="text-[12px] tracking-[0.3px]"
            style={{
              fontFamily: "var(--font-secondary)",
              color: "var(--color-foreground-subtle)",
            }}
          >
            {product.type}
          </span>
          <span
            className="text-[12px] tracking-[0.3px]"
            style={{
              fontFamily: "var(--font-secondary)",
              color: "var(--color-foreground-subtle)",
            }}
          >
            {product.currency}
          </span>
        </div>
      </div>
    </Link>
  );
}
