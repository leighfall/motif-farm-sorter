import { useMemo, useState } from 'react';
import './App.less'
import { MotifTable } from './components/MotifTable'
import { DungeonTable } from './components/DungeonTable'
import { getMotifRows } from './data/getMotifRows'
import { getDungeonRows } from './data/getDungeonRows'
import { sourceTypeFilter } from './data/constants';
import { DropdownFilter } from './components/DropdownFilter';
import type { DungeonSortableColumn, MotifSortableColumn, MotifSourceType, SortState } from './data/types';

const motifRows = getMotifRows();
const dungeonRows = getDungeonRows(motifRows);

type View = 'pieces' | 'dungeons';

// Shared by both tabs' sort handlers: same-column click flips direction,
// different-column click switches to it and resets to ascending.
function toggleSort<TColumn extends string>(current: SortState<TColumn>, column: TColumn): SortState<TColumn> {
  if (current.column === column) {
    return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { column, direction: 'asc' };
}

function App() {
  const [view, setView] = useState<View>('pieces');
  const [activeFilter, setActiveFilter] = useState<MotifSourceType | 'all'>('all');
  const [motifSort, setMotifSort] = useState<SortState<MotifSortableColumn>>({ column: 'styleName', direction: 'asc' });
  const [dungeonSort, setDungeonSort] = useState<SortState<DungeonSortableColumn>>({
    column: 'medianPieceValue',
    direction: 'desc',
  });
  const [hideStylePiece, setHideStylePiece] = useState(true);

  function dropdownClick(evt: MotifSourceType | 'all') {
    setActiveFilter(evt);
  }

  function handleMotifSort(column: MotifSortableColumn) {
    setMotifSort((current) => toggleSort(current, column));
  }

  function handleDungeonSort(column: DungeonSortableColumn) {
    setDungeonSort((current) => toggleSort(current, column));
  }

  const visibleMotifList = useMemo(() => {
    const bySourceType =
      activeFilter === 'all' ? motifRows : motifRows.filter((row) => row.sourceType === activeFilter);

    const filtered = hideStylePiece ? bySourceType.filter((row) => row.pieceName !== 'style') : bySourceType;

    const directionMultiplier = motifSort.direction === 'asc' ? 1 : -1;

    // Copy with toSorted (rather than .sort()) so we don't mutate `filtered`
    // in place — `filtered` may be the same array reference as `motifRows`
    // (the 'all' case above), and `motifRows` must stay untouched.
    return filtered.toSorted((a, b) => {
      const aValue = a[motifSort.column];
      const bValue = b[motifSort.column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * directionMultiplier;
      }

      // Prices can be null (no current listings, meaning nobody's selling —
      // treat that as the most valuable, i.e. infinitely expensive). That
      // makes it land wherever the highest price would: top when sorting
      // most-expensive-first, bottom when sorting cheapest-first.
      const aNumber = aValue === null ? Infinity : (aValue as number);
      const bNumber = bValue === null ? Infinity : (bValue as number);
      return (aNumber - bNumber) * directionMultiplier;
    });
  }, [activeFilter, hideStylePiece, motifSort]);

  const visibleDungeonList = useMemo(() => {
    const directionMultiplier = dungeonSort.direction === 'asc' ? 1 : -1;

    return dungeonRows.toSorted((a, b) => {
      const aValue = a[dungeonSort.column];
      const bValue = b[dungeonSort.column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * directionMultiplier;
      }

      // Same "null = most valuable" convention as the piece view — a dungeon
      // with no current listings for any piece is the most valuable to farm.
      const aNumber = aValue === null ? Infinity : (aValue as number);
      const bNumber = bValue === null ? Infinity : (bValue as number);
      return (aNumber - bNumber) * directionMultiplier;
    });
  }, [dungeonSort]);

  return (
    <section id="motif-table-section">
      <div className="motif-table-header">
        <div className="motif-table-title-row">
          <h1>ESO Motif Farm Sorter</h1>
          <a
            href="https://github.com/leighfall/motif-farm-sorter"
            target="_blank"
            rel="noreferrer"
            className="github-link"
            aria-label="View source on GitHub"
          >
            <i className="fa-brands fa-github"></i>
          </a>
        </div>
        <div className="motif-table-controls">
          <div className="view-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'pieces'}
              className={`view-tab ${view === 'pieces' ? 'active' : ''}`}
              onClick={() => setView('pieces')}
            >
              All Motifs
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'dungeons'}
              className={`view-tab ${view === 'dungeons' ? 'active' : ''}`}
              onClick={() => setView('dungeons')}
            >
              By Dungeon
            </button>
          </div>
          <label className="hide-style-piece-toggle">
            <input
              type="checkbox"
              checked={hideStylePiece}
              onChange={(event) => setHideStylePiece(event.target.checked)}
              disabled={view === 'dungeons'}
            />
            Hide "Style" Books
          </label>
          <DropdownFilter
            options={sourceTypeFilter}
            activeFilter={activeFilter}
            onChange={dropdownClick}
            disabled={view === 'dungeons'}
          />
        </div>
      </div>
      {view === 'pieces' ? (
        <MotifTable rows={visibleMotifList} sort={motifSort} onSort={handleMotifSort} />
      ) : (
        <DungeonTable rows={visibleDungeonList} sort={dungeonSort} onSort={handleDungeonSort} />
      )}
    </section>
  )
}

export default App
