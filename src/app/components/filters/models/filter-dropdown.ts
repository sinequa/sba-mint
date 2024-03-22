import { Aggregation } from "@sinequa/atomic";

export type FilterDropdown = {
  label: string;
  aggregation: Aggregation;
  icon?: string;
  currentFilter?: string;
  moreFiltersCount?: number;
}
