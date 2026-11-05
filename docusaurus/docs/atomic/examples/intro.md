---
title: Examples (JS & React)
sidebar_class_name: new
---

This section collects **task-oriented recipes** for `@sinequa/atomic`. Where the [API Reference](../intro.md) documents each function in isolation, these pages show how to **combine** them to build real features — authentication, search, facets, preview, autocomplete, and more.

Every recipe is shown twice when relevant:

- **Vanilla JavaScript** — framework-agnostic, runnable in any browser bundle. Use it to understand the raw call sequence.
- **React** — the same logic wired into hooks and components, following the patterns from the official React/TanStack Start tutorial.

:::info Browser-only by design
`@sinequa/atomic` relies on `sessionStorage`, DOM `CustomEvent`s and redirects (OAuth/SAML). All of it must run **on the client** — inside event handlers or effects (`useEffect`), **never** during server-side rendering. During SSR, `window`, `sessionStorage` and DOM events do not exist.
:::

## Recipes

| Recipe | What you'll build |
|--------|-------------------|
| [Authentication](./authentication.md) | Bootstrap, credential/SSO/bearer login, logout, and a React auth context + protected routes |
| [Search & pagination](./search-and-pagination.md) | Discover the query web service, run `fetchQuery`, page through results |
| [Filters — from scratch to helpers](./filters.md) | The `Filter` model explained by hand, then with the `filter` builder helpers |
| [Facets & filters](./facets-and-filters.md) | Render aggregations, apply structured `filters`, tabs, sort, scope, and tree facets |
| [Document preview](./document-preview.md) | Open a preview in an iframe, build a highlight legend and counters |
| [Autocomplete & suggestions](./autocomplete.md) | A debounced suggestion box backed by `fetchSuggest` |
| [User profile & settings](./user-profile-and-settings.md) | Read the principal, persist per-user settings, read the user profile |
| [Session & token management](./session-and-tokens.md) | Sliding sessions, a `withReauth` wrapper, password-expiry banners |
| [Notifications](./notifications.md) | Dispatch `notify.*` events and render them as toasts |
| [Utilities](./utilities.md) | Relative dates, query-param (de)serialization, and string/metadata helpers |

## Conventions used in this section

- All imports come from `'@sinequa/atomic'`.
- React snippets use **function components and hooks** (React 18+). They are written in `.jsx` (no type annotations) to stay framework-version-agnostic; adapt to `.tsx` by importing the matching types (`Result`, `Article`, `Principal`, …).
- Network calls are always wrapped in `try/catch`; production code should also handle `UnauthorizedError` (see [Session & token management](./session-and-tokens.md)).
- Examples assume the global config has been initialized once at startup — see [Authentication › Bootstrap](./authentication.md#1-bootstrap-the-library).
