import { CCApp, CCWebService } from '@sinequa/atomic';

import { CJAggregationItem, CJSource, CustomizationJson } from '../types';
import { Store } from './store';

type CCWebServiceLabels = CCWebService & {
  privateLabelsField: string;
  publicLabelsField: string;
}

export class AppStore extends Store<CCApp> {
  /**
   * Returns the web service by type name
   *
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

  /**
   * Retrieves the private and public labels from the web service.
   * @returns An array containing the private and public labels.
   */
  getLabels(): {private: string, public: string} {
    const labels = this.getWebServiceByType('Labels') as CCWebServiceLabels;
    if(!labels) return {private: '', public: ''};
    const {publicLabelsField, privateLabelsField} = labels;
    return ({private: privateLabelsField, public: publicLabelsField});
  }

  getCustomizationJson(): CustomizationJson | undefined {
    return this.state?.data;
  }

  getAggregationIcon(column: string): string | undefined {
    return this.getCustomizationJson()?.aggregations?.find(
      aggregation => aggregation.column === column
    )?.icon;
  }

  getAggregationItemsCustomization(column: string): CJAggregationItem[] | undefined {
    return this.getCustomizationJson()?.aggregations?.find(
      aggregation => aggregation.column === column
    )?.items;
  }

  getSourcesCustomization(): CJSource[] {
    return this.getCustomizationJson()?.sources || [];
  }
}

export const appStore = new AppStore();
