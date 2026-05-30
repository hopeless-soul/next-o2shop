'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Button } from '@/components/admin/ui/button'
import ShippingContent from './ShippingContent'
import type { ShippingMethod } from '@/lib/api/admin-shipping'

interface ShippingPageClientProps {
  methods: ShippingMethod[]
  total: number
  page: number
  limit: number
}

export default function ShippingPageClient({ methods, total, page, limit }: ShippingPageClientProps) {
  const [adding, setAdding] = useState(false)

  return (
    <>
      <AdminPageHeader
        title="Shipping"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Shipping' }]}
        action={
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setAdding(true)}
            disabled={adding}
          >
            New Method <Plus className="size-4" />
          </Button>
        }
      />
      <ShippingContent
        methods={methods}
        total={total}
        page={page}
        limit={limit}
        adding={adding}
        onAddingChange={setAdding}
      />
    </>
  )
}
