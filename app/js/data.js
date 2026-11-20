// Loads the guide's one data file, app/data/trophies.json, and indexes it for the views.
//
// The file holds the official list (each trophy's name, description and grade as PlayStation publishes them),
// this guide's own words for every trophy (guide, numbered steps, tips, rarity, missable flag, roadmap stage),
// the roadmap's stages, the missables watch list, and the register of sources every step cites. It is fetched
// from the app's own server, like every file this app loads; the app fetches nothing from anywhere else.

export async function loadGuideData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`data/trophies.json answered ${response.status}`);
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const sources = new Map((data.sources ?? []).map((source) => [source.key, source]));
  return {
    game: data.game ?? 'Grand Theft Auto VI',
    platform: data.platform ?? 'PlayStation 5',
    trophies,
    byId,
    sources,
    roadmap: data.roadmap ?? [],
    watchlist: data.watchlist ?? [],
    facts: data.facts ?? [],
  };
}

/** The source register entry a citation key names, or a plain label when the key is unknown. */
export function sourceOf(data, key) {
  return data.sources.get(key) ?? { key, name: key, url: '', detail: '', accessed: '' };
}

/** A trophy's sources as register entries, in the order its entry lists them. */
export function sourcesOf(data, trophy) {
  return (trophy.sources ?? []).map((key) => sourceOf(data, key));
}

/** The trophies of one roadmap stage, in list order. */
export function trophiesOfStage(data, stage) {
  return data.trophies.filter((trophy) => trophy.stage === stage);
}

/** How many of a list of trophies the store marks earned. */
export function earnedAmong(store, trophies) {
  return trophies.filter((trophy) => store.isEarned(trophy.id)).length;
}
