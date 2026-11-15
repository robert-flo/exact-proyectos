import './held-hooks.js';
import app from './app.js';
import { data, clock, inflight, Resources, Mutations, routeAt, Head, canSetStatus, resolvedLanguage, res, commit, refused } from './rt.js'; import { answersAtWork, looseOut } from './held.js';
import { types, sourceTypes, pages, viewportMedia, activation, markdownPaths } from './names.js';
import { segmentOf } from './router.js';
import { viewportFacts } from './facts.js';
import { answers } from './checkpoint.js';
import { markBars, routeTitle } from './navigation.js';
import { markRoutes, markDocument } from './document.js';
import { install as ts } from './ts-data.js';
import { unfinishedIO } from './ts-fetch.js';
let t0, route, planResources;
const prepare = async () => {
  ts(data, false);
};
globalThis.__pages = async (pattern, source, args, deadline) => {
  const end = performance.now() + deadline;
  await prepare();
  const parse = data.parse;
  if (parse) data.parse = (...args) => { if (performance.now() >= end) throw new Error("it didn't answer before the deadline"); return parse(...args); };
  let listed;
  if (commit(() => { listed = res("pages", source, () => args, undefined, undefined, "[s", []); listed(); }, "pages") === false) throw refused();
  const r = listed.r;
  while (r.settled === undefined && !r.failed) {
    if (performance.now() >= end) throw new Error("it didn't answer before the deadline");
    if (r.ticket?.refused || r.ticket?.call?.refused || r.ticket?.ctl?.refused) throw new Error(String(r.ticket.refused ?? r.ticket.call?.refused ?? r.ticket.ctl?.refused));
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  if (r.failed) throw new Error(r.error);
  return r.value.map(value => pattern.split('/').map(s => s[0] === ':' ? segmentOf(value) : s).join('/'));
};
globalThis.__start = async () => {
  t0 = performance.now();
  await prepare();
  planResources = app()[2];
  route = routeAt(location.pathname + location.search);
  const [render, activate] = pages[route] ?? ["build", "inferred"];
  return { activate: ["idle", "interaction", "never"].includes(activate) ? activate : "inferred", policy: render, notfound: !!pages[route]?.[2], readsViewport: activation.viewport, canSetStatus: canSetStatus(), language: resolvedLanguage() };
};
globalThis.__render = async (deadline, waitStatus = true) => {
  const end = t0 + deadline;
  const unfinished = () => answersAtWork(true) || unfinishedIO();
  const unmessaged = t => !!t && (!!t.stream || !!t.req?.stream) && !t.messages && !t.closed && !t.ctl?.refused;
  const outstanding = () => inflight.n > 0 || Resources.some(r => r.waiting || (r.pending() && unmessaged(r.ticket))) || answersAtWork() || looseOut() || (waitStatus && unfinished());
  do await new Promise(r => setTimeout(r, 1)); while (outstanding() && performance.now() < end);
  markBars(document.getElementById("exact-root")); // the bars the glue marks, so their symbols are the size they will be
  markRoutes(document.getElementById("exact-root")); markDocument(); // a hidden route's page scroller is off the page
  const hero = document.heroPreload(); // before the root is written: it marks the hero <img>
  return { root: document.rootHTML(), hero, title: Head.headTitle ?? routeTitle(document.getElementById("exact-root")), description: Head.headDescription, image: Head.headImage, canonical: Head.headCanonical, robots: Head.headRobots,
    origin: null, status: Head.headStatus ?? null, time: clock.now, ...answers(planResources, types[2], sourceTypes),
    failed: Resources.filter(r => r.failed).map(r => `${r.name}: ${r.error}`),
    refused: Resources.filter(r => r.pending() && (r.ticket?.refused || (r.ticket?.call ?? r.ticket?.ctl)?.refused)).map(r => [r.name, r.ticket.refused ?? (r.ticket.call ?? r.ticket.ctl).refused]),
    pending: Resources.filter(r => r.pending()).map(r => r.name), outstanding: outstanding(), continuing: outstanding() || unfinished(), scrollDocument: document.documentElement.hasAttribute("data-scrolldocument"), render: performance.now() - t0,
    due: clock.timers.length > 0 || Mutations.some(m => m.due < Infinity || m.next < Infinity), activation, zoned: !!globalThis.__exactZone,
    rust: false,
    wake: viewportMedia.map(([query, holds]) => [query, holds(viewportFacts())]) };
};