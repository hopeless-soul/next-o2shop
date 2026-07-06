function normalizeSkuSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Mirrors the backend's `generateSku` in nest-o2shop/src/products/products.service.ts
 * exactly, so the SKU shown in the admin UI matches what the server would generate
 * if the SKU field is left on auto (i.e. not manually overridden).
 */
export function generateSkuPreview(productName: string, colorName: string, size: string): string {
  return [productName, colorName, size].map(normalizeSkuSegment).join('-')
}
