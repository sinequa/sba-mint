import { NgComponentOutlet } from '@angular/common';
import { Component, HostBinding, Type } from '@angular/core';

import { Result } from '@sinequa/atomic';
import { InfinityScrollDirective } from '@sinequa/atomic-angular';

import { getComponentsForDocumentType } from '@/app/registry/document-type-registry';
import { ArticleDefaultSkeletonComponent } from '@/core/components/article/default-skeleton/article-default-skeleton.component';
import { FiltersListComponent } from "@/core/components/filters/filters-list.component";
import { SponsoredResultsComponent } from "@/core/components/sponsored-results/sponsored-results.component";
import { DidYouMeanComponent } from '@/core/features/did-you-mean/did-you-mean.component';
import { SortSelectorComponent, SortingChoice } from '@/core/features/sort-selector/sort-selector.component';
import { SearchBase } from '../search.abstract';

type R = Result & { nextPage?: number, previousPage?: number };

@Component({
  selector: 'app-search-all',
  standalone: true,
  imports: [
    NgComponentOutlet,
    ArticleDefaultSkeletonComponent,
    SortSelectorComponent,
    DidYouMeanComponent,
    InfinityScrollDirective,
    SponsoredResultsComponent,
    FiltersListComponent
],
  templateUrl: './search-all.component.html',
  styleUrl: './search-all.component.scss',
  host: {
    class: 'layout-search overflow-auto h-full'
  }
})
export class SearchAllComponent extends SearchBase<R> {
  @HostBinding('attr.drawer-opened')


  onSort(sort: SortingChoice): void {
    this.queryParamsStore.patch({ sort: sort.name });
    this.searchService.search([], {
      audit: {
        type: "Search_Sort",
        detail: {
          sort: sort.name,
          orderByClause: sort.orderByClause,
        }
      }
    });
  }


  getArticleType(docType: string): Type<unknown> {
    return getComponentsForDocumentType(docType).articleComponent;
  }
}
