import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { firstValueFrom, map } from "rxjs";

import { Principal } from "@sinequa/atomic";
import { PrincipalService } from "@sinequa/atomic-angular";

export const PrincipalStore = signalStore(
  { providedIn: 'root' },
  withState({} as Principal),
  withMethods((store, principalService = inject(PrincipalService)) => ({
    initialize() {
      return firstValueFrom(principalService.getPrincipal()
        .pipe(map(principal => patchState(store, principal))));
    }
  }))
);