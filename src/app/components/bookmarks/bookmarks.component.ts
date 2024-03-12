import { TreepathToIconClassPipe } from '@/app/pipes/treepath-to-icon-class.pipe';
import { BookmarksService } from '@/app/services/bookmarks.service';
import { UserSettingsService } from '@/app/services/user-settings.service';
import { Bookmark } from '@/app/types/user-settings';
import { Component, OnInit, inject, signal } from '@angular/core';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [TreepathToIconClassPipe],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent implements OnInit {
  protected bookmarks = signal<Bookmark[]>([]);

  private readonly userSettingsService = inject(UserSettingsService);
  private readonly bookmarksService = inject(BookmarksService);

  ngOnInit(): void {
    this.bookmarksService.getBookmarks().then((bookmarks) => {
      this.bookmarks.set((bookmarks || []) as Bookmark[])
    });
  }

  public bookmarkClicked(bookmark: Bookmark): void {
    console.log(bookmark);
  }

  public removeBookmark(index: number): void {
    this.bookmarksService.getBookmarks().then((bookmarks) => {
      bookmarks.splice(index, 1);
      this.userSettingsService.patchUserSettings({ bookmarks });
      this.bookmarks.set(bookmarks);
    });
  }
}