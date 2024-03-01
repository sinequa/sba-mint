import { Aggregation } from '@sinequa/atomic';
import { Store } from './store';

export class AggregationsStore extends Store<Aggregation[]> { }

export const aggregationsStore = new AggregationsStore([]);
