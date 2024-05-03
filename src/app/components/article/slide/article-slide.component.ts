import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { BookmarkComponent } from '@/app/components/bookmark/bookmark.component';
import { SelectArticleOnClickDirective } from '@/app/directives';
import { SlideArticle } from '@/app/types/articles';
import { StopPropagationDirective } from 'toolkit';
import { getState } from '@ngrx/signals';
import { SelectionStore } from '@/app/stores';

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
  }]
})
export class ArticleSlideComponent {
  public readonly slide = input.required<SlideArticle | Partial<SlideArticle> | undefined>();

  selectionStore = inject(SelectionStore);
  selected = computed(() => this.slide()?.id === getState(this.selectionStore).id);

}
