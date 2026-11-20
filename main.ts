// Sunset Ledger — a gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is the static web app in app/: plain files, no build step, no network at run
// time, its trophy data in app/data/trophies.json. This program is only the hand-in step: it
// copies app/ and screenshots/ from beside this file into the output directory and writes
// dossier.json there with buildDossier from the vendored make.fun library, so the dossier is
// byte for byte what the scorer's own copy of the library writes from the same files.
// vendor/makefun-frontend.ts stays untouched on purpose.
//
// In the grader the output directory is /output; anywhere else, MAKEFUN_OUTPUT_DIR names it:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the two payload trees. Screenshots are optional on disk while developing, but a real
// hand-in carries 3 or 4 of them; mirror whatever is present, like the starter does.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps are the scorer's own (reference/gate.json): dossier text capped at 160 KiB, at most
// 4 screenshots of at most 256 KiB each, at most 993 files and 48 MiB under app/.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
