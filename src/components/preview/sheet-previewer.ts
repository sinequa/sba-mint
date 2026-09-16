import { Component, computed, effect, inject, input, signal } from "@angular/core";
import { TranslocoService } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";
import { Article as A } from "@sinequa/atomic";
import { ApplicationService, SelectionService, SelectionStore } from "@sinequa/atomic-angular";
import { BreakpointObserverService, cn, SheetComponent, SheetService } from "@sinequa/ui";
import { PreviewDisplayModeService } from "./preview-display-mode.service";
import { PreviewComponent } from "./preview";
import { SimplePreviewContentComponent } from "./simple-preview-content/simple-preview-content";

type Article = A & {
  [key: string]: string[] | undefined;
};

/**
 * `Sheet Previewer` component to display article previews in a side sheet.
 * It adapts its layout based on the device type (mobile or desktop).
 * - On mobile devices, it shows a header with the article title and uses the PreviewContentComponent for content.
 * - On desktop devices, it uses the PreviewComponent for a more detailed view.
 * The sheet can be closed by the user, which clears the current article selection.
 * The component also updates the application title based on the article being previewed.
 *
 * Usage:
 * ```html
 * <sheet-previewer [position]="'left' | 'right'"></sheet-previewer>
 * ```
 * @param position - The side from which the sheet should appear ('left' or 'right'). Default is 'right'.
 *
 * Dependencies:
 * - ApplicationService: To set the application title.
 * - BreakpointObserverService: To determine if the device is mobile.
 * - SelectionService: To manage article selection.
 * - SelectionStore: To access the current article state.
 *
 * Example:
 * ```html
 * <sheet-previewer position="left"></sheet-previewer>
 * ```
 * This will display the sheet previewer on the left side of the screen.
 *
 * Note: Ensure that the necessary modules and components are imported in the parent module to use this component effectively.
 */
@Component({
  selector: "sheet-previewer",
  imports: [SheetComponent, SimplePreviewContentComponent, PreviewComponent],
  template: `
    <sheet
      [class]="cn('max-w-full min-w-[75%]', showSimple() ? 'w-full' : 'p-0')"
      [open]="!!article()"
      [showCloseButton]="showSimple()"
      (openChange)="handleChange($event)"
      [side]="position()">
      @if (article()) {
        @if (showSimple()) {
          <simple-preview-content [article]="article()" />
        } @else {
          <preview [hostedInSheet]="true" />
        }
      }
    </sheet>
  `
})
export class SheetPreviewerComponent {
  cn = cn;
  applicationService = inject(ApplicationService);
  breakpointService = inject(BreakpointObserverService);
  selectionStore = inject(SelectionStore);
  selectionService = inject(SelectionService);
  sheetService = inject(SheetService);
  previewDisplayMode = inject(PreviewDisplayModeService);
  private readonly transloco = inject(TranslocoService);

  /**
   * True mobile always gets the minimal view; a tablet-width "expand" click also swaps this
   * already-open sheet into the minimal view in place (see `PreviewNavbarComponent.onExpand()`).
   */
  showSimple = computed(() => this.breakpointService.isMobile() || this.previewDisplayMode.forcedSimple());

  position = input<"left" | "right">("right");

  extended = signal(false);

  article = computed(() => {
    const article = this.selectionStore.article?.();
    if (article) {
      // Fallback for untitled documents — translated so the tab title never stays English in a
      // French/German interface (RGAA 8.6).
      this.applicationService.setTitle(article.title || this.transloco.translate("pageTitle.preview"));
    }
    return article as Article;
  });

  handleChange(open: boolean) {
    // trigger the animation of the sheet closing before clearing the article
    this.sheetService.setOpen(open);

    if (!open) {
      setTimeout(() => {
        this.selectionService.clearCurrentArticle();
      }, 200);
      // Don't carry the "expand" fallback over to the next document opened in this sheet.
      this.previewDisplayMode.reset();
    }
  }
}
