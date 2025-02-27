import { MetadataComponent } from '@sinequa/atomic-angular';
import { BookmarkButtonComponent } from '@/core/features/bookmarks/bookmark-button';
import { Component, computed, inject, input, OnDestroy, signal, viewChild } from '@angular/core';
import { getState } from '@ngrx/signals';

import {
  ApplicationStore,
  AppStore,
  ButtonComponent,
  LabelService,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  QueryParamsStore,
  SearchService,
  SelectArticleOnClickDirective,
  SelectionStore,
  SelectionStrategy,
  ShowBookmarkDirective
} from '@sinequa/atomic-angular';

import { CollectionsDialog } from '@/core/features/collections/collections-add.dialog';
import { LabelsEditComponent } from '@/core/features/labels/labels-edit.dialog';
import { TranslocoDateImpurePipe } from '@/core/pipes/transloco-date.pipe';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Article, LegacyFilter } from '@sinequa/atomic';
import { SourceIconComponent } from '../../source-icon/source-icon.component';
import { MissingTermsComponent } from '../missing-terms/missing-terms.component';

type Tab = 'attachments' | 'similars';

export interface CustomMetadata {
  field: string;
  title?: string;
}

const HIDDEN_METADATA = ['web', 'htm', 'html', 'xhtm', 'xhtml', 'mht', 'mhtml', 'mht', 'aspx', 'page'];

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`../i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'app-article-default',
  standalone: true,
  imports: [
    BookmarkButtonComponent,
    SourceIconComponent,
    TranslocoDateImpurePipe,
    ButtonComponent,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    TranslocoPipe,
    LabelsEditComponent,
    CollectionsDialog,
    MissingTermsComponent,
    MetadataComponent
  ],
  templateUrl: './article-default.component.html',
  styleUrl: './article-default.component.scss',
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
  providers: [provideTranslocoScope({ scope: 'article', loader })]
})
export class ArticleDefaultComponent implements OnDestroy {
  public readonly myarticle = input<Article>();
  public readonly customMetadata = input<CustomMetadata[] | undefined>([{ title: 'article.jobTitles', field: 'entity13' }]);
  public readonly article = input.required<Article>();
  public readonly strategy = input<SelectionStrategy>();

  appStore = inject(AppStore);
  applicationStore = inject(ApplicationStore);
  selectionStore = inject(SelectionStore);
  queryParamStore = inject(QueryParamsStore);
  searchService = inject(SearchService);
  labelService = inject(LabelService);

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

  ngOnDestroy(): void {
    this.showBookmarkOutputSubscription.unsubscribe();
  }

  isArticle(value: any): value is { [key: string]: any } {
    return value && typeof value === 'object' && 'entity13' in value;
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
}
