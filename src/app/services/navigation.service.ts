import { Injectable, inject } from "@angular/core";
import { NavigationEnd, Router, RouterEvent } from "@angular/router";
import { filter, map, shareReplay } from "rxjs";

import { getQueryParamsFromUrl } from "../utils";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly router = inject(Router);

  public navigationEnd$ = this.router.events.pipe(
    map(event => event as RouterEvent),
    filter((event: RouterEvent) => event instanceof NavigationEnd),
    shareReplay(1)
  );

  public path$ = this.navigationEnd$.pipe(
    // create a fake URL object to extract the pathname
    map((event: RouterEvent) => {
      const url = new URL(`http://localhost${event.url}`)
      // extract the tab from the URL pathname or use the last part of the URL
      const { tab = url.pathname.split('/').pop() } = getQueryParamsFromUrl(event.url) || {};
      return tab;
    })
  );
}
