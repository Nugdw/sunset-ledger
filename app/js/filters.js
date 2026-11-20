// Which trophies the tracker shows, and what the spoiler shield hides.
//
// Kinds are the guide's own tags on each trophy: story, collectibles and activities are the tracker's filters,
// missable is its own filter fed by the missable flag, and online is a filter too — the official list holds no
// online trophies at all, so that filter honestly shows an empty page with the fact stated, never a fake row.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

/** Whether a trophy belongs to a filter kind: missable reads the flag, everything else reads its kind tags. */
export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return (trophy.kinds ?? []).includes(kind);
}

/** Whether a trophy belongs to a grade filter ('all' passes everything). */
export function trophyMatchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

/** Whether the search text names the trophy, its official description, a mission or an activity in its guide. */
export function trophyMatchesSearch(trophy, query) {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;
  const haystack = [trophy.name, trophy.description, trophy.guide ?? '', ...(trophy.steps ?? []).map((step) => step.text)]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

/**
 * Whether the spoiler shield hides this trophy right now: the shield is on, the trophy is a story trophy, and it
 * has not been earned yet. Once earned, its name and description show like any other.
 */
export function trophyIsShielded(trophy, store) {
  return store.setting('spoilers') && (trophy.kinds ?? []).includes('story') && !store.isEarned(trophy.id);
}

/** The tracker's visible trophies for a filter state, in official list order. */
export function visibleTrophies(data, store, filters) {
  return data.trophies.filter((trophy) => {
    if (!trophyMatchesKind(trophy, filters.kind)) return false;
    if (!trophyMatchesGrade(trophy, filters.grade)) return false;
    if (!trophyMatchesSearch(trophy, filters.search)) return false;
    if (filters.hideEarned && store.isEarned(trophy.id)) return false;
    return true;
  });
}

/**
 * The Next Up order: the missable trophy first while it is unearned, then the earliest roadmap stage, then the
 * trophy whose counter is proportionally closest to its target, then list order.
 */
export function nextUpOrder(data, store) {
  const remaining = data.trophies.filter((trophy) => !store.isEarned(trophy.id) && trophy.grade !== 'platinum');
  const progress = (trophy) => (trophy.target ? store.countOf(trophy.id) / trophy.target : 0);
  return remaining.sort((a, b) => {
    if (a.missable !== b.missable) return a.missable ? -1 : 1;
    if (a.stage !== b.stage) return a.stage - b.stage;
    if (progress(a) !== progress(b)) return progress(b) - progress(a);
    return a.id - b.id;
  });
}
