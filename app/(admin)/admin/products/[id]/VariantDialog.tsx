// app/(admin)/admin/products/[id]/VariantDialog.tsx
'use client'

import SharedVariantDialog, {
  type VariantDialogMode,
  type VariantSubmitResult,
} from '@/components/admin/products/VariantDialog'
import type { ProductVariant, CreateVariantDto } from '@/lib/api/admin/admin-products'
import { createVariantAction, updateVariantAction } from './actions'

interface VariantDialogProps {
  productId: string
  productName: string
  existingColors: { colorName: string; colorValue: string }[]
  mode: VariantDialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
  onVariantCreated: (v: ProductVariant) => void
  onVariantUpdated: (v: ProductVariant) => void
}

export default function VariantDialog({
  productId,
  productName,
  existingColors,
  mode,
  open,
  onOpenChange,
  onVariantCreated,
  onVariantUpdated,
}: VariantDialogProps) {
  async function handleSubmitOne(dto: CreateVariantDto) {
    if (mode.kind !== 'edit') return
    const saved = await updateVariantAction(productId, mode.variantId, dto)
    onVariantUpdated(saved)
  }

  async function handleSubmitMany(dtos: CreateVariantDto[]): Promise<VariantSubmitResult[]> {
    const settled = await Promise.allSettled(dtos.map(dto => createVariantAction(productId, dto)))
    return settled.map(result => {
      if (result.status === 'fulfilled') {
        onVariantCreated(result.value)
        return { ok: true }
      }
      return {
        ok: false,
        error: result.reason instanceof Error ? result.reason.message : 'Failed to create variant.',
      }
    })
  }

  return (
    <SharedVariantDialog
      open={open}
      onOpenChange={onOpenChange}
      productName={productName}
      existingColors={existingColors}
      mode={mode}
      onSubmitOne={handleSubmitOne}
      onSubmitMany={handleSubmitMany}
    />
  )
}
