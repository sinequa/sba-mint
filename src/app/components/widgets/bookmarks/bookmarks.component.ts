import { SourceIconPipe } from '@/app/pipes/source-icon.pipe';
import { Bookmark } from '@/app/types/user-settings';
import { Component, effect, inject, signal } from '@angular/core';
import { Query } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { DrawerStackService } from '../../drawer-stack/drawer-stack.service';
import { UserSettingsStore } from '@/app/stores';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [SourceIconPipe],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent {
  private readonly drawerStack = inject(DrawerStackService);
  private readonly queryService = inject(QueryService);
  private readonly userSettingsStore = inject(UserSettingsStore);

  protected bookmarks = signal<Bookmark[]>([]);


  constructor() {
    effect(() => {
      const bookmarks = this.userSettingsStore.bookmarks();
      this.bookmarks.set(bookmarks);
    }, { allowSignalWrites: true });
  }

  public bookmarkClicked(bookmark: Bookmark): void {

    // if the bookmark was created before the queryName was added, don't try to open it
    if (!bookmark.queryName) return;

    const query: Partial<Query> = {
      name: bookmark.queryName,
      filters: {
        field: "id",
        value: bookmark.id
      }
    }
    this.queryService.search(query).subscribe((result) => {
      if (!result.records) return;
      this.drawerStack.replace(result.records[0]);
    });
  }

  public removeBookmark(bookmark: Bookmark): void {
    this.userSettingsStore.unbookmark(bookmark.id);
  }
}