import { Component, computed, DestroyRef, effect, inject, input, model, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article as A, LegacyFilter } from '@sinequa/atomic';
import {
  BookmarkButtonComponent,
  MetadataComponent,
  MissingTermsComponent,
  PreviewService,
  QueryParamsStore,
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
    TranslocoPipe,
    MissingTermsComponent,
    MetadataComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent,
    CardMenuComponent
  ],
  templateUrl: './record-card.html',
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
export class RecordCard {
  cn = cn;
  public readonly customMetadata = input<CustomMetadata[] | undefined>([{ title: 'labels', fields: ['public_label', 'private_label'] }]);
  public readonly article = model<Article>({} as Article);
  public readonly strategy = input<SelectionStrategy>();

  // by default add to assistant is disabled
  public readonly allowAI = input<boolean>(false);

  destroyRef = inject(DestroyRef);
  sanitize = inject(DomSanitizer);
  selectionStore = inject(SelectionStore);
  queryParamStore = inject(QueryParamsStore);
  previewService = inject(PreviewService);

  showBookmark = signal(false);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe(value => {
    this.showBookmark.set(value);
  });
  isLineClamped = signal<boolean>(true);

  selected = computed(() => this.article()?.id === getState(this.selectionStore).id);
  // state of checkbox for multi-select
  checked = signal<boolean>(false);
  multiSelected = computed(() => getState(this.selectionStore).multiSelection.find(a => a.id === this.article().id));

  protected extract = computed(() => {
    if (!this.article().matchingpassages) return this.article().relevantExtracts;

    const topPassage = this.article().matchingpassages!.passages.sort((a, b) => (a.score > b.score ? -1 : 1))[0];
    return topPassage.highlightedText;
  });

  protected title = computed(() => {
    // article().displayTitle is the title used in the search results and may contain HTML tags, this will be sanitized
    const { displayTitle, title, id } = this.article();
    return this.sanitize.bypassSecurityTrustHtml(displayTitle || title || id || '');
  });

  protected showTab = signal(false);
  protected currentTab: Tab = 'attachments';

  protected docformatMetadata = computed(() => {
    if (this.article().docformat && !HIDDEN_METADATA.includes(this.article().docformat.toLowerCase()))
      return { field: 'docformat', value: this.article().docformat! };

    if (this.article().doctype && !HIDDEN_METADATA.includes(this.article().doctype!.toLowerCase())) return { field: 'doctype', value: this.article().doctype! };

    return undefined;
  });

  constructor() {
    effect(() => {
      this.checked.set(!!this.multiSelected());
      this.article().$selected = !!this.multiSelected();
    });

    // Ensure that the component is destroyed properly
    this.destroyRef.onDestroy(() => {
      this.showBookmarkOutputSubscription.unsubscribe();
    });
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
  setFilter(field: string, value: string, event: Event): void {
    event.stopImmediatePropagation();
    let filter: LegacyFilter = { field, value };
    this.queryParamStore.updateFilter(filter);
  }

  onCtrlEnter(): void {
    if (this.article()) {
      this.previewService.openExternal(this.article());
    }
  }

  onMetadataClick({ filter, event }: { filter: LegacyFilter; event: Event }): void {
    event.stopImmediatePropagation();
    this.queryParamStore.updateFilter(filter);
  }

  onMultiSelectToggle(event: Event): void {
    event.stopImmediatePropagation();

    this.checked.set(!this.checked());

    if (this.article()) {
      this.article().$selected = !this.article().$selected;

      if (this.article().$selected) this.selectionStore.addArticleToMultiSelection(this.article());
      else this.selectionStore.removeArticleFromMultiSelection(this.article());
    }
  }

  openExternal(event: Event) {
    if (!this.article().url1) return;
    event.stopPropagation();
    this.previewService.openExternal(this.article());
  }
}
