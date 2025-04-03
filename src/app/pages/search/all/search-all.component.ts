import { NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, inject, signal, Type } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { CCApp, Query, Result } from '@sinequa/atomic';
import {
  ApplicationStore,
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
import { ButtonComponent, cn } from '@sinequa/ui';

import { MessageHandler } from '@sinequa/assistant/chat';
import { ArticleDefaultSkeletonComponent } from '../../../components/article/default-skeleton/article-default-skeleton.component';
import { AssistantComponent } from '../../../components/assistant/assistant';
import { getComponentsForDocumentType } from '../../../registry/document-type-registry';
import { SearchBase } from '../search.abstract';

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
    ExportDialog,
    AssistantComponent
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
    class: 'layout-search mt-16 overflow-auto h-full'
  }
})
export class SearchAllComponent extends SearchBase<R> {
  cn = cn;

  private readonly applicationStore = inject(ApplicationStore);

  isStreaming = signal<boolean>(false);
  hideAssistant = signal(true);

  // ast-vanillAI-search-results-assistant
  readonly instanceId = computed(() => {
    const { name } = getState(this.appStore) as CCApp;
    return `${name}-search-results-assistant`;
  });

  readonly hasRowCount = computed(() => {
    if (this.query.isSuccess()) {
      // destructure the query to get the rowCount
      // and return true if rowCount is greater than 0
      const { pages = [{ rowCount: 0 }] } = this.query.data() || { pages: [] };
      return pages[0].rowCount > 0;
    }
    return false;
  });
  readonly allowAIOverview = computed(() => this.appStore.customizationJson()?.['assistants']?.[this.instanceId()]?.['defaultValues']?.['service_id']);
  assistantQuery: Query = { name: 'assistant' };

  conditionalMessageHandler: Map<string, MessageHandler<any>> = new Map();

  constructor() {
    super();
    this.conditionalMessageHandler.set('SkillsTester', { handler: message => this.handleConditionalDisplayMessage(message), isGlobalHandler: false });

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

  handleConditionalDisplayMessage(message: any) {
    const { result } = message as { result: string };
    if (result.toLocaleLowerCase().includes('show overview')) {
      this.hideAssistant.set(false);
    } else {
      this.hideAssistant.set(true);
    }
  }

  protected override beforeSearch(query: Query): void {
    this.assistantQuery = { ...this.assistantQuery, ...query };
  }
}
