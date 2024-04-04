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
  icon?: string;
  items?: CJAggregationItem[];
}

export type CJSource = {
  name: string;
  icon: string;
}

export type Features = {
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

// Main configuration object
export type CustomizationJson = {
  aggregations?: CJAggregation[];
  autocomplete?: Autocomplete;
  features?: Features;
  sourcesTagsMap?: SourceTagMap[];
  tabs?: Record<string, string[]>;
  userFeatures?: UserFeatures;
  sources?: CJSource[];
}
