import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export type SortDirection = 'asc' | 'desc'

export interface Column<T> {
  id: string
  header: string
  accessor?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  sortKey?: string
  sortDirection?: SortDirection
  onSort?: (key: string) => void
  selectedIds?: Set<string>
  onSelectRow?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortDirection,
  onSort,
  selectedIds,
  onSelectRow,
  onSelectAll,
  emptyMessage = 'No results',
}: DataTableProps<T>) {
  const selectable = Boolean(onSelectRow)
  const allSelected = selectable && data.length > 0 && data.every((r) => selectedIds?.has(keyExtractor(r)))

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
            {selectable && (
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  aria-label="Select all rows"
                  className="rounded border-[var(--border)]"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  'px-3 py-2.5 text-left text-xs font-medium text-[var(--text-secondary)]',
                  col.className,
                )}
              >
                {col.sortable && onSort ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]"
                    onClick={() => onSort(col.id)}
                  >
                    {col.header}
                    {sortKey === col.id ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-3 py-12 text-center text-[var(--text-secondary)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = keyExtractor(row)
              return (
                <tr
                  key={id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)]/80"
                >
                  {selectable && (
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(id) ?? false}
                        onChange={(e) => onSelectRow?.(id, e.target.checked)}
                        aria-label={`Select row ${id}`}
                        className="rounded border-[var(--border)]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn('px-3 py-2.5 text-[var(--text-primary)]', col.className)}
                    >
                      {col.accessor?.(row)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
