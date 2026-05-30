'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function useAdminUrlParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  return function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    if (!('page' in updates)) params.set('page', '1')
    router.replace(`${pathname}?${params.toString()}`)
  }
}
