import { Directive, Injector, OnDestroy, OnInit, inject, input, runInInjectionContext } from '@angular/core';
import { Subscription, filter, map } from 'rxjs';

import { Aggregation, Filter } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { SelectionService } from '@/app/services';
import { QueryParamsStore } from '@/app/stores';
import { buildQuery, translateFiltersToApiFilters } from '@/app/utils';
import { getState } from '@ngrx/signals';

// FUTURE : Make this directive more generic and reusable and without dependencies on other services

@Directive({
  selector: '[appSelectArticleFromQueryParams]',
  standalone: true
})
export class SelectArticleFromQueryParamsDirective implements OnInit, OnDestroy {
  public readonly articleId = input<string | undefined>();
  public readonly aggregations = input<Aggregation[]>();

  private readonly selectionService = inject(SelectionService);
  private readonly drawerStackService = inject(DrawerStackService);
  private readonly queryService = inject(QueryService);
  private readonly queryParamsStore = inject(QueryParamsStore);

  private readonly subscription = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    if (!this.articleId()) return;

    const query = runInInjectionContext(this.injector, () => buildQuery());
    const filters = getState(this.queryParamsStore).filters ?? [];

    filters.push({ column: 'id', label: 'id', values: [this.articleId()!] });

    query.filters = translateFiltersToApiFilters(filters, this.aggregations()) as Filter;

    this.subscription.add(
      this.queryService.search(query)
        .pipe(
          map((result) => result.records[0] ?? undefined),
          filter((article) => !!article)
        )
        .subscribe((article) => {
          this.selectionService.setCurrentArticle(article);
          this.drawerStackService.open();
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
