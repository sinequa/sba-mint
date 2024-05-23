import { Article, UserSettings } from '@/app/types';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { deleteUserSettings, fetchUserSettings, patchUserSettings } from '@sinequa/atomic';

const initialState: UserSettings = {
  bookmarks: [],
  recentSearches: [],
  savedSearches: [],
  assistants: {}
};

export const UserSettingsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('UserSettings'),
  withState(initialState),
  withMethods((store) => ({
    async initialize(): Promise<void> {
      const settings = await fetchUserSettings<UserSettings>();
      patchState(store, settings);
    },
    async reset(): Promise<void> {
      await deleteUserSettings();
      patchState(store, initialState);
    },
    async updateBookmarks(bookmarks: UserSettings['bookmarks']) {
      await patchUserSettings({ bookmarks });
      patchState(store, (state) => {
        return { ...state, bookmarks };
      })
    },
    async updateRecentSearches(recentSearches: UserSettings['recentSearches']) {
      await patchUserSettings({ recentSearches });
      patchState(store, (state) => {
        return { ...state, recentSearches };
      })
    },
    async updateSavedSearches(savedSearches: UserSettings['savedSearches']) {
      await patchUserSettings({ savedSearches });
      patchState(store, (state) => {
        return { ...state, savedSearches };
      })
    },
    async updateAssistantSettings(assistantSettings: UserSettings['assistants']) {
      patchState(store, (state) => {
        return { ...state, assistants: assistantSettings };
      })
    },
    async bookmark(article: Article) {
      if (!article.id) return;

      if(this.isBookmarked(article.id)) return;

      const bookmark = {
        id: article.id,
        label: article.title,
        source: article.collection[0],
        author: article.authors?.[0],
        parentFolder: article.parentFolder,
        queryName: article.$queryName
      };
      this.updateBookmarks([...store.bookmarks(), bookmark ]);
    },
    async unbookmark(id: string) {
      if (!id) return;

      const bookmarks = store.bookmarks();
      const index = bookmarks?.findIndex((bookmark) => bookmark.id === id);

      if (index === -1) return;

      bookmarks.splice(index, 1);
      this.updateBookmarks([...bookmarks]);
    },
    isBookmarked(id: string): boolean {
      const bookmarks = store.bookmarks();

      return !!bookmarks?.find((bookmark) => bookmark.id === id);
    },
    async toggleBookmark(article: Article) {
      const isBookmarked = await this.isBookmarked(article.id);

      if (isBookmarked)
        this.unbookmark(article.id);
      else
        this.bookmark(article);
    }
  }))
);