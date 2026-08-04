# Security notes

Accepted dependency risks, with the analysis behind each decision. Use this file to
justify dismissing the matching Dependabot alerts.

## Accepted: `brace-expansion` DoS in `docusaurus/`

- **Advisory**: [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg)
  (CVE-2026-14257) — DoS via unbounded expansion length causing an out-of-memory
  process crash. Severity: high. Affected range: `brace-expansion <= 5.0.7`.
- **Scope**: `docusaurus/` only. The root workspace is clean (`npm audit` → 0).
- **Reported count**: 20 high alerts, all of which are the same single root cause
  surfacing through the `@docusaurus/*` dependency graph.

### Affected chains

```
brace-expansion@1.1.x
└── minimatch@3.1.5
    ├── serve-handler@6.1.7        ← dependency of @docusaurus/core
    │   └── @docusaurus/core       ← and transitively every @docusaurus/plugin-* and theme-*
    └── docusaurus-lunr-search@3.6.1
```

### Why it cannot be fixed

1. **No upstream fix exists.** `serve-handler@6.1.7` is the latest published version
   and hard-pins `minimatch: 3.1.5` (an exact version, not a range).
   `@docusaurus/core` still depends on `serve-handler: ^6.1.7` up to and including
   3.10.2, the current latest. `docusaurus-lunr-search@3.6.1` requires
   `minimatch: ^3.1.2`.

2. **Overriding `minimatch` breaks at runtime.** Both consumers use the v3
   default-function API:

   ```js
   const minimatch = require('minimatch');
   minimatch(resolvedPath, slashed);
   ```

   From `minimatch@9` onwards the CommonJS build exports a namespace object rather
   than a callable function (`typeof require('minimatch') === 'object'`, keys:
   `minimatch`, `sep`, `GLOBSTAR`, `filter`, …). Forcing `minimatch >= 9` therefore
   raises `minimatch is not a function` on the first call.

3. **Overriding `brace-expansion` to a maintenance release does not help.** The
   `1.1.16` / `2.1.2` tarballs do ship a patched `dist/commonjs/index.js`, but that
   file is dead code: both packages declare `main: index.js` and no `exports` field,
   so `require('brace-expansion')` resolves the legacy `index.js`, which still has
   `max = Infinity` and no `maxLength` cap. They remain genuinely vulnerable, and
   they stay inside the advisory range. npm's "No fix available" is accurate.

   The fix only exists in `brace-expansion@5.0.8`, whose CommonJS build exports a
   *named* `expand` — incompatible with the `minimatch@3` call site, which expects a
   default function export.

### Why it is not exploitable here

- **Build-time only.** The glob patterns fed to `minimatch` come from our own
  `docusaurus.config.js` / `docusaurus.internal.config.js` and from the repository's
  own file paths. There is no attacker-controlled input reaching the parser.
- **The published artefact is a static site.** `npm run docs:build` emits plain
  HTML/CSS/JS; neither `brace-expansion` nor `minimatch` ships in it.
- **`serve-handler` never runs in production.** It backs the local `docusaurus serve`
  preview command only; the deployed docs are served by the hosting platform.
- Worst case is a crash of a local build process on input we author ourselves.

### Re-examine when

- `serve-handler` publishes a release depending on `minimatch >= 10`, **or**
- `@docusaurus/core` drops `serve-handler` for another static file server, **or**
- `docusaurus-lunr-search` bumps its `minimatch` range (this alone is not enough —
  `serve-handler` would still keep the alerts open).

Re-run `npm audit` in `docusaurus/` after any `@docusaurus/*` major upgrade to check
whether the chain has been broken upstream.

## Root workspace: overrides kept for security

`package.json` carries three security-motivated `overrides`. Each should be removed
once upstream catches up:

| Override | Reason | Remove when |
|---|---|---|
| `@hono/node-server: ">=2.0.5 <3"` | [GHSA-frvp-7c67-39w9](https://github.com/advisories/GHSA-frvp-7c67-39w9) — path traversal in `serve-static`. `@modelcontextprotocol/sdk` caps the range at `^1.19.9`, so `npm audit fix` can never reach the patched version. Note the flaw is unreachable in practice: the SDK only imports `serve` and `getRequestListener`, never `serve-static`. | `@modelcontextprotocol/sdk` widens its range to `^2` |
| `@jsverse/transloco: "^8.4.0"` | `@sinequa/atomic-angular@1.10.0` declares `@jsverse/transloco: ^7.6.1` as a hard dependency, and transloco 7 pulls in the vulnerable `glob`/`replace-in-file` chain. Without this override npm installs a second, nested transloco 7 instance, which breaks Angular DI (two distinct `TranslocoService` instances). | `@sinequa/atomic-angular` ships a release depending on `@jsverse/transloco: ^8` |
| `@jsverse/transloco-scoped-libs: { "glob": "^13.0.6" }` | `@jsverse/transloco-scoped-libs@8.4.0` still depends on `glob: ^10.3.3` → `minimatch@9` → `brace-expansion@2.1.2`. Its single call site is `glob(pattern)`, whose signature is unchanged in v13. | `@jsverse/transloco-scoped-libs` bumps to `glob@13` |
