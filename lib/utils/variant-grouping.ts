const LETTER_SIZE_ORDER = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

export function compareSizes(a: string, b: string): number {
  const aNum = Number(a)
  const bNum = Number(b)
  const aIsNum = !isNaN(aNum)
  const bIsNum = !isNaN(bNum)
  if (aIsNum && bIsNum) return aNum - bNum
  if (aIsNum) return -1
  if (bIsNum) return 1
  const aIdx = LETTER_SIZE_ORDER.indexOf(a.toUpperCase())
  const bIdx = LETTER_SIZE_ORDER.indexOf(b.toUpperCase())
  if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx
  if (aIdx >= 0) return -1
  if (bIdx >= 0) return 1
  return a.localeCompare(b)
}

export function sortVariants<T extends { colorName: string; size: string }>(vs: T[]): T[] {
  return [...vs].sort((a, b) => {
    const c = a.colorName.localeCompare(b.colorName)
    return c !== 0 ? c : compareSizes(a.size, b.size)
  })
}

export type ColorGroup<T> = {
  colorName: string
  colorValue: string
  variants: T[]
  totalStock: number
}

type GroupableVariant = { colorName: string; colorValue: string; size: string; stock?: number | null }

/**
 * Groups already-sorted-by-color variants into per-color buckets, in the same
 * alphabetical-color / size-ordered order as `sortVariants`. Works for both
 * persisted ProductVariant[] and the create page's in-memory variant drafts.
 */
export function groupVariantsByColor<T extends GroupableVariant>(variants: T[]): ColorGroup<T>[] {
  const sorted = sortVariants(variants)
  const groups: ColorGroup<T>[] = []
  for (const v of sorted) {
    const last = groups[groups.length - 1]
    if (last && last.colorName === v.colorName) {
      last.variants.push(v)
      last.totalStock += v.stock ?? 0
    } else {
      groups.push({ colorName: v.colorName, colorValue: v.colorValue, variants: [v], totalStock: v.stock ?? 0 })
    }
  }
  return groups
}
