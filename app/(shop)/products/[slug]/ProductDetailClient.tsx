"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Product, Review, ProductColor, ProductSize, ProductVariant } from "@/lib/types";
import VariantPicker from "@/components/products/VariantPicker";
import StarRating from "@/components/ui/StarRating";
import ReviewsBlock from "./ReviewsBlock";
import { CircleCheck, Star } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { cn } from "@/lib/utils";
import { createSplashEffect } from "@/lib/effects/splash";

interface Props {
  product: Product;
  reviews: Review[];
  totalReviews: number;
}

function dedupeSizes(variants: ProductVariant[]): ProductSize[] {
  return variants.reduce<ProductSize[]>((acc, v) => {
    if (!acc.find((s) => s.label === v.size)) {
      acc.push({ label: v.size, available: v.available });
    }
    return acc;
  }, []);
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

  const defaultVariant = product.variants.find(
    (v) => v.id === product.defaultVariant?.id,
  );

  // First color (in array order) that has at least one available size —
  // guarantees a purchasable default when defaultVariant is missing/out of stock.
  const fallbackColorName =
    uniqueColors.find((c) =>
      dedupeSizes(product.variants.filter((v) => v.colorName === c.name)).some((s) => s.available),
    )?.name ?? uniqueColors[0]?.name ?? null;

  const fallbackSizeLabel = fallbackColorName
    ? dedupeSizes(product.variants.filter((v) => v.colorName === fallbackColorName)).find(
      (s) => s.available,
    )?.label ?? null
    : null;

  const defaultColorName = defaultVariant?.available ? defaultVariant.colorName : fallbackColorName;
  const defaultSizeLabel =
    defaultVariant?.available && defaultVariant.colorName === defaultColorName
      ? defaultVariant.size
      : fallbackSizeLabel;

  const [selectedColor, setSelectedColor] = useState<string | null>(defaultColorName);
  const [selectedSize, setSelectedSize] = useState<string | null>(defaultSizeLabel);
  const [selectedImage, setSelectedImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    };
  }, []);

  const uniqueSizes: ProductSize[] = dedupeSizes(
    selectedColor ? product.variants.filter((v) => v.colorName === selectedColor) : product.variants,
  );

  // ratings are 1–10 in API; normalise to 0–5 for StarRating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length / 2
      : 0;

  const mainBg =
    product.variants.find((v) => v.colorName === selectedColor)?.colorValue ??
    product.variants[0]?.colorValue ??
    "#e8e8e8";

  // Photos: thumbnail strip excludes sortOrder -1; sorted ascending
  const photos = product.photos ?? (product.primaryPhoto ? [{ ...product.primaryPhoto!, sortOrder: 0, width: product.primaryPhoto?.width ?? 0, height: product.primaryPhoto?.height ?? 0, aspectRatio: product.primaryPhoto?.aspectRatio ?? 0.8, variantIds: [] }] : []);
  const thumbnailPhotos = photos
    .filter(p => p.sortOrder !== -1)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const accentPhoto = product.featuredPhoto ?? null;
  const displayedPhoto = thumbnailPhotos[selectedImage] ?? null;

  const descBlocks = product.description?.blocks ?? [];

  const productType = product.type ?? product.category?.displayName;

  function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
    if (!selectedColor || !selectedSize) return;
    const variant = product.variants.find(
      (v) => v.colorName === selectedColor && v.size === selectedSize,
    );
    if (!variant || !variant.available) return;

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.displayName,
      variantSku: variant.sku,
      colorName: variant.colorName,
      size: variant.size,
      unitPrice: variant.priceOverride ?? product.basePrice,
      quantity: 1,
      imageUrl:
        variant.featuredImage?.url ??
        product.primaryPhoto?.url ??
        undefined,
    });

    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    setJustAdded(true);
    createSplashEffect(e.currentTarget, "var(--color-accent)", 14);
    addedTimeoutRef.current = setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className="pt-[var(--header-height-desktop)]" style={{ marginTop: 8 }}>
      {/* Main layout */}
      <div
        className="flex flex-col md:flex-row"
        style={{
          paddingTop: "var(--space-10)",
          paddingBottom: "var(--space-10)",
        }}
      >
        {/* Left: image gallery */}
        <div className="md:w-1/2 md:h-screen">
          <div className="flex flex-col md:flex-row md:h-full gap-2 md:gap-1">

            {/* Thumbnails — 3-col grid on mobile, scrollable vertical strip on desktop */}
            <div
              className="order-2 md:order-1 grid grid-cols-3 md:grid-cols-1 auto-rows-max gap-2 md:gap-1 md:w-[17%] md:min-h-0 md:overflow-y-auto md:pl-2"
              style={{ scrollbarWidth: "none" }}
            >
              {thumbnailPhotos.length > 0 ? (
                thumbnailPhotos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "w-full aspect-[4/5] relative overflow-hidden",
                      selectedImage === i ? "border-2 border-foreground-dark" : "border-2 border-transparent"
                    )}
                    style={{
                      transition: "var(--transition-base)",
                      cursor: "pointer",
                    }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.altText ?? product.displayName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))
              ) : (
                // Color fallback when no photos
                [mainBg, "#d0d0d0", "#b8b8b8", "#b8b8b8", "#b8b8b8"].map((bg, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "w-full aspect-[4/5]",
                      selectedImage === i ? "border-2 border-foreground-dark" : "border-2 border-transparent"
                    )}
                    style={{
                      backgroundColor: bg,
                      opacity: selectedImage === i ? 1 : 0.5,
                      transition: "var(--transition-base)",
                      cursor: "pointer",
                    }}
                  />
                ))
              )}
            </div>

            {/* Main image — aspect ratio on mobile, fills container height on desktop */}
            <div
              className="order-1 md:order-2 flex-1 aspect-[4/5] md:aspect-auto md:h-full relative flex items-center justify-center"
              style={{ backgroundColor: mainBg }}
            >
              {displayedPhoto ? (
                <Image
                  src={displayedPhoto.url}
                  alt={displayedPhoto.altText ?? product.displayName}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <span
                  className="font-sans text-[13px] uppercase tracking-widest opacity-50 absolute text-foreground"
                >
                  {product.displayName}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Right: product info */}
        <div
          className="md:w-1/2 flex flex-col gap-5 mt-8 md:mt-10 px-4 sm:px-10 md:pl-10 md:pr-10"
        >
          {/* {badge && <Badge variant={badge} className="self-start" />} */}
          <div className="flex gap-2">
            <div>
              <p
                className="font-secondary"
                style={{
                  fontSize: "16px",
                  fontWeight: '600',
                  lineHeight: '24px',
                  color: '#9c9c9c',
                }}
              >
                {productType}
              </p>
              <h1
                className="font-sans uppercase leading-tight text-foreground-strong"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.6rem)",
                  letterSpacing: "0.84px",
                  textTransform: "capitalize",
                  WebkitTextStroke: '1.4px var(--color-foreground-strong)'
                }}
              >
                {product.displayName}
              </h1>
            </div>
            {accentPhoto && (
              <Image
                src={accentPhoto.url}
                alt={accentPhoto.altText ?? product.displayName}
                width={accentPhoto.width || 64}
                height={accentPhoto.height || 80}
                className="flex-shrink-0 object-cover"
                style={{ height: 80, width: "auto" }}
              />
            )}
          </div>

          {/* Header Reviews */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} size={18} />
              <a
                href='#reviewBlock'
                className="text-[14px] underline font-secondary text-foreground-subtle"
                style={{
                  lineHeight: '16px',
                  fontWeight: '500',
                  textUnderlineOffset: '3px',
                }}
              >
                {reviews.length} reviews
              </a>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {descBlocks.map((desc, i) => {
              if (desc.type === "text") {
                return (
                  <p
                    key={i}
                    className="text-xs leading-6 font-secondary text-foreground"
                  >
                    {desc.content}
                  </p>
                );
              }

              if (desc.type === "points") {
                return <ul
                  key={i}
                  className="flex flex-col gap-2"
                  style={{
                    listStyle: 'none',
                    paddingLeft: '10px',
                  }}
                >
                  {
                    desc.items.map((point) => (
                      <li
                        key={point}
                        className="text-sm flex gap-4 font-secondary text-foreground-muted"
                      >
                        <Star
                          aria-hidden="true"
                          style={{ flexShrink: 0, width: "1.2em", height: "1.2em" }}
                          fill="var(--color-star)"
                          stroke="var(--color-star)"
                        />
                        <span>
                          {point}
                        </span>
                      </li>
                    ))
                  }
                </ul>
              }
              return null;
            })}
          </div>

          {/* Variant picker */}
          <VariantPicker
            colors={uniqueColors}
            sizes={uniqueSizes}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onColorChange={setSelectedColor}
            onSizeChange={setSelectedSize}
          />

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize}
            className={cn(
              "atc-button w-full font-sans text-[24px] uppercase tracking-widest text-primary-foreground flex items-center",
              justAdded && "atc-added",
            )}
            style={{
              justifyContent: 'space-between',
              height: "var(--atc-height)",
              borderRadius: "var(--radius-base)",
              transition: "var(--transition-base)",
              border: "none",
              cursor: !selectedColor || !selectedSize ? "not-allowed" : "pointer",
              opacity: !selectedColor || !selectedSize ? 0.6 : 1,
              WebkitTextStroke: '0.6px white',
              padding: '20px',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <span className="tracking-[0.44px]">
              {justAdded ? "Added to Cart" : "Add to Cart"}
            </span>
            {justAdded ? (
              <CircleCheck size={26} aria-hidden="true" />
            ) : (
              <span className="flex gap-2">
                <span className="font-sans text-[24px] tracking-[0.44px]">
                  ${product.compareAtPrice ? product.compareAtPrice : product.basePrice}
                </span>
                {product.compareAtPrice != null && (
                  <span
                    className="atc-compare-price font-sans text-[24px] tracking-[0.44px] line-through opacity-50"
                  >${product.basePrice}</span>
                )}
              </span>
            )}
          </button>

          {/* Reviews */}
          <div id="reviewBlock"></div>
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
