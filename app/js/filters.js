// Sunset Ledger — tracker filtering.
//
// Pure helpers: the tracker view hands over the full trophy list plus the
// current filter settings and gets back the trophies to draw. A trophy the
// hunter has not revealed yet still matches a search by its real name only
// when spoilers are on; otherwise it can only be found by tier, so the
// filter itself never leaks a hidden name.

export function blankFilters() {
  return { query: '', tier: 'all', remainingOnly: false, missableOnly: false };
}

function matchesQuery(trophy, query, spoilersShown) {
  if (!query) return true;
  const haystacks = [trophy.description, trophy.tier];
  if (spoilersShown || !trophy.hidden) haystacks.push(trophy.name);
  const needle = query.toLowerCase();
  return haystacks.some((text) => String(text).toLowerCase().includes(needle));
}

export function applyFilters(trophies, filters, state, spoilersShown) {
  return trophies.filter((trophy) => {
    if (filters.tier !== 'all' && trophy.tier !== filters.tier) return false;
    if (filters.remainingOnly && state.earned[trophy.id]) return false;
    if (filters.missableOnly && !trophy.missable) return false;
    return matchesQuery(trophy, filters.query.trim(), spoilersShown);
  });
}

export function sortForTracker(trophies) {
  const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  return trophies.slice().sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier] || a.id - b.id);
}
