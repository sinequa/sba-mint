import { Aggregation } from "@sinequa/atomic";

export type FilterDropdown = {
  label: string;
  aggregation: Aggregation;
  iconClass?: string;
  currentFilter?: string;
  moreFiltersCount?: number;
}
