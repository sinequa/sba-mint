import { Injectable } from '@angular/core';
import { AggregationCustomization, AggregationItemCustomization, customizationStore } from '../stores/customization.store';

@Injectable({
  providedIn: 'root'
})
export class CustomizationService {
  private readonly aggregationColumnCustomization: AggregationCustomization[] = [
    { column: 'authors', iconClass: 'far fa-user', items: [] },
    { column: 'date', iconClass: 'far fa-calendar-day', items: [] },
    { column: 'doctype', iconClass: 'far fa-file', items: [] },
    { column: 'enginecsv1', iconClass: 'far fa-tag', items: [] },
    { column: 'languages', iconClass: 'far fa-language', items: [] },
    { column: 'mentioned', iconClass: 'far fa-comment', items: [] },
    { column: 'geo', iconClass: 'far fa-location-dot', items: [] },
    { column: 'company', iconClass: 'far fa-buildings', items: [] },
    {
      column: 'treepath', iconClass: 'far fa-code-fork', items: [
        { value: 'Sharepoint', iconClass: 'fab fa-microsoft' },
        { value: 'iManage', iconClass: 'fab fa-dropbox' }
      ]
    }
  ];

  constructor() {
    customizationStore.assign({ aggregations: this.aggregationColumnCustomization });
  }

  public getAggregationIconClass(column: string): string | undefined {
    return customizationStore.state?.aggregations?.find(
      (aggregation: AggregationCustomization) => aggregation.column === column
    )?.iconClass;
  }

  public getAggregationItemsCustomization(column: string): AggregationItemCustomization[] | undefined {
    return customizationStore.state?.aggregations?.find(
      (aggregation: AggregationCustomization) => aggregation.column === column
    )?.items;
  }
}
