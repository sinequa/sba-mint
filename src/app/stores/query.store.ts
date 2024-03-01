import { Filter } from '@mint/components/filters/filters.models';
import { Query } from '@sinequa/atomic';
import { Store } from './store';

export class QueryStore extends Store<Query> {
  public setText(text: string) {
    this.set(Object.assign({}, this.state, { text }));
  }

  public setFilters(filters: Filter[]) {
    this.set(Object.assign({}, this.state, { filters }));
  }
}

export const queryStore = new QueryStore();
