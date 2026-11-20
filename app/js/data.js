// Sunset Ledger — dataset access.
//
// The trophy list lives in app/data/trophies.json, next to this app, and is
// fetched relative to the page so the app works from any static host. The
// fetch is the one and only load: if it fails (for example the page was
// opened as a file:// URL, where fetch of a sibling file is blocked), the
// caller gets null and shows the serve-it-over-HTTP notice instead of a
// silently empty guide.

export const TIERS = ['platinum', 'gold', 'silver', 'bronze'];

export const TIER_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export async function loadTrophies() {
  try {
    const response = await fetch('data/trophies.json');
    if (!response.ok) return null;
    const parsed = await response.json();
    const list = Array.isArray(parsed) ? parsed : parsed.trophies;
    if (!Array.isArray(list) || list.length === 0) return null;
    return list.slice().sort((a, b) => a.id - b.id);
  } catch {
    return null;
  }
}

export function tierCounts(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0, total: trophies.length };
  for (const trophy of trophies) {
    if (Object.hasOwn(counts, trophy.tier)) counts[trophy.tier] += 1;
  }
  return counts;
}

export function totalSteps(trophies) {
  return trophies.reduce((sum, trophy) => sum + (Array.isArray(trophy.steps) ? trophy.steps.length : 0), 0);
}
