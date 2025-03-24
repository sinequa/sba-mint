import { NgComponentOutlet } from '@angular/common';
import { Component, effect, Type } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { Result } from '@sinequa/atomic';
import { InfinityScrollDirective } from '@sinequa/atomic-angular';
import { ButtonComponent } from '@sinequa/ui';

import { getComponentsForDocumentType } from '@/app/registry/document-type-registry';
import { ArticleDefaultSkeletonComponent } from '@/core/components/article/default-skeleton/article-default-skeleton.component';
import { FiltersBarComponent } from '@/core/components/filters/filters-bar.component';
import { NoResultPanelComponent } from '@/core/components/no-result-panel/no-result-panel.component';
import { SponsoredResultsComponent } from '@/core/components/sponsored-results/sponsored-results.component';
import { DidYouMeanComponent } from '@/core/features/did-you-mean/did-you-mean';
import { SortingChoice, SortSelectorComponent } from '@/core/features/sort-selector/sort-selector';
import { SearchFeedbackComponent } from '@/core/features/search-feedback/search-feedback';
import { NavbarTabsComponent } from '@/core/components/navbar/navbar-tabs.components';

import { SearchBase } from '../search.abstract';
import { ExportDialog } from '@/core/features/export/export-dialog';

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
    NoResultPanelComponent,
    SearchFeedbackComponent,
    FiltersBarComponent,
    NoResultPanelComponent,
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
