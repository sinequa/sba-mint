import { SourceIconPipe } from '@/app/pipes/source-icon.pipe';
import { BookmarksService } from '@/app/services/bookmarks.service';
import { Bookmark } from '@/app/types/user-settings';
import { Component, effect, inject, signal } from '@angular/core';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [SourceIconPipe],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent {
  protected bookmarks = signal<Bookmark[]>([]);

  private readonly bookmarksService = inject(BookmarksService);

  constructor() {
    effect(() => {
      const bookmarks = this.bookmarksService.getBookmarks();
      this.bookmarks.set(bookmarks);
    }, { allowSignalWrites: true });
  }

  public bookmarkClicked(bookmark: Bookmark): void {
    console.log(bookmark);
  }

  public removeBookmark(index: number): void {
    const bookmarks = this.bookmarksService.getBookmarks();
    bookmarks.splice(index, 1);
    this.bookmarks.set(bookmarks);
    this.bookmarksService.updateBookmarks(bookmarks);
  }
}