import type { DungeonRow, MotifRow } from './types'

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

// Groups per-piece rows into one row per dungeon (keyed by chapterId, the
// same 1:1 style<->chapter key used everywhere else), for the "which dungeon
// is most worth farming" view. Only rows with sourceType === 'dungeon' are
// included — this view is specifically about real 4-player group dungeons.
export function getDungeonRows(motifRows: MotifRow[]): DungeonRow[] {
  const dungeonPieces = motifRows.filter((row) => row.sourceType === 'dungeon')

  const piecesByChapterId = new Map<number, MotifRow[]>()
  for (const piece of dungeonPieces) {
    const existing = piecesByChapterId.get(piece.chapterId)
    if (existing) {
      existing.push(piece)
    } else {
      piecesByChapterId.set(piece.chapterId, [piece])
    }
  }

  return Array.from(piecesByChapterId.values()).map((pieces) => {
    const pricedPieces = pieces.filter((piece) => piece.avgPrice !== null)

    // Median rather than mean — a single troll/junk listing (e.g. someone
    // listing an item for 9,999,999 gold) can blow out one piece's avgPrice,
    // and averaging that into the dungeon's value would distort the whole
    // number. Median is robust to that kind of outlier.
    const medianPieceValue =
      pricedPieces.length === 0 ? null : median(pricedPieces.map((piece) => piece.avgPrice!))

    // Median * piece count, rather than summing each piece's (possibly
    // troll-inflated) avgPrice directly — keeps the same outlier resistance
    // as medianPieceValue instead of reintroducing the contamination.
    const totalSetValue = medianPieceValue === null ? null : medianPieceValue * pieces.length

    const [{ chapterId, styleName, location }] = pieces

    return {
      chapterId,
      styleName,
      location,
      medianPieceValue,
      totalSetValue,
      totalListingCount: pieces.reduce((sum, piece) => sum + piece.listingCount, 0),
    }
  })
}
