/*
 * Shared fixture builders for preview-lab.
 *
 * Fixtures are built in JavaScript rather than hand-written HTML so that the
 * geometry stays deterministic and the expected result can be DERIVED from the
 * placement data instead of being restated by hand (and drifting from it).
 *
 * The builders run synchronously at parse time, before preview.js's
 * DOMContentLoaded handler, so the document is fully laid out when preview.js
 * measures it -- exactly like a server-generated preview.
 */
window.LAB = (function () {
  var WORDS = (
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua " +
    "enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure " +
    "reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt " +
    "culpa qui officia deserunt mollit anim id est laborum"
  ).split(" ");

  // Single cursor walked in DOM order: same document => same text, every run.
  var cursor = 0;

  function words(count) {
    var out = [];
    for (var i = 0; i < count; i++) {
      out.push(WORDS[cursor++ % WORDS.length]);
    }
    return out.join(" ");
  }

  /** Deterministic pseudo-random integer in [min, max], driven by the text cursor. */
  function spread(min, max, salt) {
    var n = (cursor * 7 + salt * 13) % (max - min + 1);
    return min + n;
  }

  // ---------------------------------------------------------------------------
  // Pagination stubs
  //
  // In production these globals are emitted by the Sinequa converter and are
  // called by preview.js for the goto-page / next-page / ... actions. Without
  // them those actions throw a ReferenceError.
  // ---------------------------------------------------------------------------
  function pagination(total, defPage) {
    window.lastPage = total;
    window.defPage = defPage || 1;
    var current = window.defPage;

    function scrollToPage(page) {
      var anchor = document.getElementById("sq-page-start-" + page);
      if (anchor) anchor.scrollIntoView({ block: "start", behavior: "instant" });
    }

    window.SetPage = function (page) {
      var value = parseInt(page, 10);
      if (isNaN(value)) value = 1;
      current = Math.min(total, Math.max(1, value));
    };
    window.Go = function () {
      scrollToPage(current);
    };
    window.GoN = function () {
      window.SetPage(current + 1);
      window.Go();
    };
    window.GoP = function () {
      window.SetPage(current - 1);
      window.Go();
    };
    window.GoF = function () {
      window.SetPage(1);
      window.Go();
    };
    window.GoL = function () {
      window.SetPage(total);
      window.Go();
    };
  }

  // ---------------------------------------------------------------------------
  // PDF-to-HTML style pages
  // ---------------------------------------------------------------------------

  var ROW_PITCH = 24; // vertical distance between two text lines
  var TOP_MARGIN = 64;
  var COLUMN_GAP = 40;

  /**
   * Slots are numbered column-major: slot s => column floor(s / rowsPerColumn),
   * row s % rowsPerColumn. A passage listed as [n-2, n-1, n, n+1] therefore
   * crosses the column boundary naturally when n is the first slot of column 2.
   */
  function slotGeometry(slot, options) {
    var column = Math.floor(slot / options.rowsPerColumn);
    var row = slot % options.rowsPerColumn;
    var columnWidth = options.columns === 1 ? 696 : (696 - COLUMN_GAP) / 2;
    return {
      column: column,
      row: row,
      left: 60 + column * (columnWidth + COLUMN_GAP),
      top: TOP_MARGIN + row * ROW_PITCH,
      width: columnWidth
    };
  }

  /** Every (page, column, row) touched by a passage, keyed for fast lookup. */
  function indexPlacements(snippets, options) {
    var index = new Map();
    snippets.forEach(function (snippet) {
      snippet.placements.forEach(function (placement) {
        placement.slots.forEach(function (slot, i) {
          var geometry = slotGeometry(slot, options);
          index.set(placement.page + ":" + slot, {
            id: snippet.id,
            first: i === 0,
            last: i === placement.slots.length - 1,
            column: geometry.column,
            row: geometry.row,
            page: placement.page
          });
        });
      });
    });
    return index;
  }

  /**
   * Expected number of frames for a passage: one per run of contiguous rows
   * within the same (page, column). This is the ground-truth definition of a
   * "visual block" and is deliberately independent of the grouping heuristics
   * used by the code under test.
   */
  function expectedBlocks(snippet, options) {
    var byColumn = new Map();
    snippet.placements.forEach(function (placement) {
      placement.slots.forEach(function (slot) {
        var geometry = slotGeometry(slot, options);
        var key = placement.page + ":" + geometry.column;
        if (!byColumn.has(key)) byColumn.set(key, []);
        byColumn.get(key).push(geometry.row);
      });
    });

    var blocks = 0;
    byColumn.forEach(function (rows) {
      rows.sort(function (a, b) {
        return a - b;
      });
      blocks++;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i] !== rows[i - 1] + 1) blocks++;
      }
    });
    return blocks;
  }

  /**
   * A line is a decoy when no frame may legitimately touch it: either its
   * (page, column) holds no fragment of any passage, or it sits at least
   * DECOY_DISTANCE rows away from the nearest fragment in that same column.
   * Adjacent lines are excluded on purpose: a correct frame is allowed to bleed
   * a couple of pixels into the inter-line gap, and the lab must not fail on
   * that technicality.
   */
  var DECOY_DISTANCE = 3;

  function isDecoy(page, slot, index, options) {
    var geometry = slotGeometry(slot, options);
    var nearest = Infinity;
    var sameColumnHasFragment = false;

    index.forEach(function (fragment) {
      if (fragment.page !== page || fragment.column !== geometry.column) return;
      sameColumnHasFragment = true;
      nearest = Math.min(nearest, Math.abs(fragment.row - geometry.row));
    });

    if (!sameColumnHasFragment) return true;
    return nearest >= DECOY_DISTANCE;
  }

  /**
   * Builds a paginated preview and returns the expectation descriptor consumed
   * by the lab runner.
   *
   * @param {object} options
   * @param {string} options.title       human readable scenario name
   * @param {number} options.pages       number of page sheets
   * @param {number} options.columns     1 or 2 text columns per page
   * @param {number} options.rowsPerColumn number of text lines per column
   * @param {Array}  options.snippets    [{ id, placements: [{ page, slots }] }]
   */
  function buildPdfPages(options) {
    options.columns = options.columns || 1;
    options.rowsPerColumn = options.rowsPerColumn || 34;

    var index = indexPlacements(options.snippets, options);
    var totalSlots = options.columns * options.rowsPerColumn;
    var body = document.body;

    for (var page = 1; page <= options.pages; page++) {
      var sheet = document.createElement("div");
      sheet.className = "stl_ stl_0" + page;

      var anchor = document.createElement("a");
      anchor.id = "sq-page-start-" + page;
      sheet.appendChild(anchor);

      for (var slot = 0; slot < totalSlots; slot++) {
        var geometry = slotGeometry(slot, options);
        var line = document.createElement("div");
        line.className = "t";
        line.style.top = geometry.top + "px";
        line.style.left = geometry.left + "px";

        var fragment = index.get(page + ":" + slot);
        if (fragment) {
          appendPassageLine(line, fragment, options);
        } else {
          appendPlainLine(line, page, slot, index, options);
        }
        sheet.appendChild(line);
      }

      var footer = document.createElement("div");
      footer.className = "pageno";
      // The ticket reports frames landing in the footer: always a decoy.
      footer.setAttribute("data-lab-decoy", "footer");
      footer.textContent = "- " + page + " -";
      sheet.appendChild(footer);

      body.appendChild(sheet);
    }

    pagination(options.pages, options.defPage || 1);

    var passages = {};
    options.snippets.forEach(function (snippet) {
      passages[snippet.id] = {
        blocks: expectedBlocks(snippet, options),
        label: snippet.label || snippet.id
      };
    });

    return { title: options.title, passages: passages };
  }

  /** A line carrying a fragment of a passage. */
  function appendPassageLine(line, fragment, options) {
    var wordCount = options.columns === 1 ? 13 : 6;

    // The passage starts mid-line and ends mid-line, like a real extract.
    if (fragment.first) {
      var lead = document.createElement("span");
      lead.textContent = words(3) + " ";
      line.appendChild(lead);
    }

    var span = document.createElement("span");
    // Repeated id across fragments: invalid HTML, but exactly what the Sinequa
    // converters emit and what getElementsById() relies on.
    span.id = fragment.id;
    span.textContent = words(wordCount);
    line.appendChild(span);

    if (fragment.last) {
      var trail = document.createElement("span");
      trail.textContent = " " + words(2);
      line.appendChild(trail);
    }
  }

  /** A line of ordinary text, flagged as a decoy when far from any passage. */
  function appendPlainLine(line, page, slot, index, options) {
    var wordCount = options.columns === 1 ? spread(12, 17, slot) : spread(5, 8, slot);
    var span = document.createElement("span");
    // A few yellow extract highlights, to check the frame does not fight them.
    if (slot % 11 === 4) span.className = "extractslocations";
    span.textContent = words(wordCount);
    line.appendChild(span);

    if (isDecoy(page, slot, index, options)) {
      line.setAttribute("data-lab-decoy", "line");
    }
  }

  // ---------------------------------------------------------------------------
  // Plain HTML flow (Word / HTML / Markdown-ish converters)
  // ---------------------------------------------------------------------------

  /**
   * Builds a single wrapping-text block. The passage is one long span that wraps
   * over many line boxes, so getClientRects() returns many fragments that must
   * collapse into a single frame.
   *
   * @param {object} options
   * @param {string} options.title
   * @param {string} options.id           passage id
   * @param {number} options.passageWords number of words in the passage
   */
  function buildFlow(options) {
    var container = document.createElement("div");
    container.className = "lab-flow customfulltext";

    container.appendChild(paragraph(words(70), true));
    container.appendChild(paragraph(words(60), true));

    var host = document.createElement("p");
    var lead = document.createElement("span");
    lead.textContent = words(6) + " ";
    host.appendChild(lead);

    var span = document.createElement("span");
    span.id = options.id;
    span.textContent = words(options.passageWords || 90);
    host.appendChild(span);

    var trail = document.createElement("span");
    trail.textContent = " " + words(5);
    host.appendChild(trail);
    container.appendChild(host);

    container.appendChild(paragraph(words(80), true));
    container.appendChild(paragraph(words(50), true));

    document.body.appendChild(container);
    pagination(1, 1);

    var passages = {};
    passages[options.id] = { blocks: 1, label: options.id };
    return { title: options.title, passages: passages };
  }

  function paragraph(text, decoy) {
    var p = document.createElement("p");
    p.textContent = text;
    if (decoy) p.setAttribute("data-lab-decoy", "paragraph");
    return p;
  }

  return {
    words: words,
    pagination: pagination,
    buildPdfPages: buildPdfPages,
    buildFlow: buildFlow,
    paragraph: paragraph
  };
})();
