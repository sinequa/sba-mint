import { Location } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from '@mint/types/articles/article.type';
import { selectionStore } from '../stores/selection.store';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  public setCurrentArticle(article: Article | Partial<Article> | undefined): void {
    if (!article) {
      this.clearCurrentArticle();
      return;
    }

    selectionStore.set(article);

    if (article?.id)
      this.updateArticleIdInQueryParams(article.id);
  }

  public clearCurrentArticle(): void {
    selectionStore.clear();

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
