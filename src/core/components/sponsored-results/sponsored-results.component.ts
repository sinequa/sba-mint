import { Component, effect, inject, signal } from "@angular/core";
import { getState } from "@ngrx/signals";
import { CCApp, fetchSponsoredLinks, LinkResult } from "@sinequa/atomic";
import { AppStore, SearchService } from "@sinequa/atomic-angular";
import { from, map } from "rxjs";

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
            //todo remove hardcoding
            const l = links || [
              {
                id: 'someid',
                title: 'string',
                url: 'string',
                icon: 'string',
                thumbnail: 'string',
                tooltip: 'string',
                summary: 'string',
                rank: 1,
                relevance: 0.9
              },
              {
                id: 'someid',
                title: 'string2',
                url: 'string',
                icon: 'string',
                thumbnail: 'string',
                tooltip: 'string2',
                summary: 'string',
                rank: 2,
                relevance: 0.9
              },
              {
                id: 'someid',
                title: 'string3',
                url: 'string',
                icon: 'string',
                thumbnail: 'string',
                tooltip: 'string3',
                summary: 'string',
                rank: 2,
                relevance: 0.9
              },
              {
                id: 'someid',
                title: 'string4',
                url: 'string',
                icon: 'string',
                thumbnail: 'string',
                tooltip: 'string4',
                summary: 'string',
                rank: 2,
                relevance: 0.9
              }
            ];
            this.sponsoredResults.set(l.slice(0, 3));
          });
      }
    });
  }
}