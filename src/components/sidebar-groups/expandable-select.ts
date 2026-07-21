import { NgComponentOutlet, NgTemplateOutlet } from "@angular/common";
import { Component, Type, inject, input, output, viewChild } from "@angular/core";
import { provideTranslocoScope, TranslocoPipe } from "@jsverse/transloco";
import { BreakpointObserverService, CheckIcon, ChevronRightIcon, MenuComponent, MenuContentComponent, MenuItemComponent } from "@sinequa/ui";

export interface ExpandableSelectOption {
  /** Stable value emitted on selection and compared against `active`. */
  value: string;
  /** Display label — a transloco key when `translateLabels` is true, otherwise a literal string. */
  label: string;
  /** Icon component rendered at the trailing edge of the option row. */
  icon: Type<unknown>;
}

/**
 * A single-select menu entry for the sidebar user menu.
 *
 * This is the ONLY place the mobile/desktop branch for these selectors lives, so consumers
 * never check the breakpoint themselves:
 * - Desktop: a flyout submenu (options open to the side).
 * - Mobile (<768px): the options expand inline underneath the row — no flyout, no dialog.
 *
 * The inline expansion is parent-controlled (`expanded` input + `toggleExpand` output) so that
 * sibling selectors (theme/language) can be kept mutually exclusive by the parent.
 */
@Component({
  selector: "expandable-select",
  imports: [NgComponentOutlet, NgTemplateOutlet, TranslocoPipe, MenuComponent, MenuContentComponent, MenuItemComponent, ChevronRightIcon, CheckIcon],
  templateUrl: "./expandable-select.html",
  providers: [provideTranslocoScope("user-menu")]
})
export class ExpandableSelectComponent {
  private readonly breakpoint = inject(BreakpointObserverService);
  readonly isMobile = this.breakpoint.isMobile;

  /** Trigger label — always a transloco key. */
  readonly labelKey = input.required<string>();
  /** Optional leading icon component (e.g. the palette icon for the theme selector). */
  readonly icon = input<Type<unknown>>();
  readonly options = input.required<ExpandableSelectOption[]>();
  /** Currently selected option value (drives the check mark). */
  readonly active = input.required<string>();
  /** Translate option labels via transloco (theme) vs render them literally (language). */
  readonly translateLabels = input(false);
  /**
   * Mobile only: whether the inline options are expanded. Parent-controlled so sibling
   * selectors stay mutually exclusive. Ignored on desktop (the flyout owns its own state).
   */
  readonly expanded = input(false);

  /** Mobile only: emitted when the row is tapped, so the parent can toggle expansion. */
  readonly toggleExpand = output<void>();
  /** Emitted with the chosen option value. */
  readonly selected = output<string>();
  /**
   * Desktop only: emitted when the flyout trigger is clicked. Lets a sibling selector close its
   * own flyout so only one is open at a time — the library's `closeAllSiblings`/`document:click`
   * coordination can't cross this component boundary.
   */
  readonly flyoutTriggered = output<void>();

  /** The desktop flyout's <menu> (absent on mobile, where the inline branch renders instead). */
  private readonly flyoutMenu = viewChild(MenuComponent);

  onToggle(event: Event) {
    // Prevent the click from bubbling to the root <Menu>, which would close the whole user menu.
    event.stopPropagation();
    this.toggleExpand.emit();
  }

  onSelect(value: string, event?: Event) {
    // Stop propagation so selecting an option does NOT close the menu/flyout (the library's
    // MenuContent/menu handlers would otherwise close it). The popup stays open until an
    // outside click, letting the user switch options and see the selection update.
    event?.stopPropagation();
    this.selected.emit(value);
  }

  /** Desktop: notify siblings so they can close their flyout before this one opens. */
  onFlyoutTrigger() {
    this.flyoutTriggered.emit();
  }

  /** Desktop: close this selector's flyout (called by a sibling when it opens). */
  closeFlyout() {
    this.flyoutMenu()?.close();
  }
}
