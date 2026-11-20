// filters.js — pure filtering for the tracker toolbar: text search, kind, grade,
// and the hide-earned switch. The "missable" kind is a view over the missable flag,
// not a kind stored on the trophy, so it is handled here rather than in the data.

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable;
  return trophy.kind === kind;
}

export function trophyMatchesQuery(trophy, query) {
  if (!query) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.source, ...trophy.steps]
    .join('\n')
    .toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => haystack.includes(word));
}

export function applyFilters(trophies, filters, state) {
  return trophies.filter((trophy) => {
    if (!trophyMatchesKind(trophy, filters.kind)) return false;
    if (filters.tier !== 'all' && trophy.tier !== filters.tier) return false;
    if (filters.hideEarned && state.earned[trophy.id]) return false;
    return trophyMatchesQuery(trophy, filters.query);
  });
}

// A story trophy is spoiler-sensitive until it is earned: with the shield on, the
// tracker and guide hide its real name and description from a reader who has not
// reached it yet.
export function isSpoilerHidden(trophy, state) {
  return state.spoilerShield && trophy.kind === 'story' && !state.earned[trophy.id] && !state.revealed[trophy.id];
}
