// Sunset Ledger — boot and wiring.
//
// Loads the dataset, restores the hunter's progress, and keeps the five
// views, the filter bar and the header progress in step. Rendering is
// delegated to views.js; this file owns the state and the events.

import { loadTrophies, tierCounts, TIER_LABELS } from './data.js';
import { loadState, saveState, toggleEarned, reveal, revealAll, earnedCount } from './store.js';
import { blankFilters, applyFilters, sortForTracker } from './filters.js';
import { trackerView, roadmapView, missablesView, spoilersView, guideView } from './views.js';

const viewEl = document.getElementById('view');
const filterBar = document.getElementById('filter-bar');

let trophies = [];
let state = loadState();
let filters = blankFilters();
let currentView = 'tracker';
let guideId = 1;

function renderHeader() {
  const total = trophies.length;
  const earned = earnedCount(state);
  document.getElementById('progress-count').textContent = `${earned} / ${total}`;
  document.getElementById('progress-pct').textContent = total ? `${Math.round((earned / total) * 100)}%` : '0%';
  document.getElementById('progress-fill').style.width = total ? `${(earned / total) * 100}%` : '0%';
  const counts = tierCounts(trophies);
  document.getElementById('tier-counts').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((tier) => {
      const got = trophies.filter((t) => t.tier === tier && state.earned[t.id]).length;
      return `<span>${TIER_LABELS[tier]} ${got}/${counts[tier]}</span>`;
    })
    .join('');
  document.getElementById('spoiler-toggle').checked = state.spoilers;
}

function render() {
  renderHeader();
  filterBar.style.display = currentView === 'tracker' ? '' : 'none';
  if (currentView === 'tracker') {
    const visible = sortForTracker(applyFilters(trophies, filters, state, state.spoilers));
    viewEl.innerHTML = trackerView(visible, state);
  } else if (currentView === 'roadmap') {
    viewEl.innerHTML = roadmapView(trophies, state);
  } else if (currentView === 'missables') {
    viewEl.innerHTML = missablesView(trophies, state);
  } else if (currentView === 'spoilers') {
    viewEl.innerHTML = spoilersView(trophies, state);
  } else {
    viewEl.innerHTML = guideView(trophies, state, guideId);
  }
}

function setView(name) {
  currentView = name;
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.view === name);
  });
  render();
}

// Deep links: #view=roadmap (or tracker, missables, spoilers, guide) opens
// that view directly, and #guide=<id> preselects a trophy in the Guide.
// Tab switches keep the hash in step, so any view can be bookmarked.
function applyHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const view = params.get('view');
  if (view && ['tracker', 'roadmap', 'missables', 'spoilers', 'guide'].includes(view)) {
    currentView = view;
  }
  const gid = Number(params.get('guide'));
  if (Number.isInteger(gid) && gid >= 1 && gid <= 55) guideId = gid;
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
  state.spoilers = event.target.checked;
  saveState(state);
  render();
});

document.getElementById('filter-query').addEventListener('input', (event) => {
  filters.query = event.target.value;
  render();
});
document.getElementById('filter-tier').addEventListener('change', (event) => {
  filters.tier = event.target.value;
  render();
});
document.getElementById('filter-remaining').addEventListener('change', (event) => {
  filters.remainingOnly = event.target.checked;
  render();
});
document.getElementById('filter-missable').addEventListener('change', (event) => {
  filters.missableOnly = event.target.checked;
  render();
});

viewEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === 'guide' || button.dataset.action === 'pick') {
    guideId = id;
    setView('guide');
  } else if (button.dataset.action === 'reveal') {
    reveal(state, id);
    render();
  } else if (button.dataset.action === 'reveal-all') {
    revealAll(state, trophies);
    render();
  }
});

viewEl.addEventListener('change', (event) => {
  const box = event.target.closest('[data-action="earn"]');
  if (!box) return;
  toggleEarned(state, Number(box.dataset.id));
  render();
});

loadTrophies().then((loaded) => {
  if (!loaded) {
    viewEl.innerHTML = `
      <div class="error-box">
        <p>The ledger could not load its trophy list (<code>data/trophies.json</code>).</p>
        <p>Serve the app over HTTP — for example <code>python3 -m http.server 8080 --directory app</code> —
        instead of opening the page as a <code>file://</code> URL, and reload.</p>
      </div>`;
    return;
  }
  trophies = loaded;
  applyHash();
  setView(currentView);
});
