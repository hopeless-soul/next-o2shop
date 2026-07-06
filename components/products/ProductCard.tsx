"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
  hoverZones?: number;
}

const PLACEHOLDER_COLORS = [
  "#e8e8e8",
  "#d0d0d0",
  "#c0c0c0",
];

const MAX_HOVER_ZONES = 4;
const DEFAULT_HOVER_ZONES = 3;

export default function ProductCard({ product, hoverZones }: ProductCardProps) {
  const [activeZone, setActiveZone] = useState<number | null>(null);

  const photos    = product.photos ?? [];
  const mainPhoto = product.primaryPhoto ?? null;

  // Distinct pictures actually available for this product (main + extra photos)
  const availablePhotoIds = new Set(
    [mainPhoto?.id, ...photos.map(p => p.id)].filter((id): id is string => Boolean(id))
  );

  const zoneCount = Math.max(
    0,
    Math.min(hoverZones ?? DEFAULT_HOVER_ZONES, MAX_HOVER_ZONES, availablePhotoIds.size)
  );

  const hoverPhotos = Array.from({ length: zoneCount }, (_, i) =>
    photos.find(p => p.sortOrder === i + 1) ?? mainPhoto
  );

  // Color fallbacks — used only when mainPhoto is absent
  const mainBg  = product.variants[0]?.colorValue ?? PLACEHOLDER_COLORS[0];
  const hoverBg = product.variants[1]?.colorValue ?? PLACEHOLDER_COLORS[1];

  // Badge
  const badge: "sale" | "new" | "sold-out" | undefined = !product.available
    ? "sold-out"
    : product.compareAtPrice && product.compareAtPrice < product.basePrice
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
                className="font-sans text-[11px] uppercase tracking-widest opacity-30 text-foreground"
              >
                {product.currency}
              </span>
            </div>
            {/* Color hover overlay (fallback path only) */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: hoverBg,
                opacity: activeZone !== null ? 0.5 : 0,
                transition: "var(--transition-nav)",
              }}
            />
          </>
        )}

        {/* Hover zone overlays */}
        {hoverPhotos.map((hoverPhoto, i) =>
          hoverPhoto && (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity: activeZone === i ? 1 : 0,
                transition: "var(--transition-nav)",
              }}
            >
              <Image
                src={hoverPhoto.url}
                alt={hoverPhoto.altText ?? product.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          )
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 md:scale-120 md:top-4 md:left-4 z-10 capitalize">
            <Badge variant={badge}> {badge} </Badge>
          </div>
        )}

        {/* Hover zones */}
        {Array.from({ length: zoneCount }, (_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 z-20 cursor-pointer"
            style={{ left: `${(i * 100) / zoneCount}%`, width: `${100 / zoneCount}%` }}
            onMouseEnter={() => setActiveZone(i)}
            onMouseLeave={() => setActiveZone(null)}
          />
        ))}
      </div>

      {/* Product details */}
      <div
        className="flex flex-col gap-[2px] p-[var(--space-5)]"
      >
        {/* Title + price row */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-sans text-[16px] font-medium uppercase tracking-[0.32px] leading-tight flex-1 text-foreground-dark"
            style={{ transition: "var(--transition-slow)" }}
          >
            {product.displayName}
          </h3>
          <span
            className="font-sans text-[16px] font-medium uppercase tracking-[0.3px] whitespace-nowrap text-foreground-dark"
            style={{ transition: "var(--transition-slow)" }}
          >
            {product.compareAtPrice && (
              <span className="line-through opacity-50 mr-1.5">
                ${product.basePrice}
              </span>
            )}
            ${product.compareAtPrice ? product.compareAtPrice : product.basePrice}
          </span>
        </div>

        {/* Description row (Category + Currency) */}
        <div className="flex items-center justify-between">
          <span
            className="text-[12px] tracking-[0.3px] font-secondary text-foreground-subtle"
          >
            {product.type}
          </span>
          <span
            className="text-[12px] tracking-[0.3px] font-secondary text-foreground-subtle"
          >
            {product.currency}
          </span>
        </div>
      </div>
    </Link>
  );
}
