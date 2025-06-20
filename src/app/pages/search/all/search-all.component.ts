import { NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, signal, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Placement } from '@floating-ui/dom';
import { getState } from '@ngrx/signals';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, map, Subscription, tap } from 'rxjs';

import { MessageHandler } from '@sinequa/assistant/chat';
import { Aggregation, Article, CCApp, isNotInputEvent, Query, QueryParams, Result as R } from '@sinequa/atomic';
import {
  AggregationsStore,
  AppStore,
  DidYouMeanComponent,
  DrawerStackService,
  FiltersBarComponent,
  InfinityScrollDirective,
  NavbarTabsComponent,
  NoResultComponent,
  PrincipalStore,
  QueryParamsStore,
  SearchFeedbackComponent,
  SearchService,
  SelectionService,
  SortingChoice,
  SortSelectorComponent,
  SponsoredResultsComponent,
  UserSettingsStore
} from '@sinequa/atomic-angular';
import { ButtonComponent, cn } from '@sinequa/ui';

import { AssistantComponent } from '../../../components/assistant/assistant';
import { CardSkeleton } from '../../../components/cards/record/skeleton';
import { getComponentsForDocumentType } from '../../../registry/document-type-registry';
import { APP_FEATURES } from '../../../tokens';

type Result = R & { nextPage?: number; previousPage?: number };
type QueryParamsProps = {
  f?: string; // filters list
  p?: number; // page number
  s?: string; // sort name
  t?: string; // tab name
  q?: string; // query text
  b?: string; // basket,
  n?: string; // query name
};

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
    class: 'layout-search',
    '(keydown.enter)': 'handleKeydownEnter($event)',
    '[attr.drawer-opened]': 'drawerOpened() || false'
  }
})
export class SearchAllComponent {
  cn = cn;

  // input url bindings
  protected readonly q = input<string>(); // text
  protected readonly t = input<string>(); // tab
  protected readonly b = input<string>(); // basket
  protected readonly s = input<string>(); // sort
  protected readonly f = input<string>(); // filters
  protected readonly n = input<string>(); // query param

  protected readonly drawerOpened = signal(false);

  protected readonly result = signal<Result | undefined>(undefined);
  protected readonly queryText = signal<string>('');

  // the Assistant is expanded and visible by default
  protected readonly assistantCollapsed = signal<boolean>(true);
  protected readonly showAssistant = signal<boolean>(false);

  protected readonly searchService = inject(SearchService);
  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly selectionService = inject(SelectionService);

  protected readonly appFeatures = inject(APP_FEATURES);
  protected readonly appStore = inject(AppStore);
  protected readonly aggregationsStore = inject(AggregationsStore);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly principalStore = inject(PrincipalStore);
  protected readonly usersettingsStore = inject(UserSettingsStore);

  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  protected aggregations: Aggregation[];

  protected readonly sub = new Subscription();

  currentKeys = signal<QueryParams | undefined>(undefined);

  // get the id from the query params store to open the drawer with the preview of the article
  id = computed(() => {
    const state = getState(this.queryParamsStore);
    return state.id;
  });

  // the query must be retriggered when the user override is active
  userOverrideActive = computed(() => {
    const state = getState(this.principalStore);
    return state.userOverrideActive;
  });

  // Whether the feedback button is to hide
  hideFeedback = signal(false);

  // tanstack query
  query = injectInfiniteQuery<Result>(() => ({
    queryKey: [`search-${this.t()}`, this.currentKeys(), this.userOverrideActive()],
    queryFn: ({ pageParam }) => {
      if (this.currentKeys() === undefined) return Promise.resolve({} as Result);
      const q = this.queryParamsStore.getQuery();

      const query = { ...q, page: pageParam, tab: this.t(), basket: this.currentKeys()?.basket } as Query;
      this.beforeSearch(query);

      // Add the current search to the user settings when the text is not empty
      if (query.text && query.text !== '') {
        this.usersettingsStore.addCurrentSearch(query as QueryParams);
      }

      return lastValueFrom(
        this.searchService.getResult(query).pipe(
          tap(() => this.queryText.set(this.currentKeys()?.text ?? '')),
          map(result => {
            return this.updateArticleType(result);
          }),
          map(result => {
            // If the id is set, open the drawer with the preview of the article
            const id = this.id();
            if (id) {
              result.records?.forEach(article => {
                if (article.id === id) {
                  this.selectionService.setCurrentArticle(article);
                  this.drawerStack.open();
                }
              });
            }
            return result;
          })
        )
      );
    },
    initialPageParam: 1,
    getPreviousPageParam: firstPage => firstPage.previousPage ?? undefined,
    getNextPageParam: lastPage => lastPage.nextPage ?? undefined
  }));

  /**
   * Checks if the tab search is active.
   *
   * This method retrieves the current query from the query parameters store,
   * then fetches the corresponding query from the app store by its name.
   * It returns the active status of the tab search if available, otherwise returns false.
   *
   * @returns {boolean} - True if the tab search is active, otherwise false.
   */
  isTabSearchActive = computed(() => {
    const q = this.queryParamsStore.getQuery();
    if (!q || !q.name) return false; // Ensure query and name are defined
    const ccQuery = this.appStore.getQueryByName(q.name);
    return ccQuery?.tabSearch.isActive ?? false;
  });

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

  /**
   * If query has rowCount greater than 0, we have results, otherwise no results found.
   */
  readonly hasRowCount = computed(() => {
    if (this.query.isSuccess()) {
      // destructure the query to get the rowCount
      // and return true if rowCount is greater than 0
      const { pages = [{ rowCount: 0 }] } = this.query.data() || { pages: [] };
      return pages[0].rowCount > 0;
    }
    return false;
  });

  /**
   * Assistant related properties
   */
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
  readonly allowAI = computed(() => this.appStore.isAssistantAllowed(this.instanceId()));
  readonly enabledUserInput = computed(() => this.appStore.assistants()[this.instanceId()]?.['modeSettings']?.['enabledUserInput'] === true);
  assistantQuery: Query = { name: 'assistant' };

  conditionalMessageHandler: Map<string, MessageHandler<any>> = new Map();

  constructor() {
    // Update the query params store with the filters from the query params
    // This allows Browser back/forward to work correctly
    effect(() => {
      const filters = this.f() ? JSON.parse(this.f() ?? '') : []; // Parse the filters from the query params
      this.queryParamsStore.patch({ text: this.q(), tab: this.t(), basket: this.b(), sort: this.s(), filters, name: this.n() });
    });

    // Update the URL with the query params
    effect(() => {
      this.hideFeedback.set(false);

      const state = getState(this.queryParamsStore);
      const r = { tab: state.tab, text: state.text, filters: state.filters, sort: state.sort, basket: state.basket, name: state.name, page: state.page };
      if (this.currentKeys() === undefined) {
        this.currentKeys.set(r);
        return;
      }
      // checks if the current keys are different from the new ones
      if (JSON.stringify(this.currentKeys()) !== JSON.stringify(r)) {
        this.currentKeys.set(r);
      }
    });

    // Make Result object available to children and update aggregations store
    effect(() => {
      this.query.isSuccess();

      const result = this.query.data()?.pages[0];

      if (!result) return;

      this.result.set(result);

      // Update the aggregations store with the new aggregations
      this.aggregationsStore.update(result.aggregations);
    });

    effect(() => {
      const { collapseAssistant } = getState(this.usersettingsStore);

      if (collapseAssistant !== undefined) {
        this.assistantCollapsed.set(collapseAssistant);
        if (!this.showAssistant()) {
          this.showAssistant.set(!collapseAssistant);
        }
      }
    });

    this.sub.add(this.drawerStack.isOpened.subscribe(state => this.drawerOpened.set(state)));

    this.conditionalMessageHandler.set('SkillsTester', { handler: message => this.handleConditionalDisplayMessage(message), isGlobalHandler: false });

    effect(() => this.onDrawerOpenedChange(this.drawerOpened()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.aggregationsStore.clear();
  }

  nextPage() {
    this.query.fetchNextPage();
  }

  handleKeydownEnter(e: Event) {
    if (isNotInputEvent(e as KeyboardEvent)) {
      e.stopImmediatePropagation(); // required for the drawer to open properly
    }
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

  onFeedbackClose(): void {
    this.hideFeedback.set(true);
  }

  /**
   * Switch the assistant collapsed status.
   */
  onAssistantCollapse() {
    this.usersettingsStore.updateAssistantCollapsed(!this.assistantCollapsed());
  }

  /**
   * Updates the article type for each record in the result.
   *
   * This method maps over the `records` array in the `result` object and updates each
   * `article` by adding a `value` property set to the `article.title` and a `type` property
   * set to `'default'`. The updated `result` object is then returned.
   *
   * @param {Result} result - The result object containing an array of records to be updated.
   * @returns {Result} The updated result object with modified article records.
   */
  protected updateArticleType(result: Result) {
    result.records?.map((article: Article) => {
      return { ...article, value: article.title, type: 'default' };
    });
    return result;
  }

  protected beforeSearch(query: Query): void {
    this.assistantQuery = { ...this.assistantQuery, ...query };
  }
}
