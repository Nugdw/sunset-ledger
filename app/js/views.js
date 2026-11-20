// views.js — renders the five views (Tracker, Roadmap, Missables, Spoilers, Guide) and
// the detail panel. Every view is a string built from the trophy data and the reader's
// state; main.js wires the events after each render. Story trophies stay behind the
// spoiler shield here exactly as filters.js decides.

import { KIND_LABELS, isSpoilerHidden } from './filters.js';
import { isEarned } from './store.js';

export function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function chips(trophy) {
  const parts = [
    `<span class="chip tier-${trophy.tier}">${esc(trophy.tier)}</span>`,
    `<span class="chip">${esc(KIND_LABELS[trophy.kind] ?? trophy.kind)}</span>`,
  ];
  if (trophy.missable) parts.push('<span class="chip missable">Missable</span>');
  if (trophy.hidden) parts.push('<span class="chip hidden-chip">Hidden</span>');
  return parts.join(' ');
}

export function trophyCard(trophy, state, selectedId) {
  const earned = isEarned(state, trophy.id);
  const hidden = isSpoilerHidden(trophy, state);
  const name = hidden ? '<span class="spoiler-name">Hidden story trophy</span>' : esc(trophy.name);
  const desc = hidden
    ? '<span class="blurred">A story beat you have not reached yet. Earn it, or lift the spoiler shield, to read it.</span>'
    : esc(trophy.description);
  return `<article class="card tier-${trophy.tier}${earned ? ' earned' : ''}${trophy.id === selectedId ? ' selected' : ''}" data-select="${trophy.id}">
    <div class="row">
      <input type="checkbox" data-earn="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark ${esc(trophy.name)} as earned">
      <div>
        <h3>${name}</h3>
        <p class="desc">${desc}</p>
        <div class="meta">${chips(trophy)}</div>
      </div>
    </div>
  </article>`;
}

export function renderTracker(trophies, state, selectedId) {
  const cards = trophies.map((trophy) => trophyCard(trophy, state, selectedId)).join('');
  return `<h2>Tracker</h2>
    <p class="lede">The full official list of 55. Tick a trophy off as you earn it — the tick is saved
    in this browser — and click any card to open its guide in the panel. The grade counts are
    1 platinum, 2 gold, 6 silver and 46 bronze, as PlayStation publishes them.</p>
    <p class="count-line">Showing ${trophies.length} of 55 trophies</p>
    <div class="cards">${cards || '<p>No trophy matches those filters.</p>'}</div>`;
}

const ROADMAP_STAGES = [
  {
    title: 'Stage 1 — Play the story once, eyes open',
    note: 'Work through Jason and Lucia\'s story in order. Every story trophy below pops on the way; the one missable trophy in the whole list sits in this stage, so read its guide before you start the late chapters.',
    pick: (t) => t.kind === 'story' && t.id !== 1,
  },
  {
    title: 'Stage 2 — Sweep the collectibles',
    note: 'With the map open, clear the collection ledgers: card sets, meditation spots, the vehicle log and the garage properties. None of these can be missed.',
    pick: (t) => t.kind === 'collectibles',
  },
  {
    title: 'Stage 3 — Activities, medals and scores',
    note: 'The long tail: stunts, shooting-range golds, races, robberies and the 100% completion grind. Do these in free roam between mop-up sessions.',
    pick: (t) => t.kind === 'activities' && t.id !== 14,
  },
  {
    title: 'Stage 4 — Online and partner play',
    note: 'The handful of trophies that need other players or the in-game apps. Short, but schedule them while the servers are lively.',
    pick: (t) => t.kind === 'online',
  },
  {
    title: 'Stage 5 — 100% and the platinum',
    note: 'A Long Road is the 100% completion trophy; when it pops, only the platinum itself is left, and it awards automatically once the other 54 are yours.',
    pick: (t) => t.id === 14 || t.id === 1,
  },
];

export function renderRoadmap(trophies, state) {
  const stages = ROADMAP_STAGES.map((stage) => {
    const items = trophies.filter(stage.pick);
    const rows = items
      .map((t) => `<li>${isEarned(state, t.id) ? '<span class="done">✓</span> ' : ''}${esc(t.name)}${t.missable ? ' <span class="chip missable">Missable</span>' : ''}</li>`)
      .join('');
    return `<div class="stage"><h3>${esc(stage.title)}</h3><p>${esc(stage.note)}</p><ul>${rows}</ul></div>`;
  }).join('');
  return `<h2>Roadmap to the platinum</h2>
    <p class="lede">Five stages, built from the official descriptions: story first (it unlocks the map,
    the partners and most activities), collections next, the activity grind after that, online while
    it is busy, and the 100% trophy to close. One trophy in the game can be missed — it is flagged
    in Stage 1 and on the Missables tab.</p>${stages}`;
}

export function renderMissables(trophies, state, selectedId) {
  const missables = trophies.filter((t) => t.missable);
  const cards = missables.map((trophy) => trophyCard(trophy, state, selectedId)).join('');
  return `<h2>Missables</h2>
    <div class="alert"><strong>One trophy in this list can be permanently missed.</strong>
    It turns on a story choice, and a finished save cannot go back for it. Read its guide in the
    panel before you reach the choice, or keep a spare save from the chapter before it.</div>
    <div class="cards">${cards}</div>
    <p class="lede" style="margin-top:14px">Everything else in the game can be earned after the story
    ends, in free roam or chapter select — the roadmap is an order of convenience for those, not a deadline.</p>`;
}

export function renderSpoilers(trophies, state) {
  const hidden = trophies.filter((t) => t.hidden);
  const cards = hidden.map((trophy) => {
    const revealed = state.earned[trophy.id] || state.revealed[trophy.id] || !state.spoilerShield;
    if (revealed) return trophyCard(trophy, state, -1);
    return `<article class="card tier-${trophy.tier}">
      <h3><span class="spoiler-name">Hidden trophy #${trophy.id}</span></h3>
      <p class="desc blurred">${esc(trophy.description)}</p>
      <div class="meta">${chips(trophy)}</div>
      <button type="button" class="reveal-btn" data-reveal="${trophy.id}">Reveal anyway</button>
    </article>`;
  }).join('');
  return `<h2>Spoilers</h2>
    <p class="lede">28 of the 55 trophies are hidden on PlayStation until earned, and the story ones stay
    behind the spoiler shield in this guide until you earn them. This tab lists every hidden trophy;
    reveal one only if you are sure — a reveal is remembered.</p>
    <div class="cards">${cards}</div>`;
}

export function renderGuide(trophies, state, selectedId) {
  const trophy = trophies.find((t) => t.id === selectedId) ?? trophies.find((t) => !isSpoilerHidden(t, state)) ?? trophies[0];
  const options = trophies.map((t) => {
    const label = isSpoilerHidden(t, state) ? `Hidden story trophy (#${t.id})` : t.name;
    return `<option value="${t.id}"${t.id === trophy.id ? ' selected' : ''}>${esc(label)}</option>`;
  }).join('');
  const hidden = isSpoilerHidden(trophy, state);
  const body = hidden
    ? '<p><span class="blurred">Guide hidden by the spoiler shield. Earn the trophy, reveal it on the Spoilers tab, or switch the shield off to read it.</span></p>'
    : `<p>${esc(trophy.guide)}</p>
       <ol>${trophy.steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
       <p class="source">Sources: ${esc(trophy.source)}</p>`;
  return `<h2>Guide</h2>
    <p class="lede">One trophy at a time, in our own words, with the sources each guide rests on.
    A guide that names no source for a claim earns no credit here — so each one names them.</p>
    <label class="tool" style="margin-bottom:14px">Trophy
      <select id="guide-picker">${options}</select>
    </label>
    <article class="stage" id="guide-${trophy.id}">
      <h3>${hidden ? 'Hidden story trophy' : esc(trophy.name)} <span class="chip tier-${trophy.tier}">${esc(trophy.tier)}</span>${trophy.missable ? ' <span class="chip missable">Missable</span>' : ''}</h3>
      <p class="desc">${hidden ? '' : esc(trophy.description)}</p>
      ${body}
    </article>`;
}

export function renderDetail(trophy, state) {
  if (!trophy) {
    return `<h2>No trophy selected</h2>
      <p class="empty">Click any trophy card and its full guide — what to do, the steps, and the
      sources it rests on — opens here.</p>`;
  }
  const earned = isEarned(state, trophy.id);
  const hidden = isSpoilerHidden(trophy, state);
  const name = hidden ? 'Hidden story trophy' : esc(trophy.name);
  const body = hidden
    ? '<p><span class="blurred">This guide is behind the spoiler shield.</span></p>'
    : `<p class="desc">${esc(trophy.description)}</p>
       <h4>The guide</h4>
       <p>${esc(trophy.guide)}</p>
       <h4>Steps</h4>
       <ol>${trophy.steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
       <h4>Sources</h4>
       <p class="source">${esc(trophy.source)}</p>`;
  return `<h2>${name}</h2>
    <div class="meta">${chips(trophy)}</div>
    ${trophy.missable ? '<div class="alert" style="margin-top:10px"><strong>Missable.</strong> This one turns on a story choice — read the guide before you reach it, or keep a spare save.</div>' : ''}
    ${body}
    <label class="earn"><input type="checkbox" data-earn="${trophy.id}" ${earned ? 'checked' : ''}> I have earned this trophy</label>`;
}
