(function() {
	//#region \0rolldown/runtime.js
	var __defProp = Object.defineProperty;
	var __esmMin = (fn, res, err) => () => {
		if (err) throw err[0];
		try {
			return fn && (res = fn(fn = 0)), res;
		} catch (e) {
			throw err = [e], e;
		}
	};
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/rt-link.js
	var rt;
	var init_rt_link = __esmMin((() => {
		rt = {};
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/grant-admission.js
	function validateGrantSet(set) {
		if (!set || set.version !== 1 || !Array.isArray(set.entries) || set.error !== null && typeof set.error !== "string" || !/^[0-9a-f]{16}$/.test(set.seal ?? "")) return false;
		let last = 0, hasError = false;
		for (const entry of set.entries) {
			if (!Array.isArray(entry) || entry.length !== 4 || !Number.isInteger(entry[0]) || entry[0] <= last || typeof entry[1] !== "string" || !entry[1] || trimGrant(entry[1]) !== entry[1] || entry[2] !== null && !grantTupleValid(entry[2]) || entry[3] !== null && typeof entry[3] !== "string" || !entryMatchesSource(entry)) return false;
			last = entry[0];
			hasError ||= entry[3] !== null;
		}
		return (!hasError || set.error !== null) && grantFNV(grantBody(set)) === set.seal;
	}
	function createGrantSet(value) {
		if (!validateGrantSet(value)) return freezeGrantSet(makeGrantSet([], INVALID_GRANTS));
		return freezeGrantSet(value);
	}
	function makeGrantSet(entries, error) {
		const set = {
			version: 1,
			entries,
			error,
			seal: ""
		};
		set.seal = grantFNV(grantBody(set));
		return freezeGrantSet(set);
	}
	function grantError(set) {
		return validateGrantSet(set) ? set.error : INVALID_GRANTS;
	}
	function scopedGrantSet(parent, source) {
		if (source == null) return parent;
		if (!validateGrantSet(parent) || typeof source !== "string") return makeGrantSet([], "source scope exceeds the app's admitted grants");
		const available = new Map(parent.entries.map((entry) => [entry[1], entry]));
		const entries = [], errors = [];
		for (const [index, raw] of source.split("\n").entries()) {
			const line = trimGrant(raw);
			if (!line) continue;
			const found = available.get(line);
			if (!found) return makeGrantSet([], "source scope exceeds the app's admitted grants");
			entries.push([
				index + 1,
				line,
				found[2],
				found[3]
			]);
			if (found[3]) errors.push(`line ${index + 1}: ${found[3]}`);
		}
		return makeGrantSet(entries, errors.length ? `the app's grants did not parse: ${errors.join("; ")}` : null);
	}
	function unionGrantSets(...sets) {
		if (sets.some((set) => !validateGrantSet(set))) return makeGrantSet([], INVALID_GRANTS);
		const entries = [], seen = /* @__PURE__ */ new Set();
		for (const set of sets) for (const entry of set.entries) if (!seen.has(entry[1])) {
			seen.add(entry[1]);
			entries.push([
				entries.length + 1,
				entry[1],
				entry[2],
				entry[3]
			]);
		}
		return makeGrantSet(entries, sets.map((set) => set.error).find(Boolean) ?? null);
	}
	function admittingGrant(set, value, operation = "fetch") {
		if (grantError(set)) return null;
		let target;
		try {
			target = new URL(value);
		} catch {
			return null;
		}
		const kind = operation === "websocket" ? "websocket" : "fetch";
		const scheme = target.protocol.slice(0, -1).toLowerCase(), host = target.hostname.toLowerCase(), port = grantPort(target);
		return set.entries.find(([, , grant]) => grant?.[0] === kind + "-local-network" && schemeGrants[kind + "-scheme"].includes(scheme) && isLocalNetwork(host, grant[1] === "development") || grant && grant[1] === scheme && (grant[0] === kind + "-scheme" || grant[3] === port && (grant[0] === kind && grant[2] === host || grant[0] === kind + "-subdomains" && host.length > grant[2].length + 1 && host.endsWith("." + grant[2]))))?.[1] ?? null;
	}
	function grantPathParts(path) {
		if (typeof path !== "string") return null;
		const at = path.indexOf(":/");
		const namespace = at < 0 ? path.startsWith("/") ? "" : null : path.slice(0, at) + ":";
		if (namespace == null || ![
			"",
			"app:",
			"doc:",
			"home:",
			"bundle:"
		].includes(namespace)) return null;
		const parts = (at < 0 ? path.slice(1) : path.slice(at + 2)).split("/").filter(Boolean);
		return parts.some((part) => part === "." || part === ".." || part.includes("\0")) ? null : [namespace, ...parts];
	}
	function coversPath(set, capability, path) {
		if (grantError(set)) return false;
		const target = grantPathParts(path), kind = {
			"fs.read": "fs-read",
			"fs.write": "fs-write",
			"sqlite.open": "sqlite-open"
		}[capability];
		return !!target && set.entries.some(([, , grant]) => grant?.[0] === kind && grant.slice(1).every((part, index) => target[index] === part));
	}
	function socketProtocols(value, socket = true) {
		if (value === void 0) return [];
		if (!socket) throw new TypeError("exactProtocols: only a WebSocket stream takes protocols");
		if (!Array.isArray(value)) throw new TypeError("exactProtocols must be an array of protocol names");
		const names = [];
		for (const name of value) {
			if (typeof name !== "string" || !/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) throw new TypeError(`invalid WebSocket protocol ${JSON.stringify(name)}: expected a non-empty RFC 7230 token`);
			if (names.includes(name)) throw new TypeError(`duplicate WebSocket protocol ${JSON.stringify(name)}`);
			names.push(name);
		}
		return names;
	}
	var hextets, address, isCloudMetadata, isLocalNetwork, INVALID_GRANTS, grantFNV, grantBody, networkGrants, schemeGrants, localGrants, pathGrants, nameGrants, validGrantName, trimGrant, grantWords, nativeNamespace, nativeLeaf, grantTupleValid, pathTuple, networkTuple, sourceTuple, exactOnly, entryMatchesSource, freezeGrantSet, rawGrantText, grantPort, admitsNetwork;
	var init_grant_admission = __esmMin((() => {
		hextets = (text) => {
			const [head, tail] = text.split("::"), h = head?.match(/[^:]+/g) ?? [], t = tail?.match(/[^:]+/g) ?? [];
			return [
				...h,
				...Array(tail === void 0 ? 0 : 8 - h.length - t.length).fill("0"),
				...t
			].map((x) => parseInt(x, 16));
		};
		address = (host) => {
			if (!host.startsWith("[")) return host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)?.slice(1).map(Number) ?? null;
			const s = hextets(host.slice(1, -1));
			return s.slice(0, 5).every((x) => x === 0) && s[5] === 65535 ? [
				s[6] >> 8,
				s[6] & 255,
				s[7] >> 8,
				s[7] & 255
			] : s;
		};
		isCloudMetadata = (host) => {
			const a = address(String(host).toLowerCase());
			return a?.length === 4 ? a.join(".") === "169.254.169.254" : a?.map((x) => x.toString(16)).join(":") === "fd00:ec2:0:0:0:0:0:254";
		};
		isLocalNetwork = (host, loopback) => {
			host = String(host).toLowerCase();
			if (isCloudMetadata(host)) return false;
			const a = address(host), name = host.replace(/\.$/, "");
			if (a?.length === 4) return a[0] === 10 || a[0] === 172 && a[1] >= 16 && a[1] <= 31 || a[0] === 192 && a[1] === 168 || a[0] === 169 && a[1] === 254 || loopback && a[0] === 127;
			if (a) return (a[0] & 65024) === 64512 || (a[0] & 65472) === 65152 || loopback && a.slice(0, 7).every((x) => x === 0) && a[7] === 1;
			return /.\.local$/.test(name) || loopback && name === "localhost";
		};
		INVALID_GRANTS = "the grant set was not validated";
		grantFNV = (text) => new TextEncoder().encode(text).reduce((hash, byte) => BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1099511628211n), 14695981039346656037n).toString(16).padStart(16, "0");
		grantBody = (set) => JSON.stringify({
			version: 1,
			entries: set.entries,
			error: set.error
		}).replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
		networkGrants = /* @__PURE__ */ new Set([
			"fetch",
			"fetch-subdomains",
			"websocket",
			"websocket-subdomains"
		]);
		schemeGrants = {
			"fetch-scheme": ["http", "https"],
			"websocket-scheme": ["ws", "wss"]
		};
		localGrants = /* @__PURE__ */ new Set(["fetch-local-network", "websocket-local-network"]);
		pathGrants = /* @__PURE__ */ new Set([
			"fs-read",
			"fs-write",
			"sqlite-open"
		]);
		nameGrants = /* @__PURE__ */ new Set([
			"env-read",
			"secret-keep",
			"storage-kv"
		]);
		validGrantName = (name) => typeof name === "string" && name.length >= 1 && name.length <= 64 && /^[a-z0-9._-]+$/.test(name) && !/^\.+$/.test(name);
		trimGrant = (value) => String(value).replace(/^\p{White_Space}+|\p{White_Space}+$/gu, "");
		grantWords = (value) => String(value).split(/\p{White_Space}+/u).filter(Boolean);
		nativeNamespace = (value) => typeof value === "string" && /^win:[A-Z]$/.test(value);
		nativeLeaf = (value) => {
			if (typeof value !== "string" || !value || value.length > 255 || value === "." || value === ".." || /[\\/:*?"<>|\u0000-\u001f\u007f-\u009f]/.test(value) || /[. ]$/.test(value) || /[\ud800-\udfff]/u.test(value)) return false;
			const base = value.split(".")[0].replace(/[a-z]/g, (char) => char.toUpperCase());
			return !/^(?:CON|PRN|AUX|NUL|CLOCK\$|(?:COM|LPT)[1-9¹²³])$/.test(base);
		};
		grantTupleValid = (grant) => {
			if (!Array.isArray(grant) || typeof grant[0] !== "string") return false;
			if (networkGrants.has(grant[0])) {
				const address = grant[2]?.startsWith("[") || /^(?:https?|wss?|ftp)$/.test(grant[1]) && /^[\d.]+$/.test(grant[2]);
				return grant.length === 4 && /^[a-z][a-z0-9+.-]*$/.test(grant[1]) && (grant[0] !== "websocket-subdomains" || /^(ws|wss)$/.test(grant[1])) && typeof grant[2] === "string" && grant[2] === grant[2].toLowerCase() && grant[2].length > 0 && Number.isInteger(grant[3]) && grant[3] >= 0 && grant[3] <= 65535 && (!grant[0].endsWith("-subdomains") || !address && !grant[2].endsWith(".") && grant[2].split(".").filter(Boolean).length >= 2);
			}
			if (Object.hasOwn(schemeGrants, grant[0])) return grant.length === 2 && schemeGrants[grant[0]].includes(grant[1]);
			if (localGrants.has(grant[0])) return grant.length === 1 || grant.length === 2 && grant[1] === "development";
			if (pathGrants.has(grant[0])) return grant.length >= 2 && ([
				"",
				"app:",
				"doc:",
				"home:",
				"bundle:"
			].includes(grant[1]) || nativeNamespace(grant[1])) && grant.slice(2).every((component) => nativeNamespace(grant[1]) ? nativeLeaf(component) : typeof component === "string" && component && component !== "." && component !== ".." && !component.includes("/"));
			if (!nameGrants.has(grant[0]) || grant.length !== 2 || typeof grant[1] !== "string") return false;
			return grant[0] === "env-read" || validGrantName(grant[1]);
		};
		pathTuple = (kind, target) => {
			const native = target.startsWith("\\\\?\\") ? target.slice(4) : target;
			if (/^[a-z]:[/\\]/i.test(native)) {
				const parts = native.slice(3).split(/[/\\]/).filter(Boolean);
				return parts.every(nativeLeaf) ? [
					kind,
					`win:${native[0].toUpperCase()}`,
					...parts
				] : null;
			}
			const at = target.indexOf(":/");
			const namespace = at < 0 ? target.startsWith("/") ? "" : null : target.slice(0, at) + ":";
			if (namespace == null || ![
				"",
				"app:",
				"doc:",
				"home:",
				"bundle:"
			].includes(namespace)) return null;
			const parts = (at < 0 ? target.slice(1) : target.slice(at + 2)).split("/").filter(Boolean);
			return parts.some((part) => part === "." || part === "..") ? null : [
				kind,
				namespace,
				...parts
			];
		};
		networkTuple = (kind, target) => {
			const wildcard = kind.endsWith("-subdomains");
			if (wildcard && !target.includes("://*.")) return null;
			if (target.includes("@") || (wildcard ? target.replace("://*.", "://") : target).includes("*")) return null;
			try {
				const url = new URL(wildcard ? target.replace("://*.", "://") : target);
				const port = Number(url.port || {
					"http:": 80,
					"https:": 443,
					"ws:": 80,
					"wss:": 443,
					"ftp:": 21
				}[url.protocol]);
				if (!url.hostname || !Number.isInteger(port)) return null;
				if (wildcard && (!["", "/"].includes(url.pathname) || url.search || url.hash)) return null;
				return [
					kind,
					url.protocol.slice(0, -1).toLowerCase(),
					url.hostname.toLowerCase(),
					port
				];
			} catch {
				return null;
			}
		};
		sourceTuple = (source) => {
			const words = grantWords(source);
			const capability = words[0];
			if (capability === "fs.read" || capability === "fs.write") {
				const rest = trimGrant(source.slice(capability.length));
				if (rest.startsWith("\"")) try {
					const target = JSON.parse(rest);
					if (typeof target !== "string" || /[\u0000-\u001f\u007f-\u009f]/.test(target) || /[\ud800-\udfff]/u.test(target)) return null;
					return pathTuple(capability === "fs.read" ? "fs-read" : "fs-write", target);
				} catch {
					return null;
				}
			}
			if ((capability === "net.fetch" || capability === "net.websocket") && words[1] === "local-network") return words.length === 2 || words.length === 3 && words[2] === "development" ? [capability === "net.fetch" ? "fetch-local-network" : "websocket-local-network", ...words.slice(2)] : null;
			if (words.length !== 2 && !(capability === "secret.keep" && /^(user-presence|biometry-any|biometry-current-set|device-credential)( optional)?( (apple\.accessible=when(PasscodeSet|Unlocked)ThisDeviceOnly|apple\.or(Watch|Companion)|android\.strongBox))*$/.test(words.slice(2).join(" ")))) return null;
			const target = words[1];
			const scheme = (capability === "net.fetch" || capability === "net.websocket") && /^[a-z][a-z0-9+.-]*:$/i.test(target) ? target.slice(0, -1).toLowerCase() : null;
			if (scheme != null) {
				const kind = capability === "net.fetch" ? "fetch-scheme" : "websocket-scheme";
				return schemeGrants[kind].includes(scheme) ? [kind, scheme] : null;
			}
			if (capability === "net.fetch") return networkTuple(target.includes("://*.") ? "fetch-subdomains" : "fetch", target);
			if (capability === "net.websocket") return networkTuple(target.includes("://*.") ? "websocket-subdomains" : "websocket", target);
			if (capability === "fs.read") return pathTuple("fs-read", target);
			if (capability === "fs.write") return pathTuple("fs-write", target);
			if (capability === "sqlite.open") return pathTuple("sqlite-open", target);
			if (capability === "env.read") return ["env-read", target];
			if (capability === "secret.keep") return ["secret-keep", target];
			if (capability === "storage.kv") return ["storage-kv", target];
			return null;
		};
		exactOnly = (source) => /^(#|surface\.read |surface\.write |device\.|runtime\.|auth\.|net\.dns-sd |process\.spawn |secret\.hold |env\.read login:|env\.launch |doc\.keep$|browser\.automation$|payment\.google-pay$|payment\.apple-pay )/.test(source);
		entryMatchesSource = ([, source, grant, error]) => {
			if (grant === null) return error !== null || exactOnly(source);
			return error === null && JSON.stringify(sourceTuple(source)) === JSON.stringify(grant);
		};
		freezeGrantSet = (set) => {
			for (const entry of set.entries) {
				if (entry[2]) Object.freeze(entry[2]);
				Object.freeze(entry);
			}
			Object.freeze(set.entries);
			return Object.freeze(set);
		};
		rawGrantText = (set) => validateGrantSet(set) ? set.entries.map((entry) => entry[1]).join("\n") : "";
		grantPort = (url) => Number(url.port || {
			"http:": 80,
			"https:": 443,
			"ws:": 80,
			"wss:": 443,
			"ftp:": 21
		}[url.protocol]);
		admitsNetwork = (set, value, operation) => admittingGrant(set, value, operation) !== null;
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/faults.js
	/** A table from its launch lines (the runner's `Faults::parse`): `<prefix>`, `<prefix>\t<times>`, or a reload's `<prefix>\t<times>\t<left>\t<hits>\t<armed>`. */
	function parseFaults(spec) {
		const count = (field) => {
			if (field === void 0 || field === "-") return null;
			if (!/^\d+$/.test(field)) throw new Error(`fail fetch: \`${field}\` is not a count`);
			return Number(field);
		};
		const entries = [];
		for (const line of String(spec).split("\n")) {
			if (!line.trim()) continue;
			const [prefix, times, left, hits, armed] = line.split("	");
			if (!prefix) throw new Error("fail fetch: each line names a non-empty prefix");
			const n = count(times);
			if (n === 0) throw new Error("fail fetch: `times` is a positive integer");
			const at = entries.findIndex((f) => f.prefix === prefix);
			if (at >= 0) entries.splice(at, 1);
			entries.push({
				prefix,
				times: n,
				left: left === void 0 ? n : count(left),
				hits: count(hits) ?? 0,
				armed: armed !== "0"
			});
		}
		return entries;
	}
	function launchTable() {
		const params = new URL(globalThis.performance?.getEntriesByType?.("navigation")[0]?.name ?? globalThis.location?.href ?? "http://x/").searchParams;
		if (!params.has("agent")) return [];
		try {
			return parseFaults(params.get("failFetch") ?? "");
		} catch {
			return [];
		}
	}
	/** Whether a fetch of `url` fails, counting it (the longest live prefix decides); the journal says so. */
	function takeFault(url) {
		if (!state().entries.length) return false;
		const f = longest(url);
		if (!f) return false;
		f.hits += 1;
		if (f.left !== null) f.left -= 1;
		say$2(faultMessage(url));
		return true;
	}
	/** The agent's `faults` operation: `{fail, times?}` arms, `{pass}` stops failing; the reply is the table. */
	function faultOp(req) {
		const { entries } = state();
		if (req.fail !== void 0) {
			if (typeof req.fail !== "string" || !req.fail) return {
				malformed: true,
				error: "fail fetch needs a URL prefix"
			};
			if (req.times !== void 0 && !(Number.isInteger(req.times) && req.times >= 1 && req.times <= 4294967295)) return {
				malformed: true,
				error: "fail fetch: `times` is a positive integer"
			};
			const at = entries.findIndex((f) => f.prefix === req.fail);
			if (at >= 0) entries.splice(at, 1);
			const times = req.times ?? null;
			entries.push({
				prefix: req.fail,
				times,
				left: times,
				hits: 0,
				armed: true
			});
		} else if (req.pass !== void 0) {
			const f = entries.find((f) => f.prefix === req.pass);
			if (!f) return { error: `pass fetch "${req.pass}": no fault was armed for it` };
			f.armed = false;
		}
		return { faults: faultsJson() };
	}
	var state, live$1, longest, say$2, faultMessage, faultsJson;
	var init_faults = __esmMin((() => {
		state = () => globalThis.__exactFaults ??= {
			entries: launchTable(),
			log: null,
			pending: []
		};
		live$1 = (f) => f.armed && f.left !== 0;
		longest = (url) => state().entries.filter((f) => live$1(f) && String(url).startsWith(f.prefix)).sort((a, b) => b.prefix.length - a.prefix.length)[0];
		say$2 = (line) => {
			const s = state(), log = s.log ?? globalThis.__exactFaultLog;
			if (log) log(line);
			else s.pending.push(line);
		};
		faultMessage = (url) => `fetch failed (driver fault): ${url}`;
		faultsJson = () => state().entries.map(({ prefix, times, left, hits, armed }) => ({
			prefix,
			times,
			left,
			hits,
			armed
		}));
		if (globalThis.exact) globalThis.exact.faults = { faultOp };
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/address-space.js
	async function watch$1(space) {
		for (const name of NAMES[space]) try {
			const status = await navigator.permissions.query({ name });
			states[space] = status.state;
			status.onchange = () => {
				states[space] = status.state;
			};
			return;
		} catch {}
	}
	/**
	* D6: why a fetch of `url` or a WebSocket open asked by `origin` is refused
	* before it is sent, or null. Only a tool's, a wake's or the device's reach
	* to a space less public than the page's is checked, against that space's
	* permission, or `state` where the runner's substitute answers it.
	*/
	function reachRefusal(url, origin, state = null) {
		if (!origin || origin === "app") return null;
		let host;
		try {
			host = new URL(url).hostname;
		} catch {
			return null;
		}
		const space = spaceOf(host.includes(":") && !host.startsWith("[") ? `[${host}]` : host);
		if (RANK[space] <= RANK[pageSpace()]) return null;
		state ??= states[space];
		return state === "granted" ? null : state === "denied" ? "local network access is denied" : "person-required";
	}
	/**
	* D6's redirect gate: a tool's, a wake's or the device's fetch that would
	* follow redirects goes out with `redirect: "error"` while the browser
	* has not granted every less public space's permission, so
	* the browser never requests a hop that could prompt.
	*/
	function redirectFor(origin, redirect, state = null) {
		if (!origin || origin === "app" || redirect !== "follow") return redirect;
		const page = RANK[pageSpace()];
		return Object.entries(states).some(([space, answered]) => RANK[space] > page && (state ?? answered) !== "granted") ? "error" : redirect;
	}
	var RANK, spaceOf, states, NAMES, pageSpace;
	var init_address_space = __esmMin((() => {
		init_grant_admission();
		RANK = {
			public: 0,
			local: 1,
			loopback: 2
		};
		spaceOf = (host) => isLocalNetwork(host, true) ? isLocalNetwork(host, false) ? "local" : "loopback" : isCloudMetadata(host) ? "local" : "public";
		states = {
			local: "unknown",
			loopback: "unknown"
		};
		NAMES = {
			local: ["local-network", "local-network-access"],
			loopback: ["loopback-network", "local-network-access"]
		};
		if (typeof navigator !== "undefined" && navigator.permissions?.query) {
			watch$1("local");
			watch$1("loopback");
		}
		pageSpace = () => spaceOf(globalThis.location?.hostname ?? "");
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/admission.js
	function deadlineOf(init) {
		const ms = init.exactTimeout;
		if (ms === void 0) return null;
		if (!Number.isInteger(ms) || ms < 1 || ms > 36e5) throw new TypeError("exactTimeout must be an integer number of milliseconds from 1 to 3600000");
		return {
			ms,
			signal: AbortSignal.timeout(ms)
		};
	}
	function ceilingOf(init) {
		const independent = init.exactIndependentHttp;
		if (independent === void 0) return 67108864;
		const n = independent?.maxResponseBytes;
		if (!Number.isInteger(n) || n <= 0 || n > 67108864) throw new TypeError("exactIndependentHttp.maxResponseBytes must be an integer from 1 to 67108864");
		return n;
	}
	async function within(response, limit) {
		const reader = response.clone().body?.getReader();
		if (!reader) return;
		let size = 0;
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) return;
				if ((size += value.length) > limit) throw new FetchError("Refused", "HTTP response exceeds limit");
			}
		} catch (error) {
			reader.cancel().catch(() => {});
			response.body?.cancel().catch(() => {});
			throw error;
		}
	}
	/** `fetch`'s `redirect` as the native prelude checks it, read once: the
	* init's, else a `Request`'s, else `follow`; any other word is a `TypeError`. */
	function redirectOf(input, init) {
		const raw = init?.redirect;
		const mode = raw !== void 0 ? String(raw) : typeof Request === "function" && input instanceof Request ? input.redirect : "follow";
		if (mode !== "follow" && mode !== "manual" && mode !== "error") throw new TypeError("redirect must be follow, manual or error");
		return mode;
	}
	/** `{...init}` without `skip`, whose getters are not run again. */
	function ownWithout(init, skip) {
		const copy = {};
		for (const key of Object.keys(init)) if (!skip.includes(key)) copy[key] = init[key];
		return copy;
	}
	async function fetchWith(set, input, init = {}, expires = null, redirect = redirectOf(input, init), read = within, origin = "app", decided = false, forced) {
		let value, asset, deadline, signal, own, armed;
		init ??= {};
		deadline = deadlineOf(init);
		let until = expires ?? (deadline ? {
			at: performance.now() + deadline.ms,
			ms: deadline.ms
		} : null);
		const ceiling = ceilingOf(init);
		try {
			asset = hostAsset(input, init);
			value = typeof Request === "function" && input instanceof Request ? input.url : asset ? new URL(String(input), globalThis.location?.href).href : new URL(String(input)).href;
		} catch (error) {
			throw new FetchError("Network", error?.message ?? error);
		}
		const invalid = grantError(set);
		if (invalid) throw new FetchError("Refused", invalid);
		if (!asset && !admitsNetwork(set, value, "fetch")) throw new FetchError("Refused", refusal("net.fetch"));
		if (!asset && takeFault(value)) throw new FetchError("Network", faultMessage(value));
		const unreached = asset ? null : reachRefusal(value, origin);
		if (unreached) throw new FetchError("Refused", `NotAllowedError: ${unreached}`);
		redirect = redirectFor(origin, redirect);
		try {
			const rest = ownWithout(init, [
				"exactTimeout",
				"exactIndependentHttp",
				"exactPreload",
				"exactPrefetch",
				"redirect",
				"signal"
			]);
			const cache = init.cache ?? input?.cache, sent = forced && cache !== "no-store" ? "reload" : cache;
			const mode = init.mode ?? (sent === "only-if-cached" && "same-origin");
			if (sent) rest.cache = sent;
			if (mode) rest.mode = mode;
			const given = init.signal;
			if (given !== void 0) rest.signal = given;
			own = given !== void 0 ? given : typeof Request === "function" && input instanceof Request ? input.signal : void 0;
			if (!decided) armed = signalDeadline.arm?.(own, deadline?.ms);
			if (armed) deadline = until = null;
			let relay;
			if (deadline) {
				const ended = new AbortController();
				relay = () => ended.abort(deadline.signal.reason);
				deadline.signal.addEventListener("abort", relay, { once: true });
				signal = own ? AbortSignal.any([own, ended.signal]) : ended.signal;
			} else signal = rest.signal;
			if (until && performance.now() >= until.at) throw new FetchError("Timeout", `the request timed out after ${until.ms} ms`);
			const response = await browserFetch(typeof Request === "function" && input instanceof Request ? input : value, {
				...rest,
				...signal ? { signal } : {},
				redirect
			});
			if (!response.url && response.type !== "opaqueredirect") {
				response.body?.cancel().catch(() => {});
				throw new FetchError("Refused", "outside the app's grants (net.fetch): response URL is unavailable");
			}
			if (response.url && (asset ? new URL(response.url).origin !== globalThis.location?.origin : !admitsNetwork(set, response.url, "fetch"))) throw new FetchError("Refused", `${refusal("net.fetch")}: redirected to ${new URL(response.url).origin}`);
			const landingRefusal = !asset && response.url ? reachRefusal(response.url, origin) : null;
			if (landingRefusal) {
				response.body?.cancel().catch(() => {});
				throw new FetchError("Refused", `NotAllowedError: ${landingRefusal}`);
			}
			await read(response, ceiling);
			if (deadline) deadline.signal.removeEventListener("abort", relay);
			return response;
		} catch (error) {
			if (error instanceof FetchError) throw error;
			if (deadline && signal?.aborted && signal.reason === deadline.signal.reason) throw new FetchError("Timeout", `the request timed out after ${until.ms} ms`);
			if (own?.aborted) throw own.reason;
			if (error?.name === "AbortError") throw new FetchError("Aborted", error?.message ?? error);
			throw new FetchError("Network", error?.message ?? error);
		} finally {
			armed?.cancel();
		}
	}
	function setAppGrantSet(...sets) {
		appSet = sets.length === 1 ? createGrantSet(sets[0]) : unionGrantSets(...sets);
		return rawGrantText(appSet);
	}
	function createSecretFacade(store, admitted, keys) {
		const allowed = (name) => {
			throw new Error("a render's store is empty and refuses writes");
		};
		const seen = {
			read: false,
			get(name) {
				effect$1("store.get()");
				name = String(name);
				if (name.startsWith("exact.kept.")) return null;
				seen.read = true;
				return null;
			},
			async exclusive(name, work) {
				effect$1("store.exclusive()");
				name = String(name);
				allowed(name);
				if (mustLock(admitted, name)) return Promise.reject(unsupported(name));
				const context = globalThis.__exact_async_context, owner = context?.current();
				return store.exclusive(name, () => {
					const before = context?.swap(owner);
					try {
						return work();
					} finally {
						context?.swap(before);
					}
				});
			},
			has(name) {
				return seen.get(name) !== null;
			},
			locked(name) {
				effect$1("store.locked()");
				seen.read = true;
				return false;
			},
			unlock(name) {
				try {
					return Promise.resolve(seen.get(name));
				} catch (e) {
					return Promise.reject(e);
				}
			},
			protect(name) {
				return overlaying.on ? Promise.reject(inOverlay("store.protect()")) : Promise.reject(unsupported(name));
			},
			unprotect() {
				return overlaying.on ? Promise.reject(inOverlay("store.unprotect()")) : Promise.resolve();
			},
			set(name, value) {
				effect$1("store.set()");
				name = String(name);
				value = String(value);
				allowed(name);
				if (mustLock(admitted, name)) throw unsupported(name);
				store.set(name, value);
				keeping(store).delete(name);
			},
			forget(name) {
				effect$1("store.forget()");
				name = String(name);
				allowed(name);
				store.set(name, null);
				keeping(store).delete(name);
			},
			async keepKey(name, pair) {
				if (overlaying.on) throw inOverlay("store.keepKey()");
				name = String(name);
				allowed(name);
				if (mustLock(admitted, name)) throw unsupported(name);
				const handle = "exact.key:" + crypto.randomUUID(), latest = keeping(store), key = String(name);
				latest.set(key, handle);
				try {
					await keys().then((service) => service.put(handle, pair));
				} catch (e) {
					if (latest.get(key) === handle) latest.delete(key);
					throw e;
				}
				if (latest.get(key) !== handle) return;
				latest.delete(key);
				store.set(name, handle);
			},
			key(name) {
				if (overlaying.on) return Promise.reject(inOverlay("store.key()"));
				const handle = seen.get(name);
				return handle == null ? Promise.resolve(null) : keys().then((service) => service.get(handle) ?? null);
			}
		};
		return seen;
	}
	var browserFetch, FetchError, refusal, assetPath, noHeaders, hostAsset, signalDeadline, appSet, overlaying, inOverlay, effect$1, mustLock, keepingByStore, keeping, unsupported;
	var init_admission = __esmMin((() => {
		init_grant_admission();
		init_faults();
		init_address_space();
		browserFetch = globalThis.fetch?.bind(globalThis);
		FetchError = class extends Error {
			constructor(kind, message) {
				super(String(message));
				this.name = "FetchError";
				this.kind = String(kind);
			}
		};
		refusal = (capability) => `outside the app's grants (${capability})`;
		assetPath = (value) => typeof value === "string" && /^\/assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.[A-Za-z0-9]+$/.test(value);
		noHeaders = (headers) => headers == null || [...new Headers(headers)].length === 0;
		hostAsset = (input, init) => assetPath(input) && String(init.method ?? "GET").toUpperCase() === "GET" && init.body == null && noHeaders(init.headers);
		signalDeadline = { arm: null };
		appSet = null;
		overlaying = {
			on: false,
			say: null
		};
		inOverlay = (api) => {
			const e = Object.assign(/* @__PURE__ */ new Error(`${api} is unavailable in an overlay, which runs synchronously and has no effects; do the work in the source's answer or the mutation, and pass the overlay what it needs in the mutation's arguments`), { overlay: true });
			overlaying.say?.(`overlay refused: ${e.message}`);
			return e;
		};
		effect$1 = (api) => {
			if (overlaying.on) throw inOverlay(api);
		};
		mustLock = (set, name) => (set?.entries ?? []).some(([, source, grant]) => {
			const words = grantWords(source);
			return grant?.[0] === "secret-keep" && words[1] === String(name) && words.length > 2 && words[3] !== "optional";
		});
		keepingByStore = /* @__PURE__ */ new WeakMap();
		keeping = (store) => {
			let names = keepingByStore.get(store);
			if (!names) keepingByStore.set(store, names = /* @__PURE__ */ new Map());
			return names;
		};
		unsupported = (name) => Object.assign(/* @__PURE__ */ new Error(`NotSupportedError: ${name} is kept locked, and the web keeps no locked secret`), {
			name: "NotSupportedError",
			code: "NotSupportedError"
		});
	})), tsGrantSet;
	var init_admission_data = __esmMin((() => {
		init_admission();
		tsGrantSet = createGrantSet({
			"entries": [],
			"error": null,
			"keepsNoAnswers": false,
			"seal": "74683c7cc22e0beb",
			"version": 1
		});
		createGrantSet({
			"entries": [],
			"error": null,
			"keepsNoAnswers": false,
			"seal": "74683c7cc22e0beb",
			"version": 1
		});
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/ts-body-from.js
	var ts_body_from_exports = /* @__PURE__ */ __exportAll({
		bodyFromRefusal: () => bodyFromRefusal,
		fromFile: () => fromFile,
		methodOf: () => methodOf,
		readBodyFile: () => readBodyFile,
		refusedFile: () => refusedFile
	});
	function bodyFromRefusal(input, init) {
		const path = init.exactBodyFrom, method = methodOf(input, init), refused = pathRefusal("exactBodyFrom", path);
		if (refused) return refused;
		if (method === "GET" || method === "HEAD") return `fetch: a ${method} request cannot have a body`;
		if (init.exactStream !== void 0 && /^wss?:/i.test(typeof Request === "function" && input instanceof Request ? input.url : String(input))) return "exactBodyFrom: a WebSocket sends no body";
		if (init.body != null || typeof Request === "function" && input instanceof Request && input.body != null) return "fetch: a request has one body: body or exactBodyFrom";
		return null;
	}
	function bodyToRefusal(input, init) {
		const refused = pathRefusal("exactBodyTo", init.exactBodyTo);
		if (refused) return refused;
		if (methodOf(input, init) === "HEAD") return "exactBodyTo: a HEAD reply has no body to write";
		const independent = init.exactIndependentHttp, n = independent?.maxResponseBytes;
		if (independent !== void 0 && (!Number.isInteger(n) || n < 1 || n > 1073741824)) return "exactIndependentHttp.maxResponseBytes must be an integer from 1 to 1073741824";
		return null;
	}
	function readBodyFile(path, grantSet, owner) {
		if (!coversPath(grantSet, "fs.read", path)) return Promise.reject(Object.assign(new FetchError("Refused", `exactBodyFrom ${path}: denied: fs.read ${path}: no grant covers it; grant \`fs.read ${path}\``), { code: "denied" }));
		return storageFs(`exactBodyFrom ${path}`, owner).then((m) => m.requestBody(files.appId, grantSet, path)).catch((error) => {
			throw storageFailure(error);
		});
	}
	function openBodyTarget(path, grantSet, owner) {
		if (!coversPath(grantSet, "fs.write", path)) return Promise.reject(Object.assign(new FetchError("Refused", `exactBodyTo ${path}: denied: fs.write ${path}: no grant covers it; grant \`fs.write ${path}\``), { code: "denied" }));
		return storageFs(`exactBodyTo ${path}`, owner).then((m) => m.bodyTarget(files.appId, grantSet, path)).catch((error) => {
			throw storageFailure(error);
		});
	}
	/** In a render: the device's checks of a file body, then the refusal, which never answers (ts-data.js `refuseInRender`). */
	function refusedFile(input, init, owner) {
		const from = init.exactBodyFrom !== void 0;
		const refusal = (from ? bodyFromRefusal(input, init) : null) ?? (init.exactBodyTo !== void 0 ? bodyToRefusal(input, init) : null);
		if (refusal) return Promise.reject(new TypeError(refusal));
		return from ? readBodyFile(init.exactBodyFrom, tsGrantSet, owner) : openBodyTarget(init.exactBodyTo, tsGrantSet, owner);
	}
	async function fromFile(input, init, redirect, started, origin = "app", armed, forced) {
		const from = init.exactBodyFrom !== void 0, to = init.exactBodyTo !== void 0;
		const refusal = (from ? bodyFromRefusal(input, init) : null) ?? (to ? bodyToRefusal(input, init) : null);
		if (refusal) throw new TypeError(refusal);
		const ms = init.exactTimeout, rest = ownWithout(init, [
			"exactBodyFrom",
			"exactBodyTo",
			"redirect",
			...to ? ["exactIndependentHttp"] : []
		]);
		if (ms !== void 0 && (!Number.isInteger(ms) || ms < 1 || ms > 36e5)) throw new TypeError("exactTimeout must be an integer number of milliseconds from 1 to 3600000");
		const signal = init.signal !== void 0 ? init.signal : typeof Request === "function" && input instanceof Request ? input.signal : null;
		const clock = globalThis.performance, remaining = ms === void 0 ? null : ms - (clock.now() - started);
		if (remaining !== null && remaining <= 0) throw new FetchError("Timeout", `the request timed out after ${ms} ms`);
		const deadline = remaining === null ? null : AbortSignal.timeout(Math.max(1, Math.ceil(remaining)));
		if (signal?.aborted) throw signal.reason ?? new FetchError("Aborted", "the fetch was aborted");
		let stop = () => {};
		const timedOut = () => new FetchError("Timeout", `the request timed out after ${ms} ms`);
		const heard = ownSignal(signal);
		const ended = new Promise((_, reject) => {
			const aborted = () => reject(signal.reason ?? new FetchError("Aborted", "the fetch was aborted"));
			if (signal?.aborted) aborted();
			else heard?.addEventListener?.("abort", aborted, { once: true });
			const expired = () => reject(timedOut());
			deadline?.addEventListener("abort", expired, { once: true });
			stop = () => {
				heard?.removeEventListener?.("abort", aborted);
				deadline?.removeEventListener("abort", expired);
			};
		});
		const raced = (work) => {
			work.catch(() => {});
			return Promise.race([work, ended]);
		};
		let body, target, opening;
		try {
			if (from) body = await raced(readBodyFile(init.exactBodyFrom, tsGrantSet));
			if (to) target = await raced(opening = openBodyTarget(init.exactBodyTo, tsGrantSet));
		} catch (error) {
			opening?.then((t) => t.close(), () => {});
			throw error;
		} finally {
			stop();
		}
		try {
			const spent = clock.now() - started;
			if (ms !== void 0 && spent >= ms) throw new FetchError("Timeout", `the request timed out after ${ms} ms`);
			const left = ms === void 0 ? void 0 : Math.max(1, Math.ceil(ms - spent));
			const sent = {
				...rest,
				signal,
				...from ? { body } : {},
				...left === void 0 ? {} : { exactTimeout: left }
			}, expires = ms === void 0 ? null : {
				at: started + ms,
				ms
			};
			if (!to) return await fetchWith(tsGrantSet, input, sent, expires, redirect, void 0, origin, true, forced);
			const ceiling = init.exactIndependentHttp?.maxResponseBytes ?? 1073741824;
			let written;
			const response = await fetchWith(tsGrantSet, input, sent, expires, redirect, async (reply) => {
				if (!reply.ok) return within(reply, Math.min(ceiling, 1048576));
				const ending = AbortSignal.any([heard, deadline].filter(Boolean));
				const refusal = () => {
					armed?.overdue();
					return heard?.aborted ? signal.reason ?? new FetchError("Aborted", "the fetch was aborted") : ms !== void 0 && clock.now() >= started + ms ? timedOut() : void 0;
				};
				try {
					written = await target.put(reply, ceiling, ending, refusal);
				} catch (error) {
					if (signal?.aborted && error === signal.reason) throw error;
					throw error?.kind === "Refused" || error?.kind === "Unavailable" ? new FetchError("Refused", error.message) : error;
				}
			}, origin, true, forced);
			if (written === void 0) return response;
			const done = new Response(null, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers
			});
			return Object.defineProperties(done, {
				url: { value: response.url },
				exactBodyTo: { value: {
					path: init.exactBodyTo,
					bytes: written
				} }
			});
		} finally {
			target?.close();
		}
	}
	var methodOf, pathRefusal, storageFs, storageFailure;
	var init_ts_body_from = __esmMin((() => {
		init_admission();
		init_admission_data();
		init_ts_fetch();
		methodOf = (input, init) => String(init.method ?? (typeof Request === "function" && input instanceof Request ? input.method : "GET")).toUpperCase();
		pathRefusal = (name, path) => {
			if (typeof path !== "string" || !path.startsWith("app:/")) return `${name} must be an app:/ path`;
			if (new TextEncoder().encode(path).length > 4096) return `${name}: a path is at most 4096 bytes`;
			if (/(^|\/)\.\.?(\/|$)|\0/.test(path.slice(5))) return `${name}: an app:/ path has no . or .. segment`;
			return null;
		};
		storageFs = (api, owner) => answering.refuseStorage(api, owner);
		storageFailure = (error) => Object.assign(new FetchError(error?.code === "agent" ? "Unsupported" : "Refused", error?.message ?? error), { code: error?.code });
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/ts-fetch.js
	function fetch$1(input, options) {
		return owned(fetchInCall(input, options)).then(responseFor);
	}
	function responseFor(response) {
		if (response instanceof Response) for (const name of [
			"arrayBuffer",
			"json",
			"text",
			"clone"
		]) {
			const read = response[name];
			response[name] = function(...args) {
				const value = read.apply(this, args);
				return name == "clone" ? responseFor(value) : AnswerPromise.resolve(value);
			};
		}
		return response;
	}
	function fetchInCall(input, options) {
		if (options?.exactLongPoll !== void 0 && options.exactStream === void 0) return Promise.reject(/* @__PURE__ */ new TypeError("exactLongPoll asks again for an answer that keeps coming: give exactStream too"));
		const upload = options?.exactUploadProgress;
		if (upload !== void 0 && upload !== false && options.exactStream === void 0) return Promise.reject(/* @__PURE__ */ new TypeError(upload === true ? "exactUploadProgress reports an upload's progress to its stream: give exactStream too" : "exactUploadProgress is true or false"));
		const held = options?.exactHeld;
		if (held !== void 0 && held !== true && held !== false) return Promise.reject(/* @__PURE__ */ new TypeError("exactHeld is true or false"));
		if (held && options.exactStream !== void 0) return Promise.reject(/* @__PURE__ */ new TypeError("exactHeld: a stream is never held; it stops counting at its first message"));
		const idle = options?.exactIdleTimeout;
		if (idle !== void 0) {
			if (!Number.isInteger(idle) || idle < 1 || idle > 36e5) return Promise.reject(/* @__PURE__ */ new TypeError("exactIdleTimeout must be an integer number of milliseconds from 1 to 3600000"));
			let url;
			try {
				url = input instanceof Request ? input.url : String(input);
			} catch (e) {
				return Promise.reject(e);
			}
			if (options.exactStream === void 0 || options.exactUploadProgress === true || options.exactLongPoll !== void 0 || !/^wss?:/i.test(url)) return Promise.reject(/* @__PURE__ */ new TypeError("exactIdleTimeout: only a WebSocket stream takes an idle timeout"));
		}
		let protocols;
		try {
			const prefetch = options?.exactPrefetch;
			if (prefetch !== void 0 && prefetch !== true && prefetch !== false) throw new TypeError("exactPrefetch is true or false");
			if (prefetch && (activeCall()?.mutation || options.exactStream !== void 0 || options.exactIndependentHttp !== void 0 || options.exactBodyFrom !== void 0 || options.exactBodyTo !== void 0 || !/^https?:/i.test(input instanceof Request ? input.url : String(input)))) throw new TypeError("exactPrefetch requires a plain HTTP read");
			const name = options?.exactPreload;
			if (name !== void 0 && (typeof name !== "string" || !/^[a-z][a-z0-9-]*$/.test(name))) throw new TypeError("exactPreload must match ^[a-z][a-z0-9-]*$");
			const offered = options?.exactProtocols;
			if (offered !== void 0) protocols = socketProtocols(offered, options.exactStream !== void 0 && /^wss?:/i.test(input instanceof Request ? input.url : String(input)));
		} catch (e) {
			return Promise.reject(e);
		}
		if (options?.exactStream !== void 0) return fetchNow(input, options, protocols);
		if (options?.exactBodyFrom !== void 0 || options?.exactBodyTo !== void 0) return fetchNow(input, options);
		return counting(held && options.exactBodyFrom === void 0 && options.exactBodyTo === void 0 ? "held" : "plain", () => fetchNow(input, options));
	}
	function counting(kind, start, background) {
		RenderIO++;
		const call = answering.call;
		const loose = answering.loose;
		const end = () => {
			RenderIO--;
			if (call) {
				call[kind]--;
				if (kind === "held") answering.heldReply(call);
				call.recount?.();
			} else loose(-1);
		};
		if (call) {
			call[kind] = (call[kind] ?? 0) + 1;
			call.recount?.();
		} else loose(1);
		let out;
		try {
			out = start();
		} catch (e) {
			end();
			throw e;
		}
		return owned(AnswerPromise.resolve(out).finally(end), background);
	}
	function fetchNow(input, options, protocols) {
		if (overlaying.on) return Promise.reject(inOverlay("fetch()"));
		if (answering.mapper || answering.mapperCall) return Promise.reject(/* @__PURE__ */ new Error(answering.mapper ? "fetch() is unavailable in a socket's mapper: it answers each frame now" : "fetch() is unavailable in a stream's mapper: fetch in the answer that opens the stream"));
		const call = answering.call;
		if (call?.mutation) {
			const later = !call.turn && call.flight && !call.socketConflict && call.socketOps?.length > 0;
			if (later && options?.exactStream !== void 0) return Promise.reject(/* @__PURE__ */ new Error(SOCKET_AND_FETCH));
			if (later && !answers$1(call)) return Promise.reject(new FetchError("Aborted", "the answer was let go before this fetch"));
			if (later && call.stood === false) return Promise.reject(/* @__PURE__ */ new Error("fetch(): the commit that asked this answer was refused"));
			if (later && !call.stood) {
				let target, init;
				try {
					init = options?.exactBodyFrom === void 0 && options?.exactBodyTo === void 0 ? captured(options) : held$1(options);
					if (input instanceof Request) {
						init = Object.assign(init ?? {}, init?.signal === void 0 ? { signal: input.signal } : null);
						if (!input.bodyUsed && !input.body?.locked) target = input.clone();
						else if (init.body == null) throw new FetchError("Network", "fetch(): the Request's body was read or is locked");
						else {
							target = input;
							if (init.headers === void 0) init.headers = new Headers(input.headers);
						}
					} else target = String(input);
				} catch (e) {
					return Promise.reject(e);
				}
				return new Promise((go, no) => (call.waiting ??= []).push(Object.assign(go, { refused: (why) => no(/* @__PURE__ */ new Error(`fetch(): the commit that asked this answer was refused: ${why}`)) }))).then(() => asCall(call, () => fetchNow(target, init, protocols)));
			}
			if (!later && (call.socketConflict || call.socketOps?.length)) {
				call.socketConflict = true;
				return Promise.reject(/* @__PURE__ */ new Error(SOCKET_AND_FETCH));
			}
			call.fetched = true;
			if (answering.sockets && options?.exactStream === void 0 && options?.exactBodyFrom === void 0 && options?.exactBodyTo === void 0) {
				let target, init;
				try {
					target = input instanceof Request ? input : String(input);
					init = captured(options);
				} catch (e) {
					return Promise.reject(e);
				}
				return Promise.resolve().then(() => {
					if (call.socketConflict) throw new Error(SOCKET_AND_FETCH);
					return asCall(call, () => fetchWith(tsGrantSet, target, init, null, void 0, void 0, call.origin));
				});
			}
			return fetchOf(input, options, call, protocols);
		}
		return fetchOf(input, options, call, protocols);
	}
	function captured(options) {
		if (options == null) return options;
		const init = {};
		for (const key of OPTIONS) {
			const value = options[key];
			if (value !== void 0) init[key] = value;
		}
		if (init.headers !== void 0) init.headers = new Headers(init.headers);
		const body = init.body;
		if (body instanceof ArrayBuffer) init.body = body.slice(0);
		else if (ArrayBuffer.isView(body)) init.body = new Uint8Array(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength));
		else if (body instanceof URLSearchParams) init.body = new URLSearchParams(body);
		else if (typeof FormData === "function" && body instanceof FormData) {
			init.body = new FormData();
			for (const [k, v] of body) init.body.append(k, v);
		}
		return init;
	}
	function held$1(options) {
		const own = ownWithout(options, []), inherited = {};
		for (const key of [...INHERITED, "redirect"]) if (!Object.hasOwn(own, key)) inherited[key] = options[key];
		return Object.assign(Object.create(inherited), own);
	}
	function fetchOf(input, options, call, protocols) {
		if (options?.exactStream === void 0 && options?.exactBodyFrom === void 0 && options?.exactBodyTo === void 0) return fetchWith(tsGrantSet, input, options, null, void 0, void 0, fetchOrigin(), false, !!activeCall()?.forced);
		if (options.exactStream !== void 0 && options.exactBodyTo !== void 0) return Promise.reject(/* @__PURE__ */ new TypeError("exactBodyTo: a stream's body is its messages, not a file"));
		let redirect;
		try {
			redirect = redirectOf(input, options);
		} catch (e) {
			return Promise.reject(e);
		}
		if (options.exactStream === void 0) {
			let init, ms, signal;
			try {
				const own = ownWithout(options, [
					"redirect",
					"exactPreload",
					"exactPrefetch"
				]);
				const inherited = {};
				for (const key of INHERITED) if (!Object.hasOwn(own, key)) inherited[key] = options[key];
				init = Object.assign(Object.create(inherited), own);
				ms = init.exactTimeout;
				if (ms !== void 0 && (!Number.isInteger(ms) || ms < 1 || ms > 36e5)) throw new TypeError("exactTimeout must be an integer number of milliseconds from 1 to 3600000");
				signal = init.signal !== void 0 ? init.signal : typeof Request === "function" && input instanceof Request ? input.signal : null;
			} catch (e) {
				return Promise.reject(e);
			}
			globalThis.performance.now();
			if (signal?.aborted) return Promise.reject(signal.reason ?? new FetchError("Aborted", "the fetch was aborted"));
			return Promise.resolve().then(() => (init_ts_body_from(), ts_body_from_exports)).then((m) => m.refusedFile(input, init, call));
		}
		return options.exactTimeout !== void 0 && options.exactUploadProgress !== true ? Promise.reject(/* @__PURE__ */ new TypeError("exactTimeout: a stream has no timeout")) : stream(input, options, redirect, protocols);
	}
	function stream(input, init, redirect, protocols) {
		const call = answering.call;
		const later = !!call?.ticket && !call.turn && !!call.flight && answers$1(call);
		if (!call?.turn && !later) return Promise.reject(/* @__PURE__ */ new Error("fetch() with exactStream outside an answer: a stream starts in its answer's own turns (its source, its code after an `await` in an async function, its timer), before the answer gives its value or is let go"));
		if (call.stream) return Promise.reject(/* @__PURE__ */ new Error("an answer streams one request"));
		call.stream = {
			input,
			init,
			redirect,
			protocols,
			origin: call.origin
		};
		if (later) try {
			call.late();
		} catch (e) {
			call.stream = null;
			return Promise.reject(e);
		}
		return new Promise(() => {});
	}
	function arm$1(api, run, ms, args) {
		if (overlaying.on) throw inOverlay(api);
		const call = answering.call;
		if (answering.mapper || answering.mapperCall || !call || !answers$1(call)) throw new Error(`${api} is unavailable here: a timer belongs to the answer that arms it, and none is running (module initialization, a stream's mapper, background work, or an answer that has given its value or was let go). A cache needs no timer to expire: fetch keeps each answer as long as its HTTP headers allow`);
		const { clock, drive, time } = answering.page, id = NextTimer++;
		time();
		const live = () => answers$1(call);
		const entry = {
			due: clock.now + ms,
			once: true,
			data: true,
			call,
			live,
			action() {
				disarm(id);
				if (!live()) {
					dropTimers(call, true);
					return true;
				}
				runAs(call, () => run(...args));
				return true;
			}
		};
		Armed.set(id, {
			call,
			entry
		});
		clock.timers.push(entry);
		call.timers = (call.timers ?? 0) + 1;
		call.recount?.();
		if (!clock.agent) drive();
		return id;
	}
	function runAs(call, run) {
		const { clock, journal } = answering.page;
		call.firing = (call.firing ?? 0) + 1;
		call.recount?.();
		globalThis.setTimeout(() => {
			call.firing--;
			call.recount?.();
		});
		let thrown = null;
		asCall(call, () => {
			try {
				run();
			} catch (e) {
				thrown = { e };
			}
		});
		if (thrown) {
			journal.push(`t=${clock.now} data: a timer's callback threw: ${thrown.e?.message ?? thrown.e}`);
			globalThis.reportError?.(thrown.e);
		}
		answering.later?.(call);
	}
	function asCall(call, run, field = "call") {
		const before = answering[field];
		answering[field] = call;
		try {
			return run();
		} finally {
			answering[field] = before;
		}
	}
	/** Whether `call`'s ticket was let go (new arguments, a refresh, a newer send, its view's end). rt.js ties the two as
	*  it makes the ticket; a `parallel` mutation holds one for each send in flight (rt.js `tickets`). */
	function letGo(call) {
		const t = call.ticket, o = t?.owner;
		return !!t && (!(o.parallel ? o.tickets.includes(t) : o.ticket === t) || o.gone);
	}
	/** Whether `call` still answers: it has not answered, and its ticket was not let go. */
	function answers$1(call) {
		return !call.settled && !letGo(call);
	}
	function disarm(id) {
		const armed = Armed.get(id);
		if (!armed) return;
		Armed.delete(id);
		const timers = answering.page.clock.timers, i = timers.indexOf(armed.entry);
		if (i >= 0) timers.splice(i, 1);
		armed.call.timers--;
		armed.call.recount?.();
	}
	/** Clear `call`'s timers, unrun: it has answered, or (`gone`) its ticket was let go, which ends its bookkeeping. */
	function dropTimers(call, gone) {
		for (const [id, armed] of Armed) if (armed.call === call) disarm(id);
		if (gone) call.abandon?.();
	}
	function ownSignal(signal) {
		return signal && composeSignals ? Reflect.apply(composeSignals, PageAbortSignal, [[signal]]) : signal;
	}
	function after(ms, run) {
		const due = globalThis.performance.now() + ms;
		let id, done = false;
		const fire = () => {
			done = true;
			run();
		};
		const step = () => {
			const left = due - globalThis.performance.now();
			if (left <= 0) fire();
			else id = globalThis.setTimeout(step, Math$1.min(left, 2147483647));
		};
		id = globalThis.setTimeout(step, Math$1.min(ms, 2147483647));
		return {
			cancel: () => {
				done = true;
				globalThis.clearTimeout(id);
			},
			overdue: () => {
				if (!done && globalThis.performance.now() >= due) {
					globalThis.clearTimeout(id);
					fire();
				}
			}
		};
	}
	function sequence(values) {
		const method = Object(values) === values ? values[Symbol.iterator] : void 0;
		if (typeof method !== "function") throw new TypeError("AbortSignal.any(): the signals are not iterable");
		const iterator = Reflect.apply(method, values, []), list = [];
		if (Object(iterator) !== iterator) throw new TypeError("AbortSignal.any(): the signals' iterator is not an object");
		const next = iterator.next;
		for (;;) {
			const step = Reflect.apply(next, iterator, []);
			if (Object(step) !== step) throw new TypeError("AbortSignal.any(): an iterator result is not an object");
			if (step.done) return list;
			const value = step.value;
			if (!isSignal(value)) throw new TypeError("AbortSignal.any(): a value is not an AbortSignal");
			list.push(value);
		}
	}
	function isSignal(value) {
		try {
			Reflect.apply(abortedOf, value, []);
			return true;
		} catch {
			return false;
		}
	}
	function GuardedDate(...args) {
		if (!new.target) return refuse$2("Date()");
		if (!args.length) return refuse$2("new Date()");
		return construct(NativeDate, args, new.target);
	}
	function DateTimeFormat(locales, options) {
		return construct(NativeFormat, [locales, options], new.target ?? DateTimeFormat);
	}
	function answerOnly(api) {
		if (overlaying.on) throw inOverlay(api);
		const call = currentContext();
		if (!call || call.settled) throw new Error(`${api} is unavailable ${answering.page ? "outside an answer" : "during module initialization"}; call it inside an answer`);
	}
	function seeded(n) {
		const stream = answering.entropy;
		if (!stream) return null;
		if (n > 0 && !stream.said) {
			stream.said = true;
			answering.page?.journal.push(`crypto: the driver seeds this launch's randomness (seed ${stream.seed}), so each launch at that seed draws the same bytes; --seed <n> draws others (LLP 1069.005 D2b)`);
		}
		return stream(n);
	}
	var SOCKET_AND_FETCH, ordinary$1, RenderIO, unfinishedIO, OPTIONS, INHERITED, activeCall, fetchOrigin, files, answering, backgroundCall, currentContext, AnswerPromise, owned, ModuleResponse, refuse$2, noTimers, Armed, NextTimer, Deadlines, PageAbortSignal, abortedOf, composeSignals, GuardedAbortSignal, NativeDate, NativeMath, NativeIntl, construct, GuardedMath, formatProto, NativeFormat, nativeFormat, nativeParts, formats, noIo, pageYield, codeFromString, NoFunction, noEval, guarded, Date$1, Math$1, Intl$1, setTimeout$1, setInterval, requestAnimationFrame$1, requestIdleCallback, clearTimeout$1, clearInterval, cancelAnimationFrame$1, cancelIdleCallback, performance$1, scheduler$1, queueMicrotask$1, XMLHttpRequest, WebSocket$1, EventSource, crypto$1, methods, ABSENT, page$1, Fetch, target, mine, original, useFetch, appGlobal;
	var init_ts_fetch = __esmMin((() => {
		init_admission();
		init_admission_data();
		SOCKET_AND_FETCH = "a mutation cannot both send on a socket and fetch";
		ordinary$1 = (start, background) => counting("plain", start, background);
		globalThis.__exact_ordinary = ordinary$1;
		RenderIO = 0;
		unfinishedIO = () => RenderIO > 0;
		OPTIONS = [
			"method",
			"headers",
			"body",
			"redirect",
			"signal",
			"mode",
			"credentials",
			"cache",
			"referrer",
			"referrerPolicy",
			"integrity",
			"keepalive",
			"priority",
			"exactTimeout",
			"exactIndependentHttp"
		];
		INHERITED = [
			"exactBodyFrom",
			"exactBodyTo",
			"exactIndependentHttp",
			"method",
			"body",
			"exactStream",
			"signal",
			"exactTimeout",
			"cache"
		];
		activeCall = () => answering.call ?? [...answering.untraced].find((c) => !c.settled);
		fetchOrigin = () => activeCall()?.origin ?? "app";
		files = { appId: null };
		answering = {
			call: null,
			untraced: /* @__PURE__ */ new Set(),
			sockets: false,
			mapper: null,
			mapperCall: null,
			loose: () => {},
			heldReply: () => {},
			ordinary: ordinary$1,
			page: null,
			entropy: null,
			later: null
		};
		backgroundCall = {};
		currentContext = () => answering.promiseCall ?? answering.mapperCall ?? answering.call;
		AnswerPromise = class extends Promise {
			constructor(run) {
				const own = {}, mark = (settle) => (value) => {
					own.bg ??= currentContext() === backgroundCall;
					settle(value);
				};
				super(typeof run == "function" ? (yes, no) => run(mark(yes), mark(no)) : run);
				this.own = own;
			}
			then(yes, no) {
				const at = currentContext();
				let out;
				const step = (run, pass) => (value) => asCall((out.own.bg ||= this.own.bg) && (!at || at.settled) ? backgroundCall : at && !letGo(at) ? at : null, () => typeof run == "function" ? run(value) : pass(value), "promiseCall");
				return out = super.then(step(yes, (value) => value), step(no, (error) => {
					throw error;
				}));
			}
		};
		owned = (promise, background) => {
			promise = AnswerPromise.resolve(promise);
			promise.own.bg ||= background;
			return promise;
		};
		ModuleResponse = new Proxy(Response, {
			construct: (T, args, to) => responseFor(Reflect.construct(T, args, to)),
			get: (T, name) => typeof T[name] == "function" ? (...args) => responseFor(T[name](...args)) : T[name]
		});
		refuse$2 = (api) => {
			throw new Error(`${api} is unavailable in data sources; pass time or a random seed as an argument`);
		};
		noTimers = (api) => () => {
			throw new Error(`${api} is unavailable in data sources: an answer waits with setTimeout; pass time as an argument`);
		};
		Armed = /* @__PURE__ */ new Map();
		NextTimer = 1;
		signalDeadline.arm = (signal, before) => {
			const t = signal && !signal.aborted ? Deadlines.get(signal) : void 0;
			if (t) answering.page.time();
			const left = t && Math$1.max(1, t.due - answering.page.clock.now);
			if (left === void 0 || before < left) return void 0;
			const call = answering.call;
			return after(left, () => {
				disarm(t.id);
				if (call && answers$1(call)) runAs(call, t.abort);
				else t.abort();
			});
		};
		Deadlines = /* @__PURE__ */ new WeakMap();
		PageAbortSignal = globalThis.AbortSignal;
		abortedOf = PageAbortSignal && Object.getOwnPropertyDescriptor(PageAbortSignal.prototype, "aborted").get;
		composeSignals = typeof PageAbortSignal?.any === "function" ? PageAbortSignal.any : null;
		GuardedAbortSignal = PageAbortSignal && new Proxy(PageAbortSignal, { get(target, name, receiver) {
			if (name === "any" && typeof target.any === "function") return function any(signals) {
				const list = sequence(signals), signal = target.any(list);
				let earliest;
				for (const source of list) {
					const t = Deadlines.get(source);
					if (t && !(earliest?.due <= t.due)) earliest = t;
				}
				if (earliest) Deadlines.set(signal, earliest);
				return signal;
			};
			if (name !== "timeout") return Reflect.get(target, name, receiver);
			return function timeout(ms) {
				const n = Number(ms);
				if (!(n >= 0 && n <= Number.MAX_SAFE_INTEGER)) throw new TypeError("AbortSignal.timeout(): the delay is a number of milliseconds from 0");
				const controller = new AbortController(), abort = () => controller.abort(new DOMException("signal timed out", "TimeoutError"));
				const id = arm$1("AbortSignal.timeout()", abort, Math$1.floor(n), []);
				Deadlines.set(controller.signal, {
					id,
					due: Armed.get(id).entry.due,
					abort
				});
				return controller.signal;
			};
		} });
		NativeDate = globalThis.Date.prototype.constructor;
		NativeMath = globalThis.Math;
		NativeIntl = globalThis.Intl;
		construct = Reflect.construct;
		GuardedDate.prototype = Object.create(NativeDate.prototype, { constructor: {
			value: GuardedDate,
			writable: true,
			configurable: true
		} });
		Object.defineProperties(GuardedDate, {
			now: { value: () => refuse$2("Date.now()") },
			UTC: { value: NativeDate.UTC },
			parse: { value: NativeDate.parse },
			name: { value: "Date" },
			[Symbol.hasInstance]: { value: (v) => v instanceof NativeDate }
		});
		GuardedMath = Object.freeze(Object.create(Object.getPrototypeOf(NativeMath), Object.fromEntries(Reflect.ownKeys(NativeMath).map((k) => [k, k === "random" ? { value: () => {
			throw new Error("Math.random() is unavailable in data sources; seed from crypto.getRandomValues in a source (docs/recipes/random-and-shuffle.md), or pass a seed as an argument; a roll in the view needs no source (docs/recipes/random-rolls.md)");
		} } : Object.getOwnPropertyDescriptor(NativeMath, k)]))));
		formatProto = NativeIntl.DateTimeFormat.prototype;
		while (!Object.getOwnPropertyDescriptor(formatProto, "format")?.get) formatProto = Object.getPrototypeOf(formatProto);
		NativeFormat = formatProto.constructor;
		nativeFormat = Object.getOwnPropertyDescriptor(formatProto, "format").get;
		nativeParts = NativeFormat.prototype.formatToParts;
		formats = /* @__PURE__ */ new WeakMap();
		DateTimeFormat.prototype = Object.create(NativeFormat.prototype, {
			constructor: {
				value: DateTimeFormat,
				writable: true,
				configurable: true
			},
			format: {
				configurable: true,
				get() {
					const f = nativeFormat.call(this);
					if (!formats.has(f)) formats.set(f, (...args) => args[0] === void 0 ? refuse$2("Intl.DateTimeFormat.format()") : f(...args));
					return formats.get(f);
				}
			},
			formatToParts: {
				configurable: true,
				writable: true,
				value(...args) {
					return args[0] === void 0 ? refuse$2("Intl.DateTimeFormat.formatToParts()") : nativeParts.apply(this, args);
				}
			}
		});
		Object.setPrototypeOf(DateTimeFormat, NativeFormat);
		noIo = (api) => function() {
			throw new Error(`${api} is unavailable in data sources`);
		};
		pageYield = globalThis.scheduler?.yield?.bind(globalThis.scheduler) ?? (typeof MessageChannel === "function" ? () => new Promise((resolve) => {
			const { port1, port2 } = new MessageChannel();
			port1.onmessage = () => {
				port1.close();
				resolve();
			};
			port2.postMessage(null);
		}) : () => Promise.resolve());
		codeFromString = () => {
			throw new SyntaxError("Parsing source code unsupported: a data source runs no code from a string (Function, eval), as on Hermes");
		};
		NoFunction = function Function(body) {
			return codeFromString(body);
		};
		noEval = { eval(source) {
			return codeFromString(source);
		} }.eval;
		Object.defineProperty(NoFunction, "prototype", { value: globalThis.Function.prototype });
		for (const f of [NoFunction, noEval]) Object.defineProperty(f, "constructor", {
			value: NoFunction,
			writable: false,
			configurable: false
		});
		guarded = {
			Date: GuardedDate,
			Math: GuardedMath,
			Function: NoFunction,
			eval: noEval,
			XMLHttpRequest: noIo("XMLHttpRequest"),
			WebSocket: noIo("WebSocket"),
			EventSource: noIo("EventSource"),
			Intl: Object.freeze(Object.create(NativeIntl, { DateTimeFormat: { value: DateTimeFormat } })),
			setTimeout(callback, delay, ...args) {
				if (typeof callback !== "function") throw new TypeError("setTimeout(): the callback must be a function; a string of code is never run");
				return arm$1("setTimeout()", callback, Math$1.max(Number(delay) | 0, 0), args);
			},
			clearTimeout(id) {
				disarm(Number(id) | 0);
			},
			setInterval: noTimers("setInterval()"),
			AbortSignal: GuardedAbortSignal,
			requestAnimationFrame: noTimers("requestAnimationFrame()"),
			requestIdleCallback: noTimers("requestIdleCallback()"),
			clearInterval() {},
			cancelAnimationFrame() {},
			cancelIdleCallback() {},
			performance: Object.freeze({ now: () => refuse$2("performance.now()") }),
			scheduler: Object.freeze({
				yield: () => owned(overlaying.on ? Promise.reject(inOverlay("scheduler.yield()")) : pageYield()),
				postTask() {
					throw new Error("scheduler.postTask() is unavailable in data sources; split long work with await scheduler.yield()");
				}
			}),
			Promise: AnswerPromise,
			Response: ModuleResponse,
			queueMicrotask(callback) {
				const call = currentContext();
				globalThis.queueMicrotask(typeof callback == "function" ? () => asCall(call, callback, "promiseCall") : callback);
			},
			crypto: Object.freeze({
				subtle: globalThis.crypto?.subtle && new Proxy(globalThis.crypto.subtle, { get(target, name) {
					const v = target[name];
					return typeof v !== "function" ? v : (...a) => new AnswerPromise((resolve) => {
						const api = `crypto.subtle.${String(name)}()`;
						if (name === "generateKey" || name === "sign") answerOnly(api);
						else if (overlaying.on) throw inOverlay(api);
						resolve(ordinary$1(() => v.apply(target, a)));
					});
				} }),
				getRandomValues: (a) => {
					answerOnly("crypto.getRandomValues()");
					const filled = globalThis.crypto.getRandomValues(a), bytes = seeded(filled.byteLength);
					if (bytes) new Uint8Array(filled.buffer, filled.byteOffset, filled.byteLength).set(bytes);
					return filled;
				},
				randomUUID: () => {
					answerOnly("crypto.randomUUID()");
					const b = seeded(16);
					if (!b) return globalThis.crypto.randomUUID();
					b[6] = b[6] & 15 | 64;
					b[8] = b[8] & 63 | 128;
					return Array.from(b, (x, i) => (i === 4 || i === 6 || i === 8 || i === 10 ? "-" : "") + x.toString(16).padStart(2, "0")).join("");
				}
			})
		};
		({Date: Date$1, Math: Math$1, Intl: Intl$1, setTimeout: setTimeout$1, setInterval, requestAnimationFrame: requestAnimationFrame$1, requestIdleCallback, clearTimeout: clearTimeout$1, clearInterval, cancelAnimationFrame: cancelAnimationFrame$1, cancelIdleCallback, performance: performance$1, scheduler: scheduler$1, queueMicrotask: queueMicrotask$1, XMLHttpRequest, WebSocket: WebSocket$1, EventSource, crypto: crypto$1} = guarded);
		methods = /* @__PURE__ */ new WeakMap();
		ABSENT = /* @__PURE__ */ new Set([
			"window",
			"self",
			"frames",
			"parent",
			"top",
			"opener",
			"document",
			"navigator",
			"location",
			"history",
			"localStorage",
			"sessionStorage",
			"indexedDB",
			"HTMLElement",
			"Element",
			"getComputedStyle",
			"customElements",
			"alert",
			"process",
			"Buffer",
			"global"
		]);
		page$1 = globalThis;
		Fetch = null;
		target = Object.create(null);
		mine = /* @__PURE__ */ new Set(["fetch", ...Object.keys(guarded)]);
		original = (name) => Reflect.defineProperty(target, name, {
			value: name === "fetch" ? Fetch : guarded[name],
			writable: true,
			enumerable: false,
			configurable: true
		});
		for (const name of mine) original(name);
		useFetch = (f) => {
			Fetch = f;
			original("fetch");
		};
		appGlobal = new Proxy(target, {
			has(own, name) {
				return mine.has(name) ? Reflect.has(own, name) : !ABSENT.has(name) && Reflect.has(page$1, name);
			},
			getOwnPropertyDescriptor(own, name) {
				if (mine.has(name)) return Reflect.getOwnPropertyDescriptor(own, name);
				const found = ABSENT.has(name) ? void 0 : Reflect.getOwnPropertyDescriptor(page$1, name);
				return found && {
					...found,
					configurable: true
				};
			},
			ownKeys(own) {
				return [.../* @__PURE__ */ new Set([...Reflect.ownKeys(own), ...Reflect.ownKeys(page$1).filter((name) => !ABSENT.has(name))])];
			},
			getPrototypeOf() {
				return Object.prototype;
			},
			set(own, name, value, receiver) {
				return mine.has(name) ? Reflect.set(own, name, value, receiver) : Reflect.set(page$1, name, value);
			},
			defineProperty(own, name, descriptor) {
				return Reflect.defineProperty(mine.has(name) ? own : page$1, name, descriptor);
			},
			deleteProperty(own, name) {
				if (!mine.has(name)) return Reflect.deleteProperty(page$1, name);
				return Reflect.deleteProperty(own, name) && original(name);
			},
			get(own, name, receiver) {
				if (mine.has(name)) return Reflect.get(own, name, receiver);
				if (ABSENT.has(name)) return void 0;
				if (name === "globalThis") return appGlobal;
				const value = Reflect.get(page$1, name, page$1);
				if (typeof value !== "function") return value;
				if (!methods.has(value)) methods.set(value, new Proxy(value, { apply(fn, receiver, args) {
					return Reflect.apply(fn, receiver === appGlobal ? page$1 : receiver, args);
				} }));
				return methods.get(value);
			}
		});
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/held.js
	const HeldAsks = /* @__PURE__ */ new Set();
	const loose = { n: 0 };
	const Replies = /* @__PURE__ */ new Map();
	const Answers = /* @__PURE__ */ new Set();
	/** In a render, whether an answer is still at work: it has I/O out (`call.plain`, `call.held`; ts-fetch.js counts
	* them) or a timer of its own while its ticket is current, or one firing. A render waits only for work, as the render
	* host does (host/render/src/lib.rs `settle`): an answer with none waits on nothing the render runs (a promise nothing
	* settles, another answer's, a storage call the render refused), and stays pending without holding the page. With
	* `discarded`, an answer whose ticket was let go counts too: its work can still write the store, and so a status. */
	function answersAtWork(discarded = false) {
		for (const t of Answers) {
			const c = t.call, live = current(t);
			if (!live && !discarded) continue;
			if (!c || c.plain || c.held || c.firing || c.timers > 0 && live) return true;
		}
		return false;
	}
	/** A fetch tied to no answer is out (one in a plain `.then`): a render waits for it, as for an answer's. */
	const looseOut = () => loose.n > 0;
	function trackAnswer(ticket) {
		Answers.add(ticket);
		const ended = () => Answers.delete(ticket);
		ticket.promise.then(ended, ended);
	}
	const Waiting$1 = /* @__PURE__ */ new Set();
	/** The tickets `inflight` counts now: a wake owns those that were not counted at its delivery (wakes.js). */
	const Counting = /* @__PURE__ */ new Set();
	const current = (t) => !!t && t.owner?.ticket === t && !t.owner.gone;
	function heldReply(call) {
		if (current(call.ticket)) Replies.set(call.ticket.name, (Replies.get(call.ticket.name) ?? 0) + 1);
	}
	/** A long poll's reply (LLP 1016.000 D8): from its first the stream is held and named, and each is a reply. */
	function longPollReplied(t) {
		if (current(t)) {
			HeldAsks.add(t);
			Replies.set(t.name, (Replies.get(t.name) ?? 0) + 1);
		}
	}
	/** A long poll's end, or its letting go: no longer held. */
	function longPollEnded(t) {
		HeldAsks.delete(t);
	}
	/** Open streams: one whose ticket its resource or mutation let go (new arguments, `refresh`, a failure,
	* its region ended) is closed once the commit that let it go stands, as the runner's forget path (D2). */
	const Open = /* @__PURE__ */ new Set();
	function closeLetGo(inflight, say) {
		for (const t of Open) if (!t.held() || t.r?.gone) {
			Open.delete(t);
			longPollEnded(t);
			t.closed = true;
			t.ctl.abort();
			if (t.waiting) {
				t.waiting = false;
				counted(t, inflight);
			}
			say(`close stream ${t.id}: its ticket was let go`);
		}
	}
	function counted(t, inflight) {
		if (t.call) {
			t.call.recount ??= () => counted(t, inflight);
			t.call.ticket ??= t;
		}
		const waits = !!t.waiting && !t.closed;
		const held = waits && t.call?.held > 0 && !t.call.plain && !loose.n, timed = waits && !held && t.call?.timers > 0 && !t.call.plain && !t.call.firing && !loose.n;
		const counts = waits && !held && !timed && !(t.call || t.ctl?.refused);
		if (counts !== !!t.counted) {
			t.counted = counts;
			inflight.n += counts ? 1 : -1;
		}
		if (counts) Counting.add(t);
		else Counting.delete(t);
		if (held) HeldAsks.add(t);
		else HeldAsks.delete(t);
		if (waits && t.call) Waiting$1.add(t);
		else Waiting$1.delete(t);
	}
	/** A fetch tied to no answer starts (+1) or ends (-1): every waiting answer is counted again. */
	function looseFetch(delta) {
		loose.n += delta;
		for (const t of [...Waiting$1]) t.call.recount();
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/held-hooks.js
	init_ts_fetch();
	Object.assign(answering, {
		loose: looseFetch,
		heldReply
	});
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/rows.js
	/** A row key, including its occurrence when repeated, shared by DOM reconciliation and binding probes. */
	function rowKey(value, rows, seen) {
		if (!(typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value))) throw new Error(`a row key that is not a string, finite number or bool: ${value}`);
		const key = typeof value + ":" + (Object.is(value, -0) ? 0 : value);
		if (!rows?.has(key)) return key;
		const occurrence = seen.get(key) ?? 1;
		seen.set(key, occurrence + 1);
		return `d${occurrence}:${key}`;
	}
	/** The indices of `list`'s kept rows (`old`, their former places) on a
	* longest run in increasing former order: the rows that need not move. */
	function inOrder(list) {
		const tails = [], prev = new Array(list.length);
		for (let i = 0; i < list.length; i++) {
			const o = list[i].old;
			if (o === void 0) continue;
			let lo = 0, hi = tails.length;
			while (lo < hi) {
				const mid = lo + hi >> 1;
				if (list[tails[mid]].old < o) lo = mid + 1;
				else hi = mid;
			}
			prev[i] = lo ? tails[lo - 1] : -1;
			tails[lo] = i;
		}
		const stay = /* @__PURE__ */ new Set();
		for (let i = tails.length ? tails[tails.length - 1] : -1; i >= 0; i = prev[i]) stay.add(i);
		return stay;
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/shape.js
	function checkArguments(name, args) {
		const i = args.findIndex((v) => !finiteValue(v));
		if (i >= 0) throw new Failed(`${name}: argument ${i + 1} contains a non-finite number`);
	}
	/** Whether `v` conforms to type code `t` (`n N b s u ?T [T {T…}`), from `i`;
	* numbers are finite (`N`: any number), as the runner's checks require. `o` is a value
	* that conformed: a part of `v` that is the same array as its part in `o`
	* conforms as it did, unchecked (the Rust runner's `Conformed` re-checks
	* only the list items that are not the same object, runner/src/conform.rs). */
	function conforms(v, t, i = [0], o) {
		if (o !== void 0 && v === o && typeof v === "object" && v !== null) {
			skip(t, i);
			return true;
		}
		const c = t[i[0]++];
		if (c === "n") return typeof v === "number" && isFinite(v);
		if (c === "N") return typeof v === "number";
		if (c === "b") return typeof v === "boolean";
		if (c === "e") {
			const end = t.indexOf(":", i[0]), n = Number(t.slice(i[0], end));
			i[0] = end + 1;
			const values = JSON.parse(t.slice(i[0], i[0] + n));
			i[0] += n;
			return typeof v === "string" && values.includes(v);
		}
		if (c === "s") return typeof v === "string" && v.isWellFormed();
		if (c === "u") return v == null;
		if (c === "?") {
			if (v == null) {
				skip(t, i);
				return true;
			}
			return conforms(v, t, i, o);
		}
		if (c === "[") {
			const at = i[0], was = Array.isArray(o) ? o : null;
			if (!Array.isArray(v)) return false;
			for (let k = 0; k < v.length; k++) {
				i[0] = at;
				if (!conforms(v[k], t, i, was?.[k])) return false;
			}
			i[0] = at;
			skip(t, i);
			return true;
		}
		if (c === "{") {
			let k = 0;
			const was = Array.isArray(o) ? o : null;
			for (; t[i[0]] !== "}"; k++) if (!Array.isArray(v) || !conforms(v[k], t, i, was?.[k])) return false;
			i[0]++;
			return v.length === k;
		}
		return true;
	}
	function skip(t, i) {
		const c = t[i[0]++];
		if (c === "e") {
			const end = t.indexOf(":", i[0]);
			i[0] = end + 1 + Number(t.slice(i[0], end));
		} else if (c === "?" || c === "[") skip(t, i);
		else if (c === "{") {
			while (t[i[0]] !== "}") skip(t, i);
			i[0]++;
		}
	}
	/** Contract's `==`, and what the runner compares a resource's arguments
	* with (runner/src/compare.rs `equal`, `Value`'s `PartialEq`): numbers as
	* IEEE compares them (`-0` equals `0`, NaN equals nothing, itself
	* included), lists and records item by item. */
	function equal(a, b) {
		if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (!equal(a[i], b[i])) return false;
		return true;
	}
	/** Resource failures follow argument equality, with NaNs unchanged too. */
	function unchangedArguments(a, b) {
		if (!Array.isArray(a) || !Array.isArray(b)) return a === b || typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b);
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (!unchangedArguments(a[i], b[i])) return false;
		return true;
	}
	/** Plan value identity, for change detection (an equal value keeps its old
	* object): signed zero told apart, NaN the same as itself, and recursively
	* equal lists. Not Contract's `==`, which is `equal`. */
	function eq(a, b) {
		if (a === b) return a !== 0 || 1 / a === 1 / b;
		if (typeof a === "number" && typeof b === "number") return a !== a && b !== b;
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (!eq(a[i], b[i])) return false;
		return true;
	}
	function failureCode(e) {
		if (!e || typeof e !== "object") return "error";
		if (e[Shaped]) return "shape";
		if (e.name === "FetchError") return Object.hasOwn(FETCH_FAILURE, e.kind) ? FETCH_FAILURE[e.kind] : "error";
		return e.kind === "Unavailable" && typeof e.code === "string" ? "storage" : "error";
	}
	var Refusal, Failed, finiteValue, finiteArguments, loneSurrogate, Shaped, FETCH_FAILURE, failureReason, WS;
	var init_shape = __esmMin((() => {
		Refusal = class extends Error {};
		Failed = class extends Refusal {
			constructor(message, code = "error", reason = "") {
				super(message);
				this.code = code;
				this.reason = reason;
			}
		};
		finiteValue = (v) => typeof v === "number" ? Number.isFinite(v) : !Array.isArray(v) || v.every(finiteValue);
		finiteArguments = (args) => args.every(finiteValue);
		loneSurrogate = (v) => typeof v === "string" ? !v.isWellFormed() : Array.isArray(v) && v.some(loneSurrogate);
		Shaped = Symbol("shape");
		FETCH_FAILURE = {
			Network: "offline",
			Timeout: "timeout",
			Refused: "refused"
		};
		failureReason = (e) => e && typeof e === "object" && typeof e.reason === "string" ? e.reason : "";
		WS = "	\n\v\f\r \xA0  - \u2028\u2029  　";
		new RegExp(`^[${WS}]+|[${WS}]+$`, "g");
		new RegExp(`[${WS}]+`, "g");
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/resource-inspection.js
	init_shape();
	function retainedAnswer(r, say) {
		if (r.reportedPreviousAnswer || r.gone || r.asleep || r.placeholder || r.settled === void 0 || r.asked === void 0 || equal(r.settled, r.asked)) return;
		r.reportedPreviousAnswer = true;
		say(`resource ${r.name} shows its answer for previous arguments (LLP 1016 D3)`);
	}
	function resourceInspection(enabled, now) {
		let serial = 0;
		const since = enabled ? now() : null;
		return {
			track(r, fallback, pending) {
				if (!enabled) return;
				r.inspection = {
					request: null,
					successful: null,
					displayed: null,
					fallback,
					placeholder: false
				};
				r.observation = (resource) => {
					const d = r.inspection;
					return {
						resource,
						source: r.source,
						requestGeneration: d.request,
						lastSuccessfulGeneration: d.successful,
						displayedGeneration: d.displayed,
						pending: pending(),
						displayed: d.fallback ? "fallback" : d.displayed !== null && d.displayed === d.request ? "current" : "retained",
						argumentsEqual: d.fallback || r.settled === void 0 || r.asked === void 0 ? null : equal(r.settled, r.asked),
						placeholder: d.placeholder,
						keptSeed: false,
						keptSeedSupported: false
					};
				};
				r.resourcesMeasuredFrom = since;
			},
			begin(r) {
				if (r.inspection) {
					r.inspection.request = ++serial;
					r.asks = (r.asks ?? 0) + 1;
				}
			},
			placeholder(r) {
				if (r.inspection) r.inspection.placeholder = true;
			},
			take(r, generation = r.inspection?.request) {
				if (r.inspection) Object.assign(r.inspection, {
					successful: generation,
					displayed: generation,
					fallback: false,
					placeholder: false
				});
			},
			fail(r) {
				if (!enabled) return;
				const at = now(), f = r.failures ??= {
					count: 0,
					first: at,
					last: at
				};
				f.count++;
				f.last = at;
				console.error(`exact: resource ${r.name} failed: ${r.error ?? "it failed"}`);
			}
		};
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/navigation.js
	function viewChildren(el) {
		return [...el?.children ?? []].flatMap((c) => c.hasAttribute("data-exact-list-item") ? [listRow(c)].filter(Boolean) : [c]);
	}
	function viewParent(el) {
		const p = el?.parentElement;
		return p?.hasAttribute("data-exact-list-item") ? p.parentElement : p;
	}
	function unwrapListItem(el) {
		if (!el?.hasAttribute?.("data-exact-list-item")) return el;
		const child = listRow(el);
		el.before(...el.childNodes);
		el.remove();
		return child;
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
	function foldEnv() {
		const f = fold();
		return {
			"device-posture": f.posture,
			"horizontal-viewport-segments": f.cols,
			"vertical-viewport-segments": f.rows,
			"viewport-segments": f.rects.map((r) => r.map(r2))
		};
	}
	function onFold(changed) {
		readFold();
		foldListeners.add(changed);
		globalThis.navigator?.devicePosture?.addEventListener?.("change", changed);
		addEventListener("resize", changed);
	}
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
				} else throw Object.assign(/* @__PURE__ */ new Error(`prefer: ${name}: ${value} is not a page fact this host sets`), name === "keyboard-navigation" || name === "bold-text" ? {} : { malformed: true });
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
	function inertAncestor(el) {
		for (let node = el; node; node = node.parentElement) {
			if (node.hasAttribute("inert")) return node;
			if (node.localName === "dialog" && node.matches(":modal")) return null;
		}
		return null;
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
	function inspectTestIds(root, log) {
		let inspection = duplicateIds.get(root);
		if (!inspection) duplicateIds.set(root, inspection = {
			left: 32,
			reported: /* @__PURE__ */ new Set()
		});
		if (inspection.left === 0) return;
		inspection.left--;
		const seen = /* @__PURE__ */ new Map();
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
		const open = /* @__PURE__ */ new Map(), across = /* @__PURE__ */ new Map(), memo = (m, el, f) => {
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
	function unselectedWithin(nav, keepList) {
		const key = nav.getAttribute("navigationKey"), panels = panelsOf(nav), stacks = panels.length ? panels.map(routesIn) : [routesIn(nav)];
		const at = stacks.findIndex((routes) => routes.some((r) => r.getAttribute("navigationKey") === key)), routes = stacks[at] ?? [], top = routes.find((r) => r.getAttribute("navigationKey") === key);
		const beside = keepList && routes[0]?.getAttribute("data-exact-split") === "list" && !sheet(top) ? routes[0] : top;
		return at < 0 ? [] : [...panels.filter((_, i) => i !== at), ...routes.filter((r) => r !== top && r !== beside)];
	}
	function unselectedForHead(nav) {
		return unselectedWithin(nav, false);
	}
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
		const entry = written$1[cursor - 1];
		if (!(cursor > first && written$1[cursor]?.id === id && entry?.id === Number(below.getAttribute("navigationKey"))) || navigate(entry.url.split("#")[0]) === false) hostBack$1?.(id);
	}
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
	function commit$1(op) {
		for (const id of op.removed) gone.add(id);
		if (first === null) {
			first = 0;
			originIndex = browserIndex();
			written$1[0] = stamp(0, op);
			history.replaceState(written$1[0], "", historyURL(op.url));
		} else if (written$1[cursor]?.id === op.top && !(pop === null && written$1[cursor].url !== op.url && written$1[cursor].url.split("#")[0] === op.url.split("#")[0])) {
			if (written$1[cursor].url !== op.url) {
				written$1[cursor] = stamp(cursor, op);
				history.replaceState(written$1[cursor], "", historyURL(op.url));
			}
		} else {
			let j = cursor;
			while (j > first && gone.has(written$1[j]?.id)) {
				j--;
				if (written$1[j]?.id === op.top) {
					const from = cursor;
					cursor = j;
					return go(j, from, () => written$1[j].url === op.url || history.replaceState(written$1[j] = stamp(j, op), "", historyURL(op.url)));
				}
			}
			for (const index of Object.keys(written$1)) if (Number(index) > cursor) delete written$1[index];
			written$1.length = Math.max(0, cursor + 1);
			op.pushed = written$1[cursor]?.id === op.top;
			written$1[++cursor] = stamp(cursor, op);
			history.pushState(written$1[cursor], "", historyURL(op.url));
			globalThis.exact?.fragment?.forget(cursor);
		}
	}
	function popped({ j, state, url, ua }) {
		const entry = written$1[j];
		const owned = entry && state?.exact === j && state.id === entry.id && state.url === entry.url;
		const target = owned ? entry.url : url;
		const nav = root.querySelector("[navigationBack]");
		const routes = routesOf(nav), selected = routes.indexOf(selectedRoute(nav));
		const step = owned && j === cursor - 1 && entry.id !== written$1[cursor]?.id, beneath = step && selected > 0 && routes[selected - 1].getAttribute("navigationKey") === String(entry.id);
		let back = beneath && !!backControl(nav), own = false, why = null;
		pop = { ua };
		try {
			if (back) why = pressBack(nav);
			else if (navigate(target) === false) {
				own = true;
				back = step && (!!backControl(nav) || closedNone(selectedRoute(nav)));
				if (back) why = pressBack(nav);
				else if (step) hostBack$1?.(written$1[cursor].id);
				else hostGo$1?.(target);
			}
			if (back ? last?.top === entry.id : (pop.op ?? (!owned || entry.id === last?.top ? last : null))?.url === target) {
				cursor = j ?? cursor;
				first = Math.min(first, cursor);
				written$1[cursor] = stamp(cursor, last);
				go(cursor, j ?? cursor, () => history.replaceState(written$1[cursor], "", historyURL(written$1[cursor].url)));
				if (!pop.op) globalThis.exact?.fragment?.traverse(root, last, navigation, log);
			} else if (pop.op) {
				const op = pop.op;
				if (j !== null && j !== cursor) go(cursor, j, () => commit$1(op));
				else {
					history.replaceState(written$1[cursor], "", historyURL(written$1[cursor].url));
					commit$1(op);
				}
			} else {
				if (back) log(`history: Back refused: ${why ?? `pressing the Back control did not select entry ${entry.id}`}; restoring the entry`);
				else log(`history: ${own ? `${step ? "Back to" : "navigate"} ${JSON.stringify(target)} refused: the navigation root has no navigate handler (navigate=…), and the runner's own ${step ? `back from visit ${written$1[cursor].id}` : "go there"} committed no router change` : `${beneath ? `Back to ${JSON.stringify(target)} refused: route ${nav.getAttribute("navigationKey")} has no id="${nav.getAttribute("navigationBack")}" control, and` : `navigate ${JSON.stringify(target)} refused:`} the navigation root's navigate handler (navigate=…) committed no router change, or the root has none`}; restoring the entry`);
				if (j !== null && j !== cursor) go(cursor, j);
				else history.replaceState(written$1[cursor], "", historyURL(written$1[cursor].url));
			}
		} finally {
			pop = null;
		}
	}
	function drain$1() {
		if (draining || echo !== null) return;
		draining = true;
		try {
			for (let item; queue$1.length && echo === null;) {
				item = queue$1.shift();
				if (item.op) commit$1(item.op);
				else popped(item);
			}
		} finally {
			draining = false;
		}
	}
	var listRow, listOwner, APP_ROOT, probe, r2, foldQueries, foldListeners, foldProbe, fold, DISPLAY_MODES, preferenceQueries, queries, preferences, displayMode, updateQueries, updates, UPDATES, updateCode, handheld, launched, opening, order, popoverSources, AGENT_ADMITTED, last, refused$1, managed, shown$1, placed, written$1, gone, cursor, first, originIndex, echo, pop, draining, queue$1, waiters, root, navigate, log, hostBack$1, hostGo$1, routeMatches, canonicalOf, pressedLink, heldLink, reportedLinkPop, duplicateIds, routesIn, setInert, liveById, leavingSheets, shownRoutes, tabsOf, panelsOf, stacksOf, WIDE_WIDTH, WIDE, wide, splitLists, rowOf, actionRows, visits, activationRequired, activated, sheet, framing, sheetAt, overPage, pressedRow, pendingRow, excluded, rowPress, rowHref, linked, paths, freshPath, unsaidBar, routesOf, selectedRoute, browserIndex, agentParameters, byPerson, stamp, backControl, BACK, headerOf, authored, siteHeader, markSites, asWritten, titleOf, saidTitle, appName, clearInset, clearBars, barResized, barScrolled, closedNone, settled$1, navigation;
	var init_navigation = __esmMin((() => {
		listRow = (el) => [...el.children].find((c) => !c.hasAttribute("data-exiting"));
		listOwner = (p) => p?.$listOwner ?? (p?.hasAttribute?.("data-exact-list") ? p : null);
		APP_ROOT = "exact-root-font-size";
		r2 = (x) => Math.round(x * 100) / 100;
		foldQueries = /* @__PURE__ */ new Map();
		foldListeners = /* @__PURE__ */ new Set();
		fold = () => globalThis.exact?.foldSubstitute ?? readFold();
		DISPLAY_MODES = [
			"standalone",
			"browser",
			"fullscreen",
			"minimal-ui",
			"window-controls-overlay",
			"picture-in-picture",
			"tabbed"
		];
		queries = () => preferenceQueries ??= [
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
		preferences = () => {
			const bits = queries().reduce((bits, [q, bit]) => bits | (q.matches ? bit : 0), 0), meta = globalThis.document?.querySelector?.("meta[name=\"color-scheme\"]")?.content, pinned = globalThis.exact?.systemScheme ?? (meta === "light" || meta === "dark" ? meta : null);
			return pinned ? bits & -17 | (pinned === "dark" ? 16 : 0) : bits;
		};
		displayMode = () => DISPLAY_MODES[preferences() >>> 29 & 7];
		updates = () => updateQueries ??= ["(update: slow)", "(update: none)"].map((q) => globalThis.matchMedia?.(q));
		UPDATES = [
			"fast",
			"slow",
			"none"
		];
		updateCode = () => updates()[1]?.matches ? 2 : updates()[0]?.matches ? 1 : 0;
		handheld = (platform = globalThis) => Math.min(platform.screen?.width ?? Infinity, platform.screen?.height ?? Infinity) < 600;
		launched = () => new URL(globalThis.performance?.getEntriesByType?.("navigation")[0]?.name ?? location.href).searchParams;
		opening = [];
		order = 0;
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
		popoverSources = /* @__PURE__ */ new WeakMap();
		AGENT_ADMITTED = true;
		last = null;
		refused$1 = /* @__PURE__ */ new WeakMap();
		managed = /* @__PURE__ */ new WeakMap();
		shown$1 = /* @__PURE__ */ new WeakMap();
		placed = /* @__PURE__ */ new WeakMap();
		written$1 = [];
		gone = /* @__PURE__ */ new Set();
		cursor = 0;
		first = null;
		originIndex = null;
		echo = null;
		pop = null;
		draining = false;
		queue$1 = [];
		waiters = /* @__PURE__ */ new Set();
		routeMatches = () => false;
		canonicalOf = (location) => location;
		pressedLink = null;
		heldLink = null;
		reportedLinkPop = false;
		duplicateIds = /* @__PURE__ */ new WeakMap();
		routesIn = (node) => viewChildren(node).filter((r) => r.hasAttribute("navigationKey") && !r.hasAttribute("data-exiting"));
		setInert = (el, on) => {
			if (el.inert !== on) el.inert = on;
		};
		liveById = (id, root = document) => {
			const el = document.getElementById(id), live = (n) => !n.closest("[data-exiting]");
			return !el ? null : live(el) && root.contains(el) ? el : [...root.querySelectorAll("[id]")].find((n) => n.id === id && live(n)) ?? null;
		};
		leavingSheets = /* @__PURE__ */ new Set();
		shownRoutes = /* @__PURE__ */ new WeakMap();
		tabsOf = (nav) => {
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
		panelsOf = (nav) => tabsOf(nav)[1];
		stacksOf = (nav) => {
			const panels = panelsOf(nav);
			return panels.length ? panels.map(routesIn) : [nav ? routesIn(nav) : []];
		};
		WIDE_WIDTH = 900;
		WIDE = `(min-width: ${WIDE_WIDTH}px)`;
		wide = () => {
			if (!globalThis.matchMedia?.(WIDE).matches) return false;
			const { cols, rects } = fold();
			return cols === 1 || rects.length > 0 && rects.every(([, , width]) => width >= WIDE_WIDTH);
		};
		splitLists = /* @__PURE__ */ new WeakMap();
		rowOf = /* @__PURE__ */ new WeakMap();
		actionRows = /* @__PURE__ */ new WeakMap();
		visits = /* @__PURE__ */ new Map();
		activationRequired = /* @__PURE__ */ new WeakSet();
		activated = /* @__PURE__ */ new WeakSet();
		sheet = (route) => ["modal", "fullscreen"].includes(route?.getAttribute("navigationPresentation"));
		framing = null;
		sheetAt = (routes, i) => {
			for (let j = i; j > 0; j--) {
				const p = routes[j].getAttribute("navigationPresentation");
				if (p === "modal" || p === "fullscreen") return p === "modal" ? j : -1;
			}
			return -1;
		};
		overPage = (route) => {
			const p = route?.getAttribute("navigationPresentation");
			if (p !== "fullscreen") return p === "modal";
			const { backgroundColor: c = "rgba(1, 2, 3, 0)", backgroundImage: i = "none" } = getComputedStyle(route);
			return c !== "rgba(1, 2, 3, 0)" || i !== "none";
		};
		pressedRow = null;
		pendingRow = null;
		excluded = (el) => el.hasAttribute("popover") || el.hasAttribute("data-exiting") || getComputedStyle(el).display === "none";
		rowPress = (el) => el.getAttribute("data-exact-router-press");
		rowHref = (el) => el.getAttribute("href") || null;
		linked = (href) => href?.startsWith("/") && !href.startsWith("//") && routeMatches(href);
		paths = /* @__PURE__ */ new WeakMap();
		freshPath = (route) => {
			const path = last?.url?.split(/[?#]/)[0], was = paths.get(route);
			paths.set(route, path);
			if (was !== void 0 && was !== path) {
				for (const el of [route, ...route.querySelectorAll("*")]) if (el.scrollTop || el.scrollLeft) el.scrollTo(0, 0);
				if (route.matches("[data-scrolldocument=\"true\"]:not([data-exact-offpage])") || route.querySelector("[data-scrolldocument=\"true\"]:not([data-exact-offpage])")) scrollTo(0, 0);
			}
		};
		unsaidBar = (nav, list) => viewParent(list) === nav && getComputedStyle(list).appearance !== "none" && list.getAttribute("aria-orientation") !== "vertical" && (([n, l]) => /flex/.test(n.display) && n.flexDirection.startsWith("column") && /^(static|relative)$/.test(l.position) && l.flexDirection.startsWith("row"))([getComputedStyle(nav), getComputedStyle(list)]);
		routesOf = (nav) => stacksOf(nav).find((routes) => routes.some((r) => r.getAttribute("navigationKey") === nav.getAttribute("navigationKey"))) ?? [];
		selectedRoute = (nav) => routesOf(nav).find((r) => r.getAttribute("navigationKey") === nav.getAttribute("navigationKey"));
		browserIndex = () => globalThis.navigation?.currentEntry?.index ?? null;
		agentParameters = [
			"agent",
			"seed",
			"locale",
			"formatLocale",
			"timeZone",
			"epoch",
			"storage",
			"failFetch"
		];
		byPerson = (e, el = e.target) => e.type === "keydown" ? /^(Arrow(Up|Down|Left|Right)|Page(Up|Down)|Home|End| )$/.test(e.key) && !el.closest?.("input, textarea, select, [contenteditable]") : e.type !== "pointerdown" || el instanceof Element && ((b) => e.clientX - b.left >= el.clientLeft + el.clientWidth || e.clientY - b.top >= el.clientTop + el.clientHeight)(el.getBoundingClientRect());
		stamp = (index, op) => ({
			exact: index,
			id: op.top,
			url: op.url
		});
		backControl = (nav, route = selectedRoute(nav), name = nav.getAttribute("navigationBack")) => route && name !== null ? route.querySelector(`[id="${CSS.escape(name)}"]`) ?? [...nav.ownerDocument.querySelectorAll(`[id="${CSS.escape(name)}"]`)].find((control) => [null, nav].includes(control.closest("[navigationKey]"))) ?? null : void 0;
		BACK = `<style>button{all:unset;display:inline-flex;align-items:center;gap:6px;flex:none;vertical-align:middle;margin-inline:-6px 6px;padding:4px 8px 4px 4px;border-radius:8px;cursor:pointer;white-space:nowrap;-webkit-user-select:none;user-select:none}button[hidden],span[hidden]{display:none}button:focus-visible{outline:2px solid var(--exact-accent,AccentColor);outline-offset:1px}button:active>*{opacity:var(--exact-back-press,.5)}svg{width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}button:dir(rtl) svg{scale:-1 1}</style><button part="back" type="button"><svg viewBox="4 4 16 16" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg><span></span></button><slot></slot>`;
		headerOf = (route) => viewChildren(route).find((child) => child.localName === "header");
		authored = "[data-exact-said~=\"appearance\"]";
		siteHeader = (header, links = 0) => {
			const holds = (el, menu) => [...el.children].some((child) => {
				const inMenu = menu || child.matches("[popover], dialog");
				return child.localName === "nav" || !inMenu && child.matches("a[href], [role=link]") && ++links > 1 || holds(child, inMenu);
			});
			return holds(header, false);
		};
		markSites = (route) => {
			for (const child of viewChildren(route)) if (child.localName === "header") child.toggleAttribute("data-exact-site", siteHeader(child));
		};
		asWritten = (header) => header.matches(`${authored}, [data-exact-site]`);
		titleOf = (route) => {
			for (const el of headerOf(route)?.getElementsByTagName("*") ?? []) if (el.matches("h1, h2, h3, h4, h5, h6, [role=heading]")) return el.textContent.trim();
			return "";
		};
		saidTitle = null;
		appName = null;
		clearInset = /* @__PURE__ */ new WeakSet();
		clearBars = /* @__PURE__ */ new WeakMap();
		barResized = globalThis.ResizeObserver && new ResizeObserver((entries) => {
			for (const { target } of entries) {
				const route = clearBars.get(target);
				route?.isConnected && clearBar(route);
			}
		});
		barScrolled = (route, header) => header.setAttribute("data-exact-clear", (contentScroller(route) ?? document.scrollingElement)?.scrollTop > 0 ? "scrolled" : "");
		closedNone = (route) => ["modal", "fullscreen"].includes(route?.getAttribute("navigationPresentation")) && route.getAttribute("closedby") === "none";
		settled$1 = () => {
			if (echo === null && !queue$1.length) for (const finish of [...waiters]) finish();
		};
		navigation = {
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
				hostBack$1 = back;
				hostGo$1 = goTo;
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
						drain$1();
						settled$1();
						return;
					}
					queue$1.push({
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
					drain$1();
					settled$1();
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
				refused$1 = /* @__PURE__ */ new WeakMap();
				splitLists = /* @__PURE__ */ new WeakMap();
				rowOf = /* @__PURE__ */ new WeakMap();
				actionRows = /* @__PURE__ */ new WeakMap();
				pressedRow = pendingRow = null;
				pressedLink = heldLink = null;
				reportedLinkPop = false;
				duplicateIds = /* @__PURE__ */ new WeakMap();
				visits = new Map((op?.visits ?? []).map(([id, url]) => [String(id), url]));
				if (op && written$1[cursor]?.id === op.top) return;
				last = null;
				written$1 = [];
				gone = /* @__PURE__ */ new Set();
				cursor = 0;
				first = null;
				originIndex = null;
				echo = null;
				pop = null;
				queue$1.length = 0;
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
					queue$1.push({ op });
					drain$1();
				}
			},
			back(hostRoot) {
				const nav = hostRoot?.querySelector("[navigationBack]"), routes = nav ? routesOf(nav) : [], route = nav && selectedRoute(nav), at = routes.indexOf(route), way = sheet(route) ? "sheet" : "route", key = nav?.getAttribute("navigationKey"), kept = () => nav.getAttribute("navigationKey") === key ? { refused: "the app kept the route: its Back control is disabled, its closedby is \"none\", or its navigate changed nothing (logs say which)" } : {};
				if (at < 1) return { error: "back: nothing to go back from: no dialog is open, and no route is beneath the selected one" };
				if (cursor > first && written$1[cursor]?.id === Number(route.getAttribute("navigationKey")) && written$1[cursor - 1]?.id === Number(routes[at - 1].getAttribute("navigationKey"))) return navigation.travel(nav, -1).then((r) => ({
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
						if (refused$1.get(nav) !== key) {
							refused$1.set(nav, key);
							log(`navigationKey "${key}" matches no route among the root's children or those of the tabpanels its tablist names; the stack is unchanged`);
						}
						key = (shown$1.get(nav) ?? []).findLast(declared);
						if (key === void 0) continue;
					} else refused$1.delete(nav);
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
							shown$1.set(nav, showing.map((route) => route.getAttribute("navigationKey")));
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
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/live-time.js
	init_navigation();
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/document.js
	init_navigation();
	/** The active head's fields by prop name (`headTitle` …): what a renderer
	* reads (render.mjs), and the agent's `state.head`. */
	const Head = {};
	const Heads = /* @__PURE__ */ new Set();
	function canSetStatus() {
		const root = document.getElementById("exact-root");
		for (const h of Heads) if (Object.hasOwn(h.f, "headStatus") && place(h.t, root)) return true;
		const seen = /* @__PURE__ */ new Set();
		const readsData = (n) => {
			if (!n || seen.has(n)) return false;
			seen.add(n);
			return !!n.resource || n.src.some(readsData);
		};
		for (const guard of []) if (!guard.n?.gone && place(guard.t, root, guard.selections) && readsData(guard.n)) return true;
		return false;
	}
	function place(t, root, selections) {
		if (!t) return null;
		const at = [], path = /* @__PURE__ */ new Set([t]);
		let through;
		if (selections?.length) {
			for (let p = t; p; p = p.parentNode) if (selections.includes(p)) through = p;
		}
		if (through === t) through = null;
		let c = t;
		for (let p = c.parentNode; p && c !== root; c = p, p = p.parentNode) {
			if (p.hasAttribute?.("navigationBack")) {
				if (!through && unselectedForHead(p).some((off) => path.has(off))) return null;
			}
			if (p === through) through = null;
			at.unshift([].indexOf.call(p.childNodes, c));
			path.add(p);
		}
		return c === root ? at : null;
	}
	/** The page's navigation roots, with a router or without (`history` is
	* navigation.js's, the web host's own): each root's routes are projected,
	* the covered hidden and inert, now and after every commit's tree (`after`,
	* rt.js `After`), as the web host projects after every batch; Escape on a
	* modal route presses its back, and `navigate` takes a popstate's location
	* (unheard, `hostBack` and `hostGo` are the router's own). */
	function projectRoots(history, navigate, say, after, hostBack, hostGo, routeMatches, canonical) {
		const root = document.getElementById("exact-root"), project = () => history.project(root, say);
		history.connect(root, navigate, say, hostBack, hostGo, routeMatches, true, canonical);
		after.push(project, markDocument);
		history.activate(root, say);
	}
	/** Project route visibility before startup. A modal, or a full-screen route
	* that paints its own background, keeps the underlying page and intervening
	* sheets visible but inert, as navigation.js `project` does. */
	function markRoutes(root) {
		for (const nav of [...root.getElementsByTagName("*")].filter((e) => e.hasAttribute("navigationBack"))) {
			const key = nav.getAttribute("navigationKey"), panels = panelsOf(nav);
			const stacks = (panels.length ? panels : [nav]).map((p) => viewChildren(p).filter((r) => r.hasAttribute("navigationKey")));
			const at = stacks.findIndex((routes) => routes.some((r) => r.getAttribute("navigationKey") === key));
			if (at < 0) continue;
			const mark = (e, hidden, inert) => {
				if (hidden) e.style.setProperty("visibility", "hidden");
				if (inert) e.setAttribute("inert", "");
			};
			panels.forEach((p, i) => mark(p, i !== at, i !== at));
			stacks.forEach((routes, i) => {
				const shown = i === at ? routes.findIndex((r) => r.getAttribute("navigationKey") === key) : routes.length - 1;
				const sheet = overPage(routes[shown]);
				const beneath = routes.findLastIndex((r, j) => j < shown && !overPage(r));
				routes.forEach((r, j) => mark(r, j !== shown && !(sheet && j >= beneath && j < shown), j !== shown));
			});
		}
	}
	/** The elements that may be the page's scroller: `<html data-scrolldocument>`
	* while one is (D4), which the shell's rule reads, as the web host's glue.
	* One in a route or panel the projection hid is `data-exact-offpage`, an inner
	* scroller again, so a covered route's content leaves the page's height. When
	* the page's one scroller changes, it is given the page's scroll it last had:
	* a route opened anew starts at its top, one shown again where the reader left
	* it. Each one's place is kept as the page scrolls, since by the time a commit
	* switches them, moving the focus into the route shown may have scrolled the
	* page. The page's scroller's ancestors in the root are `data-exact-frame`,
	* which the shell's rule lays out in flow and as tall as their content (a
	* `:has()` would cost a style recalculation at every change). */
	const Docs = /* @__PURE__ */ new Set();
	let Marked = false;
	let Page = null;
	let Listening = false;
	let Path = [];
	const Scrolled = /* @__PURE__ */ new WeakMap();
	const hidden = (e) => {
		for (let a = e; a; a = a.parentElement) if (a.style?.getPropertyValue("visibility") === "hidden") return true;
		return false;
	};
	function markDocument() {
		if (!Docs.size && !Marked) return;
		const live = [];
		for (const e of Docs) if (!e.isConnected) Docs.delete(e);
		else if (e.getAttribute("data-scrolldocument") === "true") hidden(e) ? e.setAttribute("data-exact-offpage", "") : live.push(e);
		const page = live.length === 1 ? live[0] : null, scrolls = typeof globalThis.scrollTo === "function" && typeof globalThis.scrollY === "number";
		if (scrolls && !Listening) {
			Listening = true;
			addEventListener("scroll", () => {
				if (Page?.isConnected) Scrolled.set(Page, [scrollX, scrollY]);
			}, { passive: true });
		}
		for (const e of live) e.removeAttribute("data-exact-offpage");
		Marked = live.length > 0;
		document.documentElement?.toggleAttribute?.("data-scrolldocument", Marked);
		const path = [];
		for (let a = page?.parentElement; a && a.id !== "exact-root"; a = a.parentElement) path.push(a);
		for (const a of Path) if (!path.includes(a)) a.removeAttribute("data-exact-frame");
		for (const a of path) if (!a.hasAttribute("data-exact-frame")) a.setAttribute("data-exact-frame", "");
		Path = path;
		if (page && Page !== page) {
			if (scrolls && (Page?.isConnected || Scrolled.has(page))) scrollTo(...Scrolled.get(page) ?? [0, 0]);
			Page = page;
		}
	}
	const Waiting = /* @__PURE__ */ new Map();
	/** Build each waiting panel its root now selects, and any no root's tablist names. */
	function openTabs() {
		for (let open = toOpen(); open.length; open = toOpen()) for (const e of open) {
			const build = Waiting.get(e);
			Waiting.delete(e);
			build();
		}
	}
	function toOpen() {
		const open = [], roots = /* @__PURE__ */ new Set();
		for (const e of Waiting.keys()) {
			let root = e.parentElement;
			while (root && !root.hasAttribute("navigationKey")) root = root.parentElement;
			if (!root?.hasAttribute("navigationBack")) root = null;
			const panels = root ? panelsOf(root) : [];
			if (!panels.includes(e)) {
				open.push(e);
				continue;
			}
			if (roots.has(root)) continue;
			roots.add(root);
			const key = root.getAttribute("navigationKey");
			if (panels.some((p) => !Waiting.has(p) && viewChildren(p).some((r) => r.getAttribute("navigationKey") === key))) continue;
			const named = [...root.getElementsByTagName("*")].filter((t) => t.getAttribute("aria-selected") === "true").map((t) => t.getAttribute("aria-controls"));
			const waiting = panels.filter((p) => Waiting.has(p)), chosen = waiting.find((p) => named.includes(p.getAttribute("id"))) ?? waiting[0];
			if (chosen) open.push(chosen);
		}
		return open;
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/focus.js
	init_navigation();
	const offered = /* @__PURE__ */ new WeakSet();
	let looking = true;
	const candidates = "[autofocus], [data-autofocus=\"true\"]";
	/** A field built or bound since the last look may be waiting: the next commit looks. */
	const mayFocus = () => {
		looking = true;
	};
	/** Keep the authored prop while a carried boot suppresses its DOM behavior. */
	function autofocusProp(el, on) {
		mayFocus();
		el.toggleAttribute("autofocus", on && true);
		if (on && true) el.removeAttribute("data-autofocus");
		else el.setAttribute("data-autofocus", String(on));
	}
	/** The press a pointer is dispatching (a click with `detail` > 0: a key's activation keeps the
	* focus where it is, as the wasm host's): its own work may hand the pressed control's focus to a
	* field it mounts — the dispatch's synchronous commits (a due `then` the event runs first among
	* them) and a tree update it handed to a view transition (shared.js holds it and runs it `within`
	* that press). Nothing else may: not after that work has run, not an unrelated commit meanwhile,
	* and not once a later key, or a pointer on another control, supersedes the press, as the wasm
	* host's `pointerTarget` lasts only through `press()` (Charlie, 2026-10-07: no wall-clock window). */
	const live = /* @__PURE__ */ new Set();
	let dispatching = null;
	const release = (token) => () => {
		if (--token.n === 0) live.delete(token);
	};
	const supersede = (ev) => {
		for (const token of live) if (ev.type === "keydown" || !token.el.contains?.(ev.target)) {
			token.dead = true;
			live.delete(token);
		}
	};
	let listening = false;
	function press(el) {
		if (!listening && globalThis.document?.addEventListener) {
			listening = true;
			for (const kind of ["pointerdown", "keydown"]) document.addEventListener(kind, supersede, true);
		}
		const token = {
			el,
			n: 1,
			dead: false
		}, was = dispatching, done = release(token);
		live.add(token);
		dispatching = token;
		return () => {
			dispatching = was;
			done();
		};
	}
	const rootOf = () => globalThis.document?.getElementById?.("exact-root");
	function autofocus(root = rootOf()) {
		const token = dispatching, by = token && !token.dead ? token.el : null;
		if (!looking || !root?.querySelectorAll) return;
		looking = false;
		for (const el of root.querySelectorAll(candidates)) {
			if (offered.has(el)) continue;
			looking = true;
			if (!el.getClientRects().length || inertAncestor(el) || el.matches(":disabled") || getComputedStyle(el).visibility !== "visible") continue;
			offered.add(el);
			const active = document.activeElement;
			if (!active || active === document.body || active === by) el.focus({ preventScroll: true });
			break;
		}
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/overlay.js
	init_shape();
	const Writes$1 = {
		list: [],
		seq: 0
	};
	/** The next number of the one sequence that orders sends, landings and asks. */
	const tick$1 = () => ++Writes$1.seq;
	const save = () => [Writes$1.list.map((w) => ({
		...w,
		landed: w.landed && {
			...w.landed,
			showing: [...w.landed.showing]
		}
	})), Writes$1.seq];
	const restore = (x) => {
		Writes$1.list = x[0];
	};
	const showing = (r) => Writes$1.list.filter((w) => w.landed ? w.landed.showing.some((x) => x === r || x.family === r) : w.m.refreshes.includes(r.family ?? r)).sort((a, b) => (a.landed ? 0 : 1) - (b.landed ? 0 : 1) || (a.landed ? a.landed.at - b.landed.at : a.id - b.id));
	/** What `r` shows: `answer` (asked at `origin`, for `args`), or its source's overlay of the writes showing in
	* it. A landed write the answer was asked after is answered by it and retired from `r`, unless the overlay
	* keeps it. An overlay outside the shape, or one that fails, is journaled and counts as none: the answer shows. */
	function shown(r, answer, args, origin) {
		const ws = r.owned ? [] : showing(r);
		if (!ws.length) {
			r.ov = null;
			return answer;
		}
		const answered = (w) => !!w.landed && w.landed.at < origin;
		const mark = (w) => `${w.id}${w.landed ? answered(w) ? "a" : "l" : "p"}`, key = ws.map(mark).join();
		if (r.ov && r.ov.answer === answer && equal(r.ov.args, args) && r.ov.key === key) return r.ov.shown;
		let o, value = answer;
		try {
			o = data.overlay?.(r.source, args, answer, ws.map((w) => ({
				id: w.id,
				mutation: w.m.name,
				source: w.source,
				args: w.args,
				reply: w.landed?.reply,
				answered: answered(w)
			})));
		} catch (e) {
			say(`overlay ${r.name} failed, so its answer shows: ${e?.message ?? e}`);
		}
		if (o && r.type && !conforms(o.value, r.type)) {
			say(`overlay ${r.name}: outside its shape, so its answer shows`);
			o = null;
		} else if (o) {
			value = o.value;
			say(`overlay ${r.name} (${ws.length} writes)`);
		}
		const retire = ws.filter((w) => answered(w) && !o?.keep.includes(w.id));
		for (const w of retire) w.landed.showing = w.landed.showing.filter((x) => x !== r);
		if (retire.length) Writes$1.list = Writes$1.list.filter((w) => !w.landed || w.landed.showing.length);
		r.ov = {
			answer,
			args,
			key: ws.filter((w) => !retire.includes(w)).map(mark).join(),
			shown: value
		};
		return value;
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/beat.js
	function beatAfter(beat, ms, t) {
		let k = Math.max(Math.floor((t - beat) / ms) + 1, 1);
		while (k > 1 && beat + (k - 1) * ms > t) k--;
		while (beat + k * ms <= t) k++;
		return beat + k * ms;
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/request-send.js
	init_shape();
	function sendRequest(t, land, out, data, inflight, say) {
		out.push(() => {
			t.waiting = true;
			counted(t, inflight);
			const started = performance.now();
			const done = (o, more) => {
				if (t.closed) return;
				if (t.waiting && !(more && t.upload)) {
					t.waiting = false;
					counted(t, inflight);
				}
				if (o.refused) {
					t.refused = o.refused;
					return;
				}
				t.elapsed = Math.max(0, Math.round(performance.now() - started));
				if (more) {
					const ms = o.streamed ?? [o];
					t.messages += o.messages ?? ms.length;
					t.coalesced += ms.reduce((n, m) => n + (m.coalesced ?? 0), 0);
					o.more = true;
				} else {
					Open.delete(t);
					longPollEnded(t);
				}
				say(`${more ? "message" : "reply"} ${t.id}; wall ${t.elapsed} ms`);
				land(o);
			};
			if (t.req?.prefetch && !t.r) return done({
				failed: 2,
				message: "exactPrefetch requires a plain HTTP read"
			});
			const failed = (e) => done({
				failed: 1,
				message: String(e?.message ?? e)
			});
			let batch = [];
			const streamed = (m) => {
				batch.push(m);
				if (m.more) return;
				const ms = batch;
				batch = [];
				done({ streamed: ms }, true);
			};
			const open = () => {
				t.ctl = new AbortController();
				t.ctl.forced = t.forced;
				t.ctl.recount = () => counted(t, inflight);
				t.ctl.active = () => t.held() && !t.r?.gone;
				t.ctl.resource = !!t.r;
				t.ctl.owner = t.r;
				t.ctl.ticket = t.id;
				t.ctl.streamName = t.name;
				t.messages = t.coalesced = 0;
				Open.add(t);
				t.ctl.replied = () => {
					if (t.waiting) {
						t.waiting = false;
						counted(t, inflight);
					}
					longPollReplied(t);
				};
				(t.stream ? t.stream((o) => done(o, true), t.ctl) : data.fetch(t.req, streamed, t.ctl)).then(done, failed);
			};
			if (t.stream || t.req?.stream || t.req?.cancel) open();
			else if (t.req) data.fetch(t.req, void 0, { active: () => t.held() && !t.r?.gone }).then(done, failed);
			else {
				t.late = open;
				trackAnswer(t);
				t.promise.then((v) => t.stream || done({ v }), (e) => t.stream || done({
					error: String(e?.message ?? e),
					code: failureCode(e),
					reason: failureReason(e)
				}));
			}
		});
	}
	function committedCanvas(surface, active, finishes, canvas, mounts, encoding = {}) {
		return new Promise((resolve, reject) => {
			const done = (ok) => {
				if (!ok) return reject(new DOMException("the capture's commit was refused", "InvalidStateError"));
				const targets = [...mounts].filter((c) => c.name === surface && c.e.isConnected);
				Promise.resolve(canvas()).then((m) => m?.ready).then(() => {
					if (surface === void 0) return resolve();
					if (!active()) throw new DOMException("the capture's ticket is no longer held", "AbortError");
					const c = globalThis.exact?.canvas2dCapture?.(surface, targets) ?? {
						name: "NotFoundError",
						message: `no canvas of surface ${JSON.stringify(surface)} is mounted`
					};
					if (c.name) return resolve(c);
					const blob = c.encode(encoding.type, encoding.quality);
					blob.catch(() => {});
					resolve({
						...c,
						encoded: () => blob
					});
				}).catch(reject);
			};
			if (finishes) finishes.push(done);
			else done(true);
		});
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/generation-reload.js
	function reloadOnGone(win = globalThis) {
		if (typeof win.addEventListener !== "function" || !win.location) return false;
		const KEY = "exact.generation-reload", gone = (url) => typeof url === "string" && url.includes("/.exact/gen/");
		const again = () => {
			try {
				if (win.sessionStorage.getItem(KEY)) return;
				win.sessionStorage.setItem(KEY, "1");
			} catch {
				return;
			}
			win.location.reload();
		};
		const failed = (reason) => {
			const m = String(reason?.message ?? reason ?? "");
			if (/dynamically imported module|module script failed/i.test(m) && gone(m)) again();
		};
		win.addEventListener("unhandledrejection", (e) => failed(e.reason));
		(win.exact ??= {}).generationGone = failed;
		win.addEventListener("error", (e) => {
			const t = e.target;
			if (t && t !== win && gone(t.src ?? t.href)) again();
		}, true);
		win.setTimeout?.(() => {
			try {
				win.sessionStorage.removeItem(KEY);
			} catch {}
		}, 1e4);
		return true;
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/elements.js
	let Invokers = /* @__PURE__ */ new Map();
	const invocationAttrs = /* @__PURE__ */ new Set(["popovertarget", "commandfor"]);
	const suppressedInvocation = (e, name) => Invokers.has(e) && invocationAttrs.has(name);
	function muteInvoker(e) {
		if (Invokers.has(e)) return;
		const values = new Map([...invocationAttrs].map((k) => [k, e.getAttribute(k)]));
		const set = e.setAttribute, remove = e.removeAttribute;
		const setOwn = Object.getOwnPropertyDescriptor(e, "setAttribute");
		const removeOwn = Object.getOwnPropertyDescriptor(e, "removeAttribute");
		for (const k of invocationAttrs) remove.call(e, k);
		e.setAttribute = function(k, v) {
			k = String(k).toLowerCase();
			if (invocationAttrs.has(k)) values.set(k, String(v));
			else set.call(this, k, v);
		};
		e.removeAttribute = function(k) {
			k = String(k).toLowerCase();
			if (invocationAttrs.has(k)) values.set(k, null);
			else remove.call(this, k);
		};
		Invokers.set(e, () => {
			if (setOwn) Object.defineProperty(e, "setAttribute", setOwn);
			else delete e.setAttribute;
			if (removeOwn) Object.defineProperty(e, "removeAttribute", removeOwn);
			else delete e.removeAttribute;
			for (const [k, v] of values) if (v == null) remove.call(e, k);
			else set.call(e, k, v);
		});
	}
	function oneActivation(e) {
		const click = e.click;
		e.click = function() {
			const outer = Invokers, nodes = [...outer.keys()];
			for (const restore of outer.values()) restore();
			Invokers = /* @__PURE__ */ new Map();
			try {
				return click.call(this);
			} finally {
				for (const restore of Invokers.values()) restore();
				outer.clear();
				Invokers = outer;
				for (const node of nodes) muteInvoker(node);
			}
		};
		e.addEventListener("click", (ev) => {
			if (ev.composedPath().find((n) => n.localName === "button" || n.localName === "a" && n.hasAttribute("href")) === e) return;
			muteInvoker(e);
			const scope = Invokers;
			setTimeout(() => {
				if (Invokers !== scope) return;
				for (const restore of scope.values()) restore();
				Invokers = /* @__PURE__ */ new Map();
			});
		}, true);
	}
	let Release;
	const releaseAsset = (k, v) => (k === "src" || k === "poster") && /^\/(assets|deck|shaders)\//.test(v ?? "") && (Release ??= (() => {
		try {
			return /^\/\.exact\/root\/web\/releases\/[0-9a-f]{64}\/$|^\/(?:[^/]+\/)*\.exact\/gen\/[0-9a-f]{32}\/$/.test(new URL(document.baseURI).pathname);
		} catch {
			return false;
		}
	})()) ? "." + v : v;
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/pointer.js
	init_navigation();
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/events.js
	init_navigation();
	let Propagating = null;
	/** A loaded piece's own handling of an event (files.js's file input): true when handled. */
	const OnHooks = {};
	function on(e, kind, f, bind) {
		const ends = kind === "close" || kind === "scrollend", go = f, wall = !clock$1.agent, own = ends ? Owner : null, pointer = kind === "pointerdown" || kind === "pointerup", run = (...a) => {
			if (pointer) return go(...a);
			const outer = Propagating;
			Propagating = null;
			try {
				return go(...a);
			} finally {
				Propagating = outer;
			}
		};
		f = (...a) => {
			const to = wall && start ? Math.max(clock$1.now, performance.now() - start) : clock$1.now;
			if (clock$1.timers.some((t) => t.due <= to && !(wall && t.frame)) || Mutations.some((m) => m.due <= to || m.next <= to)) while (advance(to, wall) === true);
			if (!ends || e.isConnected && !own?.gone) return run(...a);
		};
		const l = (t, g, capture = false) => {
			e.addEventListener(t, g, capture);
			if (ends) onEnd(() => e.removeEventListener(t, g, capture));
		};
		if (OnHooks.file && e.localName === "input" && e.type === "file" && OnHooks.file(e, kind, f)) return;
		if (e.$media && Media.MEDIA_EVENTS.has(kind)) return Media.mediaOn(e, kind, f);
		if (e.exactNative) {
			l("exact-native", (ev) => {
				if (ev.detail.kind === kind) f(...ev.detail.value == null ? [] : [ev.detail.value]);
			});
			if (kind === "message") return;
		}
		if (e.localName === "iframe" && kind === "error") return l(kind, (ev) => f(ev.detail ?? "iframe did not load"));
		return bind ? bind(e, kind, f, l) : l(kind, kind === "pictureinpictureerror" ? (ev) => f(ev.detail) : () => f());
	}
	const onPress = (e, kind, f, l) => {
		if (!e.matches("button, a[href], input, select, textarea, summary"));
		return l("click", (ev) => {
			const a = ev.target.closest?.("a[href]");
			if (a && a !== e && e.contains(a)) return;
			for (let n = ev.target; n && n !== e.parentNode; n = n.parentNode) if (n.nodeType === 1 && n.hasAttribute("disabled")) {
				ev.stopPropagation();
				return;
			}
			if (e.localName === "a" && (ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || e.target && e.target !== "_self" || e.hasAttribute("download"))) return;
			ev.stopPropagation();
			if (e.localName === "a") ev.preventDefault();
			const done = ev.detail > 0 ? press(e) : null;
			try {
				f([
					ev.shiftKey,
					ev.ctrlKey,
					ev.altKey,
					ev.metaKey,
					ev.clientX,
					ev.clientY
				]);
			} finally {
				done?.();
			}
		});
	};
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/pieces.js
	init_rt_link();
	init_navigation();
	/** A Canvas 2D surface (LLP 1056): its arguments, drawn by the data
	* module and replayed by the web host's own glue, both in `canvas2d.js`,
	* fetched two frames after the first 2D canvas mounts (a loaded
	* capability); `types` are the arguments' declared types where known. */
	let Canvas2d = null;
	const CanvasMounts = /* @__PURE__ */ new Set();
	const canvasCommitted = (surface, active = () => true, encoding = {}) => committedCanvas(surface, active, Finishes, () => Canvas2d, CanvasMounts, encoding);
	rt.canvasCommitted = canvasCommitted;
	/** When native code may load (LLP 1024 D7): after the browser's first paint entry, or two frames and 250 ms where it
	* records none (glue.js `afterNativePaint`). */
	let Painted = null;
	const painted = () => Painted ??= new Promise((r) => {
		let o;
		const done = () => {
			o?.disconnect();
			r();
		};
		try {
			o = new PerformanceObserver(() => requestAnimationFrame(done));
			o.observe({
				type: "paint",
				buffered: true
			});
		} catch {}
		requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 250)));
	});
	/** Press feedback (LLP 1061): the web host's input piece shows it, from
	* the node's own `--exact-press` (css.rs). */
	const pressFeedback = () => input();
	function input() {
		return null;
	}
	const exiting = (n) => n.nodeType === 1 && n.hasAttribute("data-exiting");
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/tree.js
	init_navigation();
	init_shape();
	/** An element under `p`: its static class, attributes and text. */
	function h(p, tag, cls, attrs, text, ns) {
		if (attrs?.["aria-keyshortcuts"] != null || attrs?.["data-exact-looks"] != null);
		if (Adopt) {
			const e = adopt(p, tag, cls, attrs);
			if (tag === "video" || tag === "audio") Media.media(e, attrs);
			if (tag === "iframe") Hooks.frame(e, attrs?.["data-app-src"]);
			if (tag === "button") oneActivation(e);
			return e;
		}
		const e = ns ? document.createElementNS(ns, tag) : document.createElement(tag), owner = listOwner(p);
		e.$exactTree = true;
		e.authoredInert = attrs?.inert !== void 0;
		if (cls !== 0) e.setAttribute("class", "c" + cls);
		let bits = 0;
		if (attrs) {
			for (const k in attrs) if (NOT_DOM.test(k)) e["$" + k] = attrs[k];
			else if (k === "autofocus") autofocusProp(e, attrs[k] !== "false");
			else {
				e.setAttribute(k, releaseAsset(k, attrs[k]));
				if (k === "data-exact-f" || k.startsWith("data-exact-f-")) bits |= Number(attrs[k]);
			}
			if (tag === "a") Links?.made(e, attrs);
			if ("data-scrolldocument" in attrs) Docs.add(e);
			if (tag === "img" && ("data-symbol-source" in attrs || "data-app-src" in attrs)) Hooks.image?.(e);
		}
		if (Paint) e.$paintFacts = bits;
		if (text !== 0) e.textContent = text;
		if (tag === "iframe") Hooks.frame(e, attrs?.["data-app-src"]);
		if (tag === "button") oneActivation(e);
		p.append(owner ? Hooks.listItem(e, owner) : e);
		if (tag === "video" || tag === "audio") Media.media(e, attrs);
		Paint?.list(e);
		return e;
	}
	var Mismatch = class extends Refusal {};
	const at$1 = (p) => p.$n === void 0 ? p.$n = p.firstChild : p.$n;
	function adopt(p, tag, cls, attrs) {
		let e = at$1(p);
		while (e && e.nodeType !== 1) e = e.nextSibling;
		const shell = e;
		if (e?.hasAttribute("data-exact-list-item")) e = listRow(e);
		if (!e || e.localName.toLowerCase() !== tag.toLowerCase()) throw new Mismatch(`adoption: expected <${tag}>, found ${e ? "<" + e.localName + ">" : "nothing"}`);
		p.$n = shell.nextSibling;
		e.$exactTree = true;
		e.authoredInert = attrs?.inert !== void 0;
		e.$paintWaiting = false;
		e.$paintFacts = null;
		e.removeAttribute("data-exact-paint");
		if (attrs?.["data-exact-progress"] !== void 0) e.style.removeProperty("justify-self");
		if (e.hasAttribute("data-view")) e.removeAttribute("data-view");
		if (attrs?.["data-exact-own-isolation"] === void 0 && !e.hasAttribute("data-exact-own-isolation") && !e.hasAttribute("data-exact-policy") && e.style.isolation) e.style.removeProperty("isolation");
		if (cls !== 0 && e.getAttribute("class") !== "c" + cls) e.setAttribute("class", "c" + cls);
		if (attrs) {
			const rendered = Links && tag === "a" ? e.getAttribute("rel") : null;
			for (const k in attrs) {
				const v = releaseAsset(k, attrs[k]);
				if (NOT_DOM.test(k)) e["$" + k] = v;
				else if (k === "autofocus") autofocusProp(e, v !== "false");
				else if (e.getAttribute(k) !== v) e.setAttribute(k, v);
			}
			if (tag === "a") Links?.made(e, attrs, rendered);
			if ("data-scrolldocument" in attrs) Docs.add(e);
			if (tag === "img" && ("data-symbol-source" in attrs || "data-app-src" in attrs)) Hooks.image?.(e);
		}
		Paint?.list(e);
		return e;
	}
	function mark(p) {
		const c = document.createComment("");
		p.insertBefore(c, at$1(p));
		return c;
	}
	const BOOL = /^(disabled|readonly|inert|checked|multiple|autoplay|controls|loop|muted|playsinline|disablepictureinpicture|disableremoteplayback|autofocus)$/;
	const NOT_DOM = /^(partition|appleAllowsBackForwardNavigationGestures|appleAllowsMagnification|appleInactiveSchedulingPolicy)$/i;
	/** A loaded piece's own handling of a prop (symbols.js's `src`): true when handled. */
	const PropHooks = {};
	if (typeof addEventListener === "function") for (const [type, on] of [["compositionstart", true], ["compositionend", false]]) addEventListener(type, (ev) => {
		ev.target.exactComposing = on;
	}, true);
	const Composing = /* @__PURE__ */ new WeakSet();
	const Held = /* @__PURE__ */ new WeakMap();
	const HeldTask = /* @__PURE__ */ new WeakMap();
	function writeValue(e, v) {
		if (e.localName === "option") {
			if (e.getAttribute("value") !== v) e.value = v;
			return;
		}
		if (!HeldTask.has(e) && (e.localName === "input" || e.localName === "textarea")) {
			HeldTask.set(e, 0);
			e.addEventListener("compositionstart", () => {
				clearTimeout(HeldTask.get(e));
				Composing.add(e);
			});
			e.addEventListener("compositionend", () => {
				HeldTask.set(e, setTimeout(() => {
					Composing.delete(e);
					if (Held.has(e)) writeValue(e, Held.get(e));
					e.exactDecorations?.sync();
				}, 0));
			});
		}
		if (e.value !== v && Composing.has(e)) return Held.set(e, v);
		Held.delete(e);
		if (e.value !== v) e.value = v;
	}
	const navigable = (v) => {
		try {
			return [
				"http:",
				"https:",
				"mailto:",
				"tel:"
			].includes(new URL(v, document.baseURI).protocol);
		} catch {
			return false;
		}
	};
	/** A dynamic prop, by the DOM name the live host uses (`applyProps`). */
	function P(e, name, f) {
		if (name === "aria-keyshortcuts");
		if (name === "data-scrolldocument") Docs.add(e);
		effect(() => {
			let v = f();
			v = releaseAsset(name, v == null ? null : typeof v === "boolean" ? String(v) : String(v));
			if (name === "tabindex") e.exactAuthoredTabIndex = v;
			if (name === "href" && v != null && (!navigable(v) || v === "")) v = null;
			if (name === "backgroundMaterial" && v === "none") v = null;
			if (PropHooks[name]?.(e, v)) return;
			if (NOT_DOM.test(name)) return void (e["$" + name] = v);
			if (e.$media && Media.mediaProp(e, name, v)) return;
			if (name === "text") {
				e.$unset = v == null;
				if (!e.childElementCount && e.textContent !== (v ?? "")) e.textContent = v ?? "";
			} else if (name === "value") {
				if (e.localName === "select") {
					Selects.add(e);
					e.$value = v ?? "";
					e.$set = true;
				}
				if (v == null && e.localName === "option") e.removeAttribute("value");
				else writeValue(e, v ?? "");
				e.exactDecorations?.sync();
			} else if (name === "scrollTop" || name === "scrollLeft") {
				if (v != null) (Scrolls.get(e) ?? Scrolls.set(e, {}).get(e))[name] = Number(v);
			} else if (BOOL.test(name)) {
				if (name === "inert") e.authoredInert = v === "true";
				if (name === "autofocus") autofocusProp(e, v === "true");
				else e.toggleAttribute(name, v === "true");
				if (name === "disabled" && v === "true" && document.activeElement === e && e.matches(":disabled")) e.blur();
				if (name === "checked") e.checked = e.$checked = v === "true";
				if (name === "muted") e.muted = v === "true";
			} else if (v == null) {
				if (e.hasAttribute(name) || suppressedInvocation(e, name)) {
					e.removeAttribute(name);
					if (name.startsWith("data-exact-")) Paint?.facts(e);
				}
			} else if (e.getAttribute(name) !== v) {
				e.setAttribute(name, v);
				if (name.startsWith("data-exact-")) Paint?.facts(e);
			}
			if (name === "role") Hooks.listRoles?.(e);
			else if (name === "popover" && e.parentElement?.hasAttribute("data-exact-list-item")) Hooks.listItem(e);
			if (e.localName === "a" && (name === "rel" || name === "target" || name === "href")) Links?.prop(e, name, v);
		});
	}
	/** Loaded pieces' hooks: `style(e, prop, value)` takes a dynamic row's write on a node the motion piece holds
	* (motion.js); `image(e)` an image built or adopted with a symbol or `app:/` source (symbols.js); `frame(e, v)` an
	* iframe's app file (iframes.js); `listItem(e, owner)` and `listRoles(e)` a List's row and its role (list-items.js). */
	const Hooks = {};
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/mount.js
	init_navigation();
	init_shape();
	let Booting = false;
	let start = 0;
	let Adopt = false;
	let AdoptedLists = /* @__PURE__ */ new Set();
	function range(p) {
		if (Adopt) return [mark(p), null];
		const a = document.createComment(""), b = document.createComment("");
		p.append(a, b);
		return [a, b];
	}
	function leave(n) {
		const shell = n.nodeType === 1 && n.hasAttribute("data-exact-list-item") ? n : null;
		n = shell ? listRow(shell) : n;
		if (n && !exiting(n)) sheetLeaves(n) || n.remove();
		if (shell?.parentNode) unwrapListItem(shell);
	}
	function clear(a, b) {
		Paint?.list(a.parentNode);
		for (let n = a.nextSibling; n !== b;) {
			const m = n.nextSibling;
			leave(n);
			n = m;
		}
	}
	function build(b, f, own) {
		const frag = document.createDocumentFragment();
		frag.$listOwner = listOwner(b.parentNode);
		const s = scope(() => f(frag), own);
		b.before(frag);
		Paint?.list(b.parentNode);
		return s;
	}
	/** A region's first arm while adopting: built in place, then its end anchor. */
	function adoptArm(p, f, own) {
		return [f ? scope(() => f(p), own) : null, mark(p)];
	}
	/** `when`: arm 0 while the subject holds, else arm 1 (or nothing). */
	function when(p, subject, a0, a1) {
		let [a, b] = range(p), own = Owner;
		let arm = -1, s = null;
		effect(() => {
			const want = subject() ? 0 : a1 ? 1 : -1;
			if (want === arm) return;
			arm = want;
			const view = presentArm(want < 0 ? null : want ? a1 : a0, subject, want);
			if (!b) return untracked(() => {
				[s, b] = adoptArm(p, view, own);
			});
			untracked(() => {
				if (s) end(s);
				clear(a, b);
				s = view ? build(b, view, own) : null;
			});
		}).$r = () => [a, b];
	}
	/** `each`: rows by key in item order; a kept row keeps its elements, its
	* item and position are signals its bindings read. */
	function each(p, list, key, row, pure) {
		row = presentRows(row, list, key);
		let [a, b] = range(p), own = Owner;
		let rows = /* @__PURE__ */ new Map(), single = false, order = null;
		effect(() => {
			const items = list(), parent = b?.parentNode ?? p;
			const keys = pure ? null : items.map((item, i) => key(() => item, () => i)), keyAt = (i) => keys ? keys[i] : key(() => items[i], () => i);
			untracked(() => {
				if (b) p = a.parentNode;
				if (b && LazyAt < Lazy.length) adoptAll();
				if (pure && order && items.length === order.length) {
					let i = 0;
					for (; i < items.length; i++) {
						const item = items[i], r = order[i];
						if (r.item.n.v === item) continue;
						if (rowKey(keyAt(i)) !== r.k) break;
						writeItem(r.item.n, item);
					}
					if (i === items.length) return;
				}
				const next = /* @__PURE__ */ new Map(), seen = /* @__PURE__ */ new Map();
				items.forEach((item, i) => {
					const k = rowKey(keyAt(i), next, seen);
					if (k.startsWith("d")) journal$1.push(`each: repeated key ${k}`);
					let r = rows.get(k);
					if (r) {
						rows.delete(k);
						r.old = r.at;
						if (!Object.is(r.item.n.v, item)) writeItem(r.item.n, item);
						if (r.index.n.v !== i) write(r.index.n, i);
					} else if (!b) {
						r = {
							k,
							item: sig(item),
							index: sig(i)
						};
						AdoptedLists.add(p);
						if (single && i && performance.now() > AdoptBy) {
							let e = at$1(p);
							while (e && e.nodeType !== 1) e = e.nextSibling;
							if (!e) throw new Mismatch(`adoption: expected a row, found nothing`);
							p.$n = e.nextSibling;
							r.start = r.end = e;
							lazy([
								p,
								r,
								row,
								own
							]);
						} else {
							const next = at$1(p), last = next ? next.previousSibling : p.lastChild;
							r.s = scope(() => row(p, r.item, r.index, r.k), own);
							const first = last ? last.nextSibling : p.firstChild;
							if (first && first.nodeType === 1 && first.nextSibling === at$1(p)) r.start = r.end = first;
							else {
								r.start = document.createComment("");
								p.insertBefore(r.start, first ?? at$1(p));
								r.end = mark(p);
							}
							if (!i) single = r.start.nodeType === 1;
						}
					} else {
						r = {
							k,
							item: sig(item),
							index: sig(i)
						};
						const frag = document.createDocumentFragment();
						frag.$listOwner = listOwner(parent);
						r.s = scope(() => row(frag, r.item, r.index, r.k), own);
						if (frag.childNodes.length === 1 && frag.firstChild.nodeType === 1) r.start = r.end = frag.firstChild;
						else {
							r.start = document.createComment("");
							r.end = document.createComment("");
							frag.prepend(r.start);
							frag.append(r.end);
						}
						r.frag = frag;
					}
					r.k = k;
					next.set(k, r);
				});
				const list = order = [...next.values()];
				for (let i = 0; i < list.length; i++) list[i].at = i;
				if (rows.size && b && list.every((r) => r.frag) && !a.previousSibling && !b.nextSibling && !viewChildren(parent).some((r) => r.getAttribute("navigationPresentation") === "modal")) {
					endAll(rows);
					parent.textContent = "";
					parent.append(a, b);
				} else if (rows.size) {
					endAll(rows);
					for (const r of rows.values()) {
						let n = r.start;
						while (n) {
							const m = n.nextSibling;
							leave(n);
							if (n === r.end) break;
							n = m;
						}
					}
				}
				if (b) {
					const stay = inOrder(list);
					let anchor = b, batch = null, first = null;
					const flush = () => {
						if (batch) {
							parent.insertBefore(batch, anchor);
							anchor = first;
							batch = null;
						}
					};
					for (let i = list.length - 1; i >= 0; i--) {
						const r = list[i];
						if (r.frag) {
							if (batch) batch.prepend(r.frag);
							else batch = r.frag;
							first = r.start;
							r.frag = null;
							continue;
						}
						flush();
						if (!stay.has(i)) {
							const f = document.createDocumentFragment();
							let n = r.start;
							while (n) {
								const m = n.nextSibling;
								f.append(n);
								if (n === r.end) break;
								n = m;
							}
							parent.insertBefore(f, anchor);
						}
						anchor = r.start;
					}
					flush();
				}
				rows = next;
				Paint?.list(parent);
				b ??= mark(p);
			});
		}).$r = () => [a, b];
	}
	const ADOPT_MS = 16;
	const SLICE_MS = 8;
	let AdoptBy = Infinity;
	const Lazy = [];
	const LazyRows = /* @__PURE__ */ new Map();
	let LazyAt = 0;
	const LAZY_EVENTS = [
		"pointerdown",
		"mousedown",
		"touchstart",
		"click",
		"keydown",
		"beforeinput",
		"input",
		"change",
		"focusin"
	];
	const LAZY_OPTS = {
		capture: true,
		passive: true
	};
	function lazy(x) {
		Paint?.wait(x[1].start);
		Lazy.push(x);
		LazyRows.set(x[1].start, x);
	}
	function adoptLazy(x) {
		const [p, r, row, own] = x;
		LazyRows.delete(r.start);
		if (r.s || own?.gone || !r.start.isConnected) return;
		const save = p.$n, a = Adopt;
		p.$n = r.start;
		Adopt = true;
		try {
			r.s = scope(() => row(p, r.item, r.index, r.k), own);
		} catch (e) {
			if (!(e instanceof Mismatch)) throw e;
			say(`each: a row built afresh: ${e.message}`);
			Adopt = false;
			const frag = document.createDocumentFragment(), old = r.start;
			frag.$listOwner = listOwner(p);
			r.s = scope(() => row(frag, r.item, r.index, r.k), own);
			if (frag.childNodes.length === 1 && frag.firstChild.nodeType === 1) r.start = r.end = frag.firstChild;
			else {
				r.start = document.createComment("");
				r.end = document.createComment("");
				frag.prepend(r.start);
				frag.append(r.end);
			}
			old.replaceWith(frag);
		} finally {
			Adopt = a;
			p.$n = save;
		}
	}
	function adoptAll() {
		while (LazyAt < Lazy.length) adoptLazy(Lazy[LazyAt++]);
		lazyDone();
	}
	function lazyDone() {
		if (LazyAt < Lazy.length || !Lazy.length) return;
		Lazy.length = LazyAt = 0;
		LazyRows.clear();
		inflight.n--;
		const root = document.getElementById("exact-root");
		for (const t of LAZY_EVENTS) root?.removeEventListener(t, onLazy, LAZY_OPTS);
	}
	function adoptAt(target) {
		for (let n = target; n && n.nodeType === 1; n = n.parentNode) {
			const x = LazyRows.get(n);
			if (x) {
				adoptLazy(x);
				Paint?.flush();
				break;
			}
		}
	}
	const onLazy = (ev) => adoptAt(ev.target);
	function slice() {
		const end = performance.now() + SLICE_MS;
		while (LazyAt < Lazy.length && performance.now() < end) adoptLazy(Lazy[LazyAt++]);
		Paint?.flush();
		if (LazyAt < Lazy.length) post(slice);
		else lazyDone();
	}
	const post = (f) => globalThis.scheduler?.postTask ? scheduler.postTask(f, { priority: "user-visible" }) : setTimeout(f);
	/** Build the view into `#exact-root` and start the clock. */
	function mount(f) {
		const root = document.getElementById("exact-root");
		root?.addEventListener("pointerdown", (ev) => {
			const t = ev.target;
			if (!(t.closest?.("input, textarea, select") || t.isContentEditable) && t.closest?.("[retainFocus=\"true\"]")) ev.preventDefault();
		});
		clock$1.agent = agentMode();
		if (!clock$1.agent && typeof window !== "undefined") reloadOnGone(window);
		Store.load();
		if (Store.map.size && checkpoint().kept) {
			for (const r of Resources) if (r.store) r.baked = true;
		}
		let built = false;
		Adopt = !!(checkpoint().kept && root.firstElementChild);
		start = clock$1.start = performance.now() - clock$1.now;
		const adopting = Adopt;
		const early = globalThis.exact?.taps?.() ?? [];
		const shown = early.filter((t) => t.type !== "click").map((t) => [
			t.target,
			t.target.value,
			t.target.checked
		]);
		AdoptBy = performance.now() + ADOPT_MS;
		Booting = true;
		let booted = commit(() => {
			scope(() => f(root));
			for (const p of AdoptedLists) {
				let n = at$1(p);
				while (n && n.nodeType !== 1) n = n.nextSibling;
				if (n) throw new Mismatch("adoption: a list's document holds more rows than its items");
			}
			built = true;
		}, adopting ? "adopt" : "boot");
		AdoptedLists.clear();
		Adopt = false;
		AdoptBy = Infinity;
		if (!built) {
			Lazy.length = LazyAt = 0;
			LazyRows.clear();
		}
		const adopted = adopting && built;
		if (!built && adopting) {
			say(`adoption abandoned ${Why}`);
			root.textContent = "";
			booted = commit(() => {
				scope(() => f(root));
				built = true;
			}, "boot");
		}
		Booting = false;
		if (!built || booted === false) {
			root.textContent = "";
			throw new Error(`boot refused ${Why}`);
		}
		say(`boot: ${root.getElementsByTagName("*").length} nodes, epoch ${clock$1.epoch}`);
		if (adopted) say("adopted the document");
		autofocus(root);
		if (Lazy.length) {
			inflight.n++;
			for (const t of LAZY_EVENTS) root.addEventListener(t, onLazy, LAZY_OPTS);
			post(slice);
		}
		root.dataset.bootMs = String(Math.round(performance.now()));
		for (const t of early) adoptAt(t.target);
		for (const [e, v, c] of shown) if (e.isConnected) {
			if (e.type === "checkbox" || e.type === "radio") e.checked = c;
			else if (e.type !== "file") e.value = v;
		}
		for (const t of early) if (t.target.isConnected) t.type === "click" ? t.target.click() : t.target.dispatchEvent(new Event(t.type, { bubbles: true }));
	}
	/** The page's checkpoint (LLP 1048.000 D6): the time the render stopped at, and by resource name the `source` and
	* `answers` its document used, each `[args, value, open, reads]`: one, or a list's elements', where a new element
	* looks first at `next`. */
	let Checkpoint = null;
	let READER = /* @__PURE__ */ new Set(["exactViewport", "exactPage"]);
	function checkpoint() {
		if (Checkpoint) return Checkpoint;
		Checkpoint = { kept: null };
		const el = typeof document !== "undefined" && document.querySelector("script[type=\"application/vnd.exact.checkpoint\"]");
		if (!el) return Checkpoint;
		const cp = JSON.parse(el.textContent), open = new Set(cp.open), readers = new Set(cp.readers);
		Checkpoint.revalidate = !!cp.revalidate;
		Checkpoint.kept = /* @__PURE__ */ new Map();
		cp.answers.forEach(([name, source, args, value], k) => {
			if (!Checkpoint.kept.has(name)) Checkpoint.kept.set(name, {
				source,
				answers: [],
				next: 0
			});
			Checkpoint.kept.get(name).answers.push([
				value_(args),
				value_(value),
				open.has(k),
				readers.has(k)
			]);
		});
		const driven = typeof location !== "undefined" && new URLSearchParams(location.search).has("agent") && false;
		Checkpoint.time = clock$1.now = driven ? 0 : cp.time || 0;
		return Checkpoint;
	}
	/** A declared resource's page answer when it names `source` and fits `type` (a list's element's: each.js
	* `keptMember`). */
	function keptAnswer(name, source, type) {
		const kept = checkpoint().kept?.get(name), answer = kept?.source === source ? kept.answers[0] : void 0;
		return answer && (!type || conforms(answer[1], type)) ? answer : void 0;
	}
	/** A checkpoint value (`push_value`, host/web/src/page.rs) as a runtime value: lists and records are arrays, unit and
	* `none` null, `some(v)` v. */
	const value_ = (v) => v === null || typeof v !== "object" ? v : Array.isArray(v) ? v.map(value_) : "r" in v ? v.r.map(value_) : "s" in v ? value_(v.s) : "n" in v ? Number(v.n) : null;
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/resources.js
	init_shape();
	/** Resource instances, including list members; list aggregates have no entry. */
	const Resources = [];
	let ResourceIndex = 0;
	let Ticket = 0;
	/** What its resource reads (a watched topic, ts-data.js `changed`, LLP 1016.002 D4; the store, `lateReaders`) changed
	* while ticket `t` was in flight (`t.again`): its reply landed or failed, so the resource is asked again. */
	const again = (t) => {
		if (t.again) {
			t.again = false;
			say(`${t.r.name}: asked again, what it reads changed while ticket ${t.id} was in flight`);
			R(t.r, true);
		}
	};
	const openEnded = (t) => !!(t.stream || t.req?.stream || t.req?.longPoll || t.call?.held > 0);
	const reads = (r) => r.store || !!r.ticket?.call?.seen?.read;
	const lateReaders = () => {
		for (const r of Resources) if (reads(r) && r.ticket && !openEnded(r.ticket)) r.ticket.again = true;
	};
	const lateIdle = () => {
		for (const r of Resources) if (reads(r) && (!r.ticket || openEnded(r.ticket))) R(r, true);
	};
	const sameReq = (a, b) => a && b && !a.canvas && !b.canvas && a.scope === b.scope && a.storage === b.storage && a.method === b.method && a.url === b.url && a.body === b.body && JSON.stringify(a.headers) === JSON.stringify(b.headers) && a.http === b.http && a.cache === b.cache && JSON.stringify(a.longPoll) === JSON.stringify(b.longPoll);
	const send = (t, land) => sendRequest(t, land, Out, data, inflight, say);
	function ask(source, args, name, mutation, forced, owner = mutation) {
		checkArguments(name, args);
		if (mutation) mutation.requests++;
		if ([
			"startActivity",
			"updateActivity",
			"endActivity"
		].includes(source)) throw new Refusal(`${source} is not linked into this artifact`);
		let a;
		try {
			a = data.reserved?.[source] ? ((v) => v?.then ? v : { v })(data.reserved[source](source, args, name, forced)) : data.answer(source, args, Store, name, !!mutation, forced, owner);
		} catch (e) {
			Out.push(...data.thrown?.() ?? []);
			throw e;
		}
		return a && a.then ? (a.then(void 0, (e) => globalThis.exact?.generationGone?.(e)), {
			promise: a,
			call: a.call
		}) : a;
	}
	/** The reply to ticket `t` while its target `held()` it: a commit in which `f` takes the source's answer (a TypeScript
	* promise's value, or the parse of the outcome). Any refusal spends the reply: the ticket goes in a commit of its own,
	* as the runner's `release_failed` (admission.rs), so a derive's refusal cannot leave it pending forever. */
	function reply(t, name, source, held, f, next, gone) {
		t.held = held;
		if (t.call) t.call.wanted = held;
		return (o) => Origin.run(t.askOrigin, () => Invocation.run(t.invocation, () => {
			if (commit(() => {
				if (!held()) return say(`dropped reply for ${name}: ticket ${t.id} is no longer held`);
				let p;
				try {
					if (o.error !== void 0) throw new Failed(o.error, o.code, o.reason);
					p = o.v !== void 0 ? { v: o.v } : data.parse(source, t.args, o, Store, t.req);
				} catch (e) {
					throw e instanceof Failed ? e : new Failed(String(e?.message ?? e), failureCode(e), failureReason(e));
				}
				Out.push(...p.effects ?? []);
				f(p, o);
				Out.push(...o.effects ?? []);
			}, `${o.more ? "message" : "reply"} ${name}; wall ${t.elapsed} ms`) !== false || !held()) return;
			const failed = `request ${t.id} (${name}) failed and is no longer pending: ${next}: ${Refused?.message ?? Refused}`;
			say(failed);
			console.error(`exact: ${failed}`);
			gone(Refused.message, Refused.code, Refused.reason);
			recommit(() => {
				if (t.r) again(t);
			}, "a failed request");
		}));
	}
	const revalidated = (name, same) => `${name} answered: ${same ? "equal to its build-time answer" : "replaces its build-time answer"}`;
	/** A resource: its value, the arguments it settled with, one ticket in flight. A bake's answer is a first frame:
	* `baked` asks at launch, as a native runner at `data_ready` (LLP 1048.003 D6; feed F24); a document's `kept` was asked
	* for its page, and is asked again when the page lists it as `open`, or when it read the store and the device's store
	* holds the app's own entries; one that read the store is a store reader's (LLP 1048.000 D6). `carried`: settled, not
	* a bake to ask again — a dev reload's (checkpoint.js), an `else` row's (emit.rs); `kept`: the page's answer it
	* starts from, a list element's as each.js finds it. */
	function res(name, source, args, initial, initialArgs, type, ph, carried = false, kept = keptAnswer(name, source, type)) {
		const ver = sig(0), pend = sig(false), fail = sig(null), cur = sig(false);
		if (kept) [initialArgs, initial] = kept;
		const r = {
			index: ResourceIndex++,
			name,
			source,
			type,
			value: initial,
			settled: initialArgs,
			pending: pend,
			baked: kept ? READER.has(source) || checkpoint().revalidate || kept[2] || kept[3] && Store.map.size > 0 : !carried && initialArgs !== void 0,
			ticket: null,
			forced: false,
			rev: false,
			store: !!kept?.[3],
			origin: 0,
			marks: [],
			context: args.context ?? 0
		};
		Inspections.track(r, !kept && !carried, () => pend.n.v);
		const flag = (s, v, undo) => {
			if (!eq(s.n.v, v)) {
				undo?.push([s.n, s.n.v]);
				write(s.n, v);
			}
		}, release = () => {
			if (r.ticket) {
				Invocation.letGo(r.ticket);
				say(`forget ticket ${r.ticket.id} (${name})`);
				r.ticket = null;
			}
			flag(pend, false);
		}, fails = (args, error, code, reason) => {
			r.failed = args;
			r.error = error;
			r.code = code;
			r.reason = reason;
			flag(fail, failure());
			release();
			say(`resource ${name} failed: ${error}`);
			Inspections.fail(r);
			return r.value;
		}, failure = () => r.failed ? [
			r.failed,
			r.code ?? "error",
			r.error ?? "it failed",
			r.reason ?? ""
		] : null;
		const hold = () => {
			if (r.value !== void 0) return;
			r.placeholder = true;
			const v = typeof ph === "function" ? ph() : ph;
			if (v === void 0) throw new Failed(`${name} answers later and has nothing to show; give it an \`else\``);
			r.value = v;
			Inspections.placeholder(r);
		};
		const id = (a) => a?.slice(0, Math.max(0, a.length - r.context)), asleep = () => {
			r.asleep = r.slept = true;
			r.forced = r.rev = r.reconciling = false;
			if (!r.ticket?.upload) release();
			if (r.failed) {
				r.failed = null;
				r.error = r.code = r.reason = void 0;
			}
			flag(fail, failure());
			hold();
			return r.value;
		};
		const take = (v, a, origin, generation) => {
			if (type && !conforms(v, type, [0], r.checked)) throw new Failed(loneSurrogate(v) ? `${name}: result string contains a lone surrogate` : `${name}: the answer does not conform to its shape`, "shape");
			r.checked = v;
			r.value = v;
			r.settled = a;
			r.origin = origin;
			r.placeholder = false;
			r.slept = false;
			Inspections.take(r, generation);
		};
		const land = (t) => reply(t, name, source, () => r.ticket === t, ...data.uploads.ends(r, t, (p, o) => {
			if (t.call?.seen?.read || p.store) r.store = t.read = true;
			if (p.req) {
				const req = {
					...p.req,
					forced: t.forced,
					origin: t.req?.origin
				};
				if (o.more) {
					const n = {
						id: ++Ticket,
						name,
						owner: r,
						invocation: t.invocation,
						askOrigin: t.askOrigin,
						args: t.args,
						forced: t.forced,
						req,
						r,
						origin: t.origin,
						generation: t.generation
					};
					r.ticket = n;
					send(n, land(n));
				} else {
					t.req = req;
					t.id = ++Ticket;
					send(t, land(t));
				}
				return;
			}
			if (t.baked) say(revalidated(name, eq(p.v, r.value)));
			t.baked = false;
			take(p.v, t.args, t.origin, t.generation);
			r.failed = null;
			r.error = r.code = r.reason = void 0;
			if (!o.more) r.ticket = null;
			again(t);
			W(pend, !!(o.more && t.upload));
			W(fail, null);
			W(ver, ver.n.v + 1);
		}, "it keeps its last value", (error, code, reason) => {
			if (t.call?.seen?.read || t.read || data.threwRead?.()) r.store = true;
			r.ticket = null;
			r.failed = t.args;
			r.error = error;
			r.code = code;
			r.reason = reason;
			write(pend.n, false);
			write(fail.n, failure());
			Inspections.fail(r);
		}));
		const m = memo(() => {
			const shown$2 = shown(r, (() => {
				ver();
				if (args.gate && !args.gate()) return asleep();
				if (r.asleep) {
					r.asleep = false;
					r.forced = true;
				}
				const a = r.asked = args();
				if (Restoring) return flag(fail, failure()), r.value;
				const forced = r.forced > 0, reasking = r.forced > 1, waited = r.launch, rev = r.rev, reconciling = r.reconciling, mk = finiteArguments(a) ? data.uploads.at(r, a) : null;
				r.forced = r.rev = r.reconciling = false;
				if (forced) r.launch = void 0;
				if (r.failed && (forced && !mk?.failed || !unchangedArguments(a, r.failed))) {
					r.failed = null;
					r.error = r.code = r.reason = void 0;
				}
				flag(fail, failure());
				if (r.failed) return r.value;
				try {
					checkArguments(name, a);
				} catch (e) {
					if (!reconciling) throw e;
					return fails(a, e.message, failureCode(e), failureReason(e));
				}
				if (mk) return data.uploads.answer(r, mk, a, {
					take,
					fails,
					release
				});
				const baked = r.baked;
				r.baked = false;
				if (!forced && !rev) {
					if (!r.ticket && r.settled !== void 0 && equal(a, r.settled) && !baked) return r.value;
					if (r.ticket && equal(a, r.ticket.args)) return r.value;
				}
				let ans;
				Inspections.begin(r);
				const refresh = forced && waited !== true;
				const invocation = reasking ? 0 : Invocation.id, origin = reasking ? r.askOrigin ?? "app" : Origin.now();
				try {
					ans = Origin.run(origin, () => Invocation.run(invocation, () => ask(source, a, name, false, refresh, r)));
					Out.push(...ans?.effects ?? []);
				} catch (e) {
					if (data.threwRead?.()) r.store = true;
					for (const t of data.threwWatches?.() ?? []) (r.watches ??= /* @__PURE__ */ new Set()).add(t);
					if (e instanceof Refusal && !(reconciling && e instanceof Failed)) throw e;
					if (e.refuse && !reconciling) throw new Failed(`resource ${name}: ${e.message}`);
					hold();
					return Invocation.run(invocation, () => fails(a, String(e?.message ?? e), failureCode(e), failureReason(e)));
				}
				if (ans && ans.store) r.store = true;
				r.watches = ans?.watches;
				if (ans && "v" in ans) {
					if (baked) say(revalidated(name, eq(ans.v, r.value)));
					try {
						take(ans.v, a, tick$1());
					} catch (e) {
						if (!reconciling) throw e;
						return Invocation.run(invocation, () => fails(a, String(e?.message ?? e), "shape"));
					}
					if (r.ticket) {
						Invocation.run(invocation, () => Invocation.letGo(r.ticket));
						say(`forget ticket ${r.ticket.id} (${name})`);
						r.ticket = null;
					}
					if (!r.ticket) flag(pend, false);
					return r.value;
				}
				if (ans && !forced && !rev && r.ticket && !equal(a, r.ticket.args) && (ans.req && r.ticket.req && sameReq(ans.req, r.ticket.req) || ans.upload && ans.upload === r.ticket.upload)) {
					say(`keep request ${r.ticket.id} (${name}): the same request for newer arguments`);
					r.ticket.args = a;
					r.ticket.generation = r.inspection?.request;
					return data.uploads.kept(r, a);
				}
				if (ans && (ans.req || ans.promise || ans.stream)) {
					hold();
					const t = {
						id: ++Ticket,
						name,
						owner: r,
						invocation,
						askOrigin: origin,
						args: a,
						forced: refresh,
						req: ans.req && {
							...ans.req,
							forced: refresh,
							origin
						},
						promise: ans.promise,
						call: ans.call,
						stream: ans.stream,
						upload: ans.upload,
						baked,
						r,
						origin: tick$1(),
						generation: r.inspection?.request
					};
					if (t.call) t.call.ticket = t;
					r.askOrigin = origin;
					if (baked) say(`${name} shows its build-time answer until its source answers`);
					if (r.ticket) {
						Invocation.run(invocation, () => Invocation.letGo(r.ticket));
						say(`forget ticket ${r.ticket.id} (${name})`);
					}
					r.ticket = t;
					flag(pend, true);
					send(t, land(t));
					return r.value;
				}
				const shown = baked && eq(a, r.settled);
				r.launch = !forced && waited !== false;
				if (!shown) {
					hold();
					flag(pend, true);
				}
				if (!r.waiting) {
					r.waiting = true;
					data.ready(() => {
						r.waiting = false;
						r.forced = r.reconciling = true;
						r.baked ||= shown;
						recommit(() => {
							r.ov = null;
							W(ver, ver.n.v + 1);
							W(pend, false);
						}, `data ready ${name}`);
					});
				}
				return r.value;
			})(), r.settled ?? r.asked, r.origin);
			flag(cur, !r.placeholder && !r.slept && r.settled !== void 0 && r.asked !== void 0 && equal(id(r.settled), id(r.asked)));
			return shown$2;
		}, type);
		Object.assign(r, {
			save: () => [
				r.value,
				r.settled,
				r.ticket,
				r.ticket?.args,
				r.store,
				r.failed,
				r.baked,
				r.error,
				r.ticket?.again,
				r.code,
				r.origin,
				r.forced,
				r.reconciling,
				r.rev,
				r.reason,
				r.inspection && { ...r.inspection },
				r.ticket?.generation,
				r.marks,
				r.placeholder,
				pend.n.v,
				r.asleep,
				r.slept,
				r.watches,
				r.launch,
				r.askOrigin
			],
			restore: (x) => {
				[r.value, r.settled, r.ticket] = x;
				if (r.ticket) {
					r.ticket.args = x[3];
					r.ticket.again = x[8];
					r.ticket.generation = x[16];
				}
				r.store = x[4];
				r.failed = x[5];
				r.baked = x[6];
				r.error = x[7];
				r.code = x[9];
				r.origin = x[10];
				r.forced = x[11];
				r.reconciling = x[12];
				r.rev = x[13];
				r.reason = x[14];
				r.inspection = x[15];
				r.marks = x[17];
				r.placeholder = x[18];
				r.asleep = x[20];
				r.slept = x[21];
				r.watches = x[22];
				r.launch = x[23];
				r.askOrigin = x[24];
				write(pend.n, x[19]);
				write(ver.n, ver.n.v + 1);
			},
			force: (undo, reasking) => {
				r.forced = reasking ? 2 : true;
				r.launch = false;
				flag(ver, ver.n.v + 1, undo);
			},
			touch: (undo) => flag(ver, ver.n.v + 1, undo),
			reconcile: (undo) => {
				r.forced = r.reconciling = true;
				r.launch = false;
				flag(ver, ver.n.v + 1, undo);
			},
			revise: (undo) => {
				r.rev = true;
				flag(ver, ver.n.v + 1, undo);
			},
			giveUp: (why) => {
				r.baked = r.forced = r.reconciling = r.launch = false;
				fails(r.asked ?? [], why, "error");
			}
		});
		onEnd(() => {
			r.gone = true;
		});
		Resources.push(r);
		m.p = () => (m(), pend());
		m.c = () => (m(), cur());
		m.f = () => (m(), fail() != null);
		m.e = () => {
			m();
			const f = fail();
			return f ? [
				f[3] || f[1],
				f[2],
				f[3]
			] : null;
		};
		m.n.resource = r;
		m.r = r;
		return m;
	}
	/** A mutation (LLP 1016): its slot, resources, and newest-winning ticket — or (`mode` 1), a `queue` (LLP 1092), one
	* ticket and the sends waiting their turn (`wait`, schedule.js), each asked at its `next`; or (`mode` 2), `parallel`
	* (LLP 1161.000), a ticket per send in flight (`tickets`), numbered in send order (`send`), the slot and failure
	* following the latest to conclude (`concluded`, runner parallel.rs). */
	const Mutations = [];
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/clock.js
	init_rt_link();
	const clock$1 = {
		now: 0,
		timers: [],
		agent: false,
		epoch: 0
	};
	let Timing = false;
	let Instant = null;
	const armedAt = () => Instant ?? clock$1.now;
	function time() {
		if (!clock$1.agent && !Timing && start) clock$1.now = Math.max(clock$1.now, performance.now() - start);
	}
	/** Whether the agent drives this page (or a render does): the clock is then the driver's. */
	const agentMode = () => true;
	let Order = 0;
	const Tasks = [];
	/** A timer: `every(ms, action, once)`, due from mount; `i` its plan order, which breaks ties (schedule.js inserts by
	* it). */
	function every(ms, action, once, name, wait = 0, max = 0, tolerance = 0) {
		clock$1.timers.push({
			due: clock$1.now + ms,
			ms,
			action,
			once,
			name,
			wait,
			max,
			tolerance,
			i: Order++
		});
		Tasks.push(clock$1.timers.at(-1));
		if (!clock$1.agent) drive();
	}
	const vf = (base, k) => base + k * 1e3 / 60;
	/** Move the clock to `to`, firing each due timer and armed `then` at its own time, in order; a seek fires frame tasks'
	* virtual frames too, the wall clock's (`wall`) none. `stop()`, asked after each, ends it there (the agent's: one that
	* sent a request): true. A change receipt boundary also yields true; resume toward the same `to`. A refusal or 4096
	* commits stops there; a non-finite `to` (NonFiniteClock) leaves the clock where it was: its journal line, as the
	* runner's error. Under the agent the journal gets the runner's line for an advance that fired. `timers` false runs
	* only armed `then`s and change actions, at `to` = now, as an agent's input ends (Runner::land_then; trivia F3). */
	function advance(to, wall, stop, timers = true) {
		if (!Number.isFinite(to)) return say(`refused advance: NonFiniteClock (${to})`), journal$1.at(-1);
		if (Poisoned) return say("refused advance: Poisoned"), journal$1.at(-1);
		to = rt.timerWait?.cutoff(to, wall) ?? to;
		if (to >= clock$1.now) clock$1.listedDue?.(to);
		let fired = 0, stopped = false;
		for (;;) {
			let next = null, then = null, head = null;
			const execution = (t) => t.change ? Math.max(t.due, clock$1.now) : rt.timerWait?.execution(t, wall) ?? t.due, priority = (t) => t.hatch || t.data ? 2 : t.wait === 4 ? 1 : 0;
			if (!clock$1.stopped) {
				for (const t of clock$1.timers) if ((timers || t.change) && (!t.change || t.ready) && execution(t) <= to && !(wall && t.frame) && (!next || execution(t) < execution(next) || execution(t) === execution(next) && (priority(t) < priority(next) || priority(t) === priority(next) && t.due < next.due))) next = t;
			}
			for (const m of Mutations) if (m.due <= to && (!then || m.due < then.due) && (!next || m.due <= execution(next))) then = m;
			for (const m of Mutations) if (m.next <= to && (!head || m.next < head.next) && (!next || m.next <= execution(next)) && (!then || m.next < then.due)) head = m;
			if (head) then = null;
			if (!next && !then && !head) break;
			if (next?.change && !then && !head && fired) return true;
			if (fired === 4096) return say("refused advance: 4096 commits in one advance (TIMER_FIRE_LIMIT)"), journal$1.at(-1);
			const at = head ? head.next : then ? then.due : next.due, repeat = (wall || next?.wait) && !head && !then && !next.once && !next.frame && !next.hatch, gen = next?.gen;
			if (head) clock$1.now = Math.max(clock$1.now, head.next);
			else if (then) {
				clock$1.now = Math.max(clock$1.now, then.due);
				then.due = Infinity;
			} else {
				clock$1.now = wall ? Math.max(clock$1.now, execution(next)) : execution(next);
				if (next.once) clock$1.timers.splice(clock$1.timers.indexOf(next), 1);
				else if (!next.hatch) next.due = next.frame ? vf(next.base, ++next.k) : repeat ? beatAfter(at, next.ms, Math.max(clock$1.now, wall ? to : clock$1.now)) : next.due + next.ms;
			}
			if (!head && !then && !next.hatch && !next.data) {
				const counts = clock$1.timerFirings ??= Array(7).fill(0);
				counts[next.frame ? 6 : wall && next.wait ? 5 : next.wait ?? 0]++;
			}
			const due = next?.due, sample = () => {
				if (wall) clock$1.now = Math.max(clock$1.now, performance.now() - start);
			};
			sample();
			Instant = wall ? next?.wait || next?.change ? clock$1.now : at : null;
			const ok = fire(head ? () => Sched.next(head) : then ? () => Origin.run(then.thenOrigin, () => Invocation.run(then.thenInvocation, () => commit(then.then, `${then.name} then`))) : next.action);
			Instant = null;
			sample();
			if (repeat && clock$1.timers.includes(next)) next.due = next.gen === gen && next.due === due ? beatAfter(at, next.ms, Math.max(clock$1.now, wall ? to : clock$1.now)) : clock$1.now + next.ms;
			if (ok !== true) return journal$1.at(-1);
			if (head || then || !next.hatch && !next.data) fired++;
			if (!head && !then && next.change) return true;
			if (stop?.()) {
				stopped = true;
				break;
			}
		}
		if (!stopped) clock$1.now = Math.max(clock$1.now, to);
		for (const f of Clocked) f();
		if (fired && clock$1.agent) say(`advance → ${fired} timer${fired === 1 ? "" : "s"} fired, epoch ${clock$1.epoch}`);
		return stopped;
	}
	function fire(f) {
		for (const c of Clocked) c();
		Timing = true;
		try {
			return f();
		} finally {
			Timing = false;
		}
	}
	let driving = 0;
	let painting = 0;
	function drive() {
		clearTimeout(driving);
		if (clock$1.agent || Poisoned) return;
		let next = Infinity;
		for (const t of [...clock$1.stopped ? [] : clock$1.timers, ...Mutations]) if (!t.frame && (!t.change || t.ready)) next = Math.min(next, rt.timerWait?.wake(t) ?? t.due + (t.tolerance ?? 0));
		for (const m of Mutations) if (m.next < next) next = m.next;
		if (!isFinite(next)) return;
		const token = rt.timerWait?.generation();
		driving = setTimeout(() => {
			if (clock$1.agent || token !== rt.timerWait?.generation()) return;
			advance(performance.now() - start, true);
			rt.timerWait?.check();
			drive();
		}, Math.min(2147483647, Math.max(0, next - (performance.now() - start))));
	}
	function paint() {
		if (painting || typeof requestAnimationFrame !== "function") return;
		const token = rt.timerWait?.generation();
		painting = requestAnimationFrame(function frame(ts) {
			if (Poisoned || token !== rt.timerWait?.generation()) return;
			painting = 0;
			if (clock$1.agent || !clock$1.timers.some((t) => t.frame)) return;
			painting = requestAnimationFrame(frame);
			advance(Math.max(clock$1.now, ts - start), true);
			rt.timerWait?.check(true);
			const at = clock$1.now, rev = Rev, ticket = Ticket;
			NowRead = false;
			for (const t of clock$1.timers.filter((t) => t.frame).sort((a, b) => !!a.hatch - !!b.hatch)) if (clock$1.timers.includes(t)) {
				t.base = at;
				t.k = 1;
				t.due = vf(at, 1);
				(clock$1.timerFirings ??= Array(7).fill(0))[6]++;
				fire(t.action);
			}
			if (Rev === rev && Ticket === ticket && !NowRead && !clock$1.timers.some((t) => t.hatch && t.frame)) {
				cancelAnimationFrame(painting);
				painting = 0;
				Parked = Rev;
			}
			drive();
		});
	}
	let NowRead = false;
	let Parked = -1;
	/** After a commit that wrote: a parked frame loop runs again. */
	function unpark() {
		if (Parked >= 0 && Rev !== Parked) {
			Parked = -1;
			paint();
		}
	}
	/** The timers stop until the next `drive` or `paint` (rt-link.js `pauseTimers`). */
	function pauseTimers() {
		clearTimeout(driving);
		globalThis.cancelAnimationFrame?.(painting);
		driving = painting = 0;
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/strings.js
	init_navigation();
	init_shape();
	/** The resolved table's `[lang, dir]`, which a rendered page carries (render.mjs), or null with no table. */
	const resolvedLanguage = () => {
		return null;
	};
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/dataset.js
	init_navigation();
	new TextEncoder();
	const A = {
		bytes: 0,
		refused: 0,
		drains: 0,
		scheduled: false,
		tasks: false,
		port: null,
		composing: null
	};
	if (typeof document !== "undefined" && document.addEventListener) {
		document.addEventListener("compositionstart", (ev) => {
			A.composing = ev.target;
		}, true);
		document.addEventListener("compositionend", () => {
			A.composing = null;
		}, true);
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/names.js
	const types = [
		[{
			"tab": "s",
			"tabs": ["[", {
				"name": "s",
				"stack": ["[", {
					"id": "n",
					"name": "s",
					"url": "s",
					"tab": "s",
					"params": {},
					"fragment": "s"
				}]
			}],
			"next": "n"
		}, "n"],
		[],
		[{ "text": "s" }]
	];
	const sourceTypes = { "greeting": [["s"], { "text": "s" }] };
	const pages = [[
		"client",
		"inferred",
		0
	], [
		"client",
		"inferred",
		1
	]];
	const viewportMedia = [];
	const activation = {
		waits: [
			"press",
			"change",
			"input",
			"navigate",
			"intersect"
		],
		kept: false,
		viewport: false,
		tools: false
	};
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/perf.js
	const Sites = [];
	const at = (site) => Sites[site] ??= {
		created: 0,
		retired: 0,
		evaluated: 0,
		unchanged: 0,
		authored: 0,
		rowConstructed: 0,
		rowRetired: 0
	};
	/** A binding's expression, counted. One expression can feed several
	* writes (a shorthand's longhands, a paint fact): each effect that runs it
	* is an evaluation, unchanged when it equals what that effect last got. */
	function pf(site, f) {
		const last = [];
		return () => {
			const v = f(), o = owner(), i = last.indexOf(o);
			if (Observer) {
				const w = at(site);
				w.evaluated++;
				if (i >= 0 && eq(last[i + 1], v)) w.unchanged++;
			}
			if (i >= 0) last[i + 1] = v;
			else if (o) last.push(o, v);
			return v;
		};
	}
	let Observer = null;
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/roster.js
	const x_toString = (v) => String(v);
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/route-pattern.js
	const HEX = "0123456789ABCDEF";
	const utf8$2 = new TextEncoder();
	const enc = (s, esc) => {
		let o = "";
		for (const b of utf8$2.encode(s)) o += esc(b) ? "%" + HEX[b >> 4] + HEX[b & 15] : String.fromCharCode(b);
		return o;
	};
	const dec = (s, plus) => {
		const out = [];
		for (let i = 0; i < s.length; i++) {
			const c = s.charCodeAt(i);
			if (c === 37 && /^[0-9a-f]{2}$/i.test(s.substr(i + 1, 2))) {
				out.push(parseInt(s.substr(i + 1, 2), 16));
				i += 2;
			} else if (plus && c === 43) out.push(32);
			else out.push(...utf8$2.encode(s[i]));
		}
		return new TextDecoder("utf-8", { ignoreBOM: true }).decode(new Uint8Array(out));
	};
	const clean = (s) => s.replace(/^[\0- ]+|[\0- ]+$/g, "").replace(/[\t\n\r]/g, "");
	/** `canonical` (route/src/location.rs): path and query, dot segments resolved, escaped. */
	function canonical(location) {
		let [path, ...q] = clean(location[0] === "/" ? location : "/" + location).split("#")[0].split("?");
		const query = q.join("?");
		path = path.replace(/\\/g, "/").replace(/^\//, "");
		const segs = [], parts = path.split("/");
		parts.forEach((seg, i) => {
			const d = seg.toLowerCase(), last = i === parts.length - 1;
			if (d === "." || d === "%2e") {
				if (last) segs.push("");
			} else if ([
				"..",
				".%2e",
				"%2e.",
				"%2e%2e"
			].includes(d)) {
				segs.pop();
				if (last) segs.push("");
			} else segs.push(enc(seg, (b) => b < 33 || b > 126 || "\"#<>?^`{}|".includes(String.fromCharCode(b))));
		});
		return "/" + segs.join("/") + (query ? "?" + enc(query, (b) => b < 33 || b > 126 || "\"#<>'".includes(String.fromCharCode(b))) : "");
	}
	/** `fragment_of` (route/src/location.rs): what follows the first `#`, the fragment percent-encode set applied (LLP 1153 D5). */
	const fragmentOf$1 = (location) => {
		const s = clean(location), at = s.indexOf("#");
		return at < 0 ? "" : enc(s.slice(at + 1), (b) => b < 33 || b > 126 || "\"<>`".includes(String.fromCharCode(b)));
	};
	const segments = (p) => p === "/" ? [] : p.replace(/^\//, "").split("/");
	/** Pattern-only matching (route/src/table.rs): notfound never declares a path.
	* `url` is canonical; escaped slashes stay inside their segment. */
	function matchPattern(table, url, bind = () => {}) {
		const path = url.split("?")[0], parts = segments(path);
		if (path === "/" || !path.endsWith("/")) for (let i = 0; i < table.length; i++) {
			const r = table[i];
			if (r.notfound) continue;
			const pat = segments(canonical(r.pattern));
			if (pat.length !== parts.length || !pat.every((s, k) => s[0] === ":" ? parts[k] !== "" : s === parts[k])) continue;
			pat.forEach((s, k) => {
				if (s[0] === ":") bind(s.slice(1), dec(parts[k], false));
			});
			return i;
		}
		return -1;
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/fragment.js
	var fragment_exports = /* @__PURE__ */ __exportAll({
		arm: () => arm,
		cancel: () => cancel,
		forget: () => forget,
		scroll: () => scroll,
		shows: () => shows$1,
		traverse: () => traverse
	});
	function reference(el) {
		if (!references.has(el)) references.set(el, new WeakRef(el));
		return references.get(el);
	}
	/** A history push discards the forward entries, including the index it writes (navigation.js). */
	function forget(from) {
		for (const k of kept.keys()) if (k >= from) kept.delete(k);
	}
	/** The route of `visit`: the element keyed by it that is not a navigation root, whose key is its top's. */
	function route$1(root, visit) {
		for (const el of root?.querySelectorAll("[navigationKey]") ?? []) if (el.getAttribute("navigationKey") === String(visit) && !el.hasAttribute("navigationBack") && !el.hasAttribute("data-exiting")) return el;
		return null;
	}
	/** What a scroll to an element of the route can move: those, the route's ancestors that scroll, and the document's. */
	function scrollers(r) {
		const out = [document.scrollingElement];
		for (let el = r.parentElement; el; el = el.parentElement) if (el !== document.scrollingElement && scrolls(el)) out.push(el);
		return [...out, ...inside(r)];
	}
	function keep(r, at = entry$1()) {
		if (at != null) kept.set(at, new Map(scrollers(r).map((el) => [reference(el), [el.scrollTop, el.scrollLeft]])));
	}
	/** The fragment percent-decoded, then UTF-8 decoded without BOM or fail (HTML, "find a potential indicated element"). */
	function decoded(fragment) {
		const bytes = [], utf8 = new TextEncoder();
		for (let i = 0; i < fragment.length; i++) if (fragment[i] === "%" && /^[0-9a-f]{2}$/i.test(fragment.slice(i + 1, i + 3))) {
			bytes.push(parseInt(fragment.slice(i + 1, i + 3), 16));
			i += 2;
		} else bytes.push(...utf8.encode(fragment[i]));
		try {
			return new TextDecoder("utf-8", {
				fatal: true,
				ignoreBOM: true
			}).decode(new Uint8Array(bytes));
		} catch {
			return null;
		}
	}
	/** A router change asked for a scroll to its top's fragment (`op`: its `top`, `fragment` and `activation`; `traversal`
	* when the browser's Back or Forward made it, `pushed` when it pushed a history entry of the visit, navigation.js;
	* `since`, the person's scrolls when it was made). A pushed entry keeps where the one it left had the route; a scroll
	* by the person since (`person.personScrolls`, counted by navigation.js from the page's start) cancels it, and the
	* hold of an earlier one ends. */
	function arm(root, op, person) {
		const r = route$1(root, op.top), at = entry$1();
		if (op.pushed && r && at != null) keep(r, at - 1);
		held?.abort();
		armed = {
			visit: op.top,
			fragment: op.fragment,
			activation: op.activation,
			traversal: !!op.traversal,
			since: op.since ?? person.personScrolls,
			person
		};
	}
	/** The app's own scroll: a fragment's scroll held gives way, and with `pending` (a `scrollIntoView`) one not yet made. */
	function cancel(pending = true) {
		held?.abort();
		if (armed && pending) armed.authored = true;
	}
	/** A retained visit traversed to the very URL already shown: the router need not emit a change. */
	function traverse(root, op, person, log) {
		const fragment = fragmentOf(op.url);
		arm(root, {
			...op,
			fragment,
			traversal: true,
			pushed: false,
			since: person.personScrolls
		}, person);
		scroll(root, op.top, fragment, log);
	}
	function holding() {
		held?.abort();
		const h = held = new AbortController();
		h.signal.addEventListener("abort", () => {
			if (held === h) held = null;
		}, { once: true });
		return h;
	}
	/** Hold `target` at the start of its scrollers while `r`'s pictures load, until the person scrolls, it leaves, or the
	* entry shown is no longer `visit` at `fragment`. */
	function hold(r, target, visit, fragment, person) {
		const loading = () => [...r.querySelectorAll("img")].some((img) => !img.complete);
		held?.abort();
		if (!loading()) return;
		const h = holding(), since = person?.personScrolls, again = () => {
			if (!target.isConnected || person?.personScrolls !== since || !shows$1(visit, fragment)) return h.abort();
			target.scrollIntoView({
				block: "start",
				inline: "nearest",
				behavior: "instant"
			});
			keep(r);
			if (!loading()) h.abort();
		};
		for (const type of ["load", "error"]) r.addEventListener(type, again, {
			capture: true,
			signal: h.signal
		});
	}
	/** Scroll `visit`'s route to `fragment` for the router change armed with `activation`: the element with that id, else
	* its decoded id, at the start of every scroller above it and the starting point of the next Tab; `top`, or no such
	* element, the route's top. A traversal puts back where its history entry left the route, or leaves it where it is. */
	function scroll(root, visit, fragment, log, activation) {
		const was = armed && (activation != null ? armed.activation === activation : armed.visit === visit && armed.fragment === fragment) ? armed : null;
		if (was) armed = null;
		if (was?.authored) return log(`fragment #${fragment}: the app's own scrollIntoView took its place`);
		if (was && was.person.personScrolls !== was.since) return log(`fragment #${fragment}: the person scrolled first; the route stays where it is`);
		const r = route$1(root, visit);
		if (!r) return log(`fragment #${fragment}: no route of visit ${visit} is on the page`);
		if (was?.traversal) {
			const at = entry$1(), place = new Map(kept.get(at)), since = was.person?.personScrolls, h = holding();
			const restore = h.restore = () => {
				if (h.signal.aborted) return false;
				if (!r.isConnected || entry$1() !== at || !shows$1(visit, fragment) || was.person?.personScrolls !== since) {
					h.abort();
					return false;
				}
				for (const [ref, [top, left]] of place) {
					const el = ref.deref();
					if (el?.isConnected && (el === document.scrollingElement || r.contains(el) || el.contains(r))) el.scrollTo({
						top,
						left,
						behavior: "instant"
					});
				}
				return true;
			};
			if (!place.size) {
				h.abort();
				return;
			}
			restore();
			const settled = () => requestAnimationFrame(() => requestAnimationFrame(() => {
				if (restore() && document.readyState === "complete") h.abort();
			}));
			addEventListener("hashchange", restore, { signal: h.signal });
			addEventListener("load", settled, {
				once: true,
				signal: h.signal
			});
			settled();
			return;
		}
		const id = fragment && decoded(fragment), target = fragment ? byId(r, fragment) ?? byId(r, id) : null;
		if (target) {
			target.scrollIntoView({
				block: "start",
				inline: "nearest"
			});
			keep(r);
			hold(r, target, visit, fragment, was?.person);
			if (document.activeElement?.matches?.("input, textarea, select, [contenteditable]")) return;
			if (!target.matches("a[href], button, input, select, textarea, [tabindex], [contenteditable]")) {
				if (target.exactAuthoredTabIndex === void 0) target.exactAuthoredTabIndex = null;
				target.setAttribute("tabindex", "-1");
				target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
			}
			target.focus({
				preventScroll: true,
				focusVisible: false
			});
			return;
		}
		if (fragment && id?.toLowerCase() !== "top") log(`fragment #${fragment}: no element in the route of visit ${visit} has that id; the route goes to its top`);
		for (const el of inside(r)) el.scrollTo({
			top: 0,
			left: 0,
			behavior: "instant"
		});
		r.scrollIntoView({
			block: "start",
			inline: "nearest",
			behavior: "instant"
		});
		keep(r);
	}
	var armed, held, kept, references, entry$1, scrolls, inside, fragmentOf, shows$1, byId;
	var init_fragment = __esmMin((() => {
		armed = null;
		held = null;
		kept = /* @__PURE__ */ new Map();
		references = /* @__PURE__ */ new WeakMap();
		entry$1 = () => globalThis.history?.state?.exact;
		addEventListener("scroll", (e) => {
			if (held?.restore?.()) return;
			const at = entry$1(), el = e.target === document ? document.scrollingElement : e.target;
			if (at == null || !(el instanceof Element)) return;
			if (!kept.has(at)) kept.set(at, /* @__PURE__ */ new Map());
			kept.get(at).set(reference(el), [el.scrollTop, el.scrollLeft]);
		}, {
			capture: true,
			passive: true
		});
		scrolls = (el) => el && (el.scrollTop || el.scrollLeft || el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
		inside = (r) => [r, ...r.querySelectorAll("*")].filter(scrolls);
		fragmentOf = (url) => {
			const at = url?.indexOf("#") ?? -1;
			return at < 0 ? "" : url.slice(at + 1);
		};
		shows$1 = (visit, fragment, s = globalThis.history?.state) => !s || s.id === visit && fragmentOf(s.url) === fragment;
		byId = (r, id) => id ? [...r.querySelectorAll("[id]")].find((el) => el.id === id && !el.closest("[data-exiting]")) ?? null : null;
		(globalThis.exact ??= {}).fragment = {
			arm,
			scroll,
			cancel,
			shows: shows$1,
			forget,
			traverse
		};
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/router.js
	const say$1 = (line) => journal$1.push(`t=${clock$1.now} ${line}`);
	let Routes = [];
	let Names = [];
	const names = (p) => p.split("/").filter((s) => s[0] === ":").map((s) => s.slice(1));
	/** The plan's route table: [name, pattern, parent, tab, notfound] rows. */
	function routes(table) {
		Routes = table.map(([name, pattern, parent, tab, notfound]) => ({
			name,
			pattern,
			parent,
			tab,
			notfound
		}));
		Names = [];
		for (const r of Routes) if (!r.notfound) {
			for (const n of names(r.pattern)) if (!Names.includes(n)) Names.push(n);
		}
	}
	const empty = () => Names.map(() => "");
	function matchRoute(url) {
		const params = empty(), index = matchPattern(Routes, url, (name, value) => {
			params[Names.indexOf(name)] = value;
		});
		if (index >= 0) return [index, params];
		const nf = Routes.findIndex((r) => r.notfound);
		return nf < 0 ? null : [nf, empty()];
	}
	const roots = () => {
		const r = Routes.map((x, i) => x.tab ? i : -1).filter((i) => i >= 0);
		return r.length || !Routes.length ? r : [0];
	};
	function rootFor(i) {
		const rs = roots();
		if (!Routes[i].notfound) {
			for (let c = i, k = 0; c != null && c >= 0 && k <= Routes.length; c = Routes[c].parent, k++) if (rs.includes(c)) return c;
		}
		return rs[0];
	}
	const segmentOf = (v) => {
		if ([
			"",
			".",
			".."
		].includes(v)) throw new Refusal("a path parameter cannot be empty, `.` or `..`");
		return enc(v, (b) => !/[A-Za-z0-9\-_.!~*'()]/.test(String.fromCharCode(b)));
	};
	const path = (r, values) => r.pattern.split("/").map((s) => s[0] === ":" ? segmentOf(values.shift() ?? "") : s).join("/");
	function chain(location) {
		const url = canonical(location), m = matchRoute(url);
		if (!m) return [];
		const [index, params] = m, root = rootFor(index);
		if (root == null) return [];
		const idx = [index];
		if (!Routes[index].notfound) for (let p = Routes[index].parent; idx.at(-1) !== root && p != null && p >= 0; p = Routes[p].parent) {
			if (idx.includes(p)) return [];
			idx.push(p);
		}
		if (!idx.includes(root)) idx.push(root);
		return idx.reverse().map((i) => {
			const r = Routes[i], own = empty();
			for (const n of names(r.pattern)) own[Names.indexOf(n)] = params[Names.indexOf(n)];
			return {
				name: r.name,
				url: i === index ? url : canonical(path(r, names(r.pattern).map((n) => params[Names.indexOf(n)]))),
				tab: Routes[root].name,
				params: own
			};
		});
	}
	const entry = (id, d, fragment = "") => [
		id,
		d.name,
		d.url,
		d.tab,
		d.params,
		fragment
	];
	function refuse$1(r, why) {
		say$1(`router: ${why}`);
		return r;
	}
	function mint(r, d, fragment) {
		const id = r[2];
		r[2] = id + 1;
		return entry(id, d, fragment);
	}
	/** The visit `e` with the fragment a location named: `e` itself when it already has it (LLP 1153 D5). */
	const arrive = (e, fragment) => e[5] === fragment ? e : [...e.slice(0, 5), fragment];
	const sel = (r) => r[1].findIndex((t) => t[0] === r[0] && t[1].length);
	const copy = (r) => [
		r[0],
		r[1].map((t) => [t[0], t[1].slice()]),
		r[2]
	];
	/** A launch: the location's chain, else, when no route matches it and no `notfound` route absorbs it (an app with no
	* navigation root, which the compiler writes none for: LLP 1116.009 D2), the first screen's (`/`), the refusal journaled;
	* the runner's `RouterContext::launch` (runner/src/runner/router.rs). The app boots, and its first commit puts `/` in the
	* address bar. After a reload the page's earlier visits (`before`), which Back returns to, are beneath it, as the
	* runner's own `go` to each in turn leaves them; the browser's Back then pops to the visit beneath. */
	function launch(location, before = launchVisits()) {
		if (!chain(location).length) {
			say$1(`router launch refused: no route matches ${canonical(location)}`);
			location = "/";
			before = [];
		}
		const visits = [...before.filter((v) => chain(v).length), location];
		return visits.slice(1).reduce(go_, open_([
			"",
			[],
			0
		], visits[0]));
	}
	function open_(r, location) {
		const c = chain(location);
		if (!c.length) return refuse$1(r, `no route matches ${canonical(location)}`);
		const out = copy(r);
		if (!out[1].length) for (const i of roots()) out[1].push([Routes[i].name, [mint(out, Routes[i].name === c[0].name ? c[0] : {
			name: Routes[i].name,
			url: canonical(Routes[i].pattern),
			tab: Routes[i].name,
			params: empty()
		})]]);
		const t = out[1].find((t) => t[0] === c[0].tab), leaf = c.length - 1, fragment = fragmentOf$1(location);
		if (!t) return refuse$1(r, `unknown tab ${c[0].tab}`);
		t[1] = c.map((d, k) => t[1][k]?.[2] === d.url ? entry(t[1][k][0], d, k === leaf ? fragment : t[1][k][5]) : mint(out, d, k === leaf ? fragment : ""));
		out[0] = c[0].tab;
		return out;
	}
	function dest(r, location) {
		const url = canonical(location), m = matchRoute(url);
		return m && {
			name: Routes[m[0]].name,
			params: m[1],
			url,
			tab: r[0]
		};
	}
	function push_(r, location) {
		if (!r[1].length) return open_(r, location);
		const d = dest(r, location), i = sel(r);
		if (!d) return refuse$1(r, `no route matches ${canonical(location)}`);
		if (i < 0) return refuse$1(r, "router has no selected stack");
		const top = r[1][i][1].at(-1), fragment = fragmentOf$1(location);
		if (top?.[2] === d.url) {
			if (top[5] === fragment) return r;
			const out = copy(r), s = out[1][i][1];
			s[s.length - 1] = arrive(top, fragment);
			return out;
		}
		const out = copy(r);
		out[1][i][1].push(mint(out, d, fragment));
		return out;
	}
	function back_(r) {
		const i = sel(r);
		if (i < 0 || r[1][i][1].length < 2) return r;
		const out = copy(r);
		out[1][i][1].pop();
		return out;
	}
	function select_(r, name) {
		const i = r[1].findIndex((t) => t[0] === name && t[1].length);
		if (i < 0) return refuse$1(r, `unknown tab ${name}`);
		const out = copy(r);
		if (r[0] === name) out[1][i][1].length = 1;
		out[0] = name;
		return out;
	}
	function go_(r, location) {
		const url = canonical(location), fragment = fragmentOf$1(location);
		if (!matchRoute(url)) return refuse$1(r, `no route matches ${url}`);
		const s = stack_(r), at = s.map((e) => e[2]).lastIndexOf(url);
		if (at === s.length - 1 && s[at][5] === fragment) return r;
		if (at >= 0) {
			const i = sel(r);
			if (i < 0) return r;
			const out = copy(r), t = out[1][i][1];
			if (at === t.length - 1 || fragment) t[at] = arrive(t[at], fragment);
			t.length = at + 1;
			return out;
		}
		const other = r[1].findIndex((t) => t[0] !== r[0] && t[1].at(-1)?.[2] === url);
		if (other < 0) return push_(r, location);
		const out = copy(r), t = out[1][other][1];
		if (fragment) t[t.length - 1] = arrive(t.at(-1), fragment);
		return select_(out, out[1][other][0]);
	}
	const stack_ = (r) => r[1].find((t) => t[0] === r[0])?.[1] ?? [];
	const top_ = (r) => stack_(r).at(-1) ?? [
		0,
		"",
		"",
		"",
		empty(),
		""
	];
	const depth_ = (r) => stack_(r).length;
	/** The router slot's changes, to the browser's history (`navigation.js`,
	* the web host's own), and a popstate back as the navigation root's
	* `navigate` (LLP 1038 D7, D11). */
	let RouterSlot = null;
	let Shown = null;
	let History = null;
	let Early = null;
	/** The plan's navigation roots, with a router or without (document.js `projectRoots`). A page with one loads the input
	* piece after first paint: the focus follows its routes (input-glue.js `arrive`; LLP 1115.000 D4.2). */
	function navigationRoots(history) {
		History = history;
		useTraversal(traversal, history);
		projectRoots(history, (location) => false, say$1, After, hostBack, hostGo, (href) => {
			const match = matchRoute(canonical(href));
			return match !== null && !Routes[match[0]].notfound;
		}, canonical);
		pressFeedback();
	}
	/** The platform's own Back from the selected visit `id`, with no `navigate` handler (LLP 1115 D5): the router's `back`
	* as a commit of its own, the runner's `host_back`. */
	function hostBack(id) {
		const r = RouterSlot?.n.v;
		if (r && validRouter(r) && top_(r)[0] === id && depth_(r) > 1) commit(() => W(RouterSlot, back_(r)), "host back");
	}
	/** The platform's own navigation to `location`, with no `navigate` handler (LLP 1115.000 D4.3: the browser's Forward, a
	* link to a declared route): the router's `go` as a commit of its own, the runner's `host_go`; nothing when `go` leaves
	* the router as it is. */
	function hostGo(location) {
		const r = RouterSlot?.n.v;
		if (!r || !validRouter(r)) return;
		const next = navigating(go_)(r, location);
		if (next !== r) commit(() => W(RouterSlot, next), "host go");
	}
	let Navigations = [];
	let Due = null;
	let Scheduled = null;
	let Fragments = null;
	let Activations = 0;
	const fragments = () => Fragments ??= Promise.resolve().then(() => (init_fragment(), fragment_exports));
	const pageRoot = () => document.getElementById("exact-root");
	function navigating(f) {
		return (r, location) => {
			let next = f(r, location);
			const fragment = fragmentOf$1(location), t = top_(next);
			if (fragment && t[2] === canonical(location) && t[5] === fragment) {
				if (next === r) next = copy(r);
				Navigations.push([
					next,
					t[0],
					fragment
				]);
			}
			return next;
		};
	}
	/** The navigation the commit just made assigned the router, once: none when the commit was refused. */
	function assigned() {
		const v = Assigned.v, found = v !== void 0 && !refused() ? Navigations.find((n) => n[0] === v) : null;
		Assigned.v = void 0;
		Navigations = [];
		return found ?? null;
	}
	const shows = ({ visit, fragment }) => {
		const r = RouterSlot?.n?.v, t = r && validRouter(r) && top_(r);
		return !!t && t[0] === visit && t[5] === fragment;
	};
	function fragmentDue() {
		if (Due && !shows(Due)) Due = null;
		if (!Due || [...Counting].some((t) => t.held() && !t.r?.gone) || Resources.some((r) => !r.gone && r.waiting)) return;
		const due = Scheduled = Due;
		Due = null;
		fragments().then((f) => {
			if (Scheduled !== due || !shows(due)) return;
			Scheduled = null;
			f.scroll(pageRoot(), due.visit, due.fragment, say$1, due.activation);
		}, (e) => say$1(`fragment: ${e.message}`));
	}
	/** The scroll `op` asks for, armed now: a scroll by the person from here cancels it (navigation.js `personScrolls`). */
	function wantScroll(op) {
		op.activation = ++Activations;
		op.since = History?.personScrolls;
		Due = {
			visit: op.top,
			fragment: op.fragment,
			activation: op.activation
		};
		Scheduled = null;
		fragments().then((f) => f.arm(pageRoot(), op, History));
		queueMicrotask(fragmentDue);
	}
	const changeOf = (r, top, scroll, removed = []) => ({
		top: top[0],
		url: top[5] ? `${top[2]}#${top[5]}` : top[2],
		fragment: top[5],
		scroll,
		removed,
		visits: r[1].flatMap((t) => t[1].map((e) => [e[0], e[2]]))
	});
	/** After a commit's tree update: a navigation to the fragment the top already shows changes no value, and scrolls
	* again, a change of its own to the history as the runner's (a Back or Forward to it restores its place, fragment.js).
	* The check waits a microtask, for the commit's requests to go out and its commands to run. */
	function afterCommit() {
		const n = assigned(), r = RouterSlot?.n?.v, t = n && r && validRouter(r) && top_(r);
		if (t && t[0] === n[1] && t[5] === n[2]) {
			const op = changeOf(r, t, true);
			History.apply(op);
			wantScroll(op);
		}
		queueMicrotask(fragmentDue);
	}
	/** The router's value `r`, to the history: the op it applied. */
	function mirror(r) {
		const top = top_(r), ids = new Set(r[1].flatMap((t) => t[1].map((e) => e[0]))), before = Shown?.[1].flatMap((t) => t[1]) ?? [];
		const removed = before.map((e) => e[0]).filter((id) => !ids.has(id)), was = before.find((e) => e[0] === top[0]);
		Shown = r;
		const n = assigned(), activated = !!n && n[1] === top[0] && n[2] === top[5];
		const op = changeOf(r, top, activated || (was ? was[5] !== top[5] : !!top[5]), removed);
		History.apply(op);
		return op;
	}
	/** Before a commit's tree update, which a view transition may defer with the router's effect (rt.js): during a Back or
	* Forward the history mirrors the router's settled value now, for `popped` to judge (LLP 1007 §4). Whether the update
	* runs at once instead of flying: when the browser animated the traversal itself (LLP 1013.000 D7). */
	function traversal() {
		const pop = History.traversing, r = RouterSlot?.n.v;
		if (pop && r?.[1].length && r !== Shown) Early = mirror(r);
		return pop?.ua;
	}
	function router(slot, history) {
		RouterSlot = slot;
		Assigned.n = slot.n;
		navigationRoots(history);
		After.push(afterCommit);
		const own = Hosts.scrollIntoView;
		Hosts.scrollIntoView = (...a) => {
			const d = Due ?? Scheduled;
			if (d) {
				say$1(`fragment #${d.fragment}: the app's own scrollIntoView took its place`);
				Due = Scheduled = null;
			}
			globalThis.exact?.fragment?.cancel();
			return own(...a);
		};
		const by = Hosts.scrollBy;
		Hosts.scrollBy = (...a) => {
			globalThis.exact?.fragment?.cancel(false);
			return by(...a);
		};
		document.addEventListener("click", (ev) => {
			const a = ev.target.closest?.("a[href]"), root = document.getElementById("exact-root");
			if (!a || !root?.contains(a) || ev.defaultPrevented) return;
			const press = (a.dataset.exactOn ?? "").split(" ").includes("press");
			if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || a.target && a.target !== "_self" || a.hasAttribute("download")) {
				if (press) ev.stopPropagation();
				return;
			}
			const r = RouterSlot.n?.v, shown = r && validRouter(r) ? top_(r) : null, href = a.getAttribute("href") ?? "";
			const url = new URL(href[0] === "#" && shown ? shown[2] + href : a.href, location.href), to = url.pathname + url.search, m = matchRoute(canonical(to));
			const here = to === location.pathname + location.search || to === globalThis.history?.state?.url?.split("#")[0] || canonical(to) === shown?.[2];
			if (url.origin !== location.origin || !m || Routes[m[0]].notfound) return;
			ev.preventDefault();
			if (press || here && !url.hash && !shown?.[5]) return;
			const target = to + url.hash;
			hostGo(target);
			if (RouterSlot.n?.v === r && !(here && url.hash)) say$1(`history: link ${JSON.stringify(target)} refused`);
		}, true);
		effect(() => {
			const r = slot();
			if (!r || !r[1].length) return;
			const op = r === Shown ? Early : mirror(r);
			Early = null;
			if (op?.scroll) wantScroll(op);
			else if (op) {
				Due = Scheduled = null;
				Fragments?.then((f) => f.cancel());
			}
		});
		history.project(document.getElementById("exact-root"), say$1);
	}
	const routeAt = (location) => matchRoute(canonical(location))?.[0] ?? -1;
	const int = (n) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 9007199254740991;
	const str = (s) => typeof s === "string";
	/** Whether `r` is a valid router (runner/src/runner/router.rs `router`): its shape; tabs of distinct names, each stack
	* starting at its tab's own route; entries of distinct ids below `next`, each URL canonical and matching the entry's
	* route name and params; and a top on the selected tab. A source can answer a forged one. */
	function validRouter(r) {
		if (!Array.isArray(r) || r.length !== 3 || !str(r[0]) || !Array.isArray(r[1]) || !int(r[2])) return false;
		const tabs = /* @__PURE__ */ new Set(), ids = /* @__PURE__ */ new Set();
		for (const t of r[1]) {
			if (!Array.isArray(t) || t.length !== 2 || !str(t[0]) || !Array.isArray(t[1]) || tabs.has(t[0]) || t[1][0]?.[1] !== t[0]) return false;
			tabs.add(t[0]);
			for (const e of t[1]) {
				if (!Array.isArray(e) || e.length !== 6 || !int(e[0]) || !str(e[1]) || !str(e[2]) || !str(e[3]) || !Array.isArray(e[4]) || e[4].length !== Names.length || !e[4].every(str) || !str(e[5])) return false;
				if (e[3] !== t[0] || e[0] >= r[2] || ids.has(e[0]) || canonical(e[2]) !== e[2]) return false;
				ids.add(e[0]);
				const m = matchRoute(e[2]);
				if (!m || Routes[m[0]].name !== e[1] || m[1].some((v, k) => v !== e[4][k])) return false;
			}
		}
		return stack_(r).length > 0;
	}
	/** At each commit (rt.js), before settlement: the router slot holds a valid router, or the commit is refused, as the
	* runner's `router_change`. The last value found valid is remembered. */
	let Valid = null;
	function routerValid() {
		const v = RouterSlot?.n.v;
		if (!RouterSlot || v === Valid) return true;
		if (!validRouter(v)) return false;
		Valid = v;
		return true;
	}
	/** A verb or read of an invalid router traps, as the runner's (its `call_verb`); `searchParam` reads any entry. */
	const checked$1 = (f) => (r, ...a) => {
		if (!validRouter(r)) throw new Refusal("a router verb or read of an invalid router");
		return f(r, ...a);
	};
	const x_stack = checked$1(stack_);
	const x_top = checked$1(top_);
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/storage-environment.js
	var storage_environment_exports = /* @__PURE__ */ __exportAll({
		agentReads: () => agentReads,
		agentSeed: () => agentSeed,
		agentStorageRefusal: () => agentStorageRefusal,
		agentStream: () => agentStream,
		directories: () => directories,
		emptyRead: () => emptyRead,
		exclusiveSecret: () => exclusiveSecret,
		fileVersion: () => fileVersion,
		keyStore: () => keyStore,
		launchHref: () => launchHref,
		now: () => now,
		refuseCodeFromStrings: () => refuseCodeFromStrings,
		retrySecretWrite: () => retrySecretWrite,
		storageKey: () => storageKey
	});
	function refuseCodeFromStrings(realm) {
		const refuse = () => {
			throw new realm.SyntaxError("Parsing source code unsupported: a data source runs no code from a string (Function, eval), as on Hermes");
		};
		const prototype = realm.Function.prototype;
		const NoFunction = Object.setPrototypeOf(Object.defineProperties(function Function(body) {
			return refuse(body);
		}, { prototype: { value: prototype } }), prototype);
		const noEval = Object.setPrototypeOf({ eval(source) {
			return refuse(source);
		} }.eval, prototype);
		for (const f of [NoFunction, noEval]) Object.defineProperty(f, "constructor", {
			value: NoFunction,
			writable: false,
			configurable: false
		});
		Object.defineProperty(realm, "Function", {
			value: NoFunction,
			writable: true,
			configurable: true
		});
		Object.defineProperty(realm, "eval", {
			value: noEval,
			writable: true,
			configurable: true
		});
	}
	function storageKey(appId, href = launchHref()) {
		const params = new URL(href).searchParams, name = params.get("storage"), own = `${appId}@${DEVELOPMENT_STORE$1}`;
		if (!params.has("agent")) return own;
		if (name == null) return null;
		if (!/^[A-Za-z0-9._-]+$/.test(name) || name === "." || name === "..") throw new Error("storage: one name of letters, digits, '.', '-' or '_'");
		return `${own}/agent/${name}`;
	}
	function emptyRead(op, path) {
		if (op === "readdir" && Object.values(directories).includes(path)) return [];
		throw Object.assign(/* @__PURE__ */ new Error(`filesystem: no such file or directory: ${path} (a drive that names no scratch store reads an empty one; --storage <name> names one)`), {
			kind: "Unavailable",
			code: "ENOENT"
		});
	}
	function agentSeed(href = launchHref()) {
		const url = new URL(href);
		if (!url.searchParams.has("agent") || ![
			"localhost",
			"127.0.0.1",
			"[::1]"
		].includes(url.hostname)) return null;
		const seed = Number(url.searchParams.get("seed") ?? 1);
		return Number.isSafeInteger(seed) && seed >= 0 && seed < 2 ** 32 ? seed : 1;
	}
	function agentStream(seed, label) {
		const state = /* @__PURE__ */ new Uint32Array(16), block = /* @__PURE__ */ new Uint8Array(64), nonce = /* @__PURE__ */ new Uint8Array(12);
		state.set([
			1634760805,
			857760878,
			2036477234,
			1797285236
		]);
		state[4] = seed % 4294967296;
		state[5] = Math.floor(seed / 4294967296);
		nonce.set(new TextEncoder().encode(label).subarray(0, 12));
		const view = new DataView(nonce.buffer);
		for (let i = 0; i < 3; i++) state[13 + i] = view.getUint32(i * 4, true);
		let used = 64;
		const x = /* @__PURE__ */ new Uint32Array(16), out = new DataView(block.buffer);
		const quarter = (a, b, c, d) => {
			x[a] += x[b];
			x[d] ^= x[a];
			x[d] = x[d] << 16 | x[d] >>> 16;
			x[c] += x[d];
			x[b] ^= x[c];
			x[b] = x[b] << 12 | x[b] >>> 20;
			x[a] += x[b];
			x[d] ^= x[a];
			x[d] = x[d] << 8 | x[d] >>> 24;
			x[c] += x[d];
			x[b] ^= x[c];
			x[b] = x[b] << 7 | x[b] >>> 25;
		};
		const next = () => {
			x.set(state);
			for (let i = 0; i < 10; i++) {
				quarter(0, 4, 8, 12);
				quarter(1, 5, 9, 13);
				quarter(2, 6, 10, 14);
				quarter(3, 7, 11, 15);
				quarter(0, 5, 10, 15);
				quarter(1, 6, 11, 12);
				quarter(2, 7, 8, 13);
				quarter(3, 4, 9, 14);
			}
			for (let i = 0; i < 16; i++) out.setUint32(i * 4, x[i] + state[i] >>> 0, true);
			state[12]++;
			used = 0;
		};
		return (n) => {
			const bytes = new Uint8Array(n);
			for (let i = 0; i < n; i++) {
				if (used === 64) next();
				bytes[i] = block[used++];
			}
			return bytes;
		};
	}
	function keyStore(name, indexedDB) {
		if (name === null || !indexedDB) return {
			put: async (handle, pair) => {
				memoryKeys.set(handle, pair);
			},
			get: async (handle) => memoryKeys.get(handle) ?? null
		};
		let opened = null;
		const open = () => opened ??= new Promise((resolve, reject) => {
			const request = indexedDB.open(`exact.keys:${name}`, 1);
			request.onupgradeneeded = () => request.result.createObjectStore("keys");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => {
				opened = null;
				reject(request.error);
			};
		});
		const run = (mode, act) => open().then((db) => new Promise((resolve, reject) => {
			const tx = db.transaction("keys", mode), request = act(tx.objectStore("keys"));
			tx.oncomplete = () => resolve(request.result);
			tx.onerror = tx.onabort = () => reject(tx.error ?? request.error);
		}));
		return {
			put: (handle, pair) => run("readwrite", (keys) => keys.put({
				privateKey: pair.privateKey,
				publicKey: pair.publicKey
			}, handle)).then(() => {}),
			get: (handle) => run("readonly", (keys) => keys.get(handle)).then((pair) => pair ?? null)
		};
	}
	/** A kept session's read/modify/write spans every tab sharing its localStorage key. */
	function exclusiveSecret(store, prefix, name, work) {
		if (!globalThis.navigator?.locks) return Promise.reject(Object.assign(/* @__PURE__ */ new Error("This browser cannot coordinate shared secret updates"), { name: "NotSupportedError" }));
		return navigator.locks.request(`${prefix}${name}`, async () => {
			const discard = () => {
				store.pending.delete(name);
				if (store.writes) store.writes = store.writes.filter(([key]) => key !== name);
			};
			const key = prefix + name, marker = `exact.exclusive.${key}`;
			discard();
			if (localStorage.getItem(marker) != null) {
				localStorage.removeItem(key);
				localStorage.removeItem(marker);
			}
			const fresh = localStorage.getItem(key);
			if (fresh == null) store.map.delete(name);
			else store.map.set(name, fresh);
			localStorage.setItem(marker, "1");
			(store.leased ??= /* @__PURE__ */ new Set()).add(name);
			let completed = false;
			try {
				const value = await work();
				completed = true;
				return value;
			} finally {
				try {
					store.persist();
				} finally {
					store.leased.delete(name);
				}
				if (store.pending.has(name)) {
					discard();
					store.map.delete(name);
					localStorage.removeItem(key);
					throw new Error("The shared secret could not be persisted");
				}
				if (!completed) {
					discard();
					store.map.delete(name);
					localStorage.removeItem(key);
				}
				localStorage.removeItem(marker);
			}
		});
	}
	/** Automatic retries must share the lease; a value check alone races another tab. */
	async function retrySecretWrite(key, current, write, locks = globalThis.navigator?.locks) {
		if (!locks) throw new Error("This browser cannot coordinate a secret write retry");
		await locks.request(key, () => {
			if (current()) write();
		});
	}
	var directories, now, fillRandom, fileVersion, launchHref, DEVELOPMENT_STORE$1, agentStorageRefusal, agentReads, memoryKeys;
	var init_storage_environment = __esmMin((() => {
		directories = Object.freeze({
			data: "app:/data",
			cache: "app:/cache",
			temporary: "app:/tmp"
		});
		now = Date.now.bind(Date);
		fillRandom = crypto.getRandomValues.bind(crypto);
		fileVersion = () => fillRandom(/* @__PURE__ */ new Uint32Array(4)).join("-");
		launchHref = () => globalThis.performance?.getEntriesByType?.("navigation")[0]?.name ?? location.href;
		DEVELOPMENT_STORE$1 = "a56751c649a6";
		agentStorageRefusal = "storage is unavailable in agent mode unless the drive names a scratch store (--storage <name>)";
		agentReads = [
			"readFile",
			"readdir",
			"stat",
			"realpath"
		];
		memoryKeys = /* @__PURE__ */ new Map();
		if (globalThis.exact) globalThis.exact.retrySecretWrite = retrySecretWrite;
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/rt.js
	init_rt_link();
	init_navigation();
	init_shape();
	const presentArm = (view, ...a) => view;
	const presentRows = (row, ...a) => row;
	let Paint;
	function usePaint(pass) {
		Paint = pass;
	}
	let Media = null;
	let Nav = null;
	function useTraversal(f, nav = null) {
		Nav = nav;
	}
	let Links = null;
	let Listener = null;
	let Owner = null;
	let Queue = [];
	let FocusQueue = [];
	let Flushing = false;
	let Rev = 0;
	const CLEAN = 0;
	const CHECK = 1;
	const DIRTY = 2;
	function node(fn, v, effect) {
		const n = {
			fn,
			v,
			effect,
			s: fn ? DIRTY : CLEAN,
			src: [],
			obs: /* @__PURE__ */ new Set(),
			kids: null,
			gone: 0
		};
		if (Owner) {
			(Owner.kids ??= []).push(n);
			n.up = Owner;
		}
		return n;
	}
	function read(n) {
		if (Listener && !n.obs.has(Listener)) {
			n.obs.add(Listener);
			Listener.src.push(n);
		}
		if (n.fn) fresh(n);
		return n.v;
	}
	function fresh(n) {
		if (n.s === CHECK) for (const s of n.src) {
			if (s.fn) fresh(s);
			if (n.s === DIRTY) break;
		}
		if (n.s === DIRTY) run(n);
		n.s = CLEAN;
	}
	function drop(n) {
		for (const s of n.src) if (!s.dead) s.obs.delete(n);
		n.src = [];
		if (n.kids) {
			for (const k of n.kids) dispose(k);
			n.kids = null;
		}
	}
	function dispose(n) {
		n.gone = 1;
		Settle.delete(n);
		drop(n);
		if (n.ends) for (const f of n.ends.splice(0)) f();
	}
	/** Run `f` when the scope that owns this code ends (a region's arm or row). */
	function onEnd(f) {
		if (Owner) (Owner.ends ??= []).push(f);
	}
	function run(n) {
		if (n.busy) throw new Refusal("a cycle: a derive or resource reads itself");
		drop(n);
		const [l, o] = [Listener, Owner];
		Listener = Owner = n;
		n.busy = 1;
		let v;
		try {
			v = n.fn(n.v);
		} finally {
			Listener = l;
			Owner = o;
			n.busy = 0;
		}
		if (!n.effect && !eq(n.v, v)) {
			n.v = v;
			for (const o of n.obs) o.s = DIRTY;
		}
	}
	function stale(n, state) {
		if (n.s < state) {
			if (n.s === CLEAN && n.effect) Queue.push(n);
			n.s = state;
			for (const o of n.obs) stale(o, CHECK);
		}
	}
	function write(n, v) {
		if (eq(n.v, v)) return;
		n.v = v;
		if (!CatchingUp) Rev++;
		for (const o of n.obs) stale(o, DIRTY);
	}
	/** A row's new item: an effect `fm` marked re-runs only if a field it reads changed (LLP 1071.000 D3). */
	function writeItem(n, v) {
		const o = n.v;
		if (eq(o, v)) return;
		let m = -1;
		if (Array.isArray(o) && Array.isArray(v) && o.length === v.length) {
			m = 0;
			for (let k = 0; k < v.length && k < 31; k++) if (!eq(o[k], v[k])) m |= 1 << k;
		}
		n.v = v;
		if (!CatchingUp) Rev++;
		for (const x of n.obs) if (!x.m || x.m & m) stale(x, DIRTY);
	}
	/** Writes in `f` publish what an earlier commit already made, to a row or arm whose region's update is still queued
	* (presence-bindings.js): they are no change of this commit's, so `rev` does not count them. */
	let CatchingUp = false;
	let Mask = 0;
	function fm(m, g) {
		const o = Mask;
		Mask = m;
		try {
			g();
		} finally {
			Mask = o;
		}
	}
	function flush() {
		if (Flushing) return;
		Flushing = true;
		try {
			for (let i = 0; i < Queue.length; i++) if (!Queue[i].gone) fresh(Queue[i]);
		} finally {
			Queue = [];
			Flushing = false;
		}
		while (FocusQueue.length) FocusQueue.shift()();
	}
	function untracked(f) {
		const l = Listener;
		Listener = null;
		try {
			return f();
		} finally {
			Listener = l;
		}
	}
	/** A slot: a getter, `.n` its node; `t` its declared type (writes conform); `name` a string slot's, which a write past
	* MAX_STRING names. An initial value outside `t`: the runner refuses the boot, or the row's creation poisons
	* (SlotType). */
	function sig(v, t, name) {
		if (t && !conforms(v, t)) throw new Error(`a slot's initial value does not conform to its type: ${v}`);
		const n = node(null, v);
		n.t = t;
		n.name = name;
		const g = () => read(n);
		g.n = n;
		return g;
	}
	/** A string past MAX_STRING's UTF-8 bytes (runner `too_long`): one test, TextEncoder's U+FFFD for a lone surrogate
	* (LLP 1090 D6). */
	const long = (s) => typeof s === "string" && s.length > 22369621 && (s.length > 67108864 || new TextEncoder().encode(s).length > 67108864);
	const tooLong = (name) => new Refusal(`StringTooLong { name: ${JSON.stringify(name)} }`);
	const Settle = /* @__PURE__ */ new Set();
	/** A derive: lazy, cached, equal results keep their object; settled at
	* every commit before the tree; its value conforms to its type. */
	function memo(fn, t, name) {
		const n = node(t ? (last) => {
			let v;
			try {
				v = fn();
			} catch (e) {
				if (name && e?.typeRefusal) e.message = `derive ${JSON.stringify(name)}: ${e.message}`;
				throw e;
			}
			if (!conforms(v, t, [0], last)) {
				const r = n.resource;
				const error = new Refusal(`${r ? `resource ${JSON.stringify(r.name)} (source ${JSON.stringify(r.source)})` : `derive${name ? ` ${JSON.stringify(name)}` : ""}`}: value does not conform to its type${r?.error ? `; source failed: ${r.error}` : ""}`);
				if (!r && name) {
					const seen = /* @__PURE__ */ new Set(), visit = (s) => {
						if (seen.has(s)) return;
						seen.add(s);
						const upstream = s.resource;
						if (upstream?.error) error.message += `; read resource ${JSON.stringify(upstream.name)} (source ${JSON.stringify(upstream.source)}) failed: ${upstream.error}`;
						for (const input of s.src) visit(input);
					};
					for (const input of n.src) visit(input);
				}
				error.typeRefusal = true;
				throw error;
			}
			return v;
		} : fn);
		Settle.add(n);
		const g = () => read(n);
		g.n = n;
		return g;
	}
	function effect(fn) {
		const n = node(fn, void 0, 1);
		if (Mask) n.m = Mask;
		fresh(n);
		return n;
	}
	/** A scope whose effects `dispose` ends, owned by `parent` (a region's
	* arms and rows belong to the region's scope, never to its effect, which
	* drops what it owns each time it reruns). */
	function scope(f, parent = Owner) {
		const o = Owner;
		Owner = parent;
		const n = node(null);
		Owner = n;
		try {
			f();
		} catch (e) {
			dispose(n);
			throw e;
		} finally {
			Owner = o;
		}
		return n;
	}
	function end(n) {
		dispose(n);
		const k = n.up?.kids;
		if (k) k.splice(k.indexOf(n), 1);
	}
	/** Leaving rows' scopes end, owner's kids filtered once; nothing unsubscribes from their own signals. */
	function endAll(rows) {
		let up = null;
		for (const r of rows.values()) if (r.s) {
			r.item.n.dead = r.index.n.dead = 1;
			dispose(r.s);
			up = r.s.up;
		}
		if (up?.kids) up.kids = up.kids.filter((k) => !k.gone);
	}
	const owner = () => Owner;
	let Writes = null;
	let Commands = [];
	let Out = [];
	let Landed = [];
	let Sends = [];
	let Refresh = [];
	let Finishes = null;
	let Poisoned = false;
	let Refused = null;
	let Why = "";
	let Sched = null;
	const why = (step, m, c = [...m]) => `while ${step}: ${c.length > WHY_MAX ? `${c.slice(0, WHY_MAX).join("")}… (${c.length - WHY_MAX} more characters in the journal)` : m}`;
	const WHY_MAX = 300;
	const refused = () => Refused;
	const journal$1 = Object.assign([], {
		start: 0,
		push(...l) {
			const over = Array.prototype.push.apply(this, l) - 4096;
			if (over > 0) this.start += this.splice(0, over).length;
			return this.length;
		}
	});
	const say = (line) => journal$1.push(`t=${clock$1.now} ${line}`);
	/** A write inside an action: collected, applied at commit. */
	function W(s, v) {
		Writes.push([s.n, v]);
		if (s.n === Assigned.n) Assigned.v = v;
	}
	const Assigned = {
		n: null,
		v: void 0
	};
	const Origin = {
		now: () => Origin.ask ?? "app",
		run(origin, f) {
			const was = this.ask;
			this.ask = origin;
			try {
				return f();
			} finally {
				this.ask = was;
			}
		}
	};
	/** A call's id follows its requests, replies, queued sends and `then`s (LLP 1133.023 D7); a person's commit has 0.
	* `run` and `letGo` are calls.js's once the app has tools: until then every commit is a person's. `pending` is what a
	* call waits for besides its requests, each with the call's `id`: a supersession a replacing commit has not published,
	* and a tree update of its own that a view transition defers (shared.js). */
	const Invocation = {
		id: 0,
		pending: /* @__PURE__ */ new Set(),
		run: (id, f) => f(),
		letGo() {}
	};
	/** `refresh r`: forced at this commit's settlement (merged, LLP 1054.000.000 D2). */
	function R(r, reasking = false) {
		Refresh.push([r.r ?? r, reasking]);
	}
	/** Pull every derive and resource in plan order: the settlement pass. */
	function settle() {
		for (const n of Settle) if (!n.gone) fresh(n);
	}
	/** One commit: `f` runs; its writes, sends and refreshes land; settlement
	* runs; a refusal anywhere up to here puts everything back and leaves the
	* tree untouched; then the tree updates, completion callbacks run, requests go out, commands run. */
	function commit(f, what = "commit", finished) {
		if (Writes) {
			if (finished) Finishes.push(finished);
			return f();
		}
		if (Poisoned) return say(`refused ${what}: the runner is poisoned; reload`);
		Writes = [];
		Commands = [];
		Out = [];
		Landed = [];
		Sends = [];
		Refresh = [];
		Finishes = finished ? [finished] : [];
		Refused = null;
		Why = "";
		time();
		const was = Now.v, undo = [], saved = Resources.map((r) => r.save()), held = Mutations.map((m) => [
			m.ticket,
			m.tickets,
			m.concluded
		]), store = Store.save(), writes = save();
		let sound, ok = true, step = Booting ? "building the view" : `running the ${what}`;
		try {
			untracked(f);
			step = "landing its writes and sends";
			tick();
			for (const [n, v] of Writes) {
				if (n.t && !conforms(v, n.t)) throw new Refusal(`a write does not conform to its slot's type: ${JSON.stringify(v)}`);
				if (n.name && long(v)) throw tooLong(n.name);
				undo.push([n, n.v]);
				write(n, v);
				if (n.m && !n.landing) n.m.forget(undo);
			}
			for (const [m, source, args, own] of Sends) m.send(source, args, undo, own);
			for (const [n] of Writes) if (n.m && !n.landing && Sends.some((x) => x[0] === n.m)) n.m.forget(undo);
			for (const [r, reasking] of Refresh) r.force(undo, reasking);
			if (!routerValid()) throw new Refusal("invalid router value");
			step = "settling its derives and resources";
			settle();
			for (let k = 0; Store.dirty && k < 4; k++) {
				Store.dirty = false;
				for (const r of Resources) if (r.store) r.revise(undo);
				settle();
			}
			step = "arming its tasks and sequences";
			sound = Sounds.gate?.();
		} catch (e) {
			ok = false;
			for (const [n, v] of undo.reverse()) write(n, v);
			if (Now.v !== was) {
				Now.v = was;
				for (const o of Now.obs) stale(o, DIRTY);
			}
			Resources.forEach((r, k) => k < saved.length && r.restore(saved[k]));
			Mutations.forEach((m, k) => {
				[m.ticket, m.tickets, m.concluded] = held[k];
			});
			restore(writes);
			Store.restore(store);
			for (const go of Out) go.refused?.(e?.message ?? e);
			Out = [];
			Commands = [];
			Landed = [];
			Refused = e;
			say(`refused ${what}: ${e.message}`);
			Why = why(step, e instanceof Refusal ? e.message : String(e));
			if (!(e instanceof Refusal)) console.error(e);
			Restoring = true;
			try {
				settle();
			} catch {} finally {
				Restoring = false;
			}
		}
		const [out, cmds, landed, finishes] = [
			Out,
			Commands,
			Landed,
			Finishes
		], invocation = Invocation.id, origin = Origin.now();
		if (Propagating) for (const c of cmds.filter((c) => c[0] === "preventDefault" || c[0] === "stopPropagation")) {
			cmds.splice(cmds.indexOf(c), 1);
			command(...c);
		}
		Writes = Finishes = null;
		unpark();
		if (ok) {
			if (Sounds.frozen && Open.size) closeLetGo(inflight, say);
			Sounds.committed?.(sound);
		}
		let sent = 0;
		const unrun = (why) => {
			for (const go of out.splice(sent)) go.refused?.(why);
		};
		const link = Nav?.holdLink();
		const tail = Object.assign(() => {
			try {
				return Invocation.run(invocation, () => link ? Nav.withLink(link, update) : update());
			} finally {
				unrun("its tree update failed");
			}
		}, { unrun: () => unrun("its tree update never ran") });
		const update = () => {
			for (const f of Before) f();
			try {
				flush();
				openTabs();
			} catch (e) {
				Poisoned = true;
				Why = why("updating the tree", String(e));
				say(`poisoned: ${e.pc != null ? `Instance(${e.message})` : e.message}`);
				console.error(e);
				for (const f of finishes) f(false);
				return false;
			}
			for (const f of finishes) f(ok);
			settled(true);
			if (!ok) return false;
			clock$1.epoch++;
			Store.persist();
			for (const r of Resources) retainedAnswer(r, say);
			while (sent < out.length) out[sent++]();
			if (Open.size) closeLetGo(inflight, say);
			for (const c of cmds) command(...c);
			Sounds.apply?.(cmds);
			Sounds.midiApply?.(cmds);
			Sounds.stood?.(sound);
			if (!Booting) autofocus();
			for (const m of landed) if (m.then) {
				m.due = armedAt();
				m.thenInvocation = invocation;
				m.thenOrigin = origin;
				if (!clock$1.agent) drive();
			}
			return true;
		};
		return tail();
	}
	/** A commit made again after a write ended or the source became ready (the runner's `commit_again`). Refused while
	* reads are owed (a reconciling ask), they fail, keeping what they show, before a commit publishes it; a refusal of
	* that leaves nothing owed. */
	function recommit(f, what) {
		const done = commit(f, what), owed = done === false ? Resources.filter((r) => r.reconciling) : [], why = Refused?.message;
		if (owed.length) {
			for (const r of owed) r.giveUp(`the commit that asked it again was refused: ${why}`);
			commit(() => {}, "the reads a refused commit owed");
		}
		return done;
	}
	/** What runs after each commit's tree update (a loaded piece's publication), before it (the text flow piece puts
	* flowed paragraphs back), and as the clock moves: before each timer or `then` fires, and where an advance lands. */
	const After = [];
	const Before = [];
	const Clocked = [];
	/** Authored scroll offsets (`scrollTop`, `scrollLeft`), set once the commit's tree is in place, as the web host's
	* `pendingScrolls` (a virtualized list builds the rows there first: `$jump`, list.js); and a select's committed
	* `$value` once written or its options change, as glue.js `settleValue` (a reader's pick stands until its action). */
	const Scrolls = /* @__PURE__ */ new Map();
	const Selects = /* @__PURE__ */ new Set();
	/** What a commit does once its tree is in place: authored scrolls, then the
	* loaded pieces' publications (also after a list's report, list.js). */
	function settled(inCommit) {
		drain();
		markDocument();
		Paint?.flush();
		for (const f of After) f();
		if (!inCommit && !Booting) autofocus();
	}
	let Restoring = false;
	function drain() {
		for (const [e, o] of Scrolls) for (const name in o) {
			const at = o[name];
			if (e[name] !== at) globalThis.exact?.fragment?.cancel(false);
			if (e.$jump) e.$jump(name, at);
			else if (e[name] !== at) {
				if (Booting && (at < 0 || Math.min(at, name === "scrollTop" ? e.scrollHeight - e.clientHeight : e.scrollWidth - e.clientWidth) !== e[name])) e.$bootScroll = e.$bootScrollEnd = true;
				if (clock$1.agent && e.style.scrollBehavior === "smooth") e.scrollTo({
					[name === "scrollTop" ? "top" : "left"]: at,
					behavior: "instant"
				});
				else e[name] = at;
			}
		}
		Scrolls.clear();
		for (const e of Selects) if (!e.isConnected) Selects.delete(e);
		else {
			const o = [...e.options], v = o.map((x) => x.value);
			if (e.$set || o.length !== e.$options?.length || o.some((x, i) => x !== e.$options[i] || v[i] !== e.$values[i])) {
				e.$set = false;
				e.$options = o;
				e.$values = v;
				e.value = e.$value;
			}
		}
	}
	/** An action: each call is one commit. Its arguments conform to its parameters' types (`types`, after `skip` leading
	* arguments: a row action's row), each then within MAX_STRING when `names` names it a string's, or it is refused before
	* its body runs, as the runner's ArgumentType and StringTooLong. `.t(f)` is a handler whose arguments `f` makes inside
	* the commit (a trap refuses it, LLP 1090 D1), then the event's; on a poisoned runner `f` still runs first, as the
	* runner evaluates them before its poisoned check. */
	function act(fn, types, skip = 0, names) {
		const go = (a) => {
			for (let i = 0; types && i < types.length; i++) {
				if (!conforms(a[i + skip], types[i])) throw new Refusal(`argument ${i + 1} does not conform to its parameter's type`);
				if (names?.[i] && long(a[i + skip])) throw tooLong(names[i]);
			}
			fn(...a);
		};
		const a = (...x) => commit(() => go(x), "action");
		a.t = (f) => (...v) => {
			if (Poisoned) try {
				f();
			} catch (e) {
				return say(`refused action: ${e.message}`);
			}
			return commit(() => go([...f(), ...v]), "action");
		};
		return a;
	}
	/** The host commands, by name; a loaded piece adds its own (list.js `scrollIntoView`). */
	const Hosts = {
		requestFullscreen: (id) => say(`requestFullscreen: refused: no video with id "${id}"`),
		scrollIntoView: (id, block, inline, behavior) => {
			const e = liveById(id);
			if (e) e.scrollIntoView({
				block: block ?? "start",
				inline: inline ?? "nearest",
				behavior: behavior ?? "auto"
			});
			else say(`scrollIntoView "${id}" refused: no live node with that id`);
		},
		scrollBy: (id, x, y) => {
			const e = liveById(id);
			if (e) e.scrollBy(x, y);
			else say(`scrollBy "${id}" refused: no live node with that id`);
		},
		observe: (n) => say(`observe ${n}`),
		observeAttributes: () => {},
		observeError: (m) => say(`observeError ${m}`)
	};
	Hosts.preventDefault = () => {
		if (Propagating?.type === "pointerdown") Propagating.preventDefault();
	};
	Hosts.stopPropagation = () => {
		const e = Propagating;
		if (e) e.$stopped = true;
	};
	const Sounds = {
		apply: null,
		own: /* @__PURE__ */ new Set([
			"playSound",
			"playSounds",
			"stopSounds",
			"setSounds",
			"sendMIDI",
			"requestMIDIAccess"
		]),
		gate: null,
		committed: null,
		stood: null,
		seq: null,
		midi: null,
		midiApply: null,
		beatAt: null
	};
	function command(name, args, origin) {
		const f = Hosts[name];
		say(`command ${name}`);
		if (Sounds.own.has(name)) return;
		if (Origin.refused?.(name, origin)) return;
		if (f) f.origin ? f(origin, ...args) : f(...args);
		else say(`refused: ${name} is not a command this runtime carries`);
	}
	const Now = node(null, 0);
	function tick() {
		if (Now.v !== clock$1.now) {
			Now.v = clock$1.now;
			for (const o of Now.obs) stale(o, DIRTY);
		}
	}
	Object.assign(rt, {
		clock: clock$1,
		every,
		commit,
		journal: journal$1,
		advance,
		drive,
		wall: () => performance.now() - start,
		nextMutation: () => Mutations.reduce((due, m) => Math.min(due, m.due ?? Infinity, m.next ?? Infinity), Infinity),
		fireTimer: (t) => fire(t.action),
		busy: () => !!Writes,
		poisoned: () => Poisoned,
		pauseTimers,
		Invocation
	});
	/** The app's data sources (LLP 1016). `answer(source, args, store)` gives `{v}` now, `{req}` (an HTTP request the host
	* runs, then `parse`s), a Promise (an executor-local continuation: TypeScript), or `null` while the source is not
	* ready; `ready(f)` calls `f` once it is. `uploads`: the uploads asked, none until ts-data.js installs uploads.js's
	* `ledger` (LLP 1016.000 D10). */
	const data = {
		answer: () => null,
		parse: null,
		q: [],
		ready: (f) => data.q.push(f),
		uploads: {
			at() {},
			ends: (r, t, ...c) => c,
			kept: (r) => r.value
		}
	};
	const DEVELOPMENT_STORE = "a56751c649a6";
	/** The page's `localStorage` keys of a kind: "exact.<kind>.<name>", or in a development build
	* "exact.<kind>.@<digest>/<name>", its app's own on the origin the dev server's apps share (LLP 1116.004 D8). Persisted
	* state's kind is "state" (persist.js); the durable store's (LLP 1018, `Store`: name → text, kept after a commit
	* stands) is "secret". */
	const Kept = (kind) => `exact.${kind}.${`@${DEVELOPMENT_STORE}/`}`;
	const Store = {
		map: /* @__PURE__ */ new Map(),
		writes: [],
		pending: /* @__PURE__ */ new Map(),
		dirty: false,
		get(k) {},
		exclusive(k, work) {
			return Promise.resolve().then(() => (init_storage_environment(), storage_environment_exports)).then((m) => m.exclusiveSecret(this, Kept("secret"), k, work));
		},
		set(k, v) {
			throw new Error("a render's store is empty and refuses writes");
		},
		save() {
			return [new Map(this.map), this.writes.length];
		},
		restore([m, n]) {
			this.map = m;
			this.writes.length = n;
			this.dirty = false;
		},
		persist() {
			const p = Kept("secret"), jobs = [];
			for (const [k, v] of this.writes.splice(0)) this.pending.set(k, {
				v,
				warned: false
			});
			for (const [k, entry] of this.pending) {
				const live = () => this.pending.get(k) === entry, failed = (e) => {
					if (!live()) return;
					if (!Object.hasOwn(entry, "before")) this.pending.delete(k);
					if (!entry.warned) {
						entry.warned = true;
						say(`store ${k} failed: ${e}`);
					}
				}, write = () => {
					try {
						const before = localStorage.getItem(p + k);
						if (Object.hasOwn(entry, "before") && entry.before !== before) {
							this.pending.delete(k);
							return;
						}
						entry.before = before;
						entry.v == null ? localStorage.removeItem(p + k) : localStorage.setItem(p + k, entry.v);
						this.pending.delete(k);
					} catch (e) {
						failed(e);
					}
				};
				if (Object.hasOwn(entry, "before") && !this.leased?.has(k)) {
					entry.retry ??= Promise.resolve().then(() => (init_storage_environment(), storage_environment_exports)).then((m) => m.retrySecretWrite(p + k, live, write)).catch(failed).finally(() => {
						delete entry.retry;
					});
					jobs.push(entry.retry);
				} else write();
			}
			return Promise.all(jobs);
		},
		load() {},
		/** Another tab's write of key `k` (`v`, or null removed): taken, unless this tab's own write of it is owed, and the
		* store's readers asked again, as after a write outside a commit (the runner's `store_changed`). */
		peer(k, v) {
			if (this.pending.has(k) || this.writes.some((w) => w[0] === k) || (this.map.get(k) ?? null) === v) return;
			if (v == null) this.map.delete(k);
			else this.map.set(k, v);
			Rev++;
			lateReaders();
			recommit(lateIdle, "another tab's store write");
		}
	};
	const Inspections = resourceInspection(true, () => clock$1.now);
	const inflight = { n: 0 };
	globalThis.__exactPressFeedback = pressFeedback;
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/budget.js
	/** `MAX_STRING` and `MAX_VALUE_BYTES`, in UTF-8 bytes; `MAX_VALUE_NODES`. */
	const MAX = 67108864;
	/** A trap: the runner's `Trap` at `pc`, journaled as its `Debug` text (D6). */
	var Trap = class extends Refusal {
		constructor(kind, pc) {
			super(`Trap(${kind} { pc: ${pc} })`);
			this.kind = kind;
			this.pc = pc;
		}
	};
	const bound = (x) => ({
		IterationLimit: ": past the 65,536 list steps one evaluation may take",
		CallLimit: ": past the 65,536 derive calls one evaluation may take",
		CallDepth: ": past 64 derive call levels",
		StringTooLong: ": past the 64 MiB a string may hold",
		ValueTooLarge: ": past the 16,777,216 nodes or 64 MiB a value may hold",
		ValueTooDeep: ": past 64 levels"
	})[x.kind] ?? "";
	/** Prop or style binding `f` of plan node `site` on element `e`, whose trap unsets its row `row` and the commit goes on
	* (LLP 1017.003 D3; the runner's `instance/trapped.rs`). One journal line when it starts trapping, however many writes
	* read it: the element keeps which of its rows' bindings trapped last, until one evaluates to a value. */
	const tg = (e, site, row, f) => () => {
		try {
			const v = f();
			e.$tg?.delete(row);
			return v;
		} catch (x) {
			if (!(x instanceof Trap)) throw x;
			const t = e.$tg ??= /* @__PURE__ */ new Set();
			if (!t.has(row)) {
				t.add(row);
				say(`site ${site}: ${row} trapped Trap(${x.kind} { pc: ${x.pc} })${bound(x)}; unset`);
			}
			return null;
		}
	};
	/** A string's UTF-8 bytes, as Rust's `str::len`; a lone surrogate is U+FFFD's 3 (LLP 1088 D2). */
	function utf8$1(s, limit = Infinity) {
		let n = s.length;
		for (let i = 0; i < s.length && n <= limit; i++) {
			const c = s.charCodeAt(i);
			if (c < 128) continue;
			if (c < 2048) {
				n += 1;
				continue;
			}
			if (c < 56320 && c >= 55296 && i + 1 < s.length) {
				const d = s.charCodeAt(i + 1);
				if (d >= 56320 && d < 57344) {
					n += 2;
					i++;
					continue;
				}
			}
			n += 2;
		}
		return n;
	}
	/** `a + b` (`Opcode::Concat`). */
	function cc(a, b, pc) {
		const n = a.length + b.length;
		if (n > MAX) throw new Trap("StringTooLong", pc);
		return 3 * n <= MAX ? a + b : bounded([a, b], "", pc);
	}
	/** Count the UTF-8 result before a builder can allocate past the bound, including pairs across pieces. */
	function bounded(parts, sep, pc) {
		const out = parts.map(String);
		let units = sep.length * Math.max(0, out.length - 1);
		for (const part of out) units += part.length;
		if (units > MAX) throw new Trap("StringTooLong", pc);
		if (3 * units <= MAX) return out.join(sep);
		let bytes = 0, high = false;
		const add = (part) => {
			bytes += utf8$1(part, MAX - bytes + 2);
			if (high && part.length && part.charCodeAt(0) >= 56320 && part.charCodeAt(0) <= 57343) bytes -= 2;
			if (part.length) {
				const last = part.charCodeAt(part.length - 1);
				high = last >= 55296 && last <= 56319;
			}
			if (bytes > MAX) throw new Trap("StringTooLong", pc);
		};
		for (let i = 0; i < out.length; i++) {
			if (i) add(sep);
			add(out[i]);
		}
		return out.join(sep);
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/paint.js
	init_navigation();
	function paintUse() {
		return {
			list: paintList,
			facts: paintFacts,
			flush: paintFlush,
			wait: paintWait
		};
	}
	const Z = false;
	const FLOW = false;
	const LAYOUT = false;
	const dirty = /* @__PURE__ */ new Set();
	const get = (e, n) => e.getAttribute("data-exact-" + n);
	const record = (e) => e.$paint ??= {
		z: false,
		level0: false,
		isolated: false,
		cz: false,
		c0: false
	};
	const said$1 = (e) => e.getAttributeNames().reduce((bits, k) => k === "data-exact-f" || k.startsWith("data-exact-f-") ? bits | Number(e.getAttribute(k)) : bits, 0);
	const facts = (e) => e.$paintWaiting ? record(e).bits : e.$paintFacts ??= said$1(e);
	const item = (e) => e?.hasAttribute("data-exact-list-item") ? listRow(e) : e;
	const children = (e) => viewChildren(e).filter((c) => !c.hasAttribute("data-exiting"));
	/** Keep authored inputs and descendant potentials while bindings wait for
	* adoption. Parent display and sibling exclusions remain live inputs. A
	* summary that is the element's template facts with no z-index is not
	* written (paintFlush, document.rs). */
	function paintWait(e) {
		e = item(e);
		const summary = get(e, "paint"), [bits, zi] = summary ? JSON.parse(summary) : [said$1(e), null];
		Object.assign(record(e), {
			z: Z,
			level0: !!(bits & 32),
			bits,
			zi
		});
		e.$paintWaiting = true;
	}
	const excludes = (e) => FLOW;
	const holdsLayout = (e) => LAYOUT;
	/** A structural edit can change both a list and its holder's policy. */
	function paintList(p) {
		if (p?.hasAttribute?.("data-exact-list-item")) p = p.parentElement;
		if (p?.nodeType !== 1) return;
		dirty.add(p);
		if (viewParent(p) && p.id !== "exact-root") dirty.add(viewParent(p));
	}
	/** Position, stacking rows, z-index and display all affect the two lists. */
	function paintFacts(e) {
		e.$paintFacts = null;
		paintList(e);
	}
	function own(e, parent, exclusion) {
		const bits = facts(e), root = !!(bits & 128), positioned = !!(bits & 1), z = null;
		const authored = !!(bits & 2) || false;
		const policy = !!(bits & 4) || (bits & 24576) === 24576 && (bits & 32768 || (bits & 196608) === 196608) || holdsLayout(e);
		return {
			positioned,
			stacks: authored || !!policy,
			policy: !!policy && !authored,
			z,
			isolation: !!(bits & 64),
			outside: !e.$paintWaiting && !e.hasAttribute("data-exact-f") || !!(bits & 8),
			root
		};
	}
	function paintFlush() {
		const buckets = [], queued = /* @__PURE__ */ new Set(), depths = /* @__PURE__ */ new Map();
		const depth = (a) => {
			if (!a || a.id === "exact-root") return 0;
			let d = depths.get(a);
			if (d === void 0) {
				d = depth(viewParent(a)) + 1;
				depths.set(a, d);
			}
			return d;
		};
		const queue = (p) => {
			if (!p?.isConnected || p.nodeType !== 1 || queued.has(p)) return;
			(buckets[depth(p)] ??= []).push(p);
			queued.add(p);
		};
		for (const p of dirty) queue(p);
		dirty.clear();
		while (buckets.length) {
			const list = buckets.at(-1);
			if (!list?.length) {
				buckets.pop();
				continue;
			}
			const p = list.pop(), kids = children(p);
			const exclusion = kids.some(excludes);
			let layered = false, leaked = false, z = false, level0 = false, changed = false;
			for (const c of kids) {
				const r = record(c), o = own(c, p, exclusion), free = !o.stacks, stat = !o.positioned;
				const isolated = !o.root && !o.outside && free && (stat && r.level0 && (layered || leaked) || stat && leaked);
				const leaks = stat && free && !isolated && r.level0;
				if (!o.outside) {
					layered ||= o.positioned || o.stacks || isolated || leaks;
					leaked ||= leaks;
				}
				c.toggleAttribute("data-exact-policy", o.policy);
				const iso = isolated || o.policy || o.isolation;
				if (c.$ghostIsolation) Object.assign(c.$ghostIsolation, {
					value: iso ? "isolate" : "",
					priority: "",
					released: false
				});
				if (iso || c.$ghostIsolation) {
					if (c.style.isolation !== "isolate") c.style.isolation = "isolate";
				} else if (c.style.isolation === "isolate") c.style.removeProperty("isolation");
				const open = !o.stacks && !isolated;
				const cz = Z;
				const c0 = !o.outside && ((o.positioned || o.stacks) && true || isolated || open && stat && r.level0);
				changed ||= r.isolated !== isolated || r.policy !== o.policy || r.cz !== cz || r.c0 !== c0;
				Object.assign(r, {
					own: o,
					isolated,
					policy: o.policy,
					cz,
					c0
				});
				{
					const bits = facts(c) | +r.z << 4 | +r.level0 << 5 | +holdsLayout(c) << 2, zi = null;
					if (bits === said$1(c) && true) c.removeAttribute("data-exact-paint");
					else c.setAttribute("data-exact-paint", JSON.stringify([bits, zi]));
				}
				z ||= cz;
				level0 ||= c0;
			}
			const r = record(p);
			changed ||= r.z !== z || r.level0 !== level0;
			r.z = z;
			r.level0 = level0;
			if (changed && p.id !== "exact-root") queue(viewParent(p));
		}
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/symbol-roles.js
	var symbol_roles_exports = /* @__PURE__ */ __exportAll({ default: () => symbol_roles_default });
	var symbol_roles_default;
	var init_symbol_roles = __esmMin((() => {
		symbol_roles_default = {
			"back": ["M15 5 8 12l7 7", 0],
			"sf/chevron.backward": ["M15 5 8 12l7 7", 0],
			"close": ["m6 6 12 12M18 6 6 18", 0],
			"sf/xmark": ["m6 6 12 12M18 6 6 18", 0],
			"compose": ["M12 5H5v14h14v-7M10 14l1-4 8-8 3 3-8 8-4 1Z", 0],
			"sf/square.and.pencil": ["M12 5H5v14h14v-7M10 14l1-4 8-8 3 3-8 8-4 1Z", 0],
			"add": ["M12 5v14M5 12h14", 0],
			"sf/plus": ["M12 5v14M5 12h14", 0],
			"microphone": ["M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5ZM6 11v1a6 6 0 0 0 12 0v-1M12 18v4M8 22h8", 0],
			"sf/mic": ["M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5ZM6 11v1a6 6 0 0 0 12 0v-1M12 18v4M8 22h8", 0],
			"send": ["M12 20V4m-7 7 7-7 7 7", 0],
			"sf/arrow.up": ["M12 20V4m-7 7 7-7 7 7", 0],
			"search": ["M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1 5 6 6", 0],
			"sf/magnifyingglass": ["M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1 5 6 6", 0],
			"copy": ["M8 7V3h7l5 5v9h-5M15 3v5h5M4 7h7l4 4v10H4V7Zm7 0v4h4", 0],
			"sf/doc.on.doc": ["M8 7V3h7l5 5v9h-5M15 3v5h5M4 7h7l4 4v10H4V7Zm7 0v4h4", 0],
			"select-text": ["M6 4v13a2 2 0 0 0 2 2h10V9a2 2 0 0 0-2-2H6m12 12v2M7 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm12 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z", 0],
			"sf/selection.pin.in.out": ["M6 4v13a2 2 0 0 0 2 2h10V9a2 2 0 0 0-2-2H6m12 12v2M7 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm12 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z", 0],
			"more": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM7.5 12h.01M12 12h.01M16.5 12h.01", 0],
			"sf/ellipsis.circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM7.5 12h.01M12 12h.01M16.5 12h.01", 0],
			"delete": ["M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7", 0],
			"sf/trash": ["M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7", 0],
			"forward": ["M14 4v5C6 9 3 13 3 21c3-6 6-7 11-7v6l8-8-8-8Z", 0],
			"sf/arrowshape.turn.up.right": ["M14 4v5C6 9 3 13 3 21c3-6 6-7 11-7v6l8-8-8-8Z", 0],
			"home": ["M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9", 0],
			"sf/house": ["M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9", 0],
			"person": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 19v-1a6 4 0 0 1 12 0v1", 0],
			"sf/person.crop.circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 19v-1a6 4 0 0 1 12 0v1", 0],
			"messages": ["M3 3h14v11H8l-5 4V3Zm14 5h4v13l-5-4h-5v-3", 0],
			"sf/bubble.left.and.bubble.right": ["M3 3h14v11H8l-5 4V3Zm14 5h4v13l-5-4h-5v-3", 0],
			"notifications": ["M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Zm5 3h4", 0],
			"sf/bell": ["M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Zm5 3h4", 0],
			"settings": ["M9 3h6v3l3 2 3-1 1 5-3 2v3l-4 3-3-2-3 2-4-3v-3l-3-2 1-5 3 1 3-2V3Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", 0],
			"sf/gearshape": ["M9 3h6v3l3 2 3-1 1 5-3 2v3l-4 3-3-2-3 2-4-3v-3l-3-2 1-5 3 1 3-2V3Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", 0],
			"repeat": ["m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3", 0],
			"sf/repeat": ["m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3", 0],
			"activity": ["M2 12h4l3-8 6 16 3-8h4", 0],
			"sf/waveform.path.ecg": ["M2 12h4l3-8 6 16 3-8h4", 0],
			"bookmark": ["M7 3h10a1 1 0 0 1 1 1v17l-6-5-6 5V4a1 1 0 0 1 1-1Z", 0],
			"sf/bookmark": ["M7 3h10a1 1 0 0 1 1 1v17l-6-5-6 5V4a1 1 0 0 1 1-1Z", 0],
			"bookmark-fill": ["M7 2h10a2 2 0 0 1 2 2v18.2l-7-5.6-7 5.6V4a2 2 0 0 1 2-2Z", 1],
			"sf/bookmark.fill": ["M7 2h10a2 2 0 0 1 2 2v18.2l-7-5.6-7 5.6V4a2 2 0 0 1 2-2Z", 1],
			"document": ["M14 3H6v18h12V7l-4-4Zm0 0v4h4M9 11h6M9 14h6M9 17h4", 0],
			"sf/doc.text": ["M14 3H6v18h12V7l-4-4Zm0 0v4h4M9 11h6M9 14h6M9 17h4", 0],
			"select": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 12l3 3 5-6", 0],
			"sf/checkmark.circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 12l3 3 5-6", 0],
			"select-fill": ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM7.3 12.7l3.8 3.8 5.7-6.9-1.6-1.2-4.3 5.1-2.2-2.2-1.4 1.4Z", 1],
			"sf/checkmark.circle.fill": ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM7.3 12.7l3.8 3.8 5.7-6.9-1.6-1.2-4.3 5.1-2.2-2.2-1.4 1.4Z", 1],
			"reorder": ["M4 6h16M4 12h16M4 18h16", 0],
			"sf/line.3.horizontal": ["M4 6h16M4 12h16M4 18h16", 0],
			"list": ["M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01", 0],
			"sf/list.bullet": ["M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01", 0],
			"cart": ["M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6M10 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM19 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z", 0],
			"sf/cart": ["M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6M10 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM19 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z", 0],
			"sort": ["M8 20V4M4 8l4-4 4 4M16 4v16m-4-4 4 4 4-4", 0],
			"sf/arrow.up.arrow.down": ["M8 20V4M4 8l4-4 4 4M16 4v16m-4-4 4 4 4-4", 0],
			"filter": ["M4 7h16M7 12h10M10 17h4", 0],
			"sf/line.3.horizontal.decrease": ["M4 7h16M7 12h10M10 17h4", 0],
			"heart": ["M12 20s-7-4.4-9-8.5C1.6 8.3 3.4 5 6.8 5c2.1 0 3.5 1.2 5.2 3 1.7-1.8 3.1-3 5.2-3 3.4 0 5.2 3.3 3.8 6.5-2 4.1-9 8.5-9 8.5Z", 0],
			"sf/heart": ["M12 20s-7-4.4-9-8.5C1.6 8.3 3.4 5 6.8 5c2.1 0 3.5 1.2 5.2 3 1.7-1.8 3.1-3 5.2-3 3.4 0 5.2 3.3 3.8 6.5-2 4.1-9 8.5-9 8.5Z", 0],
			"heart-fill": ["M12 21s-7.6-4.6-9.8-9.1C.6 8.4 2.6 4 6.8 4c2.2 0 3.8 1.1 5.2 2.8C13.4 5.1 15 4 17.2 4c4.2 0 6.2 4.4 4.6 7.9C19.6 16.4 12 21 12 21Z", 1],
			"sf/heart.fill": ["M12 21s-7.6-4.6-9.8-9.1C.6 8.4 2.6 4 6.8 4c2.2 0 3.8 1.1 5.2 2.8C13.4 5.1 15 4 17.2 4c4.2 0 6.2 4.4 4.6 7.9C19.6 16.4 12 21 12 21Z", 1],
			"reply": ["M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z", 0],
			"sf/bubble.left": ["M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z", 0],
			"share": ["M12 3v12M8 7l4-4 4 4M7 10H5v11h14V10h-2", 0],
			"sf/square.and.arrow.up": ["M12 3v12M8 7l4-4 4 4M7 10H5v11h14V10h-2", 0],
			"ellipsis": ["M6 12h.01M12 12h.01M18 12h.01", 0],
			"sf/ellipsis": ["M6 12h.01M12 12h.01M18 12h.01", 0],
			"home-fill": ["M12 2.5 2 10.2V22h7v-7h6v7h7V10.2Z", 1],
			"sf/house.fill": ["M12 2.5 2 10.2V22h7v-7h6v7h7V10.2Z", 1],
			"notifications-fill": ["M12 2a6 6 0 0 0-6 6v5.5L4 17v1h16v-1l-2-3.5V8a6 6 0 0 0-6-6Zm-3 18a3 3 0 0 0 6 0Z", 1],
			"sf/bell.fill": ["M12 2a6 6 0 0 0-6 6v5.5L4 17v1h16v-1l-2-3.5V8a6 6 0 0 0-6-6Zm-3 18a3 3 0 0 0 6 0Z", 1],
			"person-fill": ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 14a8 8 0 0 1-6-2.7c.6-2.2 3-3.3 6-3.3s5.4 1.1 6 3.3A8 8 0 0 1 12 20Z", 1],
			"sf/person.crop.circle.fill": ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 14a8 8 0 0 1-6-2.7c.6-2.2 3-3.3 6-3.3s5.4 1.1 6 3.3A8 8 0 0 1 12 20Z", 1],
			"photo": ["M4 5h16v14H4ZM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01", 0],
			"sf/photo": ["M4 5h16v14H4ZM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01", 0],
			"play": ["M7 4v16l13-8Z", 0],
			"sf/play": ["M7 4v16l13-8Z", 0],
			"play-fill": ["M6 3.5v17a1 1 0 0 0 1.5.9l13.2-8.5a1 1 0 0 0 0-1.8L7.5 2.6A1 1 0 0 0 6 3.5Z", 1],
			"sf/play.fill": ["M6 3.5v17a1 1 0 0 0 1.5.9l13.2-8.5a1 1 0 0 0 0-1.8L7.5 2.6A1 1 0 0 0 6 3.5Z", 1],
			"pause": ["M9 5v14M15 5v14", 0],
			"sf/pause": ["M9 5v14M15 5v14", 0],
			"pause-fill": ["M6 4h4v16H6ZM14 4h4v16h-4Z", 1],
			"sf/pause.fill": ["M6 4h4v16H6ZM14 4h4v16h-4Z", 1],
			"skip-back-15": ["M12 3a9 9 0 1 1-7.8 4.5M12 3l2-2M12 3l2 2M8.8 10l1.4-1v6M15.6 9h-2.8v2.4H14a1.8 1.8 0 0 1 0 3.6h-1.3", 0],
			"sf/gobackward.15": ["M12 3a9 9 0 1 1-7.8 4.5M12 3l2-2M12 3l2 2M8.8 10l1.4-1v6M15.6 9h-2.8v2.4H14a1.8 1.8 0 0 1 0 3.6h-1.3", 0],
			"skip-forward-15": ["M12 3a9 9 0 1 0 7.8 4.5M12 3l-2-2M12 3l-2 2M8.8 10l1.4-1v6M15.6 9h-2.8v2.4H14a1.8 1.8 0 0 1 0 3.6h-1.3", 0],
			"sf/goforward.15": ["M12 3a9 9 0 1 0 7.8 4.5M12 3l-2-2M12 3l-2 2M8.8 10l1.4-1v6M15.6 9h-2.8v2.4H14a1.8 1.8 0 0 1 0 3.6h-1.3", 0],
			"skip-back-30": ["M12 3a9 9 0 1 1-7.8 4.5M12 3l2-2M12 3l2 2M7.6 9.6a1.6 1.6 0 1 1 1.6 2.4 1.7 1.7 0 1 1-1.6 2.6M14.4 9c-1.1 0-1.7 1.3-1.7 3s.6 3 1.7 3 1.7-1.3 1.7-3-.6-3-1.7-3Z", 0],
			"sf/gobackward.30": ["M12 3a9 9 0 1 1-7.8 4.5M12 3l2-2M12 3l2 2M7.6 9.6a1.6 1.6 0 1 1 1.6 2.4 1.7 1.7 0 1 1-1.6 2.6M14.4 9c-1.1 0-1.7 1.3-1.7 3s.6 3 1.7 3 1.7-1.3 1.7-3-.6-3-1.7-3Z", 0],
			"skip-forward-30": ["M12 3a9 9 0 1 0 7.8 4.5M12 3l-2-2M12 3l-2 2M7.6 9.6a1.6 1.6 0 1 1 1.6 2.4 1.7 1.7 0 1 1-1.6 2.6M14.4 9c-1.1 0-1.7 1.3-1.7 3s.6 3 1.7 3 1.7-1.3 1.7-3-.6-3-1.7-3Z", 0],
			"sf/goforward.30": ["M12 3a9 9 0 1 0 7.8 4.5M12 3l-2-2M12 3l-2 2M7.6 9.6a1.6 1.6 0 1 1 1.6 2.4 1.7 1.7 0 1 1-1.6 2.6M14.4 9c-1.1 0-1.7 1.3-1.7 3s.6 3 1.7 3 1.7-1.3 1.7-3-.6-3-1.7-3Z", 0],
			"speaker": ["M4 9h4l5-4v14l-5-4H4ZM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12", 0],
			"sf/speaker.wave.2": ["M4 9h4l5-4v14l-5-4H4ZM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12", 0],
			"speaker-mute": ["M4 9h4l5-4v14l-5-4H4ZM3 3l18 18", 0],
			"sf/speaker.slash": ["M4 9h4l5-4v14l-5-4H4ZM3 3l18 18", 0],
			"moon": ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", 0],
			"sf/moon": ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", 0],
			"pin": ["M9 3h6M10 3l-.5 6L6 13h12l-3.5-4L14 3M12 13v8", 0],
			"sf/pin": ["M9 3h6M10 3l-.5 6L6 13h12l-3.5-4L14 3M12 13v8", 0],
			"link": ["M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1", 0],
			"sf/link": ["M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1", 0],
			"checkmark": ["m5 12 5 5 9-10", 0],
			"sf/checkmark": ["m5 12 5 5 9-10", 0],
			"forward-chevron": ["m9 5 7 7-7 7", 0],
			"sf/chevron.forward": ["m9 5 7 7-7 7", 0],
			"at": ["M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm0 0v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1", 0],
			"sf/at": ["M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm0 0v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1", 0],
			"hashtag": ["M9 3 7 21M17 3l-2 18M4 8h17M3 16h17", 0],
			"sf/number": ["M9 3 7 21M17 3l-2 18M4 8h17M3 16h17", 0],
			"follow": ["M15 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21v-1a6 6 0 0 1 11-3.3M19 14v6M16 17h6", 0],
			"sf/person.badge.plus": ["M15 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21v-1a6 6 0 0 1 11-3.3M19 14v6M16 17h6", 0],
			"sign-out": ["M14 4H5v16h9M10 12h11M17 8l4 4-4 4", 0],
			"sf/rectangle.portrait.and.arrow.right": ["M14 4H5v16h9M10 12h11M17 8l4 4-4 4", 0],
			"quote": ["M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM9 9v3M15 9v3", 0],
			"sf/quote.bubble": ["M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM9 9v3M15 9v3", 0],
			"feeds": ["M4 4h16v16H4ZM10 7 9 17M15 7l-1 10M7 10h11M6 14h11", 0],
			"sf/number.square": ["M4 4h16v16H4ZM10 7 9 17M15 7l-1 10M7 10h11M6 14h11", 0],
			"calendar": ["M4 6h16v14H4ZM4 10h16M8 3v4M16 3v4", 0],
			"sf/calendar": ["M4 6h16v14H4ZM4 10h16M8 3v4M16 3v4", 0],
			"book": ["M2 5c3-1.5 7-1.5 10 1v14c-3-2.5-7-2.5-10-1ZM22 5c-3-1.5-7-1.5-10 1v14c3-2.5 7-2.5 10-1Z", 0],
			"sf/book": ["M2 5c3-1.5 7-1.5 10 1v14c-3-2.5-7-2.5-10-1ZM22 5c-3-1.5-7-1.5-10 1v14c3-2.5 7-2.5 10-1Z", 0],
			"layers": ["M12 3 2 8l10 5 10-5ZM2 12l10 5 10-5M2 16l10 5 10-5", 0],
			"sf/square.3.layers.3d": ["M12 3 2 8l10 5 10-5ZM2 12l10 5 10-5M2 16l10 5 10-5", 0],
			"lock": ["M5 11h14v10H5ZM8 11V7a4 4 0 0 1 8 0v4", 0],
			"sf/lock": ["M5 11h14v10H5ZM8 11V7a4 4 0 0 1 8 0v4", 0],
			"people": ["M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0M16 3.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-4-6.3", 0],
			"sf/person.2": ["M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0M16 3.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-4-6.3", 0],
			"stop": ["M6 6h12v12H6Z", 0],
			"sf/stop": ["M6 6h12v12H6Z", 0],
			"stop-fill": ["M6 6h12v12H6Z", 1],
			"sf/stop.fill": ["M6 6h12v12H6Z", 1],
			"circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", 0],
			"sf/circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", 0],
			"alert": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v6M12 16.5h.01", 0],
			"sf/exclamationmark.circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v6M12 16.5h.01", 0],
			"minus-circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 12h8", 0],
			"sf/minus.circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 12h8", 0],
			"pencil": ["M4 20h16M5 16 16 5l3 3L8 19H5Z", 0],
			"sf/pencil.line": ["M4 20h16M5 16 16 5l3 3L8 19H5Z", 0],
			"waveform": ["M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4", 0],
			"sf/waveform": ["M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4", 0],
			"info": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6M12 7.5v.5", 0],
			"sf/info.circle": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6M12 7.5v.5", 0],
			"camera": ["M3 8h4l2-3h6l2 3h4v12H3ZM16 13.5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z", 0],
			"sf/camera": ["M3 8h4l2-3h6l2 3h4v12H3ZM16 13.5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z", 0],
			"star": ["M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z", 0],
			"sf/star": ["M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z", 0],
			"star-fill": ["M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z", 1],
			"sf/star.fill": ["M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z", 1],
			"minus": ["M5 12h14", 0],
			"sf/minus": ["M5 12h14", 0],
			"chart": ["M4 20h16M6 20v-7h3v7M10.5 20V5h3v15M15 20v-10h3v10", 0],
			"sf/chart.bar": ["M4 20h16M6 20v-7h3v7M10.5 20V5h3v15M15 20v-10h3v10", 0],
			"sparkles": ["M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8ZM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9Z", 0],
			"sf/sparkles": ["M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8ZM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9Z", 0],
			"refresh": ["M20 12a8 8 0 1 1-8-8c2.2 0 4.2.9 5.7 2.3L20 8.5M20 3.5v5h-5", 0],
			"sf/arrow.clockwise": ["M20 12a8 8 0 1 1-8-8c2.2 0 4.2.9 5.7 2.3L20 8.5M20 3.5v5h-5", 0],
			"menu": ["M4 6h16M4 12h16M4 18h16", 0],
			"sf/line.3.horizontal": ["M4 6h16M4 12h16M4 18h16", 0],
			"adjust": ["M4 6h9m4 0h3m-3 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM4 12h3m4 0h9m-9 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM4 18h8m4 0h4m-4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z", 0],
			"sf/slider.horizontal.3": ["M4 6h9m4 0h3m-3 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM4 12h3m4 0h9m-9 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM4 18h8m4 0h4m-4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z", 0],
			"alert-fill": ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM11 6.5h2v7.5h-2ZM11 15.5h2v2h-2Z", 1],
			"sf/exclamationmark.circle.fill": ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM11 6.5h2v7.5h-2ZM11 15.5h2v2h-2Z", 1],
			"info-fill": ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM11 10h2v7.5h-2ZM11 6.5h2v2h-2Z", 1],
			"sf/info.circle.fill": ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM11 10h2v7.5h-2ZM11 6.5h2v2h-2Z", 1],
			"chooser": ["M8 9l4-4 4 4M8 15l4 4 4-4", 0],
			"sf/chevron.up.chevron.down": ["M8 9l4-4 4 4M8 15l4 4 4-4", 0],
			"download": ["M12 4v15M6 13l6 6 6-6", 0],
			"sf/arrow.down": ["M12 4v15M6 13l6 6 6-6", 0],
			"install": ["M8 4H5v16h14V4h-3M12 3v11M8 10l4 4 4-4", 0],
			"sf/arrow.down.app": ["M8 4H5v16h14V4h-3M12 3v11M8 10l4 4 4-4", 0],
			"open-app": ["M11 4H5v15h15v-6M14 4h6v6M20 4l-9 9", 0],
			"sf/arrow.up.forward.app": ["M11 4H5v15h15v-6M14 4h6v6M20 4l-9 9", 0],
			"download-pending": ["M20.91 10.75A9 9 0 0 1 20.91 13.25M20.34 15.37A9 9 0 0 1 19.09 17.54M17.54 19.09A9 9 0 0 1 15.37 20.34M13.25 20.91A9 9 0 0 1 10.75 20.91M8.63 20.34A9 9 0 0 1 6.46 19.09M4.91 17.54A9 9 0 0 1 3.66 15.37M3.09 13.25A9 9 0 0 1 3.09 10.75M3.66 8.63A9 9 0 0 1 4.91 6.46M6.46 4.91A9 9 0 0 1 8.63 3.66M10.75 3.09A9 9 0 0 1 13.25 3.09M15.37 3.66A9 9 0 0 1 17.54 4.91M19.09 6.46A9 9 0 0 1 20.34 8.63M12 7.5v8.5M8.5 12.5 12 16l3.5-3.5", 0],
			"sf/arrow.down.circle.dotted": ["M20.91 10.75A9 9 0 0 1 20.91 13.25M20.34 15.37A9 9 0 0 1 19.09 17.54M17.54 19.09A9 9 0 0 1 15.37 20.34M13.25 20.91A9 9 0 0 1 10.75 20.91M8.63 20.34A9 9 0 0 1 6.46 19.09M4.91 17.54A9 9 0 0 1 3.66 15.37M3.09 13.25A9 9 0 0 1 3.09 10.75M3.66 8.63A9 9 0 0 1 4.91 6.46M6.46 4.91A9 9 0 0 1 8.63 3.66M10.75 3.09A9 9 0 0 1 13.25 3.09M15.37 3.66A9 9 0 0 1 17.54 4.91M19.09 6.46A9 9 0 0 1 20.34 8.63M12 7.5v8.5M8.5 12.5 12 16l3.5-3.5", 0],
			"package": ["M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9ZM3.5 7.5 12 12l8.5-4.5M12 12v9M7.75 5.25l8.5 4.5", 0],
			"sf/shippingbox": ["M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9ZM3.5 7.5 12 12l8.5-4.5M12 12v9M7.75 5.25l8.5 4.5", 0],
			"mail": ["M3 6h18v12H3V6Zm0 0 9 7 9-7", 0],
			"sf/envelope": ["M3 6h18v12H3V6Zm0 0 9 7 9-7", 0],
			"emoji": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01", 0],
			"sf/face.smiling": ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01", 0],
			"translate": ["m5 8 6 6m-7 0 6-6 2-3M2 5h12M7 2h1m14 20-5-10-5 10m2-4h6", 0],
			"sf/character.bubble": ["m5 8 6 6m-7 0 6-6 2-3M2 5h12M7 2h1m14 20-5-10-5 10m2-4h6", 0],
			"bag": ["M5 8h14v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8ZM9 8V6.5a3 3 0 0 1 6 0V8", 0],
			"sf/bag": ["M5 8h14v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8ZM9 8V6.5a3 3 0 0 1 6 0V8", 0],
			"bag-fill": ["M4 8h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8ZM8 8V6.5a4 4 0 0 1 8 0V8h-2V6.5a2 2 0 0 0-4 0V8Z", 1],
			"sf/bag.fill": ["M4 8h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8ZM8 8V6.5a4 4 0 0 1 8 0V8h-2V6.5a2 2 0 0 0-4 0V8Z", 1],
			"phone": ["M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z", 0],
			"sf/phone": ["M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z", 0],
			"smartphone": ["M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM10.5 5h3", 0],
			"sf/iphone": ["M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM10.5 5h3", 0],
			"article": ["M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8.5 8h7M8.5 12h7M8.5 16h4", 0],
			"sf/doc.plaintext": ["M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8.5 8h7M8.5 12h7M8.5 16h4", 0],
			"radio": ["M4 9h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1ZM6 9l12-5M10.5 14.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM14 13h4M14 16h4", 0],
			"sf/radio": ["M4 9h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1ZM6 9l12-5M10.5 14.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM14 13h4M14 16h4", 0]
		};
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/symbols.js
	const Images = /* @__PURE__ */ new Set();
	const image = (e) => {
		if (!Images.has(e)) {
			Images.add(e);
			onEnd(() => Images.delete(e));
		}
	};
	Hooks.image = (e) => {
		const s = e.getAttribute("data-symbol-source");
		if (s?.startsWith("symbol:icon|")) draw(e, s.slice(7));
		else image(e);
	};
	let Table = {};
	let All = null;
	function schedule() {}
	const iconForm = (name) => {
		const f = [];
		let rest = name.slice(5);
		for (let i = 0; i < 3; i++) {
			const at = rest.indexOf("|");
			if (at < 0) return null;
			f.push(rest.slice(0, at));
			rest = rest.slice(at + 1);
		}
		const [, box, raw] = f, colon = raw.indexOf(":");
		let path = raw, evenOdd = 0;
		if (colon >= 0) {
			const rule = raw.slice(0, colon), d = raw.slice(colon + 1);
			if (rule !== "evenodd" || !d.trim() || d.includes(":")) return null;
			path = d;
			evenOdd = 1;
		}
		return [
			path,
			1,
			box,
			path ? "" : rest,
			evenOdd
		];
	};
	const draw = (e, name) => {
		image(e);
		const form = name.startsWith("icon|") ? iconForm(name) : void 0;
		const [path, filled, box, file, evenOdd] = form === void 0 ? Object.hasOwn(Table, name) ? Table[name] : [""] : form ?? [
			"",
			0,
			"",
			"",
			0
		];
		e.toggleAttribute("data-symbol-file", !!file);
		if (file) {
			for (const a of [
				"data-symbol-path",
				"data-symbol-viewbox",
				"data-symbol-nonzero",
				"data-symbol-evenodd"
			]) e.removeAttribute(a);
			e.style.removeProperty("--exact-symbol-mask");
			e.symbolKey = e.symbolMask = null;
			e.src = `assets/${file}`;
			return;
		}
		e.setAttribute("data-symbol-path", path);
		e.toggleAttribute("data-symbol-fill", !!filled);
		e.toggleAttribute("data-symbol-nonzero", (!!form || !!box) && !evenOdd);
		e.toggleAttribute("data-symbol-evenodd", (!!form || !!box) && !!evenOdd);
		if (box) e.setAttribute("data-symbol-viewbox", box);
		else e.removeAttribute("data-symbol-viewbox");
	};
	function everyRole() {
		inflight.n++;
		All = Promise.resolve().then(() => (init_symbol_roles(), symbol_roles_exports)).then((m) => {
			Table = {
				...m.default,
				...Table
			};
			All = true;
			for (const e of document.querySelectorAll("#exact-root img[data-symbol-source]")) draw(e, e.getAttribute("data-symbol-source").slice(7));
		}).finally(() => inflight.n--);
	}
	const STYLE = "@property --exact-tint{syntax:\"<color>\";inherits:false;initial-value:#000}:where(img[data-symbol-path]){--exact-tint:currentcolor}img[data-symbol-path]{background-color:var(--exact-tint)!important;mask-image:var(--exact-symbol-mask);mask-repeat:no-repeat;mask-position:center;mask-size:var(--exact-symbol-fit,contain);mask-origin:content-box;mask-clip:content-box}";
	/** `table`: role → [path, filled], for sources a binding names. */
	function symbols(table) {
		Table = table;
		if (typeof document === "undefined") return;
		document.head.append(Object.assign(document.createElement("style"), { textContent: STYLE }));
		const prior = PropHooks.src;
		PropHooks.src = (e, v) => {
			if (prior?.(e, v)) return true;
			if (!v?.startsWith("symbol:")) unsymbol(e);
			if (e.localName === "img" && v?.startsWith("app:/")) {
				appSource(e, v);
				return true;
			}
			if (e.localName === "img" && e.$app) {
				e.$app = null;
				e.removeAttribute("data-app-src");
			}
			if (e.localName === "img" && v?.startsWith("data:") && v.length > DATA_LIMIT) {
				journal$1.push(`t=${clock$1.now} image refused: a data: source is over ${DATA_LIMIT} bytes`);
				e.removeAttribute("src");
				return true;
			}
			if (e.localName !== "img" || !v?.startsWith("symbol:")) {
				template(e, v);
				return false;
			}
			template(e, null);
			if (!Object.hasOwn(Table, v.slice(7)) && !All && !v.startsWith("symbol:icon|")) everyRole();
			e.setAttribute("data-symbol-source", v);
			draw(e, v.slice(7));
			if (!e.getAttribute("alt")) e.alt = "";
			return true;
		};
		After.push(schedule);
	}
	function unsymbol(e) {
		if (!e.hasAttribute?.("data-symbol-source") && !e.hasAttribute?.("data-symbol-path")) return;
		for (const a of [
			"data-symbol-path",
			"data-symbol-fill",
			"data-symbol-source",
			"data-symbol-viewbox",
			"data-symbol-nonzero",
			"data-symbol-evenodd",
			"data-symbol-file"
		]) e.removeAttribute(a);
		e.style.removeProperty("--exact-symbol-mask");
		e.style.removeProperty("--exact-symbol-fit");
		if (e.getAttribute("src") === e.symbolPlaceholder) e.removeAttribute("src");
		e.symbolKey = e.symbolMask = e.symbolPlaceholder = e.symbolRefusal = null;
	}
	let Files = null;
	const DATA_LIMIT = 1048576;
	function appSource(e, v) {
		image(e);
		e.$app = v;
		if (e.getAttribute("data-app-src") !== v) e.setAttribute("data-app-src", v);
		inflight.n++;
		(Files ??= import(new URL("./picker-glue.js", "file:///workspace/pj-expo-rf-vault/proyectos/exact-proyectos/contador/target/web-dist.stage-KeV3vD/app.js").href).then(() => globalThis.exact.appURL)).then((appURL) => appURL(v, data.appId)).then((url) => {
			if (e.$app === v && e.getAttribute("src") !== url) {
				if (url) e.setAttribute("src", url);
				else e.removeAttribute("src");
				template(e, url || null);
			}
		}).catch(() => {}).finally(() => inflight.n--);
	}
	const TEMPLATE = [
		"mask-image",
		"mask-size",
		"mask-repeat",
		"mask-position",
		"mask-origin",
		"mask-clip",
		"object-position"
	];
	let Tints = null;
	let Sheets = 0;
	const collect = (rules, into) => {
		for (const r of rules) {
			if (r.selectorText && r.style?.getPropertyValue("--exact-tint")) into.add(r.selectorText.replace(/^&\s*/, ""));
			if (r.cssRules) collect(r.cssRules, into);
		}
	};
	const tints = () => {
		const n = document.styleSheets.length;
		if (!Tints || n !== Sheets) {
			Sheets = n;
			Tints = /* @__PURE__ */ new Set();
			for (const sh of document.styleSheets) try {
				collect(sh.cssRules, Tints);
			} catch {}
		}
		return Tints;
	};
	const tinted = (e) => !!e.style.getPropertyValue("--exact-tint") || e.classList.length > 0 && [...e.classList].some((c) => tints().has("." + c));
	function template(e, v) {
		if (e.localName !== "img" || !v || !tinted(e)) {
			if (e.$template) {
				for (const p of TEMPLATE) e.style.removeProperty(p);
				e.style.removeProperty("background-color");
				e.$template = false;
			}
			return;
		}
		const fit = getComputedStyle(e).objectFit, size = {
			fill: "100% 100%",
			contain: "contain",
			cover: "cover",
			none: "auto"
		}[fit] ?? "var(--exact-tint-fit,contain)";
		e.style.setProperty("background-color", "var(--exact-tint)");
		e.style.setProperty("mask-image", `url(${JSON.stringify(v)})`);
		e.style.setProperty("mask-size", size);
		e.style.setProperty("mask-repeat", "no-repeat");
		e.style.setProperty("mask-position", "center");
		e.style.setProperty("mask-origin", "content-box");
		e.style.setProperty("mask-clip", "content-box");
		e.style.setProperty("object-position", "-100000px 0");
		e.$template = true;
		if (fit === "scale-down") {
			const set = () => {
				const cs = getComputedStyle(e);
				e.style.setProperty("--exact-tint-fit", e.naturalWidth <= e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) && e.naturalHeight <= e.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) ? "auto" : "contain");
			};
			if (e.complete) set();
			else e.addEventListener("load", set, { once: true });
		}
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/app.js
	init_navigation();
	function app_default() {
		routes([[
			"home",
			"/",
			-1,
			0,
			0
		], [
			"notfound",
			"",
			-1,
			0,
			1
		]]);
		const s_0 = sig(launch(launchLocation()));
		const s_1 = sig(0, "n");
		const r_0 = res("greeting", "greeting", () => ["Contador"], void 0, void 0, "{s}", [""]);
		const a_0 = act(() => {
			W(s_1, s_1() + 1);
		});
		const a_1 = act(() => {
			W(s_1, s_1() - 1);
		});
		symbols({});
		usePaint(paintUse());
		mount(($R) => {
			const e0 = h($R, "main", 1, {
				"data-exact-f": "133",
				"data-testid": "root",
				"navigationBack": "",
				"data-site": "0"
			}, 0);
			P(e0, "navigationKey", pf(0, () => x_toString(x_top(s_0())[0])));
			each(e0, () => x_stack(s_0()), (i0, x0) => i0()[0], (p, i0, x0) => {
				when(p, () => i0()[1] === "notfound", (p) => {
					const e1 = h(p, "div", 2, {
						"data-exact-f": "4609",
						"data-testid": "not-found",
						"data-site": "1"
					}, 0);
					fm(1, () => {
						const p1_2 = pf(1, () => x_toString(i0()[0]));
						P(e1, "navigationKey", p1_2);
					});
					h(h(e1, "header", 3, {
						"data-exact-f": "4096",
						"data-site": "2"
					}, 0), "h2", 4, {
						"aria-level": "2",
						"data-exact-f": "2048",
						"data-exact-text": "",
						"data-fontshorthand": "true",
						"role": "heading",
						"data-site": "3"
					}, "Not Found");
					const e4 = h(e1, "div", 5, {
						"data-exact-f": "4096",
						"data-site": "4"
					}, 0);
					h(e4, "img", 6, {
						"alt": "",
						"aria-hidden": "true",
						"data-exact-f": "4",
						"data-symbol-path": "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v6M12 16.5h.01",
						"data-symbol-source": "symbol:alert",
						"src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'/%3E",
						"decoding": "async",
						"data-site": "5"
					}, 0);
					h(e4, "div", 7, {
						"data-exact-f": "2048",
						"data-exact-text": "",
						"data-fontshorthand": "true",
						"data-testid": "not-found-title",
						"data-site": "6"
					}, "Page not found");
					const e7 = h(e4, "div", 8, {
						"data-exact-f": "2048",
						"data-exact-text": "",
						"data-testid": "not-found-message",
						"data-site": "7"
					}, 0);
					fm(4, () => {
						const p7_0 = pf(7, tg(e7, 7, "text", () => cc(cc("There is no page at ", i0()[2], 11), ".", 17)));
						P(e7, "text", p7_0);
					});
					h(h(e4, "a", 9, {
						"data-exact-f": "0",
						"data-testid": "not-found-home",
						"href": "/",
						"data-view": "",
						"data-site": "8"
					}, 0), "div", 10, {
						"data-exact-f": "2048",
						"data-exact-text": "",
						"data-site": "9"
					}, "Go Home");
				}, (p) => {
					const e10 = h(p, "div", 2, {
						"data-exact-f": "4609",
						"data-navigationscroll": "content",
						"data-site": "10"
					}, 0);
					fm(1, () => {
						const p10_2 = pf(10, () => x_toString(i0()[0]));
						P(e10, "navigationKey", p10_2);
					});
					h(h(e10, "header", 11, {
						"data-exact-f": "4096",
						"data-site": "11"
					}, 0), "h1", 12, {
						"aria-level": "1",
						"data-exact-f": "2048",
						"data-exact-text": "",
						"data-fontshorthand": "true",
						"role": "heading",
						"data-site": "12"
					}, "Contador");
					const e14 = h(h(e10, "div", 13, {
						"data-exact-f": "1",
						"data-scroll": "true",
						"id": "content",
						"data-site": "13"
					}, 0), "div", 14, {
						"data-exact-f": "4096",
						"data-site": "14"
					}, 0);
					P(h(e14, "div", 0, {
						"data-exact-f": "2048",
						"data-exact-text": "",
						"data-testid": "count",
						"data-site": "15"
					}, 0), "text", pf(15, () => x_toString(s_1())));
					const e16 = h(e14, "div", 15, {
						"data-exact-f": "4096",
						"data-site": "16"
					}, 0);
					pressFeedback();
					const e17 = h(e16, "button", 16, {
						"aria-label": "Sumar uno",
						"data-button-style": "bordered",
						"data-exact-f": "28672",
						"data-exact-router-press": "false",
						"data-native": "",
						"data-testid": "inc",
						"type": "button",
						"data-site": "17",
						"data-exact-on": "press"
					}, 0);
					on(e17, "press", a_0, onPress);
					h(e17, "img", 0, {
						"alt": "",
						"data-exact-f": "4",
						"data-symbol-path": "M12 5v14M5 12h14",
						"data-symbol-source": "symbol:add",
						"src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'/%3E",
						"decoding": "async",
						"data-site": "18"
					}, 0);
					pressFeedback();
					const e19 = h(e16, "button", 16, {
						"aria-label": "Restar uno",
						"data-button-style": "bordered",
						"data-exact-f": "28672",
						"data-exact-router-press": "false",
						"data-native": "",
						"data-testid": "dec",
						"type": "button",
						"data-site": "19",
						"data-exact-on": "press"
					}, 0);
					on(e19, "press", a_1, onPress);
					h(e19, "img", 0, {
						"alt": "",
						"data-exact-f": "4",
						"data-symbol-path": "M5 12h14",
						"data-symbol-source": "symbol:minus",
						"src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'/%3E",
						"decoding": "async",
						"data-site": "20"
					}, 0);
				});
			}, 1);
		});
		router(s_0, navigation);
		return [
			[s_0, s_1],
			[],
			[r_0]
		];
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/facts.js
	init_navigation();
	const CONTRAST = [
		"no-preference",
		"more",
		"less",
		"custom"
	];
	const GAMUT = [
		"srgb",
		"p3",
		"rec2020",
		"rec2020"
	];
	/** Every viewport fact, by the runner's names, as the page reads them now. */
	function viewportFacts(geometry = false) {
		const p = preferences(), f = fold();
		const env = geometry && globalThis.document?.body ? environment() : {};
		const [safeAreaTop, safeAreaRight, safeAreaBottom, safeAreaLeft] = [
			"top",
			"right",
			"bottom",
			"left"
		].map((edge) => env[`safe-area-inset-${edge}`] ?? 0);
		const segments = (f.cols === 1 && f.rows === 1 ? [[
			0,
			0,
			innerWidth,
			innerHeight
		]] : f.rects ?? []).map(([x, y, width, height]) => ({
			x,
			y,
			width,
			height
		}));
		return {
			width: innerWidth,
			height: innerHeight,
			safeAreaTop,
			safeAreaRight,
			safeAreaBottom,
			safeAreaLeft,
			segments,
			devicePixelRatio: Number.isFinite(globalThis.devicePixelRatio) && globalThis.devicePixelRatio > 0 ? globalThis.devicePixelRatio : null,
			prefersReducedMotion: !!(p & 1),
			prefersReducedTransparency: !!(p & 2),
			displayMode: displayMode(),
			update: UPDATES[updateCode()],
			prefersContrast: CONTRAST[p >> 2 & 3],
			prefersColorScheme: p & 16 ? "dark" : "light",
			devicePosture: f.posture,
			horizontalViewportSegments: f.cols,
			verticalViewportSegments: f.rows,
			colorGamut: GAMUT[p >>> 26 & 3],
			dynamicRange: p & 1 << 28 ? "high" : "standard",
			pointer: p & 64 ? "none" : p & 32 ? "coarse" : "fine",
			hover: p & 128 ? "none" : "hover",
			accessibilityTextSize: false,
			keyboardHeight: keyboardInset(),
			gpuTier: reporter()?.read()["gpu-tier"] ?? "high"
		};
	}
	let pageFacts;
	const reporter = () => pageFacts !== void 0 ? pageFacts : pageFacts = typeof document === "object" && document.createElement ? pageReporter(typeof location === "object" && new URLSearchParams(location.search).has("agent")) : null;
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/checkpoint.js
	init_navigation();
	function encode(v, t) {
		if (t === "n") return Object.is(v, -0) ? "-0" : Number.isFinite(v) ? JSON.stringify(v) : `{"n":"${v}"}`;
		if (t === "b") return v ? "true" : "false";
		if (t === "s") return JSON.stringify(v);
		if (t === "u") return "null";
		if (Array.isArray(t) && t[0] === "?") return v == null ? "{}" : `{"s":${encode(v, t[1])}}`;
		if (Array.isArray(t)) return `[${v.map((x) => encode(x, t[1])).join(",")}]`;
		return `{"r":[${Object.keys(t).map((k, i) => encode(v[i], t[k])).join(",")}]}`;
	}
	/** The page's checkpoint answers as JSON text (`answers`), with the indices in them of those the reader's page shows
	* and asks again (`open`) and of those that read the store (`readers`).
	* `resources` are the plan's declared resources in plan order, as `types` are, and a list writes each element's answer
	* in the list's order. */
	function answers(resources, types, sourceTypes) {
		const out = [], open = [], readers = [];
		const write = (r, type) => {
			if (r.settled === void 0 || r.owned) return;
			const params = sourceTypes[r.source]?.[0] ?? [];
			if (r.ticket || data.watchedInRender?.has(r.name) || data.refusedInRender?.has(r.name)) open.push(out.length);
			if (r.store) readers.push(out.length);
			out.push(`[${JSON.stringify(r.name)},${JSON.stringify(r.source)},[${r.settled.map((a, k) => encode(a, params[k] ?? "s")).join(",")}],${encode(r.value, type)}]`);
		};
		resources.forEach(({ r }, i) => r.each ? r.members().forEach((element) => write(element, types[i][1])) : write(r, types[i]));
		return {
			answers: `[${out.join(",")}]`,
			open,
			readers
		};
	}
	let Dev;
	function dev() {
		if (Dev !== void 0) return Dev;
		const el = typeof document === "object" && document.querySelector("script[type=\"application/vnd.exact.dev-checkpoint\"]");
		if (!el) return Dev = null;
		Dev = JSON.parse(el.textContent);
		clock$1.now = Number.isFinite(Dev.time) ? Dev.time : 0;
		return Dev;
	}
	/** A tab panel's state, `slot@panel`, made when the panel is built (emit's `owned`; LLP 1075.003 §9.14): the capture
	* (dev.mjs) takes each live one, and what the last reload carried for a panel not built since. */
	const Panels = globalThis.__exactDevPanels = {
		live: /* @__PURE__ */ new Set(),
		used: /* @__PURE__ */ new Set(),
		left: () => (dev()?.slots ?? []).filter((s) => s[0].includes("@") && !Panels.used.has(s[0]))
	};
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/typescript/app.ts
	const sources = { greeting: ([name]) => ({ text: `Hello from ${name}.` }) };
	const answer = (source, args, store, storage, native) => sources[source](args, store, storage, native);
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/uploads.js
	function refuseStreamBody(body) {
		try {
			streamLocked.call(body);
		} catch {
			return;
		}
		throw new TypeError("fetch: ReadableStream request bodies are unavailable; collect the bytes with new Response(body).arrayBuffer() first");
	}
	/** The uploads of `r` whose ticket was let go once that commit stood (rt.js `closeLetGo` closes it): each is cut off
	* if it reached the network, and forgotten if it never did. */
	function cutOff(r) {
		for (const t of new Set(r.marks.filter((m) => m.t?.closed).map((m) => m.t))) uploadEnded(r, t, { failed: INTERRUPTED });
	}
	/** The upload `r` asked at arguments `a`, if it did. */
	function uploadAt(r, a) {
		cutOff(r);
		return r.marks.findLast((m) => equal(m.args, identity(r, a)));
	}
	/** `r` asked an upload at `a`, on its way as ticket `t`. */
	function uploadSent(r, a, t) {
		cutOff(r);
		const args = identity(r, a);
		r.marks = [...r.marks.filter((m) => !equal(m.args, args)), {
			args,
			t
		}];
	}
	/** Ticket `t`'s upload ended (`{ v }`, or `{ failed: [error, code, reason] }`) once it reached the network (`t.ctl.sent`: its
	* start or its first bytes sent); one that never did is forgotten, an ordinary answer that `refresh` asks again. Of the
	* resource's ended uploads only the newest `ANSWERS_KEPT` keep how they ended. */
	function uploadEnded(r, t, how) {
		if (!t.ctl?.sent) {
			r.marks = r.marks.filter((m) => m.t !== t);
			return;
		}
		const marks = r.marks.map((m) => m.t === t ? {
			args: m.args,
			...how
		} : m);
		let over = marks.filter((m) => m.v !== void 0 || m.failed).length - ANSWERS_KEPT;
		r.marks = marks.map((m) => over > 0 && (m.v !== void 0 || m.failed) && over-- ? {
			args: m.args,
			gone: true
		} : m);
	}
	/** What `r` answers at arguments `a` its upload `mark` was asked at, in place of asking its source: its ticket goes on for
	* them (the same request, LLP 1054.000.000 D3), or it answers as it ended, while that still fits, or with its failure, or
	* that it was sent already. */
	function uploadAnswer(r, mark, a, { take, fails, release }) {
		if (mark.t && mark.t === r.ticket) {
			r.ticket.args = a;
			return r.value;
		}
		if (mark.v === void 0) return fails(a, ...mark.gone ? ALREADY_SENT : mark.failed ?? INTERRUPTED);
		if (!equal(a, r.settled) || r.ticket) {
			try {
				take(mark.v, a, r.origin);
			} catch {
				return fails(a, "the upload's answer no longer fits the resource's shape; it is not sent again at these arguments", "shape", "interrupted");
			}
			release();
		}
		return r.value;
	}
	/** `reply`'s callbacks for resource `r`'s ticket `t` (rt.js `res`), the answer's `f` and the failure's `gone`; for an
	* upload they keep how it ended. Its mark is made now, or, for an answer that opens its upload in a later turn
	* (ts-data.js `late`), when it does (`t.uploading`). */
	function ends(r, t, f, next, gone) {
		const marked = () => uploadSent(r, t.args, t);
		if (t.upload) marked();
		else t.uploading = marked;
		return [
			(p, o) => {
				f(p, o);
				if (t.upload && !o.more) uploadEnded(r, t, { v: p.v });
			},
			next,
			(error, code, reason) => {
				if (t.upload) uploadEnded(r, t, { failed: [
					error,
					code,
					reason
				] });
				gone(error, code, reason);
			}
		];
	}
	/** The identity of an upload's request (`exactUploadProgress`) among `fetch`'s arguments, which the same request for newer
	* arguments shares (D3): its URL, method, headers, body (by length and FNV-1a), file, deadline, cache mode and redirect mode. */
	function requestKey({ input, init, redirect }) {
		if (init?.exactUploadProgress !== true) return void 0;
		const request = typeof Request === "function" && input instanceof Request ? input : null, body = init.body;
		refuseStreamBody(body);
		const bytes = body == null ? null : body instanceof ArrayBuffer ? new Uint8Array(body) : ArrayBuffer.isView(body) ? new Uint8Array(body.buffer, body.byteOffset, body.byteLength) : new TextEncoder().encode(String(body));
		let hash = 2166136261;
		for (const b of bytes ?? []) hash = Math.imul(hash ^ b, 16777619) >>> 0;
		return JSON.stringify([
			request ? request.url : String(input),
			init.method ?? request?.method ?? "GET",
			[...new Headers(init.headers ?? request?.headers ?? [])].sort(),
			bytes ? [bytes.length, hash] : null,
			init.exactBodyFrom ?? null,
			init.exactTimeout ?? null,
			init.cache ?? request?.cache ?? "default",
			redirect ?? null
		]);
	}
	var INTERRUPTED, ANSWERS_KEPT, ALREADY_SENT, identity, streamLocked, ledger;
	var init_uploads = __esmMin((() => {
		init_shape();
		INTERRUPTED = [
			"the upload was cut off before its reply; it is not sent again at these arguments",
			"error",
			"interrupted"
		];
		ANSWERS_KEPT = 32;
		ALREADY_SENT = [
			`already sent: the upload went out at these arguments, and of a resource's uploads only the newest ${ANSWERS_KEPT} keep their answers; give new arguments to send it again`,
			"error",
			"already-sent"
		];
		identity = (r, a) => r.context ? a.slice(0, a.length - r.context) : a;
		streamLocked = Object.getOwnPropertyDescriptor(ReadableStream.prototype, "locked").get;
		ledger = {
			at: uploadAt,
			answer: uploadAnswer,
			ends,
			/** The same request goes on for newer arguments `a` (D3): an upload's mark covers them too. What `r` shows meanwhile. */
			kept: (r, a) => {
				if (r.ticket.upload) uploadSent(r, a, r.ticket);
				return r.value;
			}
		};
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/http-body.js
	async function boundedHttpBody(response, limit) {
		if (limit == null) limit = 67108864;
		if (!Number.isInteger(limit) || limit < 1 || limit > 67108864) throw Error("invalid HTTP response limit");
		if (!response.body) return /* @__PURE__ */ new Uint8Array();
		const reader = response.body.getReader(), chunks = [];
		let size = 0;
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				size += value.length;
				if (size > limit) throw Object.assign(Error("HTTP response exceeds limit"), { kind: "Refused" });
				if (value.length) chunks.push(value);
			}
		} catch (error) {
			await reader.cancel().catch(() => {});
			throw error;
		} finally {
			reader.releaseLock();
		}
		const bytes = new Uint8Array(size);
		let at = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, at);
			at += chunk.length;
		}
		return bytes;
	}
	function eventStream(limit) {
		const decoder = new TextDecoder("utf-8", { ignoreBOM: true });
		let line = "", lineBytes = 0, afterCr = false, started = false, event = "", data = "", dataBytes = 0, hasData = false, id = "";
		const done = (out) => {
			if (!started) {
				started = true;
				if (line.startsWith("﻿")) line = line.slice(1);
			}
			const text = line;
			line = "";
			if (text === "") {
				const type = event;
				event = "";
				if (!hasData) {
					data = "";
					dataBytes = 0;
					return;
				}
				hasData = false;
				out.push({
					event: type,
					id,
					data: data.endsWith("\n") ? data.slice(0, -1) : data
				});
				data = "";
				dataBytes = 0;
				return;
			}
			if (text.startsWith(":")) return;
			const colon = text.indexOf(":");
			const field = colon < 0 ? text : text.slice(0, colon);
			let value = colon < 0 ? "" : text.slice(colon + 1);
			if (value.startsWith(" ")) value = value.slice(1);
			if (field === "data") {
				const bytes = utf8Length(value);
				if (dataBytes + bytes > limit) throw Error("an event exceeds the response ceiling");
				data += value + "\n";
				dataBytes += bytes + 1;
				hasData = true;
			} else if (field === "event") event = value;
			else if (field === "id" && !value.includes("\0")) id = value;
		};
		return (bytes, end = false) => {
			for (const byte of bytes ?? []) if (byte === 13 || byte === 10) lineBytes = 0;
			else if (++lineBytes > limit + 64) throw Error("an event exceeds the response ceiling");
			const text = decoder.decode(bytes, { stream: !end }), out = [];
			for (const c of text) {
				if (afterCr) {
					afterCr = false;
					if (c === "\n") continue;
				}
				if (c === "\r" || c === "\n") {
					afterCr = c === "\r";
					done(out);
				} else line += c;
			}
			return out;
		};
	}
	async function readEvents(response, limit, message, controller) {
		const parse = eventStream(limit), reader = response.body.getReader(), encoder = new TextEncoder();
		const failed = (kind, text) => ({
			kind,
			status: 0,
			headers: "",
			body: encoder.encode(text)
		});
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) return failed(1, "the event stream ended");
				const received = performance.now();
				batch(message, parse(value).map((e) => ({
					...e,
					coalesced: 0,
					received
				})));
			}
		} catch (error) {
			await reader.cancel().catch(() => {});
			if (controller.signal.aborted) return failed(4, "request aborted");
			return failed(/ceiling/.test(error?.message) ? 2 : 1, String(error?.message ?? error));
		} finally {
			reader.releaseLock?.();
		}
	}
	async function readBytes(response, limit, message, controller) {
		const reader = response.body.getReader(), encoder = new TextEncoder(), bound = Math.min(limit, 1048576);
		const failed = (kind, text) => ({
			kind,
			status: 0,
			headers: "",
			body: encoder.encode(text)
		});
		let parts = [], size = 0, received = 0, timer = null, pending = null;
		const { promise: stopped, resolve: stop } = Promise.withResolvers();
		const abort = () => {
			stop();
			reader.cancel().catch(() => {});
		};
		controller.signal.addEventListener("abort", abort, { once: true });
		const wait = async () => {
			if (pending) {
				await Promise.race([pending, stopped]);
				pending = null;
			}
			if (controller.signal.aborted) throw new DOMException("request aborted", "AbortError");
		};
		const flush = () => {
			clearTimeout(timer);
			timer = null;
			if (!size) return pending;
			const data = new Uint8Array(size);
			let at = 0;
			for (const p of parts) {
				data.set(p, at);
				at += p.length;
			}
			const m = {
				event: "",
				id: "",
				data: data.buffer,
				coalesced: 0,
				received
			};
			parts = [];
			size = 0;
			pending = Promise.resolve(message(m));
			pending.catch(() => {});
			return pending;
		};
		try {
			for (;;) {
				await wait();
				let { done, value } = await reader.read();
				await wait();
				if (done) {
					flush();
					await wait();
					return failed(1, "the byte stream ended");
				}
				if (!value.length) continue;
				if (size + value.length > bound) {
					flush();
					await wait();
				}
				const now = performance.now();
				for (; value.length > bound; value = value.subarray(bound)) {
					parts = [value.subarray(0, bound)];
					size = bound;
					received = now;
					flush();
					await wait();
				}
				if (!size) received = now;
				parts.push(value);
				size += value.length;
				timer ??= setTimeout(flush, 0);
			}
		} catch (error) {
			clearTimeout(timer);
			await reader.cancel().catch(() => {});
			if (controller.signal.aborted) return failed(4, "request aborted");
			return failed(1, String(error?.message ?? error));
		} finally {
			controller.signal.removeEventListener("abort", abort);
			reader.releaseLock?.();
		}
	}
	async function renderUpload(url, method, headers, body, limit, message, signal, admits) {
		const encoder = new TextEncoder(), failed = (kind, text) => ({
			kind,
			status: 0,
			headers: "",
			body: encoder.encode(String(text))
		});
		if (signal.aborted) return failed(4, "request aborted");
		try {
			message({
				event: "exact:sending",
				id: "\0",
				data: "",
				coalesced: 0,
				received: performance.now()
			});
			const response = await fetch(url, {
				method,
				headers,
				body,
				signal,
				redirect: "follow"
			});
			if (body?.byteLength) message({
				event: "exact:progress",
				id: "\0",
				data: JSON.stringify({
					loaded: body.byteLength,
					total: body.byteLength
				}),
				coalesced: 0,
				received: performance.now()
			});
			if (!response.url && response.type !== "opaqueredirect") {
				await response.body?.cancel();
				return failed(2, "outside the app's grants (net.fetch): response URL is unavailable");
			}
			if (response.url && !admits(response.url)) {
				await response.body?.cancel();
				return failed(2, `outside the app's grants (net.fetch): redirected to ${new URL(response.url).origin}`);
			}
			return {
				kind: 0,
				status: response.status,
				headers: [...response.headers].map(([k, v]) => `${k}: ${v}`).join("\n"),
				body: await boundedHttpBody(response, limit)
			};
		} catch (error) {
			if (signal.aborted) return failed(4, "request aborted");
			return failed(error?.kind === "Refused" ? 2 : 1, error?.message ?? error);
		}
	}
	function upload(url, method, headers, body, limit, message, signal, admits) {
		return renderUpload(url, method, headers, body, limit, message, signal, admits);
	}
	function retryAfter(value, now = Date.now()) {
		const v = value?.trim();
		if (v == null) return null;
		if (/^\d+$/.test(v)) return Math.min(Number(v) * 1e3, 6e4);
		const m = /^[A-Z][a-z]{2}, (\d{2}) ([A-Z][a-z]{2}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/.exec(v);
		if (!m || !MONTHS.includes(m[2]) || +m[1] < 1 || +m[1] > 31 || +m[4] > 23 || +m[5] > 59 || +m[6] > 60) return null;
		return Math.min(Math.max(Date.UTC(+m[3], MONTHS.indexOf(m[2]), +m[1], +m[4], +m[5], +m[6]) - now, 0), 6e4);
	}
	function longPollRefusal(op, method, body) {
		const { cursor, from, sameCursorEvent } = op.longPoll ?? {};
		if (!op.stream) return "exactLongPoll asks again for an answer that keeps coming: it is a stream's";
		const named = (v) => typeof v === "string" && [...v].length >= 1 && [...v].length <= 256;
		if (!/^https?:\/\//i.test(op.url)) return "exactLongPoll: a long poll is HTTP, not a WebSocket";
		if (!/^GET$/i.test(method) || op.bodyFrom != null || body) return "exactLongPoll: a long poll is a GET with no body";
		if (!named(cursor)) return "exactLongPoll.cursor is the query parameter the cursor goes in, a name of 1 to 256 characters";
		if (!named(from) || from.split(".").length > 2 || from.split(".").some((p) => !p)) return "exactLongPoll.from is the reply's field the cursor comes from: a name, or two joined by one `.`, of 1 to 256 characters";
		if (typeof sameCursorEvent !== "boolean") return "exactLongPoll.sameCursor is \"heartbeat\" or \"event\"";
		return null;
	}
	function setQueryValue(url, name, value) {
		const pair = `${unreserved(name)}=${unreserved(value)}`;
		let found = false;
		const query = url.search.slice(1);
		const parts = (query ? query.split("&") : []).flatMap((p) => {
			if (pairName(p) !== name) return [p];
			if (found) return [];
			found = true;
			return [pair];
		});
		if (!found) parts.push(pair);
		url.search = parts.join("&");
	}
	async function readLongPoll(op, init, limit, message, controller, admits) {
		const encoder = new TextEncoder(), { cursor, from, sameCursorEvent } = op.longPoll;
		const failed = (kind, text) => ({
			kind,
			status: 0,
			headers: "",
			body: encoder.encode(text)
		});
		const aborted = () => failed(4, "request aborted");
		const replied = () => controller.replied?.();
		const noEvent = () => {
			replied();
			message({
				event: LONG_POLL_REPLY,
				id: "",
				data: "",
				coalesced: 0,
				received: performance.now()
			});
		};
		const pause = (ms) => new Promise((resolve) => {
			if (controller.signal.aborted) return resolve();
			const done = () => {
				clearTimeout(timer);
				controller.signal.removeEventListener("abort", done);
				resolve();
			};
			const timer = setTimeout(done, ms);
			controller.signal.addEventListener("abort", done, { once: true });
		});
		const cursorOf = (text) => {
			let at;
			try {
				at = JSON.parse(text);
			} catch {
				return;
			}
			for (const part of from.split(".", 2)) {
				if (at == null || typeof at !== "object" || Array.isArray(at) || !Object.hasOwn(at, part)) return void 0;
				at = at[part];
			}
			if (typeof at === "string") return encoder.encode(at).length > 4096 || /[\u0000-\u001f\u007f-\u009f]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/.test(at) ? Error("a long poll's cursor is at most 4096 bytes, with no control characters") : at;
			if (typeof at === "number") return Number.isSafeInteger(at) ? String(at) : Error("a long poll's numeric cursor is a whole number within 2^53: send a larger one as a string");
		};
		let url = new URL(op.url), failures = 0;
		for (;;) {
			if (controller.signal.aborted) return aborted();
			if (!admits(url.href)) {
				replied();
				return failed(2, "outside the app's grants (net.fetch)");
			}
			const asked = url.searchParams.get(cursor), askedAt = performance.now();
			const floor = () => Math.max(0, Math.ceil(longPollTiming.heartbeatMs - (performance.now() - askedAt)));
			const deadline = op.timeoutMs === void 0 ? null : AbortSignal.timeout(op.timeoutMs);
			const signal = deadline ? AbortSignal.any([controller.signal, deadline]) : controller.signal;
			let wait, error = null;
			try {
				if (takeFault(url.href)) throw new TypeError(faultMessage(url.href));
				const response = await fetch(url.href, {
					...init,
					signal
				});
				const drop = () => response.body?.cancel().catch(() => {});
				if (!response.url && response.type !== "opaqueredirect") {
					drop();
					replied();
					return failed(2, "outside the app's grants (net.fetch): response URL is unavailable");
				}
				if (response.url && !admits(response.url)) {
					drop();
					replied();
					return failed(2, `outside the app's grants (net.fetch): redirected to ${new URL(response.url).origin}`);
				}
				const status = response.status, type = response.headers.get("content-type") ?? "";
				if (status === 204 || status === 304) {
					drop();
					failures = 0;
					noEvent();
					wait = floor();
				} else if (BUSY.includes(status)) {
					drop();
					noEvent();
					const after = retryAfter(response.headers.get("retry-after"));
					if (after != null) failures++;
					else {
						const base = Math.min(1e3 * 2 ** Math.min(failures, 5), 3e4);
						failures++;
						wait = Math.round(base * (.8 + .4 * Math.random()));
					}
					wait = Math.max(after ?? wait, floor());
					error = `HTTP ${status}`;
				} else if (status >= 200 && status <= 299 && /^text\/event-stream\s*(;|$)/i.test(type)) {
					drop();
					replied();
					return failed(2, "an event stream under exactLongPoll: a long poll's replies are JSON");
				} else {
					const bytes = await boundedHttpBody(response, limit);
					const headers = [...response.headers].map(([k, v]) => `${k}: ${v}`).join("\n");
					if (status < 200 || status > 299) {
						replied();
						return {
							kind: 0,
							status,
							headers,
							body: bytes
						};
					}
					failures = 0;
					const text = new TextDecoder().decode(bytes);
					if (/^[ \t\n\r]*$/.test(text)) {
						noEvent();
						wait = floor();
					} else {
						const next = cursorOf(text);
						if (next instanceof Error) {
							replied();
							return failed(2, next.message);
						}
						if (next === void 0) {
							replied();
							return {
								kind: 0,
								status,
								headers,
								body: bytes
							};
						}
						if (!sameCursorEvent && asked === next) {
							noEvent();
							wait = floor();
						} else {
							if (controller.signal.aborted) return aborted();
							replied();
							message({
								event: "",
								id: next,
								data: text,
								coalesced: 0,
								received: performance.now()
							});
							setQueryValue(url, cursor, next);
							continue;
						}
					}
				}
			} catch (e) {
				if (controller.signal.aborted) return aborted();
				if (e?.kind === "Refused") {
					replied();
					return failed(2, String(e.message));
				}
				error = deadline?.aborted ? `the request timed out after ${op.timeoutMs} ms` : String(e?.message ?? e) || "a network error";
				const base = Math.min(1e3 * 2 ** Math.min(failures, 5), 3e4);
				failures++;
				wait = Math.max(Math.round(base * (.8 + .4 * Math.random())), floor());
			}
			if (error) controller.retrying = {
				attempt: failures,
				at: performance.now() + wait,
				error
			};
			await pause(wait);
			delete controller.retrying;
		}
	}
	function readSocket(url, limit, message, controller, protocol, idleMs, protocols) {
		const encoder = new TextEncoder(), MAX_BYTES = 1048576, MAX_FRAMES = protocol ? 256 : 4096;
		const failed = (kind, text) => ({
			kind,
			status: 0,
			headers: "",
			body: encoder.encode(text)
		});
		return new Promise((resolve) => {
			let socket, opened = false, ended = false, timer = null, queue = [], stamps = [], bytes = 0, sent = 0, quiet = null;
			const flush = () => {
				clearTimeout(timer);
				timer = null;
				if (ended) return;
				const frames = queue.map((data, i) => ({
					event: "",
					id: "",
					data,
					coalesced: 0,
					protocol: socket.protocol,
					received: stamps[i]
				}));
				queue = [];
				stamps = [];
				bytes = 0;
				if (protocol) frames.forEach((m) => {
					if (!ended) message(m);
				});
				else batch(message, frames);
			};
			const end = (outcome) => {
				if (ended) return;
				ended = true;
				clearTimeout(timer);
				clearTimeout(quiet);
				queue = [];
				stamps = [];
				bytes = 0;
				controller.signal.removeEventListener("abort", abort);
				try {
					socket?.close(1e3);
				} catch {}
				resolve(outcome);
			};
			const abort = () => end(failed(4, "request aborted"));
			const heard = () => {
				if (idleMs === void 0 || ended) return;
				clearTimeout(quiet);
				quiet = setTimeout(() => {
					flush();
					end(failed(10, `nothing arrived for ${idleMs} ms`));
				}, idleMs);
			};
			if (controller.signal.aborted) return abort();
			try {
				socket = new WebSocket(url, socketProtocols(protocols));
			} catch (error) {
				return end(failed(1, String(error?.message ?? error)));
			}
			socket.binaryType = "arraybuffer";
			controller.signal.addEventListener("abort", abort);
			heard();
			const check = (size) => {
				if (ended || socket.readyState !== 1) throw new DOMException("the socket is not open", "InvalidStateError");
				if (!protocol.admit()) throw new Error("outside the app's grants (net.websocket)");
				if (socket.bufferedAmount + size > MAX_BYTES) throw new DOMException("socket buffer exceeds 1 MiB", "QuotaExceededError");
			};
			protocol?.socket(Object.freeze({
				get readyState() {
					return ended ? 3 : socket.readyState;
				},
				get bufferedAmount() {
					return ended ? 0 : socket.bufferedAmount;
				},
				get sent() {
					return sent;
				},
				check,
				send(data) {
					const size = typeof data === "string" ? encoder.encode(data).length : data.byteLength;
					check(size);
					socket.send(data);
					sent++;
				},
				close(code = 1e3, reason = "") {
					check(0);
					if (code !== 1e3 && (!Number.isInteger(code) || code < 3e3 || code > 4999)) throw new DOMException("invalid socket close code", "InvalidAccessError");
					if (typeof reason !== "string" || encoder.encode(reason).length > 123) throw new SyntaxError("socket close reason exceeds 123 UTF-8 bytes");
					socket.close(code, reason);
				}
			}));
			socket.onopen = () => {
				if (ended) return;
				opened = true;
				heard();
				if (protocol) message({
					event: "open",
					id: "",
					data: "",
					coalesced: 0,
					protocol: socket.protocol
				});
			};
			socket.onmessage = (e) => {
				if (ended) return;
				heard();
				if (!protocol && typeof e.data !== "string") return end(failed(2, "a binary message: a socket's messages are text"));
				const size = typeof e.data === "string" ? encoder.encode(e.data).length : e.data.byteLength;
				if (size > limit) {
					flush();
					return end(failed(2, "a message exceeds the response ceiling"));
				}
				if (queue.length >= MAX_FRAMES || bytes + size > MAX_BYTES + limit) {
					flush();
					return end(failed(2, `socket receive queue exceeds ${protocol ? "256 frames" : "4096 messages"} or 1 MiB`));
				}
				queue.push(e.data);
				stamps.push(performance.now());
				bytes += size;
				timer ??= setTimeout(flush, 0);
			};
			socket.onclose = (e) => {
				flush();
				const outcome = failed(1, !opened ? "the socket did not open" : e.reason ? `the socket closed (${e.code}: ${e.reason})` : `the socket closed (${e.code})`);
				if (protocol && opened) outcome.close = {
					code: e.code,
					reason: e.reason,
					wasClean: e.wasClean
				};
				end(outcome);
			};
		});
	}
	async function waitForInflight(waiting, deadline) {
		for (let now = waiting(); now.length; now = waiting()) {
			const remaining = deadline - performance.now();
			if (remaining <= 0) return false;
			let timer;
			const completed = await Promise.race([Promise.race(now).then(() => true), new Promise((resolve) => {
				timer = setTimeout(() => resolve(false), remaining);
			})]);
			clearTimeout(timer);
			if (!completed) return false;
		}
		return true;
	}
	async function request$1(op, { grantSet, loadPageNative, moduleLoader, localAssetURL, controllers, controller = new AbortController(), active = () => true, message = () => {}, bodyFile, bodyTarget, protocol }) {
		const encoder = new TextEncoder();
		const failed = (kind, message) => ({
			kind,
			status: 0,
			headers: "",
			body: encoder.encode(String(message?.message ?? message))
		});
		const { method, url, headers, body, cache } = op, bytes = op.bodyBytes?.length ? op.bodyBytes : null;
		if (!active()) return failed(4, "request source unloaded");
		const pollRefusal = op.longPoll && longPollRefusal(op, method, body || bytes);
		if (pollRefusal) return failed(2, pollRefusal);
		if (op.upload && /^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:/i.test(url)) return failed(2, /^wss?:/i.test(url) ? "exactUploadProgress: a WebSocket sends no body" : "exactUploadProgress: an upload is an http: or https: request");
		const native = url === "exact-native:";
		const effective = scopedGrantSet(grantSet, op.scope), invalid = grantError(effective);
		const asset = method === "GET" && !body && !bytes && Object.keys(headers).length === 0 && /^\/assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.[A-Za-z0-9]+$/.test(url);
		const socket = op.stream && /^wss?:/i.test(url), capability = socket ? "net.websocket" : "net.fetch";
		if (op.protocols?.length && !socket) return failed(2, "exactProtocols: only a WebSocket stream takes protocols");
		if (op.idleTimeoutMs !== void 0 && (!socket || op.longPoll || op.upload)) return failed(2, "only a WebSocket stream takes an idle timeout");
		if (op.idleTimeoutMs !== void 0 && (!Number.isInteger(op.idleTimeoutMs) || op.idleTimeoutMs < 1 || op.idleTimeoutMs > 36e5)) return failed(2, "an idle timeout must be 1 to 3600000 ms");
		if (invalid) return failed(2, invalid);
		if (!native && !asset) try {
			new URL(url);
		} catch (error) {
			return failed(1, error);
		}
		const grant = native || asset ? null : admittingGrant(effective, url, socket ? "websocket" : "fetch");
		if (!native && !asset && !grant) return failed(2, `outside the app's grants (${capability})`);
		const unreached = native || asset ? null : reachRefusal(url, op.origin, op.reachState);
		if (unreached) return failed(2, `NotAllowedError: ${unreached}`);
		if (op.stream && grant) controller.grant = grant;
		if (op.nativeHttp === "independent" && (!Number.isInteger(op.maxResponseBytes) || op.maxResponseBytes < 1 || op.maxResponseBytes > (op.bodyTo == null ? 64 : 1024) * 1024 * 1024)) return failed(2, "invalid independent HTTP response limit");
		if (native) {
			let response;
			try {
				const module = await loadPageNative();
				if (!active()) return failed(4, "request source unloaded");
				response = new Response(await module.later(body));
			} catch (error) {
				response = new Response(String(error?.message ?? error), { status: 500 });
			}
			try {
				return {
					kind: 0,
					status: response.status,
					headers: "",
					body: await boundedHttpBody(response, op.maxResponseBytes)
				};
			} catch (error) {
				return failed(2, error);
			}
		}
		if (op.longPoll) {
			const accept = headers.some(([k]) => k.toLowerCase() === "accept") ? headers : [...headers, ["accept", "application/json"]];
			controllers.add(controller);
			try {
				return await readLongPoll(op, {
					method: "GET",
					headers: accept,
					redirect: redirectFor(op.origin, op.redirect ?? "follow", op.reachState),
					cache: cache === void 0 ? "no-store" : cache,
					...op.mode !== void 0 ? { mode: op.mode } : cache === "only-if-cached" ? { mode: "same-origin" } : {}
				}, op.maxResponseBytes ?? 1048576, message, controller, (u) => active() && admitsNetwork(scopedGrantSet(grantSet, op.scope), u, "fetch"));
			} finally {
				controllers.delete(controller);
				delete controller.retrying;
			}
		}
		if (socket && op.bodyFrom != null) return failed(2, "exactBodyFrom: a WebSocket sends no body");
		if (socket) return readSocket(url, op.maxResponseBytes ?? 1048576, message, controller, protocol && {
			...protocol,
			admit: () => active() && admitsNetwork(scopedGrantSet(grantSet, op.scope), url, "websocket")
		}, op.idleTimeoutMs, op.protocols);
		let decodedBody = bytes ?? void 0;
		try {
			if (body && !bytes) decodedBody = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
		} catch (error) {
			return failed(4, `invalid request body: ${error}`);
		}
		if (op.timeoutMs !== void 0 && (!Number.isInteger(op.timeoutMs) || op.timeoutMs < 1 || op.timeoutMs > 36e5)) return failed(2, "a request timeout must be 1 to 3600000 ms");
		const fileBodyRefusal = () => {
			if (!bodyFile) return failed(3, `exactBodyFrom ${op.bodyFrom}: this host has no app files (no storage here)`);
			if (body || bytes) return failed(2, "fetch: a request has one body: body or exactBodyFrom");
			if (/^(GET|HEAD)$/i.test(method)) return failed(2, "fetch: a GET or HEAD request cannot have a body");
			if (typeof op.bodyFrom !== "string" || !op.bodyFrom.startsWith("app:/")) return failed(2, "exactBodyFrom must be an app:/ path");
			if (new TextEncoder().encode(op.bodyFrom).length > 4096 || /(^|\/)\.\.?(\/|$)|\0/.test(op.bodyFrom.slice(5))) return failed(2, `exactBodyFrom ${op.bodyFrom.slice(0, 256)}: an app:/ path has no . or .. segment, and is at most 4096 bytes`);
			if (!coversPath(effective, "fs.read", op.bodyFrom)) return failed(2, `exactBodyFrom ${op.bodyFrom}: denied: fs.read ${op.bodyFrom}: no grant covers it; grant \`fs.read ${op.bodyFrom}\``);
			return null;
		};
		if (op.bodyFrom != null) return fileBodyRefusal() ?? (controller.signal.aborted ? failed(4, "request aborted") : bodyFile(op.bodyFrom, effective));
		const deadline = op.timeoutMs === void 0 ? null : AbortSignal.timeout(op.timeoutMs);
		const expires = op.timeoutMs === void 0 ? Infinity : performance.now() + op.timeoutMs;
		const expired = () => deadline && !controller.signal.aborted && (deadline.aborted || performance.now() >= expires);
		controllers.add(controller);
		const signal = deadline ? AbortSignal.any([controller.signal, deadline]) : controller.signal;
		let fileBody;
		if (op.bodyFrom != null) {
			const refused = fileBodyRefusal();
			if (refused) return refused;
			if (expired()) return failed(10, `the request timed out after ${op.timeoutMs} ms`);
			if (signal.aborted) return failed(4, "request aborted");
			const stopped = new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
			const reading = bodyFile(op.bodyFrom, effective);
			reading.catch(() => {});
			try {
				fileBody = await Promise.race([reading, stopped]);
			} catch (error) {
				return failed(error?.code === "agent" ? 3 : 2, error);
			}
			if (expired()) return failed(10, `the request timed out after ${op.timeoutMs} ms`);
			if (signal.aborted) return failed(4, "request aborted");
			if (!active()) return failed(4, "request source unloaded");
		}
		let target;
		if (op.bodyTo != null) {
			if (!bodyTarget) return failed(3, `exactBodyTo ${op.bodyTo}: this host has no app files (no storage here)`);
			if (typeof op.bodyTo !== "string" || !op.bodyTo.startsWith("app:/") || new TextEncoder().encode(op.bodyTo).length > 4096 || /(^|\/)\.\.?(\/|$)|\0/.test(op.bodyTo.slice(5))) return failed(2, `exactBodyTo ${String(op.bodyTo).slice(0, 256)}: an app:/ path has no . or .. segment, and is at most 4096 bytes`);
			if (!coversPath(effective, "fs.write", op.bodyTo)) return failed(2, `exactBodyTo ${op.bodyTo}: denied: fs.write ${op.bodyTo}: no grant covers it; grant \`fs.write ${op.bodyTo}\``);
			const stopped = new Promise((resolve) => signal.addEventListener("abort", () => resolve(), { once: true }));
			const opening = bodyTarget(op.bodyTo, effective);
			opening.catch(() => {});
			try {
				target = await Promise.race([opening, stopped]);
			} catch (error) {
				return failed(error?.code === "agent" ? 3 : 2, error);
			}
			if (!target) opening.then((t) => t.close(), () => {});
			const ended = expired() ? failed(10, `the request timed out after ${op.timeoutMs} ms`) : signal.aborted ? failed(4, "request aborted") : !active() ? failed(4, "request source unloaded") : null;
			if (ended) {
				target?.close();
				return ended;
			}
		}
		if (op.stream && op.upload) try {
			if (cache === "only-if-cached") return failed(1, "TypeError: Failed to fetch");
			if (redirectFor(op.origin, "follow", op.reachState) !== "follow") return failed(2, "NotAllowedError: an upload follows its redirects, and one could reach a less public address space before the person answers");
			const o = await upload(url, method, headers, decodedBody ?? fileBody ?? null, op.maxResponseBytes ?? 1048576, message, signal, (u) => admitsNetwork(effective, u, "fetch"));
			return o.kind === 4 && deadline?.aborted && !controller.signal.aborted ? failed(10, `the request timed out after ${op.timeoutMs} ms`) : o;
		} finally {
			controllers.delete(controller);
		}
		const init = {
			method,
			headers,
			redirect: redirectFor(op.origin, op.redirect ?? "follow", op.reachState),
			cache: cache === void 0 ? "default" : cache,
			...op.mode !== void 0 ? { mode: op.mode } : cache === "only-if-cached" ? { mode: "same-origin" } : {},
			signal
		};
		if (decodedBody) init.body = decodedBody;
		else if (fileBody) init.body = fileBody;
		if (op.stream && !headers.some(([k]) => k.toLowerCase() === "accept")) init.headers = [...headers, ["accept", "text/event-stream"]];
		try {
			const early = !asset && moduleLoader?.claim?.(url, init);
			if (!early && !asset && !op.stream && takeFault(url)) return failed(1, faultMessage(url));
			if (!early && expired()) return failed(10, `the request timed out after ${op.timeoutMs} ms`);
			const response = await (early || fetch(asset ? localAssetURL(url) : url, init));
			if (!response.url && response.type !== "opaqueredirect") {
				response.body?.cancel().catch(() => {});
				return failed(2, "outside the app's grants (net.fetch): response URL is unavailable");
			}
			if (response.url && (asset ? new URL(response.url).origin !== location.origin : !admitsNetwork(effective, response.url, "fetch"))) return failed(2, `outside the app's grants (net.fetch): redirected to ${new URL(response.url).origin}`);
			if (op.stream && response.ok && response.body && /^text\/event-stream\s*(;|$)/i.test(response.headers.get("content-type") ?? "")) return await readEvents(response, op.maxResponseBytes ?? 1048576, message, controller);
			if (op.stream && protocol?.bytes && response.ok && response.body) return await readBytes(response, op.maxResponseBytes ?? 1048576, message, controller);
			const headerText = [...response.headers].map(([k, v]) => `${k}: ${v}`).join("\n");
			if (target && response.ok) return {
				kind: 0,
				status: response.status,
				headers: `:exact-body-to: ${await target.put(response, op.maxResponseBytes ?? 1073741824)}\n${headerText}`,
				body: /* @__PURE__ */ new Uint8Array()
			};
			return {
				kind: 0,
				status: response.status,
				headers: headerText,
				body: await boundedHttpBody(response, target ? Math.min(op.maxResponseBytes ?? 1048576, 1048576) : op.maxResponseBytes)
			};
		} catch (error) {
			if (deadline && signal.aborted && signal.reason === deadline.reason) return failed(10, `the request timed out after ${op.timeoutMs} ms`);
			return failed(controller.signal.aborted ? 4 : error?.kind === "Refused" || error?.kind === "Unavailable" ? 2 : 1, error);
		} finally {
			controllers.delete(controller);
			target?.close();
		}
	}
	function streamed(req, grantSet, message, controller, bodyFile, protocol) {
		return request$1({
			method: req.method ?? "GET",
			url: req.url,
			headers: req.headers ?? [],
			body: "",
			bodyBytes: req.raw?.length ? Uint8Array.from(req.raw) : void 0,
			bodyFrom: req.bodyFrom,
			cache: req.forced && req.cache !== "no-store" ? "reload" : req.cache,
			mode: req.mode,
			redirect: req.redirect,
			longPoll: req.longPoll,
			upload: req.upload,
			timeoutMs: req.timeoutMs,
			idleTimeoutMs: req.idleTimeoutMs,
			protocols: req.protocols,
			stream: true,
			maxResponseBytes: req.maxResponseBytes,
			scope: req.scope,
			origin: req.origin ?? "unattributed"
		}, {
			grantSet,
			controllers: /* @__PURE__ */ new Set(),
			controller,
			message,
			bodyFile,
			protocol,
			localAssetURL: (url) => new URL(url, location.href).href,
			loadPageNative: () => Promise.reject(/* @__PURE__ */ new Error("a stream is not a page-module request"))
		});
	}
	var utf8Length, charBytes, batch, longPollTiming, LONG_POLL_REPLY, BUSY, MONTHS, unreserved, formText, pairName;
	var init_http_body = __esmMin((() => {
		init_grant_admission();
		init_faults();
		init_address_space();
		utf8Length = (s) => {
			let n = 0;
			for (const c of s) n += charBytes(c);
			return n;
		};
		charBytes = (c) => {
			const p = c.codePointAt(0);
			return p < 128 ? 1 : p < 2048 ? 2 : p < 65536 ? 3 : 4;
		};
		batch = (message, messages) => messages.forEach((m, i) => message(i < messages.length - 1 ? {
			...m,
			more: true
		} : m));
		longPollTiming = { heartbeatMs: 1e3 };
		LONG_POLL_REPLY = "exact:reply";
		BUSY = [
			408,
			429,
			502,
			503,
			504
		];
		MONTHS = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		];
		unreserved = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
		formText = new TextDecoder("utf-8", { ignoreBOM: true });
		pairName = (pair) => formText.decode(Uint8Array.from(pair.split("=", 1)[0].matchAll(/%[0-9A-Fa-f]{2}|[^]/g), ([c]) => c.length === 3 ? parseInt(c.slice(1), 16) : c === "+" ? 32 : c.charCodeAt(0)));
		if (globalThis.exact) globalThis.exact.httpHelpers = {
			boundedHttpBody,
			waitForInflight,
			request: request$1
		};
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/ts-stream.js
	var ts_stream_exports = /* @__PURE__ */ __exportAll({ open: () => open });
	function request(input, init, redirect, protocols) {
		if (typeof init.exactStream !== "function") throw new TypeError("exactStream maps each event to the answer: (event) => value");
		const independent = init.exactIndependentHttp?.maxResponseBytes;
		if (independent !== void 0 && (!Number.isInteger(independent) || independent <= 0 || independent > 67108864)) throw new TypeError("exactIndependentHttp.maxResponseBytes must be an integer from 1 to 67108864");
		const bodyFrom = init.exactBodyFrom === void 0 ? void 0 : init.exactBodyFrom, refusal = bodyFrom === void 0 ? null : bodyFromRefusal(input, init);
		if (refusal) throw new TypeError(refusal);
		const body = init.body;
		refuseStreamBody(body);
		const raw = body == null ? void 0 : body instanceof ArrayBuffer ? new Uint8Array(body.slice(0)) : ArrayBuffer.isView(body) ? new Uint8Array(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)) : new TextEncoder().encode(String(body));
		const request = typeof Request === "function" && input instanceof Request ? input : null;
		const signal = init.signal !== void 0 ? init.signal : request ? request.signal : null;
		if (signal != null && !isSignal(signal)) throw new TypeError("fetch: init.signal is not an AbortSignal");
		const method = methodOf(input, init), url = request ? request.url : String(input);
		if (init.exactLongPoll !== void 0 && request?.body != null && init.body == null) throw new TypeError("exactLongPoll: a long poll is a GET with no body");
		if (request?.body != null && init.body == null) throw new TypeError("fetch: a Request's body is a ReadableStream, which a stream cannot send; pass its bytes as init.body (await request.arrayBuffer())");
		const upload = uploadOf(init, method, url, redirect), timeoutMs = upload ? init.exactTimeout : void 0;
		if (timeoutMs !== void 0 && (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 36e5)) throw new TypeError("exactTimeout must be an integer number of milliseconds from 1 to 3600000");
		const idle = init.exactIdleTimeout;
		if (idle !== void 0 && (!Number.isInteger(idle) || idle < 1 || idle > 36e5)) throw new TypeError("exactIdleTimeout must be an integer number of milliseconds from 1 to 3600000");
		if (idle !== void 0 && (upload || init.exactLongPoll !== void 0 || !/^wss?:/i.test(url))) throw new TypeError("exactIdleTimeout: only a WebSocket stream takes an idle timeout");
		return {
			method,
			url,
			signal,
			headers: [...new Headers(init.headers ?? request?.headers ?? [])],
			raw,
			bodyFrom,
			cache: init.cache ?? request?.cache,
			mode: init.mode ?? request?.mode,
			redirect,
			maxResponseBytes: independent ?? 1048576,
			longPoll: longPollOf(init.exactLongPoll, method, url),
			upload,
			timeoutMs,
			idleTimeoutMs: idle,
			protocols
		};
	}
	function uploadOf(init, method, url, redirect) {
		const upload = init.exactUploadProgress;
		if (upload === void 0 || upload === false) return void 0;
		if (upload !== true) throw new TypeError("exactUploadProgress is true or false");
		if (/^wss?:/i.test(url)) throw new TypeError("exactUploadProgress: a WebSocket sends no body");
		if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:/i.test(url)) throw new TypeError("exactUploadProgress: an upload is an http: or https: request");
		if (init.exactLongPoll !== void 0) throw new TypeError("exactUploadProgress: a long poll sends no body");
		if (method === "GET" || method === "HEAD") throw new TypeError("exactUploadProgress: a GET or HEAD request sends no body");
		if (redirect !== void 0 && redirect !== "follow") throw new TypeError("exactUploadProgress: an upload follows its redirects");
		return true;
	}
	function longPollOf(poll, method, url) {
		if (poll === void 0) return void 0;
		if (/^wss?:/i.test(url)) throw new TypeError("exactLongPoll: a long poll is HTTP, not a WebSocket");
		if (method !== "GET") throw new TypeError("exactLongPoll: a long poll asks with GET");
		if (poll === null || typeof poll !== "object") throw new TypeError("exactLongPoll is { cursor, from }");
		const name = (k) => typeof poll[k] === "string" && [...poll[k]].length > 0 && [...poll[k]].length <= 256;
		if (!name("cursor")) throw new TypeError("exactLongPoll.cursor is the query parameter the cursor goes in, a name");
		if (!name("from") || poll.from.split(".").length > 2 || poll.from.split(".").some((p) => !p)) throw new TypeError("exactLongPoll.from is the reply's field the cursor comes from, a name, or two joined by one `.`");
		if (poll.sameCursor !== void 0 && poll.sameCursor !== "heartbeat" && poll.sameCursor !== "event") throw new TypeError("exactLongPoll.sameCursor is \"heartbeat\" (the default) or \"event\"");
		return {
			cursor: poll.cursor,
			from: poll.from,
			sameCursorEvent: poll.sameCursor === "event"
		};
	}
	function later(call) {
		const batch = call.laterOps;
		if (!batch) return;
		call.laterOps = null;
		const go = publish(batch, call);
		const said = (why) => journal.push(`t=${clock.now} answer ${call.name} failed: ${why}; socket frames were refused`);
		const refused = (why) => {
			call.unsent = call.unsent.filter((x) => !batch.includes(x));
			said(why);
		};
		const run = Object.assign(() => {
			if (letGo(call)) return refused("the answer was let go");
			try {
				go();
			} catch (e) {
				said(e?.message ?? e);
			}
		}, { refused });
		if (call.stood) run();
		else if (call.stood === false) refused("the commit that asked it was refused");
		else (call.waiting ??= []).push(run);
	}
	function handle(transport, owner) {
		const encoder = new TextEncoder();
		answering.sockets = true;
		const turn = () => answering.mapper?.owner === owner ? answering.mapper : answering.call;
		const stage = (op, data, reason, size = 0) => {
			const call = turn(), mapper = !!call && call === answering.mapper, answer = !!call && !mapper && !call.mutation;
			if (!mapper && !call) throw new Error(`socket.${op} is only available in an answer's own turns (its source, its code after an \`await\` in an async function, its timer), or its socket's own mapper`);
			const resumed = !mapper && !call.turn;
			if (resumed && (!call.flight || !answers$1(call) || call.stood === false)) throw new DOMException(`socket.${op}: the answer has given its value or was let go`, "InvalidStateError");
			if (owner.signal.aborted || owner.active?.() === false || (answer || resumed) && !owner.resource) throw new DOMException("the socket is not open", "InvalidStateError");
			if (!mapper && !answer && !resumed && call.fetched) {
				call.socketConflict = true;
				throw new Error(SOCKET_AND_FETCH);
			}
			const over = (e) => {
				if (mapper && e.name === "QuotaExceededError") call.overload = e;
				return e;
			};
			const kind = mapper ? "mapper call" : answer || resumed ? "answer" : "mutation";
			const all = call.socketAll ??= [], unsent = call.unsent ??= [];
			if (all.length >= 256) throw over(new DOMException(`socket ${kind} exceeds 256 operations`, "QuotaExceededError"));
			if (call.closed?.has(transport)) throw new DOMException("the socket is not open", "InvalidStateError");
			if (all.reduce((n, x) => n + x.size, 0) + size > 1048576) throw over(new DOMException(`socket ${kind} exceeds 1 MiB`, "QuotaExceededError"));
			try {
				transport.check(unsent.reduce((n, x) => x.transport === transport ? n + x.size : n, 0) + size);
			} catch (e) {
				throw over(e);
			}
			const operations = resumed ? call.laterOps ??= [] : call.socketOps ??= [];
			if (resumed) {
				if (!operations.length) queueMicrotask(() => later(call));
			} else if (!mapper && !operations.length) (call.effects ??= []).push(publish(operations, call));
			const staged = {
				transport,
				owner,
				op,
				data,
				reason,
				size
			};
			operations.push(staged);
			all.push({ size });
			unsent.push(staged);
			if (op === "close") (call.closed ??= /* @__PURE__ */ new Set()).add(transport);
		};
		return Object.freeze({
			get readyState() {
				return owner.signal.aborted ? 3 : transport.readyState;
			},
			get bufferedAmount() {
				const staged = turn()?.unsent ?? [];
				return transport.bufferedAmount + staged.reduce((n, x) => x.transport === transport ? n + x.size : n, 0);
			},
			send(data) {
				let copy, size;
				if (typeof data === "string") {
					copy = data;
					size = encoder.encode(data).length;
				} else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
					copy = (data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength)).slice();
					size = copy.byteLength;
				} else throw new TypeError("socket.send expects a string, ArrayBuffer or ArrayBufferView");
				stage("send", copy, void 0, size);
			},
			close(code = 1e3, reason = "") {
				if (code !== 1e3 && (!Number.isInteger(code) || code < 3e3 || code > 4999)) throw new DOMException("invalid socket close code", "InvalidAccessError");
				if (typeof reason !== "string" || encoder.encode(reason).length > 123) throw new SyntaxError("socket close reason exceeds 123 UTF-8 bytes");
				stage("close", code, reason);
			}
		});
	}
	function open({ input, init, redirect, protocols, origin }, conv, grantSet, deliver, controller) {
		let req;
		try {
			req = request(input, init, redirect, protocols);
			req.forced = !!controller.forced;
			req.origin = origin;
		} catch (e) {
			return Promise.resolve({
				error: String(e?.message ?? e),
				code: failureCode(e),
				reason: failureReason(e)
			});
		}
		const own = req.signal, heard = ownSignal(own), abort = () => controller.abort(own.reason);
		if (own?.aborted) controller.abort(own.reason);
		else heard?.addEventListener("abort", abort, { once: true });
		const map = init.exactStream;
		controller.upload = !!req.upload;
		let socket;
		const protocol = /^wss?:/i.test(req.url) ? { socket: (transport) => {
			socket = handle(transport, controller);
			controller.socket = transport;
		} } : { bytes: true };
		const refused = (why) => journal.push(`t=${clock.now} mapper ${controller.streamName} failed: ${why}; socket frames were refused`);
		const failed = (e, turn) => {
			if (turn?.socketOps?.length) refused(e?.message ?? e);
			return {
				error: String(e?.message ?? e),
				code: failureCode(e),
				reason: failureReason(e)
			};
		};
		const value = (event, frame) => {
			if (controller.active?.() === false) return {
				error: "the stream was let go",
				code: "error"
			};
			const turn = socket && frame ? answering.mapper = {
				owner: controller,
				socketOps: null,
				overload: null
			} : null;
			const outer = {
				call: answering.call,
				mapperCall: answering.mapperCall
			};
			answering.call = null;
			let ended = false;
			answering.mapperCall = { get settled() {
				return ended || controller.active?.() === false;
			} };
			try {
				const v = map(event, socket);
				if (turn?.overload) throw turn.overload;
				if (turn?.socketOps?.length && !controller.resource) throw new DOMException("the socket is not open", "InvalidStateError");
				const ops = turn?.socketOps, effects = ops?.length ? [Object.assign(() => {
					try {
						publish(ops)();
					} catch (e) {
						refused(e?.message ?? e);
					}
				}, { refused })] : null;
				if (!v || typeof v.then !== "function") {
					ended = true;
					return effects ? {
						v: conv(v),
						effects
					} : { v: conv(v) };
				}
				effects?.[0]();
				return Promise.resolve(v).then((v) => controller.active?.() === false ? {
					error: "the stream was let go",
					code: "error"
				} : { v: conv(v) }).catch((e) => failed(e)).finally(() => {
					ended = true;
				});
			} catch (e) {
				ended = true;
				return failed(e, turn);
			} finally {
				if (turn) answering.mapper = null;
				Object.assign(answering, outer);
			}
		};
		let behind = null;
		const inOrder = (run) => {
			const r = behind ? behind.then(run) : run();
			if (r && typeof r.then === "function") {
				const done = () => {
					if (behind === at) behind = null;
				}, at = behind = r.then(done, done);
			}
			return r;
		};
		const event = (m) => req.upload && m.event === "exact:progress" ? {
			type: "progress",
			...JSON.parse(m.data),
			lengthComputable: true,
			data: "",
			lastEventId: "",
			coalesced: m.coalesced
		} : {
			type: m.event || "message",
			data: m.data,
			lastEventId: m.id,
			coalesced: m.coalesced,
			protocol: m.protocol
		};
		let batch = [];
		const each = (ms, i = 0) => {
			for (;; i++) {
				const r = value(event(ms[i]), true), at = i, last = (r) => r.error !== void 0 || at === ms.length - 1;
				const done = (r) => last(r) ? deliver({
					...r,
					coalesced: ms[at].coalesced,
					messages: at + 1
				}) : each(ms, at + 1);
				if (r && typeof r.then === "function") return r.then(done);
				if (last(r)) return done(r);
			}
		};
		let held = 0, heldBytes = 0, fellBehind = false;
		const bytesOf = (m) => typeof m.data === "string" ? utf8.encode(m.data).length : m.data.byteLength;
		const message = (m) => {
			controller.sent ||= !!req.upload;
			if (fellBehind || req.longPoll && m.event === "exact:reply" || req.upload && m.event === "exact:sending") return;
			batch.push(m);
			if (m.more) return;
			const ms = batch;
			batch = [];
			if (!behind) {
				inOrder(() => each(ms));
				return behind;
			}
			const bytes = ms.reduce((n, m) => n + bytesOf(m), 0);
			if (held + ms.length > 4096 || heldBytes + bytes > 64 << 20) {
				fellBehind = true;
				deliver({
					error: `the stream's mapper fell behind: ${held} messages (${heldBytes} bytes) waited for its turns, and ${ms.length} more arrived`,
					code: "error"
				});
				return;
			}
			held += ms.length;
			heldBytes += bytes;
			inOrder(() => {
				held -= ms.length;
				heldBytes -= bytes;
				return each(ms);
			});
			return behind;
		};
		const timed = (m) => {
			const g = gate();
			if (!g) return message(m);
			g.enter(controller.streamName, m.received);
			try {
				return message(m);
			} finally {
				g.leave();
			}
		};
		return streamed(req, grantSet, timed, controller, (path, set) => readBodyFile(path, set, controller), protocol).then((o) => {
			gate()?.ended(controller.streamName);
			if (o.close) journal.push(`t=${clock.now} socket close: ${o.close.code} ${o.close.reason} (${controller.streamName})`);
			return inOrder(() => value(o.close ? {
				type: "close",
				data: "",
				lastEventId: "",
				coalesced: 0,
				...o.close
			} : o.kind ? {
				type: "error",
				data: "",
				lastEventId: "",
				coalesced: 0,
				kind: KINDS[o.kind],
				message: said.decode(o.body),
				status: 0
			} : req.upload ? {
				type: "load",
				status: o.status,
				data: said.decode(o.body),
				lastEventId: "",
				coalesced: 0
			} : {
				type: "error",
				data: said.decode(o.body),
				lastEventId: "",
				coalesced: 0,
				kind: "Response",
				message: `HTTP ${o.status}`,
				status: o.status
			}));
		}).finally(() => heard?.removeEventListener("abort", abort));
	}
	var clock, journal, KINDS, said, utf8, publish, gate;
	var init_ts_stream = __esmMin((() => {
		init_http_body();
		init_ts_fetch();
		init_rt_link();
		init_shape();
		init_ts_body_from();
		init_uploads();
		({clock, journal} = rt);
		KINDS = [
			"Response",
			"Network",
			"Refused",
			"Unsupported",
			"Aborted",
			,
			,
			,
			,
			,
			"Timeout"
		];
		said = new TextDecoder();
		utf8 = new TextEncoder();
		publish = (operations, call) => () => {
			if (call?.unsent) call.unsent = call.unsent.filter((x) => !operations.includes(x));
			const totals = /* @__PURE__ */ new Map();
			for (const x of operations) {
				if (x.owner.signal.aborted || x.owner.active?.() === false) throw new DOMException("the socket is not open", "InvalidStateError");
				totals.set(x.transport, (totals.get(x.transport) ?? 0) + x.size);
			}
			for (const [socket, count] of totals) socket.check(count);
			for (const x of operations) {
				x.transport[x.op](x.data, x.reason);
				journal.push(`t=${clock.now} socket ${x.op}: ${x.size} bytes (${x.owner.streamName})`);
			}
		};
		answering.later = later;
		gate = () => globalThis.exact?.streamGate;
	}));
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/ts-data.js
	init_ts_fetch();
	init_admission();
	init_admission_data();
	init_shape();
	init_uploads();
	useFetch(fetch$1);
	const appId = "com.robertflo.contador";
	const ordinary = (start) => (answering.ordinary ?? ((f) => f()))(start);
	answering.page = {
		clock: clock$1,
		journal: journal$1,
		drive,
		time
	};
	const same = (a, b) => a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b;
	const LEAF = [
		(v) => v == null ? null : v,
		(v) => v == null ? null : v,
		true
	];
	const made = /* @__PURE__ */ new WeakMap();
	const frozenTrees = /* @__PURE__ */ new WeakSet();
	function converters(t) {
		if (!t || typeof t === "string") return LEAF;
		let c = made.get(t);
		if (c) return c;
		c = [];
		made.set(t, c);
		if (Array.isArray(t)) {
			const sub = converters(t[1]), leaf = sub[2] === true, named = (v) => sub[0](v), arrays = (v, o) => sub[1](v, o);
			if (t[0] === "?") {
				c[0] = named;
				c[1] = arrays;
				return c;
			}
			c[0] = (v) => v == null ? null : v.map((x) => named(x));
			c[1] = (v, o) => {
				if (v == null) return null;
				if (!Array.isArray(v)) return v.map((x) => arrays(x));
				const n = v.length, was = Array.isArray(o) ? o : null;
				let out = was && was.length === n ? null : [];
				for (let i = 0; i < n; i++) {
					const x = leaf ? v[i] == null ? null : v[i] : arrays(v[i], was?.[i]);
					if (out) out.push(x);
					else if (!same(x, o[i])) {
						out = o.slice(0, i);
						out.push(x);
					}
				}
				return out ?? o;
			};
			return cacheFrozenConversion(c);
		}
		const k = Object.keys(t), n = k.length, subs = k.map((f) => converters(t[f]));
		const leaves = subs.map((s) => s[2] === true);
		c[0] = k.includes("__proto__") ? (v) => v == null ? null : Object.fromEntries(k.map((f, i) => [f, subs[i][0](v[i])])) : (v) => {
			if (v == null) return null;
			const out = {};
			for (let i = 0; i < n; i++) out[k[i]] = leaves[i] ? v[i] == null ? null : v[i] : subs[i][0](v[i]);
			return out;
		};
		c[1] = (v, o) => {
			if (v == null) return null;
			const was = Array.isArray(o) ? o : null;
			let out = was && was.length === n ? null : [];
			for (let i = 0; i < n; i++) {
				const y = v[k[i]], x = leaves[i] ? y == null ? null : y : subs[i][1](y, was?.[i]);
				if (out) out.push(x);
				else if (!same(x, o[i])) {
					out = o.slice(0, i);
					out.push(x);
				}
			}
			return out ?? o;
		};
		return cacheFrozenConversion(c);
	}
	function cacheFrozenConversion(converter) {
		const convert = converter[1], converted = /* @__PURE__ */ new WeakMap();
		converter[1] = (value, previous) => {
			if (value === null || typeof value !== "object" || !isFrozenData(value)) return convert(value, previous);
			if (converted.has(value)) return converted.get(value);
			const result = convert(value, previous);
			converted.set(value, result);
			return result;
		};
		return converter;
	}
	function isFrozenData(value) {
		if (Object.hasOwn(Object.prototype, "toJSON") || Object.hasOwn(Array.prototype, "toJSON") || Object.getPrototypeOf(Array.prototype) !== Object.prototype) return false;
		return isFrozenTree(value, /* @__PURE__ */ new WeakSet());
	}
	function isFrozenTree(value, visiting) {
		if (value === null || typeof value !== "object") return typeof value !== "function";
		if (frozenTrees.has(value)) return true;
		const prototype = Object.getPrototypeOf(value);
		if (!Object.isFrozen(value) || prototype !== null && prototype !== Object.prototype && prototype !== Array.prototype || visiting.has(value)) return false;
		const descriptors = Object.getOwnPropertyDescriptors(value);
		if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) if (!Object.hasOwn(descriptors, i)) return false;
		}
		visiting.add(value);
		try {
			for (const descriptor of Object.values(descriptors)) if (!Object.hasOwn(descriptor, "value") || !isFrozenTree(descriptor.value, visiting)) return false;
		} finally {
			visiting.delete(value);
		}
		frozenTrees.add(value);
		return true;
	}
	const kind = (v) => v === null ? "null" : typeof v === "boolean" ? "a bool" : typeof v === "number" ? "a number" : typeof v === "string" ? "a string" : Array.isArray(v) ? "an array" : "an object";
	const describe = (t) => typeof t === "string" ? {
		n: "a number",
		b: "a bool",
		s: "a string"
	}[t] ?? "null" : Array.isArray(t) ? t[0] === "?" ? `null or ${describe(t[1])}` : "an array" : "an object";
	const omitted = (x) => x === void 0 || typeof x === "function" || typeof x === "symbol";
	const enumerable = Object.prototype.propertyIsEnumerable;
	const tag = Object.prototype.toString;
	const BOXES = [
		[
			"[object Number]",
			Number.prototype.valueOf,
			Number
		],
		[
			"[object String]",
			String.prototype.valueOf,
			String
		],
		[
			"[object Boolean]",
			Boolean.prototype.valueOf,
			(b) => Boolean.prototype.valueOf.call(b)
		]
	];
	function unboxed(v) {
		const name = tag.call(v);
		for (const [n, slot, read] of BOXES) {
			if (name !== n) continue;
			try {
				slot.call(v);
			} catch {
				return v;
			}
			return read(v);
		}
		return v;
	}
	function json(v, key) {
		if (v !== null && typeof v === "object" || typeof v === "bigint") {
			if (typeof v.toJSON === "function") v = v.toJSON(String(key));
			if (v !== null && typeof v === "object" && Object.getPrototypeOf(v) !== Object.prototype && !Array.isArray(v)) v = unboxed(v);
		}
		if (typeof v === "number") return isFinite(v) ? v + 0 : null;
		return omitted(v) ? void 0 : v;
	}
	const OUT = Symbol("outside");
	let fault = "";
	const refuse = (e) => {
		fault = e;
		return OUT;
	};
	function written(v, t) {
		if (typeof t === "string") return (t === "n" ? typeof v === "number" : t === "b" ? typeof v === "boolean" : t === "s" ? typeof v === "string" : v === null) ? v : refuse(`expected ${describe(t)}, got ${kind(v)}`);
		if (Array.isArray(t) && t[0] === "?") return v === null ? null : written(v, t[1]);
		if (Array.isArray(t)) {
			if (!Array.isArray(v)) return refuse(`expected an array, got ${kind(v)}`);
			let out = null;
			for (let i = 0; i < v.length; i++) {
				const x = v[i], w = written(json(x, i) ?? null, t[1]);
				if (w === OUT) return OUT;
				if (out) out.push(w);
				else if (!same(w, x)) {
					out = v.slice(0, i);
					out.push(w);
				}
			}
			return out ?? v;
		}
		if (v === null || typeof v !== "object" || Array.isArray(v)) return refuse(`expected an object, got ${kind(v)}`);
		let out = null;
		for (const f in t) {
			const x = enumerable.call(v, f) ? v[f] : void 0, j = json(x, f);
			if (j === void 0) return refuse(`field \`${f}\` is missing`);
			const w = written(j, t[f]);
			if (w === OUT) return refuse(`field \`${f}\`: ${fault}`);
			if (!out && !same(w, x)) {
				out = Object.create(null);
				for (const g in t) {
					if (g === f) break;
					out[g] = v[g];
				}
			}
			if (out) out[f] = w;
		}
		let extra = null;
		for (const key of Object.keys(v)) if (!Object.hasOwn(t, key) && json(v[key], key) !== void 0 && (extra === null || key < extra)) extra = key;
		return extra === null ? out ?? v : refuse(`field \`${extra}\` is not in the shape`);
	}
	const checked = (name, v, t) => {
		const w = written(json(v, "") ?? null, t);
		if (w === OUT) throw Object.assign(/* @__PURE__ */ new Error(`\`${name}\` answered outside its shape: ${fault}`), {
			kind: "Unavailable",
			[Shaped]: true
		});
		return w;
	};
	const named = (v, t) => converters(t)[0](v);
	const arrays = (v, t, o) => converters(t)[1](v, o);
	const answered = /* @__PURE__ */ new Map();
	const conv = (v, t, target) => {
		const a = arrays(v, t, answered.get(target));
		answered.set(target, a);
		return a;
	};
	let watching = null;
	let page = null;
	let load = null;
	const changed = (r, topic) => {
		const t = r.ticket;
		if (!t || t.stream || t.req?.stream) return R(r, true);
		if (!t.again) journal$1.push(`t=${clock$1.now} changed ${topic}: ticket ${t.id} (${r.name}) lands first, then it is asked again`);
		t.again = true;
	};
	const announce = (topic, why) => commit(() => {
		const m = moduleWatched.get(topic);
		for (const r of Resources) if (r.watches?.has(topic) || m?.has(r.source)) changed(r, topic);
	}, `${why} ${topic}`);
	const watch = (topic) => answering.call.watches.add(topic);
	const moduleWatched = /* @__PURE__ */ new Map();
	globalThis.__exact_module = (body) => {
		const key = `${body.extension}.${body.source}${body.owner ? `#${body.owner}` : ""}`, call = activeCall(), before = answering.call;
		if (body.source && watching) (moduleWatched.get(key) ?? moduleWatched.set(key, /* @__PURE__ */ new Set()).get(key)).add(watching);
		const origin = call?.origin ?? "app";
		answering.call = call;
		try {
			return ordinary(() => globalThis.exact?.extensions?.call?.({
				...body,
				origin
			}, () => call?.wanted?.() ?? true) ?? Promise.resolve({ error: "NotSupportedError" }));
		} finally {
			answering.call = before;
		}
	};
	(globalThis.exact ??= {}).announceModule = (topic) => announce(topic, "module");
	globalThis.exact.moduleReaders = (key, among = Resources) => among.filter((r) => moduleWatched.get(key)?.has(r.source)).map((r) => r.name);
	const pageModule = () => page ??= load().then((m) => m.pageModule({
		agent: clock$1.agent,
		now: () => clock$1.now,
		changed: (topic) => announce(topic, "native")
	}));
	const native = Object.freeze({
		get available() {
			return true;
		},
		call() {
			if (overlaying.on) throw inOverlay("native.call()");
			throw new Error("native.call: the web has no synchronous module call; use native.later");
		},
		watch(topic) {
			if (overlaying.on) throw inOverlay("native.watch()");
			if (!watching) throw new Error("native.watch outside an answer");
			watch(String(topic));
		},
		later: (request) => overlaying.on ? Promise.reject(inOverlay("native.later()")) : ordinary(() => pageModule().then((p) => p.later(request)))
	});
	const queue = [];
	const counts = {
		done: 0,
		failed: 0,
		last: null
	};
	const openDatabases = /* @__PURE__ */ new Set();
	let pendingAnswers = 0;
	let owed = false;
	function leftOpen() {
		for (const h of openDatabases) {
			if (h.told) continue;
			if (!h.call && pendingAnswers > 0) {
				owed = true;
				continue;
			}
			if (h.call && !h.call.settled) continue;
			h.told = true;
			journal$1.push(`t=${clock$1.now} storage: ${h.path} is still open after a failure in background work that opened it: if that work owns it, close it in a finally (finally { db.close() }), or the next open finds it locked (LLP 1097 D7)`);
		}
	}
	const FILE_METHODS = [
		"readFile",
		"writeFile",
		"atomicWriteFile",
		"appendFile",
		"readdir",
		"mkdir",
		"rm",
		"stat",
		"rename",
		"copyFile",
		"realpath"
	];
	const DIRECTORIES = Object.freeze({
		data: "app:/data",
		cache: "app:/cache",
		temporary: "app:/tmp"
	});
	function imageOptions(method, from, to, options, limits) {
		const api = `storage.fs.${method}()`, out = { ...limits }, o = options ?? {};
		const finite = (n) => typeof n === "number" && Number.isFinite(n), side = (n) => Number.isInteger(n) && n >= 1 && n <= 16384;
		const checks = {
			rotate: [finite, "a finite number of degrees"],
			flip: [(w) => w === "horizontal" || w === "vertical", "\"horizontal\" or \"vertical\""],
			crop: [(c) => c && typeof c === "object" && [
				c.x,
				c.y,
				c.width,
				c.height
			].every(finite) && c.width > 0 && c.height > 0, "{x, y, width, height}, finite, with a positive width and height"]
		};
		if (method === "transformImage") Object.assign(checks, {
			resizeWidth: [side, "an integer from 1 to 16384"],
			resizeHeight: [side, "an integer from 1 to 16384"],
			resizeQuality: [(w) => [
				"pixelated",
				"low",
				"medium",
				"high"
			].includes(w), "\"pixelated\", \"low\", \"medium\" or \"high\""],
			type: [(t) => typeof t === "string" && /^image\/[a-z0-9.+-]+$/.test(t), "a media type such as \"image/jpeg\""],
			quality: [(q) => typeof q === "number" && q >= 0 && q <= 1, "a number from 0 to 1"],
			metadata: [(w) => [
				"keep",
				"no-location",
				"none"
			].includes(w), "\"keep\", \"no-location\" or \"none\""]
		});
		if (typeof from !== "string" || typeof to !== "string") return /* @__PURE__ */ new TypeError(`${api}: from and to must be app:/ paths`);
		if (typeof o !== "object") return /* @__PURE__ */ new TypeError(`${api}: options must be an object`);
		for (const [name, [ok, says]] of Object.entries(checks)) {
			if (o[name] === void 0) continue;
			if (!ok(o[name])) return /* @__PURE__ */ new TypeError(`${api}: ${name} must be ${says}`);
			out[name] = o[name];
		}
		return out;
	}
	function compressLimits(from, to, options) {
		const api = "storage.fs.compressImage()", d = options?.maxDimension, b = options?.maxBytes;
		if (typeof from !== "string" || typeof to !== "string") return /* @__PURE__ */ new TypeError(`${api}: from and to must be app:/ paths`);
		if (!options || typeof options !== "object") return /* @__PURE__ */ new TypeError(`${api}: options must be {maxDimension, maxBytes}`);
		if (!Number.isInteger(d) || d < 1 || d > 8192) return /* @__PURE__ */ new TypeError(`${api}: maxDimension must be an integer from 1 to 8192`);
		if (!Number.isInteger(b) || b < 1 || b > 67108864) return /* @__PURE__ */ new TypeError(`${api}: maxBytes must be an integer from 1 to 67108864`);
		const type = options.type === void 0 ? "image/jpeg" : options.type;
		if (type !== "image/jpeg" && type !== "image/png") return /* @__PURE__ */ new TypeError(`${api}: type must be "image/jpeg" or "image/png"`);
		return {
			maxDimension: d,
			maxBytes: b,
			type
		};
	}
	const optionsRefusal = (...args) => {
		const out = imageOptions(...args);
		return out instanceof Error ? out : null;
	};
	const isDocument = (args) => args.slice(0, 2).some((p) => typeof p === "string" && p.startsWith("doc:/"));
	const expecting = (m, args) => [
		"writeFile",
		"atomicWriteFile",
		"appendFile"
	].includes(m) && args[2]?.expect;
	const expectRefusal = (m, args) => expecting(m, args) && !isDocument(args) ? /* @__PURE__ */ new TypeError(`storage.fs.${m}(): expect is for doc:/ paths`) : null;
	const refusedInRender = /* @__PURE__ */ new Set();
	function refuseInRender(api, owner) {
		journal$1.push(`t=${clock$1.now} storage refused (render): ${owner?.name ?? owner?.streamName ?? "background work"}: ${api}: a page rendered on the server has no storage; the reader's page asks again`);
		if (owner) {
			owner.refused = api;
			owner.recount?.();
		}
		const name = owner?.name ?? owner?.streamName;
		if (name) refusedInRender.add(name);
		return new Promise(() => {});
	}
	answering.refuseStorage = refuseInRender;
	const watchedInRender = /* @__PURE__ */ new Set();
	function renderStorage(owner) {
		const refuse = (api, check = () => null) => (...args) => {
			const error = check(...args);
			return error ? Promise.reject(error) : refuseInRender(api, answering.call ?? owner);
		};
		const fs = Object.fromEntries([
			...FILE_METHODS.map((m) => [m, refuse(`storage.fs.${m}()`, (...args) => expectRefusal(m, args))]),
			["compressImage", refuse("storage.fs.compressImage()", (from, to, options) => {
				const limits = compressLimits(from, to, options);
				return limits instanceof Error ? limits : optionsRefusal("compressImage", from, to, options, limits);
			})],
			["transformImage", refuse("storage.fs.transformImage()", (from, to, options) => optionsRefusal("transformImage", from, to, options, {}))],
			...["recentDocuments", "forgetDocument"].map((m) => [m, refuse(`storage.fs.${m}()`)])
		]);
		const watch = (path) => {
			const api = "storage.fs.watch()";
			if (overlaying.on) throw inOverlay(api);
			if (!watching) throw new Error(`${api} outside an answer`);
			if (typeof path !== "string" || !path.startsWith("doc:/")) throw new TypeError(`${api}: path must be a doc:/ path`);
			watchedInRender.add(answering.call.name);
		};
		return Object.freeze({
			fs: Object.freeze({
				directories: DIRECTORIES,
				...fs,
				watch
			}),
			sqlite: Object.freeze({ open: refuse("storage.sqlite.open()") }),
			work: (promise) => Promise.resolve(promise)
		});
	}
	const opener = (stream, conv, name) => (deliver, controller) => {
		controller.streamName = name;
		return Promise.resolve().then(() => (init_ts_stream(), ts_stream_exports)).then((m) => m.open(stream, conv, tsGrantSet, deliver, controller)).catch((e) => ({
			error: String(e?.message ?? e),
			code: failureCode(e),
			reason: failureReason(e)
		}));
	};
	function install(data, mixed = false, modules = null) {
		data.appId = appId;
		files.appId = appId;
		data.grants = setAppGrantSet(tsGrantSet);
		const storage = renderStorage(null);
		data.watchedInRender = watchedInRender;
		data.refusedInRender = refusedInRender;
		globalThis.captureCanvas = (surface, path, type, quality) => {
			if (overlaying.on) return Promise.reject(inOverlay("captureCanvas()"));
			if (answering.mapper || answering.mapperCall) return Promise.reject(/* @__PURE__ */ new Error("captureCanvas() is unavailable in a stream's mapper: capture in the answer that opens the stream"));
			const call = answering.call;
			return refuseInRender("captureCanvas()", call);
		};
		if (storage) data.background = () => ({
			queued: queue.length,
			inFlight: 0,
			...counts
		});
		if (typeof addEventListener === "function") addEventListener("unhandledrejection", (e) => {
			const r = e.reason;
			journal$1.push(`t=${clock$1.now} data: unhandled rejection: ${r && typeof r === "object" && r.message !== void 0 ? r.message : String(r)}`);
			leftOpen();
		});
		load = modules && (() => painted().then(modules));
		if (modules && typeof requestAnimationFrame === "function") pageModule().catch((e) => journal$1.push(`t=${clock$1.now} native: ${e.message}`));
		let keys = null, asking = "", thrown = null, threwRead = false, threwWatches = null;
		globalThis.__exact_async_context = Object.freeze({
			Promise: AnswerPromise,
			current: () => [
				answering.call,
				watching,
				asking,
				answering.mapperCall,
				answering.promiseCall
			],
			swap(to) {
				const before = this.current();
				[answering.call, watching, asking, answering.mapperCall, answering.promiseCall] = to;
				return before;
			}
		});
		const kept = () => keys ??= Promise.resolve().then(() => (init_storage_environment(), storage_environment_exports)).then(({ keyStore, storageKey }) => keyStore(typeof location === "object" && appId ? storageKey(appId) : null, globalThis.indexedDB));
		let seeded = true;
		const seed = () => {
			seeded = true;
			for (const { source: sourceName, answers } of checkpoint().kept?.values() ?? []) {
				const types = Object.hasOwn(sourceTypes, sourceName) ? sourceTypes[sourceName] : void 0;
				if (!types) continue;
				for (const [args, value] of answers) try {
					(void 0)(sourceName, args.map((a, i) => named(a, types[0][i])), named(value, types[1]));
				} catch {}
			}
		};
		const ts = (name, args, store, target, mutation = false, forced) => {
			if (!seeded) seed();
			const types = sourceTypes[name], [params, result] = types ?? [[], "u"];
			const seen = createSecretFacade(store, tsGrantSet, kept);
			threwRead = false;
			threwWatches = null;
			try {
				return answerWith(name, args, target, mutation, types, params, result, seen, forced);
			} catch (e) {
				threwRead = !!seen.read;
				throw e;
			}
		};
		const answerWith = (name, args, target, mutation, types, params, result, seen, forced) => {
			for (const name of [
				"key",
				"keepKey",
				"exclusive"
			]) {
				const op = seen[name];
				seen[name] = (...a) => ordinary(() => op(...a));
			}
			asking = target ?? name;
			watching = name;
			for (const sources of moduleWatched.values()) sources.delete(name);
			const call = answering.call = {
				stream: null,
				mutation,
				forced,
				name: target ?? name,
				turn: true,
				origin: Origin.now(),
				watches: /* @__PURE__ */ new Set()
			}, target_ = target ?? name;
			if (call.origin !== "app") answering.untraced.add(call);
			const effectsOf = (answer) => {
				const said = (why) => journal$1.push(`t=${clock$1.now} ${answer ? "answer" : "send"} ${target_} failed: ${why}; socket frames were refused`);
				return call.effects?.map((effect) => Object.assign(() => {
					try {
						effect();
					} catch (e) {
						said(e?.message ?? e);
					}
				}, answer ? { refused: said } : {}));
			};
			let r;
			thrown = null;
			try {
				r = answer(name, args.map((a, i) => named(a, params[i])), seen, renderStorage(call), modules ? native : null);
			} catch (e) {
				call.settled = true;
				threwWatches = call.watches;
				if (!mutation) thrown = effectsOf(true);
				throw e;
			} finally {
				call.turn = false;
				asking = "";
				watching = null;
				answering.call = null;
			}
			const shaped = types ? (v) => checked(name, v, result) : (v) => v;
			if (call.socketConflict || call.effects?.length && call.fetched) {
				call.socketConflict = true;
				Promise.resolve(r).catch(() => {});
				call.settled = true;
				throw new Error(SOCKET_AND_FETCH);
			}
			const effects = effectsOf(!mutation || !!(r && typeof r.then === "function"));
			if (call.stream) {
				call.settled = true;
				return {
					stream: opener(call.stream, (v) => conv(shaped(v), result, target_), target_),
					upload: requestKey(call.stream),
					store: seen.read,
					effects,
					watches: call.watches
				};
			}
			if (r && typeof r.then === "function") {
				pendingAnswers++;
				call.seen = seen;
				const settle = () => {
					if (call.settled) return;
					call.settled = true;
					dropTimers(call);
					answering.untraced.delete(call);
					pendingAnswers--;
					if (!pendingAnswers && owed) {
						owed = false;
						leftOpen();
					}
				};
				call.abandon = settle;
				call.late = () => {
					const upload = requestKey(call.stream), t = call.ticket;
					settle();
					t.stream = opener(call.stream, (v) => conv(shaped(v), result, target_), target_);
					if (upload) {
						t.upload = upload;
						t.uploading?.();
					}
					t.late?.();
				};
				call.flight = true;
				const stood = Object.assign(() => {
					call.stood = true;
					for (const go of call.waiting ?? []) go();
					call.waiting = null;
				}, { refused: (why) => {
					call.stood = false;
					for (const go of call.waiting ?? []) go.refused(why);
					call.waiting = null;
					call.unsent = [];
				} });
				return {
					promise: r.then((v) => (settle(), conv(shaped(v), result, target_)), (e) => {
						settle();
						leftOpen();
						throw e;
					}),
					store: seen.read,
					effects: [...effects ?? [], stood],
					call,
					watches: call.watches
				};
			}
			call.settled = true;
			dropTimers(call);
			answering.untraced.delete(call);
			return {
				v: conv(shaped(r), result, target_),
				store: seen.read,
				effects,
				watches: call.watches
			};
		};
		data.uploads = ledger;
		data.answer = mixed ? (name, args, store, target, mutation, forced) => {
			try {
				return ts(name, args, store, target, mutation, forced);
			} catch {
				return null;
			}
		} : ts;
		overlaying.say = (line) => journal$1.push(`t=${clock$1.now} ${line}`);
		data.overlay = void 0;
		data.ts = ts;
		data.tool = (name, args, store, origin) => {
			return null;
		};
		data.thrown = () => {
			const t = thrown ?? [];
			thrown = null;
			return t;
		};
		data.threwRead = () => {
			const read = threwRead;
			threwRead = false;
			return read;
		};
		data.threwWatches = () => {
			const w = threwWatches;
			threwWatches = null;
			return w;
		};
		for (const f of data.q.splice(0)) f();
	}
	//#endregion
	//#region target/web-dist.stage-KeV3vD/.gen/main-server.js
	init_navigation();
	init_ts_fetch();
	let t0;
	let route;
	let planResources;
	const prepare = async () => {
		install(data, false);
	};
	globalThis.__pages = async (pattern, source, args, deadline) => {
		const end = performance.now() + deadline;
		await prepare();
		const parse = data.parse;
		if (parse) data.parse = (...args) => {
			if (performance.now() >= end) throw new Error("it didn't answer before the deadline");
			return parse(...args);
		};
		let listed;
		if (commit(() => {
			listed = res("pages", source, () => args, void 0, void 0, "[s", []);
			listed();
		}, "pages") === false) throw refused();
		const r = listed.r;
		while (r.settled === void 0 && !r.failed) {
			if (performance.now() >= end) throw new Error("it didn't answer before the deadline");
			if (r.ticket?.refused || r.ticket?.call?.refused || r.ticket?.ctl?.refused) throw new Error(String(r.ticket.refused ?? r.ticket.call?.refused ?? r.ticket.ctl?.refused));
			await new Promise((resolve) => setTimeout(resolve, 1));
		}
		if (r.failed) throw new Error(r.error);
		return r.value.map((value) => pattern.split("/").map((s) => s[0] === ":" ? segmentOf(value) : s).join("/"));
	};
	globalThis.__start = async () => {
		t0 = performance.now();
		await prepare();
		planResources = app_default()[2];
		route = routeAt(location.pathname + location.search);
		const [render, activate] = pages[route] ?? ["build", "inferred"];
		return {
			activate: [
				"idle",
				"interaction",
				"never"
			].includes(activate) ? activate : "inferred",
			policy: render,
			notfound: !!pages[route]?.[2],
			readsViewport: activation.viewport,
			canSetStatus: canSetStatus(),
			language: resolvedLanguage()
		};
	};
	globalThis.__render = async (deadline, waitStatus = true) => {
		const end = t0 + deadline;
		const unfinished = () => answersAtWork(true) || unfinishedIO();
		const unmessaged = (t) => !!t && (!!t.stream || !!t.req?.stream) && !t.messages && !t.closed && !t.ctl?.refused;
		const outstanding = () => inflight.n > 0 || Resources.some((r) => r.waiting || r.pending() && unmessaged(r.ticket)) || answersAtWork() || looseOut() || waitStatus && unfinished();
		do
			await new Promise((r) => setTimeout(r, 1));
		while (outstanding() && performance.now() < end);
		markBars(document.getElementById("exact-root"));
		markRoutes(document.getElementById("exact-root"));
		markDocument();
		const hero = document.heroPreload();
		return {
			root: document.rootHTML(),
			hero,
			title: Head.headTitle ?? routeTitle(document.getElementById("exact-root")),
			description: Head.headDescription,
			image: Head.headImage,
			canonical: Head.headCanonical,
			robots: Head.headRobots,
			origin: null,
			status: Head.headStatus ?? null,
			time: clock$1.now,
			...answers(planResources, types[2], sourceTypes),
			failed: Resources.filter((r) => r.failed).map((r) => `${r.name}: ${r.error}`),
			refused: Resources.filter((r) => r.pending() && (r.ticket?.refused || (r.ticket?.call ?? r.ticket?.ctl)?.refused)).map((r) => [r.name, r.ticket.refused ?? (r.ticket.call ?? r.ticket.ctl).refused]),
			pending: Resources.filter((r) => r.pending()).map((r) => r.name),
			outstanding: outstanding(),
			continuing: outstanding() || unfinished(),
			scrollDocument: document.documentElement.hasAttribute("data-scrolldocument"),
			render: performance.now() - t0,
			due: clock$1.timers.length > 0 || Mutations.some((m) => m.due < Infinity || m.next < Infinity),
			activation,
			zoned: !!globalThis.__exactZone,
			rust: false,
			wake: viewportMedia.map(([query, holds]) => [query, holds(viewportFacts())])
		};
	};
	//#endregion
})();
