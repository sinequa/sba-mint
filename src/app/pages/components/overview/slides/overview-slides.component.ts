import { Component, HostBinding, Inject, InjectionToken, Injector, OnDestroy, OnInit, inject, runInInjectionContext, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';

import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleSlideLightComponent } from '@/app/components/article/slide-light/article-slide-light.component';
import { SelectArticleOnClickDirective } from '@/app/directives';
import { NavigationService } from '@/app/services';
import { AppStore } from '@/app/stores';
import { searchInputStore } from '@/app/stores/search-input.store';
import { SlideArticle } from '@/app/types/articles';
import { buildQuery } from '@/app/utils';

export const SLIDES_OVERVIEW_LIMIT = new InjectionToken("SLIDES_OVERVIEW_LIMIT", { factory: () => 3});
export const SLIDES_QUERY_NAME = new InjectionToken<string>("SLIDES_QUERY_NAME", { factory: () => '_query'});

@Component({
  selector: 'app-overview-slides',
  standalone: true,
  imports: [RouterModule, SelectArticleOnClickDirective, ArticleSlideLightComponent],
  templateUrl: './overview-slides.component.html',
  styleUrl: './overview-slides.component.scss'
})
export class OverviewSlidesComponent implements OnInit, OnDestroy {
  @HostBinding('class') public class = 'hidden';

  protected readonly slides = signal<Partial<SlideArticle>[]>([]);
  protected readonly queryText = signal<string>('');

  private readonly navigationService = inject(NavigationService);
  private readonly queryService = inject(QueryService);
  private readonly appStore = inject(AppStore);

  private readonly subscriptions = new Subscription();

  constructor(
    @Inject(SLIDES_QUERY_NAME) readonly slidesQueryName: string,
    @Inject(SLIDES_OVERVIEW_LIMIT) readonly slidesOverviewLimit: number,
    private readonly injector: Injector
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.navigationService.navigationEnd$
        .pipe(
          switchMap(() => {
            const query = runInInjectionContext(this.injector, () => buildQuery(
              {
                name: this.slidesQueryName,
                pageSize: this.slidesOverviewLimit,
                globalRelevance: this.appStore.customizationJson()?.globalRelevanceOverride
              })
            );
            return this.queryService.search(query);
          })
        )
        .subscribe((result: Result) => {
          if (!result.records || result.records.length === 0) {
            this.class = 'hidden';
            this.slides.set([]);
          } else {
            this.class = 'block';
            this.slides.set(
              result.records
                .map(r => Object.assign(r, { type: 'slide' }) as SlideArticle)
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
