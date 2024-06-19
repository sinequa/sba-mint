import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { getState } from '@ngrx/signals';

import { MetadataComponent } from '@sinequa/atomic-angular';
import { SelectArticleOnClickDirective, SelectionStrategy, ShowBookmarkDirective } from '@sinequa/atomic-angular';
import { AppStore, SelectionStore } from '@sinequa/atomic-angular';

import { StopPropagationDirective } from 'toolkit';
import { BookmarkButtonComponent } from '../../bookmark/bookmark-button.component';
import { Article } from '@sinequa/atomic';
import { SourceIconComponent } from '../../source-icon/source-icon.component';

type Tab = 'attachments' | 'similars';

const HIDDEN_METADATA = ['web', 'htm', 'html', 'xhtm', 'xhtml', 'mht', 'mhtml', 'mht', 'aspx', 'page'];

@Component({
  selector: 'app-article-default',
  standalone: true,
  imports: [NgClass, AsyncPipe, DatePipe, SelectArticleOnClickDirective, StopPropagationDirective, MetadataComponent, BookmarkButtonComponent, SourceIconComponent],
  templateUrl: './article-default.component.html',
  styleUrl: './article-default.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article', 'strategy']
  }, {
    directive: ShowBookmarkDirective,
    inputs: ['article']
  }]
})
export class ArticleDefaultComponent implements OnDestroy {
  public readonly article = input.required<Article>();
  public readonly strategy = input<SelectionStrategy>();

  appStore = inject(AppStore);
  selectionStore = inject(SelectionStore);

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
}
