import { Filter } from '@/app/utils/models';
import { Store } from './store';

export class FiltersStore extends Store<Filter[]> {
  public update(filter: Filter): void {
    if (!this.state) this.state = [];

    const existing = this.state?.find((f: Filter) => f.column === filter.column);

    // Add filter if it doesn't exist and has values
    if (!existing && filter.values.length > 0) {
      this.state.push(filter);
      this.set(this.state);
    }
    // Remove filter if no values are selected
    else if (existing && filter.values.length === 0)
      this.set(this.state.filter((f: Filter) => f.column !== filter.column));
    // Update filter values
    else if (existing) {
      existing.values = filter.values;
      this.set(this.state);
    }
  }
}

export const filtersStore = new FiltersStore();
