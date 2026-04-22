import { Location, NgTemplateOutlet } from "@angular/common";
import { Component, computed, DestroyRef, Input, inject, input, model, signal, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Event, NavigationEnd, Router } from "@angular/router";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { Article } from "@sinequa/atomic";
import {
  BookmarkButtonComponent,
  DrawerNavbarComponent,
  DrawerPreviewComponent,
  DrawerService,
  DrawerStackService,
  PreviewService
} from "@sinequa/atomic-angular";
import {
  ArrowLeftIcon,
  ArrowUpRightFromSquareIcon,
  ButtonComponent,
  CircleCheckIconComponent,
  cn,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  Separator
} from "@sinequa/ui";
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
    Separator,
    ArrowLeftIcon,
    ArrowUpRightFromSquareIcon,
    EyeSlashIcon,
    EyeIcon
  ],
  templateUrl: "./preview-navbar.html",
  providers: [DrawerService]
})
export class PreviewNavbarComponent {
  cn = cn;

  /* drawer related services and references */
  protected drawerPreviewRef = inject(DrawerPreviewComponent, { skipSelf: true, optional: true });
  protected readonly drawerStack = inject(DrawerStackService, { optional: true });

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

  /* used to toggle the extended view when not displayed inside the drawer */
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

  /**
   * Computed property that determines whether the navigation bar is in an extended state.
   * It returns `true` if either the drawer referenced by `drawerPreviewRef` is extended,
   * or if the local `extended` state is true.
   *
   * @returns {boolean} `true` if the navigation bar should be extended; otherwise, `false`.
   */
  public isExtended = computed(() => this.drawerPreviewRef?.drawer.isExtended() || this.extended());

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
   * Toggles the state of the navigation bar.
   *
   * If a drawer preview reference exists, it attempts to extend the drawer stack.
   * Otherwise, it toggles the `extended` state between true and false.
   */
  toggle(): void {
    if (this.drawerPreviewRef) {
      this.drawerStack?.extend();
    } else {
      this.extended.set(!this.extended());
    }
  }

  onExpand(): void {
    this.previewDialog()?.open(this.article() as Article);
  }
}
