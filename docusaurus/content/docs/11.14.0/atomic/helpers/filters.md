---
title: filter
sidebar_class_name: new
---

The `filter` object groups small builder functions that return structured `Filter` objects for `query.filters`. They produce plain objects matching the `Filter` model — there is nothing to serialize yourself; the backend interprets the result.

For a conceptual walkthrough (building filters by hand vs. with these helpers), see [Filters — from scratch to helpers](../examples/filters.md).

## How it works: a stateless namespace

`filter` is an **object** (a namespace of functions), **not a function** and **not a stateful builder**. Two consequences follow.

**1. You call its methods — you never call `filter` itself.**

```typescript
filter.eq('authors', 'alice'); // ✅
filter('authors', 'alice');    // ❌ TypeError: filter is not a function
```

**2. Every method is pure: it returns a brand-new plain object and stores nothing.**

There is no internal list that accumulates conditions. Calling a method twice produces two independent objects; `filter` itself never changes.

```typescript
const a = filter.eq('authors', 'alice');
const b = filter.eq('authors', 'fred');

// a === { field: 'authors', operator: 'eq', value: 'alice' }
// b === { field: 'authors', operator: 'eq', value: 'fred' }
// `filter` retained nothing about either call.
```

The "current filter" lives in **the variable you keep**, not in `filter`. To combine conditions you assemble them explicitly with the [combinators](#combinators) (or hold the leaves in your own array / state and rebuild the tree):

```typescript
// authors = alice OR authors = fred → prefer `in` for one field:
filter.in('authors', ['alice', 'fred']);
// or, explicitly:
filter.or(filter.eq('authors', 'alice'), filter.eq('authors', 'fred'));
```

**Why this design**

- **Predictable** — the same call always yields the same object, with no side effects or shared mutable state to reason about.
- **Composable** — keep leaves in a variable or React state and rebuild the tree on demand (`filter.and(...selection)`); nothing to reset between renders.
- **Serializable as-is** — the result is a plain `Filter` object you pass straight to `fetchQuery({ filters })`; no `.build()` step, no class instances.

## Leaf builders

Each returns a single-condition filter on one `field`.

| Method | Returns | Meaning |
|--------|---------|---------|
| `filter.eq(field, value)` | `SimpleFilter` | `field = value` |
| `filter.neq(field, value)` | `SimpleFilter` | `field <> value` |
| `filter.gt(field, value)` | `SimpleFilter` | `field > value` |
| `filter.gte(field, value)` | `SimpleFilter` | `field >= value` |
| `filter.lt(field, value)` | `SimpleFilter` | `field < value` |
| `filter.lte(field, value)` | `SimpleFilter` | `field <= value` |
| `filter.like(field, value)` | `SimpleFilter` | SQL `LIKE` pattern (`*`/`?` wildcards) |
| `filter.contains(field, value)` | `SimpleFilter` | substring containment |
| `filter.regex(field, value)` | `SimpleFilter` | regular-expression match |
| `filter.isNull(field)` | `NullFilter` | `field IS NULL` (no value) |
| `filter.isNotNull(field)` | `NotNullFilter` | `field IS NOT NULL` (no value) |
| `filter.in(field, values)` | `InFilter` | `field` matches any of `values` (OR within a field) |
| `filter.between(field, start, end)` | `BetweenFilter` | inclusive range; numbers or ISO dates |

`value` is `string | number | boolean`. For `in`, `values` is `string[]`. For `between`, `start` / `end` are `string | number`.

**Example**

```typescript title="leaves.ts"
import { filter } from '@sinequa/atomic';

filter.eq('authors', 'alice');           // { field: 'authors', operator: 'eq', value: 'alice' }
filter.gt('size', 1000);                 // { field: 'size', operator: 'gt', value: 1000 }
filter.in('docformat', ['pdf', 'doc']);  // { field: 'docformat', operator: 'in', values: ['pdf','doc'] }
filter.between('modified', '2024-01-01', '2024-12-31');
filter.isNotNull('company');             // { field: 'company', operator: 'notnull' }
```

## Combinators

Combine leaves and other expression nodes into an `ExprFilter` tree.

| Method | Returns | Notes |
|--------|---------|-------|
| `filter.and(...filters)` | `Filter \| undefined` | logical AND |
| `filter.or(...filters)` | `Filter \| undefined` | logical OR |
| `filter.not(...filters)` | `ExprFilter \| undefined` | negation |

All combinators accept any number of arguments and **ignore falsy operands** (`null`, `undefined`, `false`) so conditional filters compose without `if` statements.

- `and` / `or` **collapse trivial cases**: zero effective operands → `undefined`; exactly one → that operand returned as-is (no wrapper node).
- `not` always keeps a `not` node when at least one operand remains; returns `undefined` if none do.

**Example**

```typescript title="combinators.ts"
import { fetchQuery, filter } from '@sinequa/atomic';

const filters = filter.and(
  filter.gt('size', 1000),
  filter.or(
    filter.eq('treepath', '/HR/*'),
    filter.eq('authors', 'alice'),
  ),
);

await fetchQuery({ name: '_query', text: 'report', filters });
```

**Conditional composition**

```typescript title="conditional.ts"
import { filter } from '@sinequa/atomic';

const filters = filter.and(
  language && filter.eq('language', language),
  onlyRecent && filter.gte('modified', '2024-01-01'),
  formats?.length && filter.in('docformat', formats),
);
// none active → undefined · one active → that single leaf · several → an AND node
```

:::tip Pass the result straight to `query.filters`
`query.filters` accepts `Filter | Filter[] | ExprFilter` (plus the legacy types). Every `filter.*` result — including `undefined` from a collapsed combinator — is assignable as-is.
:::

## See also

- [Filters — from scratch to helpers](../examples/filters.md) — the conceptual guide, with by-hand vs. helper comparisons and a React facet example.
- [Facets & filters](../examples/facets-and-filters.md) — wiring filters to aggregations and tree facets.
