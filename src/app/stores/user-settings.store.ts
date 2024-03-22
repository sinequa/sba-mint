import { UserSettings } from '@/app/types';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { fetchUserSettings, patchUserSettings } from '@sinequa/atomic';

const initialState: UserSettings = {
  bookmarks: [],
  recentSearches: [],
  savedSearches: []
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
    }
  }))
);