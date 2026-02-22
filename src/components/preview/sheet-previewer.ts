import { Component, computed, effect, inject, input, signal } from "@angular/core";
import { getState } from "@ngrx/signals";
import { Article as A } from "@sinequa/atomic";
import { ApplicationService, SelectionService, SelectionStore } from "@sinequa/atomic-angular";
import { BreakpointObserverService, cn, SheetComponent, SheetHeaderComponent, SheetService, SheetTitleComponent } from "@sinequa/ui";
import { PreviewComponent } from "./preview";
import { PreviewContentComponent } from "./preview-content/preview-content";

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
  imports: [SheetComponent, SheetHeaderComponent, SheetTitleComponent, PreviewContentComponent, PreviewComponent],
  template: `
    <sheet
      [class]="cn('max-w-full min-w-[75%]', breakpointService.isMobile() ? 'w-full' : 'p-0')"
      [open]="!!article()"
      [showCloseButton]="breakpointService.isMobile()"
      (openChange)="handleChange($event)"
      [side]="position()">
      @if (article()) {
        @if (breakpointService.isMobile()) {
          <sheet-header>
            <sheet-title class="truncate overflow-hidden text-left">
              <span class="font-bold text-primary">{{ article().title }}</span>
            </sheet-title>
          </sheet-header>

          <preview-content class="h-full" />
        } @else {
          <preview />
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

  position = input<"left" | "right">("right");

  extended = signal(false);

  article = computed(() => {
    const { article } = getState(this.selectionStore);
    if (article) {
      this.applicationService.setTitle(article.title || "Preview");
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
    }
  }
}
