import { Injector, inject, runInInjectionContext } from "@angular/core";

import { AppStore } from "@/app/stores";
import { ActivatedRoute } from "@angular/router";

/**
 * Returns the authorized filters for the current tab
 * @param injector Injector needed to get the current tab
 * @returns The authorized filters for the current tab
 */
export function getAuthorizedFilters(injector: Injector): string[] | undefined {
  let tabs: Record<string, string[]> | undefined;

  let tab: string | undefined = undefined;

  runInInjectionContext(injector, () => {
    tabs = inject(AppStore).customizationJson()?.tabs;
    tab = inject(ActivatedRoute)?.snapshot.url.toString();
  });

  if (!tab || !tabs) return undefined;

  return tabs[tab];
}
