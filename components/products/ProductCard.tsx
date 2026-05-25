"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import Badge from "@/components/ui/Badge";

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

  const mainBg = product.colors[0]?.hex ?? "#e8e8e8";
  const hoverBg = product.colors[1]?.hex ?? PLACEHOLDER_COLORS[1];

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      {/* Image wrapper — 4:5 ratio */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
        {/* Main image placeholder */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: mainBg, opacity: 0.35 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-sans text-[11px] uppercase tracking-widest opacity-30"
            style={{ color: "var(--color-foreground)" }}
          >
            {product.type}
          </span>
        </div>

        {/* Hover image placeholder */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: hoverBg,
            opacity: activeZone ? 0.5 : 0,
            transition: "var(--transition-nav)",
          }}
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={product.badge} />
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
            {product.title}
          </h3>
          <span
            className="font-sans text-[16px] font-medium uppercase tracking-[0.3px] whitespace-nowrap"
            style={{
              color: "var(--color-foreground-dark)",
              transition: "var(--transition-slow)",
            }}
          >
            {product.originalPrice && (
              <span className="line-through opacity-50 mr-1.5 text-[14px]">
                ${product.originalPrice}
              </span>
            )}
            ${product.price}
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
            USD
          </span>
        </div>
      </div>
    </Link>
  );
}
