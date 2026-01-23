import { NgComponentOutlet } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, signal, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Placement } from '@floating-ui/dom';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, map, tap } from 'rxjs';

import { MessageHandler } from '@sinequa/assistant/chat';
import { Aggregation, Article, bisect, CCApp, isNotInputEvent, Query, QueryParams, Result as R, SpellingCorrectionMode } from '@sinequa/atomic';
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
  QueryService,
  SearchFeedbackComponent,
  SelectionService,
  SelectionStore,
  SortingChoice,
  SortSelectorComponent,
  SponsoredResultsComponent,
  UserSettingsStore,
  AsideFiltersComponent
} from '@sinequa/atomic-angular';
import { ButtonComponent, CardComponent, CardContentComponent, CardHeaderComponent, ChevronRightIcon, cn } from '@sinequa/ui';

import { AssistantComponent } from '../../../components/assistant/assistant';
import { CardSkeleton } from '../../../components/cards/record/skeleton';
import { getComponentsForDocumentType } from '../../../registry/document-type-registry';

type Result = R & { nextPage?: number; previousPage?: number };
type QueryParamsProps = {
  f?: string; // filters list
  p?: number; // page number
  s?: string; // sort name
  t?: string; // tab name
  q?: string; // query text
  b?: string; // basket,
  n?: string; // query name
  c?: SpellingCorrectionMode; // correction mode
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
    CardSkeleton,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    TranslocoPipe,
    AsideFiltersComponent,
    ChevronRightIcon
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
    'attr.drawer-opened': 'drawerStack.isOpened()',
    '(keydown.enter)': 'handleKeydownEnter($event)',
    '[attr.drawer-opened]': 'drawerOpened() || false'
  }
})
export class SearchAllComponent {
  cn = cn;

  // all injected services and stores
  protected readonly queryService = inject(QueryService);
  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly selectionService = inject(SelectionService);

  protected readonly appStore = inject(AppStore);
  protected readonly appFeatures = this.appStore.general()?.features;
  protected readonly aggregationsStore = inject(AggregationsStore);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly principalStore = inject(PrincipalStore);
  protected readonly userSettingsStore = inject(UserSettingsStore);
  readonly selectionStore = inject(SelectionStore);

  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  // input url bindings
  protected readonly q = input<string>(); // text
  protected readonly t = input<string>(); // tab
  protected readonly b = input<string>(); // basket
  protected readonly s = input<string>(); // sort
  protected readonly f = input<string>(); // filters
  protected readonly n = input<string>(); // query param
  protected readonly id = input<string>(); // record.id
  protected readonly c = input<SpellingCorrectionMode>(); // correction mode

  // all signals used in the component
  protected readonly drawerOpened = computed(() => this.drawerStack.isOpened());

  protected readonly result = signal<Result | undefined>(undefined);
  protected readonly queryText = signal<string>('');
  protected readonly currentKeys = signal<QueryParams | undefined>(undefined);

  // the Assistant is expanded and visible by default
  protected readonly assistantCollapsed = signal<boolean>(true);
  protected readonly showAssistant = signal<boolean>(false);

  // the aggregations are used to display the filters in the UI
  // and are updated when the query is successful
  protected aggregations: Aggregation[];

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

      const query = { ...q, page: pageParam, tab: this.t(), basket: this.currentKeys()?.basket, correctionMode: this.c() } as Query;
      this.assistantQuery = { ...this.assistantQuery, ...query };

      // Add the current search to the user settings when the text is not empty
      if (query.text && query.text !== '') {
        this.userSettingsStore.addCurrentSearch(query as QueryParams);
      }

      return lastValueFrom(
        this.queryService.search(query).pipe(
          tap(() => this.queryText.set(this.currentKeys()?.text ?? '')),
          map(result => {
            result.records?.map((article: Article) => {
              return { ...article, value: article.title, type: 'default' };
            });
            return result;
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
   * Signal to track state of the selected all checkbox.
   */
  selectedAll = signal<'all' | 'some' | 'none'>('none');

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
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-search-results-assistant`;
    }
    return `search-results-assistant`;
  });
  readonly allowAI = computed(() => !this.b() && this.appStore.isAssistantAllowed(this.instanceId()));
  readonly enabledUserInput = computed(() => this.appStore.assistants()[this.instanceId()]?.['modeSettings']?.['enabledUserInput'] === true);
  assistantQuery: Query = { name: 'assistant' };

  conditionalMessageHandler: Map<string, MessageHandler<any>> = new Map();

  constructor(destroyRef: DestroyRef) {
    // Update the query params store with the filters from the URL query params
    // This allows Browser back/forward to work correctly
    effect(() => {
      const filters = this.f() ? JSON.parse(this.f() ?? '') : []; // Parse the filters from the query params
      this.queryParamsStore.patch({
        text: this.q(),
        tab: this.t(),
        basket: this.b(),
        sort: this.s(),
        filters,
        name: this.n(),
        spellingCorrectionMode: this.c()
      });
    });

    // Update the URL with the query params from the query params store
    effect(() => {
      this.hideFeedback.set(false);

      const queryParams: QueryParamsProps = {};
      const { text, filters = [], page, sort, tab, basket, name, spellingCorrectionMode } = getState(this.queryParamsStore);

      queryParams.f = filters.length > 0 ? JSON.stringify(filters) : undefined;
      queryParams.p = page;
      queryParams.s = sort;
      queryParams.t = tab;
      queryParams.q = text;
      queryParams.b = basket;
      queryParams.n = name;
      queryParams.c = spellingCorrectionMode;

      this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge', queryParams, state: {} });
    });

    // Update keys to retrigger the query when relevant parameters change
    effect(() => {
      this.hideFeedback.set(false);

      const state = getState(this.queryParamsStore);
      const r = {
        tab: state.tab,
        text: state.text,
        filters: state.filters,
        sort: state.sort,
        basket: state.basket,
        name: state.name,
        page: state.page,
        spellingCorrectionMode: state.spellingCorrectionMode
      };
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

    // Update selectedAll signal based on the selection store and current pages
    effect(() => {
      const articles = this.query.data()?.pages.flatMap(page => page.records.map(x => x.id)) || [];
      const selection = this.selectionStore.multiSelection().map(x => x.id);
      const b = bisect(articles, x => selection.includes(x));

      if (b.true.length === 0) this.selectedAll.set('none');
      else if (b.false.length === 0) this.selectedAll.set('all');
      else this.selectedAll.set('some');
    });

    effect(() => {
      const { collapseAssistant } = getState(this.userSettingsStore);

      if (collapseAssistant !== undefined) {
        this.assistantCollapsed.set(collapseAssistant);
        if (!this.showAssistant()) {
          this.showAssistant.set(!collapseAssistant);
        }
      }
    });

    effect(() => this.onDrawerOpenedChange(this.drawerOpened()));

    this.conditionalMessageHandler.set('SkillsTester', { handler: message => this.handleConditionalDisplayMessage(message), isGlobalHandler: false });

    // When the component is destroyed, clear the aggregations store
    // to avoid memory leaks and ensure that the aggregations are reset
    destroyRef.onDestroy(() => this.aggregationsStore.clear());
  }

  selectAll() {
    if (this.selectedAll() === 'all') {
      this.unselectAll();
      return;
    }

    this.query.data()?.pages?.forEach(page => {
      page.records.forEach(record => {
        record.$selected = true;
        this.selectionStore.addArticleToMultiSelection(record as Article);
      });
    });
  }

  unselectAll() {
    this.query.data()?.pages?.forEach(page => {
      page.records.forEach(record => {
        record.$selected = false;
        this.selectionStore.removeArticleFromMultiSelection(record as Article);
      });
    });
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
    const audit = {
      type: 'Search_Sort',
      detail: {
        sort: sort.name,
        orderByClause: sort.orderByClause
      }
    };
    this.queryService.audit = audit;
    this.queryParamsStore.patch({ sort: sort.name }, audit);
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
    const collapsed = !this.assistantCollapsed();
    this.userSettingsStore.updateAssistantCollapsed(collapsed);
    this.assistantCollapsed.set(collapsed);
  }
}
