

import { Store } from '@/app/stores';
import { QueryParams, getFiltersFromUrl, getIdFromUrl, getQueryTextFromUrl } from '@/app/utils';
import { Filter } from '@/app/utils/models';

export class QueryParamsStore extends Store<QueryParams> {
  public setFromUrl(url: string): void {
    const path = url.split('?')[0];
    const text = getQueryTextFromUrl(url);
    const filters = getFiltersFromUrl(url);
    const id = getIdFromUrl(url);

    this.set({ path, text, filters, id });
  }

  public updateFilter(filter: Filter): void {
    if (!this.state) this.state = {};
    if (!this.state.filters) this.state.filters = [];

    const existing = this.state?.filters?.find((f: Filter) => f.column === filter.column);

    // Add filter if it doesn't exist and has values
    if (!existing && filter.values.length > 0) {
      this.state.filters.push(filter);
      this.set(this.state);
    }
    // Remove filter if no values are selected
    else if (existing && filter.values.length === 0)
      this.set({
        ...this.state,
        filters: this.state.filters.filter((f: Filter) => f.column !== filter.column)
      });
    // Update filter values
    else if (existing) {
      existing.values = filter.values;
      this.set(this.state);
    }
  }

  public patch(params: Partial<QueryParams>): void {
    this.set({ ...this.state, ...params });
  }
}

export const queryParamsStore = new QueryParamsStore();
