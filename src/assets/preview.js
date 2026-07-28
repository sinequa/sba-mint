document.addEventListener("DOMContentLoaded", function () {
  var TRUSTED_ORIGINS = ["http://localhost:4200", "https://localhost:4200", window.origin];
  var parentOrigin = "*";
  var styleElement;
  var fitFactor = null;

  // ---- zoom state ----
  // `currentFactor` is the applied visual scale and the single source of truth, so a
  // zoom step needs no getComputedStyle. `layoutFactor` is the factor the layout is
  // currently computed for; it lags behind on purpose (see zoom()). Both start null,
  // meaning "whatever the server wrote inline", which is what preview.css applies until
  // the first zoom.
  var currentFactor = null;
  var layoutFactor = null;
  var zoomSettleHandle = null;
  // Long enough that a burst of clicks reflows once, short enough not to feel lagged.
  var ZOOM_SETTLE_MS = 180;

  // ---- passage highlighter state ----
  // Overlay holding one frame per contiguous block of the selected passage, plus
  // the id currently displayed so it can be recomputed on any layout change.
  var passageLayer;
  var currentPassageId = null;
  var repositionHandle = null;
  var listenersBound = false;
  // Deadline until which a reflow is still allowed to re-centre the passage.
  var passageSettleUntil = 0;

  window.addEventListener("message", receiveMessage);

  zoomFit();

  // Wait for paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // DOM is painted now
      setTimeout(() => {
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
      }, 500);
    });
  });

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
   * preview.css turns into the initial scale() transform. Only used to seed
   * currentZoomFactor(): from the first zoom on, the applied scale is an inline
   * transform and the JS value is the source of truth.
   */
  function getZoomFactor(body) {
    if (!body) return 1;
    var view = body.ownerDocument.defaultView || window;
    var value = parseFloat(view.getComputedStyle(body).getPropertyValue("--factor"));
    return isNaN(value) || value <= 0 ? 1 : value;
  }

  /**
   * The applied visual scale. Cached, so the common paths -- a zoom step, a frame
   * recomputation -- never pay for a getComputedStyle. The cache is seeded once from
   * the computed value, which is how the factor the server wrote inline is picked up.
   */
  function currentZoomFactor(body) {
    if (currentFactor !== null) return currentFactor;
    if (!body) return 1;
    currentFactor = getZoomFactor(body);
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
    const overflow = body.scrollWidth;
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
    currentFactor = value;
    body.style.transform = "scale(" + value + ")";

    if (commitNow) {
      commitZoomLayout();
      return;
    }
    if (zoomSettleHandle !== null) clearTimeout(zoomSettleHandle);
    zoomSettleHandle = setTimeout(commitZoomLayout, ZOOM_SETTLE_MS);
  }

  /**
   * Reflows the document for the current factor: the one expensive part of a zoom,
   * paid once per gesture. Written as inline lengths rather than through a custom
   * property, so the cost is the reflow itself and not also a style invalidation of
   * every element in the document.
   */
  function commitZoomLayout() {
    if (zoomSettleHandle !== null) {
      clearTimeout(zoomSettleHandle);
      zoomSettleHandle = null;
    }
    const body = getPreviewBody();
    if (!body || currentFactor === null || layoutFactor === currentFactor) return;
    layoutFactor = currentFactor;
    body.style.width = "calc(99% / " + currentFactor + ")";
    body.style.height = "calc(98% / " + currentFactor + ")";
    // The reflow re-wraps text and changes how many page sheets fit per row, so a
    // displayed frame has to be measured again -- here, once, rather than per step.
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
    parent.postMessage({ type: type, data: data, url: window.location.href }, parentOrigin);
    // in case of nested iframes (frameset)
    parent?.parent.postMessage({ type: type, data: data, url: window.location.href }, parentOrigin);
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
      // add a click listener to toggle the class "screenshot-extended" for "sq-mediav2-screenshot"
      // if we click on a screenshot for a converted video preview
      e.stopImmediatePropagation();
      var parentElement = e.target?.parentElement;
      if (!!parentElement && parentElement.classList?.contains("sq-mediav2-screenshot")) {
        parentElement.classList.toggle("screenshot-extended");
      }
    });
    var contentBody = getPreviewBody();
    var contentDocument = contentBody ? contentBody.ownerDocument : document;
    var contentView = contentDocument.defaultView || window;
    var pages = contentDocument.querySelectorAll('[id^="sq-page-start"]');

    function onScroll() {
      if (pages?.length) {
        let found = false;
        pages.forEach(page => {
          if (!found && isElementInViewport(page)) {
            found = true;
            returnMessage("current-page", page.id);
          }
        });
      }
      // Fragments revealed by `content-visibility` while scrolling can complete
      // the frame of a passage that was only partly laid out.
      scheduleRepositionPassage();
      return returnMessage("scroll", { x: contentView.scrollX, y: contentView.scrollY });
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

    styleElement.textContent = highlights
      .map(function (highlight) {
        return `
          span.${highlight.name} {
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

    // A citation can point at a subtree that is hidden by default -- the
    // AI-generated description of a multimodal conversion. Reveal it first:
    // otherwise there is nothing to scroll to and nothing to measure.
    if (usePassageHighlighter && !elements.some(isMeasurable)) {
      revealHiddenDescription(elements);
    }

    var anchor = elements.find(isMeasurable) || elements[0];
    scrollAnchorIntoView(anchor);

    if (usePassageHighlighter) {
      currentPassageId = id;
      passageSettleUntil = Date.now() + PASSAGE_SETTLE_MS;
      attemptRenderPassage(id, RENDER_ATTEMPTS);
    } else {
      // Extract and entity navigation keeps the historical dashed outline.
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

    var factor = currentZoomFactor(body);
    var elements = Array.from(getElementsById(id));
    var blocks = elements.length ? groupPassageRects(collectPassageRects(elements, body, layer, factor)) : [];
    if (!blocks.length) {
      layer.replaceChildren();
      return false;
    }

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

    elements.forEach(function (element) {
      var clientRects = element.getClientRects();
      // SVG text reports no client rects in some engines: fall back to its box.
      var list = clientRects.length ? Array.from(clientRects) : [element.getBoundingClientRect()];
      var page = getPageIndex(element, body);

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
    });

    return rects;
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

  function unselect() {
    currentPassageId = null;
    passageSettleUntil = 0;
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

  function getHtml(ids) {
    if (!ids) return [];
    var data = ids.map(function (id) {
      return getHighlightHtmlById(id);
    });
    return data;
  }

  function getText(ids) {
    var data = ids.map(function (id) {
      return getHighlightTextById(id);
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

  var currentId;

  function onMouseMove(event) {
    var el = event.target;
    if (el.attributes["data-entity-display"] && el.id !== currentId) {
      currentId = el.id;
      returnMessage("highlight-hover", {
        id: el.id,
        position: el.getBoundingClientRect()
      });
    } else if (currentId && el.id !== currentId) {
      currentId = undefined;
      returnMessage("highlight-hover");
    }
  }

  function setSvgBackgroundPositionAndSize() {
    document.querySelectorAll("svg").forEach(function (svg) {
      svg.querySelectorAll("tspan").forEach(function (tspan) {
        var bgId = tspan.getAttribute("data-entity-background");
        if (bgId) {
          var rect = document.getElementById(bgId);
          if (rect) {
            resizeSvgBackground(rect, tspan);
          }
        }
      });
    });
  }

  function resizeSvgBackground(rect, tspan) {
    var text = tspan;
    var textBoxPixel = text.getBoundingClientRect();
    var textBoxSVG = text.getBBox();

    if (textBoxPixel.height === 0 || textBoxPixel.width === 0) return;

    var scaleX = textBoxSVG.width / textBoxPixel.width;
    var scaleY = textBoxSVG.height / textBoxPixel.height;
    var deltaX = 2 * scaleX;
    var deltaY = 2 * scaleY;
    var firstCharRect = tspan.getExtentOfChar(0);
    var tspanWidth = tspan.getComputedTextLength();

    rect.setAttribute("x", String(firstCharRect.x - deltaX));
    rect.setAttribute("y", String(firstCharRect.y - deltaY));
    rect.setAttribute("width", String(tspanWidth + 2 * deltaX));
    rect.setAttribute("height", String(textBoxSVG.height + 2 * deltaY));

    var valueTransform = text.getAttribute("transform");
    if (valueTransform) rect.setAttribute("transform", valueTransform);
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

  function getHighlightTextById(id) {
    var text = "";
    getElementsById(id).forEach(function (n) {
      return (text += n.textContent + " ");
    });
    return text;
  }

  function getHighlightHtmlById(id) {
    var html = "";
    getElementsById(id).forEach(function (n) {
      return (html += n.innerHTML + " ");
    });
    return html;
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
