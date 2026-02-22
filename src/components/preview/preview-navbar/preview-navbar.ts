import { Location, NgTemplateOutlet } from "@angular/common";
import { Component, computed, Input, inject, input, model, signal, viewChild } from "@angular/core";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { Article } from "@sinequa/atomic";
import { AppStore, BookmarkButtonComponent, PreviewService, SelectionStore } from "@sinequa/atomic-angular";
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

  readonly previewDialog = viewChild(PreviewDialogComponent);

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;
  @Input() public set config(config: PreviewNavbarConfig) {
    this.navConfig = { ...DEFAULT_CONFIG, ...config };
  }

  /* used to toggle the extended view when not displayed inside the drawer */
  public readonly extended = model(false);

  public readonly article = input<Partial<Article> | undefined>();
  public readonly canBookmark = input<boolean>(true);
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
    this.selectionStore.clear();
  }
}
