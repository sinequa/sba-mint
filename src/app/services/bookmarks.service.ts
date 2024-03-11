import { Injectable, inject } from '@angular/core';
import { Article } from '@mint/types/articles/article.type';
import { Bookmark } from '@mint/types/articles/user-settings';
import { UserSettingsService } from './user-settings.service';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  private readonly userSettingsService = inject(UserSettingsService);

  public async getBookmarks(): Promise<Bookmark[]> {
    const { bookmarks } = await this.userSettingsService.getUserSettings();

    if (bookmarks === undefined) {
      this.userSettingsService.patchUserSettings({ bookmarks: [] });
      return [];
    }

    return bookmarks;
  }

  public async bookmark(article: Article): Promise<void> {
    if (!article.id) return;

    const bookmarks = await this.getBookmarks();

    if (bookmarks.find(b => b.id === article.id)) return;

    bookmarks.push({
      id: article.id,
      label: article.title,
      source: article.treepath?.[0],
      author: article.authors?.[0],
      parentFolder: article.parentFolder
    });

    this.userSettingsService.patchUserSettings({ bookmarks });
  }

  public async unbookmark(id: string): Promise<void> {
    if (!id) return;

    const bookmarks = await this.getBookmarks();
    const index = bookmarks?.findIndex((bookmark) => bookmark.id === id);

    if (index === -1) return;

    bookmarks.splice(index, 1);

    this.userSettingsService.patchUserSettings({ bookmarks });
  }

  public async toggleBookmark(article: Bookmark | Pick<Bookmark, 'id'>): Promise<void> {
    const isBookmarked = await this.isBookmarked(article.id);

    if (isBookmarked)
      this.unbookmark(article.id);
    else
      this.bookmark(article as Article);
  }

  public async isBookmarked(id: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks();

    return !!bookmarks?.find((bookmark) => bookmark.id === id);
  }

  public async getBookmark(id: string): Promise<Bookmark | undefined> {
    const bookmarks = await this.getBookmarks();

    return bookmarks?.find((bookmark) => bookmark.id === id);
  }
}
