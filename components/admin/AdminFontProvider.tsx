'use client'
import { useEffect } from 'react'

export function AdminFontProvider({ fontVariable }: { fontVariable: string }) {
  useEffect(() => {
    document.documentElement.classList.add(fontVariable)
    return () => {
      document.documentElement.classList.remove(fontVariable)
    }
  }, [fontVariable])
  return null
}
