import { CCApp, CCWebService } from '@sinequa/atomic';

import { AggregationCustomization, AggregationItemCustomization, Customization } from '../types';
import { Store } from './store';

const mockAggregations: AggregationCustomization[] = [
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

export class AppStore extends Store<CCApp> {
  override set(state: CCApp): void {
    state.data = { ...state.data, aggregations: mockAggregations };
    super.set(state);
  }

  /**
   * Returns the web service by type name
   * @param type Web service type name
   * @returns A {@link CCWebService} object or undefined if not found
   */
  getWebServiceByType(type: CCWebService['webServiceType']): CCWebService | undefined {
    if (!this.state?.webServices) return undefined;

    let webService = undefined;

    Object.keys(this.state.webServices)
      .forEach((key) => {
        const ws = this.state!.webServices[key];
        if (ws.webServiceType === type) webService = ws;
      });

    return webService;
  }

  getCustomizationJson(): Customization | undefined {
    return this.state?.data;
  }

  getAggregationIconClass(column: string): string | undefined {
    return this.getCustomizationJson()?.aggregations?.find(
      (aggregation: AggregationCustomization) => aggregation.column === column
    )?.iconClass;
  }

  getAggregationItemsCustomization(column: string): AggregationItemCustomization[] | undefined {
    return this.getCustomizationJson()?.aggregations?.find(
      (aggregation: AggregationCustomization) => aggregation.column === column
    )?.items;
  }
}

export const appStore = new AppStore();
