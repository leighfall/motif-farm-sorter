import type { DungeonRow, SortState, DungeonSortableColumn } from '../data/types'
import { SortableHeader } from './SortableHeader'
import '../styles/data-table.less'

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

interface DungeonTableProps {
  rows: DungeonRow[]
  sort: SortState<DungeonSortableColumn>
  onSort: (column: DungeonSortableColumn) => void
}

export function DungeonTable({ rows, sort, onSort }: DungeonTableProps) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <SortableHeader column="styleName" sort={sort} onSort={onSort}>
              Style
            </SortableHeader>
            <th>Dungeon</th>
            <SortableHeader column="medianPieceValue" sort={sort} onSort={onSort}>
              Median Price
            </SortableHeader>
            <SortableHeader column="totalSetValue" sort={sort} onSort={onSort}>
              Total Set Value
            </SortableHeader>
            <SortableHeader column="minPrice" sort={sort} onSort={onSort}>
              Min
            </SortableHeader>
            <SortableHeader column="maxPrice" sort={sort} onSort={onSort}>
              Max
            </SortableHeader>
            <th>Pieces</th>
            <th>Listings</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.chapterId}>
              <td>{toTitleCase(row.styleName)}</td>
              <td>{row.location}</td>
              <td>{formatGold(row.medianPieceValue)}</td>
              <td>{formatGold(row.totalSetValue)}</td>
              <td>{formatGold(row.minPrice)}</td>
              <td>{formatGold(row.maxPrice)}</td>
              <td>{row.pieceCount}</td>
              <td>{row.totalListingCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
