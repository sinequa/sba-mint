import { Component, computed, effect, inject, signal, untracked } from "@angular/core";
import { getState } from "@ngrx/signals";
import { CCApp, fetchSponsoredLinks, LinkResult } from "@sinequa/atomic";
import { AppStore, QueryParamsStore } from "@sinequa/atomic-angular";

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
  queryParamStore = inject(QueryParamsStore);

  sponsoredLinks = computed(() => {
    const { sponsoredLinks } = getState(this.appStore) as CCApp;
    return sponsoredLinks;
  })
  readonly sponsoredResults = signal<LinkResult[] | undefined>(undefined);

  constructor() {
    effect(() => {
      untracked(async () => {
        if (this.sponsoredLinks()) {
          const query = this.queryParamStore.getQuery();
          const links = await fetchSponsoredLinks(this.sponsoredLinks(), query) || [];
          this.sponsoredResults.set(links.slice(0, 3));
        }
      })
    });
  }
}