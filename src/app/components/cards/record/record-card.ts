import { Component, computed, inject, input, model, OnDestroy, signal } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article as A, LegacyFilter } from '@sinequa/atomic';
import {
  BookmarkButtonComponent,
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
import { BadgeComponent, CardComponent, CardContentComponent, CardFooterComponent, CardHeaderComponent } from '@sinequa/ui';

import { CardMenuComponent } from '../menu';

type Tab = 'attachments' | 'similars';

type CustomMetadata = {
  fields: string[];
  title?: string;
};

type Article = A & {
  [key: string]: any;
};

const HIDDEN_METADATA = ['web', 'htm', 'html', 'xhtm', 'xhtml', 'mht', 'mhtml', 'mht', 'aspx', 'page'];

@Component({
  selector: 'record-card, recordcard, RecordCard',
  imports: [
    BadgeComponent,
    BookmarkButtonComponent,
    SourceComponent,
    TranslocoDateImpurePipe,
    MissingTermsComponent,
    MetadataComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent,
    CardMenuComponent
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
  public readonly customMetadata = input<CustomMetadata[] | undefined>([{ title: 'labels', fields: ['public_label', 'private_label'] }]);
  public readonly article = model<Article>({} as Article);
  public readonly strategy = input<SelectionStrategy>();

  // by default add to assistant is disabled
  public readonly allowAI = input<boolean>(false);

  selectionStore = inject(SelectionStore);
  queryParamStore = inject(QueryParamsStore);
  searchService = inject(SearchService);
  previewService = inject(PreviewService);

  showBookmark = signal(false);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe(value => {
    this.showBookmark.set(value);
  });

  selected = computed(() => this.article()?.id === getState(this.selectionStore).id);

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

  constructor() {}

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

  onCtrlEnter(): void {
    if (this.article()) {
      this.previewService.openExternal(this.article());
    }
  }

  onMetadataClick({ filter }: { filter: LegacyFilter; event: Event }): void {
    this.queryParamStore.updateFilter(filter);
  }
}
