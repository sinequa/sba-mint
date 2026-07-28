/*
 * Drives the real application over the Chrome DevTools Protocol, with no dependency:
 * Node 24 has a built-in WebSocket. The bench cannot reach this -- it is a different
 * origin, a real server, real highlight data and a real login -- so this exists to
 * measure the one thing the fixtures cannot reproduce.
 *
 * Two probes are installed in *every* frame before any page script runs:
 *   - a self-rescheduling timer, whose worst gap is how long the main thread was
 *     unavailable (the `block` metric of the profiler);
 *   - a `message` listener recording {action, ids.length}, which is the logpoint on
 *     receiveMessage without touching preview.js.
 *
 *   node preview-lab/investigate-app.mjs "<url>" [--seconds=90] [--keep-open] [--attach]
 *                                          [--user=… --password=…]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// CHROME_PATH first, then Edge, then Chrome. Set CHROME_PATH to pick the engine
// deliberately -- browser choice changes the measurement, not just the branding.
const BROWSERS = [
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe"
].filter(Boolean);

// One port per run. With a fixed 9222, a browser left alive by an earlier --keep-open still
// owns the port, so the next run silently attaches to *that* browser and reports the old
// document's timings as the new one's. This cost a measurement before it was noticed.
const port = attachRequested() ? 9222 : 9222 + (process.pid % 700);

function attachRequested() {
  return process.argv.includes("--attach");
}

const url = process.argv[2];
const seconds = Number((process.argv.find(a => a.startsWith("--seconds=")) || "").split("=")[1]) || 90;
const keepOpen = process.argv.includes("--keep-open");
if (!url) {
  console.error('usage: node preview-lab/investigate-app.mjs "<url>" [--seconds=90] [--keep-open] [--attach] [--user=… --password=…]');
  process.exit(2);
}

const PROBE = `
(() => {
  if (window.__probeInstalled) return;
  window.__probeInstalled = true;
  window.__block = { worst: 0, last: performance.now(), events: [] };
  const tick = () => {
    const now = performance.now();
    const gap = now - window.__block.last;
    if (gap > window.__block.worst) window.__block.worst = gap;
    if (gap > 200 && window.__block.events.length < 400) window.__block.events.push({ at: Math.round(now), gap: Math.round(gap) });
    window.__block.last = now;
    setTimeout(tick, 0);
  };
  setTimeout(tick, 0);

  window.__msgs = [];
  window.addEventListener("message", e => {
    const d = e.data || {};
    if (d.action) window.__msgs.push({ at: Math.round(performance.now()), action: d.action, ids: d.ids ? d.ids.length : undefined, keys: Object.keys(d).join(",") });
    else if (d.type) window.__msgs.push({ at: Math.round(performance.now()), type: d.type });
  }, true);
})();
`;

// Read every 10 s, so it must cost nothing: on the document this tool exists to investigate,
// an innerText read forces layout and builds a 15 MB string, which showed up as a 200 ms
// block every 10 s -- the probe measuring itself. Hence the element-count guard.
const READ = `
(() => {
const count = document.getElementsByTagName("*").length;
return JSON.stringify({
  url: location.href.slice(0, 2000),
  elements: count,
  worstBlockMs: window.__block ? Math.round(window.__block.worst) : null,
  // The biggest gaps, not the most recent ones: the interesting freeze is at load.
  blockEvents: window.__block ? [...window.__block.events].sort((a, b) => b.gap - a.gap).slice(0, 12) : [],
  messages: window.__msgs ? window.__msgs.slice(0, 60) : [],
  marks: window.__marks ? window.__marks.map(m => m[0] + " " + m[1] + "ms at t+" + m[2]) : null,
  bodyTag: document.body ? document.body.tagName : null,
  // When there is no preview to measure, the reason is on screen: an error, a login, an
  // empty route. Without this the run reports "no preview iframe" and nothing else.
  iframes: [...document.querySelectorAll("iframe")].map(f => (f.src || "(no src)").slice(0, 2000)),
  text: count < 5000 && document.body ? (document.body.innerText || "").replace(/\\s+/g, " ").slice(0, 300) : null,
  transform: document.body ? getComputedStyle(document.body).transform.slice(0, 40) : null,
  passageBoxes: document.getElementById("sq-passage-layer") ? document.getElementById("sq-passage-layer").childElementCount : null
});
})()
`;

function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  const listeners = [];
  let nextId = 1;
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve());
    socket.addEventListener("error", reject);
  });
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    } else if (message.method) {
      for (const listener of listeners) listener(message);
    }
  });
  const send = (method, params = {}, sessionId) =>
    ready.then(
      () =>
        new Promise((resolve, reject) => {
          const id = nextId++;
          pending.set(id, { resolve, reject });
          socket.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
        })
    );
  return { send, on: fn => listeners.push(fn), close: () => socket.close(), ready };
}

// --attach observes a browser that is already running with --remote-debugging-port=9222,
// which is how to reach a session that is already authenticated without handling anyone's
// credentials. A fresh profile lands on the login page, as it should.
const attach = attachRequested();
let child = null;
let profile = null;

if (!attach) {
  const browser = BROWSERS.find(existsSync);
  if (!browser) {
    console.error("No Edge or Chrome found. Set CHROME_PATH.");
    process.exit(2);
  }
  // Reported, because it decides the result: the same document froze on Chrome and not on
  // Edge, and a run that does not say which engine it drove cannot be compared with another.
  process.stdout.write(`browser: ${browser} on port ${port}
`);
  profile = mkdtempSync(join(tmpdir(), "cdp-investigate-"));
  child = spawn(
    browser,
    [
      keepOpen ? "--new-window" : "--headless=new",
      `--remote-debugging-port=${port}`,
      "--ignore-certificate-errors",
      "--allow-insecure-localhost",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      // The width is a variable, not a detail: on a text document, a narrower viewport means
      // more line wrapping, and the layout cost follows it -- the same 15 MB document froze
      // for 2.3 s at 1900 px and far longer at panel width.
      `--window-size=${(process.argv.find(a => a.startsWith("--window=")) || "--window=1900,1200").split("=")[1]}`,
      `--user-data-dir=${profile}`,
      "about:blank"
    ],
    { stdio: "ignore" }
  );
}

async function endpoint() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      return (await response.json()).webSocketDebuggerUrl;
    } catch {
      await new Promise(r => setTimeout(r, 250));
    }
  }
  return null;
}

const wsUrl = await endpoint();
if (!wsUrl) {
  console.error("The browser never exposed a debugging endpoint.");
  child.kill();
  process.exit(1);
}

const cdp = connect(wsUrl);
await cdp.ready;

const contexts = new Map();
const logs = [];
cdp.on(message => {
  if (message.method === "Runtime.executionContextCreated") {
    const ctx = message.params.context;
    contexts.set(ctx.id, {
      id: ctx.id,
      origin: ctx.origin,
      name: ctx.name,
      frameId: ctx.auxData && ctx.auxData.frameId,
      isDefault: ctx.auxData && ctx.auxData.isDefault
    });
  }
  if (message.method === "Runtime.executionContextDestroyed") contexts.delete(message.params.executionContextId);
  if (message.method === "Log.entryAdded") logs.push(message.params.entry.level + ": " + String(message.params.entry.text).slice(0, 200));
  if (message.method === "Runtime.exceptionThrown") logs.push("exception: " + String(message.params.exceptionDetails.text).slice(0, 200));
});

let targetId;
if (attach) {
  // Prefer a tab already on the application; otherwise the first page target.
  const targets = (await cdp.send("Target.getTargets")).targetInfos.filter(t => t.type === "page");
  const onApp = targets.find(t => t.url.includes("localhost:4200"));
  const chosen = onApp || targets[0];
  if (!chosen) {
    console.error("No page target found in the attached browser.");
    process.exit(1);
  }
  targetId = chosen.targetId;
  process.stdout.write(`attached to an existing tab: ${chosen.url.slice(0, 120)}\n`);
} else {
  targetId = (await cdp.send("Target.createTarget", { url: "about:blank" })).targetId;
}
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

await cdp.send("Page.enable", {}, sessionId);
await cdp.send("Runtime.enable", {}, sessionId);
await cdp.send("Log.enable", {}, sessionId);
// Installed for the *next* document, so the probes are in place before any page script.
await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: PROBE }, sessionId);

const evaluate = async expression => {
  const { result } = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId);
  return result && result.value;
};

// Credentials come from the command line, never from this file: a diagnostic script has no
// business carrying them, committed or not.
const user = (process.argv.find(a => a.startsWith("--user=")) || "").split("=")[1];
const password = (process.argv.find(a => a.startsWith("--password=")) || "").split("=")[1];

if (user && password) {
  const origin = new URL(url).origin;
  await cdp.send("Page.navigate", { url: origin + "/" }, sessionId);
  await new Promise(r => setTimeout(r, 3000));

  // Angular does not see a direct `.value` assignment, hence the input events.
  // Typed through the Input domain rather than assigned. Setting `.value` and dispatching
  // an `input` event leaves the field `ng-untouched`: the Angular control never receives
  // the value, so the request goes out with an empty password and comes back 401. Real key
  // and mouse events are indistinguishable from a human's.
  const type = async (selector, text) => {
    const focused = await evaluate(
      `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.focus(); return document.activeElement === el; })()`
    );
    if (!focused) return `could not focus ${selector}`;
    await cdp.send("Input.insertText", { text }, sessionId);
    return null;
  };

  const problem = (await type("#username", user)) || (await type("#password", password));
  if (problem) {
    process.stdout.write(`login: ${problem}\n`);
  } else {
    // Every button of the design system carries type="submit" and there is no <form>, so
    // selecting on the type picks "Toggle Sidebar". Match the label, then click for real.
    const box = await evaluate(`(() => {
      const b = [...document.querySelectorAll("button")].find(x => /^log\\s?in$/i.test((x.innerText || "").trim()));
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return JSON.stringify({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), disabled: b.disabled });
    })()`);
    if (!box) {
      process.stdout.write("login: no Login button\n");
    } else {
      const { x, y, disabled } = JSON.parse(box);
      for (const eventType of ["mousePressed", "mouseReleased"]) {
        await cdp.send("Input.dispatchMouseEvent", { type: eventType, x, y, button: "left", clickCount: 1 }, sessionId);
      }
      process.stdout.write(`login: clicked Login at ${x},${y}${disabled ? " (button was disabled!)" : ""}\n`);
    }
  }
  for (let attempt = 0; attempt < 40; attempt++) {
    await new Promise(r => setTimeout(r, 500));
    const here = await evaluate("location.hash + '|' + location.pathname");
    if (here && !String(here).includes("login")) break;
  }
  const landed = await evaluate("location.href.slice(0, 100)");
  process.stdout.write(`after login: ${landed}\n`);

  if (String(landed).includes("login")) {
    // Still on the login page: describe it rather than guess again at selectors.
    const shape = await evaluate(`JSON.stringify({
      inputs: [...document.querySelectorAll("input")].map(i => ({ type: i.type, name: i.name, id: i.id, placeholder: i.placeholder, value: i.type === "password" ? (i.value ? "(set)" : "(empty)") : i.value, cls: (i.className || "").slice(0, 40) })),
      buttons: [...document.querySelectorAll("button")].map(b => ({ text: (b.innerText || "").trim().slice(0, 30), type: b.type, disabled: b.disabled })),
      forms: document.querySelectorAll("form").length,
      text: (document.body.innerText || "").replace(/\\s+/g, " ").slice(0, 300)
    })`);
    process.stdout.write("login page shape: " + shape + "\n");
  }

  // A fresh document, so the probes start from zero on the run that matters -- a bare hash
  // change would keep the login page's document and its accumulated measurements.
  await cdp.send("Page.navigate", { url: "about:blank" }, sessionId);
  await new Promise(r => setTimeout(r, 500));
}

// --cpu samples the main thread for the whole observation. The blocking watcher says *when*
// the thread was unavailable; only the sampler says *inside which function*, and it needs no
// instrumentation of preview.js to do it. One session covers every same-process frame, so
// the preview iframe is included.
// The profiler is started and stopped around each phase rather than once for the run: a
// single aggregate over three minutes cannot say whether commitZoomLayout cost its 1.2 s at
// load or while scrolling, and that is exactly the question.
const wantCpu = process.argv.includes("--cpu");
const cpuWindows = [];
const summariseProfile = profile => {
  const totals = new Map();
  for (const node of profile.nodes) {
    if (!node.hitCount) continue;
    const f = node.callFrame;
    const where = f.url ? f.url.replace(/^.*\//, "") + ":" + (f.lineNumber + 1) : "(native)";
    const key = (f.functionName || "(anonymous)") + "  " + where;
    totals.set(key, (totals.get(key) || 0) + node.hitCount); // 1 ms per sample
  }
  const sorted = [...totals].sort((a, b) => b[1] - a[1]);
  const busy = sorted.filter(([fn]) => !fn.startsWith("(idle)")).reduce((sum, [, ms]) => sum + ms, 0);
  return { sampledMs: sorted.reduce((sum, [, ms]) => sum + ms, 0), busyMs: busy, top: sorted.slice(0, 18).map(([fn, ms]) => ({ fn, ms })) };
};
const cpuStart = async () => {
  if (wantCpu) await cdp.send("Profiler.start", {}, sessionId);
};
const cpuStop = async label => {
  if (!wantCpu) return;
  const { profile } = await cdp.send("Profiler.stop", {}, sessionId);
  cpuWindows.push({ label, ...summariseProfile(profile) });
};
if (wantCpu) {
  await cdp.send("Profiler.enable", {}, sessionId);
  await cdp.send("Profiler.setSamplingInterval", { interval: 1000 }, sessionId);
}
await cpuStart();

const startedAt = Date.now();
await cdp.send("Page.navigate", { url }, sessionId);
process.stdout.write(`navigating to the application, observing for ${seconds} s\n`);

let loadAt = null;
cdp.on(message => {
  if (message.method === "Page.loadEventFired" && loadAt === null) loadAt = Date.now() - startedAt;
});

// Drive the interactions the report is about, on the real document. Posted straight to the
// iframe, which is what PreviewService does.
const drive = async () => {
  return await evaluate(`(() => {
    const frame = [...document.querySelectorAll("iframe")].find(f => f.src && f.src.includes("xdownload"));
    if (!frame || !frame.contentWindow) return "no preview iframe";
    frame.contentWindow.postMessage({ action: "zoom-in" }, "*");
    frame.contentWindow.postMessage({ action: "zoom-in" }, "*");
    return "two zoom-in posted";
  })()`);
};

// Every phase measurement compares against a watcher that starts at zero, otherwise the
// load freeze dominates every later window.
const resetWatchers = async () => {
  for (const ctx of contexts.values()) {
    if (!ctx.isDefault) continue;
    try {
      await cdp.send(
        "Runtime.evaluate",
        {
          expression: "window.__block && (window.__block.worst = 0, window.__block.events = [], window.__block.last = performance.now())",
          contextId: ctx.id,
          returnByValue: true
        },
        sessionId
      );
    } catch {
      /* context gone */
    }
  }
};

const readWatchers = async () => {
  const rows = [];
  for (const ctx of contexts.values()) {
    if (!ctx.isDefault) continue;
    try {
      const { result } = await cdp.send(
        "Runtime.evaluate",
        {
          expression: `JSON.stringify({ where: location.href.includes("xdownload") ? "preview" : "host", worst: window.__block ? Math.round(window.__block.worst) : null, over200: window.__block ? window.__block.events.length : null })`,
          contextId: ctx.id,
          returnByValue: true
        },
        sessionId
      );
      if (result && result.value) rows.push(JSON.parse(result.value));
    } catch {
      /* context gone */
    }
  }
  return rows;
};

// Real wheel events over the iframe, not scrollTop assignments: the reported symptom is a
// freeze while scrolling, and a wheel goes through the same compositor and main-thread path
// a user's does.
const numberArg = (name, fallback) => Number((process.argv.find(a => a.startsWith(`--${name}=`)) || "").split("=")[1]) || fallback;

const scrollSweep = async () => {
  const steps = numberArg("scroll-steps", 25);
  const deltaY = numberArg("scroll-delta", 600);
  const where = `(() => {
    const frame = [...document.querySelectorAll("iframe")].find(f => f.src && f.src.includes("xdownload"));
    if (!frame) return null;
    const r = frame.getBoundingClientRect();
    const doc = frame.contentDocument;
    const el = doc ? (doc.compatMode === "BackCompat" ? doc.body : doc.documentElement) : null;
    return JSON.stringify({
      x: Math.round(r.left + r.width / 2),
      y: Math.round(r.top + r.height / 2),
      top: el ? Math.round(el.scrollTop) : null,
      height: el ? Math.round(el.scrollHeight) : null
    });
  })()`;
  const before = await evaluate(where);
  if (!before) return "no preview iframe to scroll";
  const { x, y, top, height } = JSON.parse(before);
  const started = Date.now();
  for (let step = 0; step < steps; step++) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: 0, deltaY, pointerType: "mouse" }, sessionId);
    await new Promise(r => setTimeout(r, 120));
  }
  const wall = Date.now() - started;
  const after = JSON.parse(await evaluate(where));
  // How far it actually went matters: a sweep that moves 2 % of a document has not
  // exercised the thing that freezes.
  return `${steps} wheel steps of ${deltaY} px in ${wall} ms -- scrollTop ${top} to ${after.top} of ${height}`;
};

// A wheel sweep from the top only exercises the region the browser has already rastered. On
// a document 6 million pixels tall that is under 1 % of it, and the reported freeze happens
// when the reading position lands somewhere the browser has prepared nothing for -- which is
// what dragging the scrollbar does.
const seekSweep = async () => {
  const target = fraction => `(() => {
    const frame = [...document.querySelectorAll("iframe")].find(f => f.src && f.src.includes("xdownload"));
    const doc = frame && frame.contentDocument;
    const el = doc ? (doc.compatMode === "BackCompat" ? doc.body : doc.documentElement) : null;
    if (!el) return null;
    el.scrollTop = Math.round(${fraction} * el.scrollHeight);
    return String(Math.round(el.scrollTop));
  })()`;
  for (const fraction of [0.25, 0.5, 0.75, 0.99]) {
    await resetWatchers();
    const at = await evaluate(target(fraction));
    if (!at) return "no preview iframe to seek in";
    await new Promise(r => setTimeout(r, 2500));
    const rows = await readWatchers();
    const preview = rows.find(r => r.where === "preview") || rows[0] || {};
    process.stdout.write(`  seek: to ${Math.round(fraction * 100)}% (scrollTop ${at}) blocked up to ${preview.worst} ms\n`);
  }
  return "done";
};

const snapshots = [];
// Retried rather than fired at a fixed instant: on a document heavy enough to be worth
// investigating, the iframe does not exist yet 20 s in.
let driven = false;
for (let elapsed = 0; elapsed < seconds; elapsed += 10) {
  await new Promise(r => setTimeout(r, 10000));
  if (!driven && elapsed >= 20) {
    const ready = await evaluate(
      `!![...document.querySelectorAll("iframe")].find(f => f.src && f.src.includes("xdownload") && f.contentDocument && f.contentDocument.body && f.contentDocument.body.childElementCount)`
    );
    if (ready) {
      await cpuStop("load");
      for (const row of await readWatchers()) process.stdout.write(`  load: ${row.where} blocked up to ${row.worst} ms (${row.over200} gaps over 200 ms)\n`);

      await resetWatchers();
      await cpuStart();
      process.stdout.write(`  drive: ${await drive()}\n`);
      await new Promise(r => setTimeout(r, 4000));
      await cpuStop("zoom");
      for (const row of await readWatchers()) process.stdout.write(`  zoom: ${row.where} blocked up to ${row.worst} ms (${row.over200} gaps over 200 ms)\n`);

      await resetWatchers();
      await cpuStart();
      process.stdout.write(`  scroll: ${await scrollSweep()}\n`);
      await cpuStop("scroll");
      for (const row of await readWatchers()) process.stdout.write(`  scroll: ${row.where} blocked up to ${row.worst} ms (${row.over200} gaps over 200 ms)\n`);

      await cpuStart();
      process.stdout.write(`  seek: ${await seekSweep()}\n`);
      await cpuStop("seek");

      await resetWatchers();
      await cpuStart();
      driven = true;
    }
  }
  const frames = [];
  for (const ctx of contexts.values()) {
    if (!ctx.isDefault) continue;
    try {
      const { result } = await cdp.send("Runtime.evaluate", { expression: READ, contextId: ctx.id, returnByValue: true, awaitPromise: false }, sessionId);
      if (result && result.value) frames.push(JSON.parse(result.value));
    } catch {
      /* context gone between the listing and the read */
    }
  }
  snapshots.push({ atSeconds: elapsed + 10, frames });
  process.stdout.write(`  t+${elapsed + 10}s: ${frames.length} frame(s)\n`);
}

// Self time per function: a sample lands on the frame that was executing, so a forced layout
// inside a function is charged to that function -- which is the attribution we are after.
await cpuStop("rest");

const report = { url, loadEventMs: loadAt, snapshots, cpu: cpuWindows, logs: logs.slice(0, 40) };
const path = join(import.meta.dirname, ".last-cdp.json");
writeFileSync(path, JSON.stringify(report, null, 2));

const last = snapshots[snapshots.length - 1];
process.stdout.write(`\nload event at ${loadAt} ms\n`);
for (const frame of last ? last.frames : []) {
  process.stdout.write(`\n--- ${frame.url}\n`);
  process.stdout.write(`    elements ${frame.elements}, body <${frame.bodyTag}>, transform ${frame.transform}, passage boxes ${frame.passageBoxes}\n`);
  process.stdout.write(`    worst main-thread block: ${frame.worstBlockMs} ms\n`);
  if (frame.iframes && frame.iframes.length) {
    for (const src of frame.iframes) process.stdout.write(`    iframe ${src}\n`);
  }
  if (frame.text) process.stdout.write(`    on screen: ${frame.text.slice(0, 200)}\n`);
  for (const e of frame.blockEvents) process.stdout.write(`      blocked ${e.gap} ms at t+${e.at} ms\n`);
  for (const m of frame.messages) {
    process.stdout.write(`      msg ${m.action || m.type}${m.ids !== undefined ? " ids=" + m.ids : ""} at t+${m.at} ms${m.keys ? "  {" + m.keys + "}" : ""}\n`);
  }
}
for (const window of cpuWindows) {
  process.stdout.write(`\nmain thread during "${window.label}" -- ${window.busyMs} ms busy of ${window.sampledMs} ms:\n`);
  for (const row of window.top) {
    if (row.fn.startsWith("(idle)")) continue;
    process.stdout.write(`  ${String(row.ms).padStart(6)} ms  ${row.fn}\n`);
  }
}
if (logs.length) {
  process.stdout.write(`\nconsole:\n`);
  for (const line of logs.slice(0, 15)) process.stdout.write("  " + line + "\n");
}
process.stdout.write(`\ndetail: ${path}\n`);

if (child && !keepOpen) child.kill();
cdp.close();
if (profile) {
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* the browser may still hold a handle */
  }
}
process.exit(0);
