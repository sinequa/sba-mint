import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';

import { cn } from '@sinequa/atomic-angular';
import { Article } from '@sinequa/atomic';

import { DrawerStackService } from '@sinequa/atomic-angular';

import { BookmarkButtonComponent } from '../../bookmark/bookmark-button.component';
import { DrawerService } from '../../drawer/drawer.service';


export type PreviewNavbarConfig = {
  showOpenButton?: boolean;
  showSearchButton?: boolean;
}

const DEFAULT_CONFIG: PreviewNavbarConfig = {
  showOpenButton: true,
  showSearchButton: true
}

@Component({
  selector: 'app-preview-navbar',
  standalone: true,
  imports: [NgClass, AsyncPipe, BookmarkButtonComponent],
  templateUrl: './preview-navbar.component.html',
  styleUrl: './preview-navbar.component.scss'
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

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;

  readonly hasExternalLink = computed(() => !!this.article()?.url1);
  readonly isExtended = toSignal(this.drawerService.isExtended);

  public copied: boolean = false;

  openClicked(): void {
    window.open(this.article()?.url1, '_blank', 'noopener noreferrer');
  }

  public copyLink(): void {
    const url = this.article()?.url1 || this.article()?.url2;
    if (url) {
      navigator.clipboard.writeText(url);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 3000);

      toast.success('Link copied to clipboard', { duration: 2000 });
    }
  }
}
