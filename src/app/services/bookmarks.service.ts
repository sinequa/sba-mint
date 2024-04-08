import { Injectable, inject } from '@angular/core';
import { Article } from '../types/articles';
import { Bookmark } from '../types/user-settings';
import { UserSettingsStore } from '../stores';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  store = inject(UserSettingsStore);

  public getBookmarks(): Bookmark[] {
    return this.store.bookmarks();
  }

  public bookmark(article: Article) {
    if (!article.id) return;

    const bookmarks = this.store.bookmarks();

    if (bookmarks.find(b => b.id === article.id)) return;

    bookmarks.push({
      id: article.id,
      label: article.title,
      source: article.treepath?.[0],
      author: article.authors?.[0],
      parentFolder: article.parentFolder,
      queryName: article.$queryName
    });

    this.store.updateBookmarks(bookmarks);
  }

  public unbookmark(id: string) {
    if (!id) return;

    const bookmarks = this.store.bookmarks();
    const index = bookmarks?.findIndex((bookmark) => bookmark.id === id);

    if (index === -1) return;

    bookmarks.splice(index, 1);
    this.store.updateBookmarks(bookmarks);
  }

  public toggleBookmark(article: Bookmark | Pick<Bookmark, 'id'>) {
    const isBookmarked = this.isBookmarked(article.id);

    if (isBookmarked)
      this.unbookmark(article.id);
    else
      this.bookmark(article as Article);
  }

  public isBookmarked(id: string): boolean {
    const bookmarks = this.store.bookmarks();

    return !!bookmarks?.find((bookmark) => bookmark.id === id);
  }

  public getBookmark(id: string): Bookmark | undefined {
    const bookmarks = this.store.bookmarks();
    return bookmarks?.find((bookmark) => bookmark.id === id);
  }

  public updateBookmarks(bookmarks: Bookmark[]) {
    this.store.updateBookmarks(bookmarks);
  }
}
