import { Store } from './store';

export type Customization = {
  aggregations?: AggregationCustomization[];
}

export type AggregationCustomization = {
  column: string;
  label?: string;
  iconClass?: string;
  items?: AggregationItemCustomization[];
}

export type AggregationItemCustomization = {
  value: string;
  iconClass?: string;
}

export class CustomizationStore extends Store<Customization> {
  public assign(customization: Customization): void {
    this.set(Object.assign(this.state ?? {}, customization));
  }
}

export const customizationStore = new CustomizationStore(undefined);
