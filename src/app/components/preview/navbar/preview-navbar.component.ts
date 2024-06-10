import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input, computed, inject, input } from '@angular/core';
import { toast } from 'ngx-sonner';

import { cn } from '@sinequa/atomic-angular';

import { BookmarkComponent } from '@/app/components/bookmark/bookmark.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { DrawerService } from '@/app/components/drawer/drawer.service';
import { Article } from '@/app/types/articles';

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
  imports: [NgClass, AsyncPipe, BookmarkComponent],
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
