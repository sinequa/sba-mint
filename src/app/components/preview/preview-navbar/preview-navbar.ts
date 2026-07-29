import { Location, NgTemplateOutlet } from "@angular/common";
import { Component, DestroyRef, Input, computed, inject, input, model, signal, viewChild } from "@angular/core";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { toast } from "ngx-sonner";

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Event, NavigationEnd, Router } from "@angular/router";
import { Article } from "@sinequa/atomic";
import { AppStore, BookmarkButtonComponent, DrawerNavbarComponent, DrawerPreviewComponent, DrawerService, PreviewService } from "@sinequa/atomic-angular";
import { ButtonComponent, CircleCheckIconComponent, LinkIcon, Separator, cn } from "@sinequa/ui";
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
 * Navigation bar component for the preview feature.
 * @deprecated This component will be removed in future releases.
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
    DrawerNavbarComponent,
    PreviewDialogComponent,
    Separator
  ],
  templateUrl: "./preview-navbar.html",
  providers: [DrawerService]
})
export class PreviewNavbarComponent {
  cn = cn;

  /* drawer related references — only tells the template which navbar shell to render */
  protected drawerPreviewRef = inject(DrawerPreviewComponent, { skipSelf: true, optional: true });

  protected readonly previewService = inject(PreviewService);
  protected readonly location = inject(Location);
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  protected readonly destroyRef = inject(DestroyRef);

  readonly previewDialog = viewChild(PreviewDialogComponent);

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;
  @Input() public set config(config: PreviewNavbarConfig) {
    this.navConfig = { ...DEFAULT_CONFIG, ...config };
  }

  /* opens the preview's floating advanced-search panel, overlaid on top of the document */
  public readonly extended = model(false);

  public readonly article = input<Partial<Article> | undefined>();
  public readonly canBookmark = input<boolean>(true);
  readonly isExternalLinkValid = computed(() => {
    if (!this.article()?.url1) return false;

    try {
      const url = new URL(this.article()?.url1!);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
      return false;
    }
  });

  expandPreview = computed(() => true); //this.appStore.general()?.features?.expandPreview);

  public copied = signal(false);
  public backLevel = 0;

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.backLevel--;
      }
    });
  }
  openClicked(): void {
    // open the preview in a new tab and audit the action
    this.previewService.openExternal(this.article() as Article);
  }

  copyLink(): void {
    if (this.copied()) {
      return;
    }

    const url = this.article()?.url1 || this.article()?.url2;

    if (url) {
      navigator.clipboard.writeText(url);

      this.copied.set(true);

      setTimeout(() => {
        this.copied.set(false);
      }, 2000);

      toast.success(this.transloco.translate("preview.linkCopiedToClipboard"), { duration: 2000 });
    }
  }

  /**
   * Toggles the preview's floating advanced-search panel.
   *
   * Inside a drawer this used to widen the drawer stack instead — which is precisely the resize the
   * floating panel removes: the panel now overlays the document in both cases.
   */
  toggle(): void {
    this.extended.set(!this.extended());
  }

  onExpand(): void {
    this.previewDialog()?.open(this.article() as Article);
  }
}
