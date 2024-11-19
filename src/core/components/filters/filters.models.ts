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
