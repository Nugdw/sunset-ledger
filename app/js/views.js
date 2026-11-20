// Sunset Ledger — the five views.
//
// Every view is a pure render from (trophies, state) to an HTML string;
// main.js swaps the string into the page and lets clicks and changes bubble
// back up through data-action attributes. Hidden trophies are drawn as
// "Hidden Trophy" with a blurred description until the hunter reveals them,
// so no view ever prints a spoiler by accident.

import { TIER_LABELS } from './data.js';
import { isRevealed } from './store.js';

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function badges(trophy) {
  const parts = [`<span class="badge tier-${trophy.tier}">${TIER_LABELS[trophy.tier]}</span>`];
  if (trophy.hidden) parts.push('<span class="badge badge-hidden">Hidden</span>');
  if (trophy.missable) parts.push('<span class="badge badge-missable">Missable</span>');
  return `<span class="badges">${parts.join('')}</span>`;
}

export function trophyCard(trophy, state, { guideButton = true } = {}) {
  const earned = Boolean(state.earned[trophy.id]);
  const shown = isRevealed(state, trophy);
  const concealed = trophy.hidden && !shown;
  const name = concealed ? 'Hidden Trophy' : trophy.name;
  const actions = [];
  if (concealed) actions.push(`<button class="link-button" data-action="reveal" data-id="${trophy.id}">Reveal</button>`);
  if (guideButton) actions.push(`<button class="link-button" data-action="guide" data-id="${trophy.id}">Read the guide</button>`);
  return `
  <article class="trophy-card tier-${trophy.tier}${earned ? ' is-earned' : ''}">
    <div class="trophy-top">
      <input class="trophy-check" type="checkbox" data-action="earn" data-id="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark ${esc(name)} as earned">
      <span class="trophy-name">${esc(name)}</span>
      ${badges(trophy)}
    </div>
    <p class="trophy-desc${concealed ? ' blur-me' : ''}">${esc(trophy.description)}</p>
    ${concealed ? '<span class="reveal-note">Spoiler — reveal when you are ready.</span>' : ''}
    <div class="card-actions">${actions.join('')}</div>
  </article>`;
}

export function trackerView(trophies, state) {
  if (trophies.length === 0) {
    return `<h2>Tracker</h2><div class="empty-note">No trophies match those filters. Loosen the search and the ledger fills back up.</div>`;
  }
  const cards = trophies.map((trophy) => trophyCard(trophy, state)).join('');
  return `
    <h2>Tracker</h2>
    <p class="lede">The whole list, yours to work through. Tick a trophy off and the ledger remembers — here, on this device, between visits.</p>
    <div class="card-grid">${cards}</div>`;
}

const ROADMAP = [
  {
    title: 'Stage 1 — Chapter and Verse',
    text: 'Play the story straight through. The chapter trophies, the set-piece missions and the finale all land here, and nothing in this stage can be missed: chapters can be replayed, but a first run in order is the cleanest way through Leonida.',
    ids: [2, 8, 3, 10, 4, 11, 5, 12, 6, 9, 13, 7],
  },
  {
    title: 'Stage 2 — Friends of the Family',
    text: 'Work the character strands that open up around the story: Andy, Kenton, Billy, Randy and Tyrone each end in a finale mission of their own, and the Strangers & Freaks silver caps the stage. Bret\u2019s hunt and Cal\u2019s fishing challenge belong to this wandering phase too.',
    ids: [22, 23, 24, 26, 27, 25, 29, 20],
  },
  {
    title: 'Stage 3 — Vice City Tourist',
    text: 'See the state and try everything once: uncover the map, sample every activity type, race, shop, and start registering the vehicles you will need for the long counters.',
    ids: [16, 42, 44, 21, 18, 19, 35, 55, 53, 54],
  },
  {
    title: 'Stage 4 — The Grind',
    text: 'The big numbers live here: 250 stunts, 42 gold shooting-range medals, 100 WAiNK spots, the card sets, the bank vaults and the laundering total. Rotate between them a few at a time and none of them feels like a wall.',
    ids: [15, 17, 28, 30, 31, 32, 52, 40, 43, 41],
  },
  {
    title: 'Stage 5 — Cleanup at Dusk',
    text: 'Finish with the moments: the partner trophies, the secrets, the showroom escape — and Actions Speak Louder, the one missable, which needs a save kept before the late-story choice. Then close out 100% completion and let the platinum pop.',
    ids: [33, 34, 36, 37, 38, 39, 45, 46, 47, 48, 49, 50, 51, 14, 1],
  },
];

export function roadmapView(trophies, state) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const stages = ROADMAP.map((stage) => {
    const items = stage.ids.map((id) => {
      const trophy = byId.get(id);
      if (!trophy) return '';
      const shown = isRevealed(state, trophy);
      const label = trophy.hidden && !shown ? 'Hidden Trophy' : trophy.name;
      return `<li class="${state.earned[id] ? 'done' : ''}">${esc(label)} <span class="badge tier-${trophy.tier}">${TIER_LABELS[trophy.tier]}</span></li>`;
    }).join('');
    return `<section class="stage"><h3>${esc(stage.title)}</h3><p>${esc(stage.text)}</p><ul>${items}</ul></section>`;
  }).join('');
  return `
    <h2>Roadmap</h2>
    <p class="lede">Five stages, story first and platinum last. The order is a suggestion, not a fence — but the missable warning in Stage 5 is real, so read it before your first run ends.</p>
    ${stages}`;
}

export function missablesView(trophies, state) {
  const missables = trophies.filter((trophy) => trophy.missable);
  const cards = missables.map((trophy) => trophyCard(trophy, state)).join('');
  return `
    <h2>Missables</h2>
    <div class="warning-box">
      <strong>One trophy in this game can be lost for the whole playthrough.</strong>
      Everything else can be cleaned up after the credits with chapter replay and free roam.
      The exception is below — it turns on a choice the story makes you pick once.
    </div>
    <p class="lede">Keep a manual save before the late-story choice point (the end of Chapter 4 is the safe habit),
    and this page becomes a formality. If you do miss it, a fresh run to that choice takes a few hours, not a full replay.</p>
    <div class="card-grid">${cards}</div>`;
}

export function spoilersView(trophies, state) {
  const hidden = trophies.filter((trophy) => trophy.hidden);
  const cards = hidden.map((trophy) => trophyCard(trophy, state)).join('');
  return `
    <h2>Spoilers</h2>
    <p class="lede">Twenty-eight trophies are hidden on PlayStation until the moment they pop. They are gathered here,
    blurred, and stay that way until you reveal one — or flip the master switch in the header.
    <button class="link-button" data-action="reveal-all">Reveal all 28</button></p>
    <div class="card-grid">${cards}</div>`;
}

export function guideView(trophies, state, selectedId) {
  const selected = trophies.find((trophy) => trophy.id === selectedId) ?? trophies[0];
  const picks = trophies.map((trophy) => {
    const shown = isRevealed(state, trophy);
    const label = trophy.hidden && !shown ? `Hidden Trophy · #${trophy.id}` : trophy.name;
    return `<button class="guide-pick${trophy.id === selected.id ? ' is-active' : ''}" data-action="pick" data-id="${trophy.id}">${esc(label)}</button>`;
  }).join('');
  const shown = isRevealed(state, selected);
  const name = selected.hidden && !shown ? 'Hidden Trophy' : selected.name;
  const steps = (selected.steps ?? []).map((step) => `<li>${esc(step)}</li>`).join('');
  const body = shown || !selected.hidden
    ? `<h3>${esc(name)}</h3>
       <p>${esc(selected.description)}</p>
       <p>${esc(selected.guide)}</p>
       <h4>Steps</h4>
       <ol>${steps}</ol>
       <p class="guide-source">Source: ${esc(selected.source)}</p>`
    : `<h3>Hidden Trophy</h3>
       <p class="reveal-note">This guide is a spoiler from its first line.</p>
       <p><button class="link-button" data-action="reveal" data-id="${selected.id}">Reveal it anyway</button></p>`;
  return `
    <h2>Guide</h2>
    <p class="lede">One trophy at a time, in full: what the game wants, the fastest honest route to it, and where the facts were checked.</p>
    <div class="guide-layout">
      <div class="guide-picker">${picks}</div>
      <article class="guide-body">
        <div class="trophy-top">${badges(selected)}</div>
        ${body}
      </article>
    </div>`;
}
