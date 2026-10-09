import { effect, inject, InputSignal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { getState } from "@ngrx/signals";
import { LegacyFilter, SpellingCorrectionMode, warn } from "@sinequa/atomic";
import { QueryParamsStore } from "@sinequa/atomic-angular";

/**
 * Subset of URL query parameters that are bound to component input signals
 * via Angular's `withComponentInputBinding()` router feature.
 *
 * All fields are optional — pass only the inputs your component declares.
 * Omitted fields are simply ignored by the sync effects.
 */
export interface UrlQueryParamInputs {
  /** `?q=` — the search query text */
  q?: InputSignal<string | undefined>;
  /** `?t=` — the active tab */
  t?: InputSignal<string | undefined>;
  /** `?b=` — the basket */
  b?: InputSignal<string | undefined>;
  /** `?s=` — the sort order */
  s?: InputSignal<string | undefined>;
  /** `?f=` — the active filters, JSON-serialized */
  f?: InputSignal<string | undefined>;
  /** `?n=` — the query name (selects which CCQuery config to use) */
  n?: InputSignal<string | undefined>;
  /** `?c=` — the spelling correction mode */
  c?: InputSignal<SpellingCorrectionMode | undefined>;
  /** `?p=` — the current page number */
  p?: InputSignal<number | undefined>;
}

export interface UrlQueryParamsSyncOptions {
  /**
   * When `true` (default), a second effect keeps the browser URL in sync with
   * the store: any change to `QueryParamsStore` triggers a `router.navigate()`
   * with updated query params.
   *
   * Set to `false` for a one-way (URL → Store) sync, e.g. on the assistant page
   * where the component reads search context from the URL but never modifies it.
   */
  syncToUrl?: boolean;
}

/**
 * Composable that wires up URL query parameter synchronization with `QueryParamsStore`.
 *
 * ## How it works
 *
 * Angular's router is configured with `withComponentInputBinding()`, which automatically
 * maps URL query params to component `input()` signals (e.g. `?q=foo` → `input<string>()`
 * named `q`). This composable builds on top of that by registering two reactive effects:
 *
 * ```
 * URL (?q=&t=&f=...)
 *   │  withComponentInputBinding()
 *   ▼
 * input() signals ──── Effect 1 ──▶ QueryParamsStore.patch()
 *                                           │
 *                                           │  Effect 2 (if syncToUrl: true)
 *                                           ▼
 *                              router.navigate() ──▶ URL updated
 * ```
 *
 * ## Usage
 *
 * Call this function inside a component constructor (or any Angular injection context).
 * Pass the component's own input signals — only the ones you pass will be tracked.
 *
 * ```typescript
 * // Bidirectional (default) — used in search-all
 * injectUrlQueryParamsSync({ q: this.q, t: this.t, f: this.f, ... });
 *
 * // URL → Store only — used in assistant.layout (does not write back to URL)
 * injectUrlQueryParamsSync({ q: this.q, t: this.t, ... }, { syncToUrl: false });
 * ```
 *
 * ## Why a composable and not an abstract class?
 *
 * An abstract base class with all inputs pre-declared was considered but rejected.
 * See `README.md` for the full rationale. Short version: Angular recommends composition
 * over inheritance for components, and the composable approach keeps each component's
 * contract explicit and minimal.
 *
 * @param inputs - The component's input signals to track. Only passed signals participate
 *                 in the sync — omitted ones default to `undefined` in the store patch.
 * @param options - Optional configuration (see `UrlQueryParamsSyncOptions`).
 */
export function injectUrlQueryParamsSync(inputs: UrlQueryParamInputs, options: UrlQueryParamsSyncOptions = {}): void {
  const { syncToUrl = true } = options;

  // QueryParamsStore is always needed (Effect 1). Router/ActivatedRoute are injected
  // only when Effect 2 is active to avoid unnecessary injections for one-way consumers.
  const queryParamsStore = inject(QueryParamsStore);

  // ─── Effect 1: URL → Store ────────────────────────────────────────────────
  // Runs whenever any of the provided input signals change (i.e. whenever the
  // URL query params change, which Angular reflects into the inputs automatically).
  // Patches the store so the rest of the app can react to the new search state.
  //
  // The `filters` field deserves special handling: it is stored in the URL as a
  // JSON string (e.g. `?f=[{"column":"doctype","values":["pdf"]}]`) because query
  // params are inherently flat strings. We parse it back to an array here.
  effect(() => {
    let filters: LegacyFilter[] = [];
    const fRaw = inputs.f?.() ?? "";
    try {
      filters = fRaw ? JSON.parse(fRaw) : [];
    } catch (err) {
      warn(`[injectUrlQueryParamsSync] Failed to parse ?f= param:${fRaw}`, err);
      filters = [];
    }
    queryParamsStore.patch({
      text: inputs.q?.(),
      tab: inputs.t?.(),
      basket: inputs.b?.(),
      sort: inputs.s?.(),
      filters,
      name: inputs.n?.(),
      page: inputs.p?.(),
      spellingCorrectionMode: inputs.c?.()
    });
  });

  // ─── Effect 2: Store → URL ────────────────────────────────────────────────
  // Runs whenever the QueryParamsStore state changes (e.g. user applies a filter,
  // changes the sort, or navigates to the next page). Reflects the new state back
  // to the browser URL so that the address bar stays in sync and browser history
  // (back/forward navigation) works correctly.
  //
  // `queryParamsHandling: 'merge'` ensures that unrelated query params already
  // present in the URL (e.g. `?id=`) are preserved rather than overwritten.
  //
  // This effect is skipped entirely when `syncToUrl: false` is passed, which is
  // the case for components that only consume search context without modifying it
  // (e.g. the assistant page).
  if (syncToUrl) {
    const router = inject(Router);
    const route = inject(ActivatedRoute);

    effect(() => {
      const { text, filters = [], page, sort, tab, basket, name, spellingCorrectionMode } = getState(queryParamsStore);
      router.navigate([], {
        relativeTo: route,
        queryParamsHandling: "merge",
        queryParams: {
          // Filters are serialized back to JSON for URL storage (see Effect 1 above)
          f: filters.length > 0 ? JSON.stringify(filters) : undefined,
          p: page,
          s: sort,
          t: tab,
          q: text,
          b: basket,
          n: name,
          c: spellingCorrectionMode
        },
        state: {}
      });
    });
  }
}
