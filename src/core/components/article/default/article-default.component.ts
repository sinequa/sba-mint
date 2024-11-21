import { BookmarkButtonComponent } from '@/core/features/bookmarks/button/bookmark-button.component';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal, viewChild } from '@angular/core';
import { getState } from '@ngrx/signals';
import { StopPropagationDirective } from 'toolkit';

import { AppStore, DropdownComponent, MetadataComponent, QueryParamsStore, SearchService, SelectArticleOnClickDirective, SelectionStore, ShowBookmarkDirective } from '@sinequa/atomic-angular';

import { TranslocoDateImpurePipe } from '@/core/pipes/transloco-date.pipe';
import { BaseArticle } from '@/core/registry/base-article';
import { SourceIconComponent } from '../../source-icon/source-icon.component';
import { LegacyFilter } from '@sinequa/atomic';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { EditLabelsComponent } from '@/core/features/dialog/edit-labels';

type Tab = 'attachments' | 'similars';

const HIDDEN_METADATA = ['web', 'htm', 'html', 'xhtm', 'xhtml', 'mht', 'mhtml', 'mht', 'aspx', 'page'];

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-article-default',
  standalone: true,
  imports: [
    NgClass,
    AsyncPipe,
    DatePipe,
    SelectArticleOnClickDirective,
    StopPropagationDirective,
    MetadataComponent,
    BookmarkButtonComponent,
    SourceIconComponent,
    TranslocoDateImpurePipe,
    DropdownComponent,
    TranslocoPipe,
    EditLabelsComponent
  ],
  templateUrl: './article-default.component.html',
  styleUrl: './article-default.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article', 'strategy']
  }, {
    directive: ShowBookmarkDirective,
    inputs: ['article']
  }],
  providers: [provideTranslocoScope({ scope: 'article', loader })]
})
export class ArticleDefaultComponent extends BaseArticle implements OnDestroy {
  appStore = inject(AppStore);
  selectionStore = inject(SelectionStore);
  queryParamStore = inject(QueryParamsStore);
  searchService = inject(SearchService);

  readonly editLabelsDialog = viewChild(EditLabelsComponent);

  showBookmark = signal(false);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe((value) => {
    this.showBookmark.set(value);
  });

  selected = computed(() => this.article()?.id === getState(this.selectionStore).id);

  protected extract = computed(() => {
    if (!this.article().matchingpassages) return this.article().relevantExtracts;

    const topPassage = this.article().matchingpassages!.passages.sort((a, b) => a.score > b.score ? -1 : 1)[0];
    return topPassage.highlightedText;
  })

  protected showTab = signal(false);
  protected currentTab: Tab = 'attachments';

  protected docformatMetadata = computed(() => {
    if (this.article().docformat && !HIDDEN_METADATA.includes(this.article().docformat.toLowerCase()))
      return this.article().docformat;

    if (this.article().doctype && !HIDDEN_METADATA.includes(this.article().doctype!.toLowerCase()))
      return this.article().doctype;

    return undefined;
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
    this.editLabelsDialog()?.showModal();
  }
}
