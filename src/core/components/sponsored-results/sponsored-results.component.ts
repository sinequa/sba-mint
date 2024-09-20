import { Component, computed, effect, inject, Injector, runInInjectionContext, signal, untracked } from "@angular/core";
import { getState } from "@ngrx/signals";
import { CCApp, fetchSponsoredLinks, LinkResult } from "@sinequa/atomic";
import { AppStore, getQuery } from "@sinequa/atomic-angular";

@Component({
  selector: "app-sponsored-results",
  standalone: true,
  templateUrl: './sponsored-results.component.html',
  styles: `
.promoted-badge {
  visibility: hidden;
}

a:hover .promoted-badge {
  visibility: visible;
}
  `
})
export class SponsoredResultsComponent {

  appStore = inject(AppStore);
  sponsoredLinks = computed(() => {
    const { sponsoredLinks } = getState(this.appStore) as CCApp;
    return sponsoredLinks;
  })
  readonly sponsoredResults = signal<LinkResult[] | undefined>(undefined);

  constructor(injector: Injector) {
    effect(() => {
      untracked(async () => {
        if (this.sponsoredLinks()) {
          const query = runInInjectionContext(injector, getQuery);
          const links = await fetchSponsoredLinks(this.sponsoredLinks(), query) || [];
          this.sponsoredResults.set(links.slice(0, 3));
        }
      })
    });
  }
}