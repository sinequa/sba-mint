import { Location, NgTemplateOutlet } from '@angular/common';
import { Component, Input, computed, inject, input, output } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { Article } from '@sinequa/atomic';
import { BookmarkButtonComponent, DrawerNavbarComponent, DrawerPreviewComponent, DrawerService, PreviewService } from '@sinequa/atomic-angular';
import { ButtonComponent, CircleCheckIconComponent, LinkIconComponent, VerticalDividerComponent, cn } from '@sinequa/ui';

import { PreviewNavbarExtendedComponent } from './navbar-extended';

export type PreviewNavbarConfig = {
  showOpenButton?: boolean;
  showSearchButton?: boolean;
};

const DEFAULT_CONFIG: PreviewNavbarConfig = {
  showOpenButton: true,
  showSearchButton: true
};

@Component({
  selector: 'preview-navbar, PreviewNavbar, previewnavbar',
  imports: [
    NgTemplateOutlet,
    BookmarkButtonComponent,
    TranslocoPipe,
    ButtonComponent,
    LinkIconComponent,
    CircleCheckIconComponent,
    DrawerNavbarComponent,
    VerticalDividerComponent,
    PreviewNavbarExtendedComponent
  ],
  templateUrl: './navbar.html',
  providers: [DrawerService]
})
export class PreviewNavbarComponent {
  cn = cn;
  protected drawer = inject(DrawerPreviewComponent, { skipSelf: true, optional: true });

  protected readonly previewService = inject(PreviewService);
  protected readonly location = inject(Location);
  private readonly transloco = inject(TranslocoService);

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;
  @Input() public set config(config: PreviewNavbarConfig) {
    this.navConfig = { ...DEFAULT_CONFIG, ...config };
  }

  public readonly article = input<Partial<Article> | undefined>();
  public readonly canBookmark = input<boolean>(true);
  public readonly showExtended = input<boolean>(false);
  public readonly onSearchInDocument = output<boolean>();
  public extended: boolean = false;

  readonly hasExternalLink = computed(() => !!this.article()?.url1);

  public copied: boolean = false;

  openClicked(): void {
    // open the preview in a new tab and audit the action
    this.previewService.openExternal(this.article() as Article);
  }

  public copyLink(): void {
    const url = this.article()?.url1 || this.article()?.url2;

    if (url) {
      navigator.clipboard.writeText(url);

      this.copied = true;

      setTimeout(() => {
        this.copied = false;
      }, 3000);

      toast.success(this.transloco.translate('preview.linkCopiedToClipboard'), { duration: 2000 });
    }
  }
}
