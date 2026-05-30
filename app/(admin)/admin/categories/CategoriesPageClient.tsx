'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Button } from '@/components/admin/ui/button'
import CategoriesContent from './CategoriesContent'
import type { AdminCategory } from '@/lib/api/admin-categories'

interface CategoriesPageClientProps {
  categories: AdminCategory[]
  total: number
  page: number
  limit: number
}

export default function CategoriesPageClient({ categories, total, page, limit }: CategoriesPageClientProps) {
  const [addingCat, setAddingCat] = useState(false)

  return (
    <>
      <AdminPageHeader
        title="Categories"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Categories' }]}
        action={
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setAddingCat(true)}
            disabled={addingCat}
          >
            New Category <Plus className="size-4" />
          </Button>
        }
      />
      <CategoriesContent
        categories={categories}
        total={total}
        page={page}
        limit={limit}
        addingCat={addingCat}
        onAddingCatChange={setAddingCat}
      />
    </>
  )
}
