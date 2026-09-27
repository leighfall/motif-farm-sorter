import type { ReactNode } from 'react'
import type { MotifRow, SortState, SortableColumn } from '../data/types'
import { sourceTypeFilter } from '../data/constants'
import './MotifTable.less'

function formatGold(price: number | null): string {
  if (price === null) return '—'
  return Math.round(price).toLocaleString()
}

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

const sourceDisplayNameByType = new Map(sourceTypeFilter.map((source) => [source.type, source.displayName]))

interface MotifTableProps {
  rows: MotifRow[]
  sort: SortState
  onSort: (column: SortableColumn) => void
}

interface SortableHeaderProps {
  column: SortableColumn
  sort: SortState
  onSort: (column: SortableColumn) => void
  children: ReactNode
}

function SortableHeader({ column, sort, onSort, children }: SortableHeaderProps) {
  const isActive = sort.column === column

  return (
    <th className={`sortable-header ${isActive ? 'active' : ''}`} onClick={() => onSort(column)}>
      <span className="sortable-header-content">
        {children}
        <span className={`caret ${isActive && sort.direction === 'desc' ? 'rotated' : ''}`} aria-hidden="true">
          {isActive && (
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'block' }}>
              <polyline
                points="4,7 9,12 14,7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
    </th>
  )
}

export function MotifTable({ rows, sort, onSort }: MotifTableProps) {
  return (
    <div className="motif-table-wrapper">
      <table className="motif-table">
        <thead>
          <tr>
            <SortableHeader column="styleName" sort={sort} onSort={onSort}>
              Style
            </SortableHeader>
            <th>Piece</th>
            <SortableHeader column="avgPrice" sort={sort} onSort={onSort}>
              Avg Price
            </SortableHeader>
            <SortableHeader column="minPrice" sort={sort} onSort={onSort}>
              Min
            </SortableHeader>
            <SortableHeader column="maxPrice" sort={sort} onSort={onSort}>
              Max
            </SortableHeader>
            <th>Listings</th>
            <th>Source</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.chapterId}-${row.pieceName}`}>
              <td>{toTitleCase(row.styleName)}</td>
              <td>{row.pieceName}</td>
              <td>{formatGold(row.avgPrice)}</td>
              <td>{formatGold(row.minPrice)}</td>
              <td>{formatGold(row.maxPrice)}</td>
              <td>{row.listingCount}</td>
              <td>{sourceDisplayNameByType.get(row.sourceType)}</td>
              <td>{row.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
