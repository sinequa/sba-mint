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
| A4    | total frame area ≤ 4.5 × text area                                             | frame spanning two pages/columns |
| A5    | no frame covers > 15 % of a `data-lab-decoy`                                   | frame over unrelated content     |
| A6    | each frame extends ≤ 12 px beyond its own fragments, and encloses at least one | loose or spurious frame          |
| A7    | frames are actually stroked (visible, non-transparent border)                  | frame present but invisible      |
| A8    | no two frames of the same passage overlap                                      | wrong block decomposition        |
| A9    | the anchor ends up ≥ 50 % inside the preview viewport                          | frames drawn where nobody looks  |

`A0` replaces the whole set when no fragment of the passage is measurable at all
(hidden subtree, unknown id) — that is the "no blue box at all" symptom, so it is
a hard failure, never a skip. `A2` is skipped when only part of the passage is
laid out, and says so. `A1`'s detail also states how many fragments were laid out
_before_ the scroll, which is the measurement the shipped code relies on to
decide whether to draw a frame at all.

`A9` is about the other half of a citation: correct frames the reader never sees.
Every scenario starts by scrolling the content document back to the top — the
state a freshly opened preview is in — so the check really measures the scroll
performed by the `select`, not a position inherited from the previous scenario.
It is the only assertion whose ground truth is the viewport rather than the text.

Thresholds are calibrated by measurement, not by feel. For `A4`: the legitimate
maximum is a sparse passage merged into a single frame (3.4), while reintroducing the
union-rect bug — `canMergeBlocks` returning `true` — scores 5.6 to 28.1 on
`page-break` and up to 16.2 on `two-columns`. 4.5 sits between the two. A4 is also
never the *sole* detector of that bug: all 24 union scenarios fail A2 and A5 as well.

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

| Fixture                       | What it covers                                                    |
| ----------------------------- | ----------------------------------------------------------------- |
| `pdf-pages`                   | 6 single-column pages; passage on page 1 and on the last page     |
| `page-break`                  | passage spanning the end of page 2 and the start of page 3        |
| `two-columns`                 | passage spanning the column break, decoys beside it               |
| `long-flow`                   | wrapping text (Word/HTML converter), passage over ~10 line boxes  |
| `multimodal`                  | `c_PdfAdvancedMultimodal` shape: AI description hidden by default |
| `svg-text`                    | SVG text preview (`tspan`), where a CSS background does nothing   |
| `frameset`                    | content in a nested `<frame>`                                     |
| `image-pages`                 | scanned pages, no text: only the page-scroll path can be checked  |
| `basic-website`               | **real** cached preview captured from a dev server, as dumped     |
| `basic-website-columns`       | the same real content flowed into 3 CSS columns                   |
| `basic-website-pages`         | the same real content distributed into 18 page sheets             |
| `basic-website-paged-columns` | the same real content in page sheets of 2 columns                 |
| `basic-pdf`                   | **real** PdfToHtml capture: page images + absolute text layer     |

The synthetic fixtures are generated by `fixtures/_fixture.js` so the geometry is
deterministic and the expected block count is **derived** from the placement data
rather than restated by hand.

The four `basic-website*` fixtures are different: they share **one real captured
preview**, stored verbatim in `fixtures/_silicon-valley.html` and injected
synchronously (the DOM has to be complete before `preview.js`'s `DOMContentLoaded`
handler measures it). They differ only by the layout imposed on that content, so a
re-captured dump updates all four at once:

| Fixture                       | Layout                                     | What only this one reaches                                 |
| ----------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `basic-website`               | as dumped, content directly under `<body>` | the passage `<span>`s are _themselves_ body-level children |
| `basic-website-columns`       | 3 CSS columns                              | a single inline flow broken across columns by the browser  |
| `basic-website-pages`         | 18 `.stl_` sheets                          | a passage straddling two sheets on real markup             |
| `basic-website-paged-columns` | sheets of 2 columns                        | a column break **and** a page break, on every scenario     |

Why this matters: in the synthetic `two-columns` fixture each line is an absolutely
positioned div, so the columns are separate subtrees. With real CSS columns the
fragments of a passage crossing a column break share the same body-level ancestor,
and only the geometry — the column gap — can tell the columns apart. The pagination
splits at top-level boundaries only, so the real markup is never cut; page heights
therefore vary, which does not matter here.

They declare no block count, so `A2` is skipped and the geometric invariants carry
the verification — `A8` in particular, which is what `basic-website` originally
caught. `A1`'s detail reports how many distinct x-positions the frames occupy, which
is how one tells whether a scenario really crossed a column break.

`basic-pdf` is a fifth real capture, from the opposite end of the converter family:
a 19-page PDF rendered as one image per page with a text layer of absolutely
positioned, `overflow: hidden` spans — **one span per word**. Two production bugs
that none of the synthetic fixtures could express showed up on it the day it was
added:

- the anchor's nearest scroll container is the word itself, so
  `scrollIntoView({ container: "nearest" })` was absorbed and the document never
  moved (5 of 6 scenarios fail `A9` with that code);
- its body carries `class="bd"`, which is what makes
  `body.bd > div:not(.ph, .phe) { margin: 24px }` in `preview.css` apply — and
  `#sq-passage-layer` is also a `div` child of that body, so the whole overlay was
  shifted by 24 local px (36 of 46 scenarios fail `A3` and `A6`).

Neither is visible on a synthetic fixture, because none of them sets `class="bd"`
nor clips a text run. The page images were not captured, so their `src` is a blank
pixel stretched by the `width`/`height` attributes, which leaves the layout
untouched.

### Known simplifications

- The **synthetic** fixtures imitate the converter output (page sheets in
  `display: inline-block` with `content-visibility: auto`, one absolutely positioned
  `div` per text line, repeated `snippet_N` ids); they are not real Sinequa HTML,
  they set no `class="bd"` on the body and they never clip a text run. The five
  captured fixtures exist precisely because that gap is where real bugs live.
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
