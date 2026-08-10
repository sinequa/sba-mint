---
title: Using translations
sidebar_position: 4
---

# Using translations in a component

Once the languages are configured (see [Localization](./localization.md)) and the scope
translation files are in place, this guide shows how to **display translated text** in a
component — and how to avoid hardcoded strings.

Mint uses [Transloco](https://jsverse.github.io/transloco/). Translations live under
`src/assets/i18n/`:

- **root / global** scope: `src/assets/i18n/<lang>.json` — generic keys with **no prefix**
  (`back`, `cancel`, `close`, `clear`, `filters`, `history`, `loadMore`, `more`, …).
- **named scopes**: one folder per scope, `src/assets/i18n/<scope>/<lang>.json` (e.g. `filters/`,
  `sort-selector/`, and the `agt-*` scopes coming from `@sinequa/agent`). Library scope files are
  copied in by the extraction step (`npm run transloco:extract-scoped-libs`, run on `postinstall`).

## Import the pipe

In a standalone component, add `TranslocoPipe` to the `imports`:

```ts
import { TranslocoPipe } from "@jsverse/transloco";

@Component({
  selector: "my-widget",
  imports: [TranslocoPipe /* … */],
  templateUrl: "./my-widget.html"
})
export class MyWidgetComponent {}
```

## Root (global) keys

Generic keys defined in `src/assets/i18n/<lang>.json` are used **without a prefix** and need **no
scope**:

```html
<span>{{ "filters" | transloco }}</span>
```

Before adding a new string, check whether a suitable global key already exists (e.g. `filters`,
`close`, `clear`, `more`) and reuse it.

## Scoped keys

A scope groups translations under a folder and is requested per component via
`provideTranslocoScope`. The key is prefixed with the **scope name in camelCase** (the kebab-case
folder `saved-searches` becomes the prefix `savedSearches`):

```ts
@Component({
  // …
  providers: [provideTranslocoScope("filters")]
})
```

```html
<span>{{ "filters.clearAllFilters" | transloco }}</span>
```

:::note
A global key and a scope can share the same name without conflict: the root `filters` key (a plain
string) and the `filters/` scope (keys like `filters.toggle`) coexist. A component without the scope
reads the root key; with the scope it can address `filters.xxx`. Global keys remain reachable by
their plain name even inside a scoped component.
:::

## Translating attributes (`title`, `aria-label`, …)

Use a **binding**, never a static attribute, so the pipe is evaluated:

```html
<button [title]="'filters' | transloco" [attr.aria-label]="'close' | transloco">
  <filter-icon />
</button>
```

## Parameters and ICU

Pass parameters as the pipe argument. The MessageFormat plugin
(`provideTranslocoMessageformat`) is enabled, so ICU syntax (plurals / select) is supported:

```json title="src/assets/i18n/en.json"
{ "resultsCount": "{count, plural, =0 {No results} one {# result} other {# results}}" }
```

```html
<span>{{ "resultsCount" | transloco: { count: total() } }}</span>
```

## Reusing a key across a block (directive)

To translate several keys in one block, the structural directive avoids repeating the pipe:

```html
<ng-container *transloco="let t">
  <h2>{{ t("filters") }}</h2>
  <button>{{ t("close") }}</button>
</ng-container>
```

## Programmatic translation

In TypeScript, inject `TranslocoService`:

```ts
private readonly transloco = inject(TranslocoService);
const label = this.transloco.translate("filters");
```

## Adding a new key

- **Global key** → add it to **every** language file: `en.json`, `fr.json` **and** `de.json`. A
  missing key falls back to English and logs a warning.
- **Scope key from a library** → the source of truth is the library; do **not** edit
  `src/assets/i18n/<scope>/<lang>.json` by hand (it is overwritten by the extraction step). To change
  a library string locally, use the override system — see
  [i18n Translation Overrides](./i18n-overrides.md).

## Best practice: no hardcoded text

All user-facing text must go through Transloco. When introducing UI strings, prefer reusing an
existing global key over adding a new one. Example from the left filters drawer on the search page:

```html
<!-- panel header -->
<span class="font-semibold">{{ "filters" | transloco }}</span>
<!-- close button -->
<button [attr.aria-label]="'close' | transloco"><xmark-icon /></button>
```
