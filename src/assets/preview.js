document.addEventListener("DOMContentLoaded", function () {
  var TRUSTED_ORIGINS = ["http://localhost:4200", "https://localhost:4200", window.origin];
  var parentOrigin = "*";
  var styleElement;
  var fitFactor = null;

  // ---- passage highlighter state ----
  // Overlay holding one frame per contiguous block of the selected passage, plus
  // the id currently displayed so it can be recomputed on any layout change.
  var passageLayer;
  var currentPassageId = null;
  var repositionHandle = null;
  var listenersBound = false;

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
   * Current zoom factor, read from the --factor custom property that zoom()
   * writes on the preview body and that preview.css turns into a scale()
   * transform.
   */
  function getZoomFactor(body) {
    if (!body) return 1;
    var view = body.ownerDocument.defaultView || window;
    var value = parseFloat(view.getComputedStyle(body).getPropertyValue("--factor"));
    return isNaN(value) || value <= 0 ? 1 : value;
  }

  // ----------------------
  // Zoom helpers
  // ----------------------
  function zoomFit() {
    if (fitFactor) {
      zoom(fitFactor);
      return;
    }

    const body = getPreviewBody();
    if (!body) return;
    const width = body.getBoundingClientRect().width;

    // select only span if div, img or table are not present
    let elements = body.querySelectorAll("div, img, table");
    if (!elements.length) {
      elements = body.querySelectorAll("span");
    }
    if (!elements.length) {
      fitFactor = 1;
      zoom(fitFactor);
      return;
    }

    const higherWidth = Math.max(...Array.from(elements).map(x => x.getBoundingClientRect().width));
    const margin = 24;
    fitFactor = width / (higherWidth + margin * 2);

    // prevent too low or too high values
    fitFactor = Math.min(1, Math.max(0.2, fitFactor));

    zoom(fitFactor);
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
        let factor = getZoomFactor(getPreviewBody());
        zoom(Math.min(3, factor + 0.2));
        break;
      }

      case "zoom-out": {
        let factor = getZoomFactor(getPreviewBody());
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

  function zoom(value) {
    const body = getPreviewBody();
    if (!body) return;
    body.style.setProperty("--factor", value);
    // The body is sized `width: calc(99% / var(--factor))`, so zooming changes the
    // *layout* width and reflows the content (text re-wraps, page sheets change
    // rows). Any displayed passage frame has to be measured again.
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
    window.addEventListener("resize", scheduleRepositionPassage);
    if (contentBody && typeof ResizeObserver !== "undefined") {
      // Safety net for every other reflow: late fonts and images, injection of
      // the highlight <style>, toggling of extracts or descriptions.
      new ResizeObserver(scheduleRepositionPassage).observe(contentBody);
    }
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
    var elements = Array.from(getElementsById(id));
    if (!elements.length) return;

    // A citation can point at a subtree that is hidden by default -- the
    // AI-generated description of a multimodal conversion. Reveal it first:
    // otherwise there is nothing to scroll to and nothing to measure.
    if (usePassageHighlighter && !elements.some(isMeasurable)) {
      revealHiddenDescription(elements);
    }

    var anchor = elements.find(isMeasurable) || elements[0];
    // container: 'nearest' stops scroll propagation to it's nearest parent.
    // This will stop the application body page from automatically scrolling
    // back to the top after you have navigated through the preview.
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#container
    anchor.scrollIntoView({
      block: "center",
      behavior: "instant",
      container: "nearest"
    });

    if (usePassageHighlighter) {
      currentPassageId = id;
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
  var SAME_BLOCK_GAP_RATIO = 0.8; // vertical gap, in line heights, that splits blocks
  var RENDER_ATTEMPTS = 5;
  var RENDER_RETRY_MS = 100;

  function getPassageLayer() {
    var body = getPreviewBody();
    if (!body) return null;
    var contentDocument = body.ownerDocument;
    if (passageLayer && passageLayer.ownerDocument === contentDocument && passageLayer.isConnected) {
      return passageLayer;
    }
    passageLayer = contentDocument.getElementById("sq-passage-layer");
    if (!passageLayer) {
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

    var elements = Array.from(getElementsById(id));
    var blocks = elements.length ? groupPassageRects(collectPassageRects(elements, body)) : [];
    if (!blocks.length) {
      layer.replaceChildren();
      return false;
    }

    var contentDocument = body.ownerDocument;
    var boxes = blocks.map(function (block) {
      var box = contentDocument.createElement("div");
      box.className = "sq-passage-box";
      box.style.left = block.left - PASSAGE_PADDING + "px";
      box.style.top = block.top - PASSAGE_PADDING + "px";
      box.style.width = block.right - block.left + 2 * PASSAGE_PADDING + "px";
      box.style.height = block.bottom - block.top + 2 * PASSAGE_PADDING + "px";
      return box;
    });
    layer.replaceChildren.apply(layer, boxes);
    return true;
  }

  /**
   * One entry per line fragment, in the preview body's local coordinate space.
   * getClientRects() -- not getBoundingClientRect() -- is what splits a wrapped
   * span into one rect per line, which is the raw material of the grouping below.
   */
  function collectPassageRects(elements, body) {
    var bodyRect = body.getBoundingClientRect();
    var factor = getZoomFactor(body);
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
          left: (rect.left - bodyRect.left) / factor,
          top: (rect.top - bodyRect.top) / factor,
          right: (rect.right - bodyRect.left) / factor,
          bottom: (rect.bottom - bodyRect.top) / factor,
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
        lineHeight: rect.lineHeight
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

    // Consecutive lines of the same column.
    return horizontalOverlap > 0 && -verticalOverlap <= SAME_BLOCK_GAP_RATIO * lineHeight;
  }

  function mergeBlock(target, other) {
    target.left = Math.min(target.left, other.left);
    target.top = Math.min(target.top, other.top);
    target.right = Math.max(target.right, other.right);
    target.bottom = Math.max(target.bottom, other.bottom);
    target.lineHeight = Math.min(target.lineHeight, other.lineHeight);
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
