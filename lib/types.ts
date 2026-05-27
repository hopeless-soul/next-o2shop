// ── Navigation ────────────────────────────────────────────────────────────────

export type SubCategory = {
  id: string;
  slug: string;
  displayName: string;
  categoryId: string;
};

export type Category = {
  id: string;
  slug: string;
  displayName: string;
  subCategories: SubCategory[];
  createdAt: string;
  updatedAt: string;
};

export type Collection = {
  id: string;
  slug: string;
  displayName: string;
  description?: string;
  bannerImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Address ───────────────────────────────────────────────────────────────────

export type AddressDto = {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
  province: string;
  postalCode: string;
  phone?: string;
};

export type SavedAddress = {
  id: string;
  name: string;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  billingIsSameAsShipping: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Product ───────────────────────────────────────────────────────────────────

export type ProductPhoto = {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  width: number;
  height: number;
  aspectRatio: number;
  variantIds: string[];
};

export type ProductVariant = {
  id: string;
  productId: string;
  colorName: string;
  colorValue: string;
  size: string;
  sku: string;
  stock: number;
  available: boolean;
  priceOverride?: number;
  compareAtPrice?: number;
  weight?: number;
  inventoryPolicy: "deny" | "continue";
  quantityRule: { min: number; max: number | null; increment: number };
  barcode?: string;
  featuredImageId?: string;
  featuredImage?: ProductPhoto;
};

// UI adapter types — derived from variants at call sites (VariantPicker, ProductCard)
export type ProductColor = { name: string; hex: string; available: boolean };
export type ProductSize  = { label: string; available: boolean };

export type ProductDescriptionBlock =
  | { type: "text"; content: string }
  | { type: "points"; items: string[] };

export type Product = {
  id: string;
  name: string;
  displayName: string;
  basePrice: number;
  currency: string;
  available: boolean;
  priceMin: number;
  priceMax: number;
  priceVaries: boolean;
  compareAtPrice?: number;
  tags?: string[];
  description?: { blocks: ProductDescriptionBlock[] };
  rating: number;
  photos: ProductPhoto[];
  variants: ProductVariant[];
  collection?: Collection;
  category?: Category;
  subCategory?: SubCategory;
  type?: string
};

// ── Review ────────────────────────────────────────────────────────────────────

// rating is on a 1–10 scale (API). Normalise to 0–5 for StarRating: rating / 2
export type Review = {
  id: string;
  productId: string;
  userId?: string;
  displayName: string;
  rating: number;
  content: string;
  photoUrls: string[];
  createdAt: string;
};

// ── Order ─────────────────────────────────────────────────────────────────────

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productPrice: number;
  productCurrency: string;
  quantity: number;
  total: number;
};

export type OrderStatus =
  | "unfulfilled"
  | "fulfilled"
  | "partially_fulfilled"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Order = {
  id: string;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: OrderStatus;
  totalAmount: number;
  totalCurrency: string;
  shippingMethodName: string;
  shippingPrice: number;
  shippingCurrency: string;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  items: OrderItem[];
  createdAt: string;
};
