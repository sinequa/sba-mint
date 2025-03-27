import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { getState } from '@ngrx/signals';

import {
  BookmarkButtonComponent,
  SelectArticleOnClickDirective,
  SelectionStore,
  SelectionStrategy,
  ShowBookmarkDirective,
  TranslocoDateImpurePipe
} from '@sinequa/atomic-angular';

import { Article } from '@sinequa/atomic';

@Component({
  selector: 'app-article-slide',
  standalone: true,
  imports: [BookmarkButtonComponent, TranslocoDateImpurePipe],
  templateUrl: './article-slide.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class.selected]': 'selected()'
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
export class ArticleSlideComponent implements OnDestroy {
  public readonly article = input.required<Article>();
  public readonly strategy = input<SelectionStrategy>();

  selectionStore = inject(SelectionStore);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe(value => {
    this.showBookmark.set(value);
  });

  thumbnailFailed = signal(false);
  showBookmark = signal(false);
  selected = computed(() => this.article()?.id === getState(this.selectionStore).id);

  ngOnDestroy(): void {
    this.showBookmarkOutputSubscription.unsubscribe();
  }
}
