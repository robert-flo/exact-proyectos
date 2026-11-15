import './held-hooks.js';
import app, { sources, wait } from './app.js';
import { data, journal, clock, commit, inflight, Views, viewId, After, Clocked, R, resolvedLocale, Resources, agentMode, advance, heldAsks, heldReplies, Mutations, writeRecords, goTo } from './rt.js';
data.keepSurfaceAnswers = true;
import { develop } from './perf.js';
import { seam } from './perf.js';
seam();
import { install as ts, watchState } from './ts-data.js';
ts(data, false);
import { answering } from './ts-fetch.js';
globalThis.exact = Object.assign(globalThis.exact ?? {}, { watchState });
globalThis.exact = Object.assign(globalThis.exact ?? {}, { pageModule: false });
const start = () => {
  const state = app();
  globalThis.exact = Object.assign(globalThis.exact ?? {}, { ready: true, journal, clock, views: Views, viewId, After, advance, commit, data, state, inflight, heldAsks, heldReplies, resources: Resources, mutations: Mutations, writes: writeRecords });
  globalThis.exact.plan = "4b8c29695dd554c060ec1e37c9bf29b6b8a0ff053ba27b125282300b271641b5";
  globalThis.exact.goTo = goTo;
  develop(globalThis.exact).catch(console.error);
  if (clock.agent) globalThis.exact.ready = import('./agent.js').then(m => m.install(globalThis.exact));
  booted?.();
};
const faces = typeof document === 'object' && document.fonts ? [...document.fonts].filter(f => /^"?ExactPlanStack\d+"?$/.test(f.family) && f.status !== 'loaded') : [];
const fonts = faces.length ? Promise.race([Promise.all(faces.map(f => f.load().catch(() => {}))), new Promise(r => setTimeout(r, 100))]) : null;
let booted; if (fonts) (globalThis.exact ??= {}).ready = new Promise(r => { booted = r; });
if (fonts) clock.agent = agentMode();
const page = typeof document === 'object' && document.querySelector('style[data-exact-page]');
const sheet = page && new Promise(r => { const l = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: './style.css' }); l.onload = () => { page.remove(); r(); }; l.onerror = r; page.before(l); });
const named = typeof document === 'object' && document.querySelector('script[type="application/vnd.exact.checkpoint"][data-src]');
const answers = named && (globalThis.exact?.answers ?? fetch(named.dataset.src).then(r => r.ok ? r.text() : null, () => null)).then(t => { named.textContent = t ?? '{"time":0,"answers":[]}'; });
const seeded = agentMode() && !globalThis.__exactRender && import('./storage-environment.js').then(env => { const seed = env.agentSeed(); if (seed !== null) answering.entropy = Object.assign(env.agentStream(seed, 'typescript'), { seed }); });
const waits = [fonts, sheet, answers, seeded].filter(Boolean);
if ((sheet || answers || seeded) && !fonts) { (globalThis.exact ??= {}).ready = new Promise(r => { booted = r; }); clock.agent = agentMode(); }
const go = f => waits.length ? Promise.all(waits).then(f) : f();
if (agentMode()) { const early = (globalThis.exact ??= {}).early = new WeakMap(); After.push(globalThis.exact.holdEarly = () => { for (const a of document.getAnimations()) if (!early.has(a) && a.playState === 'running' && (!a.timeline || a.timeline instanceof DocumentTimeline)) { early.set(a, clock.now); a.pause(); a.currentTime = 0; } }); }
go(start);