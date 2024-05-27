import { Location } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getState } from '@ngrx/signals';

import { SelectionStore } from '@/app/stores/selection.store';
import { Article } from "@/app/types/articles";
import { QueryParamsStore } from '../stores';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly selectionStore = inject(SelectionStore);
  queryParamsStore = inject(QueryParamsStore);

  public setCurrentArticle(article: Article | undefined): void {
    if (!article) {
      this.clearCurrentArticle();
      return;
    }

    // update selection store with query text
    const { text } = getState(this.queryParamsStore);
    this.selectionStore.update(article, text);

    if (article?.id)
      this.updateArticleIdInQueryParams(article.id);
  }

  public clearCurrentArticle(): void {
    this.selectionStore.clear();

    this.clearArticleIdFromQueryParams();
  }

  private updateArticleIdInQueryParams(id: string | undefined): void {
    const url = this.router
      .createUrlTree([], { relativeTo: this.route, queryParams: { id }, queryParamsHandling: 'merge' })
      .toString();
    this.location.replaceState(url);
  }

  private clearArticleIdFromQueryParams(): void {
    const queryParams = Object.assign({}, this.route.snapshot.queryParams);

    delete queryParams['id'];

    const url = this.router.createUrlTree([], { relativeTo: this.route, queryParams }).toString();

    this.location.replaceState(url);
  }
}
