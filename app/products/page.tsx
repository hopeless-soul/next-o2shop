"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);

  return (
    <div
      style={{ paddingTop: "var(--header-height-desktop)" }}
    >
      {/* Page header */}
      <div
        className="flex items-end justify-between py-6 border-b"
        style={{
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
          borderColor: "var(--color-border)",
        }}
      >
        <div>
          <p
            className="text-[12px] uppercase tracking-widest mb-1"
            style={{
              fontFamily: "var(--font-secondary)",
              color: "var(--color-foreground-subtle)",
            }}
          >
            <Link href="/" className="hover:opacity-70" style={{ transition: "var(--transition-nav)" }}>
              Home
            </Link>
            {" / "}
            <span>Hats</span>
          </p>
          <h1
            className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            Hats
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="text-[13px]"
            style={{
              fontFamily: "var(--font-secondary)",
              color: "var(--color-foreground-subtle)",
            }}
          >
            {MOCK_PRODUCTS.length} products
          </span>
          {/* Skeleton toggle for demo */}
          <button
            onClick={() => setLoading((v) => !v)}
            className="font-sans text-[11px] uppercase tracking-widest px-3 py-1.5 border hover:opacity-70"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-foreground-muted)",
              transition: "var(--transition-base)",
            }}
          >
            {loading ? "Show Products" : "Show Skeleton"}
          </button>
        </div>
      </div>

      {/* Filter strip placeholder */}
      <div
        className="flex items-center gap-3 py-4 border-b overflow-x-auto"
        style={{
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
          borderColor: "var(--color-border)",
        }}
      >
        {["All", "Beanies", "Snapbacks", "Bucket Hats", "Dad Caps"].map(
          (f) => (
            <button
              key={f}
              className="flex-shrink-0 font-sans text-[12px] uppercase tracking-widest px-4 py-2 border hover:opacity-70"
              style={{
                borderColor: f === "All" ? "var(--color-foreground-dark)" : "var(--color-border)",
                backgroundColor: f === "All" ? "var(--color-foreground-dark)" : "transparent",
                color: f === "All" ? "var(--color-on-dark)" : "var(--color-foreground)",
                transition: "var(--transition-base)",
              }}
            >
              {f}
            </button>
          )
        )}
      </div>

      {/* Product grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: "2px", padding: "2px" }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
}
