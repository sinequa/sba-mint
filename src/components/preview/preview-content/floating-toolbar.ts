import { Component, DestroyRef, inject, signal } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { ButtonComponent, EllipsisIcon } from "@sinequa/ui";

// Delay before an unattended toolbar collapses again after the pointer leaves it — long enough
// that moving from the trigger to a projected button (or back) doesn't clip it shut, short enough
// not to linger over the document once the user has actually moved on.
const AUTO_COLLAPSE_DELAY_MS = 600;

/**
 * Collapsible floating toolbar: projected content stays tucked behind a single "…" trigger — so it
 * takes almost no space over the previewed document — until hovered or clicked open. Closes again
 * on a second click, or on its own after {@link AUTO_COLLAPSE_DELAY_MS} once the pointer has left it
 * (clicking a projected button leaves it focused, same as the trigger — that's expected and not a
 * reason to stay open, so closing here does not check focus at all).
 *
 * Usage:
 * ```html
 * <floating-toolbar>
 *   <converter-select ... />
 *   <zoom-controls ... />
 * </floating-toolbar>
 * ```
 */
@Component({
  selector: "floating-toolbar",
  imports: [TranslocoPipe, ButtonComponent, EllipsisIcon],
  host: {
    class: "inline-flex items-center gap-1",
    "(mouseenter)": "onMouseEnter()",
    "(mouseleave)": "onMouseLeave()"
  },
  template: `
    <!-- A grid-template-columns 0fr → 1fr transition (not max-width) animates exactly to the
         content's natural width either way, so opening and closing move symmetrically — a max-width
         target has to be some arbitrarily large safety value, and the content then only occupies a
         fraction of that range, making the two directions visually reveal/hide at different paces. -->
    <div class="grid transition-[grid-template-columns] duration-300 ease-in-out" [class]="expanded() ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'">
      <div
        class="flex min-w-0 items-center gap-1 overflow-hidden p-1.5 transition-opacity duration-300 ease-in-out"
        [class]="expanded() ? 'opacity-100' : 'opacity-0'">
        <ng-content />
      </div>
    </div>

    <button
      variant="outline" [iconOnly]="true" size="sm"
      class="border-foreground/10 bg-background shadow-md shrink-0"
      [attr.title]="'preview.moreActions' | transloco"
      [attr.aria-expanded]="expanded()"
      (click)="toggle()">
      <ellipsis-icon class="shrink-0" />
    </button>
  `
})
export class FloatingToolbarComponent {
  protected readonly expanded = signal(false);
  private closeTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearCloseTimer());
  }

  toggle(): void {
    this.clearCloseTimer();
    this.expanded.update(value => !value);
  }

  protected onMouseEnter(): void {
    this.clearCloseTimer();
    this.expanded.set(true);
  }

  protected onMouseLeave(): void {
    this.scheduleCollapse(AUTO_COLLAPSE_DELAY_MS);
  }

  private scheduleCollapse(delayMs: number): void {
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => this.expanded.set(false), delayMs);
  }

  private clearCloseTimer(): void {
    if (this.closeTimer === undefined) return;
    clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
  }
}
