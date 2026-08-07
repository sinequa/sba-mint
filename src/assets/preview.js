document.addEventListener("DOMContentLoaded", function () {
  var TRUSTED_ORIGINS = ["http://localhost:4200", "https://localhost:4200", window.origin];
  var parentOrigin = "*";
  var styleElement;
  var fitFactor = null;

  // ---- zoom state ----
  // `currentFactor` is bookkeeping for the deferred commit, not a source of truth: the
  // authority on the applied scale is the resolved transform itself (appliedZoomFactor).
  // `layoutFactor` is the factor the layout is currently computed for; it lags behind on
  // purpose (see zoom()). Both start null, meaning "whatever the server wrote inline",
  // which is what preview.css applies until the first zoom.
  var currentFactor = null;
  var layoutFactor = null;
  var zoomSettleHandle = null;
  // Long enough that a burst of clicks reflows once, short enough not to feel lagged.
  var ZOOM_SETTLE_MS = 180;
  // What the layout commit is allowed to cost before it stops being worth its result.
  // Measured rather than guessed from an element count, because the cost depends far more
  // on the layout regime than on the size: 55 ms on a 34 000-element PDF against 2 343 ms
  // on a 447 919-element document of 4 607 tables.
  var LAYOUT_COMMIT_BUDGET_MS = 150;
  var layoutCommitTooSlow = false;

  // ---- passage highlighter state ----
  // Overlay holding one frame per contiguous block of the selected passage, plus
  // the id currently displayed so it can be recomputed on any layout change.
  var passageLayer;
  var currentPassageId = null;
  var repositionHandle = null;
  var listenersBound = false;
  // Deadline until which a reflow is still allowed to re-centre the passage.
  var passageSettleUntil = 0;
  // Whether the last render measured *every* fragment of the passage. While it did not,
  // scrolling may reveal more of them and the frame is worth recomputing.
  var passageComplete = false;
  // Geometry currently drawn in the overlay, so an unchanged reposition writes nothing.
  var renderedSignature = null;
  // Containers whose off-screen skipping we suspended to be able to measure a passage inside
  // them -- see liftSkipAroundPassage().
  var liftedSkips = [];

  // ---- scroll / page tracking state ----
  var scrollHandle = null;
  var pageObserver = null;
  var visiblePageAnchors = new Set();
  var pageAnchorsSeeded = false;
  var reportedPageId = null;

  // ---- hover state ----
  var hoverHandle = null;
  var hoveredEntity = null;
  var reportedHoverId;

  // Upper bound on how long `ready` waits for webfonts. A cap, not a delay: it only
  // applies if document.fonts never settles. Declared here rather than further down
  // because the boot sequence below runs before a later `var` is assigned.
  var READY_FONT_TIMEOUT_MS = 500;

  window.addEventListener("message", receiveMessage);

  zoomFit();

  // `ready` releases the host's spinner and triggers its scroll to the citation, so it
  // must not fire before the layout is usable. Two frames get us past first paint;
  // document.fonts.ready then covers late webfonts, which are what actually move text
  // around afterwards. This replaces a flat setTimeout(500), which delayed *every*
  // preview by half a second whatever its size and however fast it was really ready.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      whenFontsReady(() => {
        setSvgBackgroundPositionAndSize();
        returnMessage("ready");

        // retrieve the current page from the hash or use the default page
        const total = window.lastPage;
        if (window.location.hash) {
          const hash = window.location.hash.substring(1);
          const current = parseInt(hash, 10);
          returnMessage("page-info", { total, current });
        } else {
          const current = window.defPage;
          returnMessage("page-info", { total, current });
        }
      });
    });
  });

  /**
   * Runs `done` once the document's fonts have settled, or after
   * READY_FONT_TIMEOUT_MS, whichever comes first -- and synchronously when there is
   * nothing pending, which is the common case.
   */
  function whenFontsReady(done) {
    var fonts = document.fonts;
    if (!fonts || !fonts.ready || fonts.status === "loaded") {
      done();
      return;
    }
    var settled = false;
    var finish = function () {
      if (settled) return;
      settled = true;
      done();
    };
    fonts.ready.then(finish, finish);
    setTimeout(finish, READY_FONT_TIMEOUT_MS);
  }

  // will contain the worker instance if it is supported
  var worker;
  var isWorkerSupported = false;

  // ----------------------
  // Preview body helpers
  // ----------------------

  /**
   * The body that actually holds the previewed content. Some conversions wrap it
   * in a frameset, in which case everything -- zoom factor, highlight styles and
   * the passage overlay -- belongs to the nested frame's document, not to this
   * one. Returns null while that frame is still loading.
   */
  function getPreviewBody() {
    var body = document.body;
    if (body === null || body.tagName == "FRAMESET") {
      var frame = document.querySelector("frameset>frame");
      var frameBody = frame && frame.contentDocument ? frame.contentDocument.body : null;
      return frameBody || null;
    }
    return body;
  }

  /**
   * Reads the --factor custom property the server writes inline on the body, which
   * preview.css turns into the initial scale() transform. Only a fallback for
   * appliedZoomFactor(), for the case where no transform resolves.
   */
  function getZoomFactor(body) {
    if (!body) return 1;
    var view = body.ownerDocument.defaultView || window;
    var value = parseFloat(view.getComputedStyle(body).getPropertyValue("--factor"));
    return isNaN(value) || value <= 0 ? 1 : value;
  }

  /**
   * The scale actually applied to the body, read from its resolved transform.
   *
   * Deliberately not a cached JS value. getBoundingClientRect() reports positions through
   * whatever transform is really in effect, so any conversion between viewport and local
   * coordinates has to use that same number -- and a cached one is an invariant somebody
   * has to keep true. It only takes a stylesheet on the content side, or a path that
   * writes the transform without going through zoom(), for the two to diverge; the frames
   * would then be drawn at the wrong scale until the next zoom click happened to
   * resynchronise them, which is a genuinely puzzling symptom to debug.
   *
   * Reading it costs one getComputedStyle per render -- renders happen once per gesture,
   * not once per frame, so it does not sit on a hot path.
   */
  function appliedZoomFactor(body) {
    if (!body) return 1;
    var view = body.ownerDocument.defaultView || window;
    var transform = view.getComputedStyle(body).transform;
    var matrix = /^matrix\(\s*([^,]+)/.exec(transform);
    if (matrix) {
      var scale = parseFloat(matrix[1]);
      if (!isNaN(scale) && scale > 0) return scale;
    }
    // No transform resolved (`none`, or a 3D matrix): fall back to the custom property
    // the server writes and preview.css turns into the initial scale.
    return getZoomFactor(body);
  }

  /**
   * The factor a zoom step starts from. Reads the applied scale, so a step can never
   * compound on a stale value either.
   */
  function currentZoomFactor(body) {
    currentFactor = appliedZoomFactor(body);
    return currentFactor;
  }

  // ----------------------
  // Zoom helpers
  // ----------------------
  function zoomFit() {
    const body = getPreviewBody();
    if (!body) return;
    if (fitFactor === null) fitFactor = computeFitFactor(body);
    zoom(fitFactor, true);
  }

  /**
   * The factor at which the widest content fits the panel.
   *
   * Derived from the document's own overflow rather than by enumerating elements. The
   * previous implementation measured every `div, img, table` in the document, which was
   * O(DOM) on the load path -- ~113 000 getBoundingClientRect() calls on a thousand-page
   * PDF, plus a `Math.max(...spread)` that throws past roughly 125 000 arguments -- and
   * it mixed coordinate spaces: the widest width was measured *after* the transform but
   * used as an absolute factor, so the result was only right when the current factor
   * happened to be 1. Since the server writes a factor inline and this runs at
   * DOMContentLoaded, "fit" routinely left the content overflowing: on a double-page PDF
   * it produced 0.79 where 0.34 was needed, hence a horizontal scrollbar at fit.
   *
   * scrollWidth is the whole trick, and its one trap is that it means two different
   * things: for an element it is a local, pre-transform metric, but on the *body in
   * quirks mode* it is special-cased to the document's scroll width, which lives in
   * viewport space and therefore includes the transform. The converters emit no doctype,
   * so quirks is the common case here, not the exotic one.
   */
  /**
   * Runs `measure` with the body's children momentarily excluded from off-screen skipping.
   *
   * This exists because size containment and this measurement are in direct conflict. A
   * skipped page is *size-contained*: its box collapses to the width its parent offers
   * instead of the width its content needs, so `body.scrollWidth` reports no overflow at
   * all. Measured on a 19-page PDF at a 606 px panel: pages 2 566 px wide read as 552, the
   * fit factor came out at 1 instead of 0.23, and the document opened four times too large
   * with no horizontal scrollbar to escape with. Nothing in the assertion matrix noticed --
   * every check there is scale-invariant by design.
   *
   * The cost is one full layout, once per fit, and it is not avoidable: the width of a page
   * is not knowable without laying it out, and no cheaper proxy survives contact with a
   * converter that positions text absolutely. What it buys back is that the pages now carry
   * a *remembered* size, so every later read -- a resize, another zoom-fit -- is already
   * correct and cheap.
   */
  function withSkippingSuspended(body, view, measure) {
    // Only the conversions built out of page sheets. There, the sheets have a fixed
    // intrinsic width the panel cannot change, so the fit *must* shrink them and the only
    // way to learn that width is to lay one out. A flowing document is the opposite case:
    // its text already reflows to the panel, so suspending buys a correct answer that was
    // going to be 1 anyway -- and it costs the full layout of the document, measured at
    // 892 -> 3 729 ms to open the 15 MB capture. Whether a flowing document with an
    // unbreakable 2 000 px table needs this after all is a question A12 of the bench is
    // positioned to answer, on every fixture wide enough for it to mean something.
    const paginated = body.classList.contains("bd") || body.querySelector(".stl_");
    if (!paginated) return measure();

    const suspended = [];
    const children = body.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child.style || view.getComputedStyle(child).contentVisibility !== "auto") continue;
      child.style.contentVisibility = "visible";
      suspended.push(child);
    }
    try {
      return measure();
    } finally {
      for (let i = 0; i < suspended.length; i++) suspended[i].style.contentVisibility = "";
    }
  }

  function computeFitFactor(body) {
    // Declared here, not at module level: zoomFit() runs synchronously at
    // DOMContentLoaded, before a `var` further down the file has been assigned.
    const margin = 24; // local px of breathing room kept on each side
    const contentDocument = body.ownerDocument;
    const view = contentDocument.defaultView || window;
    const scroller = contentDocument.scrollingElement || contentDocument.documentElement;
    const panel = (scroller && scroller.clientWidth) || view.innerWidth;
    if (!panel) return 1;

    const quirks = contentDocument.compatMode !== "CSS1Compat";
    const overflow = withSkippingSuspended(body, view, function () {
      return body.scrollWidth;
    });
    // What the overflow is measured against, in the same space as the overflow itself.
    const visible = quirks ? panel : body.clientWidth;
    // Nothing sticks out: there is nothing to shrink, and scrollWidth would only be
    // reporting the viewport back at us.
    if (!overflow || overflow <= visible + 1) return 1;

    const content = quirks ? overflow / currentZoomFactor(body) : overflow;
    const factor = panel / (content + 2 * margin);
    // prevent too low or too high values
    return Math.min(1, Math.max(0.2, factor));
  }

  function createWorker(appname) {
    if (!appname) console.error("appname is required");

    isWorkerSupported = false;

    if (window.Worker) {
      // Use an absolute URL for the worker.js file
      const path = window.origin.includes("localhost:4200") ? `${window.origin}/assets/worker.js` : `${window.origin}/app/${appname}/assets/worker.js`;

      try {
        worker = new Worker(path);

        worker.onmessage = function (event) {
          window.parent.postMessage(
            {
              type: "get-html-results-webworker",
              data: event.data,
              url: window.location.href
            },
            parentOrigin
          );
        };

        worker.onerror = function (error) {
          console.error("Error from worker:", error);
          // `new Worker()` does not throw when the script cannot be fetched -- a 404, a
          // wrong appname, a CSP rule -- it fails here, asynchronously. Leaving the flag
          // set meant every later request was posted to a dead worker and the answer
          // simply never came back, silently, even though the direct path below works.
          isWorkerSupported = false;
        };

        console.log("Web Worker is supported");
        isWorkerSupported = true;
      } catch (error) {
        console.error("Error creating worker:", error);
        isWorkerSupported = false;
      }
    }
  }

  function receiveMessage(event) {
    if (!TRUSTED_ORIGINS.includes(event.origin)) {
      return;
    }
    var data = event.data;
    switch (data.action) {
      case "init":
        init(event.origin, data.highlights);
        createWorker(data.appname);
        break;
      case "get-html": {
        const html = getHtml(data.ids);
        returnMessage("get-html-results", html);
        break;
      }
      case "get-html-webworker": {
        const html = getHtml(data.ids);
        // if worker cannot be created, use the "get-html" method instead
        if (!isWorkerSupported) {
          returnMessage("get-html-results", html);
        } else {
          worker.postMessage({ id: data.id, extracts: html, previewData: data.previewData });
        }
        break;
      }
      case "get-text":
        getText(data.ids);
        break;
      case "get-positions":
        getPositions(data.highlight);
        break;
      case "highlight":
        highlight(data.highlights);
        break;
      case "select":
        select(data.id, data.usePassageHighlighter);
        break;
      case "unselect":
        unselect();
        break;

      // ---- zoom ----
      case "zoom-in": {
        let factor = currentZoomFactor(getPreviewBody());
        zoom(Math.min(3, factor + 0.2));
        break;
      }

      case "zoom-out": {
        let factor = currentZoomFactor(getPreviewBody());
        zoom(Math.max(0.2, factor - 0.2));
        break;
      }

      case "zoom-fit":
        zoomFit();
        break;

      case "toggle-description":
        setDescriptionDisplay(!!data.show);
        break;

      // ---- pagination ----
      case "goto-page":
        {
          if (!data || !data.page) return;
          pg = data.page;
          SetPage(pg);
          Go();
        }
        break;

      case "next-page":
        GoN();
        break;

      case "prev-page":
        GoP();
        break;

      case "first-page":
        GoF();
        break;

      case "last-page":
        GoL();
        break;

      default:
        break;
    }
  }

  /**
   * Applies a zoom factor.
   *
   * A zoom step writes the transform, and nothing else. That is a compositor
   * operation: measured at ~1 ms on a 63 000-element document, against ~65 ms when the
   * same value went through the `--factor` custom property -- because a custom
   * property inherits, so changing it invalidates style for the whole subtree.
   *
   * The layout width is a separate matter. `width: calc(99% / factor)` is what makes
   * the body fill the panel once scaled, and what lets page sheets flow side by side
   * when zoomed out, but it reflows the document -- O(DOM), and up to 90 ms on a large
   * one. It is therefore committed only once the zoom settles, so a burst of clicks
   * reflows once instead of once per click.
   *
   * Nothing repositions the passage frames in between, and nothing needs to: their
   * coordinates are local to the body, the layout has not moved, and the transform
   * scales them along with the text.
   *
   * @param {number} value new visual scale
   * @param {boolean} [commitNow] apply the layout immediately, for a deliberate
   *   one-off action (a zoom-fit, or a citation about to be located)
   */
  function zoom(value, commitNow) {
    const body = getPreviewBody();
    if (!body) return;
    const previous = currentZoomFactor(body);
    // Read the scroll *before* invalidating anything, so these reads are free. No element
    // is needed on this path: a pure scale is exact arithmetic, and elementFromPoint is a
    // hit test that would force layout on every step.
    const anchor = readViewportAnchor(body, false);

    currentFactor = value;
    body.style.transform = "scale(" + value + ")";
    restoreViewportAnchor(body, anchor, value / previous);

    if (commitNow) {
      commitZoomLayout();
      return;
    }
    if (zoomSettleHandle !== null) clearTimeout(zoomSettleHandle);
    zoomSettleHandle = setTimeout(commitZoomLayout, ZOOM_SETTLE_MS);
  }

  /**
   * Where the reader is looking, and what is under that point.
   *
   * Without this, zooming throws them across the document. The scroll position stays
   * constant in absolute pixels while every content position is multiplied by the change
   * in scale, so whatever was in the middle of the viewport moves by
   * `(scroll + half a viewport) x (ratio - 1)` -- proportional to how far down the reader
   * already is, not to the size of the viewport. Measured on the captured PDF: two
   * zoom-in steps from the middle of the document moved the element under the cursor
   * 6 653 px away, completely off screen.
   */
  function readViewportAnchor(body, needElement) {
    const contentDocument = body.ownerDocument;
    const view = contentDocument.defaultView || window;
    const scroller = contentDocument.scrollingElement || contentDocument.documentElement;
    if (!scroller) return null;
    const width = scroller.clientWidth || view.innerWidth;
    const height = scroller.clientHeight || view.innerHeight;
    const centreX = width / 2;
    const centreY = height / 2;
    // Only the reflow case needs the element (see commitZoomLayout): after a re-wrap,
    // arithmetic on the scroll offset no longer maps back to the same content.
    // `pointer-events: none` keeps the passage overlay out of the hit test.
    const element = needElement && contentDocument.elementFromPoint ? contentDocument.elementFromPoint(centreX, centreY) : null;
    return {
      scroller: scroller,
      view: view,
      left: scroller.scrollLeft,
      top: scroller.scrollTop,
      centreX: centreX,
      centreY: centreY,
      element: element && element !== body ? element : null
    };
  }

  /** Puts the anchored point back under the middle of the viewport, by arithmetic. */
  function restoreViewportAnchor(body, anchor, ratio) {
    if (!anchor || !isFinite(ratio) || ratio <= 0 || ratio === 1) return;
    // At the very top there is no reading position to preserve, and anchoring the centre
    // would push the document down instead. This also keeps a freshly opened preview at
    // the top, since zoomFit() goes through here too.
    if (!anchor.left && !anchor.top) return;
    anchor.view.scrollTo({
      left: (anchor.left + anchor.centreX) * ratio - anchor.centreX,
      top: (anchor.top + anchor.centreY) * ratio - anchor.centreY,
      behavior: "instant"
    });
  }

  /**
   * Reflows the document for the current factor: the one expensive part of a zoom, paid
   * once per gesture rather than once per click. Written as inline lengths rather than
   * through a custom property, so the cost is the reflow itself and not also a style
   * invalidation of every element in the document.
   *
   * On some documents that reflow is not worth its result. Dividing the width by the
   * factor is what makes the body fill the panel and what lets page sheets flow side by
   * side when zoomed out -- worth 55 ms on a 34 000-element PDF, not worth **2 343 ms** on
   * a 447 919-element document of 4 607 tables, where it froze the window on every zoom
   * gesture. So the commit times itself, and once it has proved prohibitive it stops
   * happening: the zoom stays a pure scale for the rest of that document's life, and the
   * only cost is that zooming out no longer widens the layout to fill the panel.
   *
   * The decision is the measured cost, and it has to be: nothing available beforehand
   * predicts it.
   *
   * - Not the element count. What dominates is the layout regime, and a count cannot tell a
   *   grid of tables from a stack of fixed-size sheets: a 20 000-element *flowing* document
   *   commits in 159 ms while a 63 000-element paginated one commits in 47 ms.
   * - Not the panel width, though the cost depends on it strongly -- the same document
   *   commits in 3 701 ms at 900 px and in a few hundred at 2 130 px, because narrower means
   *   more wrapping.
   * - Not the cost of computeFitFactor either, which was the tempting one: it reads
   *   `body.scrollWidth`, so it looked like a forced full layout and therefore a proxy.
   *   Measured, it is 1 ms on the document whose commit is 3 701 ms. Its cost reflects
   *   whether a layout happened to be pending at that instant, not any property of the
   *   document.
   *
   * So the document pays it exactly once, on the first commit, and never again.
   */
  function commitZoomLayout() {
    if (zoomSettleHandle !== null) {
      clearTimeout(zoomSettleHandle);
      zoomSettleHandle = null;
    }
    const body = getPreviewBody();
    if (!body || currentFactor === null || layoutFactor === currentFactor) return;
    if (layoutCommitTooSlow) return;

    const started = performance.now();

    // The reflow re-wraps text and rearranges page sheets, so where a given piece of
    // content ends up cannot be predicted arithmetically -- unlike a pure scale. The
    // element under the middle of the viewport is therefore remembered and put back
    // where it was afterwards, which is the only way the commit does not jump.
    const anchor = readViewportAnchor(body, true);
    const before = anchor && anchor.element ? anchor.element.getBoundingClientRect() : null;

    layoutFactor = currentFactor;
    body.style.width = "calc(99% / " + currentFactor + ")";
    body.style.height = "calc(98% / " + currentFactor + ")";

    if (before) {
      // Reading here is what forces the reflow, which this commit is paying for anyway.
      const after = anchor.element.getBoundingClientRect();
      const shiftX = after.left - before.left;
      const shiftY = after.top - before.top;
      if (shiftX || shiftY) {
        anchor.view.scrollTo({
          left: anchor.scroller.scrollLeft + shiftX,
          top: anchor.scroller.scrollTop + shiftY,
          behavior: "instant"
        });
      }
    } else {
      // No element to anchor on, so nothing above forced the reflow -- and the cost has to
      // be observed to be judged. The browser owes this layout before the next paint
      // anyway; reading it here only decides when it is paid.
      void body.offsetWidth;
    }

    if (performance.now() - started > LAYOUT_COMMIT_BUDGET_MS) layoutCommitTooSlow = true;

    // A displayed frame has to be measured again -- here, once, rather than per step.
    scheduleRepositionPassage();
  }

  /**
   * Shows or hides the AI-generated page descriptions (multimodal conversions).
   * The custom property lives on :root of the document that holds the content,
   * which is the nested frame's document for a frameset.
   */
  function setDescriptionDisplay(show) {
    const value = show ? "inline-block" : "none";
    document.documentElement.style.setProperty("--desc-display", value);
    const body = getPreviewBody();
    if (body && body.ownerDocument !== document) {
      body.ownerDocument.documentElement.style.setProperty("--desc-display", value);
    }
    // Showing or hiding a description shifts everything below it.
    scheduleRepositionPassage();
  }

  function returnMessage(type, data) {
    var message = { type: type, data: data, url: window.location.href };
    parent.postMessage(message, parentOrigin);
    // Nested iframes (frameset): the app sits one level further up, so it has to be
    // reached explicitly. When the app *is* `parent` -- the ordinary case -- the two are
    // the same window, and posting twice merely made every listener on the host run
    // twice for every message. Cheap to avoid, and it removes a real trap: a duplicate
    // `ready` from a previous document can resolve the wait for the next one.
    if (parent && parent.parent && parent.parent !== parent) {
      parent.parent.postMessage(message, parentOrigin);
    }
  }

  function init(origin, highlights) {
    parentOrigin = origin;

    // `returnMessage` posts to both `parent` and `parent.parent`, so the host
    // receives 'ready' twice and replies with 'init' twice. Only the listeners
    // must be guarded: re-applying the highlights on a second call is harmless.
    if (!listenersBound) {
      listenersBound = true;
      bindListeners();
    }

    if (highlights) {
      highlight(highlights);
    }
  }

  function bindListeners() {
    getPassageLayer();
    document.addEventListener("mouseup", function () {
      return setTimeout(function () {
        return onMouseUp();
      });
    });
    document.addEventListener("mousemove", function (e) {
      return onMouseMove(e);
    });
    document.addEventListener("click", function (e) {
      // Expands the screenshot of a converted video preview when it is clicked.
      var parentElement = e.target?.parentElement;
      if (!parentElement || !parentElement.classList?.contains("sq-mediav2-screenshot")) return;
      // Swallow only the click that is actually handled here. This used to run for
      // *every* click anywhere in the preview, which cancelled any other click listener
      // on the content document and any propagation to its window.
      e.stopImmediatePropagation();
      parentElement.classList.toggle("screenshot-extended");
    });
    var contentBody = getPreviewBody();
    var contentDocument = contentBody ? contentBody.ownerDocument : document;
    var contentView = contentDocument.defaultView || window;
    var pages = Array.prototype.slice.call(contentDocument.querySelectorAll('[id^="sq-page-start"]'));
    observePageAnchors(contentView, pages);

    function onScroll() {
      // Scroll events can fire several times per frame; nothing here needs to run more
      // often than the browser paints.
      if (scrollHandle !== null) return;
      scrollHandle = contentView.requestAnimationFrame(function () {
        scrollHandle = null;
        // Only when an IntersectionObserver could not be used: it reports page changes
        // on its own, without measuring every anchor on every frame.
        if (!pageObserver) reportCurrentPage(pages);
        // Fragments revealed by `content-visibility` while scrolling can complete the
        // frame of a passage that was only partly laid out. Once every fragment has been
        // measured there is nothing left to complete, so this stops costing anything.
        if (!passageComplete) scheduleRepositionPassage();
        returnMessage("scroll", { x: contentView.scrollX, y: contentView.scrollY });
      });
    }

    contentView.addEventListener("scroll", onScroll);
    if (contentView !== window) window.addEventListener("scroll", onScroll);

    // The preview panel is resizable, and a resize reflows the content.
    window.addEventListener("resize", onPanelResize);
    if (contentBody && typeof ResizeObserver !== "undefined") {
      // Catches a change of the body box itself, i.e. a zoom or a panel resize.
      // NOT a growing content: preview.css gives the body an explicit width and
      // height, so its box does not follow the content -- hence the reflow
      // listeners below.
      new ResizeObserver(scheduleRepositionPassage).observe(contentBody);
      observeSkippedContainers(contentBody);
    }

    // Late resources reflow the document under a frame that has already been drawn.
    // Neither `load` nor `error` bubbles, hence the capture phase; between them they
    // cover images, iframes and stylesheets, which is where the reflow comes from in
    // practice. `error` matters too: an image that fails collapses to its broken-icon
    // size, which moves the content just as much as one that succeeds.
    ["load", "error"].forEach(function (type) {
      contentDocument.addEventListener(type, onContentReflow, true);
      if (contentDocument !== document) document.addEventListener(type, onContentReflow, true);
    });
    if (contentDocument.fonts) {
      contentDocument.fonts.ready.then(onContentReflow, function () {});
    }

    // The settling window belongs to the app only until the reader takes over.
    // These three are unambiguously user-initiated, unlike a scroll event.
    ["wheel", "touchstart", "keydown"].forEach(function (type) {
      contentDocument.addEventListener(type, endPassageSettling, { passive: true, capture: true });
      if (contentDocument !== document) document.addEventListener(type, endPassageSettling, { passive: true, capture: true });
    });
  }

  /**
   * A reflow moved the content, so both the frames and the scroll position may be
   * stale. The frames are always recomputed; the scroll only during the settling
   * window that follows a select.
   *
   * This is what makes a citation survive a document that is still loading. The
   * PptxToHtml conversion emits `<img loading="lazy">` with no width or height
   * attribute, so the intrinsic size of every slide image *is* the layout: each one
   * that arrives after the scroll pushes the text further down -- hundreds of
   * pixels over a deck. The frames used to follow while the scroll position did
   * not, so the passage drifted out of view, and selecting it a second time looked
   * like it fixed itself because the images were cached by then.
   */
  function onContentReflow() {
    if (Date.now() < passageSettleUntil) reanchorPassage();
    scheduleRepositionPassage();
  }

  function reanchorPassage() {
    if (!currentPassageId) return;
    var anchor = Array.from(getElementsById(currentPassageId)).find(isMeasurable);
    if (anchor) scrollAnchorIntoView(anchor);
  }

  /** Never scroll under a reader who has started navigating on their own. */
  function endPassageSettling() {
    passageSettleUntil = 0;
  }

  // ----------------------
  // Page tracking
  // ----------------------

  /**
   * Watches the page anchors so that `current-page` no longer costs a pass over all of
   * them on every scroll event -- on a long document that was one getBoundingClientRect()
   * per anchor per frame, and the loop could not even stop early because it used forEach.
   *
   * The observer is used as a *filter*, not as the decision: `isElementInViewport()`
   * still picks the reported page. The two agree for the zero-area markers the converters
   * emit (verified on the bench), but `isIntersecting` means *partly* visible while the
   * rule here is *entirely* visible, so a sized anchor would differ. Narrowing the
   * candidates and keeping the original predicate is exact either way.
   */
  function observePageAnchors(contentView, pages) {
    if (!pages.length || typeof contentView.IntersectionObserver !== "function") return;

    pageObserver = new contentView.IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visiblePageAnchors.add(entry.target);
          else visiblePageAnchors.delete(entry.target);
        });
        // The first callback is the observer telling us what is already on screen, not a
        // page change. Emitting there would be actively harmful: the host treats a known
        // `current-page` as "the reader navigated away" and scrolls to that page
        // *instead of* selecting the cited passage.
        if (!pageAnchorsSeeded) {
          pageAnchorsSeeded = true;
          reportCurrentPage(pages, true);
          return;
        }
        reportCurrentPage(pages);
      },
      { threshold: 0 }
    );
    pages.forEach(function (page) {
      pageObserver.observe(page);
    });
  }

  /**
   * Emits `current-page` for the first anchor entirely in view, and only when it changes
   * -- the previous code re-sent the same id on every scroll event.
   */
  function reportCurrentPage(pages, silent) {
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      if (pageObserver && !visiblePageAnchors.has(page)) continue;
      if (!isElementInViewport(page)) continue;
      if (page.id !== reportedPageId) {
        reportedPageId = page.id;
        if (!silent) returnMessage("current-page", page.id);
      }
      return;
    }
  }

  /**
   * A narrower or wider panel means a different fit, so the cached factor is dropped --
   * the next explicit zoom-fit recomputes it. The current zoom is deliberately left
   * alone: re-fitting here would undo a zoom the reader chose.
   */
  function onPanelResize() {
    fitFactor = null;
    scheduleRepositionPassage();
  }

  /**
   * Highlights the specified elements with custom styles.
   * @param {Array<Object>} highlights - An array of highlight objects.
   * @param {string} highlights[].name - The name of the highlight.
   * @param {string} highlights[].color - The color of the highlight.
   * @param {string} highlights[].bgColor - The background color of the highlight.
   */
  function highlight(highlights) {
    // remove the style element
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }

    const body = getPreviewBody();
    const contentDocument = body ? body.ownerDocument : document;
    styleElement = contentDocument.createElement("style");
    contentDocument.head.appendChild(styleElement);

    // `visibility: visible` is not redundant. The PdfToHtml family emits, over the scanned image
    // of the page, an OCR text layer whose every word carries an inline `visibility: hidden`: the
    // image is what the reader sees, the text is only there to be searched and selected. The
    // highlight spans are nested *inside* those words, so they inherit the invisibility -- neither
    // their background nor the `sq-current` frame is ever painted, which is why a highlight could
    // be scrolled to and still show nothing. A declaration on the highlight itself wins over what
    // it inherits, and it is scoped to the categories currently switched on: switching one off
    // drops its rule, and the word goes back to hidden with it, so nothing of the text layer is
    // revealed that the reader did not ask for.
    styleElement.textContent = highlights
      .map(function (highlight) {
        return `
          span.${highlight.name} {
              visibility: visible;
              color: ${highlight.color || "black"};
              background-color: ${highlight.bgColor || "yellow"};
          }
          tspan.${highlight.name} {
              fill: ${highlight.color || "black"};
          }
          rect.${highlight.name} {
              fill: ${highlight.bgColor || "yellow"};
          }
      `;
      })
      .join("");
  }

  function select(id, usePassageHighlighter) {
    if (usePassageHighlighter === void 0) {
      usePassageHighlighter = false;
    }
    unselect();
    // Locate the citation on the final layout, not on a zoom still settling: the
    // frames would otherwise be drawn twice and the scroll aimed at a stale position.
    commitZoomLayout();
    var elements = Array.from(getElementsById(id));
    if (!elements.length) return;

    // Before anything is measured or scrolled to: a fragment inside a skipped subtree has no
    // layout, so both the scroll target and the frames would be computed from nothing.
    liftSkipAroundPassage(elements);

    // A citation can point at a subtree that is hidden by default -- the
    // AI-generated description of a multimodal conversion. Reveal it first:
    // otherwise there is nothing to scroll to and nothing to measure.
    if (usePassageHighlighter && !elements.some(isMeasurable)) {
      revealHiddenDescription(elements);
    }

    var anchor = elements.find(isMeasurable) || elements[0];
    scrollAnchorIntoView(anchor);

    if (usePassageHighlighter || isMeasurable(anchor)) {
      // Anything with a box of its own gets the frame, whoever asked for the selection. The
      // dashed outline this replaces was set on the element itself, so on the OCR text layer of a
      // PdfToHtml conversion it inherited the per-word `visibility: hidden` and was never seen:
      // entity navigation scrolled to the right place and showed nothing there. The overlay is a
      // sibling of the body, outside that hidden subtree, so it shows whatever the document does
      // to its text -- and it is the frame extract navigation has always drawn, so entities now
      // land on the same marker rather than a second one.
      //
      // `currentPassageId` and the settle deadline are what keep the frame on the text through a
      // later scroll or zoom; without them an entity frame would be drawn once and then drift.
      currentPassageId = id;
      passageSettleUntil = Date.now() + PASSAGE_SETTLE_MS;
      attemptRenderPassage(id, RENDER_ATTEMPTS);
    } else {
      // No box to frame: a page anchor (`sq-page-start-N`) is an empty div, a pure scroll target.
      // Framing it would draw nothing and still cost five render attempts and three seconds of
      // repositioning on scroll, so it keeps the historical dashed outline instead.
      setTimeout(function () {
        selectHighlight(elements);
      }, 400);
    }

    // Emitted after the scroll, so the positions are measured on elements that
    // are actually laid out.
    requestAnimationFrame(function () {
      var visibleElements = elements.filter(isMeasurable);
      if (visibleElements.length > 0) {
        returnMessage("selected-position", getVerticalPositions(visibleElements)[0]);
      }
    });
  }

  function isMeasurable(element) {
    var box = element.getBoundingClientRect();
    return box.width > 0.5 && box.height > 0.5;
  }

  /**
   * Brings the anchor into view without ever scrolling anything outside the
   * preview document.
   *
   * `scrollIntoView` cannot do this. With `container: "all"` it walks past the
   * iframe and scrolls the host application back to the top (ES-31592); with
   * `container: "nearest"` it stops at the nearest scroll container -- and
   * `overflow: hidden` is enough to make one. The PdfToHtml family emits
   * `.t { position: absolute; overflow: hidden }` on every single word, so the
   * nearest scroll container of a citation is the word itself: it cannot scroll,
   * it absorbs the request, and the document never moves.
   *
   * Scrolling the ancestors ourselves, innermost first, keeps the useful cases
   * (a plain-text pane with `overflow-y: auto`) while skipping the ones that only
   * clip. The preview viewport comes last, once the ancestors have settled and
   * the anchor rect is final.
   */
  function scrollAnchorIntoView(anchor) {
    // No layout box means no position to scroll to, and computing a delta from an
    // all-zero rect would jump to the top of a document the user was reading.
    // Staying put is also what scrollIntoView did on a hidden element.
    if (!hasLayoutBox(anchor)) return;

    var contentDocument = anchor.ownerDocument;
    var view = contentDocument.defaultView || window;

    for (var node = anchor.parentElement; node; node = node.parentElement) {
      if (isScrollable(node, view)) scrollElementToAnchor(node, anchor);
    }

    // Quirks mode -- which is what the converters emit, no doctype -- makes
    // `body` the scrolling element and `documentElement` an ordinary box, hence
    // scrollingElement rather than documentElement.
    var scroller = contentDocument.scrollingElement || contentDocument.documentElement;
    var height = (scroller && scroller.clientHeight) || view.innerHeight;
    var width = (scroller && scroller.clientWidth) || view.innerWidth;
    var box = anchor.getBoundingClientRect();
    view.scrollBy({
      top: centerDelta(box.top, box.height, height),
      left: nearestDelta(box.left, box.right, width),
      behavior: "instant"
    });
  }

  /**
   * Whether the element occupies a place in the layout, which is a weaker
   * condition than isMeasurable(): the `sq-page-start-N` page anchors used by
   * secondary conversions are 0x0 markers, yet scrolling to them is the only
   * localisation those previews have. An element inside a `display: none` subtree,
   * on the other hand, reports an all-zero rect and no client rect at all.
   */
  function hasLayoutBox(element) {
    if (element.getClientRects().length > 0) return true;
    var box = element.getBoundingClientRect();
    return box.width > 0 || box.height > 0 || box.top !== 0 || box.left !== 0;
  }

  function isScrollable(element, view) {
    var style = view.getComputedStyle(element);
    var scrollableY = /^(auto|scroll|overlay)$/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
    var scrollableX = /^(auto|scroll|overlay)$/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
    return scrollableY || scrollableX;
  }

  function scrollElementToAnchor(element, anchor) {
    // getBoundingClientRect() gives the border box, clientHeight/Width the padding
    // box, hence clientTop/clientLeft (the border widths) to line the two up.
    var host = element.getBoundingClientRect();
    var box = anchor.getBoundingClientRect();
    element.scrollTop += centerDelta(box.top - host.top - element.clientTop, box.height, element.clientHeight);
    element.scrollLeft += nearestDelta(box.left - host.left - element.clientLeft, box.right - host.left - element.clientLeft, element.clientWidth);
  }

  /** Scroll delta that centres the target, matching `block: "center"`. */
  function centerDelta(top, targetHeight, viewportHeight) {
    return top - (viewportHeight - Math.min(targetHeight, viewportHeight)) / 2;
  }

  /** Minimal scroll delta that reveals the target, matching `inline: "nearest"`. */
  function nearestDelta(left, right, viewportWidth) {
    if (left < 0) return left;
    if (right > viewportWidth) return Math.min(right - viewportWidth, left);
    return 0;
  }

  /**
   * Reveals the AI page description holding the passage, when it is the reason
   * why nothing is measurable. The parent is notified so that its own toggle
   * button stays in sync.
   */
  function revealHiddenDescription(elements) {
    var hidden = elements.some(function (element) {
      var block = element.closest ? element.closest(".pn_page_visual_description") : null;
      if (!block) return false;
      var view = block.ownerDocument.defaultView || window;
      return view.getComputedStyle(block).display === "none";
    });
    if (!hidden) return;
    setDescriptionDisplay(true);
    returnMessage("description-visible", true);
  }

  // ----------------------
  // Passage highlighter
  //
  // The overlay lives inside the preview body, which carries the
  // `transform: scale(var(--factor))` of preview.css. A transform makes that body
  // the containing block of its absolutely positioned descendants, so the frames
  // are positioned in the body's LOCAL, pre-scale coordinate space -- while
  // getBoundingClientRect() reports post-scale viewport coordinates. Converting
  // with `(rect - bodyRect) / factor` handles the scroll offset and the scale in
  // one step, and needs no assumption about transform-origin.
  // ----------------------

  var PASSAGE_PADDING = 4; // local px kept between a frame and the glyphs
  var SAME_LINE_GAP_RATIO = 1.5; // horizontal gap, in line heights, that splits columns
  var TIGHT_BLOCK_GAP_RATIO = 0.8; // vertical gap, in line heights, of consecutive lines
  var LOOSE_BLOCK_GAP_RATIO = 1.6; // ... and of lines separated by one blank line
  // Above the tight gap the frame would swallow a blank line, which is only worth it
  // while it stays mostly text: a stack of short lines (a run of one-line captions,
  // say) must not collapse into one large, mostly empty box.
  var MIN_MERGE_DENSITY = 0.6;
  var RENDER_ATTEMPTS = 5;
  var RENDER_RETRY_MS = 100;
  // How long after a select a reflow may still re-centre the passage. Long enough
  // for lazily loaded slide images to arrive, short enough that an image landing
  // minutes later cannot yank a reader back to the citation. Any wheel, touch or
  // key event ends it early.
  var PASSAGE_SETTLE_MS = 3000;

  function getPassageLayer() {
    var body = getPreviewBody();
    if (!body) return null;
    var contentDocument = body.ownerDocument;
    if (passageLayer && passageLayer.ownerDocument === contentDocument && passageLayer.isConnected) {
      return passageLayer;
    }
    passageLayer = contentDocument.getElementById("sq-passage-layer");
    if (passageLayer) {
      // Adopting a layer we did not create in this session: whatever frames it
      // holds describe some other document state. Start from an empty overlay
      // rather than leaving stale boxes on screen until the first select.
      passageLayer.replaceChildren();
    } else {
      passageLayer = contentDocument.createElement("div");
      passageLayer.id = "sq-passage-layer";
      body.appendChild(passageLayer);
    }
    return passageLayer;
  }

  /**
   * Renders the frames of a passage. Returns false when nothing could be
   * measured, so the caller can retry.
   */
  function renderPassage(id) {
    var body = getPreviewBody();
    var layer = getPassageLayer();
    if (!body || !layer) return false;

    // The scale in effect right now, whatever put it there -- see appliedZoomFactor().
    var factor = appliedZoomFactor(body);
    var elements = Array.from(getElementsById(id));
    var measurement = collectPassageRects(elements, body, layer, factor);
    // Once every fragment has been measured, scrolling can no longer reveal more of the
    // passage, so the frame does not need recomputing on scroll any more.
    passageComplete = elements.length > 0 && measurement.measuredElements === elements.length;
    var blocks = elements.length ? groupPassageRects(measurement.rects) : [];
    if (!blocks.length) {
      layer.replaceChildren();
      renderedSignature = null;
      return false;
    }

    // Replacing the overlay's children is far from free: the boxes carry a blurred
    // box-shadow, so every write makes the browser re-rasterise them over whatever they
    // sit on -- and on a large document that dwarfs the cost of computing them. Skip the
    // write entirely when it would produce the same geometry, which is the common case
    // for a reposition triggered by something that did not actually move the passage.
    var signature = describeBlocks(blocks, factor);
    if (signature === renderedSignature && layer.childElementCount === blocks.length) return true;
    renderedSignature = signature;

    // Stroke and radius are divided by the factor so they stay constant on screen
    // through the body's scale. Set here rather than left to the `calc(2px /
    // var(--factor))` in preview.css, because preview.js no longer updates that
    // custom property -- writing it would invalidate style for the whole document.
    var borderWidth = 2 / factor + "px";
    var borderRadius = 5 / factor + "px";

    var contentDocument = body.ownerDocument;
    var boxes = blocks.map(function (block) {
      var box = contentDocument.createElement("div");
      box.className = "sq-passage-box";
      box.style.left = block.left - PASSAGE_PADDING + "px";
      box.style.top = block.top - PASSAGE_PADDING + "px";
      box.style.width = block.right - block.left + 2 * PASSAGE_PADDING + "px";
      box.style.height = block.bottom - block.top + 2 * PASSAGE_PADDING + "px";
      box.style.borderWidth = borderWidth;
      box.style.borderRadius = borderRadius;
      return box;
    });
    layer.replaceChildren.apply(layer, boxes);
    return true;
  }

  /** Rounded geometry of the blocks, to tell "same frames" from "moved frames". */
  function describeBlocks(blocks, factor) {
    var parts = blocks.map(function (block) {
      return Math.round(block.left) + "," + Math.round(block.top) + "," + Math.round(block.right) + "," + Math.round(block.bottom);
    });
    // The factor belongs in the key: identical geometry at a different scale still needs
    // the border width rewritten.
    return parts.join("|") + "@" + factor;
  }

  /**
   * One entry per line fragment, in the preview body's local coordinate space.
   * getClientRects() -- not getBoundingClientRect() -- is what splits a wrapped
   * span into one rect per line, which is the raw material of the grouping below.
   *
   * `factor` is the *visual* scale, which is what getBoundingClientRect() reports
   * through -- correct whether or not the layout has caught up with it yet.
   */
  function collectPassageRects(elements, body, layer, factor) {
    // Origin of the overlay itself, not of the body: the frames are positioned
    // against the layer's padding box, and the layer is a <div> that converter or
    // preview styles can offset (see #sq-passage-layer in preview.css). Measuring
    // from the layer makes the conversion self-referential, so such an offset
    // cancels out instead of shifting every frame.
    var origin = layer.getBoundingClientRect();
    var rects = [];
    var measuredElements = 0;

    elements.forEach(function (element) {
      var clientRects = element.getClientRects();
      // SVG text reports no client rects in some engines: fall back to its box.
      var list = clientRects.length ? Array.from(clientRects) : [element.getBoundingClientRect()];
      var page = getPageIndex(element, body);
      var before = rects.length;

      list.forEach(function (rect) {
        if (rect.width < 0.5 || rect.height < 0.5) return;
        rects.push({
          page: page,
          left: (rect.left - origin.left) / factor,
          top: (rect.top - origin.top) / factor,
          right: (rect.right - origin.left) / factor,
          bottom: (rect.bottom - origin.top) / factor,
          lineHeight: (rect.bottom - rect.top) / factor
        });
      });

      if (rects.length > before) measuredElements++;
    });

    return { rects: rects, measuredElements: measuredElements };
  }

  /**
   * Index of the page sheet an element belongs to, i.e. of the body-level
   * ancestor containing it (`.stl_` for the PDF-to-HTML converters, `body.bd > div`
   * for image pages). Fragments of two different sheets can never be merged,
   * which is what keeps a passage crossing a page break -- or two pages laid out
   * side by side -- from producing one frame spanning both.
   *
   * A page sheet is necessarily a block-ish box. An *inline* body-level ancestor
   * is not a sheet: unpaginated conversions (web pages, plain HTML) put the
   * passage <span>s directly under the body, and a single passage is split across
   * several of them because passages overlap each other and HTML cannot express
   * overlapping ranges. Keying on those would forbid merging fragments of the
   * very same paragraph, producing overlapping frames.
   */
  function getPageIndex(element, body) {
    var node = element;
    while (node && node.parentNode && node.parentNode !== body) {
      node = node.parentNode;
    }
    if (!node || node.parentNode !== body || node.nodeType !== 1) return 0;

    var view = body.ownerDocument.defaultView || window;
    if (view.getComputedStyle(node).display === "inline") return 0;

    return Array.prototype.indexOf.call(body.children, node);
  }

  /**
   * Merges fragments into visual blocks: one per paragraph, per column and per
   * page. Fragments join the same block when they sit on the same line (vertical
   * overlap, small horizontal gap) or on consecutive lines of the same column
   * (horizontal overlap, small vertical gap). Both thresholds are expressed in
   * line heights, so they hold at any zoom level.
   */
  function groupPassageRects(rects) {
    var blocks = rects.map(function (rect) {
      return {
        page: rect.page,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        lineHeight: rect.lineHeight,
        // Area actually covered by glyphs, as opposed to the block's bounding box.
        // Line fragments never overlap, so this simply accumulates on merge.
        textArea: (rect.right - rect.left) * (rect.bottom - rect.top)
      };
    });

    var merged = true;
    while (merged) {
      merged = false;
      for (var i = 0; i < blocks.length && !merged; i++) {
        for (var j = i + 1; j < blocks.length; j++) {
          if (!canMergeBlocks(blocks[i], blocks[j])) continue;
          mergeBlock(blocks[i], blocks[j]);
          blocks.splice(j, 1);
          merged = true;
          break;
        }
      }
    }

    return blocks.sort(function (a, b) {
      return a.page - b.page || a.top - b.top || a.left - b.left;
    });
  }

  function canMergeBlocks(a, b) {
    if (a.page !== b.page) return false;
    var lineHeight = Math.min(a.lineHeight, b.lineHeight);
    var verticalOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    var horizontalOverlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);

    // Same line: the column gutter is what makes this fail between two columns.
    if (verticalOverlap > 0.5 * lineHeight && -horizontalOverlap <= SAME_LINE_GAP_RATIO * lineHeight) return true;

    if (horizontalOverlap <= 0) return false;
    var gap = -verticalOverlap;

    // Consecutive lines of the same column.
    if (gap <= TIGHT_BLOCK_GAP_RATIO * lineHeight) return true;

    // A wider gap than that is a blank line, typically two paragraphs of the same
    // passage. Merging them reads better than two frames -- but only while the
    // result stays mostly text, otherwise a run of short lines ends up in one big
    // empty box. Beyond one blank line it is a structural break: never merge.
    if (gap > LOOSE_BLOCK_GAP_RATIO * lineHeight) return false;
    return mergedDensity(a, b) >= MIN_MERGE_DENSITY;
  }

  /** Share of the box the two blocks would occupy that glyphs actually cover. */
  function mergedDensity(a, b) {
    var width = Math.max(a.right, b.right) - Math.min(a.left, b.left);
    var height = Math.max(a.bottom, b.bottom) - Math.min(a.top, b.top);
    var box = width * height;
    return box > 0 ? (a.textArea + b.textArea) / box : 0;
  }

  function mergeBlock(target, other) {
    target.left = Math.min(target.left, other.left);
    target.top = Math.min(target.top, other.top);
    target.right = Math.max(target.right, other.right);
    target.bottom = Math.max(target.bottom, other.bottom);
    target.lineHeight = Math.min(target.lineHeight, other.lineHeight);
    target.textArea += other.textArea;
  }

  /**
   * Draws the frames once the layout has settled. `scrollIntoView` is synchronous
   * with `behavior: "instant"`, but fonts, images and lazily rendered pages can
   * still shift things, hence a short retry loop rather than a fixed delay.
   */
  function attemptRenderPassage(id, attempts) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (currentPassageId !== id) return;
        if (renderPassage(id)) return;
        if (attempts > 1) {
          setTimeout(function () {
            attemptRenderPassage(id, attempts - 1);
          }, RENDER_RETRY_MS);
          return;
        }
        // Nothing is measurable at all: image-only conversion, or a subtree that
        // stayed hidden. Tint the text so the citation remains identifiable.
        Array.from(getElementsById(id)).forEach(function (element) {
          element.classList.add("sq-highlighted");
        });
      });
    });
  }

  /** Recomputes the displayed passage after a layout change, at most once per frame. */
  function scheduleRepositionPassage() {
    if (!currentPassageId || repositionHandle !== null) return;
    repositionHandle = requestAnimationFrame(function () {
      repositionHandle = null;
      if (currentPassageId) renderPassage(currentPassageId);
    });
  }

  function selectHighlight(elements) {
    elements.forEach(function (el, i) {
      var first = i === 0;
      var last = i === elements.length - 1;
      if (el instanceof SVGElement) {
        selectHighlightSVG(el, first, last);
      } else {
        el.classList.add("sq-current");
        if (first) el.classList.add("sq-first");
        if (last) el.classList.add("sq-last");
      }
    });
  }

  /**
   * Puts the containers holding a cited passage back on the layout path.
   *
   * `preview.css` lets the browser skip off-screen blocks of a flowing document, which is
   * what makes a 15 MB capture open in under a second instead of eleven. The cost is that a
   * skipped subtree has no layout: `getBoundingClientRect()` on a fragment inside it does not
   * report where the text is, so the frames land nowhere near it -- 23 of 23 fragments outside
   * any frame on the bench, which is exactly how the first attempt at this failed.
   *
   * Only the ancestors of the fragments are lifted, never the whole document. That is what
   * keeps the gain: lifting everything would re-layout six million pixels, which is the cost
   * we came here to remove. The frames stay right because the overlay and the text are then
   * measured in the *same* layout -- the blocks above may still be estimated at their fallback
   * height, so the absolute scroll offset is provisional, and that is precisely what
   * onContentReflow() re-anchors as the real heights arrive.
   *
   * The lift is held for as long as the passage is selected, because every reposition
   * re-measures those fragments; dropping it early would make the frames jump on the next
   * scroll.
   */
  function liftSkipAroundPassage(elements) {
    var body = getPreviewBody();
    if (!body) return;
    var contentView = body.ownerDocument.defaultView || window;
    for (var i = 0; i < elements.length; i++) {
      for (var node = elements[i]; node && node !== body; node = node.parentElement) {
        if (!node.style || liftedSkips.indexOf(node) !== -1) continue;
        // Asking the computed style, not our own selector: whatever put the skip there --
        // this stylesheet, a converter's, a future rule -- this finds it.
        if (contentView.getComputedStyle(node).contentVisibility !== "auto") continue;
        node.style.contentVisibility = "visible";
        liftedSkips.push(node);
      }
    }
  }

  /**
   * Re-anchors and redraws when a block the browser had only *estimated* takes its real size.
   *
   * `preview.css` lets off-screen blocks of a flowing document be skipped, with
   * `contain-intrinsic-height: auto 1200px` standing in for a height nobody has measured yet.
   * The estimate is wrong by construction, and it corrects itself the moment the block is
   * rendered -- which shifts everything below it. Not one of the existing reflow watchers sees
   * that: it is not a load, not a font, not a style change on the body, and the body's own box
   * is fixed by us, so the ResizeObserver above stays silent. The frames therefore stayed
   * where the estimate had put them, which on the bench read as 23 of 23 fragments outside any
   * frame -- a geometry bug that was really a missing notification.
   *
   * Observing the containers rather than the body is what makes it fire: their boxes are
   * exactly what changes. One observer, a few dozen targets.
   */
  function observeSkippedContainers(contentBody) {
    var seeded = false;
    var observer = new ResizeObserver(function () {
      // ResizeObserver delivers an initial callback for every target it is given; that is the
      // layout we just measured, not a change to react to.
      if (!seeded) {
        seeded = true;
        return;
      }
      onContentReflow();
    });
    var children = contentBody.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.id === "sq-passage-layer") continue;
      observer.observe(child);
    }
  }

  function restoreSkips() {
    for (var i = 0; i < liftedSkips.length; i++) liftedSkips[i].style.contentVisibility = "";
    liftedSkips.length = 0;
  }

  function unselect() {
    restoreSkips();
    currentPassageId = null;
    passageSettleUntil = 0;
    passageComplete = false;
    renderedSignature = null;
    if (repositionHandle !== null) {
      cancelAnimationFrame(repositionHandle);
      repositionHandle = null;
    }
    // Do not create the layer just to empty it.
    if (passageLayer) passageLayer.replaceChildren();

    removeAllClasses("sq-highlighted");
    removeAllClasses("sq-current");
    removeAllClasses("sq-first");
    removeAllClasses("sq-last");
    removeAllElements("svg line.sq-svg");
  }

  /**
   * Groups the elements carrying any of these ids, in document order, in **one** pass.
   *
   * The point is what it replaces: one `querySelectorAll("#" + id)` per id, each of which
   * walks the whole document. An id selector cannot use the browser's id table here,
   * because the converters emit the same id on several elements and the query has to return
   * all of them -- so it is a full tree walk every time. Measured on a 447 919-element
   * capture: 11 ms per id, so 2 201 ms for the 200 ids of a single extracts request, all of
   * it blocking the main thread. Note that the ids come from the server's highlight data
   * rather than from the document, so most of them may match nothing and still cost a walk.
   *
   * This also runs before anything is handed to the web worker, which is why the worker
   * does not help: it only ever receives strings that are already built.
   */
  function collectElementsByIds(ids) {
    var wanted = new Set(ids);
    var grouped = new Map();

    var scan = function (source) {
      var candidates = source.querySelectorAll("[id]");
      for (var i = 0; i < candidates.length; i++) {
        var element = candidates[i];
        if (!wanted.has(element.id)) continue;
        var bucket = grouped.get(element.id);
        if (!bucket) {
          bucket = [];
          grouped.set(element.id, bucket);
        }
        bucket.push(element);
      }
    };

    scan(document);
    // Same fallback as getElementsById(): a frameset keeps the content one level down.
    if (grouped.size === 0 && frames.length > 0) {
      try {
        scan(frames[0].document);
      } catch (e) {
        // Ignore cross-origin frame access errors
      }
    }
    return grouped;
  }

  function getHtml(ids) {
    if (!ids || !ids.length) return [];
    var grouped = collectElementsByIds(ids);
    return ids.map(function (id) {
      var html = "";
      (grouped.get(id) || []).forEach(function (n) {
        html += n.innerHTML + " ";
      });
      return html;
    });
  }

  function getText(ids) {
    if (!ids || !ids.length) {
      returnMessage("get-text-results", []);
      return;
    }
    var grouped = collectElementsByIds(ids);
    var data = ids.map(function (id) {
      var text = "";
      (grouped.get(id) || []).forEach(function (n) {
        text += n.textContent + " ";
      });
      return text;
    });
    returnMessage("get-text-results", data);
  }

  function getPositions(highlight) {
    var allHighlights = Array.from(document.querySelectorAll("span.".concat(highlight, ",tspan.").concat(highlight)));
    var data = getVerticalPositions(allHighlights);
    returnMessage("get-positions-results", data);
  }

  function onMouseUp() {
    var selection = document.getSelection();
    var selectedText = selection ? selection.toString().trim() : "";
    if (selection && selectedText) {
      var range = selection.getRangeAt(0);
      var position = range.getBoundingClientRect();
      returnMessage("text-selection", {
        selectedText: selectedText,
        position: position
      });
    } else {
      returnMessage("text-selection");
    }
  }

  /**
   * Records which entity is under the pointer. Emitting is deferred to the next frame:
   * on a document where every word is an entity span, a single sweep of the mouse walks
   * through a burst of them, and each transition used to cost a getBoundingClientRect()
   * plus a postMessage.
   *
   * `highlight-hover` is consumed by another application, so the throttle may only reduce
   * volume, never change what is observed: the last state always wins (trailing edge),
   * enter and leave keep their order, and the position is measured at emission time -- a
   * rect captured a frame earlier can already be stale.
   */
  function onMouseMove(event) {
    var el = event.target;
    var entity = el && el.hasAttribute && el.hasAttribute("data-entity-display") ? el : null;
    hoveredEntity = entity;
    if (hoverHandle !== null) return;
    // Nothing pending and nothing to say: do not even schedule a frame.
    if ((entity ? entity.id : undefined) === reportedHoverId) return;
    hoverHandle = requestAnimationFrame(flushHover);
  }

  function flushHover() {
    hoverHandle = null;
    var entity = hoveredEntity;
    var id = entity ? entity.id : undefined;
    if (id === reportedHoverId) return;
    reportedHoverId = id;
    if (entity) {
      returnMessage("highlight-hover", { id: id, position: entity.getBoundingClientRect() });
    } else {
      returnMessage("highlight-hover");
    }
  }

  /**
   * Sizes the background rect behind every highlighted SVG text run.
   *
   * Strictly two passes: every measurement first, every write afterwards. Each
   * measurement (getBoundingClientRect, getBBox, getExtentOfChar,
   * getComputedTextLength) forces style and layout, and each write invalidates it, so
   * interleaving them -- as this did -- made every tspan pay for a fresh layout. On an
   * SVG conversion with thousands of runs that is thousands of forced layouts, and it
   * happens before `ready`, i.e. entirely inside the host's spinner.
   *
   * Batching is safe here because SVG has no layout flow: moving a background rect
   * cannot move the text a later measurement reads.
   */
  function setSvgBackgroundPositionAndSize() {
    // An attribute selector, so the engine filters instead of us calling getAttribute
    // on every tspan in the document.
    var runs = document.querySelectorAll("svg tspan[data-entity-background]");
    if (!runs.length) return;

    var updates = [];
    runs.forEach(function (tspan) {
      var rect = document.getElementById(tspan.getAttribute("data-entity-background"));
      if (!rect) return;
      var update = measureSvgBackground(rect, tspan);
      if (update) updates.push(update);
    });

    updates.forEach(function (update) {
      update.rect.setAttribute("x", String(update.x));
      update.rect.setAttribute("y", String(update.y));
      update.rect.setAttribute("width", String(update.width));
      update.rect.setAttribute("height", String(update.height));
      if (update.transform) update.rect.setAttribute("transform", update.transform);
    });
  }

  /** Read-only half of setSvgBackgroundPositionAndSize(). */
  function measureSvgBackground(rect, tspan) {
    var textBoxPixel = tspan.getBoundingClientRect();
    if (textBoxPixel.height === 0 || textBoxPixel.width === 0) return null;

    var textBoxSVG = tspan.getBBox();
    // The padding is expressed in screen pixels, so it has to be converted into the
    // SVG's own units before it can be added to SVG coordinates.
    var deltaX = 2 * (textBoxSVG.width / textBoxPixel.width);
    var deltaY = 2 * (textBoxSVG.height / textBoxPixel.height);
    var firstCharRect = tspan.getExtentOfChar(0);
    var tspanWidth = tspan.getComputedTextLength();

    return {
      rect: rect,
      x: firstCharRect.x - deltaX,
      y: firstCharRect.y - deltaY,
      width: tspanWidth + 2 * deltaX,
      height: textBoxSVG.height + 2 * deltaY,
      transform: tspan.getAttribute("transform")
    };
  }

  function selectHighlightSVG(elt, isFirst, isLast) {
    var bgId = elt.getAttribute("data-entity-background");
    if (!bgId) return;
    var rect = document.querySelector(bgId);
    if (!rect) return;
    var group = rect.parentNode;
    var rectPosition = rect.getBBox();
    if (group) {
      var top_2 = rectPosition.y;
      var bottom = rectPosition.y + rectPosition.height;
      var left = rectPosition.x;
      var right = rectPosition.x + rectPosition.width;
      var valueTransform = rect.getAttribute("transform");
      addSvgLine(group, left, top_2, right, top_2, valueTransform);
      addSvgLine(group, left, bottom, right, bottom, valueTransform);
      if (isFirst) addSvgLine(group, left, top_2, left, bottom, valueTransform);
      if (isLast) addSvgLine(group, right, top_2, right, bottom, valueTransform);
    }
  }

  function addSvgLine(group, x1, y1, x2, y2, transform) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "sq-svg");
    line.setAttribute("x1", String(x1));
    line.setAttribute("y1", String(y1));
    line.setAttribute("x2", String(x2));
    line.setAttribute("y2", String(y2));
    if (transform) line.setAttribute("transform", transform);
    group.appendChild(line);
  }

  function getElementsById(id) {
    // Prefer current document, fallback to first frame if not found
    let elements = document.querySelectorAll("#" + id);
    if (elements.length === 0 && frames.length > 0) {
      try {
        elements = frames[0].document.querySelectorAll("#" + id);
      } catch (e) {
        // Ignore cross-origin frame access errors
      }
    }
    return elements;
  }

  function getVerticalPositions(elements) {
    var offset = -document.documentElement.getBoundingClientRect().top;
    var docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    var groups = new Map();
    for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
      var el = elements_1[_i];
      var id = el.id;
      if (id) {
        if (!groups.has(id)) {
          groups.set(id, []);
        }
        groups.get(id).push(el);
      }
    }
    var positions = [];
    for (var _a = 0, _b = Array.from(groups.entries()); _a < _b.length; _a++) {
      var _c = _b[_a],
        id = _c[0],
        el = _c[1];
      var box = getBoundingBox(el);
      if (box) {
        var top_3 = (100 * (offset + box.top)) / docHeight;
        var height = (100 * box.height) / docHeight;
        var text = el
          .map(function (e) {
            return e.textContent;
          })
          .join(" ");
        var type = id.substring(0, id.lastIndexOf("_"));
        positions.push({
          id: id,
          type: type,
          top: top_3,
          height: height,
          text: text
        });
      }
    }
    return positions;
  }

  function getBoundingBox(elements) {
    var boxes = elements
      .map(function (el) {
        return el.getBoundingClientRect();
      })
      .filter(function (b) {
        return b.width && b.height;
      });
    if (boxes.length === 0) {
      return undefined;
    }
    var left = Math.min.apply(
      Math,
      boxes.map(function (p) {
        return p.left;
      })
    );
    var top = Math.min.apply(
      Math,
      boxes.map(function (p) {
        return p.top;
      })
    );
    var right = Math.max.apply(
      Math,
      boxes.map(function (p) {
        return p.right;
      })
    );
    var bottom = Math.max.apply(
      Math,
      boxes.map(function (p) {
        return p.bottom;
      })
    );
    return new DOMRect(left, top, right - left, bottom - top);
  }

  function removeAllClasses(classname) {
    var body = getPreviewBody();
    if (!body) return;
    body.querySelectorAll(".".concat(classname)).forEach(function (el) {
      return el.classList.remove(classname);
    });
  }

  function removeAllElements(selector) {
    var body = getPreviewBody();
    if (!body) return;
    body.querySelectorAll(selector).forEach(function (e) {
      return e.remove();
    });
  }

  function isElementInViewport(el) {
    var ownerDocument = el.ownerDocument;
    var view = ownerDocument.defaultView || window;
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (view.innerHeight || ownerDocument.documentElement.clientHeight) &&
      rect.right <= (view.innerWidth || ownerDocument.documentElement.clientWidth)
    );
  }
});
