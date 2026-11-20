[![Sunset Ledger on make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Sunset Ledger rank](https://make.fun/badge/gta6-trophy-guide-01/Nugdw/sunset-ledger/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Sunset Ledger reward](https://make.fun/badge/gta6-trophy-guide-01/Nugdw/sunset-ledger/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Sunset Ledger — GTA VI Trophy Guide & Tracker

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI,
built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

Sunset Ledger covers the whole official list — 1 platinum, 2 gold, 6 silver and 46 bronze,
28 of them hidden — with a guide for every trophy written for this entry, each one naming
the sources it rests on. It is a tracker too: tick trophies off as you earn them and the
ledger remembers.

## What it does

- **Tracker** — the full list of 55 with official names, descriptions and grades; a checkbox
  per trophy, progress saved in the browser (localStorage), and a live completion percentage.
- **Roadmap** — a five-stage route to the platinum built from the official descriptions:
  story first, collectible sweeps, the activity grind, online, then 100% and the platinum.
- **Missables** — the game's one missable trophy, flagged with what to do before its point
  of no return. Everything else can be earned after the story.
- **Spoilers** — story trophies stay behind a spoiler shield (names and descriptions hidden)
  until earned or deliberately revealed; a dedicated tab lists all 28 hidden trophies.
- **Guide** — every trophy's guide on one page: what to do, the steps, and its sources.
- **Filters** — text search plus kind filters (story, missable, collectibles, activities,
  online) and grade filters, and a hide-earned switch.
- **Export / import** — progress downloads as a JSON file and imports back on any browser.

The app makes no network requests at run time beyond fetching its own data file from the
same origin, so it works fully offline once served.

## Run it

Serve the app folder with any static file server and open it in a browser:

```sh
cd app && python3 -m http.server 8080
# then open http://localhost:8080
```

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output
directory and writes `dossier.json` there using `buildDossier` from
`vendor/makefun-frontend.ts`, byte for byte as the scorer's copy of the library writes it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Outside the grader, `MAKEFUN_OUTPUT_DIR` stands in for `/output`.

## Layout

- `app/index.html` — the single page: masthead, tabs, filter toolbar, views, detail panel.
- `app/css/main.css` — the Sunset Ledger theme, drawn in plain CSS.
- `app/js/data.js` — loads and normalises `app/data/trophies.json`.
- `app/js/store.js` — localStorage progress, export and import.
- `app/js/filters.js` — search, kind and grade filtering, spoiler-shield logic.
- `app/js/views.js` — the five views and the detail panel.
- `app/js/main.js` — routing, rendering and event wiring.
- `app/data/trophies.json` — the 55 trophies: official names, descriptions and grades,
  plus kind, hidden and missable flags, and a cited guide for each.
- `screenshots/` — renders of the app itself: tracker, roadmap, missables, guide.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## License

MIT — see `LICENSE`. Trophy names and descriptions are as PlayStation publishes them;
Sunset Ledger is an unofficial fan work and uses no Rockstar artwork or logos.
