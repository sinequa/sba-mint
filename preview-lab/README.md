# preview-lab — passage highlighter test bench (ES-29767)

A dependency-free test bench for the blue passage frame drawn by
`src/assets/preview.js` inside the document preview iframe.

It exists because the bug is impractical to reproduce against a real Sinequa
server: the reported documents are customer-proprietary and the failure is
intermittent. The bench loads **the real** `src/assets/preview.js` and
`src/assets/preview.css` — no copy, no build step — drives them exactly like
`PreviewService` does (`postMessage`), and checks the resulting geometry.

## Run it

Headless, one command, exits non-zero on failure:

```bash
node preview-lab/run-ci.mjs              # full matrix
node preview-lab/run-ci.mjs --mode quick # one width, two zoom levels
node preview-lab/run-ci.mjs --only two-columns,page-break
node preview-lab/run-ci.mjs --keep-open  # same run, visible browser window
```

It finds Chrome or Edge automatically (`--browser <path>` or `CHROME_PATH` to
override). Interactively:

```bash
node preview-lab/serve.mjs --port 4300
# → http://localhost:4300/preview-lab/
```

Useful query parameters: `?autorun=1`, `?mode=quick`, `?only=pdf-pages`,
`?ci=1` (POST the run back to the server), and the escape hatch below.

## Why the assertions are trustworthy

The bench and the fixtures are same-origin, so the runner reads the iframe DOM
and recomputes the **ground truth** itself — the client rects of the `snippet_N`
elements. Both the frames drawn by `preview.js` and the ground truth are measured
with `getBoundingClientRect()` in the _same_ viewport space, so the comparison
needs no knowledge of the zoom factor nor of the coordinate conversion that is
being verified. The bench never reimplements the logic under test.

| Check | What it asserts                                                                | Root cause it catches            |
| ----- | ------------------------------------------------------------------------------ | -------------------------------- |
| A1    | at least one frame is drawn                                                    | frame silently missing           |
| A2    | frame count == declared blocks                                                 | single oversized union rect      |
| A3    | every measurable fragment is inside a frame (±2 px)                            | coordinate-space mismatch        |
| A4    | total frame area ≤ 3.5 × text area                                             | frame spanning two pages/columns |
| A5    | no frame covers > 15 % of a `data-lab-decoy`                                   | frame over unrelated content     |
| A6    | each frame extends ≤ 12 px beyond its own fragments, and encloses at least one | loose or spurious frame          |
| A7    | frames are actually stroked (visible, non-transparent border)                  | frame present but invisible      |
| A8    | no two frames of the same passage overlap                                      | wrong block decomposition        |

`A0` replaces the whole set when no fragment of the passage is measurable at all
(hidden subtree, unknown id) — that is the "no blue box at all" symptom, so it is
a hard failure, never a skip. `A2` is skipped when only part of the passage is
laid out, and says so. `A1`'s detail also states how many fragments were laid out
_before_ the scroll, which is the measurement the shipped code relies on to
decide whether to draw a frame at all.

> Measured on Chrome 2026-07: `getBoundingClientRect()` inside a
> `content-visibility: auto` skipped subtree **is** resolved on demand, so
> off-screen pages do _not_ report zero-sized rects (a `display: none` subtree
> does). The pre-scroll measurement is therefore fragile by design rather than
> broken in practice on current Chrome.

`data-lab-decoy` marks content no frame may ever touch: other pages, the other
column, the page footer, the surrounding paragraphs. Adjacent lines are
deliberately **not** decoys — a correct frame may bleed a few pixels into the
inter-line gap, and the bench must not fail on that.

## Test axes

- **iframe width** — 520 / 900 / 1800 px. The width is what decides how many page
  sheets fit per row, i.e. whether the preview is in "flex" mode. Note that
  zooming _out_ also widens the layout, because `preview.css` sizes the body with
  `width: calc(99% / var(--factor))`.
- **zoom** — `fit`, `fit −2`, `fit −4`, `fit +2` steps (the postMessage contract
  only exposes zoom-in / zoom-out / zoom-fit).
- **stability** — the last-page passage is replayed 10 times with a full iframe
  reload, so the result cannot depend on how much of the document happened to be
  laid out when the citation was selected.

## Fixtures

| Fixture         | What it covers                                                         |
| --------------- | ---------------------------------------------------------------------- |
| `pdf-pages`     | 6 single-column pages; passage on page 1 and on the last page          |
| `page-break`    | passage spanning the end of page 2 and the start of page 3             |
| `two-columns`   | passage spanning the column break, decoys beside it                    |
| `long-flow`     | wrapping text (Word/HTML converter), passage over ~10 line boxes       |
| `multimodal`    | `c_PdfAdvancedMultimodal` shape: AI description hidden by default      |
| `svg-text`      | SVG text preview (`tspan`), where a CSS background does nothing        |
| `frameset`      | content in a nested `<frame>`                                          |
| `image-pages`   | scanned pages, no text: only the page-scroll path can be checked       |
| `basic-website` | **real** cached preview (Wikipedia article) captured from a dev server |

The synthetic fixtures are generated by `fixtures/_fixture.js` so the geometry is
deterministic and the expected block count is **derived** from the placement data
rather than restated by hand.

`basic-website` is different: it is an untouched dump of a real cached preview, kept
because it exercises a structure no synthetic fixture had — an unpaginated document
whose body's direct children are the passage `<span>`s themselves, split into several
fragments because passages overlap each other and HTML cannot express overlapping
ranges. The only edits are the two asset URLs (they pointed at a dev server), the
removal of the `#sq-passage-layer` captured with it, and a `LAB_EXPECT` block. It
declares no block count, so `A2` is skipped and the geometric invariants do the work
— `A8` in particular, which is what this fixture originally caught.

### Known simplifications

- The fixtures imitate the converter output (page sheets in `display: inline-block`
  with `content-visibility: auto`, one absolutely positioned `div` per text line,
  repeated `snippet_N` ids); they are not real Sinequa HTML.
- Page sheets carry no `overflow: hidden`, although some converters clip theirs.
  `overflow: hidden` would make a sheet a scroll container, and `preview.js`
  scrolls with `scrollIntoView({ container: "nearest" })` — the sheet would then
  absorb the scroll and the bench would be testing a different problem.
- `preview.js` derives its web-worker URL from `window.origin`, so a 404 on
  `/app/preview-lab/assets/worker.js` is logged. It is caught by `createWorker()`
  and has no effect on the bench.

## Validating against a real document

```
http://localhost:4300/preview-lab/?url=<documentCachedContentUrl>&snippet=3
```

Loads a real cached preview instead of a fixture and replays A1/A3/A4/A5 on
`snippet_3` at every zoom level (A2 is skipped, as no block count is declared).
This is the way to confirm the fix on a customer document without touching any
code. The URL must be same-origin with the bench, so serve the bench from a host
that proxies the Sinequa app, or point `--root` at it.
