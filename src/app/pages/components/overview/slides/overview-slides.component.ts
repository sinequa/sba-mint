import { Component, HostBinding, Injector, OnDestroy, OnInit, inject, runInInjectionContext, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';

import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleSlideLightComponent } from '@/app/components/article/slide-light/article-slide-light.component';
import { SLIDES_QUERY_NAME } from '@/app/config/query-names';
import { SelectArticleOnClickDirective } from '@/app/directives';
import { NavigationService } from '@/app/services';
import { searchInputStore } from '@/app/stores/search-input.store';
import { SlideArticle } from '@/app/types/articles';
import { buildSecondaryQuery } from '@/app/utils';

const SLIDES_OVERVIEW_LIMIT = 3;

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

  private readonly subscriptions = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.navigationService.navigationEnd$
        .pipe(
          switchMap(() => {
            const query = runInInjectionContext(this.injector, () => buildSecondaryQuery({ name: SLIDES_QUERY_NAME, pageSize: SLIDES_OVERVIEW_LIMIT }));
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
