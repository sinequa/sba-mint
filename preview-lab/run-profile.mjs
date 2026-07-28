/*
 * Headless profiler for preview-lab.
 *
 * Same harness as run-ci.mjs, different question: not "is the geometry right" but
 * "what does an interaction cost, as a function of DOM size". It drives a local
 * Chromium against the lab with ?profile=1&ci=1 and prints the table.
 *
 * No instrumentation is added to preview.js: the lab measures from the outside
 * (see the profiling section of lab.js).
 *
 *   node preview-lab/run-profile.mjs [--browser <path>] [--port 4320] [--keep-open]
 *                                    [--baseline preview-lab/.baseline-profile.json]
 *
 * `--baseline` compares against a previous run and prints the delta, which is how
 * each optimisation step is expected to justify itself.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "./serve.mjs";

const BROWSER_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);

function parseArgs(argv) {
  const options = { port: 4320, browser: null, keepOpen: false, timeout: 900_000, baseline: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port") options.port = Number(argv[++i]);
    else if (arg === "--browser") options.browser = argv[++i];
    else if (arg === "--timeout") options.timeout = Number(argv[++i]);
    else if (arg === "--baseline") options.baseline = argv[++i];
    else if (arg === "--keep-open") options.keepOpen = true;
  }
  return options;
}

function pad(text, size) {
  return String(text).padEnd(size);
}

function padStart(text, size) {
  return String(text).padStart(size);
}

function delta(current, previous) {
  if (previous === undefined || previous === null || current === null) return "";
  const change = current - previous;
  if (Math.abs(change) < 0.5) return "  ="; // below the noise floor of these numbers
  const sign = change > 0 ? "+" : "−";
  return ` ${sign}${Math.abs(Math.round(change))}`;
}

function report(profile, baseline) {
  const rows = profile.rows || [];
  const before = new Map((baseline?.rows || []).map(row => [row.target, row]));

  const width = { target: Math.max(8, ...rows.map(row => row.target.length)) };

  process.stdout.write("\nTimes in ms. `zoom avg` is the style+layout a single zoom step forces — the\n");
  process.stdout.write("number that should become independent of DOM size. `scroll+` is the excess over\n");
  process.stdout.write("the 16.7 ms frame budget during a scroll sweep, i.e. an upper bound on what the\n");
  process.stdout.write("scroll handler costs per frame; `sel+` is the same sweep with a citation displayed.\n\n");
  process.stdout.write(
    `${pad("target", width.target)}  ${padStart("nodes", 7)}  ${padStart("open", 7)}  ${padStart("zoom avg", 9)}  ${padStart("zoom max", 9)}  ${padStart("fit", 7)}  ${padStart("anchors", 8)}  ${padStart("scroll+", 8)}  ${padStart("sel+", 8)}  ${padStart("blocked", 8)}\n`
  );
  process.stdout.write(`${"-".repeat(width.target + 88)}\n`);

  for (const row of rows) {
    if (row.error) {
      process.stdout.write(`${pad(row.target, width.target)}  ERROR ${row.error}\n`);
      continue;
    }
    const previous = before.get(row.target);
    const blocked = (row.zoomFrames?.blocking || 0) + (row.scrollFrames?.blocking || 0);
    process.stdout.write(
      `${pad(row.target, width.target)}  ${padStart(row.nodes, 7)}  ${padStart(row.open, 7)}${delta(row.open, previous?.open)}  ` +
        `${padStart(row.zoomForcedAvg, 9)}${delta(row.zoomForcedAvg, previous?.zoomForcedAvg)}  ` +
        `${padStart(row.zoomForcedMax, 9)}  ${padStart(row.fitForced ?? "—", 7)}  ` +
        `${padStart(row.pageAnchors ?? "—", 8)}  ${padStart(row.scrollExcess ?? "—", 8)}  ` +
        `${padStart(row.scrollSelectedExcess ?? "—", 8)}${delta(row.scrollSelectedExcess, previous?.scrollSelectedExcess)}  ${padStart(blocked, 8)}\n`
    );
  }

  const observers = new Set(rows.map(row => row.observer).filter(Boolean));
  if (observers.size) process.stdout.write(`\nframe observer: ${[...observers].join(", ")} (LoAF only reports frames over 50 ms)\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = resolve(join(import.meta.dirname, ".."));

  const browser = (options.browser ? [options.browser, ...BROWSER_CANDIDATES] : BROWSER_CANDIDATES).find(existsSync);
  if (!browser) {
    process.stderr.write("No Chromium found. Pass --browser <path> or set CHROME_PATH.\n");
    process.exit(2);
  }

  let settle;
  const received = new Promise(resolvePromise => {
    settle = resolvePromise;
  });

  const server = createServer({ root, onProfile: profile => settle(profile) });
  await new Promise(resolvePromise => server.listen(options.port, resolvePromise));

  const profileDir = mkdtempSync(join(tmpdir(), "preview-lab-profile-"));
  const child = spawn(
    browser,
    [
      options.keepOpen ? "--new-window" : "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--window-size=1980,1200",
      `--user-data-dir=${profileDir}`,
      `http://localhost:${options.port}/preview-lab/?profile=1&ci=1`
    ],
    { stdio: "ignore" }
  );

  const timeout = new Promise(resolvePromise => setTimeout(() => resolvePromise(null), options.timeout));
  const profile = await Promise.race([received, timeout]);

  if (!options.keepOpen) child.kill();
  server.close();
  try {
    rmSync(profileDir, { recursive: true, force: true });
  } catch {
    /* the browser may still hold a handle: harmless */
  }

  if (!profile) {
    process.stderr.write(`\nTimed out after ${options.timeout} ms without receiving a profile.\n`);
    process.exit(1);
  }

  let baseline = null;
  if (options.baseline) {
    try {
      baseline = JSON.parse(readFileSync(options.baseline, "utf8"));
    } catch {
      process.stderr.write(`(baseline ${options.baseline} unreadable, showing absolute numbers only)\n`);
    }
  }

  const jsonPath = join(import.meta.dirname, ".last-profile.json");
  writeFileSync(jsonPath, JSON.stringify(profile, null, 2));
  report(profile, baseline);
  process.stdout.write(`\ndetail: ${jsonPath}\n`);
  process.exit(0);
}

void main();
