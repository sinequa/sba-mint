import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Principal } from "@sinequa/atomic";
import { PrincipalService } from "@sinequa/atomic-angular";

export const PrincipalStore = signalStore(
  { providedIn: 'root' },
  withState({} as Principal),
  withMethods((store, principalService = inject(PrincipalService)) => ({
    initialize() : Promise<void> {
      principalService.getPrincipal().subscribe(principal => patchState(store, principal));
      return Promise.resolve();
    }
  }))
);