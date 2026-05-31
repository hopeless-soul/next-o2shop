import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/api/products";
import { listReviewsByProduct } from "@/lib/api/reviews-server";
import { NotFoundError } from "@/lib/api/errors";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const reviewsResult = await listReviewsByProduct(product.id, { limit: 20 });

  return (
    <ProductDetailClient
      product={product}
      reviews={reviewsResult.data}
      totalReviews={reviewsResult.total}
    />
  );
}
