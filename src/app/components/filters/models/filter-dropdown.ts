import { AggregationEx } from "@/app/services";
import { Filter } from "@/app/utils";


export type FilterDropdown = {
  label: string;              // The label of the filter
  aggregation: AggregationEx; // The aggregation object
  icon?: string;              // The icon of the filter
  currentFilter?: Filter;     // The current filters
  value?: { operator?: string, text: string, display?: string }; // The value of the filter first filter
  moreFiltersCount?: number;  // The number of filters that are not displayed
}
