import { NavigationService } from '@/app/services/navigation.service';
import { QueryStoreService } from '@/app/services/query-store.service';
import { buildQuery } from '@/app/services/query.service';
import { Component, HostBinding, Injector, OnDestroy, OnInit, inject, runInInjectionContext, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArticleSlideLightComponent } from '@mint/components/article/slide-light/article-slide-light.component';
import { SelectArticleOnClickDirective } from '@mint/directives/select-article-on-click.directive';
import { SlideArticle } from '@mint/types/articles/slide.type';
import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { Subscription, switchMap } from 'rxjs';
import { SLIDES_QUERY_NAME } from '../../../../config/query-names';

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
  private readonly queryStoreService = inject(QueryStoreService);
  private readonly queryService = inject(QueryService);

  private readonly subscriptions = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.navigationService.navigationEnd$
        .pipe(
          switchMap(() => {
            const query = runInInjectionContext(this.injector, () => buildQuery({ name: SLIDES_QUERY_NAME, pageSize: SLIDES_OVERVIEW_LIMIT }));
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

          this.queryText.set(this.queryStoreService.query());
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
