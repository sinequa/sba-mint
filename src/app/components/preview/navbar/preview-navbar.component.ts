import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, input } from '@angular/core';

import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { DrawerService } from '@/app/components/drawer/drawer.service';
import { UserSettingsStore } from '@/app/stores';
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

  @Output() public bookmark = new EventEmitter<void>();

  protected drawerStack = inject(DrawerStackService);
  protected drawerService = inject(DrawerService);
  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;

  userSettingsStore = inject(UserSettingsStore);

  protected isBookmarked =  computed(() => {
    const { bookmarks } = getState(this.userSettingsStore);
    const article = this.article();

    if(!article) return false;
    return bookmarks?.find((bookmark) => bookmark.id === article.id);
  })
}
