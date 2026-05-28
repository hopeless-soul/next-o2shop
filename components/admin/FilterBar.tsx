'use client'

import { useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterOption {
  key: string
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}

interface FilterBarProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: FilterOption[]
  onClear?: () => void
  className?: string
}

export default function FilterBar({
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  filters,
  onClear,
  className,
}: FilterBarProps) {
  const [inputValue, setInputValue] = useState(searchValue)
  // Track what the prop was last time we rendered — lets us detect external resets
  const [syncedProp, setSyncedProp] = useState(searchValue)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // React "adjusting state based on props" pattern — called during render, not in an effect
  if (syncedProp !== searchValue) {
    setSyncedProp(searchValue)
    setInputValue(searchValue)
  }


  function handleInputChange(value: string) {
    setInputValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchChange(value)
    }, 300)
  }

  const hasActiveFilters =
    searchValue !== '' || (filters?.some((f) => f.value !== '') ?? false)

  return (
    <div className={`flex flex-wrap items-center gap-2 mb-4${className ? ` ${className}` : ''}`}>
      {/* Search */}
      <div className="relative w-[280px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-text-muted)] pointer-events-none" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-8 h-9 text-[14px] border-[var(--admin-border-input)] rounded-[4px] focus-visible:ring-[var(--admin-ring)]"
        />
      </div>

      {/* Filter selects — Base UI Select.Value renders raw value, so pass label explicitly */}
      {filters?.map((filter) => (
        <Select
          key={filter.key}
          value={filter.value || null}
          onValueChange={(v) => filter.onChange(v)}
        >
          <SelectTrigger className="h-9 w-auto min-w-[140px] text-[14px] border-[var(--admin-border-input)] rounded-[4px] focus:ring-[var(--admin-ring)]">
            <SelectValue>
              {filter.value
                ? (filter.options.find((o) => o.value === filter.value)?.label ?? filter.value)
                : filter.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-[6px]">
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Clear filters */}
      {hasActiveFilters && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 text-[13px] text-[var(--admin-text-secondary)] hover:underline transition-colors duration-100 ml-1"
        >
          <X className="size-3.5" />
          Clear filters
        </button>
      )}
    </div>
  )
}
