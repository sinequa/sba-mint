import { Location, NgTemplateOutlet } from "@angular/common";
import { Component, computed, Input, inject, input, model, signal, viewChild } from "@angular/core";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { Article } from "@sinequa/atomic";
import { AppStore, BookmarkButtonComponent, PreviewService, QueryParamsStore, SelectionStore } from "@sinequa/atomic-angular";
import { ButtonComponent, CircleCheckIconComponent, cn, LinkIcon, Separator, SheetCloseDirective } from "@sinequa/ui";
import { toast } from "ngx-sonner";
import { PreviewDialogComponent } from "../dialog/preview-dialog";

export type PreviewNavbarConfig = {
  showOpenButton?: boolean;
  showSearchButton?: boolean;
};

const DEFAULT_CONFIG: PreviewNavbarConfig = {
  showOpenButton: true,
  showSearchButton: true
};

/**
 * Preview navigation bar component
 *
 * Usage:
 * ```html
 * <preview-navbar
 *    [article]="article"
 *   [canBookmark]="canBookmark"
 *  [config]="config">
 * </preview-navbar>
 * ```
 *
 * Where `article` is the article to preview, `canBookmark` indicates if bookmarking is allowed, and `config` allows customization of the navbar features.
 *
 * Example of `config`:
 * ```ts
 * {
 * showOpenButton: true,
 * showSearchButton: false
 * }
 * ```
 * This configuration will display the open button but hide the search button in the preview navbar.
 *
 */
@Component({
  selector: "preview-navbar, PreviewNavbar, previewnavbar",
  imports: [
    NgTemplateOutlet,
    BookmarkButtonComponent,
    TranslocoPipe,
    ButtonComponent,
    LinkIcon,
    CircleCheckIconComponent,
    PreviewDialogComponent,
    Separator,
    SheetCloseDirective
  ],
  templateUrl: "./preview-navbar.html",
  providers: []
})
export class PreviewNavbarComponent {
  cn = cn;

  protected readonly previewService = inject(PreviewService);
  protected readonly location = inject(Location);
  private readonly transloco = inject(TranslocoService);
  private readonly appStore = inject(AppStore);
  private readonly selectionStore = inject(SelectionStore);
  private readonly queryParamsStore = inject(QueryParamsStore);

  readonly previewDialog = viewChild(PreviewDialogComponent);

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;
  @Input() public set config(config: PreviewNavbarConfig) {
    this.navConfig = { ...DEFAULT_CONFIG, ...config };
  }

  /* used to toggle the extended view when not displayed inside the drawer */
  public readonly extended = model(false);

  public readonly article = input<Partial<Article> | undefined>();
  public readonly canBookmark = input<boolean>(true);

  /**
   * Indicates if the converted of the article being previewed is the primary one. When true, the button "search in preview" will be displayed, allowing the user to search in the preview the same query that was used to get the article.
   */
  public readonly isPrimary = input<boolean>(false);
  readonly isExternalLinkValid = computed(() => {
    if (!this.article()?.url1) return false;

    try {
      const url = new URL(this.article()?.url1 || "");
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  });

  // used to open the preview inside a dialog
  expandPreview = computed(() => this.appStore.general()?.features?.expandPreview);

  public copied = signal(false);

  openClicked(): void {
    // open the preview in a new tab and audit the action
    this.previewService.openExternal(this.article() as Article);
  }

  async copyLink() {
    if (this.copied()) {
      return;
    }

    const url = this.article()?.url1 || this.article()?.url2;

    if (url) {
      await navigator.clipboard.writeText(url);

      this.copied.set(true);

      setTimeout(() => {
        this.copied.set(false);
      }, 2000);

      toast.success(this.transloco.translate("preview.linkCopiedToClipboard"), { duration: 2000 });
    }
  }

  toggleExtended(): void {
    this.extended.set(!this.extended());
  }

  onExpand(): void {
    this.previewDialog()?.open(this.article() as Article);
  }

  handleClose() {
    // remove the id query param to prevent the preview from opening again when navigating back to the page after closing the preview
    this.queryParamsStore.patch({ id: undefined });
    // clear the selection
    this.selectionStore.clear();
  }
}
