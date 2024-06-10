import { Aggregation } from "@sinequa/atomic";

export type Autocomplete = {
  bookmarks?: number;
  recentSearches?: number;
  savedSearches?: number;
}

export type CJAggregationItem = {
  value?: string;
  icon?: string;
}

export type CJAggregation = Pick<Aggregation, 'column' | 'items'> & {
  column: string;   // The column name
  display?: string; // The display name who is shown in the UI
  icon?: string;
  items?: CJAggregationItem[];
}

export type CJSource = {
  name: string;
  icon?: string;
  iconPath?: string;
}

export type Features = {
  allowChatDrawer?: boolean;
  applications?: boolean;
}

export type SourceTagMap = {
  sources: string[],
  tags: string[]
};

export type UserFeatures = {
  recentSearches?: boolean;
  savedSearches?: boolean;
  bookmarks?: boolean;
}

export type CJApplication = {
  name: string;
  icon?: string;
  iconPath?: string;
  url?: string;
};

// Main configuration object
export type CustomizationJson = {
  aggregations?: CJAggregation[];
  applications?: CJApplication[];
  autocomplete?: Autocomplete;
  features?: Features;
  sourcesTagsMap?: SourceTagMap[];
  tabs?: Record<string, string[]>;
  userFeatures?: UserFeatures;
  sources?: CJSource[];
  globalRelevanceOverride?: number;
}
