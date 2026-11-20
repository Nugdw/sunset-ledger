// Sunset Ledger — a GTA VI trophy guide and tracker, handed in for make.fun's gta6-trophy-guide-01.
//
// The guide itself is the app/ folder beside this file: plain static files (one HTML page, ES modules, one
// stylesheet, one JSON data file) that open in a desktop browser and work with the network off. This program is
// only the courier. It copies app/ and screenshots/ into the output directory and writes dossier.json there with
// buildDossier from vendor/makefun-frontend.ts, the kit's library, which must stay byte for byte the kit's copy:
// the scorer rebuilds the dossier with its own copy and compares the two.
//
// Run it the way the grader does, with the output directory named by MAKEFUN_OUTPUT_DIR:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// With no MAKEFUN_OUTPUT_DIR it writes to /output. It runs twice and writes the same bytes both times: nothing
// here reads a clock, a random source or the network.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps for this bounty, passed whole so this program refuses anything the scorer would refuse:
// the dossier text is capped at 163,840 bytes, screenshots at 4 files of 256 KiB, app/ at 993 entries and 48 MiB.
const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, GATE_CAPS));
