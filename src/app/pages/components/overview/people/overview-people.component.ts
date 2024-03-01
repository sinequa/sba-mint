import { NavigationService } from '@/app/services/navigation.service';
import { QueryStoreService } from '@/app/services/query-store.service';
import { buildQuery } from '@/app/services/query.service';
import { Component, HostBinding, Injector, OnDestroy, OnInit, inject, runInInjectionContext, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArticlePersonLightComponent } from '@mint/components/article/person-light/article-person-light.component';
import { SelectArticleOnClickDirective } from '@mint/directives/select-article-on-click.directive';
import { PersonArticle } from '@mint/types/articles/person.type';
import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { Subscription, switchMap } from 'rxjs';
import { PEOPLE_QUERY_NAME } from '../../../../config/query-names';

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
  private readonly queryStoreService = inject(QueryStoreService);
  private readonly queryService = inject(QueryService);

  private readonly subscriptions = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.navigationService.navigationEnd$
        .pipe(
          switchMap(() => {
            const query = runInInjectionContext(this.injector, () => buildQuery({ name: PEOPLE_QUERY_NAME, pageSize: PEOPLE_OVERVIEW_LIMIT }));
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

          this.queryText.set(this.queryStoreService.query());
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
