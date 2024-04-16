import { AggregationEx } from "@/app/services";
import { Filter } from "@/app/utils";


export type FilterDropdown = {
  label: string;
  aggregation: AggregationEx;
  icon?: string;
  currentFilter?: Filter;
  value?: { operator?: string, text: string };
  moreFiltersCount?: number;
}
