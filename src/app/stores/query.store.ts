import { Query } from '@sinequa/atomic';
import { Store } from './store';
import { Filter } from '../utils/models/Filter';

export class QueryStore extends Store<Query> {
  public setText(text: string) {
    this.set(Object.assign({}, this.state, { text }));
  }

  public setFilters(filters: Filter[]) {
    this.set(Object.assign({}, this.state, { filters }));
  }
}

export const queryStore = new QueryStore();
