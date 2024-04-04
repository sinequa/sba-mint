import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Principal, fetchPrincipal } from "@sinequa/atomic";

export const PrincipalStore = signalStore(
  { providedIn: 'root' },
  withState({} as Principal),
  withMethods((store) => ({
    async initialize() : Promise<void> {
      const user = await fetchPrincipal();
      patchState(store, user);
    }
  }))
);