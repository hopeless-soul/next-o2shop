import Link from "next/link";
import { listProducts } from "@/lib/api/products";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subcategory?: string; q?: string, sale?: boolean }>;
}) {
  const { category, subcategory, q, sale } = await searchParams;

  let result: Awaited<ReturnType<typeof listProducts>> | null = null;
  try {
    result = await listProducts({ categorySlug: category, subCategorySlug: subcategory, onSale: sale, search: q, limit: 20 });
  } catch {
    // API unreachable — show empty grid
  }

  const products = result?.data ?? [];
  const total = result?.total ?? 0;

  const pageTitle = category
    ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : subcategory
      ? subcategory.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : q
        ? `Search: "${q}"`
        : sale
          ? "On Sale"
          : "All Products";

  return (
    <div className="pt-[var(--header-height-desktop)]">
      {/* Page header */}
      <div
        className="flex items-end justify-between py-6 border-b px-[var(--header-px-desktop)] border-border"
      >
        <div>
          <p
            className="text-[12px] uppercase tracking-widest mb-1 font-secondary text-foreground-subtle"
          >
            <Link href="/" className="hover:opacity-70" style={{ transition: "var(--transition-nav)" }}>
              Home
            </Link>
            {" / "}
            <span>{pageTitle}</span>
          </p>
          <h1
            className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none text-foreground-dark"
          >
            {pageTitle}
          </h1>
        </div>
        <span
          className="text-[13px] font-secondary text-foreground-subtle"
        >
          {total} products
        </span>
      </div>

      {/* Product grid */}
      {result !== null && products.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 gap-3 px-[var(--header-px-desktop)]"
        >
          <p
            className="text-[28px] uppercase tracking-[0.56px] leading-none font-sans text-foreground-dark"
          >
            No products found
          </p>
          <p
            className="text-[13px] font-secondary text-foreground-subtle"
          >
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "2px", padding: "2px" }}>
          {result === null
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
