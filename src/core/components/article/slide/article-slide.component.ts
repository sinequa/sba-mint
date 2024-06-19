import { DatePipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { getState } from '@ngrx/signals';

import { StopPropagationDirective } from 'toolkit';
import { Article } from '@sinequa/atomic';
import { SelectArticleOnClickDirective, ShowBookmarkDirective } from '@sinequa/atomic-angular';
import { SelectionStore } from '@sinequa/atomic-angular';

import { BookmarkButtonComponent } from '../../bookmark/bookmark-button.component';

@Component({
  selector: 'app-article-slide',
  standalone: true,
  imports: [DatePipe, StopPropagationDirective, BookmarkButtonComponent],
  templateUrl: './article-slide.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class.selected]': 'selected()'
  },
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: slide']
  }, {
    directive: ShowBookmarkDirective,
    inputs: ['article: slide']
  }]
})
export class ArticleSlideComponent implements OnDestroy {
  public readonly slide = input.required<Partial<Article> | undefined>();

  showBookmark = signal(false);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe((value) => {
    this.showBookmark.set(value);
  });

  selectionStore = inject(SelectionStore);
  selected = computed(() => this.slide()?.id === getState(this.selectionStore).id);

  ngOnDestroy(): void {
    this.showBookmarkOutputSubscription.unsubscribe();
  }
}
