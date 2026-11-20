# sunset-ledger

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Nugdw/sunset-ledger/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Nugdw/sunset-ledger/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Sunset Ledger is a complete GTA VI trophy guide and tracker for the official 55-trophy PlayStation 5 list — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden. Every trophy carries its own guide in original words: numbered steps, and every step cites one of nine dated sources (Exophase, PSNProfiles, PowerPyx, Push Square, EGamers, games.gg, KeenGamer, Vice City Hustle, GTA Spotter; 190 cited steps in all). A five-stage roadmap orders the run to the platinum, the Missables page flags the list's one potentially missable trophy — Positive Mental Attitude, whose first meditation spot sits inside a Chapter 1 story moment — and every trophy shows its launch-week rarity from Exophase. The tracker saves progress in the browser: earned ticks, per-trophy counters for the 19 counted trophies, search and kind/grade filters, a spoiler shield that covers unearned story trophies, a Next Up planner, and export/import of your progress as a JSON file. The app is plain static files and works offline in a desktop browser; the data lives in app/data/trophies.json.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# builds the hand-in in out/ (app/, screenshots/, dossier.json); then view the guide itself:
python3 -m http.server 8000 --directory app
# open http://localhost:8000 in a desktop browser
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=v4g0sdkn&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
