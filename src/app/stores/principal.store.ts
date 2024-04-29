import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { firstValueFrom, map } from "rxjs";

import { Principal, globalConfig } from "@sinequa/atomic";
import { PrincipalService } from "@sinequa/atomic-angular";
import { withDevtools } from "@angular-architects/ngrx-toolkit";

type PrincipalState = {
  principal: Principal;
  userOverrideActive: boolean;
}

export const PrincipalStore = signalStore(
  { providedIn: 'root' },
  withDevtools("Principal"),
  withState({ principal: {}, userOverrideActive: false } as PrincipalState),
  withMethods((store, principalService = inject(PrincipalService)) => ({
    initialize() {
      return firstValueFrom(principalService.getPrincipal()
        .pipe(map(principal => {
          const { userOverrideActive = false } = globalConfig;
          patchState(store, { principal, userOverrideActive })
        })
      ));
    }
  })),
  withComputed(({principal, userOverrideActive}) => ({
    allowUserOverride: computed(() => principal().isAdministrator && userOverrideActive() === false ),
    isOverridingUser: computed(() => userOverrideActive() === true)
  }))
);