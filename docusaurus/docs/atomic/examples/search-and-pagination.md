---
title: Search & pagination
sidebar_class_name: new
---

This recipe shows how to discover the query web service name from the app configuration, run a search with [`fetchQuery()`](../api/query.md), and page through the results.

## 1. Discover the query name with `fetchApp()`

`fetchQuery` needs a `name` (the query web service configured on the app). Don't hard-code it — read it from the app config.

- [`fetchApp()`](../api/app.md) → a `CCApp` object.
- `CCApp.queries` is a `Record<string, CCQuery>` (key = query name).
- `CCApp.defaultQueryName` gives the default query.

```js title="resolve-query-name.js"
import { fetchApp } from '@sinequa/atomic';

export async function resolveQueryName() {
  const app = await fetchApp();
  const names = Object.keys(app.queries ?? {});
  return app.defaultQueryName || names[0] || '';
}
```

## 2. Run a search with `fetchQuery()`

`fetchQuery(query)` posts to `/api/v1/query` and returns a `Result`:

- `result.records` — the documents (`Article[]`)
- `result.page`, `result.pageSize`, `result.rowCount` — the pagination state

```js title="run-search.js"
import { fetchQuery } from '@sinequa/atomic';

export async function search(name, text, page = 1, pageSize = 10) {
  const result = await fetchQuery({ name, text, page, pageSize });
  console.log(`${result.rowCount} hits — showing ${result.records.length}`);
  return result;
}
```

:::tip Drive pagination from the response, not from your request
The server may clamp the requested `pageSize`. Always compute the page math from `result.page` / `result.pageSize` / `result.rowCount` (the values the server actually used), so the UI stays consistent.
:::

### Paging helpers

Results are enriched with `nextPage` / `previousPage` (the page number, or `undefined` at the bounds):

```js
const result = await fetchQuery({ name, text, page: 2, pageSize: 10 });
result.previousPage; // 1
result.nextPage;     // 3 (or undefined on the last page)

const totalPages = Math.max(1, Math.ceil(result.rowCount / result.pageSize));
```

## 3. Bulk queries

`fetchBulkQuery()` runs several queries in parallel — handy for prefetching adjacent pages or running the same text against different query services.

```js title="bulk.js"
import { fetchBulkQuery } from '@sinequa/atomic';

const base = { name: '_query', text: 'tesla', pageSize: 10 };
const [page1, page2] = await fetchBulkQuery([
  { ...base, page: 1 },
  { ...base, page: 2 },
]);
```

## React: a `useSearch` hook + results component

The hook owns the request state and exposes a single `run(text, page, size)` entry point. Keeping the **searched** text separate from the **input** text means paging doesn't break when the user edits the box.

```jsx title="use-search.jsx"
import { useCallback, useEffect, useState } from 'react';
import { fetchApp, fetchQuery } from '@sinequa/atomic';

export function useSearch() {
  const [queryName, setQueryName] = useState('');
  const [result, setResult] = useState(null);
  const [searchedText, setSearchedText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Resolve the query web service name once.
  useEffect(() => {
    let cancelled = false;
    fetchApp()
      .then((app) => {
        if (cancelled) return;
        const names = Object.keys(app.queries ?? {});
        setQueryName(app.defaultQueryName || names[0] || '');
      })
      .catch(() => !cancelled && setError("Couldn't load the app configuration."));
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(
    async (text, page = 1, size = pageSize) => {
      if (!text.trim() || !queryName) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetchQuery({ name: queryName, text, page, pageSize: size });
        setResult(res);
        setSearchedText(text);
        setPageSize(size);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed.');
        setResult(null);
      } finally {
        setBusy(false);
      }
    },
    [queryName, pageSize],
  );

  return { queryName, result, searchedText, pageSize, busy, error, run, setPageSize };
}
```

```jsx title="SearchPage.jsx"
import { useState } from 'react';
import { useSearch } from './use-search';

export function SearchPage() {
  const { result, searchedText, pageSize, busy, error, run } = useSearch();
  const [text, setText] = useState('');

  const totalPages = result
    ? Math.max(1, Math.ceil(result.rowCount / result.pageSize))
    : 1;

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); run(text, 1); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search…" />
        <button type="submit" disabled={busy}>{busy ? 'Searching…' : 'Search'}</button>
        <select
          value={pageSize}
          onChange={(e) => run(searchedText || text, 1, Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </form>

      {error && <p role="alert">{error}</p>}

      {result && (
        <>
          <p>{result.rowCount} result(s)</p>
          <ul>
            {result.records.map((record) => (
              <li key={record.id}>
                <a href={record.originalUrl} target="_blank" rel="noreferrer">{record.title}</a>
                {record.relevantExtracts && (
                  // The backend returns <b>…</b> highlight markup. Sanitize if your sources aren't trusted.
                  <p dangerouslySetInnerHTML={{ __html: record.relevantExtracts }} />
                )}
              </li>
            ))}
          </ul>

          {result.rowCount > result.pageSize && (
            <div>
              <button disabled={busy || result.page <= 1} onClick={() => run(searchedText, result.page - 1)}>
                ← Previous
              </button>
              <span>Page {result.page} / {totalPages}</span>
              <button disabled={busy || result.page >= totalPages} onClick={() => run(searchedText, result.page + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## See also

- [Facets & filters](./facets-and-filters.md) — refine the same query with aggregations, tabs, sort and scope.
- [Document preview](./document-preview.md) — open a result in a preview panel.
- [Session & token management](./session-and-tokens.md) — wrap these calls so an expired session falls back to login.
