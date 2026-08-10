# Adding a documentation version

The Docusaurus versioning procedure no longer applies here. **Never run `docusaurus docs:version`.**

That command copies the whole current tree into `versioned_docs/version-X/`, writes a sidebar snapshot
beside it and appends to `versions.json`. All four of those paths are now **generated and gitignored**: the
command would write into build output, the next `npm run materialize` would delete what it wrote, and the
release would quietly not exist. Nothing warns you, because from Docusaurus's point of view it succeeded.

Versions come from the folders under `content/docs/` instead. See
[`content/README.md`](./content/README.md) for why the site is built this way; this file is only the
procedure.

## The model, in three sentences

The **oldest** folder holds a complete tree. Every newer folder holds only what that version *changed* —
a page it edited, a page it added, a tombstone for a page it removed — and inherits everything else.
`next/` is the channel: the version being written, served at `/next/`, inheriting from the newest release.

So cutting a release is a rename. There is no copy, and that is the point: a release that changed four
pages adds four files, not two hundred.

## Cutting a release

From `docusaurus/`:

```bash
npx docs-overlay cut 11.15.0
```

`content/docs/next/` becomes `content/docs/11.15.0/`, and the channel comes back empty. It reports what it
did and, more usefully, what is now true:

```
cut 37 entries from next/ into 11.15.0/, and emptied the channel.
the channel now inherits everything from 11.15.0, so /next/ serves the same pages until you write into it.
```

It moves with `git mv`, which keeps each file's index entry and replays no filter, so the blob hashes
survive and the commit contains a rename rather than a rewrite. This matters more than it sounds: 153 files
in this tree are stored with CRLF endings, and a copy-then-`git add` would renormalise every one of them,
turning a cut with zero bytes of content change into a full-tree diff.

Then commit, and check:

```bash
npm run check     # content diagnostics: seconds
npm run verify    # the generated tree matches content/
npm run build     # the real proof: onBrokenLinks is throw
```

`npm run build` is the one that would catch a sidebar naming a page the new version no longer serves, since
that is a hard Docusaurus error rather than a warning.

## What follows on its own, and must not be edited

| | |
|---|---|
| `versions.json` | derived from the folder names |
| `lastVersion` and the version dropdown | derived, in both config files, from the same manifest |
| the sidebar of every version | inherited and pruned to what that version actually serves |
| green and orange bullets | derived from what the version added or changed |
| redirect pages for renamed slugs | generated for every version that still answers for the old URL |

There is no list to bump and no snapshot to take. If you find yourself editing `versions.json`, you are
editing build output.

## When `cut` refuses

Three refusals, all before anything moves:

- **`nothing to cut: next/ holds no content yet.`** The channel holds no page and no `sidebars.json` — only
  the `.gitkeep` that keeps the empty folder in git. There is nothing for the new version to contain. See
  the next section.
- **`nothing to do: 11.15.0/ already exists.`** The cut already happened, or the version number is wrong.
- **`refusing to cut: "…" is not a name the engine would read as a version.`** The folder name must parse as
  a version. A prerelease such as `11.15.0-rc.1` is accepted, with a note that it sorts *before* the release
  of the same number.

## A release whose documentation did not change

`cut` will refuse, and it is right to: a version folder that contains nothing is not a version. Verified —
a folder holding only `.gitkeep` is invisible to the engine, `check` does not count it and it never reaches
`versions.json`. A version exists as soon as it holds **one** entry the engine reads: a page, or a
`sidebars.json`.

So decide what you actually want:

- **Nothing to say, so say nothing.** Do not create the folder. The newest release stays at the site root
  and the dropdown does not gain an entry that would serve byte-identical pages under a new number. This is
  the model's own answer, and usually the right one.
- **The version must appear in the dropdown.** Then it needs real content — in practice `changelog.md`,
  which does change at every release. Write it into `next/` first, then cut. A folder padded with an empty
  file to force the version into existence is a version that claims a change it cannot show.

## What you never touch

```
docusaurus/docs/                  ← generated
docusaurus/versioned_docs/        ← generated
docusaurus/versioned_sidebars/    ← generated
docusaurus/versions.json          ← generated
docusaurus/.docs-overlay/         ← generated
```

All five are gitignored, and `npm run verify` fails if any of them was edited by hand — which is the only
protection there is, because an edit there disappears at the next build without a trace. CI runs `verify` on
every merge request touching `docusaurus/`.

The one habit to break: a Docusaurus contributor edits `docs/`. Here, `docs/` is output. Edit
`content/docs/next/`.

## The library documentation reaches the site at the cut

`content/docs/next/atomic/` and `content/docs/next/atomic-angular/` are a mirror, regenerated from the
`atomic` and `atomic-angular` repositories. They land in the **channel**, so library documentation written
between two releases becomes public at the next cut, not immediately.

The sync copies unconditionally, so it recreates an override for every file it touches, including files
identical to what they would inherit. Left alone the repository re-inflates and the overlay stops meaning
anything. After a sync:

```bash
npx docs-overlay prune --dry-run   # what is redundant
npx docs-overlay prune             # remove it; needs a clean index, it uses git rm
```

`prune` refuses to remove a file with staged or local changes, so commit the sync first.

## Retiring an old version

Deleting a version folder removes that version from the site — **except the oldest**, which holds the
complete tree everything else inherits from. Deleting that one deletes the documentation.

Retiring the base version means folding it into its successor first: every file the successor inherits has
to become a file the successor holds. No command does this today; it is a deliberate, reviewed operation,
and `npm run check` plus a full build are what tell you whether you got it right. Retiring any *later*
version is just `git rm -r content/docs/<version>`.

## Related

- [`content/README.md`](./content/README.md) — how the site is authored, and why it works this way
- [`README.md`](./README.md) — install, build, deploy
- [`docs-overlay-docusaurus`](https://www.npmjs.com/package/docs-overlay-docusaurus) — the adapter's own
  readme, for the conventions this site depends on
