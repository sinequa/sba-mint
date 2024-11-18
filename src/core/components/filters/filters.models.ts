import { InjectionToken } from "@angular/core";
import { LegacyFilter } from "@sinequa/atomic";

import { CFilter } from "@sinequa/atomic-angular";

export type CFilterEx = CFilter & {
  name: string;
  count: number;
  isTree: boolean;
  disabled: boolean;
  hidden: boolean;
  legacyFilter?: LegacyFilter;
};

export const FILTERS_BREAKPOINT = new InjectionToken<number>("FILTERS_BREAKPOINT", { factory: () => 5 });
export const AUTHORED_BY_ME_DOCUMENT_FILTER_COLUMN = new InjectionToken("Authored by me document filter column", {factory: () => "employeeAuthorID"});
export const AUTHORED_BY_ME_PERSON_FILTER_COLUMN = new InjectionToken("Authored by me person filter column", {factory: () => "employeeAuthorID"});
