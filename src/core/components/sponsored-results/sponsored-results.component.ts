import { Component, effect, inject, signal } from "@angular/core";
import { getState } from "@ngrx/signals";
import { CCApp, fetchSponsoredLinks, LinkResult } from "@sinequa/atomic";
import { AppStore, SearchService } from "@sinequa/atomic-angular";
import { from, map } from "rxjs";

@Component({
  selector: "app-sponsored-results",
  standalone: true,
  templateUrl: './sponsored-results.component.html'
})
export class SponsoredResultsComponent {

  searchService = inject(SearchService);
  appStore = inject(AppStore);

  readonly sponsoredResults = signal<LinkResult[] | undefined>(undefined);

  constructor() {
    effect(() => {
      const { sponsoredLinks } = getState(this.appStore) as CCApp;

      if (sponsoredLinks === undefined) {
        this.sponsoredResults.set(undefined);
      } else {
        const query = this.searchService.getQuery();
        from(fetchSponsoredLinks(sponsoredLinks, query))
          .subscribe(links => {
            this.sponsoredResults.set(links.slice(0, 3));
          });
      }
    });
  }
}