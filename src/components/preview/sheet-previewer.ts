import { Component, computed, inject, input, signal } from '@angular/core';
import { getState } from '@ngrx/signals';
import { Article as A } from '@sinequa/atomic';
import { ApplicationService, PreviewService, SelectionService, SelectionStore } from '@sinequa/atomic-angular';
import { BreakpointObserverService, cn, SheetComponent, SheetHeaderComponent, SheetService, SheetTitleComponent } from '@sinequa/ui';
import { PreviewComponent } from './preview2';
import { PreviewContentComponent } from './preview-content/preview-content';

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
 * - PreviewService: To handle preview functionalities.
 * - SheetService: To manage sheet behaviors.
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
  selector: 'sheet-previewer',
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
              <span class="text-primary font-bold">{{ article().title }}</span>
            </sheet-title>
          </sheet-header>

          <preview-content />
        } @else {
          <preview />
        }
      }
    </sheet>
  `,
  imports: [SheetComponent, SheetHeaderComponent, SheetTitleComponent, PreviewContentComponent, PreviewComponent]
})
export class SheetPreviewerComponent {
  cn = cn;
  applicationService = inject(ApplicationService);
  breakpointService = inject(BreakpointObserverService);
  selectionStore = inject(SelectionStore);

  selectionService = inject(SelectionService);
  previewService = inject(PreviewService);
  sheetService = inject(SheetService);

  isSheetOpen = signal(false);
  position = input<'left' | 'right'>('right');

  extended = signal(false);

  article = computed(() => {
    const { article } = getState(this.selectionStore);
    if (article) {
      this.applicationService.setTitle(article.title || 'Preview');
    }
    return article as Article;
  });

  handleChange(open: boolean) {
    if (!open) {
      setTimeout(() => {
        this.selectionService.clearCurrentArticle();
      }, 200);
    }
    // trigger the animation of the sheet closing before clearing the article
    this.isSheetOpen.set(open);
  }
}
