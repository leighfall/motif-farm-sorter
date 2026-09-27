import lastUpdatedJson from '../../data/last-updated.json'

const ORDINAL_EXCEPTIONS = new Set([11, 12, 13])

function ordinalSuffix(day: number): string {
  if (!ORDINAL_EXCEPTIONS.has(day % 100)) {
    if (day % 10 === 1) return 'st'
    if (day % 10 === 2) return 'nd'
    if (day % 10 === 3) return 'rd'
  }
  return 'th'
}

// Formats in the viewer's own local timezone and locale conventions — Date's
// getDate()/getFullYear()/toLocaleTimeString() all read from the browser's
// local clock by default, so no timezone-conversion code is needed here.
export function formatLastUpdated(date: Date): string {
  const month = date.toLocaleString(undefined, { month: 'long' })
  const day = date.getDate()
  const year = date.getFullYear()
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(/\s/g, '')

  return `${month} ${day}${ordinalSuffix(day)}, ${year} at ${time}`
}

export function getLastUpdated(): Date {
  return new Date(lastUpdatedJson.generatedAt)
}
