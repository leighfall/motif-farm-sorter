# 🐺 Motif Farm Sorter

*"To dungeon, or not to dungeon — that is the (gold-per-hour) question."*

A little static site that answers the eternal ESO crafter's dilemma: **is this motif worth farming, or should I just buy the darn thing off Guild Traders?** It pulls real market prices from [Tamriel Trade Centre](https://tamrieltradecentre.com/) and cross-references every single crafting style with exactly where it drops — dungeon, trial, quest, sketchy Cyrodiil bush, whatever — so you can stop tabbing out to UESP mid-farm.

**🔗 Live site:** [motif-farm-sorter.vercel.app](https://motif-farm-sorter.vercel.app)

## What's actually going on here

- 📊 **Prices** come straight from your local TTC addon data (`ItemLookUpTable_EN.lua` + `PriceTableNA.lua`) — no scraping, no guessing, just whatever the market's actually paying right now.
- 🗺️ **Farm sources** are hand-researched and *fussy about accuracy*. "Dungeon" means an actual 4-player Group Finder dungeon — not a delve boss, not a public dungeon, not a 12-player trial wearing a dungeon costume. If it says Dungeon, you can literally queue for it.
- 🏆 **By Dungeon view** aggregates every dungeon's drops into one row, ranked by *median* piece value (not average — one troll listing for 9,999,999 gold shouldn't convince you a dungeon is a goldmine).
- 🔍 **Sort & filter** by style, price, or source type, so you can answer questions like "what's the most expensive thing I can farm this weekend" in about four seconds.
- 🌗 Respects your system's light/dark mode, because nobody wants to get flashbanged checking motif prices at 2am.
- 🕐 Shows exactly when the price data was last refreshed, converted to *your* local time, whoever and wherever you are.

## Tech stack

- **Vite + React + TypeScript** — because a spreadsheet deserves a real frontend
- **LESS** for styling, because we have *opinions* about CSS
- A small Node script (`scripts/build-motif-data.mjs`) that turns minified Lua tables into clean JSON, because parsing Lua by hand builds character

## Running it yourself

```bash
npm install
npm run build:data   # regenerate data/motifs.json from the .lua files in data/
npm run dev          # fire up the dev server
```

## Keeping the data fresh

The price data goes stale the moment someone in your guild undercuts the whole market by 40%. To refresh it:

1. Open the TTC client and let it do its thing (updates the addon files in your ESO `live/AddOns/TamrielTradeCentre/` folder).
2. Copy `ItemLookUpTable_EN.lua` and `PriceTableNA.lua` into this project's `data/` folder.
3. Run `npm run build:data` (this also stamps `data/last-updated.json` with the current time — that's what powers the "Last updated" text on the site).
4. Commit and push. 💰

That's it — no manual deploy step anymore. This repo is connected to Vercel's GitHub integration, so a push to `main` automatically builds and ships the site. (A Task Scheduler job that runs the whole "TTC client updated its files → copy → build → commit → push" chain unattended is still on the wishlist — for now, steps 1–4 are a manual, hands-on labor of love.)

## Data quality notes

`data/motif-sources.json` is researched and audited by hand (with a healthy dose of "wait, is that *actually* a dungeon?" fact-checking against UESP). It's best-effort, not gospel — if you spot a wrong location, that's a very fixable problem, not a betrayal.

---

*Built for people who would rather write a React app than manually cross-reference two spreadsheets. We understand each other.*
