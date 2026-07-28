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

const BROWSERS = [
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
].filter(Boolean);

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
    if (gap > 200) window.__block.events.push({ at: Math.round(now), gap: Math.round(gap) });
    window.__block.last = now;
    setTimeout(tick, 0);
  };
  setTimeout(tick, 0);

  window.__msgs = [];
  window.addEventListener("message", e => {
    const d = e.data || {};
    if (d.action) window.__msgs.push({ at: Math.round(performance.now()), action: d.action, ids: d.ids ? d.ids.length : undefined });
    else if (d.type) window.__msgs.push({ at: Math.round(performance.now()), type: d.type });
  }, true);
})();
`;

const READ = `
JSON.stringify({
  url: location.href.slice(0, 160),
  elements: document.getElementsByTagName("*").length,
  worstBlockMs: window.__block ? Math.round(window.__block.worst) : null,
  blockEvents: window.__block ? window.__block.events.slice(-12) : [],
  messages: window.__msgs ? window.__msgs.slice(0, 60) : [],
  marks: window.__marks ? window.__marks.map(m => m[0] + " " + m[1] + "ms at t+" + m[2]) : null,
  bodyTag: document.body ? document.body.tagName : null,
  transform: document.body ? getComputedStyle(document.body).transform.slice(0, 40) : null,
  passageBoxes: document.getElementById("sq-passage-layer") ? document.getElementById("sq-passage-layer").childElementCount : null
})
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
const attach = process.argv.includes("--attach");
let child = null;
let profile = null;

if (!attach) {
  const browser = BROWSERS.find(existsSync);
  if (!browser) {
    console.error("No Edge or Chrome found. Set CHROME_PATH.");
    process.exit(2);
  }
  profile = mkdtempSync(join(tmpdir(), "cdp-investigate-"));
  child = spawn(
    browser,
    [
      keepOpen ? "--new-window" : "--headless=new",
      "--remote-debugging-port=9222",
      "--ignore-certificate-errors",
      "--allow-insecure-localhost",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--window-size=1900,1200",
      `--user-data-dir=${profile}`,
      "about:blank"
    ],
    { stdio: "ignore" }
  );
}

async function endpoint() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:9222/json/version");
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
  const filled = "typed";
  void filled;
  process.stdout.write(`login: ${filled}\n`);

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

const startedAt = Date.now();
await cdp.send("Page.navigate", { url }, sessionId);
process.stdout.write(`navigating to the application, observing for ${seconds} s\n`);

let loadAt = null;
cdp.on(message => {
  if (message.method === "Page.loadEventFired" && loadAt === null) loadAt = Date.now() - startedAt;
});

// Drive the interactions the report is about, on the real document: two zoom steps, then
// a citation if the preview declares one. Posted straight to the iframe, which is what
// PreviewService does.
const drive = async () => {
  const sent = await evaluate(`(() => {
    const frame = [...document.querySelectorAll("iframe")].find(f => f.src && f.src.includes("xdownload"));
    if (!frame || !frame.contentWindow) return "no preview iframe";
    frame.contentWindow.postMessage({ action: "zoom-in" }, "*");
    frame.contentWindow.postMessage({ action: "zoom-in" }, "*");
    return "two zoom-in posted";
  })()`);
  process.stdout.write(`  drive: ${sent}\n`);
};

const snapshots = [];
for (let elapsed = 0; elapsed < seconds; elapsed += 10) {
  await new Promise(r => setTimeout(r, 10000));
  if (elapsed === 20) await drive();
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

const report = { url, loadEventMs: loadAt, snapshots, logs: logs.slice(0, 40) };
const path = join(import.meta.dirname, ".last-cdp.json");
writeFileSync(path, JSON.stringify(report, null, 2));

const last = snapshots[snapshots.length - 1];
process.stdout.write(`\nload event at ${loadAt} ms\n`);
for (const frame of last ? last.frames : []) {
  process.stdout.write(`\n--- ${frame.url}\n`);
  process.stdout.write(`    elements ${frame.elements}, body <${frame.bodyTag}>, transform ${frame.transform}, passage boxes ${frame.passageBoxes}\n`);
  process.stdout.write(`    worst main-thread block: ${frame.worstBlockMs} ms\n`);
  for (const e of frame.blockEvents) process.stdout.write(`      blocked ${e.gap} ms at t+${e.at} ms\n`);
  for (const m of frame.messages) process.stdout.write(`      msg ${m.action || m.type}${m.ids !== undefined ? " ids=" + m.ids : ""} at t+${m.at} ms\n`);
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
