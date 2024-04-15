import { Component, HostBinding, Injector, OnDestroy, OnInit, inject, runInInjectionContext, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';

import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticlePersonLightComponent } from '@/app/components/article/person-light/article-person-light.component';
import { PEOPLE_QUERY_NAME } from '@/app/config/query-names';
import { SelectArticleOnClickDirective } from '@/app/directives';
import { NavigationService } from '@/app/services';
import { searchInputStore } from '@/app/stores/search-input.store';
import { PersonArticle } from '@/app/types/articles';
import { buildSecondaryQuery } from '@/app/utils';

const PEOPLE_OVERVIEW_LIMIT = 3;

@Component({
  selector: 'app-overview-people',
  standalone: true,
  imports: [RouterModule, SelectArticleOnClickDirective, ArticlePersonLightComponent],
  templateUrl: './overview-people.component.html',
  styleUrl: './overview-people.component.scss'
})
export class OverviewPeopleComponent implements OnInit, OnDestroy {
  @HostBinding('class') public class = 'hidden';

  protected readonly people = signal<PersonArticle[]>([]);
  protected readonly queryText = signal<string>('');

  private readonly navigationService = inject(NavigationService);
  private readonly queryService = inject(QueryService);

  private readonly subscriptions = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.navigationService.navigationEnd$
        .pipe(
          switchMap(() => {
            const query = runInInjectionContext(this.injector, () => buildSecondaryQuery({ name: PEOPLE_QUERY_NAME, pageSize: PEOPLE_OVERVIEW_LIMIT }));
            return this.queryService.search(query);
          })
        )
        .subscribe((result: Result) => {
          if (!result.records || result.records.length === 0) {
            this.class = 'hidden';
            this.people.set([]);
          } else {
            this.class = 'block';
            this.people.set(
              result.records
                .map(r => Object.assign(r, { type: 'person' }) as PersonArticle)
            );
          }

          this.queryText.set(searchInputStore.state ?? '');
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
