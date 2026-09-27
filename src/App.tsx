import { MotifTable } from './components/MotifTable'
import { getMotifRows } from './data/getMotifRows'
import './App.less'

const motifRows = getMotifRows()

function App() {
  // TODO: sorting + filtering (by style, piece, source type, price range,
  // etc.) is the main feature to build here. `motifRows` is the full,
  // unsorted/unfiltered dataset — derive the displayed rows from it with
  // useState/useMemo rather than mutating it.
  return (
    <section id="motif-table-section">
      <h1>ESO Motif Farm Sorter</h1>
      <MotifTable rows={motifRows} />
    </section>
  )
}

export default App
