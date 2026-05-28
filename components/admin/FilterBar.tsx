'use client'

import { useState } from 'react'
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
  const [syncedProp, setSyncedProp] = useState(searchValue)

  // React "adjusting state based on props" pattern — detect external resets
  if (syncedProp !== searchValue) {
    setSyncedProp(searchValue)
    setInputValue(searchValue)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearchChange(inputValue)
  }

  function handleClearSearch() {
    setInputValue('')
    onSearchChange('')
  }

  const hasActiveFilters =
    searchValue !== '' || (filters?.some((f) => f.value !== '') ?? false)

  return (
    <div className={`flex flex-wrap items-center gap-2 mb-4${className ? ` ${className}` : ''}`}>
      {/* Search with submit */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <div className="relative w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-text-muted)] pointer-events-none" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-8 pr-7 h-9 text-[14px] border-[var(--admin-border-input)] rounded-[4px] focus-visible:ring-[var(--admin-ring)]"
          />
          {inputValue !== '' && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors duration-100"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="h-9 px-3 text-[13px] font-medium rounded-[4px] bg-[var(--admin-brand)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-brand-hover)] transition-colors duration-100"
        >
          Search
        </button>
      </form>

      {/* Filter selects with per-filter clear */}
      {filters?.map((filter) => (
        <div key={filter.key} className="flex items-center gap-0.5">
          <Select
            value={filter.value || undefined}
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

          {filter.value !== '' && (
            <button
              type="button"
              onClick={() => filter.onChange('')}
              className="flex items-center justify-center size-6 rounded-[4px] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors duration-100"
              aria-label={`Clear ${filter.label} filter`}
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      ))}

      {/* Clear all filters */}
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
