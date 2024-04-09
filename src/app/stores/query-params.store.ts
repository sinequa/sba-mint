

import { QueryParams, queryParamsFromUrl } from '@/app/utils';
import { Filter } from '@/app/utils/models';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { getState, patchState, signalStore, withMethods, withState } from '@ngrx/signals';

const initialState: QueryParams = {
  filters: [],
} as QueryParams;

export const QueryParamsStore = signalStore(
  { providedIn: 'root' },
  withDevtools("QueryParams"),
  withState(initialState),
  withMethods((store) => ({
    setFromUrl(url: string) {
      const path = url.split('?')[0];

      const { q: text, f, id, p, s: sort } = queryParamsFromUrl(url);
      const filters = f ? JSON.parse(decodeURIComponent(f)) : [];
      const page = parseInt(p, 10);

      patchState(store, (state) => {
        return { ...state, path, text, filters, id, page, sort };
      })
    },
    updateFilter(filter: Filter) {
      patchState(store, (state) => {
        const existing = state.filters?.findIndex((f: Filter) => f.column === filter.column) || -1;

        // Add filter if it doesn't exist and has values
        if (existing === -1 && filter.values.length > 0)
          return {...state, filters: [...state.filters || [], filter]};
        // Remove filter if no values are selected
        else if (existing >= 0 && filter.values.length === 0)
          return {...state, filters: (state.filters || []).splice(existing, 1)};
        // Update filter values
        else if (existing >= 0)
          return {...state, filters: (state.filters|| []).splice(existing, 1, filter)};

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
