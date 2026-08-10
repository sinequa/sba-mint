---
title: Filters — from scratch to helpers
sidebar_class_name: new
---

`query.filters` is how you refine a search beyond the free-text query. A filter is just a **plain object** matching the `Filter` model — there is no hidden state and nothing to serialize yourself; the backend interprets the structure. This page explains that structure **by hand first** (so you understand exactly what gets sent), then shows the [`filter` helpers](../helpers/filters.md) that produce the same objects with less ceremony.

## The model

There are three kinds of nodes.

### 1. Leaf filters (a single condition on one field)

```ts
type Filter = {
  field?: string;
  operator?: FilterOperator; // defaults to 'eq'
  value?: string | number | boolean;
};
```

The `field` is an index column (often an aggregation's `column`). The `operator` is one of:

| Category | Operators |
|----------|-----------|
| Scalar | `eq` (default), `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `contains`, `regex`, `null`, `notnull` |
| Range | `in` (any of several values), `between` (start/end) |

Two operators have a distinct shape:

```ts
type InFilter      = { field: string; operator: 'in';      values: string[] };
type BetweenFilter = { field: string; operator: 'between'; start: string | number; end: string | number };
// `null` / `notnull` carry no value:
type NullFilter    = { field: string; operator: 'null' };
type NotNullFilter = { field: string; operator: 'notnull' };
```

### 2. Expression nodes (combine other filters)

```ts
type ExprFilter = {
  operator: 'and' | 'or' | 'not';
  filters: Filter[]; // nest leaves AND/OR other expression nodes
};
```

### 3. What `query.filters` accepts

A single leaf, an **array of leaves** (implicitly AND-ed), or an `ExprFilter` tree:

```ts
filters?: Filter | Filter[] | ExprFilter;
```

## Building filters by hand

Seeing the raw objects is the best way to understand what travels to the backend.

```js title="filters-by-hand.js"
import { fetchQuery } from '@sinequa/atomic';

// 1. A single condition: author = "alice"
await fetchQuery({ name: '_query', filters: { field: 'authors', value: 'alice' } });

// 2. An explicit operator: size > 1000
await fetchQuery({ name: '_query', filters: { field: 'size', operator: 'gt', value: 1000 } });

// 3. Several conditions, implicitly AND-ed (array form):
await fetchQuery({
  name: '_query',
  filters: [
    { field: 'authors', value: 'alice' },
    { field: 'language', value: 'en' },
  ],
});

// 4. Any of several values for one field — use `in` (NOT several `eq`):
await fetchQuery({
  name: '_query',
  filters: { field: 'docformat', operator: 'in', values: ['pdf', 'doc', 'ppt'] },
});

// 5. A numeric or date range:
await fetchQuery({
  name: '_query',
  filters: { field: 'modified', operator: 'between', start: '2024-01-01', end: '2024-12-31' },
});

// 6. Existence:
await fetchQuery({ name: '_query', filters: { field: 'company', operator: 'notnull' } });
```

### Complex filters by hand

Combine nodes with `and` / `or` / `not`. The value of `filters` on an expression node is itself an array of filters, so trees nest arbitrarily.

```js title="complex-by-hand.js"
// size > 1000  AND  ( treepath under /HR/*  OR  author = "alice" )
const filters = {
  operator: 'and',
  filters: [
    { field: 'size', operator: 'gt', value: 1000 },
    {
      operator: 'or',
      filters: [
        { field: 'treepath', value: '/HR/*' },
        { field: 'authors', value: 'alice' },
      ],
    },
  ],
};

// language = "en"  AND  NOT (docformat in [pdf, doc])
const exclude = {
  operator: 'and',
  filters: [
    { field: 'language', value: 'en' },
    {
      operator: 'not',
      filters: [{ field: 'docformat', operator: 'in', values: ['pdf', 'doc'] }],
    },
  ],
};
```

This is correct and fully explicit — but verbose, and easy to mistype (`operator` strings, nested `filters` arrays). Conditional filters (only add a condition when some UI toggle is on) force `if`/`push` plumbing.

## The same, with the `filter` helpers

The library exports a [`filter`](../helpers/filters.md) object whose methods return exactly the objects above. The combinators (`and` / `or` / `not`) additionally **ignore falsy operands** and **collapse trivial cases** (0 operands → `undefined`, 1 → the operand itself), which removes most of the plumbing.

:::note `filter` is a stateless namespace, not a builder
`filter` is an object of pure functions — each call returns a **new** plain object and accumulates nothing. `filter.eq('authors', 'alice')` then `filter.eq('authors', 'fred')` yields two independent objects; `filter` itself is unchanged. The "current filter" is the variable you keep — you assemble conditions explicitly with the combinators. See [How it works](../helpers/filters.md#how-it-works-a-stateless-namespace).
:::

```js title="with-helpers.js"
import { fetchQuery, filter } from '@sinequa/atomic';

// 1–6 from above:
filter.eq('authors', 'alice');
filter.gt('size', 1000);
filter.in('docformat', ['pdf', 'doc', 'ppt']);
filter.between('modified', '2024-01-01', '2024-12-31');
filter.isNotNull('company');

// Complex tree — reads like the requirement:
const filters = filter.and(
  filter.gt('size', 1000),
  filter.or(
    filter.eq('treepath', '/HR/*'),
    filter.eq('authors', 'alice'),
  ),
);

await fetchQuery({ name: '_query', text: 'report', filters });
```

### Side by side

```js title="without vs with"
// WITHOUT helpers
const a = {
  operator: 'and',
  filters: [
    { field: 'language', value: 'en' },
    { operator: 'not', filters: [{ field: 'docformat', operator: 'in', values: ['pdf', 'doc'] }] },
  ],
};

// WITH helpers — same object, fewer moving parts
import { filter } from '@sinequa/atomic';
const b = filter.and(
  filter.eq('language', 'en'),
  filter.not(filter.in('docformat', ['pdf', 'doc'])),
);
```

### Conditional composition (where helpers really pay off)

Because the combinators drop falsy operands, you can inline conditions straight from UI state — no `if`, no intermediate array:

```js title="conditional.js"
import { filter } from '@sinequa/atomic';

function buildFilters({ language, onlyRecent, formats }) {
  return filter.and(
    language && filter.eq('language', language),
    onlyRecent && filter.gte('modified', '2024-01-01'),
    formats?.length && filter.in('docformat', formats),
  );
  // If nothing is active → returns undefined (no filtering).
  // If exactly one is active → returns that single leaf (no needless `and` wrapper).
}
```

## React: facet selections → a filter tree

A typical facet panel keeps a flat list of selected leaves and rebuilds the tree on every change. Group multiple values of the **same** field into an `in` (OR within a facet), then AND the fields together.

```jsx title="use-facet-filters.jsx"
import { useCallback, useState } from 'react';
import { filter } from '@sinequa/atomic';

export function useFacetFilters() {
  // selected = array of { field, value }
  const [selected, setSelected] = useState([]);

  const toggle = useCallback((field, value) => {
    setSelected((prev) => {
      const exists = prev.some((s) => s.field === field && s.value === value);
      return exists
        ? prev.filter((s) => !(s.field === field && s.value === value))
        : [...prev, { field, value }];
    });
  }, []);

  // Build the ExprFilter from the flat selection.
  const filters = buildFilters(selected);

  return { selected, toggle, filters };
}

function buildFilters(selected) {
  // Group values by field.
  const byField = new Map();
  for (const { field, value } of selected) {
    byField.set(field, [...(byField.get(field) ?? []), value]);
  }
  // One node per field: `in` when several values, else a single `eq`.
  const perField = [...byField.entries()].map(([field, values]) =>
    values.length > 1 ? filter.in(field, values.map(String)) : filter.eq(field, values[0]),
  );
  // AND the fields together (helper collapses 0/1 cases for us).
  return filter.and(...perField);
}
```

```jsx title="usage.jsx"
import { fetchQuery } from '@sinequa/atomic';
import { useFacetFilters } from './use-facet-filters';

function Search({ queryName, text }) {
  const { toggle, filters } = useFacetFilters();

  async function run() {
    const result = await fetchQuery({ name: queryName, text, filters, page: 1 });
    // …render result…
  }
  // wire `toggle(agg.column, item.value)` to your facet checkboxes
}
```

:::tip Tree (treepath) facets
A tree facet selects a **path pattern**, not a raw value: `filter.eq('treepath', '/HR/Payroll/*')`. See [Facets & filters › Tree facets](./facets-and-filters.md#tree-facets-hierarchical).
:::

## Legacy filtering

:::caution `query.select` and `LegacyFilter` are the legacy API
Older code filtered via `query.select` (expressions like `` column:`value` ``) or `LegacyFilter` objects. Both are **still accepted** by `query.filters` for backward compatibility, but the structured `Filter` model (and the `filter` helpers) is the recommended approach. `LegacyFilter` support will be removed in a future major version.
:::

## See also

- [`filter` helper reference](../helpers/filters.md) — every method, signature, and return shape.
- [Facets & filters](./facets-and-filters.md) — wiring filters to aggregations, tabs, sort, scope, and tree facets.
- [Search & pagination](./search-and-pagination.md) — the query loop these filters plug into.
