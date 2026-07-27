/*
 * Headless runner for preview-lab.
 *
 * Starts the static server, drives a local Chromium (Chrome or Edge) against the
 * lab with ?autorun=1&ci=1, waits for the page to POST its results back, prints a
 * summary and exits non-zero on failure. No dependency, no browser download.
 *
 *   node preview-lab/run-ci.mjs [--mode quick] [--only pdf-pages,two-columns]
 *                              [--browser <path>] [--port 4310] [--keep-open]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
  const options = { port: 4310, mode: null, only: null, browser: null, keepOpen: false, timeout: 600_000 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port") options.port = Number(argv[++i]);
    else if (arg === "--mode") options.mode = argv[++i];
    else if (arg === "--only") options.only = argv[++i];
    else if (arg === "--browser") options.browser = argv[++i];
    else if (arg === "--timeout") options.timeout = Number(argv[++i]);
    else if (arg === "--keep-open") options.keepOpen = true;
  }
  return options;
}

function findBrowser(explicit) {
  const candidates = explicit ? [explicit, ...BROWSER_CANDIDATES] : BROWSER_CANDIDATES;
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function labUrl(port, options) {
  const query = new URLSearchParams({ autorun: "1", ci: "1" });
  if (options.mode) query.set("mode", options.mode);
  if (options.only) query.set("only", options.only);
  return `http://localhost:${port}/preview-lab/?${query}`;
}

function report(results) {
  const rows = results.rows || [];
  const failures = rows.filter(row => row.failed);

  const width = {
    fixture: Math.max(7, ...rows.map(row => row.fixture.length)),
    passage: Math.max(7, ...rows.map(row => row.passage.length))
  };
  const pad = (text, size) => String(text).padEnd(size);

  process.stdout.write("\n");
  for (const row of rows) {
    const badges = row.checks.map(check => `${check.id}${check.skipped ? "–" : check.pass ? "✓" : "✗"}`).join(" ");
    process.stdout.write(
      `${row.failed ? "FAIL" : "ok  "} ${pad(row.fixture, width.fixture)}  ${pad(row.width + "px", 7)}  ${pad(row.zoom, 8)}  ${pad(row.passage, width.passage)}  ${badges}\n`
    );
  }

  if (failures.length) {
    process.stdout.write("\nFailures\n");
    for (const row of failures) {
      process.stdout.write(`  ${row.fixture} · ${row.width}px · ${row.zoom} · ${row.passage}\n`);
      for (const check of row.checks) {
        if (!check.pass && !check.skipped) process.stdout.write(`      ${check.id} ${check.label}: ${check.detail}\n`);
      }
    }
  }

  process.stdout.write(`\n${rows.length - failures.length}/${rows.length} scenarios passed\n`);
  return failures.length === 0;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = resolve(join(import.meta.dirname, ".."));

  const browser = findBrowser(options.browser);
  if (!browser) {
    process.stderr.write("No Chromium found. Pass --browser <path> or set CHROME_PATH.\n");
    process.exit(2);
  }

  let settle;
  const received = new Promise(resolvePromise => {
    settle = resolvePromise;
  });

  const server = createServer({ root, onResults: results => settle(results) });
  await new Promise(resolvePromise => server.listen(options.port, resolvePromise));

  const profile = mkdtempSync(join(tmpdir(), "preview-lab-"));
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
      // A stable viewport keeps zoom-fit deterministic across machines.
      "--window-size=1980,1200",
      `--user-data-dir=${profile}`,
      labUrl(options.port, options)
    ],
    { stdio: "ignore" }
  );

  const timeout = new Promise(resolvePromise => setTimeout(() => resolvePromise(null), options.timeout));
  const results = await Promise.race([received, timeout]);

  if (!options.keepOpen) child.kill();
  server.close();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* the browser may still hold a handle: harmless */
  }

  if (!results) {
    process.stderr.write(`\nTimed out after ${options.timeout} ms without receiving results.\n`);
    process.exit(1);
  }

  // Full detail of every check, for post-mortem inspection.
  const jsonPath = join(import.meta.dirname, ".last-run.json");
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  process.stdout.write(`\ndetail: ${jsonPath}\n`);

  process.exit(report(results) ? 0 : 1);
}

void main();
