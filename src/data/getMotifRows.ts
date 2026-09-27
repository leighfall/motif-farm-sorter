import motifsJson from '../../data/motifs.json'
import motifSourcesJson from '../../data/motif-sources.json'
import type { MotifPiece, MotifSource, MotifRow } from './types'

const motifs = motifsJson as MotifPiece[]
const motifSources = motifSourcesJson as MotifSource[]

const sourceByChapterId = new Map(motifSources.map((source) => [source.chapterId, source]))

// Joins per-piece price data with its style's farm-source data. Every style
// in data/motifs.json is guaranteed to have a matching entry in
// data/motif-sources.json (validated when the source file was built), so a
// missing lookup here would mean the data files are out of sync.
export function getMotifRows(): MotifRow[] {
  return motifs.map((piece) => {
    const source = sourceByChapterId.get(piece.chapterId)
    if (!source) {
      throw new Error(
        `No farm-source entry found for chapterId ${piece.chapterId} (${piece.styleName}) — data/motifs.json and data/motif-sources.json are out of sync.`,
      )
    }
    return {
      ...piece,
      sourceType: source.sourceType,
      location: source.location,
      notes: source.notes,
      confidence: source.confidence,
    }
  })
}
