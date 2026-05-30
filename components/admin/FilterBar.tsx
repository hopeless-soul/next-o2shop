'use client'

import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/admin/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'

export interface FilterOption {
  key: string
  label: string
  type?: 'select' | 'date' | 'text'
  options?: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
  leftIcon?: React.ElementType
  rightIcon?: React.ElementType
  width?: number
}

interface FilterBarProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: FilterOption[]
  onApply?: (search: string, filterValues: Record<string, string>) => void
  className?: string
}

export default function FilterBar({
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  filters,
  onApply,
  className,
}: FilterBarProps) {
  const buildDrafts = (fs: FilterOption[] | undefined) =>
    Object.fromEntries(fs?.map((f) => [f.key, f.value]) ?? [])

  const [inputValue, setInputValue] = useState(searchValue)
  const [syncedProp, setSyncedProp] = useState(searchValue)
  const [filterDrafts, setFilterDrafts] = useState<Record<string, string>>(() =>
    buildDrafts(filters),
  )
  const [syncedFilterProps, setSyncedFilterProps] = useState<Record<string, string>>(() =>
    buildDrafts(filters),
  )

  // Detect external search reset
  if (syncedProp !== searchValue) {
    setSyncedProp(searchValue)
    setInputValue(searchValue)
  }

  // Detect external filter resets
  const filterPropsChanged = filters?.some((f) => syncedFilterProps[f.key] !== f.value) ?? false
  if (filterPropsChanged) {
    const next = buildDrafts(filters)
    setSyncedFilterProps(next)
    setFilterDrafts(next)
  }

  function handleSubmit(e?: React.SyntheticEvent) {
    e?.preventDefault()
    if (onApply) {
      onApply(inputValue, Object.fromEntries(filters?.map((f) => [f.key, filterDrafts[f.key] ?? '']) ?? []))
    } else {
      onSearchChange(inputValue)
      filters?.forEach((f) => f.onChange(filterDrafts[f.key] ?? ''))
    }
  }

  function handleClearSearch() {
    setInputValue('')
    onSearchChange('')
  }

  function handleClearAll() {
    setInputValue('')
    setFilterDrafts(Object.fromEntries(filters?.map((f) => [f.key, '']) ?? []))
  }

  function setFilterDraft(key: string, value: string) {
    setFilterDrafts((prev) => ({ ...prev, [key]: value }))
  }

  const hasActiveDraft =
    inputValue !== '' || Object.values(filterDrafts).some((v) => v !== '')

  return (
    <div className={`flex justify-between items-start gap-2 mb-4${className ? ` ${className}` : ''}`}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-2"
      >
        {/* Search input */}
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

        {/* Filter selects */}
        {filters?.map((filter) => {
          const draftValue = filterDrafts[filter.key] ?? ''
          const LeftIcon = filter.leftIcon
          const RightIcon = filter.rightIcon
          const widthStyle = filter.width ? { flex: filter.width } : undefined

          if (filter.type === 'date') {
            return (
              <div key={filter.key} className="flex items-center gap-1.5" style={widthStyle}>
                <span className="text-[12px] text-[var(--admin-text-muted)] shrink-0">{filter.label}</span>
                <div className={`relative ${filter.width ? 'flex-1' : 'w-[130px]'}`}>
                  {LeftIcon && (
                    <LeftIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-text-muted)] pointer-events-none" />
                  )}
                  <input
                    type="date"
                    value={draftValue}
                    onChange={(e) => setFilterDraft(filter.key, e.target.value)}
                    className={`w-full h-9 text-[13px] border border-[var(--admin-border-input)] rounded-[4px] text-[var(--admin-text-secondary)] bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--admin-ring)] ${LeftIcon ? 'pl-8' : 'px-2'} ${RightIcon ? 'pr-14' : 'pr-2'}`}
                  />
                  {RightIcon && (
                    <RightIcon className="absolute right-8 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-text-muted)] pointer-events-none" />
                  )}
                  {draftValue !== '' && (
                    <button
                      type="button"
                      onClick={() => setFilterDraft(filter.key, '')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors duration-100"
                      aria-label={`Clear ${filter.label} filter`}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          }
          if (filter.type === 'text') {
            return (
              <div key={filter.key} className={`relative ${filter.width ? '' : 'w-[160px]'}`} style={widthStyle}>
                {LeftIcon && (
                  <LeftIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-text-muted)] pointer-events-none" />
                )}
                <Input
                  type="text"
                  placeholder={filter.label}
                  value={draftValue}
                  onChange={(e) => setFilterDraft(filter.key, e.target.value)}
                  className={`h-9 text-[13px] border-[var(--admin-border-input)] rounded-[4px] focus-visible:ring-[var(--admin-ring)] ${LeftIcon ? 'pl-8' : ''} ${RightIcon ? 'pr-14' : 'pr-7'}`}
                />
                {RightIcon && (
                  <RightIcon className="absolute right-8 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-text-muted)] pointer-events-none" />
                )}
                {draftValue !== '' && (
                  <button
                    type="button"
                    onClick={() => setFilterDraft(filter.key, '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors duration-100"
                    aria-label={`Clear ${filter.label} filter`}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            )
          }
          return (
            <div key={filter.key} className={`relative ${filter.width ? '' : 'w-[160px]'}`} style={widthStyle}>
              <Select
                value={draftValue}
                onValueChange={(v) => setFilterDraft(filter.key, v ?? '')}
              >
                <SelectTrigger className="w-full">
                  {LeftIcon && <LeftIcon className="size-4 text-[var(--admin-text-muted)] shrink-0 pointer-events-none" />}
                  <SelectValue className={draftValue ? 'text-admin-text-primary' : 'text-admin-text-muted'}>
                    {draftValue
                      ? (filter.options?.find((o) => o.value === draftValue)?.label ?? draftValue)
                      : filter.label}
                  </SelectValue>
                  {RightIcon && <RightIcon className="size-4 text-[var(--admin-text-muted)] shrink-0 pointer-events-none" />}
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {draftValue !== '' && (
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setFilterDraft(filter.key, '')
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors duration-100"
                  aria-label={`Clear ${filter.label} filter`}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )
        })}

        {/* Clear all */}
        {hasActiveDraft && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 text-[13px] text-[var(--admin-text-secondary)] hover:underline transition-colors duration-100"
          >
            <X className="size-3.5" />
            Clear filters
          </button>
        )}
      </form>

      <Button
        type="button"
        variant="default"
        size="lg"
        className="shrink-0"
        onClick={handleSubmit}
      >
        Search <Search className="size-4" />  
      </Button>
    </div>
  )
}
