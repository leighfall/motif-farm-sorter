export interface MotifPiece {
  chapterId: number
  styleName: string
  pieceName: string
  itemIds: number[]
  avgPrice: number | null
  minPrice: number | null
  maxPrice: number | null
  listingCount: number
  noListings: boolean
}

export type MotifSourceType =
  | 'starter'
  | 'zone_drop'
  | 'dungeon'
  | 'arena'
  | 'overland_boss'
  | 'public_dungeon'
  | 'trial'
  | 'vendor'
  | 'achievement'
  | 'quest'
  | 'pvp'
  | 'crown_store'
  | 'event'
  | 'master_writ'
  | 'other'

export type MotifConfidence = 'high' | 'medium' | 'low'

export type MotifSortableColumn = 'styleName' | 'avgPrice' | 'minPrice' | 'maxPrice'
export type DungeonSortableColumn = 'styleName' | 'medianPieceValue' | 'totalSetValue'
export type SortDirection = 'asc' | 'desc'

export interface SortState<TColumn extends string> {
  column: TColumn
  direction: SortDirection
}

export interface MotifSource {
  styleName: string
  chapterId: number
  sourceType: MotifSourceType
  location: string
  notes: string
  confidence: MotifConfidence
}

// One row per motif piece (e.g. "Militant Monk Chests"), with its style's
// farm source merged in. This is the shape the table/filter UI works with.
export interface MotifRow extends MotifPiece {
  sourceType: MotifSourceType
  location: string
  notes: string
  confidence: MotifConfidence
}

export interface sourceTypeFilterType {
  id: number;
  type: MotifSourceType;
  displayName: string;
}

// One row per dungeon (grouped by chapterId from all of that style's
// MotifRows), for the "which dungeon is most worth farming" view.
export interface DungeonRow {
  chapterId: number
  styleName: string
  location: string
  medianPieceValue: number | null
  totalSetValue: number | null
  totalListingCount: number
}
