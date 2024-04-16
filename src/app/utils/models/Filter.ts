import { FilterOperator } from "@sinequa/atomic";

export type Filter = {
  column: string;
  label: string | undefined;
  values: string[];
  operator?: FilterOperator;
}