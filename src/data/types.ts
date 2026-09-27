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

export type SortableColumn = 'styleName' | 'avgPrice' | 'minPrice' | 'maxPrice'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  column: SortableColumn
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
