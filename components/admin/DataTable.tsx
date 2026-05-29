'use client'

import { useState, useRef } from 'react'
import {
  type ColumnDef,
  type Header,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown, PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  total: number
  page: number
  limit: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  isLoading?: boolean
  emptyMessage?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  onRowClick?: (row: T) => void
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No results found.',
  sortBy,
  sortOrder,
  onSortChange,
  onRowClick,
}: DataTableProps<T>) {
  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortOrder === 'desc' }]
    : []

  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({})
  // Refs to <th> elements so we can read actual rendered widths on first drag
  const headRefs = useRef<(HTMLTableCellElement | null)[]>([])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnSizing },
    onColumnSizingChange: setColumnSizing,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      if (!onSortChange) return
      const next =
        typeof updater === 'function' ? updater(sorting) : updater
      if (next.length === 0) return
      onSortChange(next[0].id, next[0].desc ? 'desc' : 'asc')
    },
  })

  function makeResizeHandler(allHeaders: Header<T, unknown>[], colIndex: number) {
    return (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Snapshot actual rendered widths so proportional math uses real px values,
      // not TanStack defaults (which may not match the CSS-laid-out sizes yet)
      const startSizes = allHeaders.map((h, i) => {
        const el = headRefs.current[i]
        return el ? el.getBoundingClientRect().width : h.getSize()
      })
      const startX = 'touches' in e ? e.touches[0].clientX : e.clientX

      const rightIndices = Array.from(
        { length: allHeaders.length - colIndex - 1 },
        (_, i) => colIndex + 1 + i,
      )
      const totalRightSize = rightIndices.reduce((sum, i) => sum + startSizes[i], 0)

      function applyDrag(clientX: number) {
        const delta = clientX - startX
        const minCol = allHeaders[colIndex].column.columnDef.minSize ?? 50

        // Total capacity the right columns can absorb (shrink)
        const maxAbsorb = rightIndices.reduce((sum, i) => {
          return sum + Math.max(0, startSizes[i] - (allHeaders[i].column.columnDef.minSize ?? 50))
        }, 0)

        // Clamp: can't grow beyond right-side capacity; can't shrink below own minSize
        const clampedDelta =
          delta > 0
            ? Math.min(delta, maxAbsorb)
            : Math.max(delta, minCol - startSizes[colIndex])

        const newSizing: Record<string, number> = {}

        // Anchor left columns to their DOM-measured widths so they don't snap
        // to stale TanStack defaults when adjacent columns are written to state
        for (let i = 0; i < colIndex; i++) {
          newSizing[allHeaders[i].column.id] = startSizes[i]
        }

        newSizing[allHeaders[colIndex].column.id] = startSizes[colIndex] + clampedDelta

        // Distribute -clampedDelta proportionally across right columns (always
        // written so they're anchored even when delta is zero)
        for (const i of rightIndices) {
          const proportion =
            totalRightSize > 0
              ? startSizes[i] / totalRightSize
              : 1 / rightIndices.length
          const rightMin = allHeaders[i].column.columnDef.minSize ?? 50
          newSizing[allHeaders[i].column.id] = Math.max(
            rightMin,
            startSizes[i] - clampedDelta * proportion,
          )
        }

        setColumnSizing((prev) => ({ ...prev, ...newSizing }))
      }

      function onMouseMove(ev: MouseEvent) { applyDrag(ev.clientX) }
      function onTouchMove(ev: TouchEvent) { applyDrag(ev.touches[0].clientX) }

      function cleanup() {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', cleanup)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', cleanup)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', cleanup)
      window.addEventListener('touchmove', onTouchMove)
      window.addEventListener('touchend', cleanup)
    }
  }

  return (
    <div className="rounded-[6px] border border-[var(--admin-border)] bg-[var(--admin-surface)] overflow-hidden">
      <Table style={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow
              key={hg.id}
              className="border-b border-[var(--admin-border)] hover:bg-transparent"
              style={{ background: 'var(--admin-bg)' }}
            >
              {hg.headers.map((header, index) => {
                const canSort = header.column.getCanSort() && !!onSortChange
                const isSorted = header.column.id === sortBy
                const isLast = index === hg.headers.length - 1
                return (
                  <TableHead
                    key={header.id}
                    ref={(el) => { headRefs.current[index] = el }}
                    className="px-4 py-3 text-[12px] font-semibold tracking-[0.04em] uppercase text-[var(--admin-text-secondary)] relative"
                    style={{
                      width: header.getSize(),
                      cursor: canSort ? 'pointer' : undefined,
                      userSelect: canSort ? 'none' : undefined,
                    }}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <span className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        isSorted ? (
                          sortOrder === 'desc'
                            ? <ArrowDown className="size-3.5 text-[var(--admin-text-primary)]" />
                            : <ArrowUp className="size-3.5 text-[var(--admin-text-primary)]" />
                        ) : (
                          <ArrowUpDown className="size-3.5 text-[var(--admin-text-muted)]" />
                        )
                      )}
                    </span>

                    {/* Resize handle — 12px hit area, thin visual, hidden on last column */}
                    {!isLast && (
                      <div
                        onMouseDown={makeResizeHandler(hg.headers, index)}
                        onTouchStart={makeResizeHandler(hg.headers, index)}
                        className="absolute top-0 right-0 h-full w-3 cursor-col-resize select-none touch-none group/resizer flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="h-4 w-0.5 rounded-full bg-[var(--admin-border-input)] opacity-0 group-hover/resizer:opacity-100 transition-opacity duration-100" />
                      </div>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, rowIdx) => (
              <TableRow key={rowIdx} className="border-b border-[var(--admin-border)]">
                {columns.map((_, colIdx) => (
                  <TableCell key={colIdx} className="px-4 py-3">
                    <div
                      className="skeleton h-4 rounded-[4px]"
                      style={{ width: colIdx === 0 ? '60%' : '40%' }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-4 py-16 text-center"
              >
                <div className="flex flex-col items-center gap-2 text-[var(--admin-text-muted)]">
                  <PackageOpen className="size-8 opacity-40" />
                  <span className="text-[14px]">{emptyMessage}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'border-b border-[var(--admin-border)] transition-colors duration-100',
                  onRowClick && 'cursor-pointer hover:bg-[var(--admin-bg)]',
                )}
                style={{ minHeight: 'var(--admin-table-row-h)' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-4 py-3 text-[14px] text-[var(--admin-text-primary)]"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
