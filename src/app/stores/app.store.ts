import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, map } from 'rxjs';

import { CCApp, CCWebService } from '@sinequa/atomic';
import { AppService } from '@sinequa/atomic-angular';

import { CJAggregation, CJAggregationItem, CustomizationJson } from '../types';

type CCWebServiceLabels = CCWebService & {
  privateLabelsField: string;
  publicLabelsField: string;
}

const intialState: CCApp = {
  webServices: {},
  data: {} as CustomizationJson,
} as CCApp;

export const AppStore = signalStore(
  { providedIn: 'root' },
  withDevtools('App'),
  withState(intialState),
  withComputed(({data}) => ({
    customizationJson: computed(() => data() as CustomizationJson),
    sources: computed(() => (data() as CustomizationJson).sources || []),
  })),
  withMethods((store, appService = inject(AppService)) => ({
    initialize() {
      return firstValueFrom(appService.getApp().pipe(map(app => patchState(store, app))));
    },
    update( app: CCApp) {
      patchState(store, (state) => {
        return { ...state, ...app }
      })
    },
  /**
   * Returns the web service by type name
   *
   * @param type Web service type name
   * @returns A {@link CCWebService} object or undefined if not found
   */
    getWebServiceByType(type: CCWebService['webServiceType']): CCWebService | undefined {
      let webService = undefined;

      Object.keys(store.webServices())
        .forEach((key) => {
          const ws = store.webServices()[key];
          if (ws.webServiceType === type) webService = ws;
        });

      return webService;
    },

  /**
   * Retrieves the private and public labels from the web service.
   * @returns An array containing the private and public labels.
   */
    getLabels(): {private: string, public: string} {
      const labels = this.getWebServiceByType('Labels') as CCWebServiceLabels;
      if(!labels) return {private: '', public: ''};
      const {publicLabelsField, privateLabelsField} = labels;
      return ({private: privateLabelsField, public: publicLabelsField});
    },

    getAggregationIcon(column: string): string | undefined {
      return store.customizationJson().aggregations?.find(
        (aggregation: CJAggregation) => aggregation.column === column
      )?.icon;
    },

    getAggregationItemsCustomization(column: string): CJAggregationItem[] | undefined {
      return store.customizationJson().aggregations?.find(
        (aggregation: CJAggregation) => aggregation.column === column
      )?.items || [];
    }
  }))
);
