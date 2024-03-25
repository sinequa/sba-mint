import { Injector, runInInjectionContext } from "@angular/core";

import { getCurrentTab } from "@/app/app.routes";
import { appStore } from "@/app/stores";

/**
 * Returns the authorized filters for the current tab
 * @param injector Injector needed to get the current tab
 * @returns The authorized filters for the current tab
 */
export function getAuthorizedFilters(injector: Injector): string[] | undefined {
  const tabs = appStore.getCustomizationJson()?.tabs;
  let tab: string | undefined = undefined;

  runInInjectionContext(injector, () => tab = getCurrentTab());

  if (!tab || !tabs) return undefined;

  return tabs[tab];
}
