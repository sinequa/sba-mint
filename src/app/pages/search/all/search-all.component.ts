import { NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, inject, signal, Type } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { getState } from '@ngrx/signals';

import { CCApp, Query, Result } from '@sinequa/atomic';
import {
  DidYouMeanComponent,
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

import { APP_FEATURES } from '../../../tokens';
import { AssistantComponent } from '../../../components/assistant/assistant';
import { getComponentsForDocumentType } from '../../../registry/document-type-registry';
import { SearchBase } from '../search.abstract';
import { CardSkeleton } from '../../../components/cards/record/skeleton';

type R = Result & { nextPage?: number; previousPage?: number };

@Component({
  selector: 'app-search-all',
  imports: [
    NgComponentOutlet,
    SortSelectorComponent,
    DidYouMeanComponent,
    InfinityScrollDirective,
    SponsoredResultsComponent,
    NoResultComponent,
    SearchFeedbackComponent,
    FiltersBarComponent,
    NavbarTabsComponent,
    ButtonComponent,
    AssistantComponent,
    CardSkeleton
  ],
  templateUrl: './search-all.component.html',
  styles: [
    `
      app-overview-people:not(.hidden) + app-overview-slides {
        margin-top: 1rem;
      }

      feedback {
        transition:
          bottom 300ms ease-in-out,
          transform 300ms ease-in-out;
      }
    `
  ],
  host: {
    class: 'layout-search'
  }
})
export class SearchAllComponent extends SearchBase<R> {
  cn = cn;

  appFeatures = inject(APP_FEATURES);

  /**
   * Signal indicating whether streaming is currently active.
   *
   * @type {Signal<boolean>}
   * - `true`: Streaming is active.
   * - `false`: Streaming is inactive.
   */
  isStreaming = signal<boolean>(false);
  /**
   * Signal to control the visibility of the assistant.
   *
   * When set to `true`, the assistant is hidden. When set to `false`, the assistant is visible.
   */
  hideAssistant = signal(true);

  /**
   * Computes the placement of an element based on the state of the drawer.
   * If the drawer is open, the placement is set to 'bottom-end'; otherwise, it is set to 'bottom-start'.
   *
   * This coomputed property is used to determine the position of the sort-selector component in the UI.
   *
   * @returns The computed placement value of type `Placement`.
   */
  position = computed<Placement>(() => (this.drawerOpened() ? 'bottom-end' : 'bottom-start'));

  // ast-vanillAI-search-results-assistant
  readonly instanceId = computed(() => {
    const {
      assistant: { usePrefixName = true }
    } = this.appFeatures;
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-search-results-assistant`;
    }
    return `search-results-assistant`;
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
  readonly allowAI = computed(() => this.appStore.customizationJson()?.['assistants']?.[this.instanceId()]?.['defaultValues']?.['service_id']);
  readonly enabledUserInput = computed(
    () => this.appStore.customizationJson()?.['assistants']?.[this.instanceId()]?.['modeSettings']?.['enabledUserInput'] === true
  );
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

  getArticleType(docType?: string): Type<unknown> {
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

  onFeedbackClose(): void {
    this.hideFeedback.set(true);
  }
}
