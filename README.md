[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Sunset Ledger — rank](https://make.fun/badge/gta6-trophy-guide-01/Nugdw/sunset-ledger/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Sunset Ledger — reward](https://make.fun/badge/gta6-trophy-guide-01/Nugdw/sunset-ledger/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Sunset Ledger — GTA VI Trophy Guide & Tracker

Sunset Ledger is a complete, offline trophy guide for Grand Theft Auto VI on
PlayStation 5: all 55 trophies from the official list — 1 platinum, 2 gold,
6 silver and 46 bronze, 28 of them hidden — each with a written guide,
practical steps, and a source note. It is built for the road to the platinum:
play the story, work the character strands, sweep the collectibles, then grind
out the big counters, with the one missable trophy flagged long before you can
walk past it.

This repository is an entry to the make.fun bounty
[gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## The app

The guide is a plain static web app in `app/` — no build step, no network
calls, everything it shows comes from its own files.

- **Tracker** — every trophy as a card with a checkbox; progress is kept in
  your browser's localStorage, and the header shows your completion
  percentage and per-tier counts.
- **Roadmap** — the 55 trophies arranged into five stages, from the opening
  mission to the platinum pop, so you always know what to chase next.
- **Missables** — the trophies that can be lost on a playthrough (there is
  exactly one true missable, *Actions Speak Louder*), with the point of no
  return spelled out and the save to keep.
- **Spoilers** — hidden trophies stay blurred until you reveal them, one at a
  time or all at once; a master spoiler switch covers the whole app.
- **Guide** — pick any trophy and read its full walkthrough: what the game
  asks for, the fastest route through it, and where the information came from.

Filters on the Tracker narrow the list by tier, by name or description text,
and to trophies that are still unearned or missable.

## Running it

Serve the app folder with any static file server, for example:

```sh
python3 -m http.server 8080 --directory app
```

then open <http://localhost:8080>. The app fetches `app/data/trophies.json`,
so it needs to be served over HTTP rather than opened as a `file://` page.

## Handing it in

`main.ts` (Node 22+, standard library only) reads the trophy dataset and
every file of the app, and writes `dossier.json`: the guide's summary —
trophy counts per tier, total guide steps, hidden and missable counts — plus
the SHA-256 and size of every app file, so what was handed in can be
verified exactly.

```sh
node main.ts
```

The dossier lands in `out/` (`MAKEFUN_OUTPUT_DIR` names a different output
directory when set). The run is deterministic: the same repository produces
the same `dossier.json` bytes every time. The vendored library in
`vendor/makefun-frontend.ts` is the kit's copy, kept byte-identical and
untouched, as the kit requires of it.

## The data

`app/data/trophies.json` holds the 55 official trophies. Each entry carries
its PlayStation name, grade, description, hidden and missable flags, a guide
written for this entry, the steps that earn it, and a source string naming
where the trophy's facts were cross-checked (the official PlayStation list as
mirrored by PSNProfiles and Exophase). Grand Theft Auto VI trophy hunting is
a fast-moving target: if Rockstar patches a requirement, the guide text for
that trophy is the place to look first.

## License

MIT — see `LICENSE`.
