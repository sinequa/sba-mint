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

Same harness, different question — what an interaction *costs*:

```bash
node preview-lab/run-profile.mjs
node preview-lab/run-profile.mjs --baseline preview-lab/.baseline-profile.json
```

See [Profiling](#profiling) below. It finds Chrome or Edge automatically
(`--browser <path>` or `CHROME_PATH` to override). Interactively:

```bash
node preview-lab/serve.mjs --port 4300
# → http://localhost:4300/preview-lab/
```

Useful query parameters: `?autorun=1`, `?mode=quick`, `?only=pdf-pages`,
`?ci=1` (POST the run back to the server), and the escape hatch below.

The server also generates images on demand — `/_lab-image?w=960&h=540&ms=900&shade=232`
returns a PNG of that size after that delay — which is how a fixture reproduces a
late reflow. The fixtures therefore need the server; none of them works over
`file://` (they also have to be same-origin with the runner).

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
| A10   | `current-page` matches the first page anchor fully in view, while scrolling     | page indicator stops following   |

`A0` replaces the whole set when no fragment of the passage is measurable at all
(hidden subtree, unknown id) — that is the "no blue box at all" symptom, so it is
a hard failure, never a skip. `A2` is skipped when only part of the passage is
laid out, and says so. `A1`'s detail also states how many fragments were laid out
_before_ the scroll, which is the measurement the shipped code relies on to
decide whether to draw a frame at all.

One subtlety about *when* the assertions run. The runner waits for the geometry to
stop changing, and that wait covers **both** the frames and the ground truth. It
used to watch the frames alone, which quietly defeated the purpose: a frame that is
never repositioned is stable from the very first sample, so the wait ended before
the document itself had settled, and the assertions compared frames and text at a
moment when both still agreed. A late-loading image sailed straight through. The
rule is that stability has to mean "nothing is moving any more", not "the thing
under test is not moving".

`A10` is a scenario of its own rather than a per-passage check, because it owns the
scroll position. It exists because `current-page` is consumed by `preview-content.ts` —
it is what makes the page indicator follow the scroll — and had no coverage at all, which
is an uncomfortable place to start changing its implementation from. It was written and
verified green against the *old* implementation first, then used to check the new one.

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
>
> That holds where the skipped container's size is exact — the synthetic sheets are
> a fixed 816 × 1056 with a matching `contain-intrinsic-size`. It does **not** hold
> well enough to build on: see "Skipping off-screen pages" below.

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

## Profiling

`?profile=1` answers a different question: not "is the geometry right" but "what does
an interaction cost, as a function of DOM size". **No instrumentation is added to
`preview.js`** — everything is measured from the runner, which is possible because it
is same-origin with the fixture:

- it registers a `PerformanceObserver` **inside the iframe's window**, for
  `long-animation-frame` (`longtask` as a fallback). LoAF gives per-frame
  `blockingDuration` and, per script, `forcedStyleAndLayoutDuration`;
- it knows exactly when `preview.js` has written `--factor` by observing the body's
  `style` attribute with a `MutationObserver`. That fires as a microtask right after
  the write, so the invalidation is still pending — and the forced read that follows
  measures precisely that invalidation. Reading the inline attribute forces no style
  recalc, so the wait cannot pollute the number being measured.

What each column means, and how much to trust it:

| column | how it is obtained | trust |
| ------ | ------------------ | ----- |
| `zoom avg` / `zoom max` | forced `offsetWidth` read immediately after the factor write | **high**, but only *together with* `zoomDispatchAvg` in the JSON: code that forces layout itself (a `scrollTo`, say) moves the cost out of this column and into the dispatch, leaving this one at zero while nothing improved. Read the sum |
| `block` | largest gap between consecutive self-rescheduling timer ticks, across a whole zoom gesture including the settle delay | **high, and the one to trust first.** It cannot miss work the way the columns above can, and it is the closest thing here to what a reader actually feels |
| `open` | iframe `src` set → `ready` message | high, but lumps together parsing, `zoomFit()`, the SVG pass and the fixed 500 ms wait |
| `fit` | same as a zoom step, measured **between** the zoom-in and zoom-out batches | high. It has to be measured there: `zoomFit()` reuses its cached factor, and writing the value the body already carries may not touch the attribute at all, leaving nothing to observe |
| `anchors` | count of `[id^="sq-page-start"]` | exact |
| `scroll+` | wall-clock excess over 16.7 ms/frame during a 20-step sweep | **indicative only** — rAF pacing in headless Chrome is not a faithful model of real scrolling. Compare fixtures within one run; do not read the absolute value |
| `blocked` | sum of LoAF `blockingDuration` | high, but LoAF only reports frames over 50 ms, so it is a lower bound — and a frame that is slow from *rendering* rather than scripting can report 0 |

The last row of that table is the useful subtlety: `blocked = 0` alongside slow frames
is a signal, not a contradiction. It says the cost is rendering, not JavaScript.

`fixtures/zoom-stress.html` exists only for this mode and is **excluded from the
assertion matrix** (it declares no passage, and its size would make the 385-scenario
run far slower). It takes `?nodes=<n>&mode=absolute|flow`, which separates the two
layout regimes that must not be assumed equivalent:

- `absolute` — fixed-size page sheets, one absolutely positioned line per node. A
  layout-width change moves the sheets but resizes nothing.
- `flow` — one flowing paragraph per node. A layout-width change re-wraps everything.
- `svg` — one highlighted SVG text run per node, each with the background rect that
  `setSvgBackgroundPositionAndSize()` measures and resizes before `ready`. The assertion
  fixture `svg-text.html` has seven runs, far too few for that cost to appear: it took
  this mode to show that the startup pass was quadratic (1.3 s at 2 000 runs, 6.5 s at
  5 000).

`basic-excel-jap` is the fifth capture and the only **genuine `<frameset>`**: an
Aspose.Cells workbook export where the content is not in the fixture at all but in
`file_files/sheetNNN.htm`, loaded into a frame, with a tab strip in a second one. Three
things make it worth having, none of which any other fixture covers:

- `getPreviewBody()` has to cross a frame boundary, and it cannot do so at the shell's
  `DOMContentLoaded` — the frame has not loaded yet, so `zoomFit()` bails there. What
  applies the zoom is then *each sheet's own instance* of `preview.js`: the sheets link
  `preview.css` and `preview.js` themselves, so **five instances run side by side** (shell,
  three sheets, tab strip). Only the shell's messages reach the host, because
  `preview-content.ts` filters on `event.source`.
- Excel is the converter family the old `zoomFit()` was written for — it measured
  `div, img, table` — and no fixture contained a table until this one.
- Japanese: no inter-word spaces, different line breaking, and heavy CJK fonts that
  arrive late, which is the `document.fonts.ready` path introduced for `ready`.

Note that `.htm` had to be added to `serve.mjs`'s MIME table for it to work at all. Office
exports use that extension, and serving it as `application/octet-stream` produced the most
misleading failure of this whole exercise: the frame loaded, had a body, and contained
nothing — which reads exactly like a passage that cannot be found.

The capture is complete (sheets, tab strip and the converter's `stylesheet.css`). The
inline `transform`/`width`/`height` that `preview.js` had written on each `<body>` during
the capture session were stripped, along with its overlay and injected `<style>`: a fixture
has to start from what the converter produces, not from what a previous run left behind.

A caution learned the hard way with the stress fixture: the mode was added to it but
the query-string parsing still mapped everything that was not `flow` to `absolute`, so
two profiling targets silently measured the wrong document and the first conclusion drawn
from them ("no measurable gain") was worthless. When a target is added, check that it
really builds what its name says — the probe that caught it simply counted the `tspan`
elements.

`fixtures/basic-huge.html` is the ceiling: a real capture of **444 502 elements**
(289 824 `<td>` in 4 607 tables, 16 MB). In the app it makes the browser window go *not
responding* — which is the useful precision: not a crash, not memory exhaustion, but the
main thread blocked in one long task, and every measurement below is a main-thread task
long enough to do it. It has no passage, no extract and no entity id, so it cannot be an
assertion fixture and nothing in the per-highlight paths applies to it — its only job is to
show what scale alone costs. What it establishes:

- the browser needs **11 s** just to parse and lay it out, all of it blocking.
  `preview.js` adds 234 ms on top, i.e. 2 %. That share is the document's, not the code's,
  and no amount of work here will fix a 16 MB preview — it belongs to the converter
  (paginate) or to the host (decline to inline it).
- scrolling costs 113.9 ms per frame, about nine frames a second, with no long
  *JavaScript* task at all: that is the rendering of 289 824 table cells.
- and it is where the extracts request was found to cost **minutes**. `getHtml` used one
  full tree walk per requested id, and the ids come one per highlight *location* returned
  by the server, so the freeze is proportional to how much the server found:

  | ids | before | after |
  | --- | ------ | ----- |
  | 200 | 2 927 ms | 24 ms |
  | 1 000 | 12 708 ms | 20 ms |
  | 5 000 | 62 550 ms | 23 ms |
  | 20 000 | **224 313 ms** (3 min 44 s) | 33 ms |

  Perfectly linear at ~11 ms per id. `PreviewService.retrieveHtmlContent()` is called once
  per highlight category, and there are seven, which is why the reported symptom was the
  window freezing, releasing, and freezing again rather than hanging once.
- a zoom step on it cost **530 ms** before the transform was split from the layout (peak
  696 ms), and costs **0.1 ms** now. That single measurement justifies the whole zoom
  rework better than any of the smaller fixtures: 34 154 elements → 42.6 ms,
  63 541 → 77.3 ms, 444 504 → 529.8 ms, a straight line at ~1.2 ms per thousand elements.

It is also what raised the `ready` timeout from 8 s to 30 s: being slow is not the same as
being broken, and the shorter budget reported this document as an error, which reads like
a bug in the code under test.

Timings are machine-specific, so `.last-profile.json` and `.baseline-profile.json` are
gitignored. Keep a baseline before a change and pass `--baseline` after it; the report
prints the delta per target.

A blind spot worth understanding, because it hid a 2.3-second freeze for a whole day of
this work. The forced-read columns measure what a read *of ours* makes synchronous. The
layout commit is deliberately deferred past `ZOOM_SETTLE_MS`, so it runs in its own task,
between two measurements, attributed to nothing — and `fit` read 0.1 ms on the very
document where a zoom gesture froze the window for 2 343 ms, because the first `zoom-fit`
finds the layout already committed and returns early. Every column here was reporting
honestly and the conclusion drawn from them ("a zoom step is 0.1 ms, independent of DOM
size") was true and *incomplete*: the step was free, the gesture was not.

That is what `block` is for, and why it is listed as the column to trust first. A metric
that measures the absence of a symptom is worth less than one that measures the symptom.

One caveat worth knowing before you trust a delta: **the numbers drift between runs, by
much more than they vary within one.** Two consecutive runs of the same code agreed to
±2–3 ms on `zoom avg`, but a baseline taken an hour earlier read 62 ms on a target that
measured 72 ms when the *same unchanged code* was re-run later — the machine had simply
got slower. So:

- re-measure the baseline in the same session as the comparison (`git stash` the change,
  run, `git stash pop`, run again);
- trust order-of-magnitude changes and same-run comparisons between targets;
- do not chase a delta of a few percent, and do not chase `open` at all — it is
  dominated by parsing and by the fixed 500 ms wait before `ready`.

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
| `basic-pptx`                  | **real** PptxToHtml capture: lazy slide images with no set size   |
| `basic-excel-jap`             | **real** Excel workbook: a genuine `<frameset>`, tables, Japanese  |
| `zoom-stress`                 | profiling only: parameterised DOM size, two layout regimes        |

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

`basic-pptx` is a sixth capture, of a 24-slide deck, and it covers the axis of
**time** rather than geometry: its slide images carry no `width` or `height`
attribute, so the intrinsic size of the bitmap *is* the layout, and `loading="lazy"`
means it arrives long after the citation was framed. The whole document then shifts
under a frame measured on the pre-load layout.

Reproducing that needs real bitmaps of the right size, arriving late, so
`serve.mjs` generates them: `/_lab-image?w=960&h=540&ms=900` returns a PNG of that
size after that delay, built with nothing but `zlib`. The delay is what turns a
race into a test — at 250 ms the images usually won the race against the select and
the failure appeared in only 1 run out of 3. It is also why the customer sees this
consistently and a developer on localhost does not.

Without the fix, 2 to 3 of the 12 scenarios fail `A9` on every run; the count varies
because whether the passage leaves the viewport depends on how many un-loaded images
sit above it. Note that `A3` stays green throughout: the frames *do* follow the
reflow. Only the scroll position did not, which is why this needed an assertion
about the viewport and could never have been caught by a geometric one.

### Known simplifications

- The **synthetic** fixtures imitate the converter output (page sheets in
  `display: inline-block` with `content-visibility: auto`, one absolutely positioned
  `div` per text line, repeated `snippet_N` ids); they are not real Sinequa HTML,
  they set no `class="bd"` on the body and they never clip a text run. The five
  captured fixtures exist precisely because that gap is where real bugs live.
- `preview.js` derives its web-worker URL from `window.origin`, so a 404 on
  `/app/preview-lab/assets/worker.js` is logged. It is caught by `createWorker()`
  and has no effect on the bench.

## A defect this bench found and did not fix

`basic-huge.html` has 100 passages, so it can be an assertion fixture — and it is
**deliberately not registered as one**, because two of its scenarios fail and the cause
is not understood. Registering it would leave the matrix red, which would cost the bench
its only real property: that a failure means something.

Exact reproduction, which is why this is written down rather than forgotten:

```js
// in lab.js FIXTURES
{ name: "basic-huge", file: "fixtures/basic-huge.html" }
// in the fixture, declare:
matchingpassages_84: { label: "densest passage, 32 fragments" }
matchingpassages_99: { label: "19 fragments, end of document" }
```

Both fail at **520 px, `fit +2` only** (factor 1.1), and nowhere else:

```
A3  17/70 fragment(s) outside any frame        A6  a frame encloses no fragment
A3   5/86 fragment(s) outside any frame        A6  worst outset 26.8px (max 12)
```

What has been ruled out:

- **not a timing problem.** Sampled every few hundred ms out to 6 s: the fragments stop
  moving at 400 ms, the frames at 600 ms, and both are stable from then on. They are
  stable *and* they disagree. Spending the whole retry budget on verification passes
  instead of stopping at the first success changes nothing, so that was reverted rather
  than kept as dead cost.
- **not a stale overlay.** The frames are recomputed and settle; they simply do not match.

What is suspicious, and where to look next: at 520 px with factor 1.1 the layout width is
about 468 local px, so the 4 607 tables wrap hard and the 32 elements of that passage
produce **70 line rects** across many cells. The block grouping has never been exercised
on that shape — fragments scattered across table cells, separated by cell padding and
borders rather than by line gaps — and its thresholds are expressed in line heights. The
first thing to dump is the per-block membership: a block union always contains its own
members, so fragments landing outside every frame means the two sides are not looking at
the same set of rects.

## Skipping off-screen pages: attempted, reverted

Worth recording so nobody spends the afternoon on it twice. This is about the **paginated**
conversions, and it is still reverted. The *flowing* ones do skip now, and how that was made
to work is under "Skipping off-screen blocks: what it took" further down — the difference is
not the idea, it is that the frames there are lifted back onto the layout path and a
`ResizeObserver` catches the moment an estimated height becomes a real one. Neither existed
when this attempt was made.

`preview.css` sets `content-visibility: visible` on the page containers of
image-based conversions (`body.bd > div`), which explicitly disables the browser's
ability to skip the layout and paint of off-screen pages. Removing that looked like
the largest remaining win, and on the measurement it was: with each page given its
own *measured* size as `contain-intrinsic-size` — so the scroll height was identical
to the pixel, 11 359 px either way — scrolling the captured 34 000-element PDF went
from 19 to 3 ms per frame idle, and from 32.6 to 2.7 with a citation displayed.

It was reverted because the bench refused it: **14 scenarios failed**, all on
`basic-pdf`, and all on the passages that live deep in the document.

```
FAIL basic-pdf  900px  fit     pages 14-15                   A3✗ A6✗
FAIL basic-pdf  900px  fit     pages 18-19, end of document  A3✗ A6✗
FAIL basic-pdf  520px  fit +2  pages 14-15                   A9✗
```

The frames land in the wrong place (`A3`), some enclose nothing at all (`A6`), and
the passage stops being scrolled into view (`A9`). The passage on pages 1–2 is fine,
which is what made a first hand-rolled probe report success: it sat near the top of
the document, where nothing is skipped. Geometry resolved on demand inside a skipped
subtree is evidently good enough for a container whose intrinsic size is exact and
shallow, and not good enough for a citation nineteen pages down.

If someone wants to try again, the shape that might work is temporarily lifting the
skipping while a citation is located, then restoring it — the frames are in local
coordinates and do not need recomputation afterwards. That is a different design, and
it needs its own measurements: a citation click would pay a full reflow.

## Investigating the running application

Some things the bench cannot reach by construction: a different origin, a real server, real
highlight data, a login. `investigate-app.mjs` drives the application over the Chrome
DevTools Protocol for those — with no dependency, since Node 24 has a built-in `WebSocket`
(no Playwright, no browser download).

```bash
node preview-lab/investigate-app.mjs "https://localhost:4200/#/search?q=…&id=…" \
  --seconds=60 --user=admin --password=…          # logs in, then observes
node preview-lab/investigate-app.mjs "<url>" --attach   # observes a browser you started
                                                        # with --remote-debugging-port=9222
```

Credentials are command-line arguments and are never stored in the file. `--attach` exists
so an already-authenticated session can be observed without handling any.

Two probes are installed in **every frame** before any page script runs, so they cover the
preview iframe as well as the host:

- the same main-thread blocking watcher as `block` above, recording every gap over 200 ms
  with its timestamp;
- a `message` listener logging `{action, ids.length}` — the logpoint on `receiveMessage`,
  without touching `preview.js`.

`--cpu` adds a sampling profiler, started and stopped around **each phase** — load, zoom,
scroll, seek — so the report says which function was executing, not merely when the thread
was unavailable. One session covers every same-process frame. A phase aggregate matters:
a single profile over three minutes cannot say whether `commitZoomLayout` spent its 1.4 s at
load or while scrolling, and that was the question.

`--window=900,1200` sets the viewport, `--scroll-steps` / `--scroll-delta` the wheel sweep.
`--inject-css=<file>` puts a stylesheet into every document *before* its body is parsed, which
prices a CSS idea against a real document without touching the product first — it is what
justified the containment work below, by showing the engine time was layout and not parsing.
`--eval=<file>` asks the real document a question at the end of a run (structure, computed
styles) instead of writing yet another probe script.

Two traps this tool fell into, now fixed, worth knowing if you extend it:

- **it profiled itself.** The 10-second snapshot read an `innerText`, which on a 15 MB
  document forces layout and builds a 15 MB string: a 200 ms block every 10 s, in the data.
  Reads on the hot path have to be cheap or guarded (they now are, by element count).
- **it reported a document the server never sent.** Six runs in a row measured a login that
  had silently failed: `CredentialsDenied`, four elements, and a cheerful "17 ms" on the
  document that freezes for twenty seconds. It now waits for the login field instead of a
  fixed delay, and refuses to produce a report at all when the document is not there.
- **it drove the wrong browser.** `--keep-open` leaves the browser alive, so a fixed
  debugging port meant the next run attached to the *previous* browser and reported the old
  document's timings. Each run now takes its own port, and prints which binary it launched —
  which mattered, because Chrome and Edge do not behave the same here.

What it established that the fixtures could not, on a 199 507-element PDF:

| | |
| --- | --- |
| browser parse and layout | ~2 650 ms, before any of our code |
| `computeFitFactor` | 650 ms — the first layout, which the browser owed anyway |
| `commitZoomLayout` at load | 740 ms — genuinely additional |
| a zoom *gesture* afterwards | **0 ms**, the budget having tripped on the load commit |
| `getHtml`, **100** ids | 26 ms |

That last row is why this tool matters: the extracts request carries 100 ids on the real
document, not the thousands the id-count curve was extrapolated to. The fix is real and the
curve is real, but only a live run says where on it a given deployment sits.

For attributing a cost to a function, wrap it in a temporary timer that pushes into
`window.__marks` and read that back — `preview.js` is served unminified from `src/assets`,
so an edit takes effect on the next iframe load. Uncommitted, and removed afterwards.

### The 15 MB document that makes the browser stop responding

A 444 494-element, 15 MB HTML converter output, 6 093 056 px tall once laid out at panel
width. Reported as: the browser goes *not responding* for minutes, and scrolling freezes
everything. Four runs, same document, same Chrome:

| condition | worst freeze | `(program)` | GC | `preview.js` |
| --- | --- | --- | --- | --- |
| in the app, preview panel | 21 891 ms | 16 099 | 50 | 1 788 |
| **alone**, no app, no iframe, 900 px | 21 375 ms | 16 752 | 2 566 | 2 016 |
| alone, no app, no iframe, 1900 px | **2 320 ms** | 3 530 | 1 475 | 167 |
| in the app, Edge instead of Chrome | 22 525 ms | 16 903 | 47 | 1 718 |

`(program)` is engine time outside JS — parsing, style, layout, paint.

:::warning
**Those are single runs, and single runs of this document mean very little.** Repeating the
same configuration eight times gave worst-freeze values from **4 120 to 22 288 ms** — a 5×
spread with nothing changed. The stable figure across all eight was `domInteractive → load`,
between 2 949 and 4 615 ms. Two claims made from the table above did not survive the
repetition: that the viewport width was worth a 9× difference, and that containment gained
71%. Neither is supported. What the table *does* establish is the first row against the
second — the same document, alone, freezing for the same twenty seconds.

The lesson is in the tool now: `worstBlockMs` is reported next to `totalBlockedMs`, and the
latter is the one to compare. A maximum is decided by a single coalesced timer; a sum is not.
And the place to compare *configurations* is the bench below, not the application.
:::

Four conclusions, none of which was the expected one:

1. **Neither the iframe nor Angular is involved.** The same document alone in a 900 px window
   freezes for the same 21 s. The suspicion was reasonable — a same-origin iframe shares the
   renderer process, so a freeze in the preview *does* freeze the whole app — but it adds
   nothing measurable here.
2. **The width is the whole story.** Double the viewport and the freeze drops 9×, because a
   text document at half the width wraps twice as much. This is the one big lever, and the
   product owns it: the preview panel is narrow by design.
3. **`preview.js` is 7–9 % of it**, all in the one-off `commitZoomLayout`, and only when the
   content overflows: at 1900 px the fit factor is 1, no commit happens, and our share falls
   to 167 ms. A zoom *gesture* after load costs ~1 ms of JS.
4. **Scrolling is not what freezes.** A wheel sweep blocks 115 ms at worst, and jumping to
   25/50/75/99 % of the document blocks 3–11 ms — except for one seek that blocked 3 009 ms,
   of which 2 105 ms was **garbage collection**. With 444 k DOM nodes traced by the unified
   heap, a major GC costs seconds and lands wherever it lands. On Chrome it landed on a
   scroll; on Edge, right after load (5 880 ms in one run). That is the Edge/Chrome
   difference users report — *when* the pause falls, not how much the load costs.

So the fix for this document is to stop laying out 444 k elements at once — which is what
`content-visibility` now does, and the section below is how that was finally made to work
after two failed attempts.

### Skipping off-screen blocks: what it took

Priced first, on the *bench*, because that is where a configuration can be compared. Same
session, HEAD re-measured minutes before:

| `basic-huge` (447 920 nodes) | open | scroll+ | sel+ |
| --- | --- | --- | --- |
| HEAD | 12 185 ms | 5.5 | 2.8 |
| with the rule | **892 ms** | 42.2 | 75.6 |

Every other target moved only within the drift. Two experiments along the way that a reader
of the numbers should know about:

- **`--inject-css` on the real document said the prize existed** before a line of product code
  was written: the engine time was layout, not parsing — `domInteractive` is reached in
  ~2.9 s of a 20 s freeze. That is what justified continuing after the width claim collapsed.
- **Removing the width commit** (a temporary `return` at the top of `commitZoomLayout`) took the
  open from 16 336 to 9 346 ms, which is how the double layout was found: the document is laid
  out once at its natural width and again at `99% / factor`. Worth knowing, but it stopped
  mattering — with containment in place, disabling the commit changes the open by 1 ms.

The four attempts, and why each failed, because the failure mode is the same every time and
reads like a geometry bug:

| attempt | bench | what was wrong |
| --- | --- | --- |
| rule alone | 75/115 | the overlay is a body child, so it was skipped too |
| + overlay excluded | 366/406 | estimated heights change and nothing notices |
| + `ResizeObserver` on the containers | 114/115 | page anchors inside estimated containers are never "in view" |
| + paginated documents excluded | **115/115, 406/406** | — |

Isolating which half of the rule broke things was worth the two runs it cost: with
`contain-intrinsic-height` removed the bench went straight back to 114/115, which said the
fallback height — not `content-visibility` itself — was what moved the geometry. It also
explains why it *had* to stay: without a fallback, unrendered blocks contribute no height, the
document collapses, everything counts as on-screen, and the gain disappears with the bug.

One bench fix belongs to this, and it is not cosmetic: A10 computed its ground truth 220 ms
after a `scrollTo` whose target came from an estimated `scrollHeight`. It now waits for the
height to stop moving. Ground truth measured in a layout that is still converging is not
ground truth.

## Validating against a real document

```
http://localhost:4300/preview-lab/?url=<documentCachedContentUrl>&snippet=3
```

Loads a real cached preview instead of a fixture and replays A1/A3/A4/A5 on
`snippet_3` at every zoom level (A2 is skipped, as no block count is declared).
This is the way to confirm the fix on a customer document without touching any
code. The URL must be same-origin with the bench, so serve the bench from a host
that proxies the Sinequa app, or point `--root` at it.
