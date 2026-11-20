// data.js — loads the trophy list that ships beside the app and normalises it once.
// The only request the app ever makes is this same-origin fetch of its own data file;
// everything after that runs from memory, so the guide works fully offline.

export const TROPHY_TOTAL = 55;

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json answered ${response.status}`);
  const parsed = await response.json();
  const list = Array.isArray(parsed) ? parsed : parsed.trophies;
  return list.map(normaliseTrophy).sort((a, b) => a.id - b.id);
}

function normaliseTrophy(raw) {
  return {
    id: Number(raw.id),
    name: String(raw.name),
    tier: String(raw.tier ?? raw.grade ?? 'bronze'),
    kind: String(raw.kind ?? 'activities'),
    hidden: Boolean(raw.hidden),
    missable: Boolean(raw.missable),
    description: String(raw.description ?? ''),
    guide: String(raw.guide ?? ''),
    steps: Array.isArray(raw.steps) ? raw.steps.map(String) : [],
    source: String(raw.source ?? ''),
  };
}

export function countByTier(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (Object.hasOwn(counts, trophy.tier)) counts[trophy.tier] += 1;
  }
  return counts;
}
