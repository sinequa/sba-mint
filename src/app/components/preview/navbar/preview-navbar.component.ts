import { BookmarksService } from '@/app/services/bookmarks.service';
import { userSettingsStore } from '@/app/stores/user-settings.store';
import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { DrawerStackService } from '@mint/components/drawer-stack/drawer-stack.service';
import { Article } from '@sinequa/atomic';
import { combineLatest, filter, map } from 'rxjs';

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
  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;
  protected isBookmarked = combineLatest([
    userSettingsStore.current$,
    toObservable(this.article)
      .pipe(
        filter((article) => !!article)
      )
  ]).pipe(
    map(([userSettings, article]) => {
      if (!userSettings || !article) return false;
      return userSettings.bookmarks?.find((bookmark) => bookmark.id === article.id);
    })
  );

  private readonly bookmarksService = inject(BookmarksService);
}
