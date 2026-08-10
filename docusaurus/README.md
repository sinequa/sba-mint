# Website

The Mint documentation site, built with [Docusaurus](https://docusaurus.io/).

> **Edit `content/docs/`, not `docs/`.** The trees Docusaurus reads — `docs/`, `versioned_docs/`,
> `versioned_sidebars/`, `versions.json` — are generated and gitignored. See
> [`content/README.md`](./content/README.md), which is the source of truth for how this site is
> authored and versioned.

## Install

```bash
npm ci
```

`npm ci`, not `npm install`: this directory has its own lockfile, separate from the repository root's.

## Local development

```bash
npm start
```

Materialises the doc trees from `content/`, then starts a dev server that reloads on change.

## Build

```bash
npm run build            # public site
npm run build-internal   # GitHub Enterprise
```

Both materialise first, and both write to **`build/`** — the second overwrites the first, so running them
in sequence locally leaves you holding only the internal site. Neither script sets `--out-dir`, and the
deploy workflows upload `./docusaurus/build` either way. (`.gitignore` still lists `/build-internal`, a
directory nothing has produced for a long time.)

`onBrokenLinks` is `throw`, so a broken internal link fails the build rather than shipping. CI builds the
public target only: `onBrokenLinks` validates against the route registry, which does not depend on
`baseUrl`, and the two configs can no longer disagree now that both derive everything from
`docusaurus.config.base.js`.

## Check without building

```bash
npm run verify   # the generated tree matches content/ — fails if it is stale or was hand-edited
npm run check    # content diagnostics: bad directives, sidebars naming missing docs, duplicate slugs
```

Both run in seconds. CI runs them on every merge request touching `docusaurus/`.

## Cut a release

```bash
npx docs-overlay cut 11.15.0
```

`content/docs/next/` becomes `content/docs/11.15.0/`; the channel comes back empty and inherits it.
Nothing else to update — the version list, `lastVersion` and the dropdown all follow from the folders.

**Never run `docusaurus docs:version`.** It writes into paths that are now generated and gitignored, so the
next build deletes its work and the release silently does not exist. The full procedure, what to verify, and
what to do when the command refuses: [`ADDING-A-VERSION.md`](./ADDING-A-VERSION.md).

## Deployment

Both targets deploy from GitHub Actions, triggered manually (`workflow_dispatch`):

| Workflow | Target |
|---|---|
| `.github/workflows/deploy-public.yml` | <https://sinequa.github.io/sba-mint/> |
| `.github/workflows/deploy-private.yml` | GitHub Enterprise Pages, self-hosted runner |
