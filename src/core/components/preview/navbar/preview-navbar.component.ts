import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HashMap, Translation, TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { Article } from '@sinequa/atomic';
import { DrawerStackService, PreviewService, cn } from '@sinequa/atomic-angular';

import { BookmarkButtonComponent } from '@/core/features/bookmarks/button/bookmark-button.component';
import { DrawerService } from '../../drawer/drawer.service';

export type PreviewNavbarConfig = {
  showOpenButton?: boolean;
  showSearchButton?: boolean;
}

const DEFAULT_CONFIG: PreviewNavbarConfig = {
  showOpenButton: true,
  showSearchButton: true
}

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-preview-navbar',
  standalone: true,
  imports: [NgClass, AsyncPipe, BookmarkButtonComponent, TranslocoPipe],
  templateUrl: './preview-navbar.component.html',
  styleUrl: './preview-navbar.component.scss',
  providers: [provideTranslocoScope({ scope: 'preview', loader })]
})
export class PreviewNavbarComponent {
  cn = cn;

  @Input() public set config(config: PreviewNavbarConfig) {
    this.navConfig = { ...DEFAULT_CONFIG, ...config };
  }
  public readonly article = input<Partial<Article> | undefined>();
  public readonly canBookmark = input<boolean>(true);

  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly drawerService = inject(DrawerService);
  protected readonly previewService = inject(PreviewService);

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;

  readonly hasExternalLink = computed(() => !!this.article()?.url1);
  readonly isExtended = toSignal(this.drawerService.isExtended);

  public copied: boolean = false;

  private readonly transloco = inject(TranslocoService);

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
