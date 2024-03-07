import { UserSettings as UserSettingsBase } from "@sinequa/atomic";

export type RecentSearch = { url: string, date: string };
export type SavedSearch = { url: string };

export type UserSettings = UserSettingsBase & {
  recentSearches?: RecentSearch[],
  savedSearches?: SavedSearch[]
};
