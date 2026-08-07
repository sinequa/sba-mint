import { DestroyRef } from "@angular/core";

type FocusWhenReadyOptions = {
  /** Stop retrying after this delay (in ms) if the element never becomes focusable. */
  timeoutMs?: number;
  /** Cancels the pending attempts when the host component is destroyed. */
  destroyRef?: DestroyRef;
};

const DEFAULT_TIMEOUT_MS = 5_000;
/** How long we keep watching after a successful focus, in case the element gets re-rendered right away. */
const GRACE_PERIOD_MS = 500;

/**
 * Moves the focus to an element as soon as it becomes focusable.
 *
 * A single `focus()` call is not enough for elements rendered asynchronously: the assistant
 * textarea for instance is only reattached to the DOM some time after its route is, and stays
 * `disabled` while the chat is loading. So we retry on every animation frame until the element
 * is rendered, enabled and visible.
 *
 * We also keep watching for a short while after a successful focus, because the chat rebuilds
 * its whole view whenever it loads a discussion, which drops the focus we just set.
 *
 * The focus is never stolen from an element the user deliberately focused outside of
 * `container` while we were waiting (e.g. the "Sources" facet search box next to the assistant).
 * The element focused when the call is made - typically the menu entry that has just been
 * clicked to open the page - doesn't count as such.
 *
 * @param getElement Getter for the element to focus - it may not exist yet.
 * @param container CSS selector of the ancestor delimiting the "own" area of the element.
 * @returns A function cancelling the pending attempts.
 */
export function focusWhenReady(getElement: () => HTMLElement | null | undefined, container: string, options: FocusWhenReadyOptions = {}): () => void {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, destroyRef } = options;
  const deadline = performance.now() + timeoutMs;
  const initiallyFocused = document.activeElement;

  let frame: number | undefined;
  let firstFocusedAt: number | undefined;

  const cancel = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };

  const attempt = () => {
    frame = undefined;

    const now = performance.now();
    const element = getElement();

    if (isFocusable(element)) {
      if (document.activeElement === element) {
        firstFocusedAt ??= now;
      } else if (canTakeFocus(element, container, initiallyFocused)) {
        element.focus();
        // `focus()` is a no-op on an element the browser doesn't accept yet, hence the check
        if (document.activeElement === element) firstFocusedAt ??= now;
      } else {
        // The user has focused something else in the meantime: leave them alone
        return;
      }
    }

    const graceElapsed = firstFocusedAt !== undefined && now - firstFocusedAt >= GRACE_PERIOD_MS;
    if (graceElapsed || now >= deadline) return;

    frame = requestAnimationFrame(attempt);
  };

  frame = requestAnimationFrame(attempt);
  destroyRef?.onDestroy(cancel);

  return cancel;
}

function isFocusable(element: HTMLElement | null | undefined): element is HTMLElement {
  if (!element) return false;
  if ((element as HTMLInputElement | HTMLTextAreaElement).disabled) return false;
  // `checkVisibility` also covers the `[hidden]` ancestor used by the chat while disconnected
  return element.checkVisibility ? element.checkVisibility() : element.offsetParent !== null;
}

function canTakeFocus(element: HTMLElement, container: string, initiallyFocused: Element | null): boolean {
  const active = document.activeElement;
  if (!active || active === document.body || active === initiallyFocused) return true;
  return !!element.closest(container)?.contains(active);
}
