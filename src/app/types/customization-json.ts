import { Aggregation } from "@sinequa/atomic";

export type Autocomplete = {
  bookmarks?: number;
  recentSearches?: number;
  savedSearches?: number;
}

export type UserFeatures = {
  recentSearches?: boolean;
  savedSearches?: boolean;
  bookmarks?: boolean;
}

export type Features = {
  applications?: boolean;
}

export type CJAggregationItem = {
  value?: string;
  icon?: string;
}

export type CJAggregation = Pick<Aggregation, 'column' | 'items'> & {
  icon?: string;
  items?: CJAggregationItem[];
}

// Main configuration object
export type CustomizationJson = {
  aggregations?: CJAggregation[];
  autocomplete?: Autocomplete;
  userFeatures?: UserFeatures;
  features?: Features;
}

