import { AggregationEx } from "@/app/services";


export type FilterDropdown = {
  label: string;
  aggregation: AggregationEx;
  icon?: string;
  currentFilter?: string;
  moreFiltersCount?: number;
}
