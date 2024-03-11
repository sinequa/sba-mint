import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { SelectArticleOnClickDirective } from '@/app/directives';
import { SlideArticle } from '@/app/types/articles';
import { StopPropagationDirective } from 'toolkit';

@Component({
  selector: 'app-article-slide',
  standalone: true,
  imports: [DatePipe, StopPropagationDirective],
  templateUrl: './article-slide.component.html',
  styleUrl: './article-slide.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: slide']
  }]
})
export class ArticleSlideComponent {
  public readonly slide = input.required<SlideArticle | Partial<SlideArticle> | undefined>();
}
