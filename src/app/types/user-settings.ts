import { QueryParams } from "../utils";

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
export type RecentSearch = {
  url: string,
  display: string
  label?: string;
  filterCount?: number;
  date: string;
  queryParams?: QueryParams;

};
export type SavedSearch = { url: string, date: string, display: string };

export type UserSettings = {
  bookmarks: Bookmark[],
  recentSearches: RecentSearch[],
  savedSearches: SavedSearch[],
  assistants: Record<string, unknown>
};
