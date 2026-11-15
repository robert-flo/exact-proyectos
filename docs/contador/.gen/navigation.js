import { admitsNetwork, admitsSecret, admittingGrant, coversPath, createGrantSet, grantError, grantWords, hasGrant, isCloudMetadata, isLocalNetwork, rawGrantText, sameGrantDeclaration, scopedGrantSet, socketProtocols, trimGrant, unionGrantSets } from "./grant-admission.js";
//#region ../../exact/host/web/navigation/lists.js
const listRow = (el) => [...el.children].find((c) => !c.hasAttribute("data-exiting"));
function viewChildren(el) {
	return [...el?.children ?? []].flatMap((c) => c.hasAttribute("data-exact-list-item") ? [listRow(c)].filter(Boolean) : [c]);
}
function viewParent(el) {
	const p = el?.parentElement;
	return p?.hasAttribute("data-exact-list-item") ? p.parentElement : p;
}
const listOwner = (p) => p?.$listOwner ?? (p?.hasAttribute?.("data-exact-list") ? p : null);
const concreteRole = /^(?:alert|alertdialog|application|article|banner|blockquote|button|caption|cell|checkbox|code|columnheader|combobox|comment|complementary|contentinfo|definition|deletion|dialog|directory|doc-abstract|doc-acknowledgments|doc-afterword|doc-appendix|doc-backlink|doc-biblioentry|doc-bibliography|doc-biblioref|doc-chapter|doc-colophon|doc-conclusion|doc-cover|doc-credit|doc-credits|doc-dedication|doc-endnote|doc-endnotes|doc-epigraph|doc-epilogue|doc-errata|doc-example|doc-footnote|doc-foreword|doc-glossary|doc-glossref|doc-index|doc-introduction|doc-noteref|doc-notice|doc-pagebreak|doc-pagefooter|doc-pageheader|doc-pagelist|doc-part|doc-preface|doc-prologue|doc-pullquote|doc-qna|doc-subtitle|doc-tip|doc-toc|document|emphasis|feed|figure|form|generic|graphics-document|graphics-object|graphics-symbol|grid|gridcell|group|heading|image|img|insertion|link|list|listbox|listitem|log|main|mark|marquee|math|menu|menubar|menuitem|menuitemcheckbox|menuitemradio|meter|navigation|none|note|option|paragraph|presentation|progressbar|radio|radiogroup|region|row|rowgroup|rowheader|scrollbar|search|searchbox|sectionfooter|sectionheader|separator|slider|spinbutton|status|strong|subscript|suggestion|superscript|switch|tab|table|tablist|tabpanel|term|textbox|time|timer|toolbar|tooltip|tree|treegrid|treeitem)$/i;
const listRole = (el) => {
	const r = el.getAttribute("role");
	return r === "list" || r === "listitem" || r === "directory" ? r : r?.split(/[\t\n\f\r ]+/).find((r) => concreteRole.test(r))?.toLowerCase();
};
function listItem(el, owner) {
	const p = el.parentElement;
	owner ??= listOwner(p?.hasAttribute("data-exact-list-item") ? p.parentNode : p);
	const marker = el.localName === "dialog" || el.hasAttribute("popover") ? "layer" : "", ownerRole = owner && listRole(owner), role = (!owner || ownerRole === "list" || ownerRole === "directory") && listRole(el) !== "listitem" ? "listitem" : "presentation";
	if (p?.hasAttribute("data-exact-list-item")) {
		if (p.getAttribute("data-exact-list-item") !== marker) p.setAttribute("data-exact-list-item", marker);
		if (p.getAttribute("role") !== role) p.setAttribute("role", role);
		return p;
	}
	const w = document.createElement("div");
	w.setAttribute("role", role);
	w.setAttribute("data-exact-list-item", marker);
	w.style.setProperty("display", "contents");
	w.append(el);
	return w;
}
function syncListItemRoles(el) {
	if (el.parentElement?.hasAttribute("data-exact-list-item")) listItem(el);
	if (el.hasAttribute("data-exact-list")) {
		for (const w of el.children) if (w.hasAttribute("data-exact-list-item")) listItem(listRow(w), el);
	}
}
function unwrapListItem(el) {
	if (!el?.hasAttribute?.("data-exact-list-item")) return el;
	const child = listRow(el);
	el.before(...el.childNodes);
	el.remove();
	return child;
}
//#endregion
//#region ../../exact/host/web/navigation/type.js
const APP_ROOT = "exact-root-font-size";
const PERCENT = /^[+-]?(\d+|\d*\.\d+)(e[+-]?\d+)?%$/i;
function appRootFontSize(value, say, platform = globalThis) {
	const doc = platform.document, host = platform.getComputedStyle ? beneathApp(platform, () => parseFloat(platform.getComputedStyle(doc.documentElement).fontSize) || 16) : 16;
	let rule = doc.getElementById(APP_ROOT);
	if (value === "medium") {
		rule?.remove();
		return;
	}
	const ratio = typeof value === "string" && PERCENT.test(value) ? parseFloat(value) / 100 : NaN, share = Math.fround(host * ratio), px = typeof value === "number" && Math.fround(value) > 0 && Number.isFinite(Math.fround(value));
	if (!px && !(share > 0 && Number.isFinite(share))) return say?.(`setRootFontSize(${JSON.stringify(value) ?? ""}) refused: the root font size is a number of px above 0, a percentage of the host's above 0 ("125%"), or "medium"`);
	if (!rule) {
		rule = doc.createElement("style");
		rule.id = APP_ROOT;
		doc.head.append(rule);
	}
	rule.textContent = px ? `:root{font-size:${value}px!important}` : `:root{font-size:calc(var(--exact-host-font-size, 100%) * ${ratio})!important}`;
	refitTexts();
}
function fitText(el) {
	el.style.zoom = "";
	const cs = getComputedStyle(el), px = (v) => parseFloat(v) || 0;
	if (cs.getPropertyValue("--exact-fit").trim() !== "shrink" || cs.display === "none" || !el.offsetWidth) return;
	const k = el.getBoundingClientRect().width / el.offsetWidth || 1;
	const inset = px(cs.paddingLeft) + px(cs.paddingRight) + px(cs.borderLeftWidth) + px(cs.borderRightWidth);
	const content = () => el.getBoundingClientRect().width / k - inset, box = content(), { width, flexShrink } = el.style;
	el.style.width = "min-content";
	el.style.flexShrink = "0";
	const natural = content();
	el.style.width = width;
	el.style.flexShrink = flexShrink;
	const up = viewParent(el), ps = up && getComputedStyle(up);
	const room = box + .5 < natural || !up ? box : up.clientWidth - px(ps.paddingLeft) - px(ps.paddingRight) - Math.max(0, px(cs.marginLeft)) - Math.max(0, px(cs.marginRight));
	if (!(natural > room + .01)) return;
	const size = px(cs.fontSize), root = px(getComputedStyle(document.documentElement).fontSize);
	el.style.zoom = String(Math.max(size > 0 && root > 0 ? Math.min(.5, root / size) : .5, Math.max(0, room) / natural));
	zoomed.add(el);
}
let fitSeen = false;
let zoomed = new Set();
const noteFit = (css) => {
	if (!fitSeen && css?.includes("--exact-fit")) fitSeen = true;
};
function refitTexts() {
	if (!fitSeen) return;
	const fitted = new Set(document.querySelectorAll("[style*=\"--exact-fit\"]"));
	for (const el of zoomed) if (!fitted.has(el)) {
		el.style.zoom = "";
		zoomed.delete(el);
	}
	for (const el of fitted) fitText(el);
}
function installFits(after) {
	if (fitSeen || typeof document === "undefined" || typeof addEventListener !== "function" || globalThis.__exactRender) return;
	fitSeen = true;
	after.push(refitTexts);
	addEventListener("resize", refitTexts);
	document.fonts?.ready.then(refitTexts);
}
function beneathApp(platform, read) {
	const rule = platform.document.getElementById?.(APP_ROOT);
	if (!rule) return read();
	rule.disabled = true;
	try {
		return read();
	} finally {
		rule.disabled = false;
	}
}
//#endregion
//#region ../../exact/host/web/navigation/environment.js
let probe;
function environment() {
	if (!probe) {
		probe = document.createElement("div");
		probe.style.cssText = "position:fixed;inset:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
		document.body.append(probe);
	}
	const cs = getComputedStyle(probe);
	return {
		"safe-area-inset-top": r2(parseFloat(cs.paddingTop) || 0),
		"safe-area-inset-right": r2(parseFloat(cs.paddingRight) || 0),
		"safe-area-inset-bottom": r2(parseFloat(cs.paddingBottom) || 0),
		"safe-area-inset-left": r2(parseFloat(cs.paddingLeft) || 0),
		"keyboard-inset-height": keyboardInset(),
		...foldEnv()
	};
}
function keyboardInset(platform = globalThis) {
	const rect = platform.navigator?.virtualKeyboard?.boundingRect;
	if (rect?.height > 0) return r2(rect.height);
	const vv = platform.visualViewport;
	return vv ? r2(Math.max(0, platform.innerHeight - vv.height - vv.offsetTop)) : 0;
}
function onKeyboard(changed, platform = globalThis) {
	platform.navigator?.virtualKeyboard?.addEventListener?.("geometrychange", changed);
}
const r2 = (x) => Math.round(x * 100) / 100;
function readFold() {
	const posture = globalThis.navigator?.devicePosture?.type ?? (foldMedia("(device-posture: folded)") ? "folded" : "continuous");
	const segments = globalThis.viewport?.segments;
	if (Array.isArray(segments) && segments.length >= 2) {
		const rects = segments.map((s) => [
			s.x,
			s.y,
			s.width,
			s.height
		]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
		return {
			posture,
			cols: new Set(rects.map((r) => r[0])).size,
			rows: new Set(rects.map((r) => r[1])).size,
			rects
		};
	}
	const cols = foldCount("horizontal"), rows = foldCount("vertical");
	return {
		posture,
		cols,
		rows,
		rects: foldRects(cols, rows)
	};
}
const foldQueries = new Map();
const foldListeners = new Set();
let foldProbe;
function foldMedia(query) {
	let list = foldQueries.get(query);
	if (!list && typeof globalThis.matchMedia === "function") {
		list = matchMedia(query);
		foldQueries.set(query, list);
		list.addEventListener("change", () => {
			for (const changed of foldListeners) changed();
		});
	}
	return list?.matches === true;
}
function foldCount(axis) {
	let count = 1;
	while (count < 255 && foldMedia(`(${axis}-viewport-segments >= ${count + 1})`)) count++;
	return count;
}
function foldRects(cols, rows) {
	if (cols * rows === 1 || !globalThis.document?.body || typeof globalThis.getComputedStyle !== "function") return [];
	if (!foldProbe) {
		foldProbe = document.createElement("div");
		foldProbe.style.cssText = "position:fixed;width:0;height:0;visibility:hidden;pointer-events:none;contain:strict";
		document.body.append(foldProbe);
	}
	const rects = [], fields = [
		"left",
		"top",
		"width",
		"height"
	];
	for (let row = 0; row < rows; row++) for (let column = 0; column < cols; column++) {
		for (const field of fields) foldProbe.style.setProperty(`--exact-segment-${field}`, `env(viewport-segment-${field} ${column} ${row}, -1px)`);
		const style = getComputedStyle(foldProbe), rect = fields.map((field) => parseFloat(style.getPropertyValue(`--exact-segment-${field}`)));
		if (!rect.every((value) => Number.isFinite(value) && value >= 0)) return [];
		rects.push(rect);
	}
	return rects;
}
const fold = () => globalThis.exact?.foldSubstitute ?? readFold();
function foldEnv() {
	const f = fold();
	return {
		"device-posture": f.posture,
		"horizontal-viewport-segments": f.cols,
		"vertical-viewport-segments": f.rows,
		"viewport-segments": f.rects.map((r) => r.map(r2))
	};
}
function foldBits() {
	const f = fold();
	return (f.posture === "folded" ? 256 : 0) | (f.cols & 255) << 9 | (f.rows & 255) << 17;
}
function onFold(changed) {
	readFold();
	foldListeners.add(changed);
	globalThis.navigator?.devicePosture?.addEventListener?.("change", changed);
	addEventListener("resize", changed);
}
function evenSegments(width, height, cols, rows, gap = 0) {
	if (!(cols >= 1 && rows >= 1)) throw Object.assign(new Error(`segments ${cols}x${rows}: each count is at least 1`), { malformed: true });
	if (!(Number.isFinite(gap) && gap >= 0)) throw Object.assign(new Error(`segments: gap ${gap} is not a non-negative length`), { malformed: true });
	if (cols * rows === 1) return [];
	const span = (total, n) => {
		const bands = (n - 1) * gap;
		if (bands >= total) throw new Error(`segments ${cols}x${rows} gap ${gap}: the gap is wider than the viewport (${width} × ${height})`);
		return (total - bands) / n;
	};
	const w = span(width, cols), h = span(height, rows), out = [];
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) out.push([
		x * (w + gap),
		y * (h + gap),
		w,
		h
	]);
	return out;
}
function preferFold(request) {
	if (request == null) {
		(globalThis.exact ??= {}).foldSubstitute = null;
		return foldEnv();
	}
	const next = { ...fold() };
	let gap = 0, grid = false;
	for (const [name, raw] of Object.entries(request)) {
		const n = Number(raw);
		switch (name) {
			case "posture":
				if (raw !== "folded" && raw !== "continuous") throw Object.assign(new Error(`prefer: posture: ${raw} is folded or continuous`), { malformed: true });
				next.posture = raw;
				break;
			case "cols":
			case "rows":
				if (!(Number.isInteger(n) && n >= 1)) throw Object.assign(new Error(`prefer: segments: ${raw} ${name === "cols" ? "columns" : "rows"} is not a count`), { malformed: true });
				next[name] = n;
				grid = true;
				break;
			case "gap":
				if (!(Number.isFinite(n) && n >= 0)) throw Object.assign(new Error(`prefer: segments: gap ${raw} is not a length`), { malformed: true });
				gap = n;
				grid = true;
				break;
			default: throw Object.assign(new Error(`prefer: ${name} is not a fold fact this host sets`), { malformed: true });
		}
	}
	if (grid) try {
		next.rects = evenSegments(innerWidth, innerHeight, next.cols, next.rows, gap);
	} catch (e) {
		throw Object.assign(new Error(`prefer: ${e.message}`), { malformed: e.malformed });
	}
	(globalThis.exact ??= {}).foldSubstitute = next;
	return foldEnv();
}
const DISPLAY_MODES = [
	"standalone",
	"browser",
	"fullscreen",
	"minimal-ui",
	"window-controls-overlay",
	"picture-in-picture",
	"tabbed"
];
let preferenceQueries;
const queries = () => preferenceQueries ??= [
	["(prefers-reduced-motion: reduce)", 1],
	["(prefers-reduced-transparency: reduce)", 2],
	["(prefers-contrast: more)", 4],
	["(prefers-contrast: less)", 8],
	["(prefers-contrast: custom)", 12],
	["(prefers-color-scheme: dark)", 16],
	["(pointer: coarse)", 32],
	["(pointer: none)", 64],
	["(hover: none)", 128],
	["(color-gamut: p3)", 1 << 26],
	["(color-gamut: rec2020)", 1 << 27],
	["(dynamic-range: high)", 1 << 28],
	...DISPLAY_MODES.map((v, i) => [`(display-mode: ${v})`, i << 29])
].map(([q, bits]) => [matchMedia(q), bits]);
const preferences = () => {
	const bits = queries().reduce((bits, [q, bit]) => bits | (q.matches ? bit : 0), 0), meta = globalThis.document?.querySelector?.("meta[name=\"color-scheme\"]")?.content, pinned = globalThis.exact?.systemScheme ?? (meta === "light" || meta === "dark" ? meta : null);
	return pinned ? bits & -17 | (pinned === "dark" ? 16 : 0) : bits;
};
const displayMode = () => DISPLAY_MODES[preferences() >>> 29 & 7];
let updateQueries;
const updates = () => updateQueries ??= ["(update: slow)", "(update: none)"].map((q) => globalThis.matchMedia?.(q));
const UPDATES = [
	"fast",
	"slow",
	"none"
];
const updateCode = () => updates()[1]?.matches ? 2 : updates()[0]?.matches ? 1 : 0;
const handheld = (platform = globalThis) => Math.min(platform.screen?.width ?? Infinity, platform.screen?.height ?? Infinity) < 600;
const onPreferences = (changed) => {
	queries().forEach(([q]) => q.addEventListener("change", changed));
	updates().forEach((q) => q?.addEventListener?.("change", changed));
	let resolution;
	const watch = () => {
		resolution?.removeEventListener?.("change", rescaled);
		resolution = globalThis.matchMedia?.(`(resolution: ${globalThis.devicePixelRatio || 1}dppx)`);
		resolution?.addEventListener("change", rescaled);
	};
	const rescaled = () => {
		watch();
		changed();
	};
	watch();
};
function pageReporter(agent, platform = globalThis) {
	const facts = {
		"visibility-state": "visible",
		frozen: false,
		online: true,
		"can-share": true,
		"can-share-files": true,
		"can-share-pictures": false,
		"can-open-files": true,
		"has-focus": true,
		"root-font-size": 16,
		"gpu-tier": "high",
		"iframe-partition": false
	}, cache = {
		persisted: false,
		restores: 0
	};
	let frozen = false;
	let sharesFiles;
	const canShareFiles = () => sharesFiles ??= (() => {
		try {
			return typeof platform.navigator.canShare === "function" && platform.navigator.canShare({ files: [new platform.File([""], "a.txt", { type: "text/plain" })] }) === true;
		} catch {
			return false;
		}
	})();
	const rootFontSize = () => agent ? facts["root-font-size"] : beneathApp(platform, () => parseFloat(platform.getComputedStyle(platform.document.documentElement).fontSize) || 16), displayScale = () => platform.devicePixelRatio > 0 ? platform.devicePixelRatio : 1;
	const loaded = agent ? "" : platform.performance?.getEntriesByType?.("navigation")?.[0]?.type;
	let told;
	const gpuTier = () => told ?? (handheld(platform) ? "low" : "high");
	const navigationType = ["reload", "back_forward"].includes(loaded) ? loaded : "navigate";
	const read = () => agent ? {
		...facts,
		"navigation-type": navigationType,
		...cache
	} : {
		...cache,
		frozen,
		"visibility-state": platform.document.visibilityState === "hidden" ? "hidden" : "visible",
		online: platform.navigator.onLine !== false,
		"can-share": typeof platform.navigator.share === "function",
		"can-share-files": canShareFiles(),
		"can-share-pictures": false,
		"can-open-files": typeof platform.showOpenFilePicker === "function",
		"has-focus": typeof platform.document.hasFocus !== "function" || platform.document.hasFocus(),
		"navigation-type": navigationType,
		"gpu-tier": gpuTier(),
		"iframe-partition": false
	};
	const bits = () => {
		const f = read();
		return ((f["visibility-state"] === "hidden" ? 1 : 0) | (f.frozen ? 128 : 0) | (f.online ? 0 : 2) | (f["can-share"] ? 4 : 0) | (f["can-open-files"] ? 8 : 0) | (f["has-focus"] ? 0 : 16) | (f["can-share-files"] ? 256 : 0) | (f["can-share-pictures"] ? 512 : 0) | [
			"navigate",
			"reload",
			"back_forward"
		].indexOf(f["navigation-type"]) + 1 << 5 | (f.persisted ? 1024 : 0) | Math.max(0, [
			"high",
			"mid",
			"low"
		].indexOf(f["gpu-tier"])) << 11 | (f["iframe-partition"] ? 8192 : 0) | (f.restores & 65535) << 16) >>> 0;
	};
	const prefer = (page) => {
		const next = { ...facts };
		for (const [name, raw] of Object.entries(page ?? {})) {
			const value = String(raw);
			if (name === "visibility-state" && (value === "visible" || value === "hidden") || name === "gpu-tier" && [
				"low",
				"mid",
				"high"
			].includes(value)) next[name] = value;
			else if ((name === "frozen" || name === "online" || name === "can-share" || name === "can-share-files" || name === "can-share-pictures" || name === "can-open-files" || name === "has-focus" || name === "iframe-partition") && (value === "true" || value === "false")) next[name] = value === "true";
			else if (name === "root-font-size" && Number(value) > 0 && Number.isFinite(Number(value))) next[name] = Number(value);
			else if (name === "display-scale" && Number(value) > 0 && Number.isFinite(Number(value))) {
				if (Math.abs(displayScale() - Number(value)) > .01) throw new Error(`prefer: display-scale: ${value}: the page's is ${displayScale()}, which the browser sets (its own emulation, or the device)`);
			} else throw Object.assign(new Error(`prefer: ${name}: ${value} is not a page fact this host sets`), name === "keyboard-navigation" || name === "bold-text" ? {} : { malformed: true });
		}
		Object.assign(facts, next);
		if (page?.["root-font-size"] !== void 0) {
			const { style } = platform.document.documentElement;
			style.fontSize = `${facts["root-font-size"]}px`;
			style.setProperty("--exact-host-font-size", style.fontSize);
		}
	};
	const onChange = (changed) => {
		if (agent) return;
		platform.document.addEventListener("visibilitychange", changed);
		for (const name of ["freeze", "resume"]) platform.document.addEventListener(name, () => {
			frozen = name === "freeze";
			changed();
		});
		for (const name of [
			"online",
			"offline",
			"focus",
			"blur"
		]) platform.addEventListener(name, changed);
		for (const name of ["pagehide", "pageshow"]) platform.addEventListener(name, (e) => {
			if (!e.persisted) return;
			cache.persisted = name === "pagehide";
			if (name === "pageshow") cache.restores = cache.restores + 1 & 65535;
			changed();
		});
	};
	return {
		bits,
		read: () => ({
			...read(),
			"root-font-size": rootFontSize(),
			"display-scale": displayScale()
		}),
		prefer,
		onChange,
		rootFontSize,
		displayScale,
		agent,
		tell: (tier) => {
			if (!agent) told = tier;
		}
	};
}
function placeReporter(params, platform = globalThis) {
	let seed;
	return () => {
		if (AGENT_ADMITTED && params.has("agent")) {
			const value = Number(params.get("seed") ?? 1);
			if (!Number.isSafeInteger(value) || value < 0 || value >= 2 ** 32) throw new Error("seed: a whole number from 0 through 2^32 - 1 (4294967295)");
			return [
				params.get("locale") ?? "en-US",
				params.get("timeZone") ?? "UTC",
				value,
				params.get("formatLocale") ?? ""
			].join("\0");
		}
		if (seed === void 0) seed = platform.crypto.getRandomValues(new Uint32Array(1))[0];
		return [
			platform.navigator.language,
			platform.Intl.DateTimeFormat().resolvedOptions().timeZone,
			seed,
			platform.Intl.DateTimeFormat().resolvedOptions().locale
		].join("\0");
	};
}
function timeReporter(params, platform = globalThis) {
	return (elapsed) => {
		if (!(AGENT_ADMITTED && params.has("agent"))) return [platform.Date.now() - elapsed, -new platform.Date().getTimezoneOffset()];
		const epoch = Number(params.get("epoch") ?? Date.UTC(2026, 0, 1));
		if (!Number.isSafeInteger(epoch) || epoch < 0) throw new Error("epoch: Unix milliseconds at or after 1970");
		const at = {};
		for (const { type, value } of new Intl.DateTimeFormat("en-US", {
			timeZone: params.get("timeZone") ?? "UTC",
			hourCycle: "h23",
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric"
		}).formatToParts(epoch + elapsed)) at[type] = Number(value);
		return [epoch, (Date.UTC(at.year, at.month - 1, at.day, at.hour, at.minute, at.second) - Math.floor((epoch + elapsed) / 1e3) * 1e3) / 6e4];
	};
}
function launchLocation(platform = globalThis) {
	const { pathname, search, hash = "" } = platform.location, q = new URLSearchParams(search);
	if (!(AGENT_ADMITTED && q.has("agent"))) return pathname + search + hash;
	for (const k of agentParameters) q.delete(k);
	const rest = q.toString();
	return pathname + (rest ? "?" + rest : "") + hash;
}
function launchVisits(platform = globalThis) {
	const entries = platform.navigation?.entries?.() ?? [], at = platform.navigation?.currentEntry?.index ?? -1;
	let from = at;
	while (from > 0 && entries[from - 1].sameDocument) from--;
	return entries.slice(from, Math.max(at, 0)).map((entry) => launchLocation({ location: new URL(entry.url) }));
}
const launched = () => new URL(globalThis.performance?.getEntriesByType?.("navigation")[0]?.name ?? location.href).searchParams;
let pageTime;
const reportTime = (elapsed) => (pageTime ??= timeReporter(launched()))(elapsed);
let pagePlace;
const reportPlace = () => (pagePlace ??= placeReporter(launched()))();
//#endregion
//#region ../../exact/host/web/navigation/layers.js
const opening = [];
let order = 0;
globalThis.addEventListener?.("beforetoggle", (e) => {
	for (let i = opening.length - 1; i >= 0; i--) if (opening[i].eventPhase === Event.NONE) opening.splice(i, 1);
	if (e.exactStamped || e.newState !== "open" || e.target.localName !== "dialog" && !e.target.hasAttribute("popover")) return;
	e.exactStamped = true;
	e.target.exactOpened = ++order;
	for (let i = opening.length - 1; i >= 0; i--) {
		const target = opening[i].target;
		if (!target.matches("dialog:modal,:popover-open")) target.exactOpened = ++order;
	}
	opening.push(e);
}, true);
function modalLayers() {
	const top = [...document.querySelectorAll("dialog:modal,:popover-open")];
	const modals = top.filter((el) => el.matches("dialog:modal"));
	const front = Math.max(0, ...modals.map((el) => el.exactOpened ?? 0));
	return modals.length ? top.filter((el) => (el.exactOpened ?? 0) >= front) : null;
}
function inertAncestor(el) {
	for (let node = el; node; node = node.parentElement) {
		if (node.hasAttribute("inert")) return node;
		if (node.localName === "dialog" && node.matches(":modal")) return null;
	}
	return null;
}
//#endregion
//#region ../../exact/host/web/navigation/popover.js
function contextAt(e, find) {
	const open = () => {
		const [p, source] = find() ?? [];
		if (!p) return;
		if (e.clientX || e.clientY) {
			p.style.setProperty("--exact-context-x", `${e.clientX}px`);
			p.style.setProperty("--exact-context-y", `${e.clientY}px`);
			p.exactAt ??= (p.addEventListener("toggle", (t) => {
				if (t.newState === "closed") for (const axis of "xy") p.style.removeProperty(`--exact-context-${axis}`);
			}), true);
		}
		try {
			p.showPopover({ source });
		} catch {}
	}, ends = [
		"pointerup",
		"pointercancel",
		"mouseup"
	], end = () => {
		for (const type of ends) removeEventListener(type, end, true);
		setTimeout(open);
	};
	if (!e.buttons) {
		setTimeout(open);
		return;
	}
	for (const type of ends) addEventListener(type, end, true);
}
function popoverCommand(method, id, source, say) {
	const pop = liveById(id), anchor = source == null ? null : liveById(source);
	if (!pop?.hasAttribute("popover")) return say(`${method} "${id}" refused: no popover has that id`);
	if (source != null && !anchor) return say(`${method} "${id}" refused: no source has id "${source}"`);
	try {
		pop[method](method === "hidePopover" || !anchor ? void 0 : { source: anchor });
	} catch (e) {
		say(`${method} "${id}" refused: ${e.name}`);
	}
}
function insetAt(p, open) {
	const set = (axis, v) => {
		if (p.style.getPropertyValue(`--exact-inset-${axis}`) !== v) v ? p.style.setProperty(`--exact-inset-${axis}`, v) : p.style.removeProperty(`--exact-inset-${axis}`);
	}, has = (v) => !!v && v !== "auto", area = p.style.getPropertyValue("position-area");
	if (open) {
		if (!p.exactInsetOn) return;
		const { left, top, right, bottom } = p.style, on = !has(right) && !has(bottom) && (has(left) || has(top)) && !(area && area !== "none");
		set("x", on ? left || "auto" : "");
		set("y", on ? top || "auto" : "");
		return;
	}
	const { left, top, right, bottom } = getComputedStyle(p);
	p.exactInsetOn = !(right !== "auto" || bottom !== "auto" || left === "auto" && top === "auto" || area && area !== "none");
	set("x", p.exactInsetOn ? left : "");
	set("y", p.exactInsetOn ? top : "");
	p.exactInset ??= (p.addEventListener("toggle", (t) => {
		if (t.newState === "closed") {
			p.exactInsetOn = false;
			set("x", "");
			set("y", "");
		}
	}), new MutationObserver(() => {
		if (p.matches(":popover-open")) insetAt(p, true);
	}).observe(p, {
		attributes: true,
		attributeFilter: ["style"]
	}), true);
}
const popoverSources = new WeakMap();
const popoverSource = (pop) => popoverSources.get(pop) ?? null;
let placing = false;
function placePopovers() {
	if (placing) return;
	placing = true;
	globalThis.document?.addEventListener?.("beforetoggle", (e) => {
		if (e.target.hasAttribute("popover") && e.newState === "open") {
			popoverSources.set(e.target, e.source ?? null);
			e.target.toggleAttribute("data-exact-chooser", !!e.source?.checkVisibility() && e.target.getAttribute("role") === "alertdialog" && !e.target.querySelector(":scope > [data-exact-text], input"));
			insetAt(e.target);
		}
	}, true);
}
function popoverObservation(root) {
	const pop = [...root.querySelectorAll("[popover]:popover-open")].at(-1), source = pop && popoverSources.get(pop);
	const id = (el) => globalThis.exact?.viewId?.(el) ?? Number(el.dataset.view);
	return pop ? {
		phase: "open",
		popover: id(pop),
		source: source ? id(source) : null
	} : null;
}
//#endregion
//#region ../../exact/host/web/navigation/routes.js
const AGENT_ADMITTED = true;
let last = null;
let refused = new WeakMap();
let managed = new WeakMap();
let shown = new WeakMap();
let placed = new WeakMap();
let written = [];
let gone = new Set();
let cursor = 0;
let first = null;
let originIndex = null;
let echo = null;
let pop = null;
let draining = false;
const queue = [];
const waiters = new Set();
let root;
let navigate;
let log;
let hostBack;
let hostGo;
let routeMatches = () => false;
let canonicalOf = (location) => location;
let pressedLink = null;
let heldLink = null;
let reportedLinkPop = false;
let duplicateIds = new WeakMap();
function inspectTestIds(root, log) {
	let inspection = duplicateIds.get(root);
	if (!inspection) duplicateIds.set(root, inspection = {
		left: 32,
		reported: new Set()
	});
	if (inspection.left === 0) return;
	inspection.left--;
	const seen = new Map();
	for (const el of root.querySelectorAll("[data-testid]")) {
		const route = el.closest("[navigationKey]");
		if (!route || route.hasAttribute("navigationBack") || el.closest("[data-exiting]")) continue;
		const id = el.getAttribute("data-testid");
		if (!id) continue;
		if (seen.has(id) && seen.get(id) !== route && !inspection.reported.has(id)) {
			inspection.reported.add(id);
			log(`navigation: testId ${JSON.stringify(id)} occurs on multiple routes; covered routes remain mounted`);
		}
		seen.set(id, route);
	}
}
function captureLink(event) {
	pressedLink = null;
	const link = event.target.closest?.("a[href]");
	if (!link || !root.contains(link) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || link.target && link.target !== "_self") return;
	const url = new URL(link.href, location.href);
	if (url.origin !== location.origin || !routeMatches(url.pathname + url.search)) return;
	const press = pressedLink = {
		event,
		from: last?.top,
		url: url.pathname + url.search + url.hash,
		at: canonicalOf(url.pathname + url.search)
	};
	setTimeout(() => {
		if (pressedLink === press) pressedLink = null;
	}, 0);
}
const routesIn = (node) => viewChildren(node).filter((r) => r.hasAttribute("navigationKey") && !r.hasAttribute("data-exiting"));
const setInert = (el, on) => {
	if (el.inert !== on) el.inert = on;
};
const liveById = (id, root = document) => {
	const el = document.getElementById(id), live = (n) => !n.closest("[data-exiting]");
	return !el ? null : live(el) && root.contains(el) ? el : [...root.querySelectorAll("[id]")].find((n) => n.id === id && live(n)) ?? null;
};
const leavingSheets = new Set();
const shownRoutes = new WeakMap();
function sheetLeaves(el) {
	if (typeof matchMedia !== "function" || typeof HTMLTextAreaElement !== "function" || el.nodeType !== 1 || el.getAttribute("navigationPresentation") !== "modal" || el.hasAttribute("data-exiting") || !el.isConnected || el.querySelector("audio, video, dialog[open], :popover-open") || "createValueRange" in HTMLTextAreaElement.prototype && el.querySelector("textarea[data-decorations]") || getComputedStyle(el).position !== "fixed" || matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
	if (el.parentElement?.hasAttribute("data-exact-list-item")) unwrapListItem(el.parentElement);
	if (el.contains(document.activeElement)) document.activeElement.blur();
	const top = getComputedStyle(el).top;
	el.setAttribute("navigationKey", "");
	el.setAttribute("data-exiting", "");
	el.setAttribute("aria-hidden", "true");
	el.inert = true;
	const now = getComputedStyle(el), from = now.translate === "none" ? "0 0" : now.translate;
	Object.assign(el.style, {
		transition: "none",
		pointerEvents: "none"
	});
	el.style.setProperty("top", top, "important");
	const slide = el.animate([{ translate: from }, { translate: "0 100vh" }], {
		duration: 400,
		easing: "cubic-bezier(.32, .72, 0, 1)"
	}), done = () => {
		leavingSheets.delete(slide);
		el.remove();
	};
	leavingSheets.add(slide);
	slide.finished.then(done, done);
	return true;
}
const tabsOf = (nav) => {
	const all = [...nav?.getElementsByTagName("*") ?? []];
	const owns = (el) => {
		for (let p = el.parentElement; p; p = p.parentElement) if (p.hasAttribute("navigationKey")) return p === nav;
		return false;
	};
	for (const list of all.filter((el) => el.getAttribute("role") === "tablist" && owns(el))) {
		const panels = viewChildren(list).filter((tab) => tab.getAttribute("role") === "tab" && tab.hasAttribute("aria-controls")).map((tab) => all.find((panel) => panel.getAttribute("id") === tab.getAttribute("aria-controls"))).filter((panel) => panel?.getAttribute("role") === "tabpanel" && owns(panel));
		if (panels.length) return [list, panels];
	}
	return [null, []];
};
const panelsOf = (nav) => tabsOf(nav)[1];
const stacksOf = (nav) => {
	const panels = panelsOf(nav);
	return panels.length ? panels.map(routesIn) : [nav ? routesIn(nav) : []];
};
const WIDE_WIDTH = 900;
const WIDE = `(min-width: ${WIDE_WIDTH}px)`;
const wide = () => {
	if (!globalThis.matchMedia?.(WIDE).matches) return false;
	const { cols, rects } = fold();
	return cols === 1 || rects.length > 0 && rects.every(([, , width]) => width >= WIDE_WIDTH);
};
let splitLists = new WeakMap();
let rowOf = new WeakMap();
let actionRows = new WeakMap();
let visits = new Map();
const activationRequired = new WeakSet();
const activated = new WeakSet();
const sheet = (route) => ["modal", "fullscreen"].includes(route?.getAttribute("navigationPresentation"));
let framing = null;
const useSheets = (frame) => {
	framing = frame;
};
const sheetDetents = new WeakMap();
const TALLEST = "(100% - env(safe-area-inset-top, 0px) - 12px - env(safe-area-inset-bottom, 0px))";
function keptDetents(said) {
	const kept = [];
	for (const word of said.split(" ").filter(Boolean)) {
		const share = word.endsWith("%") ? Number(word.slice(0, -1)) : NaN, points = Number(word);
		const [kind, height] = word === "large" ? ["large", 100] : word === "medium" ? ["share", 50] : word === "fit-content" ? ["content", 0] : word.endsWith("%") ? share > 0 && share <= 100 ? share === 100 ? ["large", 100] : ["share", share] : [] : Number.isFinite(points) && points > 0 ? ["points", points] : [];
		const last = kept.at(-1);
		if (kind && !(last && (last.kind === "large" || kind !== "large" && (last.kind !== kind || height <= last.height)))) kept.push({
			word,
			kind,
			height
		});
	}
	return kept;
}
function selectedDetent(route) {
	const said = route.getAttribute("data-navigationdetent") ?? "";
	let chosen = sheetDetents.get(route);
	if (chosen?.said !== said) {
		const kept = keptDetents(said), initial = route.getAttribute("data-navigationinitialdetent");
		const { kind = "large", height = 100, word } = kept.find((d) => d.word === initial) ?? kept[0] ?? {};
		const css = kind === "share" ? `calc(${TALLEST} * ${word === "medium" ? ".5" : height / 100})` : kind === "points" ? `${height}px` : "";
		sheetDetents.set(route, chosen = {
			said,
			kind: kind === "content" ? "fit-content" : css ? "height" : null,
			css
		});
	}
	return chosen;
}
function sheetFrame(routes, index, shownIn, inUse) {
	const route = routes[index], at = shownIn[index], pushed = at >= 0 && at !== index;
	if (at === index && !inUse.has(index)) sheetDetents.delete(route);
	const chosen = inUse.has(at) ? selectedDetent(routes[at]) : null;
	if (route.hasAttribute("data-exact-in-sheet") !== pushed) route.toggleAttribute("data-exact-in-sheet", pushed);
	if ((route.getAttribute("data-exact-detent") ?? null) !== (chosen?.kind ?? null)) chosen?.kind ? route.setAttribute("data-exact-detent", chosen.kind) : route.removeAttribute("data-exact-detent");
	if (route.style.getPropertyValue("--exact-sheet-detent") !== (chosen?.css ?? "")) route.style.setProperty("--exact-sheet-detent", chosen?.css ?? "");
}
const sheetAt = (routes, i) => {
	for (let j = i; j > 0; j--) {
		const p = routes[j].getAttribute("navigationPresentation");
		if (p === "modal" || p === "fullscreen") return p === "modal" ? j : -1;
	}
	return -1;
};
const overPage = (route) => {
	const p = route?.getAttribute("navigationPresentation");
	if (p !== "fullscreen") return p === "modal";
	const { backgroundColor: c = "rgba(1, 2, 3, 0)", backgroundImage: i = "none" } = getComputedStyle(route);
	return c !== "rgba(1, 2, 3, 0)" || i !== "none";
};
let pressedRow = null;
let pendingRow = null;
const excluded = (el) => el.hasAttribute("popover") || el.hasAttribute("data-exiting") || getComputedStyle(el).display === "none";
const rowPress = (el) => el.getAttribute("data-exact-router-press");
const rowHref = (el) => el.getAttribute("href") || null;
const linked = (href) => href?.startsWith("/") && !href.startsWith("//") && routeMatches(href);
function listRows(list) {
	const rows = [], walk = (parent) => {
		for (const el of parent.children) {
			if (excluded(el)) continue;
			const press = rowPress(el), href = rowHref(el);
			if (press !== null || href) rows.push({
				el,
				press,
				href
			});
			else walk(el);
		}
	};
	walk(list);
	return rows;
}
function pushingList(route, retained = splitLists.get(route)) {
	const open = new Map(), across = new Map(), memo = (m, el, f) => {
		let v = m.get(el);
		if (v === void 0) m.set(el, v = f(el));
		return v;
	};
	const passable = (el) => memo(open, el, (e) => !e.hasAttribute("navigationKey") && !excluded(e));
	const sideways = (el) => memo(across, el, (e) => {
		const s = getComputedStyle(e);
		return /flex/.test(s.display) && s.flexDirection.startsWith("row") || Number(e.getAttribute("data-exact-estimated-item-width")) > 0;
	});
	let empty = null;
	candidates: for (const el of route.querySelectorAll("[data-exact-list]")) {
		if (!passable(el)) continue;
		for (let up = el.parentElement; up !== route; up = up.parentElement) if (!up || !passable(up) || up.hasAttribute("data-exact-list") && !sideways(up)) continue candidates;
		if (sideways(el)) continue;
		const rows = listRows(el), found = {
			list: el,
			rows
		};
		if (rows.some((r) => r.press === "true" || r.press === null && linked(r.href))) return found;
		if (el === retained && !rows.length) empty = found;
	}
	return empty;
}
function splitOf([route]) {
	if (typeof globalThis.getComputedStyle !== "function" || typeof globalThis.matchMedia !== "function") {
		if (route) splitLists.delete(route);
		return {
			width: 0,
			list: null,
			rows: []
		};
	}
	const said = route?.getAttribute("navigationSplit"), explicit = Number(said);
	const found = route && said !== "none" && !sheet(route) ? pushingList(route) : null;
	const width = route && said !== "none" && !sheet(route) && wide() && /^(absolute|fixed)$/.test(getComputedStyle(route).position) ? Number.isFinite(explicit) && explicit > 0 ? explicit : found ? 320 : 0 : 0;
	if (route) {
		if (found && (width || splitLists.has(route))) splitLists.set(route, found.list);
		else splitLists.delete(route);
	}
	return {
		width,
		list: found?.list,
		rows: found?.rows ?? []
	};
}
function captureRow(event) {
	pressedRow = null;
	if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	const route = event.target.closest?.("[data-exact-split=\"list\"]"), list = route && splitLists.get(route);
	if (!list || !root.contains(route)) return;
	let owner = event.target;
	while (owner && owner !== list && rowPress(owner) === null && !rowHref(owner)) owner = owner.parentElement;
	if (owner?.matches("a[href]") && (owner.target && owner.target !== "_self" || owner.hasAttribute("download"))) return;
	if (listRows(list).some((r) => r.el === owner && r.press === "true")) {
		const candidate = pressedRow = {
			row: owner,
			list,
			route,
			from: last?.url,
			event
		};
		setTimeout(() => {
			if (pressedRow === candidate) pressedRow = null;
		}, 0);
	}
}
function detailRows(routes, found) {
	for (const route of routes.slice(1)) {
		const id = route.getAttribute("navigationKey"), url = visits.get(id);
		let action = actionRows.get(route);
		if (pendingRow?.id === id && pendingRow.url === url) action = pendingRow;
		const valid = action && action.route === routes[0] && action.list === found.list && action.url === url && found.rows.some((r) => r.el === action.row && r.press === "true");
		if (valid) actionRows.set(route, action);
		else actionRows.delete(route);
		const row = found.rows.find((r) => r.press === null && linked(r.href) && r.href === url)?.el ?? (valid ? action.row : null);
		if (row) rowOf.set(route, row);
		else rowOf.delete(route);
	}
}
const paths = new WeakMap();
const freshPath = (route) => {
	const path = last?.url?.split(/[?#]/)[0], was = paths.get(route);
	paths.set(route, path);
	if (was !== void 0 && was !== path) {
		for (const el of [route, ...route.querySelectorAll("*")]) if (el.scrollTop || el.scrollLeft) el.scrollTo(0, 0);
		if (route.matches("[data-scrolldocument=\"true\"]:not([data-exact-offpage])") || route.querySelector("[data-scrolldocument=\"true\"]:not([data-exact-offpage])")) scrollTo(0, 0);
	}
};
const unsaidBar = (nav, list) => viewParent(list) === nav && getComputedStyle(list).appearance !== "none" && list.getAttribute("aria-orientation") !== "vertical" && (([n, l]) => /flex/.test(n.display) && n.flexDirection.startsWith("column") && /^(static|relative)$/.test(l.position) && l.flexDirection.startsWith("row"))([getComputedStyle(nav), getComputedStyle(list)]);
function unselectedWithin(nav, keepList) {
	const key = nav.getAttribute("navigationKey"), panels = panelsOf(nav), stacks = panels.length ? panels.map(routesIn) : [routesIn(nav)];
	const at = stacks.findIndex((routes) => routes.some((r) => r.getAttribute("navigationKey") === key)), routes = stacks[at] ?? [], top = routes.find((r) => r.getAttribute("navigationKey") === key);
	const beside = keepList && routes[0]?.getAttribute("data-exact-split") === "list" && !sheet(top) ? routes[0] : top;
	return at < 0 ? [] : [...panels.filter((_, i) => i !== at), ...routes.filter((r) => r !== top && r !== beside)];
}
function unselected(nav) {
	return unselectedWithin(nav, true);
}
function unselectedForHead(nav) {
	return unselectedWithin(nav, false);
}
function routeFlags(root) {
	const off = new Set([...root.querySelectorAll("[navigationBack]")].flatMap((nav) => unselected(nav))), seen = new Map();
	const at = (el) => {
		if (!el || el === root) return 0;
		let v = seen.get(el);
		if (v === void 0) seen.set(el, v = Math.max(off.has(el) ? el.style.visibility === "hidden" ? 2 : 1 : 0, at(el.parentElement)));
		return v;
	};
	return at;
}
const routesOf = (nav) => stacksOf(nav).find((routes) => routes.some((r) => r.getAttribute("navigationKey") === nav.getAttribute("navigationKey"))) ?? [];
const selectedRoute = (nav) => routesOf(nav).find((r) => r.getAttribute("navigationKey") === nav.getAttribute("navigationKey"));
const browserIndex = () => globalThis.navigation?.currentEntry?.index ?? null;
const agentParameters = [
	"agent",
	"seed",
	"locale",
	"formatLocale",
	"timeZone",
	"epoch",
	"storage",
	"failFetch"
];
function historyURL(path) {
	const facts = launched(), url = new URL(location.href), route = new URL(path.startsWith("/") ? "/." + path : path, url);
	url.pathname = route.pathname;
	url.search = route.search;
	url.hash = route.hash;
	if (facts?.has("agent")) {
		for (const key of agentParameters) if (facts.has(key)) url.searchParams.set(key, facts.get(key));
	}
	return url.href;
}
const byPerson = (e, el = e.target) => e.type === "keydown" ? /^(Arrow(Up|Down|Left|Right)|Page(Up|Down)|Home|End| )$/.test(e.key) && !el.closest?.("input, textarea, select, [contenteditable]") : e.type !== "pointerdown" || el instanceof Element && ((b) => e.clientX - b.left >= el.clientLeft + el.clientWidth || e.clientY - b.top >= el.clientTop + el.clientHeight)(el.getBoundingClientRect());
const stamp = (index, op) => ({
	exact: index,
	id: op.top,
	url: op.url
});
const backControl = (nav, route = selectedRoute(nav), name = nav.getAttribute("navigationBack")) => route && name !== null ? route.querySelector(`[id="${CSS.escape(name)}"]`) ?? [...nav.ownerDocument.querySelectorAll(`[id="${CSS.escape(name)}"]`)].find((control) => [null, nav].includes(control.closest("[navigationKey]"))) ?? null : void 0;
const BACK = `<style>button{all:unset;display:inline-flex;align-items:center;gap:6px;flex:none;vertical-align:middle;margin-inline:-6px 6px;padding:4px 8px 4px 4px;border-radius:8px;cursor:pointer;white-space:nowrap;-webkit-user-select:none;user-select:none}button[hidden],span[hidden]{display:none}button:focus-visible{outline:2px solid var(--exact-accent,AccentColor);outline-offset:1px}button:active>*{opacity:var(--exact-back-press,.5)}svg{width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}button:dir(rtl) svg{scale:-1 1}</style><button part="back" type="button"><svg viewBox="4 4 16 16" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg><span></span></button><slot></slot>`;
const headerOf = (route) => viewChildren(route).find((child) => child.localName === "header");
const authored = "[data-exact-said~=\"appearance\"]";
const siteHeader = (header, links = 0) => {
	const holds = (el, menu) => [...el.children].some((child) => {
		const inMenu = menu || child.matches("[popover], dialog");
		return child.localName === "nav" || !inMenu && child.matches("a[href], [role=link]") && ++links > 1 || holds(child, inMenu);
	});
	return holds(header, false);
};
const markSites = (route) => {
	for (const child of viewChildren(route)) if (child.localName === "header") child.toggleAttribute("data-exact-site", siteHeader(child));
};
const asWritten = (header) => header.matches(`${authored}, [data-exact-site]`);
function barItems(route, header) {
	if (route.getAttribute("data-navigationbar") === "none" || viewChildren(route)[0] !== header || asWritten(header)) return null;
	const heading = "[data-exact-text][role=heading]", press = "[data-exact-on~=\"press\"]", layer = (el) => el.matches("[popover], dialog");
	const holds = (el) => [...el.children].some((child) => !layer(child) && (child.matches(heading) || holds(child)));
	const disabled = (el) => el.matches("button[disabled]") && !el.hasAttribute("role") && root?.getAttribute("aria-busy") !== "true";
	const box = (el) => el.localName === "div" ? !el.hasAttribute("data-exact-text") : /^(main|header|nav|section|footer|article|aside)$/.test(el.localName);
	let headings = 0, tap = null, placed = 0, unplaced = false, searches = 0, tablists = 0;
	const items = [], walk = (node) => {
		for (const child of node.children) {
			if (layer(child)) continue;
			if (child.matches(`[role=tablist], input[type="search"], ${authored}`)) {
				placed++;
				if (child.matches("input[type=\"search\"]") && searches++ || child.matches("[role=tablist]") && tablists++) unplaced = true;
				continue;
			}
			if (child.matches(heading)) headings++;
			else if (child.matches(press) || opens(child) || disabled(child) && !holds(child)) {
				if (!tap && child.matches(press) && holds(child)) walk(tap = child);
				else items.push(child);
			} else if (child.matches("[role=status]") && !holds(child)) placed++;
			else {
				unplaced ||= !box(child);
				walk(child);
			}
		}
	};
	walk(header);
	return headings === 1 || headings === 0 && !unplaced && (items.length > 0 || placed > 0) ? items : null;
}
function markBars(node) {
	for (const child of node.children) {
		if (child.hasAttribute("navigationKey")) markSites(child);
		const header = child.hasAttribute("navigationKey") && !child.hasAttribute("navigationBack") && headerOf(child);
		if (header) header.toggleAttribute("data-exact-bar", !!barItems(child, header));
		markBars(child);
	}
}
function opens(el) {
	if (el.localName !== "button") return false;
	const commanded = document.getElementById(el.getAttribute("commandfor") || "");
	if (commanded) {
		const command = el.getAttribute("command") ?? "";
		return commanded.hasAttribute("popover") && /^(show|toggle)-popover$/i.test(command) || commanded.localName === "dialog" && /^show-modal$/i.test(command);
	}
	return !!document.getElementById(el.getAttribute("popovertarget") || "")?.hasAttribute("popover") && !/^hide$/i.test(el.getAttribute("popovertargetaction") ?? "");
}
const titleOf = (route) => {
	for (const el of headerOf(route)?.getElementsByTagName("*") ?? []) if (el.matches("h1, h2, h3, h4, h5, h6, [role=heading]")) return el.textContent.trim();
	return "";
};
let saidTitle = null;
let appName = null;
function routeTitle(root) {
	for (const nav of root?.getElementsByTagName("*") ?? []) if (nav.hasAttribute("navigationBack")) return titleOf(selectedRoute(nav)) || null;
	return null;
}
function pageTitle(said = saidTitle) {
	saidTitle = said;
	appName ??= document.querySelector("meta[property=\"og:site_name\"]")?.content ?? document.title;
	const title = said ?? routeTitle(root) ?? appName;
	if (document.title !== title) document.title = title;
}
function contentScroller(route) {
	const scrolls = (el) => /^(auto|scroll)$/.test(getComputedStyle(el).overflowY), named = route.getAttribute("data-navigationscroll");
	if (named) return [...route.querySelectorAll(`[id="${CSS.escape(named)}"]`)].find(scrolls) ?? null;
	let level = [route];
	for (let depth = 0; depth < 8 && level.length && level.length <= 256; depth++) {
		const hit = level.find(scrolls);
		if (hit) return hit;
		level = level.flatMap((el) => getComputedStyle(el).display === "none" ? [] : [...el.children]);
	}
	return null;
}
const clearInset = new WeakSet();
const clearBars = new WeakMap();
const barResized = globalThis.ResizeObserver && new ResizeObserver((entries) => {
	for (const { target } of entries) {
		const route = clearBars.get(target);
		route?.isConnected && clearBar(route);
	}
});
function clearBar(route) {
	const header = headerOf(route), clear = !!header && route.getAttribute("data-navigationbar") === "transparent" && viewChildren(route)[0] === header && !asWritten(header);
	if (clearInset.has(route)) {
		clearInset.delete(route);
		route.style.removeProperty("--exact-safe-area-inset-top");
		route.style.removeProperty("--exact-bar-height");
	}
	for (const el of viewChildren(route)) if (el.hasAttribute("data-exact-clear") && !(clear && el === header)) {
		el.removeAttribute("data-exact-clear");
		barResized?.unobserve(el);
		clearBars.delete(el);
	}
	if (!clear) return;
	if (!clearBars.has(header)) {
		clearBars.set(header, route);
		barResized?.observe(header);
	}
	const below = getComputedStyle(route).getPropertyValue("--exact-safe-area-inset-top") || "0px", height = header.offsetHeight;
	clearInset.add(route);
	route.style.setProperty("--exact-bar-height", `${height}px`);
	route.style.setProperty("--exact-safe-area-inset-top", `calc(${below} + ${height}px)`);
	barScrolled(route, header);
}
const barScrolled = (route, header) => header.setAttribute("data-exact-clear", (contentScroller(route) ?? document.scrollingElement)?.scrollTop > 0 ? "scrolled" : "");
function appBarBack(nav, routes, index, split, shown) {
	const route = routes[index], header = headerOf(route);
	if (!header) return;
	const headerShown = getComputedStyle(header).display !== "none";
	const pushed = index > 0 && !sheet(route) && route.getAttribute("data-navigationbar") !== "none" && !(split && (index === 1 || rowOf.has(route))) && !(asWritten(header) && headerShown);
	const control = pushed ? backControl(nav, route) : null, inShownHeader = headerShown && !!control && header.contains(control) && !header.contains(control.closest("[popover], dialog"));
	const items = headerShown && (inShownHeader || shown) ? barItems(route, header) : null;
	const held = inShownHeader && !!items?.includes(control);
	for (const el of route.querySelectorAll("[data-exact-bar-back]")) if (el !== control || !held) el.removeAttribute("data-exact-bar-back");
	const drawn = pushed && !(inShownHeader && header.contains(control.closest(authored))) && (!inShownHeader || !!items || !control.checkVisibility({ visibilityProperty: true }));
	if (shown) header.toggleAttribute("data-exact-bar", !!items);
	let button = header.shadowRoot?.querySelector("button[part=\"back\"]");
	if (drawn && !button && !header.shadowRoot && header.attachShadow) {
		header.attachShadow({ mode: "open" }).innerHTML = BACK;
		button = header.shadowRoot.querySelector("button");
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			appBack(viewParent(header));
		});
	}
	for (const el of [...route.querySelectorAll("[data-exact-bar-back]"), control]) el?.toggleAttribute("data-exact-bar-back", el === control && held && !!button);
	if (button) button.hidden = !drawn || control?.matches(":disabled") && !nav.closest("[aria-busy=\"true\"]") || route.contains(inertAncestor(control)?.parentElement ?? null);
	if (!button || button.hidden) return;
	const words = control ? control.textContent.trim() : titleOf(routes[index - 1]), english = /^en\b/i.test(document.documentElement.lang || "en");
	const label = control ? words.length <= 14 ? words : english ? "Back" : "" : english ? "Back" : "", name = control ? control.getAttribute("aria-label") || words || "Back" : !english ? words || "Back" : words ? `Back to ${words}` : "Back";
	button.lastChild.hidden = !label;
	if (button.lastChild.textContent !== label) button.lastChild.textContent = label;
	if (button.getAttribute("aria-label") !== name) button.setAttribute("aria-label", name);
	if (control?.hasAttribute("aria-keyshortcuts") && !control.checkVisibility({ visibilityProperty: true })) button.setAttribute("aria-keyshortcuts", control.getAttribute("aria-keyshortcuts"));
	else button.removeAttribute("aria-keyshortcuts");
}
function appBack(route) {
	const nav = route?.parentElement?.closest("[navigationBack]");
	if (!nav || route !== selectedRoute(nav)) return;
	const routes = routesOf(nav), below = routes[routes.indexOf(route) - 1], id = Number(route.getAttribute("navigationKey"));
	if (!below) return;
	if (backControl(nav)) {
		const why = pressBack(nav);
		if (why) log(`app bar: Back refused: ${why}`);
		return;
	}
	const entry = written[cursor - 1];
	if (!(cursor > first && written[cursor]?.id === id && entry?.id === Number(below.getAttribute("navigationKey"))) || navigate(entry.url.split("#")[0]) === false) hostBack?.(id);
}
const closedNone = (route) => ["modal", "fullscreen"].includes(route?.getAttribute("navigationPresentation")) && route.getAttribute("closedby") === "none";
function pressBack(nav) {
	const route = selectedRoute(nav), control = backControl(nav);
	if (!route) return "no route is selected";
	if (closedNone(route)) return `route ${route.getAttribute("navigationKey")} is closedby="none"`;
	if (!control) return `route ${route.getAttribute("navigationKey")} has no id="${nav.getAttribute("navigationBack")}" control`;
	if (control.matches(":disabled") || inertAncestor(control)) return `its id="${control.id}" control is disabled or inert`;
	control.click();
}
function go(to, from, finish = () => {}) {
	const index = browserIndex();
	const current = index !== null && originIndex !== null ? index - originIndex : from;
	if (to === current) {
		finish();
		return;
	}
	echo = {
		index: to,
		finish
	};
	history.go(to - current);
}
function commit(op) {
	for (const id of op.removed) gone.add(id);
	if (first === null) {
		first = 0;
		originIndex = browserIndex();
		written[0] = stamp(0, op);
		history.replaceState(written[0], "", historyURL(op.url));
	} else if (written[cursor]?.id === op.top && !(pop === null && written[cursor].url !== op.url && written[cursor].url.split("#")[0] === op.url.split("#")[0])) {
		if (written[cursor].url !== op.url) {
			written[cursor] = stamp(cursor, op);
			history.replaceState(written[cursor], "", historyURL(op.url));
		}
	} else {
		let j = cursor;
		while (j > first && gone.has(written[j]?.id)) {
			j--;
			if (written[j]?.id === op.top) {
				const from = cursor;
				cursor = j;
				return go(j, from, () => written[j].url === op.url || history.replaceState(written[j] = stamp(j, op), "", historyURL(op.url)));
			}
		}
		for (const index of Object.keys(written)) if (Number(index) > cursor) delete written[index];
		written.length = Math.max(0, cursor + 1);
		op.pushed = written[cursor]?.id === op.top;
		written[++cursor] = stamp(cursor, op);
		history.pushState(written[cursor], "", historyURL(op.url));
		globalThis.exact?.fragment?.forget(cursor);
	}
}
function popped({ j, state, url, ua }) {
	const entry = written[j];
	const owned = entry && state?.exact === j && state.id === entry.id && state.url === entry.url;
	const target = owned ? entry.url : url;
	const nav = root.querySelector("[navigationBack]");
	const routes = routesOf(nav), selected = routes.indexOf(selectedRoute(nav));
	const step = owned && j === cursor - 1 && entry.id !== written[cursor]?.id, beneath = step && selected > 0 && routes[selected - 1].getAttribute("navigationKey") === String(entry.id);
	let back = beneath && !!backControl(nav), own = false, why = null;
	pop = { ua };
	try {
		if (back) why = pressBack(nav);
		else if (navigate(target) === false) {
			own = true;
			back = step && (!!backControl(nav) || closedNone(selectedRoute(nav)));
			if (back) why = pressBack(nav);
			else if (step) hostBack?.(written[cursor].id);
			else hostGo?.(target);
		}
		if (back ? last?.top === entry.id : (pop.op ?? (!owned || entry.id === last?.top ? last : null))?.url === target) {
			cursor = j ?? cursor;
			first = Math.min(first, cursor);
			written[cursor] = stamp(cursor, last);
			go(cursor, j ?? cursor, () => history.replaceState(written[cursor], "", historyURL(written[cursor].url)));
			if (!pop.op) globalThis.exact?.fragment?.traverse(root, last, navigation, log);
		} else if (pop.op) {
			const op = pop.op;
			if (j !== null && j !== cursor) go(cursor, j, () => commit(op));
			else {
				history.replaceState(written[cursor], "", historyURL(written[cursor].url));
				commit(op);
			}
		} else {
			if (back) log(`history: Back refused: ${why ?? `pressing the Back control did not select entry ${entry.id}`}; restoring the entry`);
			else log(`history: ${own ? `${step ? "Back to" : "navigate"} ${JSON.stringify(target)} refused: the navigation root has no navigate handler (navigate=…), and the runner's own ${step ? `back from visit ${written[cursor].id}` : "go there"} committed no router change` : `${beneath ? `Back to ${JSON.stringify(target)} refused: route ${nav.getAttribute("navigationKey")} has no id="${nav.getAttribute("navigationBack")}" control, and` : `navigate ${JSON.stringify(target)} refused:`} the navigation root's navigate handler (navigate=…) committed no router change, or the root has none`}; restoring the entry`);
			if (j !== null && j !== cursor) go(cursor, j);
			else history.replaceState(written[cursor], "", historyURL(written[cursor].url));
		}
	} finally {
		pop = null;
	}
}
function drain() {
	if (draining || echo !== null) return;
	draining = true;
	try {
		for (let item; queue.length && echo === null;) {
			item = queue.shift();
			if (item.op) commit(item.op);
			else popped(item);
		}
	} finally {
		draining = false;
	}
}
const settled = () => {
	if (echo === null && !queue.length) for (const finish of [...waiters]) finish();
};
const navigation = {
	personScrolls: 0,
	get traversing() {
		return pop;
	},
	holdLink() {
		return heldLink ?? (pressedLink?.event.eventPhase ? pressedLink : null);
	},
	withLink(link, update) {
		const was = heldLink;
		heldLink = link;
		try {
			return update();
		} finally {
			heldLink = was;
		}
	},
	connect(hostRoot, dispatch, journal, back = null, goTo = null, matchesRoute = () => false, waitForActivation = false, canonical = (location) => location) {
		root = hostRoot;
		navigate = dispatch;
		log = journal;
		hostBack = back;
		hostGo = goTo;
		routeMatches = matchesRoute;
		canonicalOf = canonical;
		for (const type of [
			"wheel",
			"touchmove",
			"keydown",
			"pointerdown"
		]) addEventListener(type, (e) => {
			if (byPerson(e)) navigation.personScrolls++;
		}, {
			capture: true,
			passive: true
		});
		if (waitForActivation) {
			activationRequired.add(hostRoot);
			activated.delete(hostRoot);
		} else {
			activationRequired.delete(hostRoot);
			activated.add(hostRoot);
		}
		document.addEventListener("click", captureRow, true);
		document.addEventListener("scroll", () => {
			for (const header of root.querySelectorAll("[data-exact-clear]")) clearBars.has(header) && barScrolled(clearBars.get(header), header);
		}, {
			capture: true,
			passive: true
		});
		document.addEventListener("click", captureLink, true);
		document.addEventListener("dragstart", (event) => {
			if (root.contains(event.target) && event.target.matches?.("img[data-symbol-source], :is(button, a[href], [data-exact-on~=\"press\"]) img")) event.preventDefault();
		});
		globalThis.matchMedia?.(WIDE).addEventListener?.("change", () => navigation.project(root, log));
		onFold(() => navigation.project(root, log));
		addEventListener("popstate", (event) => {
			if (!last) return;
			const index = browserIndex();
			const j = index !== null && originIndex !== null ? index - originIndex : Number.isInteger(event.state?.exact) ? event.state.exact : null;
			if (echo !== null && j === echo.index) {
				const finish = echo.finish;
				echo = null;
				finish();
				drain();
				settled();
				return;
			}
			queue.push({
				j,
				state: event.state,
				url: launchLocation(),
				ua: event.hasUAVisualTransition
			});
			if (echo !== null) {
				const pending = echo;
				echo = null;
				go(pending.index, j ?? cursor, pending.finish);
			}
			drain();
			settled();
		});
		document.addEventListener("keydown", (event) => {
			if (event.key !== "Escape" || event.defaultPrevented || event.isComposing || event.keyCode === 229) return;
			if (!root.contains(event.target) && event.target !== document.body && event.target !== document.documentElement) return;
			if (document.querySelector("dialog:modal") || [...document.querySelectorAll(":popover-open")].some((p) => p.popover === "auto" || p.popover === "hint")) return;
			for (const nav of [...root.querySelectorAll("[navigationBack]")].reverse()) {
				const route = selectedRoute(nav), routes = routesOf(nav);
				if (!(route && sheetAt(routes, routes.indexOf(route)) >= 0 || ["modal", "fullscreen"].includes(route?.getAttribute("navigationPresentation"))) || inertAncestor(route) || route.checkVisibility?.({ visibilityProperty: true }) === false) continue;
				event.preventDefault();
				if (backControl(nav) || closedNone(route)) pressBack(nav);
				else appBack(route);
				return;
			}
		});
	},
	activate(hostRoot = root, journal = log) {
		activated.add(hostRoot);
		navigation.project(hostRoot, journal);
	},
	reset(op = null) {
		refused = new WeakMap();
		splitLists = new WeakMap();
		rowOf = new WeakMap();
		actionRows = new WeakMap();
		pressedRow = pendingRow = null;
		pressedLink = heldLink = null;
		reportedLinkPop = false;
		duplicateIds = new WeakMap();
		visits = new Map((op?.visits ?? []).map(([id, url]) => [String(id), url]));
		if (op && written[cursor]?.id === op.top) return;
		last = null;
		written = [];
		gone = new Set();
		cursor = 0;
		first = null;
		originIndex = null;
		echo = null;
		pop = null;
		queue.length = 0;
		for (const finish of [...waiters]) finish();
	},
	apply(op) {
		const link = navigation.holdLink();
		pressedLink = null;
		if (!reportedLinkPop && !pop && link && link.from === last?.top && link.at === visits.get(String(op.top)) && op.removed.includes(link.from)) {
			reportedLinkPop = true;
			log(`navigation: link ${JSON.stringify(link.url)} popped the stack to a retained visit`);
		}
		visits = new Map((op.visits ?? []).map(([id, url]) => [String(id), url]));
		pendingRow = pressedRow && pressedRow.event.eventPhase !== 0 && op.url !== pressedRow.from ? {
			row: pressedRow.row,
			list: pressedRow.list,
			route: pressedRow.route,
			id: String(op.top),
			url: op.url
		} : null;
		pressedRow = null;
		last = op;
		if (pop) {
			pop.op = op;
			op.traversal = true;
			for (const id of op.removed) gone.add(id);
		} else {
			queue.push({ op });
			drain();
		}
	},
	back(hostRoot) {
		const nav = hostRoot?.querySelector("[navigationBack]"), routes = nav ? routesOf(nav) : [], route = nav && selectedRoute(nav), at = routes.indexOf(route), way = sheet(route) ? "sheet" : "route", key = nav?.getAttribute("navigationKey"), kept = () => nav.getAttribute("navigationKey") === key ? { refused: "the app kept the route: its Back control is disabled, its closedby is \"none\", or its navigate changed nothing (logs say which)" } : {};
		if (at < 1) return { error: "back: nothing to go back from: no dialog is open, and no route is beneath the selected one" };
		if (cursor > first && written[cursor]?.id === Number(route.getAttribute("navigationKey")) && written[cursor - 1]?.id === Number(routes[at - 1].getAttribute("navigationKey"))) return navigation.travel(nav, -1).then((r) => ({
			...r,
			back: way,
			...kept()
		}));
		appBack(route);
		return {
			back: way,
			delivery: "app-bar",
			...kept()
		};
	},
	travel(nav, delta) {
		if (nav !== root.querySelector("[navigationBack]")) return { error: "history target is not the navigation root" };
		if (!Number.isInteger(delta) || delta === 0) return {
			malformed: true,
			error: "history must be a nonzero integer"
		};
		return new Promise((resolve) => {
			const timer = setTimeout(finish, 1e3);
			function finish() {
				clearTimeout(timer);
				waiters.delete(finish);
				(globalThis.exact?.afterCommit ?? ((run) => run()))(() => resolve({
					history: delta,
					delivery: "platform"
				}));
			}
			waiters.add(finish);
			history.go(delta);
		});
	},
	project(root, log) {
		if (activationRequired.has(root) && !activated.has(root)) return;
		for (const route of root.querySelectorAll("[navigationKey]")) markSites(route);
		for (const nav of root.querySelectorAll("[navigationBack]")) {
			let key = nav.getAttribute("navigationKey"), [list, panels] = tabsOf(nav);
			const isWide = wide(), said = [
				isWide,
				viewParent(list) === nav && list.getAttribute("aria-orientation"),
				...[nav, list].map((el) => el && [
					el.className,
					el.style.display,
					el.style.flexDirection,
					el.style.position,
					el.style.appearance
				].join("|"))
			].join("/");
			if (placed.get(nav) !== said) {
				nav.removeAttribute("data-exact-sidebar");
				nav.toggleAttribute("data-exact-sidebar", isWide && unsaidBar(nav, list));
				placed.set(nav, said);
			}
			for (const panel of managed.get(nav) ?? []) if (!panels.includes(panel)) {
				panel.style.visibility = "";
				setInert(panel, !!panel.authoredInert);
			}
			managed.set(nav, panels);
			const stacks = panels.length ? panels.map(routesIn) : [routesIn(nav)];
			const declared = (k) => stacks.some((routes) => routes.some((route) => route.getAttribute("navigationKey") === k));
			if (!declared(key)) {
				if (refused.get(nav) !== key) {
					refused.set(nav, key);
					log(`navigationKey "${key}" matches no route among the root's children or those of the tabpanels its tablist names; the stack is unchanged`);
				}
				key = (shown.get(nav) ?? []).findLast(declared);
				if (key === void 0) continue;
			} else refused.delete(nav);
			const at = stacks.findIndex((routes) => routes.some((route) => route.getAttribute("navigationKey") === key));
			for (const [index, panel] of panels.entries()) {
				const active = index === at;
				if (!active && panel.contains(document.activeElement)) document.activeElement.blur();
				panel.style.visibility = active ? "" : "hidden";
				setInert(panel, !active || !!panel.authoredInert);
			}
			for (const [stack, routes] of stacks.entries()) {
				const selected = stack === at ? routes.findIndex((route) => route.getAttribute("navigationKey") === key) : routes.length - 1;
				if (stack === at) {
					const before = shownRoutes.get(nav) ?? [], showing = routes.slice(0, selected + 1);
					shownRoutes.set(nav, showing);
					shown.set(nav, showing.map((route) => route.getAttribute("navigationKey")));
					if (sheet(routes[selected]) && !before.includes(routes[selected])) {
						for (const slide of leavingSheets) if (viewParent(slide.effect.target) === viewParent(routes[selected])) {
							slide.finish();
							slide.effect.target.remove();
						}
					}
				}
				const host = sheetAt(routes, selected), presented = host >= 0 ? host : selected;
				const found = splitOf(routes), split = found.width, live = split && !sheet(routes[presented]);
				const modal = overPage(routes[presented]), beneath = routes.findLastIndex((r, i) => i < presented && !overPage(r));
				const scrim = routes[presented]?.getAttribute("navigationPresentation") === "modal" ? "on" : "off", parent = viewParent(routes[0]);
				if (parent && parent.getAttribute("data-exact-scrim") !== scrim && (scrim === "on" || parent.hasAttribute("data-exact-scrim"))) parent.setAttribute("data-exact-scrim", scrim);
				detailRows(routes, found);
				if (stack === at && list) setInert(list, sheet(routes[presented]) || !!list.authoredInert);
				const detail = split ? routes.findLastIndex((r, i) => i > 0 && i <= selected && !sheet(r) && sheetAt(routes, i) < 0) : -1;
				const shownIn = routes.map((r, i) => sheetAt(routes, i));
				const inUse = framing && new Set(shownIn.filter((s, i) => s >= 0 && (i === selected || live && i === 0 || modal && (i >= beneath && i < presented || split > 0 && i === 0))));
				for (const [index, route] of routes.entries()) {
					const active = index === selected || live && index === 0;
					if (!active && route.contains(document.activeElement)) document.activeElement.blur();
					const covered = modal && (index >= beneath && index < presented || split > 0 && index === 0);
					route.style.visibility = active || covered ? "" : "hidden";
					route.toggleAttribute("data-exact-covered", covered);
					setInert(route, !active || !!route.authoredInert);
					const column = !split ? null : index === 0 ? "list" : sheet(route) || shownIn[index] >= 0 ? null : "detail";
					if (route.getAttribute("data-exact-split") !== column) column ? route.setAttribute("data-exact-split", column) : route.removeAttribute("data-exact-split");
					route.style.setProperty("--exact-split", column ? `${split}px` : "");
					framing?.(routes, index, shownIn, inUse);
					appBarBack(nav, routes, index, split > 0, active || covered);
					clearBar(route);
					if (stack === at && index === selected) freshPath(route);
				}
				let row = null;
				for (let i = detail; i > 0 && !row; i--) row = rowOf.get(routes[i])?.isConnected ? rowOf.get(routes[i]) : null;
				if (!row && detail > 0) row = found.rows.find((r) => ![
					"false",
					"",
					null
				].includes(r.el.getAttribute("aria-current")))?.el ?? null;
				for (const el of routes[0]?.querySelectorAll("[data-exact-split-row]") ?? []) if (el !== row) el.removeAttribute("data-exact-split-row");
				row?.toggleAttribute("data-exact-split-row", true);
				const empty = split > 0 && detail < 0, own = routes[0]?.querySelector("[navigationSplit=\"placeholder\"]"), box = viewParent(routes[0]);
				own?.toggleAttribute("data-exact-split-placeholder", empty);
				box?.toggleAttribute("data-exact-split-empty", empty && !own);
				if (empty) {
					box.style.setProperty("--exact-split", `${split}px`);
					own && routes[0].style.setProperty("--exact-split-pane", `${(routes[0].offsetParent ?? box).clientWidth - split}px`);
				}
			}
		}
		pendingRow = null;
		inspectTestIds(root, log);
		globalThis.exact?.onProject?.(root);
		globalThis.exact?.wakeLockGlue?.projected(root);
		globalThis.exact?.orientationLockGlue?.projected(root);
		pageTitle();
	},
	observation(root) {
		const nav = root.querySelector("[navigationBack]");
		const routes = routesOf(nav);
		const key = nav?.getAttribute("navigationKey") ?? null;
		const index = routes.findIndex((r) => r.getAttribute("navigationKey") === key);
		const selected = index >= 0 ? routes[index] : null;
		return {
			url: last?.url ?? null,
			route: key,
			stack: index >= 0 ? routes.slice(0, index + 1).map((r) => r.getAttribute("navigationKey")) : [],
			presentation: ["modal", "fullscreen"].includes(selected?.getAttribute("navigationPresentation")) ? selected.getAttribute("navigationPresentation") : null,
			source: selected?.getAttribute("navigationSource") ?? null,
			closedby: selected?.getAttribute("closedby") ?? null,
			transition: {
				interactive: false,
				phase: "idle"
			},
			popover: popoverObservation(root)
		};
	}
};
//#endregion
//#region ../../exact/host/web/navigation/motion.js
function afterPaint(fn, agent = false) {
	let ran = false;
	const once = () => {
		if (!ran) {
			ran = true;
			fn();
		}
	};
	requestAnimationFrame(() => requestAnimationFrame(once));
	if (!agent) setTimeout(once, 1e3);
}
function afterPaintPieces(load, o) {
	let live = null, loading = null;
	const queue = [];
	const start = () => loading ??= Promise.all([
		load("./collection-glue.js", "collectionGlue"),
		load("./motion-glue.js", "motionGlue"),
		load("./group-glue.js", "groupGlue")
	]).then(([c, m, g]) => {
		const common = {
			views: o.views,
			now: o.now,
			generation: o.generation,
			inert: o.inert,
			applyBatch: o.applyBatch,
			ready: o.ready,
			log: o.log
		};
		const request = (facts) => o.wasm("exact_motion", m.motionBytes(facts)) ?? { accepted: false };
		const collections = c.collectionController({
			root: o.root,
			views: o.views,
			agent: !!o.agent?.(),
			settled: () => arrange.commit(),
			report(bytes) {
				const batch = o.wasm("exact_collection_feedback", bytes);
				return batch ? c.applyCollectionFeedback(batch, o.applyBatch) : false;
			}
		});
		const motion = m.motionController({
			...common,
			releaseInteraction: (pointer) => collections.releaseInteraction(pointer),
			request
		});
		const arrange = m.arrangeController({
			...common,
			collections,
			motion,
			request,
			grouped: g.groupController,
			root: o.root
		});
		live = {
			collections,
			motion,
			arrange
		};
		for (const [piece, name, args] of queue.splice(0)) try {
			live[piece][name](...args);
		} catch (error) {
			console.error(`exact: ${piece}.${name} failed`, error);
		}
		o.replayed?.();
	}).catch((error) => {
		loading = null;
		queue.length = 0;
		console.error("exact: after-paint pieces:", error);
	});
	const keyframes = (name, body) => {
		const sheet = (document.getElementById("exact-keyframes") ?? document.head.appendChild(Object.assign(document.createElement("style"), { id: "exact-keyframes" }))).sheet;
		sheet.insertRule(`@keyframes ${CSS.escape(name)}{${body}}`, sheet.cssRules.length);
	};
	const call = (piece, name, use = true) => (...args) => {
		if (live) return live[piece][name](...args);
		if (!use && !loading) return;
		queue.push([
			piece,
			name,
			args
		]);
		start();
	};
	const motion = {
		style(id, text) {
			if (live) return live.motion.style(id, text);
			const el = o.views.get(id);
			if (el) el.style.cssText = text;
		},
		keyframes
	};
	for (const name of [
		"animate",
		"retire",
		"heightBinding",
		"transformBinding",
		"attachSwipe",
		"attachHeightDrag",
		"attachTransformDrag"
	]) motion[name] = call("motion", name);
	motion.pan = {
		sample: (...a) => live?.motion.panSample(...a),
		velocity: (...a) => live?.motion.panVelocity(...a)
	};
	const arrange = {
		binding: call("arrange", "binding"),
		state: call("arrange", "state"),
		group: call("arrange", "group")
	};
	for (const piece of [motion, arrange]) for (const name of [
		"commit",
		"reset",
		"destroy"
	]) piece[name] = call(piece === motion ? "motion" : "arrange", name, false);
	motion.followTimelines = call("motion", "followTimelines", false);
	const commit = call("collections", "commit"), reconcile = call("collections", "commit", false);
	const collections = {
		commit: (items) => (items.length ? commit : reconcile)(items),
		scrollPending: () => live?.collections.scrollPending() ?? false
	};
	for (const name of [
		"reset",
		"dataReady",
		"releaseInteraction",
		"settle"
	]) collections[name] = call("collections", name, false);
	collections.jump = call("collections", "jump");
	collections.restyled = () => live?.collections.restyled();
	collections.fireOwedScrolls = async () => await live?.collections.fireOwedScrolls() ?? {
		fired: false,
		owed: 0
	};
	collections.owedScrolls = () => live?.collections.owedScrolls() ?? 0;
	let c2d = null, c2dLoading = null;
	const c2dQueue = [];
	const canvas2d = (op) => {
		if (c2d) return c2d.op(op);
		if (op.forget && !c2dLoading) return;
		c2dQueue.push(op);
		c2dLoading ??= new Promise((r) => afterPaint(r, o.agent())).then(() => load("./canvas2d-glue.js", "canvas2dGlue")).then((make) => {
			c2d = make({
				views: o.views,
				now: o.now,
				applyBatch: o.applyBatch,
				generation: o.generation
			});
			for (const q of c2dQueue.splice(0)) c2d.op(q);
		}).catch((error) => {
			c2dLoading = null;
			for (const q of c2dQueue.splice(0)) q.reject?.(error);
			console.error("exact: canvas2d:", error);
		});
	};
	const c2dPending = () => c2d ? c2d.settled() : c2dLoading?.then(() => c2d?.settled());
	return {
		collections,
		motion,
		arrange,
		canvas2d,
		preload: start,
		pending: () => {
			const p = live || !loading ? null : loading, c = c2dPending();
			return p && c ? Promise.all([p, c]) : p ?? c ?? null;
		}
	};
}
function presenceLoader(load, root, apply, log) {
	let live = null, loading = null, unavailable = false, scheduled = null;
	const held = [], row = (op) => op.op === "exit" || /(^|;)\s*--exact-(layout-transition|exit-animation)\s*:/.test((op.css ?? "").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "\"\""));
	const release = () => {
		for (const batch of held.splice(0)) apply(batch);
	};
	const start = () => loading ??= load("./presence-glue.js", "presence").then((create) => {
		live = create(root);
		release();
	}).catch((error) => {
		unavailable = true;
		loading = null;
		log(`presence module: unavailable; motion skipped: ${error}`);
		release();
	});
	return {
		get live() {
			return live;
		},
		preload() {
			if (!live && !unavailable && !loading) scheduled ??= new Promise((resolve) => afterPaint(() => {
				scheduled = null;
				resolve(unavailable ? null : start());
			}));
		},
		pending: () => live || unavailable ? null : loading ?? scheduled,
		landed(ms) {
			const p = this.pending();
			let t;
			return !p ? Promise.resolve(true) : Promise.race([p.then(() => true), new Promise((r) => {
				t = setTimeout(r, ms, false);
			})]).finally(() => clearTimeout(t));
		},
		resize(batch) {
			return {
				...batch,
				presenceSnap: true
			};
		},
		hold(batch) {
			if (live || unavailable) return false;
			const ops = batch.ops ?? [];
			if (ops.some(row)) start();
			if (!held.length && !(loading && ops.some((op) => op.op === "exit"))) return false;
			held.push(batch);
			return true;
		}
	};
}
function animationClock(now, settled, synced, early = () => void 0) {
	const starts = new WeakMap(), held = new WeakSet(), clocks = animationClocks(document);
	const timed = () => document.getAnimations().filter((a) => !a.timeline || a.timeline instanceof DocumentTimeline);
	return {
		register(t) {
			clocks.commit();
			for (const a of timed()) if (!starts.has(a)) {
				const at = early(a);
				starts.set(a, clocks.start(a, at ?? t) ?? at ?? t);
				if (a.playState === "paused" && at === void 0) held.add(a);
			} else if (held.has(a) && a.playState !== "paused") {
				held.delete(a);
				starts.set(a, clocks.start(a, t) ?? t - (a.currentTime ?? 0));
			}
		},
		runs: (a) => (!a.timeline || a.timeline instanceof DocumentTimeline) && (starts.has(a) ? !held.has(a) : a.playState !== "paused" || early(a) !== void 0),
		seek(to, sync = true) {
			for (const a of timed()) {
				const timing = a.effect?.getComputedTiming();
				if (!timing) continue;
				const t = to - (starts.get(a) ?? now());
				if (held.has(a)) continue;
				else if (t >= timing.endTime && timing.endTime !== Infinity) a.finish();
				else {
					a.pause();
					a.currentTime = t;
				}
			}
			if (sync) synced();
		},
		hold() {
			let n = 0;
			for (const a of timed()) {
				const t = a.effect?.getComputedTiming();
				if (!t || held.has(a) || !(t.activeDuration > 0) || t.activeDuration === Infinity) continue;
				const at = a.currentTime ?? 0, end = t.delay + t.activeDuration;
				if (at >= t.delay && at < end - .5) {
					a.currentTime = end - .5;
					n++;
				}
			}
			return n;
		},
		settle() {
			let to = now();
			const s = settled();
			if (s != null) to = Math.max(to, s);
			for (const a of timed()) {
				const timing = a.effect?.getComputedTiming();
				if (timing && timing.endTime !== Infinity && !held.has(a)) to = Math.max(to, (starts.get(a) ?? now()) + timing.endTime);
			}
			return to;
		}
	};
}
function animationClocks(root) {
	const origins = new Map(), members = new Map(), paused = new WeakMap(), clocked = new WeakMap();
	const clockOf = (a) => a.animationName === void 0 ? "" : a.effect?.target?.style?.getPropertyValue("--exact-animation-clock").trim() ?? "";
	const live = (a) => a.effect?.target?.isConnected && a.playState !== "idle" && a.playState !== "finished";
	const commit = () => {
		for (const [c, m] of members) {
			for (const b of m) if (!live(b) || clockOf(b) !== c) m.delete(b);
			if (!m.size) members.delete(c);
		}
	};
	function start(a, now) {
		const c = clockOf(a);
		if (!c) return null;
		let m = members.get(c);
		if (!m) members.set(c, m = new Set());
		if (!m.size || !origins.has(c)) origins.set(c, now);
		m.add(a);
		const { duration, direction } = a.effect.getComputedTiming(), period = duration * (/alternate/.test(direction) ? 2 : 1);
		if (!(period > 0 && Number.isFinite(period))) return now;
		const into = ((now - origins.get(c)) % period + period) % period;
		return now - (period - into < 1e-6 ? 0 : into);
	}
	return {
		start,
		commit,
		sync(now = document.timeline.currentTime) {
			commit();
			if (!root.querySelector("[style*=\"--exact-animation-clock\"]")) return;
			for (const a of document.getAnimations()) {
				const is = a.playState === "paused", was = paused.get(a), c = clockOf(a), had = clocked.get(a) ?? "";
				const member = !c || members.get(c)?.has(a);
				if (was === is && c === had && member) continue;
				paused.set(a, is);
				clocked.set(a, c);
				if (a.playState === "finished" || a.playState === "idle") continue;
				if (is && was !== void 0 && c === had && member) continue;
				const s = start(a, now);
				if (s !== null && !is) a.startTime = s;
			}
		}
	};
}
//#endregion
//#region ../../exact/host/web/navigation/scroll.js
function scrollFollowers(positionContexts, schedule = (fn, ms) => setTimeout(fn, ms), cancel = (t) => clearTimeout(t)) {
	const followedScrolls = new Map();
	function rememberScroll(s) {
		s.top = s.el.scrollTop;
		s.height = s.el.scrollHeight;
		s.port = s.el.clientHeight;
		s.end = s.top >= s.height - s.port - 1;
	}
	const QUIET_MS = 300;
	function quiet(s) {
		cancel(s.owned.quiet);
		s.owned.quiet = schedule(() => release(s), QUIET_MS);
	}
	function release(s) {
		if (!s.owned) return;
		cancel(s.owned.quiet);
		s.owned = null;
		rememberScroll(s);
	}
	function own(el) {
		const owned = [];
		for (const s of followedScrolls.values()) if (s.el === el || s.el.contains(el)) {
			s.owned ??= { quiet: null };
			quiet(s);
			owned.push(s);
		}
		return owned;
	}
	function settleFollow(s) {
		if (!s.el.isConnected) return;
		if (s.end && !s.owned) s.el.scrollTop = s.el.scrollHeight - s.el.clientHeight;
		rememberScroll(s);
		const children = [...s.el.children];
		if (children.length !== s.children.length || children.some((el, i) => el !== s.children[i])) {
			s.observer.disconnect();
			s.observer.observe(s.el);
			for (const child of children) s.observer.observe(child);
			s.children = children;
		}
	}
	function followScroll(el, enabled) {
		const old = followedScrolls.get(el);
		if (old || !enabled) {
			if (old && !enabled) {
				old.observer.disconnect();
				el.removeEventListener("scroll", old.scrolled);
				el.removeEventListener("scrollend", old.ended);
				if (old.owned) cancel(old.owned.quiet);
				followedScrolls.delete(el);
			}
			return;
		}
		const s = {
			el,
			top: 0,
			height: 0,
			port: 0,
			end: true,
			owned: null,
			children: []
		};
		s.observed = () => {
			if (el.scrollHeight === s.height && el.clientHeight === s.port) rememberScroll(s);
		};
		s.scrolled = () => {
			if (s.owned) quiet(s);
			s.observed();
		};
		s.ended = () => release(s);
		s.observer = new ResizeObserver(() => {
			settleFollow(s);
			positionContexts();
		});
		s.observer.observe(el);
		el.addEventListener("scroll", s.scrolled, { passive: true });
		el.addEventListener("scrollend", s.ended, { passive: true });
		followedScrolls.set(el, s);
	}
	return {
		followedScrolls,
		followScroll,
		settleFollow,
		rememberScroll,
		own,
		release
	};
}
function scrollDrag(el, listen, began, ended) {
	const o = { passive: true };
	let down = 0, finger = null, dragging = false, from = [0, 0], seen = [];
	const own = (e) => [...e.touches].filter((t) => el.contains(t.target));
	const follow = (e) => {
		if (!down) {
			from = [el.scrollLeft, el.scrollTop];
			finger = null;
		}
		const touches = own(e);
		down = touches.length;
		if (!touches.some((t) => t.identifier === finger)) {
			finger = touches[0]?.identifier ?? null;
			seen = [];
		}
	};
	const at = (e, t) => {
		seen.push([
			e.timeStamp,
			t.clientX,
			t.clientY
		]);
		while (e.timeStamp - seen[0][0] > 200) seen.shift();
	};
	listen("touchstart", follow, o);
	listen("touchmove", (e) => {
		const t = [...e.touches].find((t) => t.identifier === finger);
		if (t) at(e, t);
	}, o);
	listen("scroll", () => {
		if (down && !dragging) {
			dragging = true;
			began();
		}
	}, o);
	const lift = (e) => {
		if (own(e).length) return follow(e);
		down = 0;
		if (!dragging) return;
		dragging = false;
		const b = seen.at(-1), a = b && (seen.findLast((s) => b[0] - s[0] >= 100) ?? seen[0]), dt = b && e.timeStamp - b[0] < 100 ? b[0] - a[0] : 0, axis = (i, moved) => moved && dt > 0 ? (a[i] - b[i]) / dt : 0;
		seen = [];
		ended(axis(1, el.scrollLeft !== from[0]), axis(2, el.scrollTop !== from[1]));
	};
	listen("touchend", lift, o);
	listen("touchcancel", lift, o);
}
//#endregion
//#region ../../exact/host/web/navigation/urls.js
const declaredScheme = (protocol) => !/^(javascript|vbscript|data|file|filesystem|blob|about|view-source|jar|intent|content):$/.test(protocol) && (globalThis.exact?.openSchemes ?? []).includes(protocol.slice(0, -1));
function navigableURL(href, base = document.baseURI) {
	try {
		const url = new URL(href, base);
		return [
			"http:",
			"https:",
			"mailto:",
			"tel:"
		].includes(url.protocol) ? url.href : null;
	} catch {
		return null;
	}
}
const navigates = (el, name) => name === "href" || name === "src" && el.localName === "iframe";
const opaqueSandbox = (sandbox) => sandbox != null && !sandbox.toLowerCase().split(/[\t\n\f\r ]+/).includes("allow-same-origin");
function dataURL(src, base = document.baseURI) {
	try {
		return src != null && new URL(src, base).protocol === "data:";
	} catch {
		return false;
	}
}
const frameURL = (src, sandbox, base = document.baseURI) => navigableURL(src, base) !== null || opaqueSandbox(sandbox) && dataURL(src, base);
const pageGivenFiles = (src, base = document.baseURI) => {
	try {
		const url = new URL(src, base);
		return url.origin === new URL(base).origin && /[?&][^&=]*=app(:|%3a)/i.test(url.search);
	} catch {
		return false;
	}
};
function refuseURL(el, name, value) {
	console.warn(`exact: refused ${name} ${JSON.stringify(String(value).slice(0, 80))}: only http, https, mailto and tel navigate${name === "src" ? ", and data: in a sandbox without allow-same-origin" : ""}`);
	if (name === "src") el.setAttribute(name, "about:blank");
	else el.removeAttribute(name);
}
const iframeOrigins = new WeakMap();
function commitGuestOrigin(el) {
	const src = el.getAttribute("src"), sandbox = el.getAttribute("sandbox"), previous = iframeOrigins.get(el);
	if (previous?.src === src && previous?.sandbox === sandbox) return;
	if (previous) el.removeEventListener("load", previous.loaded);
	const opaque = opaqueSandbox(sandbox);
	let origin = null;
	if (!opaque) {
		try {
			origin = !src || src === "about:blank" ? location.origin : new URL(src, document.baseURI).origin;
		} catch {}
		if (origin === "null") origin = null;
	}
	const state = {
		src,
		sandbox,
		origin,
		opaque,
		committed: false,
		revoked: false
	};
	state.loaded = () => {
		if (iframeOrigins.get(el) !== state) return;
		if (state.committed) state.revoked = true;
		state.committed = true;
	};
	iframeOrigins.set(el, state);
	el.exactFrameChannel = state;
	el.addEventListener("load", state.loaded);
}
function guestMessageAuthorized(el, eventOrigin) {
	const state = iframeOrigins.get(el);
	return Boolean(state && !state.revoked && (state.opaque ? eventOrigin === "null" : eventOrigin === state.origin));
}
//#endregion
//#region ../../exact/host/web/navigation/markup.js
function renderMarkup(el, json, adopting = false) {
	let pieces;
	try {
		pieces = JSON.parse(json);
	} catch {
		pieces = [];
	}
	if (adopting && !pieces.some((piece) => piece[6])) return false;
	el.replaceChildren();
	let box = el, start = true;
	const paragraph = (indent) => {
		if (start) {
			start = false;
			box = el;
			if (indent > 0) {
				box = document.createElement("span");
				box.style.display = "block";
				box.style.paddingLeft = `${indent}px`;
				el.appendChild(box);
			}
		}
		return box;
	};
	for (const [text, scale, weight, flags, href, indent = 0, atom] of pieces) {
		if (atom && globalThis.exact?.atoms?.readerAtom) {
			paragraph(indent).appendChild(globalThis.exact.atoms.readerAtom(el, text, atom, scale, weight, flags));
			continue;
		}
		const destination = flags & 8 && href ? navigableURL(href) : null;
		const make = () => {
			const span = document.createElement(destination ? "a" : "span");
			if (scale !== 1) span.style.fontSize = `${scale}em`;
			if (weight) span.style.fontWeight = weight;
			if (flags & 1) span.style.fontStyle = "italic";
			if (flags & 2) span.style.fontFamily = "ui-monospace, monospace";
			if (flags & 4) span.style.textDecoration = "line-through";
			if (flags & 16) span.style.opacity = "0.62";
			if (destination) span.href = href.trim();
			if (destination && /^(https?:)?\/\//i.test(href.trim())) {
				span.target = "_blank";
				span.rel = "external noopener";
			}
			return paragraph(indent).appendChild(span);
		};
		if (flags & 32) {
			const marker = make();
			marker.style.cssText += "display:inline-flex;justify-content:flex-end;width:40px;white-space:pre;text-indent:0";
			marker.textContent = text;
			box.style.textIndent = "-40px";
			continue;
		}
		let span = null;
		text.split("\n").forEach((line, i) => {
			if (i) {
				(span ??= make()).appendChild(document.createElement("br"));
				start = true;
				span = null;
			}
			if (line) (span ??= make()).appendChild(document.createTextNode(line));
		});
	}
	return true;
}
//#endregion
//#region ../../exact/host/web/navigation/assets.js
function releaseAssets(assets) {
	for (const card of assets?.values() ?? []) if (card.objectURL) URL.revokeObjectURL(card.objectURL);
}
function devFirst() {
	if (!document.querySelector("meta[name=\"exact-dev-generation\"]")) return null;
	const slot = globalThis.exactDevFirst ??= {};
	return new Promise((resolve) => {
		const timer = setTimeout(() => resolve(null), 5e3);
		const ask = () => {
			clearTimeout(timer);
			slot.provide().then(resolve, () => resolve(null));
		};
		if (slot.provide) ask();
		else slot.ready = ask;
	});
}
//#endregion
//#region ../../exact/host/web/navigation/requests.js
function deferredFulfill(fulfill, inflight) {
	return (...args) => {
		const p = Promise.resolve().then(() => fulfill(...args));
		inflight.add(p);
		p.finally(() => inflight.delete(p));
	};
}
const refusal = (op, incarnation) => [
	incarnation,
	op.ticket,
	2,
	0,
	"",
	new TextEncoder().encode(op.message)
];
//#endregion
//#region ../../exact/host/web/navigation/selection.js
const selectedTexts = new Map();
function textSource(e) {
	return e.nodeType === Node.TEXT_NODE ? e.data : e.nodeName === "BR" ? "\n" : [...e.childNodes].map(textSource).join("");
}
function textPosition(e, offset) {
	const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeType === Node.TEXT_NODE) {
		if (offset <= n.length) return [n, offset];
		offset -= n.length;
	} else if (n.nodeName === "BR") {
		const i = [...n.parentNode.childNodes].indexOf(n);
		if (offset <= 1) return [n.parentNode, i + offset];
		offset--;
	}
	return [e, e.childNodes.length];
}
function selectionRects(e, a, b) {
	if (a === b) return [];
	const range = document.createRange();
	range.setStart(...textPosition(e, a));
	range.setEnd(...textPosition(e, b));
	return [...range.getClientRects()].map((r) => [
		r.x,
		r.y,
		r.width,
		r.height,
		false,
		false
	]);
}
function selectionChanged() {
	const s = getSelection(), r = s.rangeCount && !s.isCollapsed ? s.getRangeAt(0) : null;
	for (const [e, h] of selectedTexts) {
		if (!e.isConnected) {
			selectedTexts.delete(e);
			continue;
		}
		const at = (n, o) => {
			const p = document.createRange();
			p.selectNodeContents(e);
			const c = p.comparePoint(n, o);
			if (!c) p.setEnd(n, o);
			return c < 0 ? 0 : textSource(p.cloneContents()).length;
		};
		let a = 0, b = 0;
		if (r?.intersectsNode(e)) {
			a = at(r.startContainer, r.startOffset);
			b = at(r.endContainer, r.endOffset);
		}
		if (a === b) a = b = 0;
		if (h.a !== a || h.b !== b) {
			h.a = a;
			h.b = b;
			h.report(textSource(e).slice(a, b), a, b, selectionRects(e, a, b));
		}
	}
	if (!selectedTexts.size) document.removeEventListener("selectionchange", selectionChanged);
}
function onSelection(e, report) {
	const held = {
		report,
		a: 0,
		b: 0
	};
	selectedTexts.set(e, held);
	document.addEventListener("selectionchange", selectionChanged);
	return () => {
		if (selectedTexts.get(e) === held) selectedTexts.delete(e);
		if (!selectedTexts.size) document.removeEventListener("selectionchange", selectionChanged);
	};
}
//#endregion
//#region ../../exact/host/web/navigation/controls.js
const VALUED = new Set([
	"range",
	"date",
	"time",
	"datetime-local"
]);
const valuedControl = (el) => el instanceof HTMLSelectElement || el instanceof HTMLInputElement && VALUED.has(el.type);
function settleValue(el, acted = false) {
	const c = el instanceof HTMLOptionElement ? el.parentElement : el;
	if (acted) return;
	if (c && valuedControl(c) && c.exactValue !== void 0 && c.value !== c.exactValue) c.value = c.exactValue;
}
const typedControl = (el) => valuedControl(el) || el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio");
const textField = (el) => el instanceof HTMLTextAreaElement ? el.getAttribute("markup") !== "markdown" : el instanceof HTMLInputElement && !typedControl(el) && el.type !== "file";
const sourceField = (el) => !!el?.exactMarkup || el instanceof HTMLTextAreaElement || textField(el);
const editMenu = (target) => {
	const f = target.closest("input,textarea,[contenteditable]");
	return !!f && (!(f instanceof HTMLInputElement) || textField(f));
};
const fieldSelection = (el) => {
	const end = el.value.length;
	return `${el.selectionStart ?? end},${el.selectionEnd ?? end},${el.selectionDirection ?? "none"},`;
};
function settleRadios(el, bound) {
	const group = el.name ? [...document.querySelectorAll("input[type=\"radio\"]")].filter((r) => r.name === el.name) : [el];
	for (const r of group) if (bound(r) === false && r.checked) r.checked = false;
	for (const r of group) if (bound(r) === true && !r.checked) r.checked = true;
}
function setFieldSelection(el, args, log) {
	const [id, start, end, direction] = args ?? [];
	if (!el) return log(`setSelectionRange "${id}" refused: no live node with that id`);
	if (el.matches("[data-exact-text], [data-exact-text] *")) {
		const size = textSource(el).length, clamp = (n) => Math.min(size, Number(n) >>> 0), b = clamp(end);
		const [an, ao] = textPosition(el, Math.min(clamp(start), b)), [bn, bo] = textPosition(el, b);
		getSelection().setBaseAndExtent(...direction === "backward" ? [
			bn,
			bo,
			an,
			ao
		] : [
			an,
			ao,
			bn,
			bo
		]);
		return;
	}
	if (typeof el.setSelectionRange !== "function") return log(`setSelectionRange "${id}" refused: not a text field or text`);
	try {
		el.setSelectionRange(start, end, direction);
	} catch (error) {
		log(`setSelectionRange "${id}" refused: ${el.exactMarkup ? error.message : `an input type=${el.type} has no text selection`}`);
	}
}
function setFieldRangeText(el, args, log) {
	const [id, text, ...range] = args;
	if (!el) return log(`setRangeText "${id}" refused: no live node with that id`);
	if (typeof el.setRangeText !== "function") return log(`setRangeText "${id}" refused: not a text field`);
	try {
		el.setRangeText(text, ...range);
	} catch (error) {
		return log(`setRangeText "${id}" refused: ${el.exactMarkup ? error.message : error.name}`);
	}
	if (!el.exactMarkup) el.dispatchEvent(new InputEvent("input", {
		inputType: "insertReplacementText",
		data: text,
		bubbles: true
	}));
}
function inputPayload(el, e) {
	return `${e.inputType ?? ""},${+e.cancelable},${+!!e.isComposing},${e.data == null ? -1 : new TextEncoder().encode(e.data).length},${e.data ?? ""}${fieldSelection(el)}${el.value}`;
}
function controlEvent(el, kind, on, dispatch) {
	if (kind === "select" || kind === "selectionchange") {
		(kind === "select" ? textField : sourceField)(el) && on(kind, () => dispatch(kind === "select" ? 42 : 52, fieldSelection(el) + el.value));
		return;
	}
	if (kind === "beforeinput") return on(kind, (e) => dispatch(53, inputPayload(el, e), e));
	if (el.type === "checkbox") return on(kind, () => {
		dispatch(kind === "change" ? 24 : 25, String(el.checked));
		if (el.exactChecked !== void 0 && el.checked !== el.exactChecked) el.checked = el.exactChecked;
	});
	if (el.type === "radio") return on(kind, () => {
		dispatch(kind === "change" ? 1 : 23, el.value);
		settleRadios(el, (r) => r.exactChecked);
	});
	if (kind === "change") return on("change", () => {
		dispatch(textField(el) ? 41 : 1, (textField(el) ? fieldSelection(el) : "") + el.value);
		settleValue(el, true);
	});
	on("input", (e) => {
		const value = el.value;
		if (el.getAttribute("emojiPicker") === "true") {
			if (e.isComposing) return;
			el.value = "";
			if ([...new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(value)].length !== 1 || !(/\p{Emoji_Presentation}/u.test(value) || /[\uFE0F\u20E3]/u.test(value) && /\p{Emoji}/u.test(value))) return;
			dispatch(23, value);
			return;
		}
		dispatch(sourceField(el) ? 54 : 23, sourceField(el) ? inputPayload(el, e) : value);
		settleValue(el, true);
	});
}
//#endregion
//#region ../../exact/host/web/navigation/focus.js
function focusController({ ready, elements, inert, removed = (el) => !el.isConnected }) {
	const processed = new WeakSet(), outgoing = new WeakMap();
	let pointerTarget = null, restarting = false;
	const autofocus = () => {
		if (restarting || !ready()) return;
		for (const el of elements()) {
			if (processed.has(el) || !el.exactAutofocus || !el.getClientRects().length || inert(el) || el.matches(":disabled") || getComputedStyle(el).visibility !== "visible") continue;
			processed.add(el);
			const active = document.activeElement;
			if (active && active !== document.body && active !== pointerTarget && !(active.matches("[data-gpu-input]") && active.contains(el))) return;
			el.setAttribute("autofocus", "");
			el.focus();
			return;
		}
	};
	const keep = (tree, id) => {
		const nodes = new Map(tree.nodes?.map((n) => [n.id, n])), path = [];
		for (let n = nodes.get(id); n; n = nodes.get(n.parent)) path.unshift((n.parent == null ? tree.roots : nodes.get(n.parent)?.children ?? []).indexOf(n.id));
		return nodes.has(id) && !path.includes(-1) ? {
			path,
			type: nodes.get(id).type
		} : null;
	};
	const restart = (kept, apply, tree, view) => {
		if (kept === void 0) return apply();
		try {
			restarting = true;
			apply();
		} finally {
			restarting = false;
			for (const el of elements()) if (el.exactAutofocus) processed.add(el);
		}
		const t = kept && tree(), nodes = new Map(t?.nodes?.map((n) => [n.id, n]));
		const [, id] = kept?.path.reduce(([ids], i) => [nodes.get(ids?.[i])?.children, ids?.[i]], [t.roots]) ?? [];
		const el = id != null && nodes.get(id)?.type === kept.type ? view(id) : null;
		if (el?.isConnected && el.getClientRects().length && !inert(el) && !el.matches(":disabled")) el.focus({ preventScroll: true });
	};
	return {
		autofocus,
		keep,
		restart,
		detached(el, event) {
			const pending = outgoing.get(event.target);
			if (!pending || pending.event && pending.event !== event) return false;
			pending.event = event;
			const held = pending.path.delete(el);
			if (!pending.path.size) outgoing.delete(event.target);
			return held;
		},
		blur(el, dispatch) {
			const path = [];
			for (let at = el; at; at = at.parentElement) path.push(at);
			dispatch();
			const pending = new Set();
			for (const at of path) {
				if (!removed(at)) break;
				if (at.exactHandlers?.includes("focusout")) pending.add(at);
			}
			if (pending.size) outgoing.set(el, {
				path: pending,
				event: null
			});
		},
		press(event, el, dispatch) {
			event.stopPropagation();
			const canvas = el.closest("[data-gpu-input]");
			const previous = pointerTarget;
			pointerTarget = event.detail > 0 ? el : null;
			try {
				dispatch();
				const removed = !el.isConnected && document.activeElement === document.body;
				if (el instanceof HTMLButtonElement && (pointerTarget && document.activeElement === el || removed) && el.getAttribute("role") !== "slider" && !el.hasAttribute("data-action")) {
					if (canvas?.isConnected) {
						event.preventDefault();
						canvas.focus({ preventScroll: true });
						pointerTarget = canvas;
					}
				}
				autofocus();
			} finally {
				pointerTarget = previous;
			}
		}
	};
}
function runFocusCommands(commands, { root, ready, inertAncestor, log }) {
	for (const { name, args } of commands) {
		if (name === "scrollIntoView") {
			const el = liveById(args?.[0], root);
			if (el) el.scrollIntoView({
				block: args[1] ?? "start",
				inline: args[2] ?? "nearest",
				behavior: args[3] ?? "auto"
			});
			else log(`scrollIntoView "${args?.[0]}" refused: no live node with that id`);
			continue;
		}
		if (name === "blur") {
			const active = document.activeElement;
			if (ready && active && active !== document.body && (!args?.length || active.id === args[0])) active.blur();
			continue;
		}
		if (name === "removeAllRanges") {
			getSelection()?.removeAllRanges();
			continue;
		}
		if (name === "setSelectionRange") {
			setFieldSelection(liveById(args?.[0], root), args, log);
			continue;
		}
		if (name === "setRangeText") {
			setFieldRangeText(liveById(args?.[0], root), args, log);
			continue;
		}
		const selectText = name === "selectText";
		if (args?.length !== 1 || typeof args[0] !== "string" || !ready) continue;
		const el = liveById(args[0], root);
		const reason = !el ? "no live node with that id" : !el.isConnected ? "not mounted" : el.matches(":disabled,[disabled]") ? "disabled" : inertAncestor(el) ? "inert ancestor" : !el.getClientRects().length ? "zero size" : getComputedStyle(el).visibility !== "visible" ? "hidden ancestor" : null;
		if (reason) {
			log(`focus "${args[0]}" refused: ${reason}`);
			continue;
		}
		if (selectText && typeof el.select !== "function") {
			log(`selectText "${args[0]}" refused: not a text editor`);
			continue;
		}
		el.focus();
		if (selectText && document.activeElement === el) el.select();
	}
}
//#endregion
//#region ../../exact/host/web/navigation/store.js
function storeInPage(storage, name, value, warn = console.warn) {
	const key = name.startsWith("exact.state.") ? name : "exact.secret." + name, write = () => value == null ? storage.removeItem(key) : storage.setItem(key, value);
	try {
		try {
			write();
		} catch (e) {
			if (name.startsWith("exact.kept.") || !/quota/i.test(e?.name ?? "")) throw e;
			const aside = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter((k) => k?.startsWith("exact.secret.exact.kept.")).map((k) => [k, storage.getItem(k)]);
			for (const [k] of aside) storage.removeItem(k);
			try {
				write();
			} catch (again) {
				for (const [k, v] of aside) try {
					storage.setItem(k, v);
				} catch {}
				throw again;
			}
		}
	} catch (e) {
		warn("exact: store", name, String(e));
		return false;
	}
	return true;
}
function pageStore(load, storage = () => localStorage, warn = console.warn, locks = globalThis.navigator?.locks) {
	const pending = new Map();
	return {
		discard(name) {
			pending.delete(name);
		},
		set(name, value) {
			pending.set(name, {
				value,
				warned: false
			});
		},
		flush() {
			const jobs = [];
			for (const [name, entry] of pending) {
				const key = name.startsWith("exact.state.") ? name : "exact.secret." + name, live = () => pending.get(name) === entry;
				const report = (...line) => {
					if (!entry.warned) {
						entry.warned = true;
						warn(...line);
					}
				}, failed = (e) => {
					if (live()) {
						if (!Object.hasOwn(entry, "before")) pending.delete(name);
						report("exact: store", name, String(e));
					}
				};
				const write = () => {
					try {
						const disk = storage(), before = disk.getItem(key);
						if (Object.hasOwn(entry, "before") && entry.before !== before) {
							pending.delete(name);
							return;
						}
						entry.before = before;
						if (storeInPage(disk, name, entry.value, report)) pending.delete(name);
					} catch (e) {
						failed(e);
					}
				};
				if (Object.hasOwn(entry, "before")) {
					entry.retry ??= load("./storage-environment.js", "retrySecretWrite").then((retry) => retry(key, live, write, locks)).catch(failed).finally(() => {
						delete entry.retry;
					});
					jobs.push(entry.retry);
				} else write();
			}
			return Promise.all(jobs);
		}
	};
}
//#endregion
//#region ../../exact/host/web/navigation/grant-origins.js
function grantOrigins(memory) {
	return { origin(ptr, len, wildcard, out, capacity) {
		try {
			const target = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(memory().buffer, ptr >>> 0, len >>> 0));
			const u = new URL(target), port = u.port || {
				"http:": 80,
				"https:": 443,
				"ws:": 80,
				"wss:": 443,
				"ftp:": 21
			}[u.protocol];
			if (!u.hostname || port == null) return -1;
			const address = u.hostname.startsWith("[") || /^(?:https?|wss?|ftp):$/.test(u.protocol) && /^[\d.]+$/.test(u.hostname);
			if (wildcard && (address || !["", "/"].includes(u.pathname) || target.includes("?") || target.includes("#") || u.hostname.endsWith(".") || u.hostname.split(".").filter(Boolean).length < 2)) return -1;
			const bytes = new TextEncoder().encode([
				u.protocol.slice(0, -1),
				u.hostname.toLowerCase(),
				port
			].join("\0"));
			if (capacity) {
				if (capacity < bytes.length) return -1;
				new Uint8Array(memory().buffer, out >>> 0, bytes.length).set(bytes);
			}
			return bytes.length;
		} catch {
			return -1;
		}
	} };
}
//#endregion
export { UPDATES, admitsNetwork, admitsSecret, admittingGrant, afterPaint, afterPaintPieces, animationClock, animationClocks, appRootFontSize, commitGuestOrigin, contextAt, controlEvent, coversPath, createGrantSet, dataURL, declaredScheme, deferredFulfill, devFirst, displayMode, editMenu, environment, evenSegments, fieldSelection, fitText, focusController, fold, foldBits, foldEnv, frameURL, grantError, grantOrigins, grantWords, guestMessageAuthorized, handheld, hasGrant, historyURL, inertAncestor, installFits, isCloudMetadata, isLocalNetwork, keyboardInset, launchLocation, launchVisits, listItem, listOwner, listRow, liveById, markBars, modalLayers, navigableURL, navigates, navigation, noteFit, onFold, onKeyboard, onPreferences, onSelection, opaqueSandbox, overPage, pageGivenFiles, pageReporter, pageStore, pageTitle, panelsOf, placePopovers, placeReporter, popoverCommand, popoverSource, preferFold, preferences, presenceLoader, pushingList, rawGrantText, refitTexts, refusal, refuseURL, releaseAssets, renderMarkup, reportPlace, reportTime, routeFlags, routeTitle, runFocusCommands, sameGrantDeclaration, scopedGrantSet, scrollDrag, scrollFollowers, setFieldRangeText, setFieldSelection, settleRadios, settleValue, sheetFrame, sheetLeaves, socketProtocols, sourceField, splitOf, storeInPage, syncListItemRoles, textField, textPosition, textSource, timeReporter, trimGrant, typedControl, unionGrantSets, unselected, unselectedForHead, unwrapListItem, updateCode, useSheets, valuedControl, viewChildren, viewParent };
