import { afterNextRender, Component, computed, DestroyRef, DOCUMENT, effect, inject, signal, viewChild } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { provideTranslocoScope, TranslocoPipe } from "@jsverse/transloco";

import { Article as A } from "@sinequa/atomic";
import { AdvancedSearch, ApplicationService, PreviewService, SelectionStore } from "@sinequa/atomic-angular";
import { ButtonComponent } from "@sinequa/ui";

import { PreviewHeaderComponent } from "./preview-header/preview-header";
import { PreviewNavbarComponent } from "./preview-navbar2/preview-navbar";
import { PreviewTabsComponent } from "./preview-tabs/preview-tabs";

type Article = A & {
  [key: string]: string[] | undefined;
};

/**
 * Preview component
 *
 * Usage:
 * ```html
 * <preview></preview>
 * ```
 * This component displays the preview of the selected article along with its navigation bar and tabs.
 * It also manages the extended view state for the preview.
 *
 */
@Component({
  selector: "preview, Preview",
  providers: [provideTranslocoScope({ scope: "preview" })],
  imports: [PreviewNavbarComponent, PreviewTabsComponent, PreviewHeaderComponent, AdvancedSearch, ButtonComponent, TranslocoPipe],
  templateUrl: "./preview.html",
  host: {
    // a single-column grid, so the root div keeps the `align-self: stretch` height it had when the
    // panel was a second column — a plain block would need an `h-full` that changes how the
    // document's ancestors resolve their height (and with it, how a scroll walks out of the iframe)
    class: "grid grow h-full w-full overflow-hidden"
  }
})
export class PreviewComponent {
  protected readonly previewTabs = viewChild(PreviewTabsComponent);

  /* injectables */
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly previewservice = inject(PreviewService);
  protected readonly applicationService = inject(ApplicationService);
  protected readonly eventManager = inject(EventManager);
  protected readonly document = inject(DOCUMENT);

  /* models used by inner components */
  protected readonly loading = computed(() => !this.previewservice.DOMContentLoaded());

  /* opens the floating advanced-search panel, overlaid on top of the document (never resizes it) */
  protected readonly extended = signal(false);

  protected readonly article = computed(() => {
    const article = this.selectionStore.article?.();
    if (article) {
      this.applicationService.setTitle(article.title || "Preview");
    }
    return article as Article;
  });

  constructor(destroyRef: DestroyRef) {
    afterNextRender(() => {
      // listen on the body, not on the panel: opening it from the navbar leaves the focus on the toggle button.
      // keydown, not keyup, so preventDefault still cancels the browser default action.
      const removeEscapeListener = this.eventManager.addEventListener(this.document.body, "keydown", (event: KeyboardEvent) => {
        // the floating advanced-search panel takes precedence: Escape closes it and keeps the preview open
        if (event.key !== "Escape" || !this.extended()) return;

        // Escape inside the panel input[type=search] would otherwise clear the field: closing is all we want
        event.preventDefault();
        event.stopPropagation();
        this.extended.set(false);
      });

      destroyRef.onDestroy(() => removeEscapeListener());
    });

    // if the scrollTo event is emitted, set the active tab to preview if the active tab is not already preview
    effect(() => {
      const event = this.previewservice.events();

      // If the event is scrollTo, set the active tab to preview if it's not already
      if (event === "scrollTo" && this.previewTabs()?.activeTabValue() !== "preview") {
        this.previewTabs()?.setActiveTab("preview");
      }

      // If the event is scrollTo, set the events to idle to avoid multiple triggers
      if (event === "scrollTo") {
        this.previewservice.events.set("idle");
      }
    });
  }
}
