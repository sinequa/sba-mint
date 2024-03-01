import { Injectable, inject } from "@angular/core";
import { NavigationEnd, Router, RouterEvent } from "@angular/router";
import { filter, map, shareReplay } from "rxjs";

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
    map((event: RouterEvent) => event.url.split('?')[0] ?? '')
  );
}
