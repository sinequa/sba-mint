import { getState, patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Aggregation } from "@sinequa/atomic";

type AggregationsState = {
  aggregations: Aggregation[]
}

const intialState: AggregationsState = {
  aggregations: []
}

export const AggregationsStore = signalStore(
  // providing store at the root level
  { providedIn: 'root' },
  withState(intialState),
  withMethods((store) => ({
    update(aggregations: Aggregation[]) {
      patchState(store, (state) => {
        return { ...state, aggregations }
      })
    },
    clear(){
      patchState(store, (state) => {
        return { ...state, aggregations: [] }
      })
    },
    getAggregation(name: string, kind: "column" | "name" = "name") {
      if(kind === "column"){
        return getState(store).aggregations.find((aggregation) => aggregation.column === name);
      }
      return getState(store).aggregations.find((aggregation) => aggregation.name === name);
    }
  }))
);

