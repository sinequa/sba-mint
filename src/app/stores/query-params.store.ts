

import { Store } from '@/app/stores';
import { QueryParams, queryParamsFromUrl } from '@/app/utils';
import { Filter } from '@/app/utils/models';

export class QueryParamsStore extends Store<QueryParams> {
  public setFromUrl(url: string): void {
    const path = url.split('?')[0];

    const { q: text, f, id, p } = queryParamsFromUrl(url);
    const filters = f ? JSON.parse(decodeURIComponent(f)) : [];
    const page = parseInt(p, 10);

    this.set({ path, text, filters, id, page });
  }

  public updateFilter(filter: Filter): void {
    if (!this.state) this.state = {};
    if (!this.state.filters) this.state.filters = [];

    const existing = this.state?.filters?.findIndex((f: Filter) => f.column === filter.column);

    // Add filter if it doesn't exist and has values
    if (existing === -1 && filter.values.length > 0)
      this.state.filters.push(filter);
    // Remove filter if no values are selected
    else if (existing >= 0 && filter.values.length === 0)
      this.state.filters.splice(existing, 1);
    // Update filter values
    else if (existing >= 0)
      this.state.filters.splice(existing, 1, filter);

    this.set(this.state);
  }

  public patch(params: Partial<QueryParams>): void {
    this.set({ ...this.state, ...params });
  }

  public getFilterFromColumn(column: string): Filter | undefined {
    return this.state?.filters?.find((f: Filter) => f.column === column);
  }
}

export const queryParamsStore = new QueryParamsStore();
