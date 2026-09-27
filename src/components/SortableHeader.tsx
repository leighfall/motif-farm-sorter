import type { ReactNode } from 'react'
import type { SortState } from '../data/types'
import './SortableHeader.less'

interface SortableHeaderProps<TColumn extends string> {
  column: TColumn
  sort: SortState<TColumn>
  onSort: (column: TColumn) => void
  children: ReactNode
}

export function SortableHeader<TColumn extends string>({
  column,
  sort,
  onSort,
  children,
}: SortableHeaderProps<TColumn>) {
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
