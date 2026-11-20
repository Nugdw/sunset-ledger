// Sunset Ledger — progress store.
//
// Everything a hunter marks off is kept in one localStorage record: which
// trophies are earned, which hidden trophies have been individually
// revealed, and whether the master spoiler switch is on. Nothing is sent
// anywhere; clearing the browser's site data resets the ledger.

const STORAGE_KEY = 'sunset-ledger-v1';

const blankState = () => ({ earned: {}, revealed: {}, spoilers: false });

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    return {
      earned: parsed.earned ?? {},
      revealed: parsed.revealed ?? {},
      spoilers: Boolean(parsed.spoilers),
    };
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The app
    // keeps working for the session; progress just will not persist.
  }
}

export function toggleEarned(state, id) {
  if (state.earned[id]) delete state.earned[id];
  else state.earned[id] = true;
  saveState(state);
}

export function reveal(state, id) {
  state.revealed[id] = true;
  saveState(state);
}

export function revealAll(state, trophies) {
  for (const trophy of trophies) {
    if (trophy.hidden) state.revealed[trophy.id] = true;
  }
  saveState(state);
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function isRevealed(state, trophy) {
  return state.spoilers || Boolean(state.revealed[trophy.id]);
}
