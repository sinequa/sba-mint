import { computed, DestroyRef, inject, signal } from "@angular/core";

/**
 * Screens wide enough for the /search left filters drawer to stay open as a permanent column
 * instead of a floating overlay. Not a standard Tailwind breakpoint and not the same threshold as
 * `injectTabletBreakpoint` (1024px, used for the assistant page's own inline/floating split):
 * validated against the real /search layout, 1024px was too low — at common laptop widths just
 * above it (e.g. 1392px) a permanent column still felt cramped.
 */
const LARGE_SCREEN_BREAKPOINT = 1920; // px — Full HD width

export function injectLargeScreenBreakpoint() {
  const destroyRef = inject(DestroyRef);

  const currentInnerWidth = signal(window.innerWidth);
  const onResize = () => currentInnerWidth.set(window.innerWidth);
  window.addEventListener("resize", onResize);
  destroyRef.onDestroy(() => window.removeEventListener("resize", onResize));

  const isLargeScreen = computed(() => currentInnerWidth() >= LARGE_SCREEN_BREAKPOINT);

  return { isLargeScreen };
}
