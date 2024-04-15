

import { QueryParams, queryParamsFromUrl } from '@/app/utils';
import { Filter } from '@/app/utils/models';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { getState, patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type QueryParamsState = QueryParams & {
  filters: Filter[];
};

const initialState: QueryParamsState = {
  filters: [],
};

export const QueryParamsStore = signalStore(
  { providedIn: 'root' },
  withDevtools("QueryParams"),
  withState(initialState),
  withMethods((store) => ({
    setFromUrl(url: string) {
      const path = url.split('?')[0];

      const { q: text, f, id, p, s: sort } = queryParamsFromUrl(url);
      const filters = f ? JSON.parse(decodeURIComponent(f)) : [];

      let page: number | undefined;
      if(p) {
        page = parseInt(p, 10);
      }

      patchState(store, (state) => {
        return { ...state, path, text, filters, id, page, sort };
      })
    },
    updateFilter(filter: Filter) {
      patchState(store, (state) => {
        const existing = state.filters?.findIndex((f: Filter) => f.column === filter.column);

        // Add filter if it doesn't exist and has values
        if ((existing === -1 || state.filters === undefined) && filter.values.length > 0) {
          return ({...state, filters: [...state.filters || [], filter]});
        }
        // Remove filter if no values are selected
        if (existing >= 0 && filter.values.length === 0) {
          return ({...state, filters: (state.filters || []).filter((f: Filter) => f.column !== filter.column)});
        }
        // Update filter values
        if (existing >= 0) {
          const filters = [...state.filters || []];
          filters.splice(existing, 1, filter);

          return ({...state, filters});
        }

        return state;
      });
    },
    patch(params: Partial<QueryParams>) {
      patchState(store, (state) => {
        return { ...state, ...params };
      });
    },
    getFilterFromColumn(column: string) {
      return getState(store).filters?.find((f: Filter) => f.column === column);
    }
  }))
)
