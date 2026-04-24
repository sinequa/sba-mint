document.addEventListener('DOMContentLoaded', function () {
  var TRUSTED_ORIGINS = ['http://localhost:4200', 'https://localhost:4200', window.origin];
  var parentOrigin = '*';
  var styleElement;
  var fitFactor = null;
  var passageHighlighter;

  window.addEventListener('message', receiveMessage);

  var bodyElement = document.body;
  if (bodyElement === null || bodyElement.tagName == 'FRAMESET') {
    bodyElement = document.querySelector('frameset>frame').contentDocument.body;
  }

  zoomFit();

  // Wait for paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // DOM is painted now
      setTimeout(() => {
        setSvgBackgroundPositionAndSize();
        returnMessage('ready');

        // retrieve the current page from the hash or use the default page
        const total = window.lastPage;
        if (window.location.hash) {
          const hash = window.location.hash.substring(1);
          const current = parseInt(hash, 10);
          returnMessage('page-info', { total, current });
        } else {
          const current = window.defPage;
          returnMessage('page-info', { total, current });
        }
      }, 500);
    });
  });

  // will contain the worker instance if it is supported
  var worker;
  var isWorkerSupported = false;

  // ----------------------
  // Zoom helpers
  // ----------------------
  function zoomFit() {
    if (fitFactor) {
      zoom(fitFactor);
      return;
    }

    let body = document.body;
    if (body === null || body.tagName == 'FRAMESET') {
      body = document.querySelector('frameset>frame').contentDocument.body;
    }
    const width = body.getBoundingClientRect().width;

    // select only span if div, img or table are not present
    let elements = body.querySelectorAll('div, img, table');
    if (!elements.length) {
      elements = body.querySelectorAll('span');
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
    if (!appname) console.error('appname is required');

    isWorkerSupported = false;

    if (window.Worker) {
      // Use an absolute URL for the worker.js file
      const path = window.origin.includes('localhost:4200') ? `${window.origin}/assets/worker.js` : `${window.origin}/app/${appname}/assets/worker.js`;

      try {
        worker = new Worker(path);

        worker.onmessage = function (event) {
          window.parent.postMessage(
            {
              type: 'get-html-results-webworker',
              data: event.data,
              url: window.location.href
            },
            parentOrigin
          );
        };

        worker.onerror = function (error) {
          console.error('Error from worker:', error);
        };

        console.log('Web Worker is supported');
        isWorkerSupported = true;
      } catch (error) {
        console.error('Error creating worker:', error);
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
      case 'init':
        init(event.origin, data.highlights);
        createWorker(data.appname);
        break;
      case 'get-html': {
        const html = getHtml(data.ids);
        returnMessage('get-html-results', html);
        break;
      }
      case 'get-html-webworker': {
        const html = getHtml(data.ids);
        // if worker cannot be created, use the "get-html" method instead
        if (!isWorkerSupported) {
          returnMessage('get-html-results', html);
        } else {
          worker.postMessage({ id: data.id, extracts: html, previewData: data.previewData });
        }
        break;
      }
      case 'get-text':
        getText(data.ids);
        break;
      case 'get-positions':
        getPositions(data.highlight);
        break;
      case 'highlight':
        highlight(data.highlights);
        break;
      case 'select':
        select(data.id, data.usePassageHighlighter);
        break;
      case 'unselect':
        unselect();
        break;

      // ---- zoom ----
      case 'zoom-in': {
        bodyElement = document.body;
        if (bodyElement === null || bodyElement.tagName == 'FRAMESET') {
          bodyElement = document.querySelector('frameset>frame').contentDocument.body;
        }
        var factor = parseFloat(bodyElement.style.getPropertyValue('--factor') || 1);
        var max = Math.min(3, factor + 0.2);
        zoom(max);
        break;
      }

      case 'zoom-out': {
        bodyElement = document.body;
        if (bodyElement === null || bodyElement.tagName == 'FRAMESET') {
          bodyElement = document.querySelector('frameset>frame').contentDocument.body;
        }
        var factor = parseFloat(bodyElement.style.getPropertyValue('--factor') || 1);
        var min = Math.max(0.2, factor - 0.2);
        zoom(min);
        break;
      }

      case 'zoom-fit':
        zoomFit();
        break;

      case 'toggle-description':
        // if data.show is true, show the description
        // just set a new value to the css variable --desc-display
        document.documentElement.style.setProperty('--desc-display', data.show ? 'inline-block' : 'none');
        break;

      // ---- pagination ----
      case 'goto-page':
        {
          if (!data || !data.page) return;
          pg = data.page;
          SetPage(pg);
          Go();
        }
        break;

      case 'next-page':
        GoN();
        break;

      case 'prev-page':
        GoP();
        break;

      case 'first-page':
        GoF();
        break;

      case 'last-page':
        GoL();
        break;

      default:
        break;
    }
  }

  function zoom(value) {
    let bodyElement = document.body;
    if (bodyElement === null || bodyElement.tagName == 'FRAMESET') {
      bodyElement = document.querySelector('frameset>frame').contentDocument.body;
    }
    bodyElement.style.setProperty('--factor', value);
  }

  function returnMessage(type, data) {
    parent.postMessage({ type: type, data: data, url: window.location.href }, parentOrigin);
    // in case of nested iframes (frameset)
    parent?.parent.postMessage({ type: type, data: data, url: window.location.href }, parentOrigin);
  }

  function init(origin, highlights) {
    parentOrigin = origin;
    passageHighlighter = document.createElement('div');
    passageHighlighter.id = 'sq-passage-highlighter';
    passageHighlighter.style.position = 'absolute';
    passageHighlighter.style.display = 'none';
    document.body.appendChild(passageHighlighter);
    document.addEventListener('mouseup', function () {
      return setTimeout(function () {
        return onMouseUp();
      });
    });
    document.addEventListener('mousemove', function (e) {
      return onMouseMove(e);
    });
    document.addEventListener('click', function (e) {
      // add a click listener to toggle the class "screenshot-extended" for "sq-mediav2-screenshot"
      // if we click on a screenshot for a converted video preview
      e.stopImmediatePropagation();
      var parentElement = e.target?.parentElement;
      if (!!parentElement && parentElement.classList?.contains("sq-mediav2-screenshot")) {
        parentElement.classList.toggle("screenshot-extended");
      }
    });
    var pages = document.querySelectorAll('[id^="sq-page-start"]');
    window.addEventListener('scroll', function () {
      if (pages?.length) {
        let index = 0;
        let found = false;
        pages.forEach(page => {
          if (!found) {
            if (isElementInViewport(page)) {
              found = true;
              returnMessage('current-page', page.id);
            }
            index++;
          }
        });
      }
      return returnMessage('scroll', { x: window.scrollX, y: window.scrollY });
    });
    if (highlights) {
      highlight(highlights);
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

    const bodyElement = document.body;
    if (bodyElement === null || bodyElement.tagName == 'FRAMESET') {
      const frameDocument = document.querySelector('frameset>frame').contentDocument;
      styleElement = frameDocument.createElement('style');
      frameDocument.head.appendChild(styleElement);
    } else {
      styleElement = document.createElement('style');
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = highlights
      .map(function (highlight) {
        return `
          span.${highlight.name} {
              color: ${highlight.color || 'black'};
              background-color: ${highlight.bgColor || 'yellow'};
          }
          tspan.${highlight.name} {
              fill: ${highlight.color || 'black'};
          }
          rect.${highlight.name} {
              fill: ${highlight.bgColor || 'yellow'};
          }
      `;
      })
      .join('');
  }

  function select(id, usePassageHighlighter) {
    if (usePassageHighlighter === void 0) {
      usePassageHighlighter = false;
    }
    unselect();
    var elements = Array.from(getElementsById(id));
    var visibleElements = elements.filter(function (el) {
      var box = el.getBoundingClientRect();
      return box.width && box.height;
    });

    const el = elements.length > 0 ? visibleElements[0] || elements[0] : null;
    if (el) {
      // container: 'nearest' stops scroll propagation to it's nearest parent.
      // This will stop the application body page from automatically scrolling
      // back to the top after you have navigated through the preview.
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#container
      el.scrollIntoView({
        block: 'center',
        behavior: 'instant',
        container: 'nearest'
      });

      setTimeout(() => {
        if (usePassageHighlighter && visibleElements.length > 0) {
          selectPassage(visibleElements);
        } else if (elements.length > 0) {
          selectHighlight(elements);
        }
      }, 400);
    }
    if (visibleElements.length > 0) {
      returnMessage('selected-position', getVerticalPositions(visibleElements)[0]);
    }
  }

  function selectPassage(elements) {
    if (!passageHighlighter) {
      passageHighlighter = document.getElementById('sq-passage-highlighter');
      if (!passageHighlighter) {
        passageHighlighter = document.createElement('div');
        passageHighlighter.id = 'sq-passage-highlighter';
        passageHighlighter.style.position = 'absolute';
        passageHighlighter.style.display = 'none';
        document.body.appendChild(passageHighlighter);
      }
    }
    passageHighlighter.style.display = 'none';
    for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
      var el = elements_1[_i];
      el.classList.add('sq-highlighted');
    }
  }

  function selectPassage2(elements) {
    passageHighlighter.style.display = 'none';
    elements[0].style.position = 'relative';
    elements[0].style.display = 'inline-block';
    elements[0].append(passageHighlighter);
    passageHighlighter.style.top = 0;
    passageHighlighter.style.left = 0;
    passageHighlighter.style.width = '100%';
    passageHighlighter.style.height = '100%';
    passageHighlighter.style.zIndex = '1';
    passageHighlighter.style.display = 'block'; // var box = getBoundingBox(elements);
  }

  function selectHighlight(elements) {
    elements.forEach(function (el, i) {
      var first = i === 0;
      var last = i === elements.length - 1;
      if (el instanceof SVGElement) {
        selectHighlightSVG(el, first, last);
      } else {
        el.classList.add('sq-current');
        if (first) el.classList.add('sq-first');
        if (last) el.classList.add('sq-last');
      }
    });
  }

  function unselect() {
    removeAllClasses('sq-highlighted');
    removeAllClasses('sq-current');
    removeAllClasses('sq-first');
    removeAllClasses('sq-last');
    removeAllElements('svg line.sq-svg');
    if (passageHighlighter) {
      passageHighlighter.style.display = 'none';
    }
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
    returnMessage('get-text-results', data);
  }

  function getPositions(highlight) {
    var allHighlights = Array.from(document.querySelectorAll('span.'.concat(highlight, ',tspan.').concat(highlight)));
    var data = getVerticalPositions(allHighlights);
    returnMessage('get-positions-results', data);
  }

  function onMouseUp() {
    var selection = document.getSelection();
    var selectedText = selection ? selection.toString().trim() : '';
    if (selection && selectedText) {
      var range = selection.getRangeAt(0);
      var position = range.getBoundingClientRect();
      returnMessage('text-selection', {
        selectedText: selectedText,
        position: position
      });
    } else {
      returnMessage('text-selection');
    }
  }

  var currentId;

  function onMouseMove(event) {
    var el = event.target;
    if (el.attributes['data-entity-display'] && el.id !== currentId) {
      currentId = el.id;
      returnMessage('highlight-hover', {
        id: el.id,
        position: el.getBoundingClientRect()
      });
    } else if (currentId && el.id !== currentId) {
      currentId = undefined;
      returnMessage('highlight-hover');
    }
  }

  function setSvgBackgroundPositionAndSize() {
    document.querySelectorAll('svg').forEach(function (svg) {
      svg.querySelectorAll('tspan').forEach(function (tspan) {
        var bgId = tspan.getAttribute('data-entity-background');
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

    rect.setAttribute('x', String(firstCharRect.x - deltaX));
    rect.setAttribute('y', String(firstCharRect.y - deltaY));
    rect.setAttribute('width', String(tspanWidth + 2 * deltaX));
    rect.setAttribute('height', String(textBoxSVG.height + 2 * deltaY));

    var valueTransform = text.getAttribute('transform');
    if (valueTransform) rect.setAttribute('transform', valueTransform);
  }

  function selectHighlightSVG(elt, isFirst, isLast) {
    var bgId = elt.getAttribute('data-entity-background');
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
      var valueTransform = rect.getAttribute('transform');
      addSvgLine(group, left, top_2, right, top_2, valueTransform);
      addSvgLine(group, left, bottom, right, bottom, valueTransform);
      if (isFirst) addSvgLine(group, left, top_2, left, bottom, valueTransform);
      if (isLast) addSvgLine(group, right, top_2, right, bottom, valueTransform);
    }
  }

  function addSvgLine(group, x1, y1, x2, y2, transform) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'sq-svg');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    if (transform) line.setAttribute('transform', transform);
    group.appendChild(line);
  }

  function getElementsById(id) {
    // Prefer current document, fallback to first frame if not found
    let elements = document.querySelectorAll('#' + id);
    if (elements.length === 0 && frames.length > 0) {
      try {
        elements = frames[0].document.querySelectorAll('#' + id);
      } catch (e) {
        // Ignore cross-origin frame access errors
      }
    }
    return elements;
  }

  function getHighlightTextById(id) {
    var text = '';
    getElementsById(id).forEach(function (n) {
      return (text += n.textContent + ' ');
    });
    return text;
  }

  function getHighlightHtmlById(id) {
    var html = '';
    getElementsById(id).forEach(function (n) {
      return (html += n.innerHTML + ' ');
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
          .join(' ');
        var type = id.substring(0, id.lastIndexOf('_'));
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
    var selected = bodyElement.querySelectorAll('.'.concat(classname));
    selected.forEach(function (el) {
      return el.classList.remove(classname);
    });
  }

  function removeAllElements(selector) {
    bodyElement.querySelectorAll(selector).forEach(function (e) {
      return e.remove();
    });
  }

  function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}
});
