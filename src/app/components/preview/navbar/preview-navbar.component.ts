import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, input } from '@angular/core';

import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { DrawerService } from '@/app/components/drawer/drawer.service';
import { UserSettingsStore } from '@/app/stores';
import { PreviewService } from '@/app/services/preview';
import { Article } from '@/app/types/articles';
import { getState } from '@ngrx/signals';

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
  imports: [AsyncPipe],
  templateUrl: './preview-navbar.component.html',
  styleUrl: './preview-navbar.component.scss'
})
export class PreviewNavbarComponent {
  @Input() public set config(config: PreviewNavbarConfig) {
    this.navConfig = { ...DEFAULT_CONFIG, ...config };
  }
  public readonly article = input<Partial<Article> | undefined>();

  @Output() public readonly bookmark = new EventEmitter<void>();

  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly drawerService = inject(DrawerService);
  private readonly previewService = inject(PreviewService);
  readonly userSettingsStore = inject(UserSettingsStore);

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;

  protected readonly isBookmarked = computed(() => {
    const { bookmarks } = getState(this.userSettingsStore);
    const article = this.article();

    if (!article) return false;
    return bookmarks?.find((bookmark) => bookmark.id === article.id);
  })

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
    }
  }
}
