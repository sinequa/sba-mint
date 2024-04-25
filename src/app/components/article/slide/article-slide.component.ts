import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { BookmarkComponent } from '@/app/components/bookmark/bookmark.component';
import { SelectArticleOnClickDirective } from '@/app/directives';
import { SlideArticle } from '@/app/types/articles';
import { StopPropagationDirective } from 'toolkit';

@Component({
  selector: 'app-article-slide',
  standalone: true,
  imports: [DatePipe, StopPropagationDirective, BookmarkComponent],
  templateUrl: './article-slide.component.html',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: slide']
  }]
})
export class ArticleSlideComponent {
  public readonly slide = input.required<SlideArticle | Partial<SlideArticle> | undefined>();
}
