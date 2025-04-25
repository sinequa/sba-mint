import { Component, computed, inject, input, OnDestroy, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article, LegacyFilter } from '@sinequa/atomic';
import {
  ApplicationStore,
  AppStore,
  BookmarkButtonComponent,
  CollectionsDialog,
  DrawerStackService,
  LabelsEditComponent,
  LabelService,
  MetadataComponent,
  MissingTermsComponent,
  PreviewService,
  QueryParamsStore,
  SearchService,
  SelectArticleOnClickDirective,
  SelectionStore,
  SelectionStrategy,
  ShowBookmarkDirective,
  SourceComponent,
  TranslocoDateImpurePipe
} from '@sinequa/atomic-angular';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardFooterComponent,
  CardHeaderComponent,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent
} from '@sinequa/ui';

type Tab = 'attachments' | 'similars';

type CustomMetadata = {
  field: string;
  title?: string;
};

const HIDDEN_METADATA = ['web', 'htm', 'html', 'xhtm', 'xhtml', 'mht', 'mhtml', 'mht', 'aspx', 'page'];

@Component({
  selector: 'record-card, recordcard, RecordCard',
  imports: [
    BadgeComponent,
    BookmarkButtonComponent,
    SourceComponent,
    TranslocoDateImpurePipe,
    ButtonComponent,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    TranslocoPipe,
    LabelsEditComponent,
    CollectionsDialog,
    MissingTermsComponent,
    MetadataComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent
  ],
  templateUrl: './record-card.html',
  hostDirectives: [
    {
      directive: SelectArticleOnClickDirective,
      inputs: ['article', 'strategy']
    },
    {
      directive: ShowBookmarkDirective,
      inputs: ['article']
    }
  ],
  providers: [provideTranslocoScope({ scope: 'article' })]
})
export class RecordCard implements OnDestroy {
  public readonly myarticle = input<Article>();
  public readonly customMetadata = input<CustomMetadata[] | undefined>([
    { title: 'article.jobTitles', field: 'entity13' },
    { title: 'labels', field: 'labels' }
  ]);
  public readonly article = input.required<Article>();
  public readonly strategy = input<SelectionStrategy>();

  // by default add to assistant is disabled
  public readonly allowAI = input<boolean>(false);

  appStore = inject(AppStore);
  applicationStore = inject(ApplicationStore);
  selectionStore = inject(SelectionStore);
  queryParamStore = inject(QueryParamsStore);
  searchService = inject(SearchService);
  labelService = inject(LabelService);
  previewService = inject(PreviewService);
  drawerStack = inject(DrawerStackService);

  readonly editLabelsDialog = viewChild(LabelsEditComponent);
  readonly addToCollectionDialog = viewChild(CollectionsDialog);

  showBookmark = signal(false);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe(value => {
    this.showBookmark.set(value);
  });

  selected = computed(() => this.article()?.id === getState(this.selectionStore).id);

  customMetadataItems = computed(() => this.customMetadata()?.map(metadata => (this.article() as any)[metadata.field] ?? {}));

  protected extract = computed(() => {
    if (!this.article().matchingpassages) return this.article().relevantExtracts;

    const topPassage = this.article().matchingpassages!.passages.sort((a, b) => (a.score > b.score ? -1 : 1))[0];
    return topPassage.highlightedText;
  });

  protected showTab = signal(false);
  protected currentTab: Tab = 'attachments';

  protected docformatMetadata = computed(() => {
    if (this.article().docformat && !HIDDEN_METADATA.includes(this.article().docformat.toLowerCase())) return this.article().docformat;

    if (this.article().doctype && !HIDDEN_METADATA.includes(this.article().doctype!.toLowerCase())) return this.article().doctype;

    return undefined;
  });

  protected hasLabelsAccess = computed(() => this.applicationStore.hasLabelsAccess() || false);

  readonly drawerOpened = signal(false);

  constructor() {
    this.drawerStack.isOpened.pipe(takeUntilDestroyed()).subscribe(state => this.drawerOpened.set(state));
  }

  ngOnDestroy(): void {
    this.showBookmarkOutputSubscription.unsubscribe();
  }

  public toggleTab(tab: Tab): void {
    if (this.currentTab === tab) {
      this.showTab.set(!this.showTab());
      return;
    }

    this.currentTab = tab;
    this.showTab.set(true);
  }

  /**
   * Apply filter from the metadata click
   * @param field field to filter on
   * @param value value from the filter
   */
  setFilter(field: string, value: string): void {
    let filter: LegacyFilter = { field, value };
    this.queryParamStore.updateFilter(filter);
    this.searchService.search([]);
  }

  editLabels(): void {
    this.editLabelsDialog()?.showModal();
  }

  addToCollection(): void {
    this.addToCollectionDialog()?.showModal();
  }

  attachToAssistant(): void {
    const { assistantIdsToAttach } = getState(this.selectionStore);
    let ids = assistantIdsToAttach || [];

    if ((assistantIdsToAttach || []).indexOf(this.article().id) === -1) {
      ids.push(this.article().id);
    }

    this.selectionStore.update({ assistantIdsToAttach: ids });
  }

  onCtrlEnter(): void {
    if (this.article()) {
      this.previewService.openExternal(this.article());
    }
  }
}
