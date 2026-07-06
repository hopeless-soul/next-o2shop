function toTitleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Priority order: category > subcategory > search query > sale flag > default.
export function getProductsPageTitle({
  category,
  subcategory,
  q,
  sale,
}: {
  category?: string;
  subcategory?: string;
  q?: string;
  sale?: boolean;
}) {
  if (category) return toTitleCase(category);
  if (subcategory) return toTitleCase(subcategory);
  if (q) return `Search: "${q}"`;
  if (sale) return "On Sale";
  return "All Products";
}
