import { DatePipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';

import { BookmarkComponent } from '@/app/components/bookmark/bookmark.component';
import { SelectArticleOnClickDirective } from '@/app/directives';
import { ShowBookmarkDirective } from '@/app/directives/show-bookmark.directive';
import { SelectionStore } from '@/app/stores';
import { SlideArticle } from '@/app/types/articles';
import { getState } from '@ngrx/signals';
import { StopPropagationDirective } from 'toolkit';

@Component({
  selector: 'app-article-slide',
  standalone: true,
  imports: [DatePipe, StopPropagationDirective, BookmarkComponent],
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
  public readonly slide = input.required<SlideArticle | Partial<SlideArticle> | undefined>();

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
