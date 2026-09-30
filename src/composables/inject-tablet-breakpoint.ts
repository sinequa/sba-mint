import { computed, DestroyRef, inject, signal } from "@angular/core";
import { BreakpointObserverService } from "@sinequa/ui";

/**
 * `BreakpointObserverService.isMobile()` only covers <768px. Several layouts (search, assistant,
 * preview) also need to treat tablet widths (768-1024px, e.g. iPad) as "mobile" — this widens the
 * threshold to 1024px, OR-ed with the service's own signal so a touch device reported as mobile by
 * the service still counts even above 1024px wide. Inclusive: iPad Pro portrait is exactly 1024px
 * and must land in the same bucket as iPad Air (820px) and iPad Mini (768px).
 */
const TABLET_BREAKPOINT = 1024; // px

/**
 * Shared "is this a phone-or-tablet viewport" signal, combining `BreakpointObserverService.isMobile()`
 * (768px) with a wider 1024px window-width threshold.
 */
export function injectTabletBreakpoint() {
  const breakpointService = inject(BreakpointObserverService);
  const destroyRef = inject(DestroyRef);

  const currentInnerWidth = signal(window.innerWidth);
  const onResize = () => currentInnerWidth.set(window.innerWidth);
  window.addEventListener("resize", onResize);
  destroyRef.onDestroy(() => window.removeEventListener("resize", onResize));

  const isTabletOrMobile = computed(() => breakpointService.isMobile() || currentInnerWidth() <= TABLET_BREAKPOINT);

  return { isTabletOrMobile };
}
