import { Location, NgTemplateOutlet } from "@angular/common";
import { Component, computed, Input, inject, input, model, output, signal, viewChild } from "@angular/core";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { Article } from "@sinequa/atomic";
import { AppStore, BookmarkButtonComponent, PreviewService, QueryParamsStore, SelectionStore } from "@sinequa/atomic-angular";
import {
  ArrowLeftIcon,
  ArrowUpRightFromSquareIcon,
  ButtonComponent,
  CircleCheckIconComponent,
  cn,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  Separator,
  SheetCloseDirective
} from "@sinequa/ui";
import { toast } from "ngx-sonner";
import { injectTabletBreakpoint } from "../../../composables/inject-tablet-breakpoint";
import { PreviewDialogComponent } from "../dialog/preview-dialog";
import { PreviewDisplayModeService } from "../preview-display-mode.service";

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
    SheetCloseDirective,
    ArrowLeftIcon,
    ArrowUpRightFromSquareIcon,
    EyeSlashIcon,
    EyeIcon
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
  private readonly tabletBreakpoint = injectTabletBreakpoint();
  private readonly previewDisplayMode = inject(PreviewDisplayModeService);

  readonly previewDialog = viewChild(PreviewDialogComponent);

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;
  @Input() public set config(config: PreviewNavbarConfig) {
    this.navConfig = { ...DEFAULT_CONFIG, ...config };
  }

  onClose = output();

  /* used to toggle the extended view when not displayed inside the drawer */
  public readonly extended = model(false);

  public readonly article = input<Partial<Article> | undefined>();
  public readonly canBookmark = input<boolean>(true);

  /** True when hosted inside a `sheet-previewer` sheet (see `PreviewComponent.hostedInSheet`). */
  public readonly hostedInSheet = input(false);

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

  /**
   * On tablet widths, `PreviewDialogComponent` (desktop tabs/chat/advanced-search) is too cramped to
   * be usable. Outside a `sheet-previewer` sheet there's nothing to swap it for (see `onExpand()`),
   * so the button is hidden there instead — e.g. `agent-preview` on `/chat`, whose panel already goes
   * full-screen at that width via its own `activeMobilePanel()` toggle.
   */
  showExpandButton = computed(() => this.expandPreview() && (!this.tabletBreakpoint.isTabletOrMobile() || this.hostedInSheet()));

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
    if (!this.tabletBreakpoint.isTabletOrMobile()) {
      this.previewDialog()?.open(this.article() as Article);
    } else if (this.hostedInSheet()) {
      // swap the sheet already open in sheet-previewer to its simplified view, in place
      this.previewDisplayMode.enableSimple();
    }
    // else: ipad/mobile width outside a sheet-previewer sheet — the button is hidden (showExpandButton), unreachable
  }

  handleClose() {
    // remove the id query param to prevent the preview from opening again when navigating back to the page after closing the preview
    this.queryParamsStore.patch({ id: undefined });
    // clear the selection
    this.selectionStore.clear();
    this.onClose.emit();
  }
}
