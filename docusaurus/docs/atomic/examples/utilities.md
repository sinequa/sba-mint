---
title: Utilities
sidebar_class_name: new
---

Small, focused helpers that show up across a Sinequa app: relative dates, query-param (de)serialization for shareable URLs, metadata extraction, and a few string/array helpers. Each is framework-agnostic; the React snippets show idiomatic wiring.

## Relative dates: `getRelativeDate()`

Formats the distance between two dates as a localized, human-readable string (via `Intl.RelativeTimeFormat`). If `base` is omitted, "now" is used.

```js title="relative-date.js"
import { getRelativeDate, getOffsetFromDates } from '@sinequa/atomic';

getRelativeDate('en', '2026-06-07T00:00:00Z'); // e.g. "in 7 days"
getRelativeDate('fr', '2026-05-24T00:00:00Z'); // e.g. "il y a 7 jours"

// Need the raw numbers instead of a string?
getOffsetFromDates('2026-06-07T00:00:00Z'); // { offset: 7, unit: 'day', isFuture: true }
```

```jsx title="RelativeTime.jsx"
import { getRelativeDate } from '@sinequa/atomic';

export function RelativeTime({ date, locale = 'en' }) {
  if (!date) return null;
  return <time dateTime={date} title={new Date(date).toLocaleString(locale)}>
    {getRelativeDate(locale, date)}
  </time>;
}

// <RelativeTime date={record.modified} locale="fr" />
```

## Shareable search URLs: query params

Serialize a search state into a query string and parse it back — useful for deep links, bookmarks, and browser history.

```js title="query-params.js"
import { getUrlParamsFromQueryParams, getQueryParamsFromUrl } from '@sinequa/atomic';

// Serialize → "q=example&p=1&s=relevance&t=results&n=_query"
const qs = getUrlParamsFromQueryParams({
  text: 'example',
  page: 1,
  sort: 'relevance',
  tab: 'results',
  name: '_query',
  filters: [{ field: 'type', value: 'document' }],
});

// Parse back from a full URL
const params = getQueryParamsFromUrl(`${location.pathname}?${qs}`);
// → { text: 'example', page: 1, sort: 'relevance', tab: 'results', name: '_query', filters: [...] }
```

```jsx title="use-url-sync.jsx"
import { useEffect } from 'react';
import { getUrlParamsFromQueryParams, getQueryParamsFromUrl } from '@sinequa/atomic';

// Reflect the current search into the URL, and hydrate from it on mount.
export function useUrlSync(queryParams, onHydrate) {
  // Hydrate once from the address bar.
  useEffect(() => {
    const parsed = getQueryParamsFromUrl(window.location.href);
    if (parsed) onHydrate(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push state changes into the URL (without a full navigation).
  useEffect(() => {
    if (!queryParams) return;
    const qs = getUrlParamsFromQueryParams(queryParams);
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    window.history.replaceState(null, '', next);
  }, [queryParams]);
}
```

## Extracting metadata: `getMetadata()`

Normalizes a record field into a `string[]`, whatever its underlying shape — a comma-separated string, an array of strings, or an array of `{ display }` objects.

```js title="metadata.js"
import { getMetadata } from '@sinequa/atomic';

getMetadata({ tags: 'foo,bar' }, 'tags');                 // ['foo', 'bar']
getMetadata({ tags: ['foo', 'bar'] }, 'tags');            // ['foo', 'bar']
getMetadata({ authors: [{ display: 'Alice' }] }, 'authors'); // ['Alice']
getMetadata({ title: 'Hello' }, 'title');                 // ['Hello']
getMetadata({}, 'missing');                               // []
```

```jsx title="MetaList.jsx"
import { getMetadata } from '@sinequa/atomic';

// Render any record field as a list of chips, regardless of its raw format.
export function MetaList({ record, field }) {
  const values = getMetadata(record, field);
  if (!values.length) return null;
  return (
    <ul className="chips">
      {values.map((v) => <li key={v} className="chip">{v}</li>)}
    </ul>
  );
}

// <MetaList record={record} field="authors" />
```

## String & expression helpers

```js title="strings.js"
import { escapeExpr, guid } from '@sinequa/atomic';

// Escape a value before injecting it into a fielded expression (handles quotes/backticks).
const expr = `author:\`${escapeExpr(userInput)}\``;

// Generate a unique id (with or without hyphens) — handy for keys, request ids, etc.
guid();       // "3f2504e0-4f89-41d3-9a0c-0305e82c3301"
guid(false);  // "3f2504e04f8941d39a0c0305e82c3301"
```

## Partitioning arrays: `bisect()`

Splits an array into two groups by a predicate, in a single pass: matching items land in `true`, the rest in `false`.

```js title="bisect.js"
import { bisect } from '@sinequa/atomic';

const { true: even, false: odd } = bisect([1, 2, 3, 4], (n) => n % 2 === 0);
// even → [2, 4], odd → [1, 3]
```

```jsx title="SelectedAndRest.jsx"
import { bisect } from '@sinequa/atomic';

// Show selected facet items first, the rest below.
export function FacetItems({ items }) {
  const { true: selected, false: rest } = bisect(items, (i) => i.$selected);
  return (
    <>
      {selected.map((i) => <Item key={String(i.value)} item={i} selected />)}
      {rest.map((i) => <Item key={String(i.value)} item={i} />)}
    </>
  );
}
```

## See also

- [Date utils](../utils/date.md) · [Query params](../utils/query-params.md) · [bisect](../utils/bisect.md)
- [Helpers](../helpers/getMetadata.md) — `getMetadata`, `escapeExpr`, `guid`, and more.
