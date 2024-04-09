import { SourceIconPipe } from '@/app/pipes/source-icon.pipe';
import { BookmarksService } from '@/app/services/bookmarks.service';
import { Bookmark } from '@/app/types/user-settings';
import { Component, effect, inject, signal } from '@angular/core';
import { Query } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { DrawerStackService } from '../drawer-stack/drawer-stack.service';

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

  protected bookmarks = signal<Bookmark[]>([]);

  private readonly bookmarksService = inject(BookmarksService);

  constructor() {
    effect(() => {
      const bookmarks = this.bookmarksService.getBookmarks();
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

  public removeBookmark(index: number): void {
    const bookmarks = this.bookmarksService.getBookmarks();
    bookmarks.splice(index, 1);
    this.bookmarks.set(bookmarks);
    this.bookmarksService.updateBookmarks(bookmarks);
  }
}