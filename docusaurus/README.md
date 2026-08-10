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
npm run build            # public site      → build/
npm run build-internal   # GitHub Enterprise → build-internal/
```

Both materialise first. `onBrokenLinks` is `throw`, so a broken internal link fails the build rather
than shipping.

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

## Deployment

Both targets deploy from GitHub Actions, triggered manually (`workflow_dispatch`):

| Workflow | Target |
|---|---|
| `.github/workflows/deploy-public.yml` | <https://sinequa.github.io/sba-mint/> |
| `.github/workflows/deploy-private.yml` | GitHub Enterprise Pages, self-hosted runner |
