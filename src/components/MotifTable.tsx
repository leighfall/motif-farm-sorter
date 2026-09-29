import type { MotifRow, SortState, MotifSortableColumn } from '../data/types'
import { sourceTypeFilter } from '../data/constants'
import { SortableHeader } from './SortableHeader'
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
  sort: SortState<MotifSortableColumn>
  onSort: (column: MotifSortableColumn) => void
}

export function MotifTable({ rows, sort, onSort }: MotifTableProps) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <SortableHeader column="styleName" sort={sort} onSort={onSort}>
              Motif
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
