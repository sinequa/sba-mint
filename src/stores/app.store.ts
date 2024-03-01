import { computed } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { AppState, Extract } from "./app.state";

const intialState: AppState = {
  extracts: new Map(),
};

export const AppStore = signalStore(
  // providing store at the root level
  { providedIn: 'root' },
  withState(intialState),
  withComputed(({extracts}) => ({
    extractsCount: computed(() => extracts().size),
  })),
  withMethods((store) => ({
    updateExtracts(id: string, extracts: Extract[]) {
      patchState(store, (state) => {
        const extractsMap = state.extracts;
        extractsMap.set(id, extracts);
        return { ...state, extracts: extractsMap}
      })
    },
    getExtracts(id: string) {
      return store.extracts().get(id);
    }
  }))
);