import { Component, computed, inject, input, model, OnDestroy, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article, LegacyFilter } from '@sinequa/atomic';
import {
  ApplicationStore,
  AppStore,
  BookmarkButtonComponent,
  CollectionsDialog,
  LabelsEditDialog,
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
import { BadgeComponent, CardComponent, CardContentComponent, CardFooterComponent, CardHeaderComponent, cn } from '@sinequa/ui';

import { CardMenuComponent } from '../menu';

type Tab = 'attachments' | 'similars';

type CustomMetadata = {
  fields: string[];
  title?: string;
};

@Component({
  selector: 'slide-card, slidecard, SlideCard',
  imports: [
    BookmarkButtonComponent,
    SourceComponent,
    TranslocoDateImpurePipe,
    TranslocoPipe,
    MissingTermsComponent,
    MetadataComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent,
    BadgeComponent,
    CardMenuComponent
  ],
  templateUrl: './slide-card.html',
  host: {
    '(document:keydown.shift.t)': 'isLineClamped.set(!isLineClamped())'
  },
  hostDirectives: [
    {
      directive: SelectArticleOnClickDirective,
      inputs: ['article', 'strategy']
    },
    {
      directive: ShowBookmarkDirective,
      inputs: ['article']
    }
  ]
})
export class SlideCard implements OnDestroy {
  cn = cn;
  public readonly myarticle = input<Article>();
  public readonly customMetadata = input<CustomMetadata[] | undefined>([{ title: 'labels', fields: ['public_label', 'private_label'] }]);

  public readonly article = model<Article>({} as Article);
  public readonly strategy = input<SelectionStrategy>();

  thumbnailFailed = signal(false);

  // by default add to assistant is disabled
  public readonly allowAI = input<boolean>(false);

  appStore = inject(AppStore);
  applicationStore = inject(ApplicationStore);
  selectionStore = inject(SelectionStore);
  queryParamStore = inject(QueryParamsStore);
  searchService = inject(SearchService);
  labelService = inject(LabelService);
  previewService = inject(PreviewService);

  readonly editLabelsDialog = viewChild(LabelsEditDialog);
  readonly addToCollectionDialog = viewChild(CollectionsDialog);

  showBookmark = signal(false);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe(value => {
    this.showBookmark.set(value);
  });
  isLineClamped = signal<boolean>(true);

  selected = computed(() => this.article()?.id === getState(this.selectionStore).id);

  protected extract = computed(() => {
    if (!this.article().matchingpassages) return this.article().relevantExtracts;

    const topPassage = this.article().matchingpassages!.passages.sort((a, b) => (a.score > b.score ? -1 : 1))[0];
    return topPassage.highlightedText;
  });

  protected showTab = signal(false);
  protected currentTab: Tab = 'attachments';

  protected docformatMetadata = computed(() => {
    return this.article().docformat ?? this.article().doctype;
  });

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
    this.editLabelsDialog()?.open(this.article());
  }

  addToCollection(): void {
    this.addToCollectionDialog()?.open(this.article());
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
