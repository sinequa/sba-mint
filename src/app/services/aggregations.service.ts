import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Aggregation, AggregationItem, TreeAggregation, TreeAggregationNode } from '@sinequa/atomic';
import { AggregationService } from '@sinequa/atomic-angular';

import { AggregationsStore } from '@/stores';


export type DateFilterCode = 'last-day' | 'last-week' | 'last-month' | 'last-year' | 'last-3-years' | 'before-last-year' | 'custom-range';

export type DateFilter = {
  label?: string;
  code?: DateFilterCode;
  calculated?: () => [DateFilterCode, Date | null, Date | null];
  operator?: string;
  value?: string;
  display?: string;
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

  private readonly mockDates: DateFilter[] = [
    {
      label: 'Since yesterday',
      code: 'last-day',
      calculated: () => [
        'last-day',
        new Date(Date.now() - (24 * 60 * 60 * 1000)),
        new Date()
      ]
    },
    {
      label: 'This week',
      code: 'last-week',
      calculated: () => [
        'last-week',
        new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
        new Date()
      ]
    },
    {
      label: 'This month',
      code: 'last-month',
      calculated: () => [
        'last-month',
        new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)),
        new Date()
      ]
    },
    {
      label: 'This year',
      code: 'last-year',
      calculated: () => [
        'last-year',
        new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)),
        new Date()
      ]
    },
    {
      label: 'Last 3 years',
      code: 'last-3-years',
      calculated: () => [
        'last-3-years',
        new Date(0),
        new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000))
      ]
    },
    {
      label: 'Before last year',
      code: 'before-last-year',
      calculated: () => [
        'before-last-year',
        new Date(0),
        new Date(Date.now() - (365 * 24 * 60 * 60 * 1000))
      ]
    },
    {
      label: 'Custom range',
      code: 'custom-range',
      calculated: () => ['custom-range', null, null]
    }
  ]

  public getMockDateAggregation$(): Observable<DateFilter[]> {
    return of(this.mockDates);
  }
}
