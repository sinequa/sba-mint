import { Injectable, inject } from '@angular/core';

import { Aggregation, AggregationItem, TreeAggregation, TreeAggregationNode } from '@sinequa/atomic';
import { AggregationService } from '@sinequa/atomic-angular';

import { AggregationsStore } from '@/app/stores';

export type DateFilter = {
  label?: string;
  operator?: string;
  value?: string;
  range?: [string, string];
  display?: string;
  disabled?: boolean;
}

export type AggregationListItem = (AggregationItem & TreeAggregationNode) & {
  icon?: string;
};
// override Aggregation and TreeAggregation types
export type AggregationListEx = Aggregation & { items: AggregationListItem[] };
export type AggregationTreeEx = TreeAggregation & { items: AggregationListItem[] };
export type AggregationEx = AggregationListEx | AggregationTreeEx;

@Injectable({
  providedIn: 'root'
})
export class AggregationsService extends AggregationService {
  protected readonly aggregationsStore = inject(AggregationsStore);

  public getAggregation(column: string): Aggregation | undefined {
    return this.aggregationsStore.getAggregation(column, "column");
  }

  public getAggregationItems(column: string): AggregationItem[] | undefined {
    return this.getAggregation(column)?.items;
  }
}
