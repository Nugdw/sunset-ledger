// main.js — boots Sunset Ledger: loads the data, reads the route from the hash, renders
// the current view and the detail panel, and wires the toolbar (filters, spoiler shield,
// export/import) and every card event. Routes look like #/tracker, #/roadmap,
// #/missables, #/spoilers and #/guide, with an optional /<id> suffix that selects a
// trophy, e.g. #/guide/39 opens the guide at Sneakthief.

import { loadTrophies, countByTier, TROPHY_TOTAL } from './data.js';
import { loadState, saveState, setEarned, earnedCount, exportProgress, importProgress } from './store.js';
import { applyFilters } from './filters.js';
import { renderTracker, renderRoadmap, renderMissables, renderSpoilers, renderGuide, renderDetail } from './views.js';

const state = loadState();
let trophies = [];
let selectedId = -1;

const viewEl = document.getElementById('view');
const detailEl = document.getElementById('detail');

function currentRoute() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/');
  const name = ['tracker', 'roadmap', 'missables', 'spoilers', 'guide'].includes(parts[0]) ? parts[0] : 'tracker';
  const id = Number.parseInt(parts[1] ?? '', 10);
  return { name, id: Number.isInteger(id) ? id : -1 };
}

function readFilters() {
  return {
    query: document.getElementById('filter-q').value.trim(),
    kind: document.getElementById('filter-kind').value,
    tier: document.getElementById('filter-tier').value,
    hideEarned: document.getElementById('filter-unearned').checked,
  };
}

function updateProgress() {
  const earned = earnedCount(state);
  const pct = Math.round((earned / TROPHY_TOTAL) * 100);
  document.getElementById('progress-count').textContent = `${earned} / ${TROPHY_TOTAL}`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const tiers = countByTier(trophies.filter((t) => state.earned[t.id]));
  document.getElementById('progress-note').textContent = earned === 0
    ? 'No trophies checked off yet. Your ledger is saved in this browser.'
    : `Earned so far — platinum ${tiers.platinum}, gold ${tiers.gold}, silver ${tiers.silver}, bronze ${tiers.bronze}.`;
}

function render() {
  const route = currentRoute();
  if (route.id > 0) selectedId = route.id;
  for (const tab of document.querySelectorAll('[data-tab]')) {
    tab.classList.toggle('active', tab.dataset.tab === route.name);
  }
  if (route.name === 'tracker') {
    viewEl.innerHTML = renderTracker(applyFilters(trophies, readFilters(), state), state, selectedId);
  } else if (route.name === 'roadmap') {
    viewEl.innerHTML = renderRoadmap(trophies, state);
  } else if (route.name === 'missables') {
    viewEl.innerHTML = renderMissables(trophies, state, selectedId);
  } else if (route.name === 'spoilers') {
    viewEl.innerHTML = renderSpoilers(trophies, state);
  } else {
    viewEl.innerHTML = renderGuide(trophies, state, selectedId);
  }
  const selected = trophies.find((t) => t.id === selectedId) ?? null;
  detailEl.innerHTML = renderDetail(selected, state);
  updateProgress();
}

function onViewClick(event) {
  const reveal = event.target.closest('[data-reveal]');
  if (reveal) {
    state.revealed[Number(reveal.dataset.reveal)] = true;
    saveState(state);
    render();
    return;
  }
  const card = event.target.closest('[data-select]');
  if (card && !event.target.matches('input[type="checkbox"]')) {
    selectedId = Number(card.dataset.select);
    render();
  }
}

function onEarnChange(event) {
  if (event.target.id === 'guide-picker') {
    selectedId = Number(event.target.value);
    render();
    return;
  }
  const box = event.target.closest('[data-earn]');
  if (!box) return;
  setEarned(state, Number(box.dataset.earn), box.checked);
  render();
}

function wireToolbar() {
  for (const id of ['filter-q', 'filter-kind', 'filter-tier', 'filter-unearned']) {
    document.getElementById(id).addEventListener('input', render);
    document.getElementById(id).addEventListener('change', render);
  }
  const shield = document.getElementById('opt-spoilers');
  shield.checked = state.spoilerShield;
  shield.addEventListener('change', () => {
    state.spoilerShield = shield.checked;
    saveState(state);
    render();
  });
  document.getElementById('btn-export').addEventListener('click', () => exportProgress(state));
  const fileInput = document.getElementById('file-import');
  document.getElementById('btn-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    if (!fileInput.files[0]) return;
    try {
      state.earned = await importProgress(fileInput.files[0]);
      saveState(state);
      render();
    } catch {
      window.alert('That file could not be imported as Sunset Ledger progress.');
    }
  });
}

async function boot() {
  try {
    trophies = await loadTrophies();
  } catch {
    viewEl.innerHTML = '<h2>The ledger could not load</h2><p>data/trophies.json did not answer — serve the app folder over HTTP (fetch of a local file is blocked in some browsers) and reload.</p>';
    return;
  }
  wireToolbar();
  viewEl.addEventListener('click', onViewClick);
  viewEl.addEventListener('change', onEarnChange);
  detailEl.addEventListener('change', onEarnChange);
  window.addEventListener('hashchange', render);
  render();
}

boot();
