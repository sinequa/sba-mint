---
title: Adding Superscript Support to Markdown
sidebar_label: Markdown Superscript
sidebar_class_name: new
---

Mint renders Markdown through the `markdown` pipe (`src/pipes/markdown.pipe.ts`), which delegates to a single, shared [markdown-it](https://github.com/markdown-it/markdown-it) renderer held by `MarkdownRendererService` (`src/services/markdown-renderer.service.ts`). Because the renderer instance is created once in the service and reused everywhere, extending the supported syntax is done in **one place**.

This guide shows how to add **superscript** support — turning `^text^` into `<sup>text</sup>` — by installing the [`markdown-it-sup`](https://github.com/markdown-it/markdown-it-sup) plugin.

:::tip
The same steps apply to any `markdown-it` plugin (subscript, footnotes, task lists, …). Only the package name and the `.use(...)` call change.
:::

---

## Overview

`MarkdownRendererService` owns the single `markdown-it` instance; the `markdown` pipe only calls `render()` on it. Adding a feature is a three-step process:

1. **Install** the plugin package.
2. **Import** it into `markdown-renderer.service.ts`.
3. **Register** it on the renderer with `.use(...)`.

Once registered on the shared instance, every consumer of the `markdown` pipe (e.g. the Markdown preview conversion) automatically supports the new syntax — **no change to `markdown.pipe.ts` is required**.

---

## Step 1 — Install the plugin

```bash
npm install markdown-it-sup --no-save
```

:::caution `--no-save` does not persist the dependency
`--no-save` installs the package locally but **does not** add it to `package.json`. It will be missing after a fresh `npm install` and on other machines / CI. For a permanent addition, either install it without `--no-save`, or add it to the `postinstall` script the way the Sinequa packages are handled:

```json title="package.json"
"postinstall": "npm add markdown-it-sup --no-save && npm run transloco:extract-scoped-libs"
```
:::

---

## Step 2 — Register the plugin in `MarkdownRendererService`

Import the plugin and chain it onto the shared renderer with `.use(...)`:

```typescript title="src/services/markdown-renderer.service.ts"
import { Injectable } from "@angular/core";
import MarkdownIt from "markdown-it";
// highlight-start
// markdown-it-sup ships no type definitions, so we suppress the missing-types error.
// @ts-expect-error - no type definitions provided by markdown-it-sup
import markdownItSup from "markdown-it-sup";
// highlight-end

/**
 * Provides a single, shared markdown-it renderer instance for the whole application.
 */
@Injectable({ providedIn: "root" })
export class MarkdownRendererService {
  // highlight-next-line
  readonly renderer = new MarkdownIt({ html: true, linkify: true }).use(markdownItSup);

  /** Renders a markdown string to an HTML string. */
  render(value: string | null | undefined): string {
    return value ? this.renderer.render(value) : "";
  }
}
```

That is the only change required. The `.use(markdownItSup)` call registers the plugin's inline rule on the singleton renderer, so superscript becomes available to every consumer at once.

:::note The pipe stays unchanged
Because the renderer is owned by the service, `markdown.pipe.ts` does not need to be touched — it keeps delegating to `MarkdownRendererService.render()`.
:::

---

## Step 3 — Usage

Wrap the text you want raised in a single caret (`^`) on each side:

| Markdown | Rendered HTML | Displayed as |
| --- | --- | --- |
| `E = mc^2^` | `E = mc<sup>2</sup>` | E = mc² |
| `1^st^ place` | `1<sup>st</sup> place` | 1ˢᵗ place |
| `See note^1^` | `See note<sup>1</sup>` | See note¹ |

In a template, nothing changes — the pipe is used exactly as before:

```html
<div class="prose max-w-none dark:prose-invert" [innerHTML]="content | markdown"></div>
```

---

## Before / after

Given the Markdown source:

```markdown
The area of the square is 5^2^ = 25 cm^2^.
```

**Before** installing the plugin, the carets are treated as literal text:

```html
The area of the square is 5^2^ = 25 cm^2^.
```

**After** registering `markdown-it-sup`, the carets become superscript elements:

```html
The area of the square is 5<sup>2</sup> = 25 cm<sup>2</sup>.
```

which renders visually as: The area of the square is 5² = 25 cm².

---

## Notes and limitations

- **No spaces inside the markers.** The content between the carets cannot contain a raw space — `^a b^` will **not** be rendered as superscript. Escape the space with a backslash if you need one: `^a\ b^`.
- **Missing TypeScript types.** `markdown-it-sup` does not bundle type definitions and there is no `@types/markdown-it-sup` package, so the `// @ts-expect-error` comment above is required for the build to pass. This mirrors the pattern already used elsewhere in the codebase for untyped packages.
- **Register once.** Add the plugin only in `MarkdownRendererService`. Registering it again on another renderer instance is unnecessary — the whole point of the service is a single shared instance.
- **Styling.** The output is a plain `<sup>` element, styled by the surrounding `prose` (Tailwind Typography) container. No extra CSS is needed.
- **Related plugins.** Subscript (`~text~` → `<sub>text</sub>`) is available via the companion [`markdown-it-sub`](https://github.com/markdown-it/markdown-it-sub) plugin and registered the same way: `.use(markdownItSub)`.
- **Safe HTML.** The `markdown` pipe already returns trusted HTML via `DomSanitizer.bypassSecurityTrustHtml`, so the generated `<sup>` tags are rendered rather than escaped. Only render Markdown from sources you trust.
