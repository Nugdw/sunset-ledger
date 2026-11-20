// Every view's rendering: the header progress card, the tracker list and its detail pane, the roadmap, the
// missables page, the Next Up planner and the settings page's source register. Rendering is string building
// from the loaded data and the store; main.js wires the events by the data-action attributes used here.

import { sourcesOf, trophiesOfStage, earnedAmong } from './data.js';
import { trophyIsShielded, nextUpOrder } from './filters.js';

const GRADE_LETTERS = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const GRADE_NAMES = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

/** Text from the data file, made safe to place in markup. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** A trophy's grade as a medal badge: a CSS medallion with the grade's letter, no image. */
export function medalBadge(trophy) {
  return `<span class="medal medal-${trophy.grade}" title="${GRADE_NAMES[trophy.grade]}">${GRADE_LETTERS[trophy.grade]}</span>`;
}

/** The small flags a list row carries: MISSABLE, hidden on PlayStation, and counter progress. */
export function flagChips(data, store, trophy) {
  const chips = [];
  if (trophy.missable) chips.push('<span class="flag flag-missable">MISSABLE</span>');
  if (trophy.hidden) chips.push('<span class="flag flag-hidden">Hidden on PSN</span>');
  if (trophy.target) chips.push(`<span class="flag flag-count">${store.countOf(trophy.id)} / ${trophy.target}</span>`);
  return chips.join(' ');
}

/** A trophy's display name and description under the spoiler shield's rule. */
export function displayName(trophy, store) {
  if (trophyIsShielded(trophy, store)) return '<span class="spoiler-name">Hidden story trophy</span>';
  return escapeHtml(trophy.name);
}

export function displayDescription(trophy, store) {
  if (trophyIsShielded(trophy, store)) return 'Name and description hidden by the spoiler shield until earned.';
  return escapeHtml(trophy.description);
}

/** The header card: the big earned count, the bar, and the per-grade tallies against the official list. */
export function renderProgressCard(data, store, els) {
  const total = data.trophies.length;
  const earned = earnedAmong(store, data.trophies);
  els.earnedCount.textContent = String(earned);
  els.progressFill.style.width = `${(earned / total) * 100}%`;
  els.progressBar.setAttribute('aria-valuenow', String(earned));
  const perGrade = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const ofGrade = data.trophies.filter((trophy) => trophy.grade === grade);
    return `${GRADE_NAMES[grade]} ${earnedAmong(store, ofGrade)}/${ofGrade.length}`;
  });
  els.progressGrades.textContent = perGrade.join(' · ');
}

/** One tracker row: tick box, medal, name and official description, flags. A button, so a click opens its guide. */
export function trophyRowHtml(data, store, trophy, selectedId) {
  const earned = store.isEarned(trophy.id);
  const classes = ['trophy-row', earned ? 'is-earned' : '', trophy.id === selectedId ? 'is-selected' : ''].join(' ');
  return `<li>
    <div class="${classes}" data-select="${trophy.id}" role="button" tabindex="0" aria-label="Open the guide to ${escapeHtml(trophy.name)}">
      <input type="checkbox" class="row-check" data-earn="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark ${escapeHtml(trophy.name)} earned">
      ${medalBadge(trophy)}
      <span><span class="row-name">${displayName(trophy, store)}</span>
      <span class="row-desc">${displayDescription(trophy, store)}</span></span>
      <span class="row-flags">${flagChips(data, store, trophy)}</span>
    </div>
  </li>`;
}

/** The tracker list for the trophies the filters leave visible. */
export function renderTrophyList(data, store, trophies, selectedId, els) {
  els.list.innerHTML = trophies.map((trophy) => trophyRowHtml(data, store, trophy, selectedId)).join('');
  els.resultLine.textContent =
    trophies.length === data.trophies.length
      ? 'All 55 trophies of the official list.'
      : `Showing ${trophies.length} of 55 trophies.`;
}

/** A trophy's numbered steps, each with the source it rests on named beside it. */
export function guideStepsHtml(trophy) {
  const items = (trophy.steps ?? [])
    .map((step) => `<li>${escapeHtml(step.text)}${step.src ? ` <span class="step-src">— ${escapeHtml(step.src)}</span>` : ''}</li>`)
    .join('');
  return `<ol class="step-list">${items}</ol>`;
}

/** A trophy's cited sources as a list of links a reader may follow; the app itself opens none of them. */
export function sourceListHtml(data, trophy) {
  const items = sourcesOf(data, trophy)
    .map((source) => `<li>${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a>` : escapeHtml(source.name)} — ${escapeHtml(source.detail)} <span class="src-note">(checked ${escapeHtml(source.accessed)})</span></li>`)
    .join('');
  return `<ul class="source-list">${items}</ul>`;
}

/** The counter a target trophy is tracked with: steppers and the count against PlayStation's target. */
export function counterBoxHtml(store, trophy) {
  if (!trophy.target) return '';
  const count = store.countOf(trophy.id);
  return `<div class="counter-box">
    <button type="button" data-count="-1" aria-label="One less">−</button>
    <span class="counter-value">${count} / ${trophy.target}</span>
    <button type="button" data-count="1" aria-label="One more">+</button>
    <span>${escapeHtml(trophy.targetLabel ?? '')}${count >= trophy.target ? ' — target reached.' : ''}</span>
  </div>`;
}

/**
 * The detail pane: one trophy's full guide — official name, description and grade, its rarity, its roadmap stage,
 * the missable warning where it applies, the guide in this entry's words, its numbered cited steps, its tips,
 * its counter and its sources. Under the spoiler shield an unearned story trophy shows none of it.
 */
export function renderTrophyDetail(data, store, trophy, els) {
  if (!trophy) {
    els.detail.innerHTML = '<h2>Pick a trophy</h2><p>Choose any row on the left and its full guide opens here: the steps, the sources they rest on, and the tracker counter where PlayStation counts progress.</p>';
    return;
  }
  if (trophyIsShielded(trophy, store)) {
    els.detail.innerHTML = `<h2><span class="spoiler-name">Hidden story trophy</span></h2>
      <p class="detail-official">The spoiler shield is on, and this is a story trophy you have not earned yet, so its name, description and guide stay hidden until you earn it — exactly as PlayStation hides it.</p>
      <p>Grade: <strong>${GRADE_NAMES[trophy.grade]}</strong> · Roadmap stage ${trophy.stage}. Turn the shield off under Settings &amp; Data if you would rather see everything.</p>`;
    return;
  }
  const earned = store.isEarned(trophy.id);
  els.detail.innerHTML = `
    ${medalBadge(trophy)}
    <h2>${escapeHtml(trophy.name)}</h2>
    <p class="detail-official">“${escapeHtml(trophy.description)}”</p>
    <p class="detail-meta">
      <span>Grade <strong>${GRADE_NAMES[trophy.grade]}</strong></span>
      <span>Roadmap <strong>stage ${trophy.stage}</strong></span>
      <span>Rarity <strong>${escapeHtml(trophy.rarity)}</strong></span>
      ${trophy.hidden ? '<span><strong>Hidden</strong> on PlayStation until earned</span>' : ''}
    </p>
    ${trophy.missable ? `<div class="missable-banner"><strong>Potentially missable.</strong> ${escapeHtml(trophy.missableNote ?? '')}</div>` : ''}
    <p>${escapeHtml(trophy.guide)}</p>
    <h3>How to earn it, step by step</h3>
    ${guideStepsHtml(trophy)}
    ${trophy.tips ? `<div class="tip-box"><strong>Tips.</strong> ${escapeHtml(trophy.tips)}</div>` : ''}
    ${counterBoxHtml(store, trophy)}
    <p><label class="earned-toggle"><input type="checkbox" data-earn-detail="${trophy.id}" ${earned ? 'checked' : ''}> Earned</label></p>
    <h3>Sources</h3>
    ${sourceListHtml(data, trophy)}
    <p class="src-note">${escapeHtml(trophy.rarityNote ?? '')}</p>`;
}

/** The roadmap page: the run's facts, then one card a stage with its trophies as chips and its progress. */
export function renderRoadmap(data, store, els) {
  const facts = data.facts
    .map((fact) => `<div class="fact"><span class="fact-value">${escapeHtml(fact.value)}</span><span class="fact-label">${escapeHtml(fact.label)}</span></div>`)
    .join('');
  els.intro.innerHTML = `
    <h2>The road to the platinum</h2>
    <p class="lede">One playthrough, no difficulty setting, no online trophies and no mission replay: the order below is built from the official descriptions — which chapters and missions, which collectibles and counts — so nothing is left in a chapter you cannot return to. The one exception is flagged on the Missables page and in stage 1.</p>
    <div class="fact-grid">${facts}</div>`;
  els.stages.innerHTML = data.roadmap
    .map((stage) => {
      const trophies = trophiesOfStage(data, stage.n);
      const earned = earnedAmong(store, trophies);
      const chips = trophies
        .map((trophy) => `<button type="button" class="stage-chip${store.isEarned(trophy.id) ? ' is-earned' : ''}${trophy.missable ? ' is-missable' : ''}" data-open="${trophy.id}">${displayName(trophy, store)}</button>`)
        .join('');
      return `<article class="stage-card">
        <h3>Stage ${stage.n}: ${escapeHtml(stage.title)} <span class="stage-hours">· ${escapeHtml(stage.hours)}</span></h3>
        <div class="stage-bar"><span style="width: ${trophies.length ? (earned / trophies.length) * 100 : 0}%"></span></div>
        <p>${escapeHtml(stage.text)}</p>
        <p class="src-note">${earned} of ${trophies.length} earned in this stage. ${escapeHtml(stage.note ?? '')}</p>
        <div class="stage-trophies">${chips}</div>
      </article>`;
    })
    .join('');
}

/** The missables page: the one trophy that can be missed, in full, then the watch list of near-misses. */
export function renderMissables(data, store, els) {
  const missable = data.trophies.filter((trophy) => trophy.missable);
  els.intro.innerHTML = `
    <h2>What can be missed</h2>
    <p class="lede">Built from the official descriptions and the guides that checked them: exactly one of the 55 is reported as potentially missable, and it sits in Chapter 1. Everything else can still be earned in free-roam after the story — there is no mission replay, but no other trophy needs it.</p>`;
  const cards = missable
    .map(
      (trophy) => `<article class="watch-card">
        <h3>${medalBadge(trophy)} ${escapeHtml(trophy.name)} <span class="flag flag-missable">MISSABLE</span></h3>
        <p class="detail-official">“${escapeHtml(trophy.description)}”</p>
        <div class="missable-banner"><strong>The window.</strong> ${escapeHtml(trophy.missableNote ?? '')}</div>
        <p>${escapeHtml(trophy.guide)}</p>
        ${guideStepsHtml(trophy)}
        <h3>Sources</h3>
        ${sourceListHtml(data, trophy)}
      </article>`,
    )
    .join('');
  const watch = data.watchlist
    .map(
      (item) => `<article class="watch-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
        <p class="src-note">Source: ${escapeHtml(item.src)}</p>
      </article>`,
    )
    .join('');
  els.list.innerHTML = cards + '<h2 class="serif">Worth knowing, but not missable</h2>' + watch;
}

/** The Next Up planner: the next twelve unearned trophies in plan order, each with why it comes next. */
export function renderNextUp(data, store, els) {
  const next = nextUpOrder(data, store).slice(0, 12);
  if (next.length === 0) {
    els.list.innerHTML = '<li class="empty-note">Nothing left to plan: every trophy but the platinum is earned. Vice Got a Price! is yours.</li>';
    return;
  }
  els.list.innerHTML = next
    .map((trophy) => {
      const why = trophy.missable
        ? 'Potentially missable — its window is in Chapter 1, so it outranks everything.'
        : trophy.target
          ? `Stage ${trophy.stage} · counter at ${store.countOf(trophy.id)} of ${trophy.target}.`
          : `Stage ${trophy.stage} of the roadmap.`;
      return `<li class="next-row">
        ${medalBadge(trophy)}
        <span><strong>${displayName(trophy, store)}</strong><span class="next-why">${why}</span></span>
        <button type="button" class="next-done" data-done="${trophy.id}">Mark earned</button>
      </li>`;
    })
    .join('');
}

/** The settings page's register: every source the guide cites, named once with what it backs and when it was checked. */
export function renderSourcesRegister(data, els) {
  const items = [...data.sources.values()]
    .map((source) => `<li>${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a>` : escapeHtml(source.name)} — ${escapeHtml(source.detail)} <span class="src-note">(checked ${escapeHtml(source.accessed)})</span></li>`)
    .join('');
  els.register.innerHTML = `
    <h2>Sources</h2>
    <p>The official names, descriptions and grades are PlayStation's, as the two list sources publish them. Every step in every guide names the source it rests on; where only one source reports a thing, the guide says so. Nothing here is copied from them: a source is cited, never copied.</p>
    <ul class="source-list">${items}</ul>`;
}
