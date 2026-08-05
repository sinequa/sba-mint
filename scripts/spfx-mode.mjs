/**
 * SPFx mode switch — provisions (or removes) the SPFx / Azure AD build prerequisites on demand.
 *
 * Why: `@microsoft/sp-http` is needed ONLY by the `spfx` / `spfx-production` builds, and only as a
 * type provider (`import type` in src/config/spfx/spfx-context.ts). Declared as a devDependency it
 * dragged 24 `@microsoft/*` packages into the lockfile and made every `npm install` print EBADENGINE
 * warnings under Node 24. It is therefore installed **on demand**, with `--no-save`:
 *
 *   npm run spfx:enable    provision @microsoft/sp-http + create proxy.conf.spfx.json
 *   npm run spfx:disable   remove it from node_modules
 *   npm run spfx:status    report the current mode (invisible in git — nothing is committed)
 *
 * `start:spfx` / `build:spfx` call `spfx:enable` themselves, so the mode is transparent in practice.
 * See spfx-host/README.md ("SPFx mode").
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Same range as the former devDependency (`^1.20.0`), resolves to the highest 1.x (1.23.x today).
 * Always keep the spec double-quoted in the command line: unquoted, cmd.exe eats the `^` of a
 * caret range and npm would install the exact 1.20.0 instead.
 */
const SPEC = '"@microsoft/sp-http@^1.20.0"';
const PROBE = join(ROOT, "node_modules", "@microsoft", "sp-http", "package.json");
const PROXY = join(ROOT, "proxy.conf.spfx.json");
const PROXY_TEMPLATE = join(ROOT, "proxy.conf.spfx.template.json");

/** The spfx mode lives in node_modules only: npm must never end up rewriting these. */
const GUARDED = [join(ROOT, "package.json"), join(ROOT, "package-lock.json")];

const log = message => console.log(`[spfx] ${message}`);

/**
 * `postinstall` overrides @sinequa/agent / @sinequa/assistant with `npm add <specs> --no-save`
 * (package.json's own ranges resolve to versions that lack the exports mint needs). That override
 * lives in node_modules only, so ANY other `npm install --no-save` re-reifies the tree and silently
 * reverts it — which used to downgrade the agent lib as soon as one enabled the spfx mode.
 *
 * We therefore replay it inside the same npm command, reading the specs straight from `postinstall`
 * so there is a single source of truth (the assistant dist-tag changes on every release branch).
 */
function sinequaOverride() {
  const { scripts } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const [addCommand = ""] = (scripts?.postinstall ?? "").split("&&");
  const args = addCommand.trim().replace(/^npm\s+(?:add|install|i)\s+/, "");

  if (args === addCommand.trim()) {
    log("could not read the @sinequa override from `postinstall` — check @sinequa/agent afterwards.");
    return "";
  }

  return args;
}

/** Installed version of @microsoft/sp-http, or null when the mode is off. */
function installedVersion() {
  if (!existsSync(PROBE)) return null;
  try {
    return JSON.parse(readFileSync(PROBE, "utf8")).version ?? "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Runs an npm command, then restores package.json / package-lock.json if npm decided to rewrite
 * them. `--no-save` is not a guarantee across npm versions, and a mode switch must leave the repo
 * clean. node_modules keeps its real state in its own node_modules/.package-lock.json, so restoring
 * the committed lockfile does not break the provisioned tree.
 *
 * The command is passed as a single string (npm is a `.cmd` shim on Windows, which requires a
 * shell): a string command with no args array also avoids the DEP0190 deprecation warning.
 */
function npm(command) {
  const before = GUARDED.map(file => (existsSync(file) ? readFileSync(file, "utf8") : null));

  const { status } = spawnSync(`npm ${command}`, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true
  });

  GUARDED.forEach((file, index) => {
    const original = before[index];
    if (original === null || !existsSync(file)) return;
    if (readFileSync(file, "utf8") === original) return;
    writeFileSync(file, original);
    log(`${basename(file)} restored — the spfx mode must not show up in git.`);
  });

  return status ?? 1;
}

/** Creates the git-ignored proxy.conf.spfx.json (required by `ng serve --configuration spfx`). */
function scaffoldProxy() {
  if (existsSync(PROXY)) return;

  if (!existsSync(PROXY_TEMPLATE)) {
    log(`${basename(PROXY)} is missing and no template was found — start:spfx will fail.`);
    return;
  }

  copyFileSync(PROXY_TEMPLATE, PROXY);
  log(`${basename(PROXY)} created from ${basename(PROXY_TEMPLATE)} (git-ignored, local to you).`);
  log("It targets the Sinequa Auth Playground on http://localhost:5173 — adapt it if yours differs.");
}

function enable() {
  const version = installedVersion();

  if (version) {
    log(`already enabled (@microsoft/sp-http ${version}).`);
  } else {
    log(`installing ${SPEC} with --no-save (node_modules only).`);
    log("The EBADENGINE warnings below are expected and cosmetic: @microsoft/sp-* is only read by");
    log("TypeScript (import type), never executed under Node — see spfx-host/README.md.");

    const status = npm(`install --no-save --no-audit --no-fund ${SPEC} ${sinequaOverride()}`);
    if (status !== 0) process.exit(status);

    log(`enabled (@microsoft/sp-http ${installedVersion() ?? "unknown"}).`);
  }

  scaffoldProxy();
  log("Ready: `npm run start:spfx` (mock playground) / `npm run build:spfx` (production bundle).");
  log("A later `npm install` prunes the package again (extraneous by design) — re-run spfx:enable,");
  log("or just use start:spfx / build:spfx, which provision it for you.");
}

function disable() {
  if (!installedVersion()) {
    log("already disabled (@microsoft/sp-http is not installed).");
    return;
  }

  let status = npm("remove --no-save --no-audit --no-fund @microsoft/sp-http");
  if (status !== 0) process.exit(status);

  // That removal re-reified the tree, so restore the @sinequa override it just wiped. As a bonus its
  // own reify prunes @microsoft/sp-http when `npm remove` left it behind (undeclared → extraneous).
  const override = sinequaOverride();
  if (override) status = npm(`install --no-save --no-audit --no-fund ${override}`);
  if (status !== 0) process.exit(status);

  if (existsSync(PROBE)) {
    log("@microsoft/sp-http is still there — run `npm install` to reset node_modules.");
    process.exit(1);
  }

  log("disabled. proxy.conf.spfx.json is left in place (git-ignored, holds your local settings).");
}

function status() {
  const version = installedVersion();
  log(version ? `mode: enabled (@microsoft/sp-http ${version})` : "mode: disabled (@microsoft/sp-http not installed)");
  log(existsSync(PROXY) ? `${basename(PROXY)}: present` : `${basename(PROXY)}: missing (created by \`npm run spfx:enable\`)`);
}

const command = process.argv[2];

switch (command) {
  case "enable":
    enable();
    break;
  case "disable":
    disable();
    break;
  case "status":
    status();
    break;
  default:
    console.error("Usage: node scripts/spfx-mode.mjs <enable|disable|status>");
    process.exit(1);
}
