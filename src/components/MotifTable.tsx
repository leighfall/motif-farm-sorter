import type { MotifRow } from '../data/types'
import './MotifTable.less'

function formatGold(price: number | null): string {
  if (price === null) return '—'
  return Math.round(price).toLocaleString()
}

interface MotifTableProps {
  rows: MotifRow[]
}

export function MotifTable({ rows }: MotifTableProps) {
  return (
    <table className="motif-table">
      <thead>
        <tr>
          <th>Style</th>
          <th>Piece</th>
          <th>Chapter</th>
          <th>Avg Price</th>
          <th>Min</th>
          <th>Max</th>
          <th>Listings</th>
          <th>Source</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.chapterId}-${row.pieceName}`}>
            <td>{row.styleName}</td>
            <td>{row.pieceName}</td>
            <td>{row.chapterId}</td>
            <td>{formatGold(row.avgPrice)}</td>
            <td>{formatGold(row.minPrice)}</td>
            <td>{formatGold(row.maxPrice)}</td>
            <td>{row.listingCount}</td>
            <td>{row.sourceType}</td>
            <td>{row.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
