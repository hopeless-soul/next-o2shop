'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Button } from '@/components/admin/ui/button'
import CollectionsContent from './CollectionsContent'
import type { AdminCollection } from '@/lib/api/admin-collections'

interface CollectionsPageClientProps {
  collections: AdminCollection[]
  total: number
  page: number
  limit: number
}

export default function CollectionsPageClient({ collections, total, page, limit }: CollectionsPageClientProps) {
  const [adding, setAdding] = useState(false)

  return (
    <>
      <AdminPageHeader
        title="Collections"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Collections' }]}
        action={
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setAdding(true)}
            disabled={adding}
          >
            New Collection <Plus className="size-4" />
          </Button>
        }
      />
      <CollectionsContent
        collections={collections}
        total={total}
        page={page}
        limit={limit}
        adding={adding}
        onAddingChange={setAdding}
      />
    </>
  )
}
