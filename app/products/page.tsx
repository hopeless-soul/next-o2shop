import Link from "next/link";
import { listProducts } from "@/lib/api/products";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  let result: Awaited<ReturnType<typeof listProducts>> | null = null;
  try {
    result = await listProducts({ categorySlug: category, search: q, limit: 20 });
  } catch {
    // API unreachable — show empty grid
  }

  const products = result?.data ?? [];
  const total = result?.total ?? 0;

  const pageTitle = category
    ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : q
      ? `Search: "${q}"`
      : "All Products";

  return (
    <div style={{ paddingTop: "var(--header-height-desktop)" }}>
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
            <span>{pageTitle}</span>
          </p>
          <h1
            className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            {pageTitle}
          </h1>
        </div>
        <span
          className="text-[13px]"
          style={{
            fontFamily: "var(--font-secondary)",
            color: "var(--color-foreground-subtle)",
          }}
        >
          {total} products
        </span>
      </div>

      {/* Filter strip placeholder - Depriicated */}
      {/* <div
        className="flex items-center gap-3 py-4 border-b overflow-x-auto"
        style={{
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
          borderColor: "var(--color-border)",
        }}
      >
        {[
          { label: "All", slug: undefined },
          { label: "Beanies", slug: "beanies" },
          { label: "Snapbacks", slug: "snapbacks" },
          { label: "Bucket Hats", slug: "bucket-hats" },
          { label: "Dad Caps", slug: "dad-caps" },
        ].map((f) => {
          const active = f.slug ? category === f.slug : !category;
          return (
            <Link
              key={f.label}
              href={f.slug ? `/products?category=${f.slug}` : "/products"}
              className="flex-shrink-0 font-sans text-[12px] uppercase tracking-widest px-4 py-2 border hover:opacity-70"
              style={{
                borderColor: active ? "var(--color-foreground-dark)" : "var(--color-border)",
                backgroundColor: active ? "var(--color-foreground-dark)" : "transparent",
                color: active ? "var(--color-on-dark)" : "var(--color-foreground)",
                transition: "var(--transition-base)",
              }}
            >
              {f.label}
            </Link>
          );
        })}
      </div> */}

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "2px", padding: "2px" }}>
        {result === null
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.length > 0
            ? products.map((product) => <ProductCard key={product.id} product={product} />)
            : Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
