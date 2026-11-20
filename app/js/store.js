// store.js — the reader's own ledger: which trophies are earned, and the spoiler shield.
// Progress lives in localStorage so it survives reloads, and can be exported to a JSON
// file and imported back on another browser or machine.

const STORAGE_KEY = 'sunset-ledger-v1';

const defaultState = () => ({ earned: {}, spoilerShield: true, revealed: {} });

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      earned: parsed.earned ?? {},
      spoilerShield: parsed.spoilerShield !== false,
      revealed: parsed.revealed ?? {},
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isEarned(state, id) {
  return state.earned[id] === true;
}

export function setEarned(state, id, earned) {
  if (earned) state.earned[id] = true;
  else delete state.earned[id];
  saveState(state);
}

export function earnedCount(state) {
  return Object.values(state.earned).filter(Boolean).length;
}

export function exportProgress(state) {
  const payload = JSON.stringify({ app: 'sunset-ledger', version: 1, earned: state.earned }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sunset-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  if (parsed.app !== 'sunset-ledger' || typeof parsed.earned !== 'object' || parsed.earned === null) {
    throw new Error('That file is not a Sunset Ledger progress export.');
  }
  const earned = {};
  for (const [id, value] of Object.entries(parsed.earned)) {
    if (value === true && Number.isInteger(Number(id))) earned[id] = true;
  }
  return earned;
}
