import { useMemo, useState } from 'react';
import './App.less'
import { MotifTable } from './components/MotifTable'
import { getMotifRows } from './data/getMotifRows'
import { sourceTypeFilter } from './data/constants';
import { DropdownFilter } from './components/DropdownFilter';
import type { MotifSourceType, SortState } from './data/types';

const motifRows = getMotifRows();

function App() {
  const [activeFilter, setActiveFilter] = useState<MotifSourceType | 'all'>('all');
  const [sort, setSort] = useState<SortState>({ column: 'styleName', direction: 'asc' });
  const [hideStylePiece, setHideStylePiece] = useState(false);

  function dropdownClick(evt: MotifSourceType | 'all') {
    setActiveFilter(evt);
  }

  // Clicking the currently-sorted column flips its direction; clicking a
  // different column switches to it and resets to ascending.
  function handleSort(column: SortState['column']) {
    setSort((current) => {
      if (current.column === column) {
        return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'asc' };
    });
  }

  const visibleMotifList = useMemo(() => {
    const bySourceType =
      activeFilter === 'all' ? motifRows : motifRows.filter((row) => row.sourceType === activeFilter);

    const filtered = hideStylePiece ? bySourceType.filter((row) => row.pieceName !== 'style') : bySourceType;

    const directionMultiplier = sort.direction === 'asc' ? 1 : -1;

    // Copy with toSorted (rather than .sort()) so we don't mutate `filtered`
    // in place — `filtered` may be the same array reference as `motifRows`
    // (the 'all' case above), and `motifRows` must stay untouched.
    return filtered.toSorted((a, b) => {
      const aValue = a[sort.column];
      const bValue = b[sort.column];

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
  }, [activeFilter, hideStylePiece, sort]);
  // TODO: filtering (by piece, price range, etc.) beyond source type, plus
  // sorting on the remaining columns (Avg Price, Min, Max) following the
  // `handleSort`/`sort` pattern above — see MotifTable's Style header for
  // the reference wiring.
  return (
    <section id="motif-table-section">
      <div className="motif-table-header">
        <h1>ESO Motif Farm Sorter</h1>
        <div className="motif-table-controls">
          <label className="hide-style-piece-toggle">
            <input
              type="checkbox"
              checked={hideStylePiece}
              onChange={(event) => setHideStylePiece(event.target.checked)}
            />
            Hide "Style" piece
          </label>
          <DropdownFilter options={sourceTypeFilter} activeFilter={activeFilter} onChange={dropdownClick} />
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
      </div>
      <MotifTable rows={visibleMotifList} sort={sort} onSort={handleSort} />
    </section>
  )
}

export default App
