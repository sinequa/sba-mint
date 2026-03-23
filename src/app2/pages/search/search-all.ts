import { NgComponentOutlet } from "@angular/common";
import { Component, computed, DestroyRef, effect, Injector, inject, input, signal, Type, untracked } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SearchOverviewComponent } from "@components/assistant-overview";
import { CardSkeleton } from "@components/cards/record/skeleton";
import { PreviewComponent } from "@components/preview/preview";
import { SheetPreviewerComponent } from "@components/preview/sheet-previewer";
import { fetchServerPage } from "@config/fetch-server-page";
import { getState } from "@ngrx/signals";
import { getComponentsForDocumentType } from "@registry/document-type-registry";
import { MessageHandler } from "@sinequa/assistant/chat";
import { Aggregation, Article, bisect, CCApp, debug, isNotInputEvent, Query, QueryParams, Result as R, SpellingCorrectionMode } from "@sinequa/atomic";
import {
  AggregationsStore,
  AppStore,
  AsideFiltersComponent,
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
  UserSettingsStore
} from "@sinequa/atomic-angular";
import { BreakpointObserverService, cn } from "@sinequa/ui";
import { injectInfiniteQuery, provideQueryClient, QueryClient } from "@tanstack/angular-query-experimental";
import { SearchActionsComponent } from "./search-actions";

const MOBILE_BREAKPOINT = 1024; // px

type Result = R & { nextPage?: number; previousPage?: number };
type QueryParamsProps = {
  f?: string; // filters list
  p?: number; // page number
  s?: string; // sort name
  t?: string; // tab name
  q?: string; // query text
  b?: string; // basket,
  n?: string; // query name
  id?: string; // record id
  c?: SpellingCorrectionMode; // correction mode
};

@Component({
  selector: "app-search-all",
  imports: [
    NgComponentOutlet,
    InfinityScrollDirective,
    NoResultComponent,
    SearchFeedbackComponent,
    FiltersBarComponent,
    NavbarTabsComponent,
    CardSkeleton,
    SearchFeedbackComponent,
    AsideFiltersComponent,
    SearchOverviewComponent,
    PreviewComponent,
    SheetPreviewerComponent,
    SearchActionsComponent
  ],
  templateUrl: "./search-all.html",
  styles: [
    `
      :host {
        /* to avoid z-index collisions */
        isolation: isolate;
      }
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
    "(keydown.enter)": "handleKeydownEnter($event)",
    "(window:resize)": "onResize($event)"
  },
  providers: [provideQueryClient(new QueryClient())]
})
export class SearchAllComponent {
  cn = cn;

  private injector = inject(Injector);

  // all injected services and stores
  protected readonly queryService = inject(QueryService);
  protected readonly selectionService = inject(SelectionService);
  protected readonly breakpointService = inject(BreakpointObserverService);

  protected readonly appStore = inject(AppStore);
  protected readonly appFeatures = this.appStore.general()?.features;
  protected readonly aggregationsStore = inject(AggregationsStore);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly principalStore = inject(PrincipalStore);
  protected readonly userSettingsStore = inject(UserSettingsStore);
  protected readonly selectionStore = inject(SelectionStore);

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
  protected readonly p = input<number>(); // page number

  // all signals used in the component
  currentInnerWidth = signal(window.innerWidth);
  // breakpoin mobile set in the service is 768, but we want to use the sheet previewer for tablets as well, so we set the breakpoint to 1024
  isMobile = computed(() => this.breakpointService.isMobile() || this.currentInnerWidth() < MOBILE_BREAKPOINT);

  protected readonly result = signal<Result | undefined>(undefined);
  protected readonly queryText = signal<string>("");
  protected readonly currentKeys = signal<QueryParams | undefined>(undefined);

  // the Assistant is expanded and visible by default
  protected readonly assistantCollapsed = signal<boolean>(false);
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

  // all rows from all pages to display in the UI, computed from the query result
  allRows = computed(() => this.query.data()?.pages.flatMap(page => page.records) ?? []);

  // tanstack query (infinite) to fetch the search results
  query = injectInfiniteQuery<Result>(() => ({
    queryKey: [`search-${this.t()}`, this.currentKeys(), this.userOverrideActive()],
    queryFn: ({ pageParam }) =>
      fetchServerPage(this.injector, pageParam, {
        currentKeys: this.currentKeys(),
        basket: this.b(),
        id: this.id(),
        q: this.queryParamsStore.getQuery(),
        tab: this.t(),
        spellingCorrectionMode: this.c()
      }),
    initialPageParam: this.p(),
    getPreviousPageParam: firstPage => firstPage.previousPage ?? undefined,
    getNextPageParam: lastPage => lastPage.nextPage ?? undefined
  }));

  // standard injectQuery without infinite loading
  // query = injectQuery(() => ({
  //   queryKey: [`search-${this.t()}`, this.currentKeys(), this.userOverrideActive()],
  // queryFn: () =>
  //   fetchServerPage(this.injector, pageParam, {
  //     currentKeys: this.currentKeys(),
  //     basket: this.b(),
  //     id: this.id(),
  //     q: this.queryParamsStore.getQuery(),
  //     tab: this.t(),
  //     spellingCorrectionMode: this.c()
  //   }),
  // }));

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
   * Signal to track state of the selected all checkbox.
   */
  selectedAll = signal<"all" | "some" | "none">("none");

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
  readonly enabledUserInput = computed(() => this.appStore.assistants()[this.instanceId()]?.["modeSettings"]?.["enabledUserInput"] === true);
  // assistantQuery: Query = { name: 'assistant' };

  readonly hasPreview = computed(() => this.selectionStore.id?.() !== undefined);

  conditionalMessageHandler: Map<string, MessageHandler<any>> = new Map();

  constructor(destroyRef: DestroyRef) {
    // Update the query params store with the filters from the URL query params
    // This allows Browser back/forward to work correctly
    effect(() => {
      debug("effect - 1. update query params store from URL");
      const filters = this.f() ? JSON.parse(this.f() ?? "") : []; // Parse the filters from the query params
      this.queryParamsStore.patch({
        text: this.q(),
        tab: this.t(),
        basket: this.b(),
        sort: this.s(),
        filters,
        name: this.n(),
        page: this.p(),
        id: this.id(),
        spellingCorrectionMode: this.c()
      });
    });

    // Update the URL with the query params from the query params store
    effect(() => {
      debug("effect - 2. update URL from query params store");
      this.hideFeedback.set(false);

      const queryParams: QueryParamsProps = {};
      const { id, text, filters = [], page, sort, tab, basket, name, spellingCorrectionMode } = getState(this.queryParamsStore);

      queryParams.f = filters.length > 0 ? JSON.stringify(filters) : undefined;
      queryParams.p = page;
      queryParams.s = sort;
      queryParams.t = tab;
      queryParams.q = text;
      queryParams.b = basket;
      queryParams.n = name;
      queryParams.c = spellingCorrectionMode;
      queryParams.id = id;
      this.router.navigate([], { relativeTo: this.route, queryParamsHandling: "merge", queryParams, state: {} });
    });

    // Update keys to retrigger the query when relevant parameters change
    effect(() => {
      debug("effect - 3. update keys to retrigger the query");
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

      untracked(() => {
        if (this.currentKeys() === undefined) {
          this.currentKeys.set(r);
          return;
        }
        // checks if the current keys are different from the new ones
        if (JSON.stringify(this.currentKeys()) !== JSON.stringify(r)) {
          this.currentKeys.set(r);
        }
      });
    });

    // Make Result object available to children and update aggregations store
    effect(() => {
      debug("effect - 4. make Result object available to children and update aggregations store");
      this.query.isSuccess();
      const result = this.query.data()?.pages[0];

      if (!result) return;

      this.result.set(result);

      // Update the aggregations store with the new aggregations
      this.aggregationsStore.update(result.aggregations);
    });

    // Update selectedAll signal based on the selection store and current pages
    effect(() => {
      debug("effect - 5. update selectedAll signal based on the selection store and current pages");
      const articles = this.query.data()?.pages.flatMap(page => page.records.map(x => x.id)) || [];
      const selection = this.selectionStore.multiSelection().map(x => x.id);
      const b = bisect(articles, x => selection.includes(x));

      if (b.true.length === 0) this.selectedAll.set("none");
      else if (b.false.length === 0) this.selectedAll.set("all");
      else this.selectedAll.set("some");
    });

    effect(() => {
      debug("effect - 7. update assistant query from current keys");
      const { page, tab, basket, spellingCorrectionMode, text } = this.currentKeys() || {};
      const q = this.queryParamsStore.getQuery();
      const query = { ...q, page, tab, basket, spellingCorrectionMode, text } as Query;

      // this.assistantQuery = { ...this.assistantQuery, ...query };

      untracked(() => {
        // Add the current search to the user settings when the text is not empty
        if (text && text !== "") {
          void this.userSettingsStore.addCurrentSearch(query as QueryParams);
        }

        // Update the query text signal with the current query text
        this.queryText.set(this.currentKeys()?.text ?? "");
      });
    });

    this.conditionalMessageHandler.set("SkillsTester", {
      handler: message => this.handleConditionalDisplayMessage(message),
      isGlobalHandler: false
    });

    // When the component is destroyed, clear the aggregations store
    // to avoid memory leaks and ensure that the aggregations are reset
    destroyRef.onDestroy(() => this.aggregationsStore.clear());
  }

  selectAll() {
    if (this.selectedAll() === "all") {
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
    this.query.hasNextPage() && this.query.fetchNextPage();
  }

  handleKeydownEnter(e: Event) {
    if (isNotInputEvent(e as KeyboardEvent)) {
      e.stopImmediatePropagation(); // required for the drawer to open properly
    }
  }

  onDrawerOpenedChange(opened: boolean): void {
    // Your function logic here
    debug(`Drawer opened state changed to: ${opened}`);
  }

  getArticleType(docType?: string): Type<unknown> {
    return getComponentsForDocumentType(docType).articleComponent;
  }

  handleConditionalDisplayMessage(message: { result: string }) {
    const { result } = message;
    if (result.toLocaleLowerCase().includes("show overview")) {
      this.hideAssistant.set(false);
    } else {
      this.hideAssistant.set(true);
    }
  }

  onFeedbackClose() {
    this.hideFeedback.set(true);
  }

  onResize(event: Event) {
    this.currentInnerWidth.set((event.target as Window).innerWidth);
  }
}
