import { Component, input } from "@angular/core";
import { Article as A } from "@sinequa/atomic";
import { SheetHeaderComponent, SheetTitleComponent } from "@sinequa/ui";
import { PreviewContentComponent } from "../preview-content/preview-content";

type Article = A & {
  [key: string]: string[] | undefined;
};

/**
 * Minimal preview: just a title and the raw iframe content, no navbar/tabs. Used inside a `<sheet>`
 * wherever the full `<preview>` (with its navbar, tabs, and assistant/advanced-search panels) is too
 * cramped to display — mobile widths, and the ipad "expand" fallback in `PreviewNavbarComponent`.
 *
 * Usage:
 * ```html
 * <simple-preview-content [article]="article()" />
 * ```
 */
@Component({
  selector: "simple-preview-content",
  imports: [SheetHeaderComponent, SheetTitleComponent, PreviewContentComponent],
  template: `
    <sheet-header>
      <sheet-title class="truncate overflow-hidden text-left">
        <span class="font-bold text-primary">{{ article()?.title }}</span>
      </sheet-title>
    </sheet-header>

    <preview-content class="h-full" />
  `
})
export class SimplePreviewContentComponent {
  article = input<Article>();
}
