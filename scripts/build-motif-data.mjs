// Parses the raw TTC addon data dumps in data/ into a clean JSON file of
// motif prices at data/motifs.json. Re-run this any time data/*.lua is
// refreshed from a new TTC client update.
//
// Usage: npm run build:data

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const LOOKUP_PATH = path.join(DATA_DIR, "ItemLookUpTable_EN.lua");
const PRICE_PATH = path.join(DATA_DIR, "PriceTableNA.lua");
const OUT_PATH = path.join(DATA_DIR, "motifs.json");
const LAST_UPDATED_PATH = path.join(DATA_DIR, "last-updated.json");

const MOTIF_NAME_RE = /"crafting motif (\d+): ([^"]+)"\]=\{((?:\[\d+\]=\d+,)+)\}/gi;
const LEVEL_ID_RE = /\[(\d+)\]=(\d+),/g;

/** Extracts { chapterId, styleAndPiece, itemIds[] } for every motif book entry. */
function parseLookupTable(text) {
  const motifs = [];
  for (const match of text.matchAll(MOTIF_NAME_RE)) {
    const [, chapterIdStr, styleAndPiece, levelIdBlob] = match;
    const itemIds = [...levelIdBlob.matchAll(LEVEL_ID_RE)].map((m) => Number(m[2]));
    motifs.push({
      chapterId: Number(chapterIdStr),
      styleAndPiece: styleAndPiece.trim(),
      itemIds: [...new Set(itemIds)],
    });
  }
  return motifs;
}

// Piece suffixes as they appear in TTC item names, longest first so multi-word
// pieces (e.g. "battle axes") match before single-word ones (e.g. "axes").
const PIECE_SUFFIXES = [
  "battle axes", "great swords", "inferno staves",
  "lightning staves", "ice staves", "frost staves", "restoration staves",
  "war axes", "sabatons", "shoulders", "gauntlets", "pauldrons",
  "cuirasses", "bracers", "epaulets", "girdles", "helmets", "shields",
  "greaves", "jerkins", "gloves", "chests", "boots", "belts", "swords",
  "staves", "maces", "axes", "bows", "legs", "style",
].sort((a, b) => b.length - a.length);

// TTC truncates some item names (likely a display-name length limit), which
// produces a second, shortened styleName for the same chapter/style. Map
// those truncated forms back to the canonical style name.
const STYLE_NAME_PREFIX_ALIASES = [["coldharbour dom.", "coldharbour dominator"]];

function splitStyleAndPiece(rawStyleAndPiece) {
  let styleAndPiece = rawStyleAndPiece;
  for (const [alias, canonical] of STYLE_NAME_PREFIX_ALIASES) {
    if (styleAndPiece.toLowerCase().startsWith(alias)) {
      styleAndPiece = canonical + styleAndPiece.slice(alias.length);
      break;
    }
  }
  const lower = styleAndPiece.toLowerCase();
  if (lower.endsWith("style, tome edition")) {
    return {
      styleName: styleAndPiece.slice(0, styleAndPiece.length - "style, tome edition".length).trim(),
      pieceName: "tome edition",
    };
  }
  for (const suffix of PIECE_SUFFIXES) {
    if (lower.endsWith(" " + suffix) || lower === suffix) {
      const styleName = styleAndPiece.slice(0, styleAndPiece.length - suffix.length).trim();
      return { styleName: styleName || styleAndPiece, pieceName: suffix };
    }
  }
  // Fallback: last word is the piece, everything before it is the style.
  const words = styleAndPiece.split(" ");
  return { styleName: words.slice(0, -1).join(" "), pieceName: words.at(-1) };
}

/** Finds the substring "[itemId]={...}" with balanced braces, or null. */
function extractItemBlock(text, itemId) {
  const marker = `[${itemId}]={`;
  const start = text.indexOf(marker);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start + marker.length - 1; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

const LEAF_RE = /\["A"\]=([\d.]+),\["X"\]=([\d.]+),\["N"\]=([\d.]+),\["EC"\]=(\d+),/g;

/** Aggregates every price leaf found under an item's block into one summary. */
function aggregatePrices(block) {
  const leaves = [...block.matchAll(LEAF_RE)].map((m) => ({
    avg: Number(m[1]),
    max: Number(m[2]),
    min: Number(m[3]),
    entryCount: Number(m[4]),
  }));
  if (leaves.length === 0) return null;

  const totalEntries = leaves.reduce((sum, l) => sum + l.entryCount, 0);
  const weightedAvg =
    totalEntries > 0
      ? leaves.reduce((sum, l) => sum + l.avg * l.entryCount, 0) / totalEntries
      : leaves.reduce((sum, l) => sum + l.avg, 0) / leaves.length;

  return {
    avgPrice: weightedAvg,
    minPrice: Math.min(...leaves.map((l) => l.min)),
    maxPrice: Math.max(...leaves.map((l) => l.max)),
    listingCount: totalEntries,
  };
}

function combine(a, b) {
  if (!a) return b;
  if (!b) return a;
  const listingCount = a.listingCount + b.listingCount;
  return {
    avgPrice: listingCount > 0 ? (a.avgPrice * a.listingCount + b.avgPrice * b.listingCount) / listingCount : a.avgPrice,
    minPrice: Math.min(a.minPrice, b.minPrice),
    maxPrice: Math.max(a.maxPrice, b.maxPrice),
    listingCount,
  };
}

function main() {
  console.log("Reading lookup table...");
  const lookupText = readFileSync(LOOKUP_PATH, "utf8");
  const motifEntries = parseLookupTable(lookupText);
  console.log(`Found ${motifEntries.length} motif book entries in lookup table.`);

  console.log("Reading price table (this is a large file, may take a moment)...");
  const priceText = readFileSync(PRICE_PATH, "utf8");

  const results = [];
  let missingPrice = 0;
  for (const entry of motifEntries) {
    const { styleName, pieceName } = splitStyleAndPiece(entry.styleAndPiece);

    let combined = null;
    for (const itemId of entry.itemIds) {
      const block = extractItemBlock(priceText, itemId);
      if (!block) continue;
      combined = combine(combined, aggregatePrices(block));
    }

    if (!combined) {
      missingPrice++;
      results.push({
        chapterId: entry.chapterId,
        styleName,
        pieceName,
        itemIds: entry.itemIds,
        avgPrice: null,
        minPrice: null,
        maxPrice: null,
        listingCount: 0,
        noListings: true,
      });
      continue;
    }

    results.push({
      chapterId: entry.chapterId,
      styleName,
      pieceName,
      itemIds: entry.itemIds,
      avgPrice: Math.round(combined.avgPrice * 100) / 100,
      minPrice: combined.minPrice,
      maxPrice: combined.maxPrice,
      listingCount: combined.listingCount,
      noListings: false,
    });
  }

  results.sort((a, b) => a.chapterId - b.chapterId || a.pieceName.localeCompare(b.pieceName));

  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
  writeFileSync(LAST_UPDATED_PATH, JSON.stringify({ generatedAt: new Date().toISOString() }, null, 2));
  console.log(`Wrote ${results.length} motif pieces to ${OUT_PATH} (${results.length - missingPrice} priced, ${missingPrice} with no current listings, still included with noListings: true).`);
}

main();
