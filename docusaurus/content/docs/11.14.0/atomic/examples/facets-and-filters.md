---
title: Facets & filters
sidebar_class_name: new
---

A `Result` from [`fetchQuery()`](../api/query.md) carries more than documents: it also embeds **aggregations** (facets), **tabs**, and the current **sort**. This recipe shows how to display facets and refine the query with structured `filters`, tabs, sort, scope, and tree facets.

## The general pattern

Keep the current `Query` in state, **patch one field** (`filters`, `tab`, `sort`, `scope`), reset to **page 1**, and call `fetchQuery` again. The returned `Result` reflects the real state (selected tab/sort, recomputed facet counts).

```js title="execute.js"
import { fetchQuery } from '@sinequa/atomic';

// A single entry point that merges a patch into the current query.
export function makeExecutor(getCurrentQuery, setResult) {
  return async function execute(overrides = {}) {
    const next = { ...getCurrentQuery(), ...overrides };
    // Any refinement (filters/tab/sort/scope) restarts at page 1; paging passes its own page.
    if (overrides.page === undefined) next.page = 1;
    const result = await fetchQuery(next);
    setResult(result);
    return result;
  };
}
```

## Reading aggregations

```js
// result.aggregations: (Aggregation | TreeAggregation)[]
for (const agg of result.aggregations) {
  console.log(agg.name, agg.column); // key + underlying index column
  for (const item of agg.items) {
    console.log(item.display ?? item.value, item.count, item.$selected);
  }
}
```

## Filtering with `query.filters`

The current way to filter is `query.filters` — structured `Filter` objects (not the legacy `select` expressions). The `field` is the aggregation's `column`; the `value` is the item's value.

:::tip Dedicated guide
This section focuses on turning **facet selections** into filters. For the full filter model (operators, ranges, `and`/`or`/`not` trees) — explained **by hand first, then with the `filter` helpers** — see [Filters — from scratch to helpers](./filters.md).
:::

The example below builds filters manually to show the raw shape. The same logic with helpers is one line: `filter.and(...selectedLeaves)` — see the [filter reference](../helpers/filters.md).

```js title="build-filters.js"
// One leaf filter per selection: { field, value }.
// ⚠️ TREE aggregation (agg.isTree): the value must be a path pattern `/<path>/*`.
export function facetValue(agg, item) {
  if (agg.isTree) {
    const path = String(item.$path ?? item.value ?? '');
    return `/${path.replace(/^\/+|\/+$/g, '')}/*`;
  }
  return String(item.value);
}

export function filterFor(agg, item) {
  return { field: agg.column, value: facetValue(agg, item) };
}

// Combine selections: group values of the same field into an `in` filter (OR),
// then AND the fields together.
export function buildFilters(selected) {
  if (selected.length === 0) return undefined;
  if (selected.length === 1) return selected[0];

  const byField = new Map();
  for (const f of selected) {
    const list = byField.get(f.field) ?? [];
    list.push(String(f.value));
    byField.set(f.field, list);
  }
  const perField = [...byField.entries()].map(([field, values]) =>
    values.length > 1 ? { field, operator: 'in', values } : { field, value: values[0] },
  );
  return perField.length === 1 ? perField[0] : { operator: 'and', filters: perField };
}
```

:::tip Filter building blocks
- `{ field, value }` — equality (default operator `eq`).
- `{ field, operator: 'in', values: [...] }` — several values for one field (OR).
- `{ operator: 'and' | 'or' | 'not', filters: [...] }` — combine nodes.
- Scalar operators on a leaf: `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `contains`, `regex`, `null`, `notnull`.
- Ranges: `{ field, operator: 'between', start, end }`.
:::

:::caution `query.select` is the legacy API
Expressions like `` column:`value` `` still work, but `query.filters` (structured `Filter` objects) is the recommended approach today.
:::

## "Show more" on a facet: the `aggregate` action

An aggregation returns a limited number of values. To load more, re-run the **same query** with `action: 'aggregate'` and `aggregations: { [name]: { skip, count } }`, then **append** the returned values.

```js title="load-more.js"
import { fetchQuery } from '@sinequa/atomic';

export async function loadMore(currentQuery, agg, count = 10) {
  const skip = agg.items?.length ?? 0;
  const res = await fetchQuery({
    ...currentQuery,
    action: 'aggregate',
    aggregations: { [agg.name]: { skip, count } }, // key = aggregation NAME
  });
  const more = res.aggregations.find((a) => a.name === agg.name);
  const newItems = more?.items ?? [];
  return { newItems, hasMore: newItems.length >= count };
}
```

:::info `fetchAggregation()` ≠ "show more"
[`fetchAggregation(aggregation, query)`](../api/aggregations.md) *retrieves* an aggregation's values; it does not paginate a facet already shown. For "show more", re-run the query with `action: 'aggregate'` as above.
:::

## Tabs, sort, and scope

```js
// Tabs: result.tabs is Tab[] = { name, display, value, count }
execute({ tab: 'documents' });

// Sort: query.sort = '<sorting choice name>' (CCSortingChoice, defined on the app)
execute({ sort: 'date' });

// Scope: query.scope = '<scope name>' (CCScope) restricts the searched perimeter
execute({ scope: 'intranet' });
```

Changing a tab **resets pagination** — restart at page 1 (the `execute` helper above does this automatically).

## React: a facet panel

```jsx title="Facets.jsx"
export function Facets({ result, selected, onToggle }) {
  const isSelected = (agg, item) =>
    selected.some((f) => f.field === agg.column && String(f.value) === String(item.value));

  return (
    <div className="facets">
      {result.aggregations.map((agg) => (
        <section key={agg.name}>
          <h3>{agg.name}</h3>
          <ul>
            {agg.items.map((item) => (
              <li key={String(item.value)}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected(agg, item)}
                    onChange={() => onToggle(agg, item)}
                  />
                  {item.display ?? String(item.value)} ({item.count})
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

```jsx title="wiring.jsx"
import { useState } from 'react';
import { fetchQuery } from '@sinequa/atomic';
import { buildFilters, filterFor } from './build-filters';
import { Facets } from './Facets';

export function FacetedSearch({ query, result, setResult }) {
  const [selected, setSelected] = useState([]);

  async function onToggle(agg, item) {
    const f = filterFor(agg, item);
    const exists = selected.some((p) => p.field === f.field && p.value === f.value);
    const next = exists
      ? selected.filter((p) => !(p.field === f.field && p.value === f.value))
      : [...selected, f];
    setSelected(next);
    setResult(await fetchQuery({ ...query, filters: buildFilters(next), page: 1 }));
  }

  return result ? <Facets result={result} selected={selected} onToggle={onToggle} /> : null;
}
```

## Tree facets (hierarchical)

A `isTree` aggregation (e.g. `treepath`) has nested `TreeAggregationNode` items. Children load on demand via the `open` action. Selecting a node uses a single `{ field, value: '/<path>/*' }` filter (single selection per tree field).

```js title="open-node.js"
import { fetchQuery } from '@sinequa/atomic';

export async function openNode(currentQuery, agg, node) {
  const path = String(node.$path ?? node.value).replace(/^\/+|\/+$/g, '');
  const res = await fetchQuery({
    ...currentQuery,
    action: 'open',
    // ⚠️ Wrap the path in BACKTICKS — it may contain spaces.
    open: [{ aggregation: agg.name, expression: `${agg.column}:\`/${path}/*\`` }],
  });
  // The response returns the full tree from the root, with the opened node's `items` populated.
  return res.aggregations.find((a) => a.name === agg.name);
}
```

:::caution Backticks are mandatory around the tree path
`` treepath:`/Documentation/Admin Interface/*` `` — without them, a path containing spaces breaks the query.
:::

## See also

- [Search & pagination](./search-and-pagination.md) — the base query loop these refinements plug into.
- [Aggregations API](../api/aggregations.md) — `fetchAggregation()` reference.
