// Sunset Ledger boots here: load the data, open the store, render, and wire every control.
//
// Views are the page's five sections, chosen by the hash (#tracker, #roadmap, #missables, #next, #settings).
// The tracker keeps a selected trophy whose guide fills the detail pane; every control writes through the store,
// and the store's save re-renders, so the header count, the list, the roadmap and the planner always agree.

import { loadGuideData } from './data.js';
import { createStore, downloadProgress } from './store.js';
import { visibleTrophies } from './filters.js';
import {
  renderProgressCard,
  renderTrophyList,
  renderTrophyDetail,
  renderRoadmap,
  renderMissables,
  renderNextUp,
  renderSourcesRegister,
} from './views.js';

const VIEW_NAMES = ['tracker', 'roadmap', 'missables', 'next', 'settings'];

const els = {
  earnedCount: document.getElementById('earned-count'),
  progressFill: document.getElementById('progress-fill'),
  progressBar: document.getElementById('progress-bar'),
  progressGrades: document.getElementById('progress-grades'),
  tabs: [...document.querySelectorAll('#view-tabs .tab')],
  sections: Object.fromEntries(VIEW_NAMES.map((name) => [name, document.getElementById(`view-${name}`)])),
  search: document.getElementById('filter-search'),
  chips: [...document.querySelectorAll('#kind-chips .chip')],
  grade: document.getElementById('filter-grade'),
  hideEarned: document.getElementById('filter-hide-earned'),
  spoilers: document.getElementById('filter-spoilers'),
  resultLine: document.getElementById('result-line'),
  list: document.getElementById('trophy-list'),
  detail: document.getElementById('detail-pane'),
  roadmapIntro: document.getElementById('roadmap-intro'),
  roadmapStages: document.getElementById('roadmap-stages'),
  missablesIntro: document.getElementById('missables-intro'),
  missablesList: document.getElementById('missables-list'),
  nextList: document.getElementById('next-list'),
  settingSpoilers: document.getElementById('setting-spoilers'),
  exportButton: document.getElementById('export-button'),
  importFile: document.getElementById('import-file'),
  importNote: document.getElementById('import-note'),
  resetButton: document.getElementById('reset-button'),
  register: document.getElementById('sources-register'),
  missableBadge: document.getElementById('missable-badge'),
};

const filters = { kind: 'all', grade: 'all', search: '' };
let data = null;
let store = null;
let selectedId = 28; // Positive Mental Attitude: the one missable, and the guide's fullest page, opens first.
let currentView = 'tracker';

function currentFilters() {
  return { ...filters, hideEarned: store.setting('hideEarned') };
}

function render() {
  renderProgressCard(data, store, els);
  els.hideEarned.checked = store.setting('hideEarned');
  els.spoilers.checked = store.setting('spoilers');
  els.settingSpoilers.checked = store.setting('spoilers');
  const visible = visibleTrophies(data, store, currentFilters());
  if (!visible.some((trophy) => trophy.id === selectedId) && visible.length > 0) {
    // Keep the selection on a visible trophy so the detail pane never points at a filtered-out row.
    if (!data.byId.has(selectedId)) selectedId = visible[0].id;
  }
  renderTrophyList(data, store, visible, selectedId, { list: els.list, resultLine: els.resultLine });
  renderTrophyDetail(data, store, data.byId.get(selectedId), { detail: els.detail });
  renderRoadmap(data, store, { intro: els.roadmapIntro, stages: els.roadmapStages });
  renderMissables(data, store, { intro: els.missablesIntro, list: els.missablesList });
  renderNextUp(data, store, { list: els.nextList });
}

function showView(name) {
  currentView = VIEW_NAMES.includes(name) ? name : 'tracker';
  for (const viewName of VIEW_NAMES) els.sections[viewName].hidden = viewName !== currentView;
  for (const tab of els.tabs) tab.classList.toggle('is-active', tab.dataset.view === currentView);
}

function selectTrophy(id, jumpToTracker = false) {
  selectedId = id;
  if (jumpToTracker) location.hash = 'tracker';
  render();
}

function wireEvents() {
  for (const tab of els.tabs) {
    tab.addEventListener('click', () => {
      location.hash = tab.dataset.view;
    });
  }
  window.addEventListener('hashchange', () => showView(location.hash.replace('#', '')));

  els.search.addEventListener('input', () => {
    filters.search = els.search.value;
    render();
  });
  for (const chip of els.chips) {
    chip.addEventListener('click', () => {
      filters.kind = chip.dataset.kind;
      for (const other of els.chips) other.classList.toggle('is-active', other === chip);
      render();
    });
  }
  els.grade.addEventListener('change', () => {
    filters.grade = els.grade.value;
    render();
  });
  els.hideEarned.addEventListener('change', () => store.setSetting('hideEarned', els.hideEarned.checked));
  els.spoilers.addEventListener('change', () => store.setSetting('spoilers', els.spoilers.checked));
  els.settingSpoilers.addEventListener('change', () => store.setSetting('spoilers', els.settingSpoilers.checked));

  els.list.addEventListener('change', (event) => {
    const box = event.target.closest('[data-earn]');
    if (box) store.setEarned(Number(box.dataset.earn), box.checked);
  });
  els.list.addEventListener('click', (event) => {
    const row = event.target.closest('[data-select]');
    if (row) selectTrophy(Number(row.dataset.select));
  });
  els.list.addEventListener('keydown', (event) => {
    const row = event.target.closest('[data-select]');
    if (row && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      selectTrophy(Number(row.dataset.select));
    }
  });

  els.detail.addEventListener('change', (event) => {
    const box = event.target.closest('[data-earn-detail]');
    if (box) store.setEarned(Number(box.dataset.earnDetail), box.checked);
  });
  els.detail.addEventListener('click', (event) => {
    const button = event.target.closest('[data-count]');
    if (!button) return;
    const trophy = data.byId.get(selectedId);
    const next = store.countOf(selectedId) + Number(button.dataset.count);
    store.setCount(selectedId, next);
    if (trophy?.target && next >= trophy.target) store.setEarned(selectedId, true);
  });

  els.roadmapStages.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-open]');
    if (chip) selectTrophy(Number(chip.dataset.open), true);
  });
  els.nextList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-done]');
    if (button) store.setEarned(Number(button.dataset.done), true);
  });

  els.exportButton.addEventListener('click', () => downloadProgress(store));
  els.importFile.addEventListener('change', async () => {
    const file = els.importFile.files?.[0];
    if (!file) return;
    try {
      store.importText(await file.text());
      els.importNote.textContent = 'Progress imported and saved.';
    } catch (error) {
      els.importNote.textContent = `Import failed: ${error.message}`;
    }
  });
  els.resetButton.addEventListener('click', () => {
    store.reset();
    els.importNote.textContent = 'All saved progress cleared.';
  });
}

async function boot() {
  try {
    data = await loadGuideData();
  } catch (error) {
    document.querySelector('main').innerHTML = `<p class="empty-note">The guide's data file could not be loaded (${error.message}). Serve the app/ folder with any static file server and open index.html again.</p>`;
    return;
  }
  store = createStore();
  els.missableBadge.textContent = String(data.trophies.filter((trophy) => trophy.missable).length);
  renderSourcesRegister(data, { register: els.register });
  wireEvents();
  store.subscribe(render);
  showView(location.hash.replace('#', '') || 'tracker');
  render();
}

boot();
