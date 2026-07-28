/*
 * preview-lab runner.
 *
 * Drives src/assets/preview.js inside an iframe exactly like PreviewService does
 * (postMessage bridge), then measures the result.
 *
 * The key property that makes this automatable: the lab and the fixtures are
 * same-origin, so the runner can read the iframe DOM and recompute the GROUND
 * TRUTH itself -- the client rects of the `snippet_N` elements -- completely
 * independently of the code under test. Both the frames drawn by preview.js and
 * the ground truth are measured with getBoundingClientRect() in the *same*
 * viewport space, so the comparison needs no knowledge of the zoom factor or of
 * the coordinate conversion being verified.
 */
(function () {
  "use strict";

  // Mirrors src/config/highlight.config.ts (PREVIEW_HIGHLIGHTS).
  const PREVIEW_HIGHLIGHTS = [
    { name: "company", color: "white", bgColor: "#FF7675" },
    { name: "geo", color: "white", bgColor: "#74B9FF" },
    { name: "person", color: "white", bgColor: "#00ABB5" },
    { name: "money", color: "white", bgColor: "#85BB65" },
    { name: "entity12", color: "white", bgColor: "#FFD700" },
    { name: "extractslocations", color: "black", bgColor: "#fffacd" },
    { name: "matchlocations", color: "black", bgColor: "#ff0" }
  ];

  const FIXTURES = [
    { name: "pdf-pages", file: "fixtures/pdf-pages.html" },
    { name: "page-break", file: "fixtures/page-break.html" },
    { name: "two-columns", file: "fixtures/two-columns.html" },
    { name: "long-flow", file: "fixtures/long-flow.html" },
    { name: "multimodal", file: "fixtures/multimodal.html" },
    { name: "svg-text", file: "fixtures/svg-text.html" },
    { name: "frameset", file: "fixtures/frameset.html" },
    { name: "image-pages", file: "fixtures/image-pages.html" },
    // A real cached preview, captured from a Sinequa dev server. The three share the
    // same captured content and differ only by the layout imposed on it.
    { name: "basic-website", file: "fixtures/basic-website.html" },
    { name: "basic-website-columns", file: "fixtures/basic-website-columns.html" },
    { name: "basic-website-pages", file: "fixtures/basic-website-pages.html" },
    { name: "basic-website-paged-columns", file: "fixtures/basic-website-paged-columns.html" },
    // A second real capture, from the other end of the converter family: a PDF
    // rendered as page images with an absolutely positioned text layer.
    { name: "basic-pdf", file: "fixtures/basic-pdf.html" },
    // A third one, whose slide images have no intrinsic size and load late.
    { name: "basic-pptx", file: "fixtures/basic-pptx.html" }
  ];

  // The iframe width decides how many page sheets fit per row, i.e. whether the
  // preview is in "flex" mode. It is therefore a first-class test axis.
  const WIDTHS = [520, 900, 1800];

  // Only zoom-in / zoom-out / zoom-fit exist in the postMessage contract, so a
  // zoom level is expressed as a number of steps applied after a zoom-fit.
  const ZOOMS = [
    { name: "fit", steps: [] },
    { name: "fit −2", steps: ["zoom-out", "zoom-out"] },
    { name: "fit −4", steps: ["zoom-out", "zoom-out", "zoom-out", "zoom-out"] },
    { name: "fit +2", steps: ["zoom-in", "zoom-in"] }
  ];

  const QUICK_WIDTHS = [900];
  const QUICK_ZOOMS = [ZOOMS[0], ZOOMS[2]];

  // Profiling targets. Deliberately a separate list from FIXTURES: the point here is
  // cost as a function of DOM size and layout regime, not correctness, and the stress
  // fixture is far too slow to belong in the assertion matrix.
  const PROFILE_TARGETS = [
    { name: "basic-pdf", file: "fixtures/basic-pdf.html" },
    { name: "basic-pptx", file: "fixtures/basic-pptx.html" },
    { name: "basic-website", file: "fixtures/basic-website.html" },
    { name: "pdf-pages", file: "fixtures/pdf-pages.html" },
    // Same node count, two layout regimes: fixed-size sheets with absolutely
    // positioned lines (a width change moves sheets but resizes nothing) versus a
    // flowing document (a width change re-wraps everything). Section B of the plan
    // says these must not be assumed equivalent, so they are measured separately.
    { name: "stress-abs-5k", file: "fixtures/zoom-stress.html?nodes=5000&mode=absolute" },
    { name: "stress-abs-20k", file: "fixtures/zoom-stress.html?nodes=20000&mode=absolute" },
    { name: "stress-abs-60k", file: "fixtures/zoom-stress.html?nodes=60000&mode=absolute" },
    { name: "stress-flow-5k", file: "fixtures/zoom-stress.html?nodes=5000&mode=flow" },
    { name: "stress-flow-20k", file: "fixtures/zoom-stress.html?nodes=20000&mode=flow" },
    // Highlighted SVG text runs, to expose what the startup background pass costs.
    { name: "stress-svg-2k", file: "fixtures/zoom-stress.html?nodes=2000&mode=svg" },
    { name: "stress-svg-5k", file: "fixtures/zoom-stress.html?nodes=5000&mode=svg" }
  ];

  const PROFILE_WIDTH = 900;
  const PROFILE_ZOOM_STEPS = 4;
  const PROFILE_SCROLL_STEPS = 20;

  /** Number of full reloads used by the stability scenario. */
  const REPEAT_RUNS = 10;

  /** Frames drawn by the code under test, current and legacy shapes. */
  const FRAME_SELECTOR = "#sq-passage-layer > *, .sq-passage-box, #sq-passage-highlighter";

  const TOLERANCE_PX = 2; // coverage slack, in device-independent pixels
  // Density: a frame enclosing far more empty space than text may be a union rect
  // spanning several blocks. Calibrated by measurement, not by feel: the legitimate
  // maximum is a sparse passage merged into one frame (3.4), while reintroducing the
  // union bug scores 5.6 to 28.1 on page-break and up to 16.2 on two-columns. 4.5
  // sits between the two. Note that A4 is never the *sole* detector of that bug --
  // all 24 union scenarios also fail A2 and A5 -- so this threshold is a backstop.
  const MAX_AREA_RATIO = 4.5;
  const MAX_OUTSET_PX = 12; // how far a frame may extend beyond its own fragments
  const MAX_DECOY_OVERLAP = 0.15; // share of a decoy a frame may cover
  // Two frames of the same passage overlapping means the block decomposition is
  // wrong: they describe the same text twice. Only the padding of two abutting
  // blocks may legitimately touch.
  const MAX_FRAME_OVERLAP = 0.1;
  // Share of the anchor that must end up inside the preview viewport. A frame can
  // be perfectly placed and still be useless if the document never scrolled to it.
  const MIN_ANCHOR_VISIBILITY = 0.5;

  const params = new URLSearchParams(window.location.search);

  const dom = {
    iframe: document.getElementById("preview"),
    results: document.getElementById("results"),
    summary: document.getElementById("summary"),
    status: document.getElementById("status"),
    runAll: document.getElementById("run-all"),
    runQuick: document.getElementById("run-quick"),
    fixtureSelect: document.getElementById("fixture-select"),
    passageSelect: document.getElementById("passage-select"),
    widthSelect: document.getElementById("width-select"),
    showTruth: document.getElementById("show-truth"),
    log: document.getElementById("log")
  };

  const state = {
    running: false,
    readyPending: null,
    lastReadyToken: 0,
    descriptionVisible: false,
    currentFile: null,
    lastOpenMs: 0,
    currentPage: null,
    currentPageCount: 0,
    rows: []
  };

  // ---------------------------------------------------------------------------
  // postMessage bridge
  // ---------------------------------------------------------------------------

  window.addEventListener("message", event => {
    if (!dom.iframe.contentWindow || event.source !== dom.iframe.contentWindow) return;
    const message = event.data || {};
    if (!message.type) return;

    // returnMessage() posts to both `parent` and `parent.parent`, so every
    // message arrives twice when the lab is the top-level window.
    if (message.type === "ready") {
      send({ action: "init", highlights: PREVIEW_HIGHLIGHTS, appname: "preview-lab" });
      if (state.readyPending) {
        const resolve = state.readyPending;
        state.readyPending = null;
        resolve();
      }
      return;
    }

    if (message.type === "description-visible") {
      state.descriptionVisible = true;
      trace("description-visible");
      return;
    }

    // Consumed by preview-content.ts, and the only way the page indicator follows the
    // scroll. Recorded so A10 can check it against ground truth.
    if (message.type === "current-page") {
      state.currentPage = message.data;
      state.currentPageCount++;
      return;
    }

    if (message.type === "selected-position" || message.type === "page-info") {
      trace(message.type + " " + JSON.stringify(message.data));
    }
  });

  function send(message) {
    const target = dom.iframe.contentWindow;
    if (target) target.postMessage(message, window.location.origin);
  }

  function trace(text) {
    if (!dom.log) return;
    dom.log.textContent = (text + "\n" + dom.log.textContent).slice(0, 4000);
  }

  // ---------------------------------------------------------------------------
  // Content document access (frameset aware, mirrors preview.js)
  // ---------------------------------------------------------------------------

  function contentDoc() {
    const doc = dom.iframe.contentDocument;
    if (!doc) return null;
    const frame = doc.querySelector("frameset>frame");
    if (frame && frame.contentDocument && frame.contentDocument.body) return frame.contentDocument;
    return doc;
  }

  function contentBody() {
    const doc = contentDoc();
    return doc ? doc.body : null;
  }

  /**
   * Size of the preview viewport. The converters emit no doctype, so the content
   * document is in quirks mode and its scrolling element is `body`, not
   * `documentElement` — reading the wrong one reports the height of an ordinary
   * box instead of the viewport.
   */
  function contentViewport() {
    const doc = contentDoc();
    const scroller = doc && (doc.scrollingElement || doc.documentElement);
    if (!scroller) return null;
    const view = doc.defaultView || window;
    return {
      width: scroller.clientWidth || view.innerWidth,
      height: scroller.clientHeight || view.innerHeight,
      scrollTop: scroller.scrollTop
    };
  }

  function expectation() {
    try {
      return dom.iframe.contentWindow.LAB_EXPECT || null;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Geometry helpers
  // ---------------------------------------------------------------------------

  function rectsOf(element) {
    let list = Array.from(element.getClientRects());
    // SVG elements return an empty list in some engines: fall back to the
    // bounding box so SVG previews can still be verified.
    if (!list.length) list = [element.getBoundingClientRect()];
    return list.filter(rect => rect.width > 0.5 && rect.height > 0.5).map(rect => ({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }));
  }

  function area(rect) {
    return Math.max(0, rect.right - rect.left) * Math.max(0, rect.bottom - rect.top);
  }

  function sumArea(rects) {
    return rects.reduce((total, rect) => total + area(rect), 0);
  }

  function contains(outer, inner, tolerance) {
    return (
      inner.left >= outer.left - tolerance &&
      inner.top >= outer.top - tolerance &&
      inner.right <= outer.right + tolerance &&
      inner.bottom <= outer.bottom + tolerance
    );
  }

  function boundingBox(rects) {
    return {
      left: Math.min(...rects.map(rect => rect.left)),
      top: Math.min(...rects.map(rect => rect.top)),
      right: Math.max(...rects.map(rect => rect.right)),
      bottom: Math.max(...rects.map(rect => rect.bottom))
    };
  }

  function intersectionArea(a, b) {
    const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return width > 0 && height > 0 ? width * height : 0;
  }

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  // ---------------------------------------------------------------------------
  // Measurement
  // ---------------------------------------------------------------------------

  /**
   * Frames actually drawn. The legacy `#sq-passage-highlighter` div always exists
   * once init() ran (hidden when unused), so the element must be measured, not
   * merely counted.
   */
  function visibleFrames(doc) {
    return frameElements(doc).flatMap(element => rectsOf(element));
  }

  function frameElements(doc) {
    return Array.from(doc.querySelectorAll(FRAME_SELECTOR)).filter(element => rectsOf(element).length > 0);
  }

  /**
   * A frame positioned perfectly but drawn with no visible border would satisfy
   * every geometric assertion. `border-width: calc(2px / var(--factor))` is a real
   * way to end up there: an invalid custom property makes the declaration invalid
   * at computed-value time.
   */
  function frameStroke(doc) {
    const elements = frameElements(doc);
    if (!elements.length) return null;
    let minWidth = Infinity;
    let transparent = false;
    for (const element of elements) {
      const style = (element.ownerDocument.defaultView || window).getComputedStyle(element);
      const width = parseFloat(style.borderTopWidth) || 0;
      // Chrome reports `outline-width: medium` (3px) even when `outline-style` is
      // none, so the style has to be checked before the width is trusted.
      const outline = style.outlineStyle === "none" ? 0 : parseFloat(style.outlineWidth) || 0;
      minWidth = Math.min(minWidth, Math.max(width, outline));
      if (/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/.test(style.borderTopColor) || style.visibility === "hidden" || parseFloat(style.opacity) === 0) {
        transparent = true;
      }
    }
    return { minWidth: minWidth, transparent: transparent };
  }

  function measure(id) {
    const doc = contentDoc();
    if (!doc) return null;

    const elements = Array.from(doc.querySelectorAll('[id="' + id + '"]'));
    const truth = [];
    let measuredElements = 0;
    for (const element of elements) {
      const rects = rectsOf(element);
      if (rects.length) measuredElements++;
      truth.push(...rects);
    }

    const frames = visibleFrames(doc);
    const stroke = frameStroke(doc);
    const decoys = Array.from(doc.querySelectorAll("[data-lab-decoy]")).flatMap(element => rectsOf(element));

    // The element preview.js scrolls to, picked the same way it picks it: the first
    // measurable fragment, or the first one when none is measurable.
    const anchorElement = elements.find(element => rectsOf(element).length > 0) || elements[0] || null;

    return {
      elements: elements.length,
      measuredElements: measuredElements,
      anchor: anchorElement ? anchorElement.getBoundingClientRect() : null,
      viewport: contentViewport(),
      complete: elements.length > 0 && measuredElements === elements.length,
      truth: truth,
      frames: frames,
      stroke: stroke,
      decoys: decoys,
      // Scoped to this passage: a leftover class on another passage must not be
      // reported as "this passage is in background-tint mode".
      backgroundOnly: frames.length === 0 && elements.some(element => element.classList.contains("sq-highlighted"))
    };
  }

  function digest(rects) {
    return rects.map(rect => [round(rect.left), round(rect.top), round(rect.right), round(rect.bottom)].join(",")).join("|");
  }

  /**
   * Both sides of the comparison, deliberately. Waiting for the *frames* to stop
   * moving is not enough: a frame that is never repositioned is stable from the
   * first sample, so the wait would end before the document itself has settled and
   * the assertions would compare frames and text captured while both still agreed.
   * That is exactly how a late-loading image slips through — the text moves after
   * the check. Stability has to mean "nothing is moving any more".
   */
  function signature(measurement) {
    return digest(measurement.frames) + " :: " + digest(measurement.truth);
  }

  /**
   * Waits until the geometry stops changing, so that the assertions never race the
   * retry / reposition logic of preview.js, nor a reflow still under way.
   */
  async function waitStable(id, options) {
    // Generous, because it costs nothing on a settled layout: the loop returns as
    // soon as two consecutive samples agree. The budget only matters for fixtures
    // whose resources arrive late, and there it must exceed the slowest of them.
    const deadline = Date.now() + ((options && options.timeout) || 4000);
    let previous = null;
    let stableCount = 0;

    for (;;) {
      const measurement = measure(id);
      if (!measurement) return null;
      const current = signature(measurement);

      if (current === previous) {
        stableCount++;
        const enough = measurement.frames.length > 0 || (options && options.expectFrames === false);
        if (stableCount >= 2 && enough) return measurement;
      } else {
        stableCount = 0;
      }
      previous = current;

      if (Date.now() > deadline) return measurement;
      await delay(40);
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  // ---------------------------------------------------------------------------
  // Assertions
  // ---------------------------------------------------------------------------

  function assess(measurement, expected) {
    const checks = [];
    const frames = measurement.frames;
    const truth = measurement.truth;

    if (!truth.length) {
      // A real failure, not a skip: a citation that cannot be located is exactly
      // the "no blue box at all" symptom. The multimodal fixture lands here
      // because the AI description subtree is `display: none` by default.
      checks.push({
        id: "A0",
        label: "passage measurable",
        pass: false,
        detail: "no measurable fragment for " + measurement.elements + " element(s) — hidden subtree, or id not found"
      });
      return checks;
    }

    const prelude =
      typeof measurement.preMeasured === "number"
        ? ", " + measurement.preMeasured + "/" + measurement.elements + " fragment(s) laid out before the scroll"
        : "";
    // Distinct horizontal positions among the frames, bucketed to absorb indentation.
    // Reported, not asserted: it is how one can tell whether a scenario actually
    // exercised a column break rather than merely a set of stacked paragraphs.
    const columnPositions = new Set(frames.map(frame => Math.round(frame.left / 8))).size;

    checks.push({
      id: "A1",
      label: "at least one frame",
      pass: frames.length > 0,
      detail: frames.length + " frame(s) at " + columnPositions + " x-position(s)" + (measurement.backgroundOnly ? " — background-tint mode" : "") + prelude
    });

    const blocks = expected && typeof expected.blocks === "number" ? expected.blocks : null;
    if (blocks === null) {
      checks.push({ id: "A2", label: "frame count", pass: true, skipped: true, detail: "no declared expectation" });
    } else if (!measurement.complete) {
      checks.push({
        id: "A2",
        label: "frame count",
        pass: true,
        skipped: true,
        detail: "partial rendering (" + measurement.measuredElements + "/" + measurement.elements + " fragments measurable)"
      });
    } else {
      checks.push({
        id: "A2",
        label: "frame count",
        pass: frames.length === blocks,
        detail: frames.length + " frame(s), expected " + blocks
      });
    }

    const uncovered = truth.filter(rect => !frames.some(frame => contains(frame, rect, TOLERANCE_PX)));
    checks.push({
      id: "A3",
      label: "every fragment covered",
      pass: uncovered.length === 0,
      detail: uncovered.length === 0 ? truth.length + " fragment(s) covered" : uncovered.length + "/" + truth.length + " fragment(s) outside any frame"
    });

    const framesArea = sumArea(frames);
    const truthArea = sumArea(truth);
    const ratio = truthArea > 0 ? framesArea / truthArea : Infinity;
    checks.push({
      id: "A4",
      label: "frames not oversized",
      pass: frames.length === 0 ? false : ratio <= MAX_AREA_RATIO,
      detail: "area ratio " + round(ratio) + " (max " + MAX_AREA_RATIO + ")"
    });

    // Each frame must hug the fragments it encloses. Catches a frame drawn at the
    // right place but far too large, and a frame that encloses nothing at all.
    let worstOutset = 0;
    let orphan = false;
    for (const frame of frames) {
      const covered = truth.filter(rect => contains(frame, rect, TOLERANCE_PX));
      if (!covered.length) {
        orphan = true;
        continue;
      }
      const hull = boundingBox(covered);
      worstOutset = Math.max(worstOutset, hull.left - frame.left, hull.top - frame.top, frame.right - hull.right, frame.bottom - hull.bottom);
    }
    checks.push({
      id: "A6",
      label: "each frame hugs its own fragments",
      pass: frames.length > 0 && !orphan && worstOutset <= MAX_OUTSET_PX,
      detail: orphan ? "a frame encloses no fragment" : "worst outset " + round(worstOutset) + "px (max " + MAX_OUTSET_PX + ")"
    });

    const stroke = measurement.stroke;
    checks.push({
      id: "A7",
      label: "frames are actually stroked",
      pass: !!stroke && stroke.minWidth >= 0.5 && !stroke.transparent,
      detail: stroke ? "thinnest border " + round(stroke.minWidth) + "px" + (stroke.transparent ? ", fully transparent" : "") : "no frame element"
    });

    let worstPair = 0;
    for (let i = 0; i < frames.length; i++) {
      for (let j = i + 1; j < frames.length; j++) {
        const smallest = Math.min(area(frames[i]), area(frames[j]));
        if (smallest <= 0) continue;
        worstPair = Math.max(worstPair, intersectionArea(frames[i], frames[j]) / smallest);
      }
    }
    checks.push({
      id: "A8",
      label: "frames do not overlap each other",
      pass: worstPair <= MAX_FRAME_OVERLAP,
      detail: frames.length < 2 ? "single frame" : "worst pair overlap " + Math.round(worstPair * 100) + "% (max " + Math.round(MAX_FRAME_OVERLAP * 100) + "%)"
    });

    let worstDecoy = 0;
    for (const decoy of measurement.decoys) {
      const decoyArea = area(decoy);
      if (decoyArea <= 0) continue;
      for (const frame of frames) {
        worstDecoy = Math.max(worstDecoy, intersectionArea(frame, decoy) / decoyArea);
      }
    }
    checks.push({
      id: "A5",
      label: "no unrelated content framed",
      pass: worstDecoy <= MAX_DECOY_OVERLAP,
      detail: "worst decoy overlap " + Math.round(worstDecoy * 100) + "% (max " + Math.round(MAX_DECOY_OVERLAP * 100) + "%)"
    });

    // Frames drawn at the right place are worthless if the document never scrolled
    // to them. Every scenario starts from the top of the document, so this really
    // measures the scroll performed by the select.
    const anchor = measurement.anchor;
    const viewport = measurement.viewport;
    if (!anchor || !viewport) {
      checks.push({ id: "A9", label: "passage scrolled into view", pass: true, skipped: true, detail: "no anchor to scroll to" });
    } else {
      const visible = { left: 0, top: 0, right: viewport.width, bottom: viewport.height };
      const overlapY = Math.min(anchor.bottom, visible.bottom) - Math.max(anchor.top, visible.top);
      const overlapX = Math.min(anchor.right, visible.right) - Math.max(anchor.left, visible.left);
      const shareY = Math.max(0, overlapY) / Math.max(1, Math.min(anchor.height, viewport.height));
      const shareX = Math.max(0, overlapX) / Math.max(1, Math.min(anchor.width, viewport.width));
      checks.push({
        id: "A9",
        label: "passage scrolled into view",
        pass: shareY >= MIN_ANCHOR_VISIBILITY && shareX >= MIN_ANCHOR_VISIBILITY,
        detail:
          "anchor " +
          Math.round(shareX * 100) +
          "% × " +
          Math.round(shareY * 100) +
          "% inside the " +
          viewport.width +
          "×" +
          viewport.height +
          " viewport at top=" +
          round(anchor.top)
      });
    }

    return checks;
  }

  // ---------------------------------------------------------------------------
  // Fixture lifecycle
  // ---------------------------------------------------------------------------

  async function load(file, width) {
    dom.iframe.style.width = width + "px";
    state.descriptionVisible = false;
    state.currentFile = file;

    const ready = new Promise((resolve, reject) => {
      state.readyPending = resolve;
      setTimeout(() => {
        if (state.readyPending === resolve) {
          state.readyPending = null;
          reject(new Error("timeout waiting for the iframe `ready` message"));
        }
      }, 8000);
    });

    // Cache-busting so every run starts from a pristine layout (preview.js
    // caches its zoom-fit factor for the lifetime of the document). Fixtures may
    // already carry their own query string, hence the separator.
    const openedAt = performance.now();
    dom.iframe.src = file + (file.includes("?") ? "&t=" : "?t=") + state.lastReadyToken++;
    await ready;
    // Time to `ready` is the metric that covers everything preview.js does before the
    // host is allowed to drop its spinner: zoomFit()'s enumeration, the SVG background
    // pass, and the fixed 500 ms wait.
    state.lastOpenMs = performance.now() - openedAt;
    await nextFrame();
  }

  async function applyZoom(steps) {
    send({ action: "zoom-fit" });
    for (const step of steps) {
      send({ action: step });
    }
    await nextFrame();
    await delay(60);
  }

  async function selectPassage(id, options) {
    send({ action: "unselect" });
    await nextFrame();

    // Back to the top of the document, the state a freshly opened preview is in.
    // Without this, a scenario could inherit the scroll position of the previous
    // one and A9 would pass on a passage that was already visible.
    const view = contentDoc() && contentDoc().defaultView;
    if (view) view.scrollTo({ top: 0, left: 0, behavior: "instant" });
    await nextFrame();

    // Snapshot taken BEFORE the select, i.e. before preview.js scrolls: this is
    // how many fragments are laid out at the moment the shipped code decides
    // whether to draw a passage frame at all (`content-visibility: auto` makes
    // off-screen pages measure 0x0). Recorded for diagnosis, not asserted.
    const before = measure(id);

    send({ action: "select", id: id, usePassageHighlighter: true });
    const measurement = await waitStable(id, options);
    if (measurement && before) {
      measurement.preMeasured = before.measuredElements;
    }
    return measurement;
  }

  // ---------------------------------------------------------------------------
  // Runner
  // ---------------------------------------------------------------------------

  function passagesOf(expect) {
    return expect && expect.passages ? Object.keys(expect.passages) : [];
  }

  async function runMatrix(fixtures, widths, zooms) {
    if (state.running) return;
    state.running = true;
    state.rows = [];
    dom.results.innerHTML = "";
    setStatus("running…");

    let total = 0;
    let failed = 0;

    for (const fixture of fixtures) {
      for (const width of widths) {
        let expect;
        try {
          await load(fixture.file, width);
          expect = expectation();
        } catch (error) {
          addRow({
            fixture: fixture.name,
            width: width,
            zoom: "—",
            passage: "—",
            checks: [{ id: "load", label: "fixture loads", pass: false, detail: String(error.message || error) }]
          });
          total++;
          failed++;
          continue;
        }

        const ids = passagesOf(expect);
        if (!ids.length) {
          const check = await probePageScroll(expect);
          addRow({ fixture: fixture.name, width: width, zoom: "fit", passage: "— (no text)", checks: [check] });
          total++;
          if (!check.pass) failed++;
          continue;
        }

        for (const zoom of zooms) {
          await applyZoom(zoom.steps);
          for (const id of ids) {
            const measurement = await selectPassage(id);
            const checks = measurement
              ? assess(measurement, expect.passages[id])
              : [{ id: "measure", label: "measurable", pass: false, detail: "no content document" }];
            const row = {
              fixture: fixture.name,
              width: width,
              zoom: zoom.name,
              factor: readFactor(),
              passage: (expect.passages[id] && expect.passages[id].label) || id,
              checks: checks
            };
            addRow(row);
            total++;
            if (checks.some(check => !check.pass && !check.skipped)) failed++;
            if (dom.showTruth.checked) drawTruth(measurement);
          }
        }
      }
    }

    // The host's real sequence, which nothing above covers: it never sends zoom-fit, it
    // relies on the automatic one done at DOMContentLoaded and selects the citation as
    // soon as `ready` arrives. Every scenario above sends an explicit zoom-fit first, so
    // a factor that was only correct *because* of that message would have gone unnoticed.
    for (const fixture of ["basic-pdf", "basic-pptx", "basic-website", "pdf-pages"]) {
      await load("fixtures/" + fixture + ".html", 900);
      const expect = expectation();
      const ids = passagesOf(expect);
      if (!ids.length) continue;
      const measurement = await selectPassage(ids[0]);
      const checks = measurement
        ? assess(measurement, expect.passages[ids[0]])
        : [{ id: "measure", label: "measurable", pass: false, detail: "no content document" }];
      addRow({
        fixture: fixture,
        width: 900,
        zoom: "auto-fit only",
        factor: readFactor(),
        passage: (expect.passages[ids[0]] && expect.passages[ids[0]].label) || ids[0],
        checks: checks
      });
      total++;
      if (checks.some(check => !check.pass && !check.skipped)) failed++;
    }

    // Page tracking, on the two paginated shapes: the synthetic sheets and a real
    // capture distributed into sheets. Not folded into the per-passage loops because it
    // owns the scroll position, which those deliberately reset.
    for (const fixture of ["pdf-pages", "basic-website-pages"]) {
      await load("fixtures/" + fixture + ".html", 900);
      await applyZoom([]);
      const check = await probePageTracking();
      addRow({ fixture: fixture, width: 900, zoom: "fit", factor: readFactor(), passage: "page tracking", checks: [check] });
      total++;
      if (!check.pass && !check.skipped) failed++;
    }

    // Stability across reloads: the passage on the last page of a long document,
    // with a full reload each time. Guards against a timing-dependent result --
    // the frame must not depend on how much of the document happened to be laid
    // out when the citation was selected.
    for (let run = 1; run <= REPEAT_RUNS; run++) {
      await load("fixtures/pdf-pages.html", 900);
      await applyZoom([]);
      const measurement = await selectPassage("snippet_2");
      const checks = measurement ? assess(measurement, { blocks: 1 }) : [];
      addRow({
        fixture: "pdf-pages",
        width: 900,
        zoom: "fit",
        factor: readFactor(),
        passage: "last page — reload " + run + "/" + REPEAT_RUNS,
        checks: checks
      });
      total++;
      if (checks.some(check => !check.pass && !check.skipped)) failed++;
    }

    state.running = false;
    setStatus("done");
    dom.summary.textContent = total - failed + " / " + total + " scenarios passed";
    dom.summary.className = failed === 0 ? "summary pass" : "summary fail";
    publish(total, failed);
  }

  /**
   * Hands the run back to run-ci.mjs when the lab is driven headlessly.
   * `window.__LAB_RESULTS__` is also set, for manual inspection from a console.
   */
  function publish(total, failed) {
    const payload = { total: total, passed: total - failed, rows: state.rows };
    window.__LAB_RESULTS__ = payload;
    if (!params.get("ci")) return;
    fetch("/_lab-results", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {
      /* running without the lab server: the on-page table is the only output */
    });
  }

  // ---------------------------------------------------------------------------
  // Profiling (?profile=1)
  //
  // No instrumentation is added to preview.js. Everything is measured from here,
  // which is possible because the lab and the fixture are same-origin: the runner
  // can register a PerformanceObserver *inside* the iframe's window, and it can
  // read the iframe's inline style attribute to know exactly when preview.js has
  // written the zoom factor -- without forcing a style recalc, which would
  // pollute the very number being measured.
  // ---------------------------------------------------------------------------

  /**
   * Long Animation Frames report per-frame blocking time and, per script, the time
   * spent in *forced* style and layout -- exactly the reflow this profiling exists
   * to quantify. Only frames longer than 50 ms are reported, so the totals are a
   * lower bound; `longtask` is the fallback on engines without LoAF.
   */
  function startFrameObserver(view) {
    const Observer = view.PerformanceObserver;
    if (!Observer) return null;
    const supported = Observer.supportedEntryTypes || [];
    const type = supported.includes("long-animation-frame") ? "long-animation-frame" : "longtask";
    const tracker = { type: type, label: null, entries: [] };
    try {
      tracker.observer = new Observer(list => {
        for (const entry of list.getEntries()) {
          const scripts = entry.scripts || [];
          tracker.entries.push({
            label: tracker.label,
            duration: Math.round(entry.duration),
            blocking: Math.round(entry.blockingDuration || 0),
            forced: Math.round(scripts.reduce((total, script) => total + (script.forcedStyleAndLayoutDuration || 0), 0))
          });
        }
      });
      tracker.observer.observe({ type: type });
    } catch {
      return null;
    }
    return tracker;
  }

  function summariseFrames(tracker, label) {
    const rows = tracker ? tracker.entries.filter(entry => entry.label === label) : [];
    return {
      frames: rows.length,
      blocking: rows.reduce((total, row) => total + row.blocking, 0),
      forced: rows.reduce((total, row) => total + row.forced, 0),
      worst: rows.reduce((worst, row) => Math.max(worst, row.duration), 0)
    };
  }

  /**
   * Resolves when preview.js writes `--factor` on the body, with the iframe's own
   * clock. A MutationObserver fires as a microtask right after the write, so the
   * pending invalidation is still pending when it resolves -- which is what makes
   * the forced read that follows measure precisely that invalidation.
   */
  function waitForFactorWrite(doc, timeoutMs) {
    return new Promise(resolve => {
      const view = doc.defaultView;
      const observer = new view.MutationObserver(() => {
        observer.disconnect();
        clearTimeout(timer);
        resolve(view.performance.now());
      });
      observer.observe(doc.body, { attributes: true, attributeFilter: ["style"] });
      const timer = setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeoutMs);
    });
  }

  async function measureZoomStep(action) {
    const doc = contentDoc();
    if (!doc || !doc.body) return null;
    const view = doc.defaultView;

    const written = waitForFactorWrite(doc, 3000);
    const start = view.performance.now();
    send({ action: action });
    const writtenAt = await written;
    // No write means the factor was already clamped at a bound: not a measurement.
    if (writtenAt === null) return null;

    const beforeForced = view.performance.now();
    const width = doc.body.offsetWidth;
    const forced = view.performance.now() - beforeForced;

    await nextFrame();
    return { dispatch: writtenAt - start, forced: forced, width: width };
  }

  /** One frame of the *iframe's* clock. `nextFrame()` waits two, which is enough to swamp what is being measured here. */
  function nextFrameIn(view) {
    return new Promise(resolve => view.requestAnimationFrame(() => resolve()));
  }

  async function measureScrollSweep(steps) {
    const doc = contentDoc();
    if (!doc) return null;
    const view = doc.defaultView;
    const scroller = doc.scrollingElement || doc.documentElement;
    const distance = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const anchors = doc.querySelectorAll('[id^="sq-page-start"]').length;

    const start = view.performance.now();
    for (let step = 1; step <= steps; step++) {
      view.scrollTo({ top: (distance * step) / steps, left: 0, behavior: "instant" });
      await nextFrameIn(view);
    }
    const total = view.performance.now() - start;
    view.scrollTo({ top: 0, left: 0, behavior: "instant" });
    await nextFrameIn(view);

    // Paced by one rAF per step, so ~16.7 ms per frame is the floor at 60 Hz. Only the
    // excess over that floor can be attributed to the scroll handler, and even then it
    // is an upper bound -- frame pacing is not perfectly regular.
    const floor = 1000 / 60;
    return {
      total: total,
      steps: steps,
      anchors: anchors,
      perFrame: total / steps,
      excessPerFrame: Math.max(0, total / steps - floor)
    };
  }

  async function runProfile() {
    state.running = true;
    setStatus("profiling…");
    const rows = [];

    for (const target of PROFILE_TARGETS) {
      try {
        await load(target.file, PROFILE_WIDTH);
      } catch (error) {
        rows.push({ target: target.name, error: String(error.message || error) });
        continue;
      }

      const doc = contentDoc();
      const view = doc && doc.defaultView;
      if (!view) {
        rows.push({ target: target.name, error: "no content document" });
        continue;
      }

      const nodes = doc.getElementsByTagName("*").length;
      const tracker = startFrameObserver(view);
      const row = { target: target.name, nodes: nodes, open: Math.round(state.lastOpenMs), observer: tracker ? tracker.type : "none" };

      const steps = [];
      if (tracker) tracker.label = "zoom-in";
      for (let step = 0; step < PROFILE_ZOOM_STEPS; step++) {
        const measurement = await measureZoomStep("zoom-in");
        if (measurement) steps.push(measurement);
      }

      // Measured here, between the two batches, and not after them: `zoomFit()` reuses
      // its cached factor, so writing the *same* value the body already carries may not
      // touch the style attribute at all -- and then there is no mutation to observe.
      // Coming back to the fit factor from a zoomed-in state guarantees a real write.
      if (tracker) tracker.label = "zoom-fit";
      const fit = await measureZoomStep("zoom-fit");
      row.fitForced = fit ? round(fit.forced) : null;
      row.fitDispatch = fit ? round(fit.dispatch) : null;

      if (tracker) tracker.label = "zoom-out";
      for (let step = 0; step < PROFILE_ZOOM_STEPS; step++) {
        const measurement = await measureZoomStep("zoom-out");
        if (measurement) steps.push(measurement);
      }

      row.zoomSteps = steps.length;
      row.zoomForcedMax = round(steps.reduce((worst, item) => Math.max(worst, item.forced), 0));
      row.zoomForcedAvg = round(steps.length ? steps.reduce((total, item) => total + item.forced, 0) / steps.length : 0);
      row.zoomDispatchAvg = round(steps.length ? steps.reduce((total, item) => total + item.dispatch, 0) / steps.length : 0);
      row.zoomFrames = summariseFrames(tracker, "zoom-in");

      if (tracker) tracker.label = "scroll";
      const sweep = await measureScrollSweep(PROFILE_SCROLL_STEPS);
      row.scrollTotal = sweep ? Math.round(sweep.total) : null;
      row.scrollPerFrame = sweep ? round(sweep.perFrame) : null;
      row.scrollExcess = sweep ? round(sweep.excessPerFrame) : null;
      row.pageAnchors = sweep ? sweep.anchors : null;
      row.scrollFrames = summariseFrames(tracker, "scroll");

      // The same sweep with a citation displayed. This is the expensive scroll in
      // practice -- the frame may be recomputed on every frame -- and it is the only
      // way to see what renderPassage() costs, since the sweep above selects nothing.
      const ids = passagesOf(expectation());
      if (ids.length) {
        if (tracker) tracker.label = "scroll-selected";
        send({ action: "select", id: ids[0], usePassageHighlighter: true });
        await delay(500);
        const selectedSweep = await measureScrollSweep(PROFILE_SCROLL_STEPS);
        row.scrollSelectedExcess = selectedSweep ? round(selectedSweep.excessPerFrame) : null;
        row.passageFragments = contentDoc() ? contentDoc().querySelectorAll('[id="' + ids[0] + '"]').length : null;
        send({ action: "unselect" });
        await nextFrame();
      } else {
        row.scrollSelectedExcess = null;
        row.passageFragments = null;
      }

      if (tracker && tracker.observer) tracker.observer.disconnect();
      rows.push(row);
      setStatus("profiled " + target.name);
    }

    state.running = false;
    setStatus("done (profiling)");
    dom.summary.textContent = rows.length + " target(s) profiled — see the console or .last-profile.json";
    window.__LAB_PROFILE__ = { rows: rows };
    if (params.get("ci")) {
      await fetch("/_lab-profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows: rows })
      }).catch(() => {
        /* running without the lab server: __LAB_PROFILE__ is the only output */
      });
    }
  }

  /**
   * Fixtures without text (scanned pages) can only be validated on the page
   * scroll path used by secondary conversions.
   */
  async function probePageScroll(expect) {
    const anchorId = (expect && expect.pageProbe) || null;
    if (!anchorId) return { id: "probe", label: "page scroll", pass: true, skipped: true, detail: "nothing to probe" };

    const doc = contentDoc();
    const before = doc.documentElement.scrollTop;
    send({ action: "select", id: anchorId, usePassageHighlighter: false });
    await delay(700);
    const after = doc.documentElement.scrollTop;
    const frames = visibleFrames(doc).length;
    return {
      id: "probe",
      label: "page scroll to " + anchorId,
      pass: after !== before && frames === 0,
      detail: "scrollTop " + Math.round(before) + " → " + Math.round(after) + ", " + frames + " frame(s) drawn"
    };
  }

  /**
   * The scale actually applied to the body, read from the resolved transform matrix.
   * Not from `--factor`: preview.js applies the zoom as an inline transform and leaves
   * that custom property at whatever the server wrote, because writing it would
   * invalidate style for the whole document.
   */
  /**
   * A10 — the page indicator follows the scroll.
   *
   * `current-page` is consumed by `preview-content.ts` and had no coverage at all, which
   * is uncomfortable for a message whose implementation is being changed. The ground
   * truth is recomputed here, independently: the first page anchor in document order
   * that is entirely inside the viewport, which is exactly the rule preview.js applies.
   *
   * The reported value is compared *without* resetting it between scrolls, because the
   * message is only sent when the page changes -- an unchanged page correctly produces
   * no message, and the last value still holds.
   */
  async function probePageTracking() {
    const doc = contentDoc();
    if (!doc) return { id: "A10", label: "current page follows the scroll", pass: false, detail: "no content document" };
    const view = doc.defaultView;
    const anchors = Array.from(doc.querySelectorAll('[id^="sq-page-start"]'));
    if (!anchors.length) {
      return { id: "A10", label: "current page follows the scroll", pass: true, skipped: true, detail: "no page anchors in this conversion" };
    }

    const height = () => doc.documentElement.clientHeight || view.innerHeight;
    const width = () => doc.documentElement.clientWidth || view.innerWidth;
    const fullyInside = element => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= height() && rect.right <= width();
    };

    const scroller = doc.scrollingElement || doc.documentElement;
    const distance = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const mismatches = [];
    let checked = 0;

    for (const fraction of [0.2, 0.45, 0.7, 0.95]) {
      view.scrollTo({ top: distance * fraction, left: 0, behavior: "instant" });
      await delay(220);
      const expected = anchors.find(fullyInside);
      if (!expected) continue; // no anchor entirely in view: nothing is expected
      checked++;
      if (state.currentPage !== expected.id) {
        mismatches.push("at " + Math.round(distance * fraction) + "px: got " + state.currentPage + ", expected " + expected.id);
      }
    }

    view.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return {
      id: "A10",
      label: "current page follows the scroll",
      pass: mismatches.length === 0 && checked > 0,
      detail:
        checked === 0
          ? "no scroll position had an anchor fully in view"
          : mismatches.length
            ? mismatches.join("; ")
            : checked + " position(s) correct, " + state.currentPageCount + " message(s)"
    };
  }

  function readFactor() {
    const body = contentBody();
    if (!body) return null;
    const transform = getComputedStyle(body).transform;
    const matrix = /^matrix\(([^,]+),/.exec(transform);
    const value = matrix ? parseFloat(matrix[1]) : parseFloat(getComputedStyle(body).getPropertyValue("--factor"));
    return isNaN(value) ? 1 : round(value);
  }

  // ---------------------------------------------------------------------------
  // Ground-truth overlay (debug aid)
  // ---------------------------------------------------------------------------

  function drawTruth(measurement) {
    const body = contentBody();
    const doc = contentDoc();
    if (!body || !doc || !measurement) return;

    let layer = doc.getElementById("lab-truth-layer");
    if (!layer) {
      layer = doc.createElement("div");
      layer.id = "lab-truth-layer";
      body.appendChild(layer);
    }
    layer.textContent = "";

    // The overlay lives inside the scaled body, so viewport rects have to be
    // converted back to the body's local space. This conversion is a debug
    // convenience only -- the assertions never rely on it.
    const bodyRect = body.getBoundingClientRect();
    const factor = readFactor() || 1;

    const paint = (rects, className) => {
      for (const rect of rects) {
        const div = doc.createElement("div");
        div.className = className;
        div.style.left = (rect.left - bodyRect.left) / factor + "px";
        div.style.top = (rect.top - bodyRect.top) / factor + "px";
        div.style.width = (rect.right - rect.left) / factor + "px";
        div.style.height = (rect.bottom - rect.top) / factor + "px";
        layer.appendChild(div);
      }
    };

    paint(measurement.decoys, "lab-truth-decoy");
    paint(measurement.truth, "lab-truth-rect");
  }

  function clearTruth() {
    const doc = contentDoc();
    const layer = doc && doc.getElementById("lab-truth-layer");
    if (layer) layer.remove();
  }

  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------

  function addRow(row) {
    const failedChecks = row.checks.filter(check => !check.pass && !check.skipped);
    row.failed = failedChecks.length > 0;
    state.rows.push(row);
    const tr = document.createElement("tr");
    tr.className = failedChecks.length ? "fail" : "pass";

    tr.appendChild(cell(row.fixture));
    tr.appendChild(cell(row.width + "px"));
    tr.appendChild(cell(row.zoom + (row.factor ? " (×" + row.factor + ")" : "")));
    tr.appendChild(cell(row.passage));

    const verdict = document.createElement("td");
    verdict.className = "checks";
    for (const check of row.checks) {
      const badge = document.createElement("span");
      badge.className = "badge " + (check.skipped ? "skip" : check.pass ? "ok" : "ko");
      badge.textContent = check.id + (check.skipped ? " –" : check.pass ? " ✓" : " ✗");
      badge.title = check.label + ": " + check.detail;
      verdict.appendChild(badge);
    }
    tr.appendChild(verdict);

    tr.appendChild(cell(row.checks.map(check => check.id + ": " + check.detail).join(" · "), "detail"));
    dom.results.appendChild(tr);
    tr.scrollIntoView({ block: "nearest" });
  }

  function cell(text, className) {
    const td = document.createElement("td");
    td.textContent = text;
    if (className) td.className = className;
    return td;
  }

  function setStatus(text) {
    dom.status.textContent = text;
  }

  // ---------------------------------------------------------------------------
  // Manual controls
  // ---------------------------------------------------------------------------

  function fillFixtureSelect() {
    for (const fixture of FIXTURES) {
      const option = document.createElement("option");
      option.value = fixture.file;
      option.textContent = fixture.name;
      dom.fixtureSelect.appendChild(option);
    }
    for (const width of WIDTHS) {
      const option = document.createElement("option");
      option.value = String(width);
      option.textContent = width + "px";
      if (width === 900) option.selected = true;
      dom.widthSelect.appendChild(option);
    }
  }

  function refreshPassageSelect() {
    dom.passageSelect.innerHTML = "";
    const expect = expectation();
    for (const id of passagesOf(expect)) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = id + " — " + (expect.passages[id].label || "");
      dom.passageSelect.appendChild(option);
    }
  }

  async function manualLoad() {
    await load(dom.fixtureSelect.value, Number(dom.widthSelect.value));
    refreshPassageSelect();
    setStatus("loaded " + dom.fixtureSelect.value);
  }

  function bindControls() {
    dom.runAll.addEventListener("click", () => runMatrix(selectedFixtures(), WIDTHS, ZOOMS));
    dom.runQuick.addEventListener("click", () => runMatrix(selectedFixtures(), QUICK_WIDTHS, QUICK_ZOOMS));
    dom.fixtureSelect.addEventListener("change", manualLoad);
    dom.widthSelect.addEventListener("change", manualLoad);
    dom.showTruth.addEventListener("change", () => {
      if (!dom.showTruth.checked) clearTruth();
    });

    document.querySelectorAll("[data-action]").forEach(button => {
      button.addEventListener("click", async () => {
        const action = button.getAttribute("data-action");
        if (action === "select") {
          const id = dom.passageSelect.value;
          if (!id) return;
          const measurement = await selectPassage(id);
          setStatus(measurement ? measurement.frames.length + " frame(s) for " + id : "no measurement");
          if (dom.showTruth.checked) drawTruth(measurement);
          return;
        }
        send({ action: action });
        if (dom.showTruth.checked) {
          await delay(300);
          drawTruth(measure(dom.passageSelect.value || "snippet_1"));
        }
        setStatus(action + " sent — factor ×" + readFactor());
      });
    });
  }

  function selectedFixtures() {
    const only = params.get("only");
    if (!only) return FIXTURES;
    const names = only.split(",");
    return FIXTURES.filter(fixture => names.includes(fixture.name));
  }

  // ---------------------------------------------------------------------------
  // Real-document escape hatch
  // ---------------------------------------------------------------------------

  /**
   * `?url=<documentCachedContentUrl>&snippet=N` loads a real preview instead of
   * a fixture. A2 is skipped (no declared block count), A1/A3/A4/A5 still apply,
   * which is enough to validate the geometry on a customer document.
   */
  async function runRealDocument(url, snippet) {
    const id = snippet && snippet.indexOf("snippet_") === 0 ? snippet : "snippet_" + (snippet || 0);
    setStatus("loading real document…");
    await load(url, Number(dom.widthSelect.value) || 900);
    for (const zoom of ZOOMS) {
      await applyZoom(zoom.steps);
      const measurement = await selectPassage(id);
      const checks = measurement ? assess(measurement, null) : [];
      addRow({ fixture: "real document", width: dom.iframe.clientWidth, zoom: zoom.name, factor: readFactor(), passage: id, checks: checks });
      if (dom.showTruth.checked) drawTruth(measurement);
    }
    setStatus("done (real document)");
    publish(state.rows.length, state.rows.filter(row => row.failed).length);
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  fillFixtureSelect();
  bindControls();

  const realUrl = params.get("url");
  if (params.get("profile")) {
    void runProfile();
  } else if (realUrl) {
    runRealDocument(realUrl, params.get("snippet"));
  } else {
    manualLoad().then(() => {
      if (params.get("autorun")) {
        const quick = params.get("mode") === "quick";
        runMatrix(selectedFixtures(), quick ? QUICK_WIDTHS : WIDTHS, quick ? QUICK_ZOOMS : ZOOMS);
      }
    });
  }
})();
