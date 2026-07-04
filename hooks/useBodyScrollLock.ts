'use client'

import { useEffect } from 'react'

// Locks page scroll while `locked` is true, e.g. for the duration a modal/drawer is open.
export function useBodyScrollLock(locked: boolean = true) {
  useEffect(() => {
    if (!locked) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [locked])
}
