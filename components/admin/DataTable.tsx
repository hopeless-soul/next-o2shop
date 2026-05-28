'use client'

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown, PackageOpen } from 'lucide-react'
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
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  isLoading?: boolean
  emptyMessage?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No results found.',
  sortBy,
  sortOrder,
  onSortChange,
}: DataTableProps<T>) {
  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortOrder === 'desc' }]
    : []

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater) => {
      if (!onSortChange) return
      const next =
        typeof updater === 'function' ? updater(sorting) : updater
      if (next.length === 0) return
      onSortChange(next[0].id, next[0].desc ? 'desc' : 'asc')
    },
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-[6px] border border-[var(--admin-border)] bg-[var(--admin-surface)] overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow
              key={hg.id}
              className="border-b border-[var(--admin-border)] hover:bg-transparent"
              style={{ background: 'var(--admin-bg)' }}
            >
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort() && !!onSortChange
                const isSorted = header.column.id === sortBy
                return (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-[12px] font-semibold tracking-[0.04em] uppercase text-[var(--admin-text-secondary)]"
                    style={{ cursor: canSort ? 'pointer' : undefined, userSelect: canSort ? 'none' : undefined }}
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
                className="border-b border-[var(--admin-border)] transition-colors duration-100"
                style={{ minHeight: 'var(--admin-table-row-h)' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3 text-[14px] text-[var(--admin-text-primary)]">
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
