---
title: Document preview
sidebar_class_name: new
---

This recipe opens a document preview in a side panel, renders the cached HTML in an `<iframe>`, and builds a highlight legend with per-category counters from the structured data returned by [`fetchPreview()`](../api/preview.md).

## 1. Fetch preview data

`fetchPreview(id, query)` posts to `/api/v1/preview` and returns a `PreviewData`:

```ts
type PreviewData = {
  record: Article;                 // metadata (more complete than the search record)
  resultId: string;
  cacheId: string;
  highlightsPerCategory: HighlightDataPerCategory; // { [category]: CategoryHighlightData }
  highlightsPerLocation: HighlightDataPerLocation[]; // occurrences, ordered in the document
  documentCachedContentUrl: string; // ← the preview HTML URL (load in an <iframe>)
  conversions: Conversion[];
};
```

```js title="open-preview.js"
import { fetchPreview } from '@sinequa/atomic';

export async function openPreview(record, queryName, text) {
  const preview = await fetchPreview(record.id, { name: queryName, text });
  // preview.documentCachedContentUrl → URL to load in an <iframe>
  // preview.record                   → full metadata
  return preview;
}
```

:::tip Keep the preview same-origin
When the preview URL is served same-origin (e.g. via a dev proxy on `https://localhost:4200/...`), the **session cookie** is sent with the iframe request and the parent can read `iframe.contentDocument` (needed for highlight coloring/navigation). An **absolute** URL to the Sinequa server loads **cross-origin**: the cookie may not be sent (blank preview) and `contentDocument` is `null` (`SecurityError`).
:::

:::info Alternative: `fetchPreviewUrl()`
Prefer the iframe (it isolates the document's styles/scripts). If you need the raw HTML instead, [`fetchPreviewUrl(url)`](../api/preview.md) returns the cached document content as a string.
:::

## 2. A highlight legend (data-only, no iframe access)

`highlightsPerLocation` is already ordered by position in the document — ideal for a "3 / 47" counter and prev/next navigation. `highlightsPerCategory` groups the same hits by category for a legend.

```js title="legend-data.js"
export function legend(preview) {
  const total = preview.highlightsPerLocation.length;
  const categories = Object.entries(preview.highlightsPerCategory).map(([key, cat]) => ({
    key,
    label: cat.categoryDisplayLabelPlural || cat.categoryDisplayLabel,
    // occurrences of a category = sum of its values' locations
    count: cat.values.reduce((n, v) => n + v.locations.length, 0),
  }));
  return { total, categories };
}
```

## React: the preview panel

```jsx title="PreviewPanel.jsx"
import { useEffect, useState } from 'react';
import { fetchPreview } from '@sinequa/atomic';

export function PreviewPanel({ record, queryName, text, onClose }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Load whenever the selected record changes.
  useEffect(() => {
    if (!record) return;
    let cancelled = false;
    setPreview(null);
    setError(null);
    setBusy(true);
    fetchPreview(record.id, { name: queryName, text })
      .then((p) => !cancelled && setPreview(p))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Couldn't load the preview."))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
    };
  }, [record, queryName, text]);

  if (!record) return null;
  const doc = preview?.record ?? record;

  return (
    <aside role="dialog" aria-modal="true">
      <header>
        <h2>{doc.title}</h2>
        <button onClick={onClose} aria-label="Close">✕</button>
      </header>

      {/* Metadata — show only present fields */}
      <dl>
        {doc.authors?.length ? (<><dt>Authors</dt><dd>{doc.authors.join(', ')}</dd></>) : null}
        {doc.modified ? (<><dt>Modified</dt><dd>{new Date(doc.modified).toLocaleString()}</dd></>) : null}
        {doc.docformat ? (<><dt>Format</dt><dd>{doc.docformat}</dd></>) : null}
      </dl>

      {preview && <HighlightLegend preview={preview} />}

      {busy && <p>Loading preview…</p>}
      {error && <p role="alert">{error}</p>}
      {preview && (
        <iframe
          src={preview.documentCachedContentUrl}
          title="Document preview"
          style={{ width: '100%', height: '70vh', border: 0 }}
        />
      )}
    </aside>
  );
}

function HighlightLegend({ preview }) {
  const total = preview.highlightsPerLocation.length;
  if (!total) return null;
  const categories = Object.entries(preview.highlightsPerCategory);

  return (
    <div className="hl-legend">
      <span>{total} match(es)</span>
      <ul>
        {categories.map(([key, cat]) => {
          const count = cat.values.reduce((n, v) => n + v.locations.length, 0);
          return (
            <li key={key}>
              <span className="hl-swatch" data-cat={key} />
              {(cat.categoryDisplayLabelPlural || cat.categoryDisplayLabel)} : {count}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

:::note Category labels are i18n keys
`categoryDisplayLabel` / `categoryDisplayLabelPlural` are **translation keys** (e.g. `msg#metadata.companyPluralLabel`), not display-ready strings. The full SBA resolves them via its i18n bundle. Without that pipeline, map known keys (`company`, `person`, `geo`, `matchingpassages`, …) yourself.
:::

## Coloring & navigating inside the iframe (same-origin only)

On a Sinequa backend, each highlight in the preview HTML is marked with an element whose **CSS class is its category name** — exactly the keys of `highlightsPerCategory` (`.company`, `.geo`, `.person`, …). Build the selector from those keys, then inject a `<style>` to color them.

```js title="decorate-iframe.js"
const PALETTE = ['#6366f1', '#34d399', '#fbbf24', '#f472b6', '#38bdf8', '#fb923c'];

export function decorate(iframe, preview) {
  const fdoc = iframe.contentDocument;
  if (!fdoc) return; // null if cross-origin

  const catKeys = Object.keys(preview.highlightsPerCategory ?? {});
  const rules = catKeys
    .map((k, i) => `.${CSS.escape(k)}{background:${PALETTE[i % PALETTE.length]}55;border-radius:2px}`)
    .join('');
  const style = fdoc.createElement('style');
  style.textContent = rules + `.sqx-active{outline:2px solid #f43f5e}`;
  fdoc.head.appendChild(style);

  // Group markers by category for per-category prev/next navigation.
  const sel = catKeys.map((k) => '.' + CSS.escape(k)).join(',');
  const els = Array.from(fdoc.querySelectorAll(sel));
  const byCat = new Map();
  for (const el of els) {
    const cat = catKeys.find((k) => el.classList.contains(k));
    if (cat) (byCat.get(cat) ?? byCat.set(cat, []).get(cat)).push(el);
  }
  return byCat;
}
```

Wire `decorate` to the iframe's `onLoad`, and re-run it on every new document (re-scan markers, reset cursors).

## See also

- [Search & pagination](./search-and-pagination.md) — where the selected record comes from.
- [Preview API](../api/preview.md) — `fetchPreview()` / `fetchPreviewUrl()` reference.
