'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// Keeps admin list filters/sort/pagination in the URL so they survive refresh and back/forward nav.
export function useAdminUrlParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Patches only the given keys into the current query string; other params are preserved.
  return function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(updates)) {
      // undefined/'' clears the filter instead of setting a literal "undefined" value.
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }

    // Reset to page 1 on filter changes, since the old page may not fit the new result set.
    if (!('page' in updates)) params.set('page', '1')

    // replace (not push) so filter tweaks don't pile up in browser history.
    router.replace(`${pathname}?${params.toString()}`)
  }
}
