import { NgComponentOutlet } from '@angular/common';
import { Component, effect, Type } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { Result } from '@sinequa/atomic';
import {
  DidYouMeanComponent,
  ExportDialog,
  FiltersBarComponent,
  InfinityScrollDirective,
  NavbarTabsComponent,
  NoResultComponent,
  SearchFeedbackComponent,
  SortingChoice,
  SortSelectorComponent,
  SponsoredResultsComponent
} from '@sinequa/atomic-angular';
import { ButtonComponent } from '@sinequa/ui';

import { SearchBase } from '../search.abstract';
import { ArticleDefaultSkeletonComponent } from '../../../components/article/default-skeleton/article-default-skeleton.component';
import { getComponentsForDocumentType } from '../../../registry/document-type-registry';

type R = Result & { nextPage?: number; previousPage?: number };

@Component({
  selector: 'app-search-all',
  standalone: true,
  imports: [
    TranslocoPipe,
    NgComponentOutlet,
    ArticleDefaultSkeletonComponent,
    SortSelectorComponent,
    DidYouMeanComponent,
    InfinityScrollDirective,
    SponsoredResultsComponent,
    NoResultComponent,
    SearchFeedbackComponent,
    FiltersBarComponent,
    NavbarTabsComponent,
    ButtonComponent,
    ExportDialog
  ],
  templateUrl: './search-all.component.html',
  styles: [
    `
      app-overview-people:not(.hidden) + app-overview-slides {
        margin-top: 1rem;
      }
    `
  ],
  host: {
    class: 'layout-search overflow-auto h-full'
  }
})
export class SearchAllComponent extends SearchBase<R> {
  constructor() {
    super();
    effect(() => this.onDrawerOpenedChange(this.drawerOpened()));
  }

  onDrawerOpenedChange(opened: boolean): void {
    // Your function logic here
    console.log(`Drawer opened state changed to: ${opened}`);
  }

  onSort(sort: SortingChoice): void {
    this.queryParamsStore.patch({ sort: sort.name });
    this.searchService.search([], {
      audit: {
        type: 'Search_Sort',
        detail: {
          sort: sort.name,
          orderByClause: sort.orderByClause
        }
      }
    });
  }

  getArticleType(docType: string): Type<unknown> {
    return getComponentsForDocumentType(docType).articleComponent;
  }
}
