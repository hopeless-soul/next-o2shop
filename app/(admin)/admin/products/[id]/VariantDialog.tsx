'use client'

import SharedVariantDialog from '@/components/admin/products/VariantDialog'
import type { ProductVariant, CreateVariantDto } from '@/lib/api/admin/admin-products'
import { createVariantAction, updateVariantAction } from './actions'

interface VariantDialogProps {
  productId: string
  variant?: ProductVariant
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (v: ProductVariant) => void
}

function variantToDto(v: ProductVariant): CreateVariantDto {
  return {
    colorName: v.colorName,
    colorValue: v.colorValue,
    size: v.size,
    sku: v.sku,
    stock: v.stock,
    priceOverride: v.priceOverride,
    compareAtPrice: v.compareAtPrice,
  }
}

export default function VariantDialog({
  productId,
  variant,
  open,
  onOpenChange,
  onSaved,
}: VariantDialogProps) {
  async function handleSubmit(dto: CreateVariantDto) {
    const saved = variant
      ? await updateVariantAction(productId, variant.id, dto)
      : await createVariantAction(productId, dto)
    onSaved(saved)
  }

  return (
    <SharedVariantDialog
      mode={variant ? 'edit' : 'create'}
      open={open}
      onOpenChange={onOpenChange}
      initialValues={variant ? variantToDto(variant) : undefined}
      onSubmit={handleSubmit}
    />
  )
}
