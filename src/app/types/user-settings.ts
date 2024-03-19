import { UserSettings as UserSettingsBase } from "@sinequa/atomic";

export type Bookmark = {
  id: string,
  queryName?: string;
  label?: string;
  source?: string;
  sourceIconClass?: string;
  author?: string;
  parentFolder?: string;
  parentFolderIconClass?: string;
};
export type RecentSearch = { url: string, date: string, display: string };
export type SavedSearch = { url: string, date: string, display: string };

export type UserSettings = UserSettingsBase & {
  bookmarks?: Bookmark[],
  recentSearches?: RecentSearch[],
  savedSearches?: SavedSearch[]
};
