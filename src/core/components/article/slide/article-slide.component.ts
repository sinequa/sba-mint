import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { getState } from '@ngrx/signals';

import { SelectArticleOnClickDirective, SelectionStore, ShowBookmarkDirective } from '@sinequa/atomic-angular';

import { BookmarkButtonComponent } from '@/core/features/bookmarks/button/bookmark-button.component';
import { TranslocoDateImpurePipe } from '@/core/pipes/transloco-date.pipe';
import { BaseArticle } from '@/core/registry/base-article';
import { Article } from '@sinequa/atomic';


@Component({
  selector: 'app-article-slide',
  standalone: true,
  imports: [BookmarkButtonComponent, TranslocoDateImpurePipe],
  templateUrl: './article-slide.component.html',
  host: {
    '[class.selected]': 'selected()'
  },
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article', 'strategy']
  }, {
    directive: ShowBookmarkDirective,
    inputs: ['article']
  }]
})
export class ArticleSlideComponent extends BaseArticle<Article> implements OnDestroy {
  selectionStore = inject(SelectionStore);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe((value) => {
    this.showBookmark.set(value);
  });

  thumbnailFailed = signal(false);
  showBookmark = signal(false);
  selected = computed(() => this.article()?.id === getState(this.selectionStore).id);

  ngOnDestroy(): void {
    this.showBookmarkOutputSubscription.unsubscribe();
  }
}
