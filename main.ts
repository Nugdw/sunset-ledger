// Sunset Ledger — hand-in program for the make.fun bounty gta6-trophy-guide-01.
//
// The guide itself is the static web app in app/ (open app/index.html in a
// browser; it loads its trophy list from app/data/trophies.json and never
// touches the network). This program is the delivery mechanism: it reads
// the trophy dataset and every file of the app, and writes a deterministic
// dossier to out/dossier.json — a summary of the guide (trophy counts per
// tier, total guide steps, hidden and missable counts) plus the SHA-256 of
// every app file, so a reviewer can verify exactly what was handed in.
//
//   node main.ts
//
// MAKEFUN_OUTPUT_DIR, when set, names a different output directory.
// The dossier is byte-for-byte deterministic: the same repository always
// produces the same dossier. Node 22 or newer, standard library only.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const appDir = join(repoRoot, 'app');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(repoRoot, 'out');

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

// Every regular file under app/, as sorted repo-relative paths, so the
// dossier never depends on filesystem walk order.
function listAppFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) listAppFiles(full, found);
    else found.push(relative(repoRoot, full));
  }
  return found;
}

interface Trophy {
  tier: string;
  hidden: boolean;
  missable: boolean;
  steps: string[];
}

const dataset = JSON.parse(readFileSync(join(appDir, 'data', 'trophies.json'), 'utf8')) as
  | { trophies: Trophy[] }
  | Trophy[];
const trophies: Trophy[] = Array.isArray(dataset) ? dataset : dataset.trophies;

const tierCounts: Record<string, number> = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
let hiddenCount = 0;
let missableCount = 0;
let totalSteps = 0;
for (const trophy of trophies) {
  if (Object.hasOwn(tierCounts, trophy.tier)) tierCounts[trophy.tier] += 1;
  if (trophy.hidden) hiddenCount += 1;
  if (trophy.missable) missableCount += 1;
  totalSteps += Array.isArray(trophy.steps) ? trophy.steps.length : 0;
}

const appFiles = listAppFiles(appDir).map((path) => {
  const bytes = readFileSync(join(repoRoot, path));
  return { path, bytes: bytes.length, sha256: sha256(bytes) };
});

const dossier = {
  entry: 'Sunset Ledger — GTA VI Trophy Guide & Tracker',
  competition: 'gta6-trophy-guide-01',
  summary: {
    trophies: trophies.length,
    tiers: tierCounts,
    hidden: hiddenCount,
    missable: missableCount,
    totalSteps,
    appFiles: appFiles.length,
    appBytes: appFiles.reduce((sum, file) => sum + file.bytes, 0),
  },
  files: appFiles,
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'dossier.json'), `${JSON.stringify(dossier, null, 2)}\n`);
