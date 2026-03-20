import { inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter, map, startWith } from "rxjs";

/**
 * Returns a signal that emits the current URL and updates on every navigation.
 */
export function injectCurrentUrl() {
  const router = inject(Router);
  return toSignal(
    router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => router.url),
      startWith(router.url)
    )
  );
}
