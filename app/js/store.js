// The tracker's saved progress: earned ticks, per-trophy counters and the two settings, held in the browser's
// localStorage under one key. Nothing is sent anywhere; export writes a file the reader downloads, import reads
// one back. Every change is saved at once and told to the listeners, so the header, the list and the planner
// never disagree.

const STORAGE_KEY = 'sunset-ledger-progress-v1';

const blankProgress = () => ({
  version: 1,
  earned: {},
  counts: {},
  settings: { spoilers: false, hideEarned: false },
});

function readSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankProgress();
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return blankProgress();
    return {
      version: 1,
      earned: parsed.earned ?? {},
      counts: parsed.counts ?? {},
      settings: { spoilers: false, hideEarned: false, ...(parsed.settings ?? {}) },
    };
  } catch {
    return blankProgress();
  }
}

export function createStore() {
  let state = readSaved();
  const listeners = new Set();

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // A browser that refuses storage still gets a working guide; progress just lasts the session.
    }
    for (const listener of listeners) listener(state);
  };

  return {
    get state() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isEarned(id) {
      return state.earned[id] === true;
    },
    setEarned(id, earned) {
      if (earned) state.earned[id] = true;
      else delete state.earned[id];
      save();
    },
    countOf(id) {
      return state.counts[id] ?? 0;
    },
    setCount(id, value) {
      const clean = Math.max(0, Math.floor(Number(value) || 0));
      if (clean === 0) delete state.counts[id];
      else state.counts[id] = clean;
      save();
    },
    setting(name) {
      return state.settings[name] === true;
    },
    setSetting(name, value) {
      state.settings[name] = value === true;
      save();
    },
    exportText() {
      return JSON.stringify({ app: 'sunset-ledger', ...state }, null, 2);
    },
    importText(text) {
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null || typeof parsed.earned !== 'object' || parsed.earned === null) {
        throw new Error('That file holds no Sunset Ledger progress.');
      }
      state = {
        version: 1,
        earned: parsed.earned ?? {},
        counts: parsed.counts ?? {},
        settings: { spoilers: false, hideEarned: false, ...(parsed.settings ?? {}) },
      };
      save();
    },
    reset() {
      state = blankProgress();
      save();
    },
  };
}

/** Downloads the exported progress as a JSON file, the way the settings page's Export button hands it over. */
export function downloadProgress(store) {
  const blob = new Blob([store.exportText()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'sunset-ledger-progress.json';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
