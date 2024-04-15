import { DatePipe } from '@angular/common';
import { Component, HostBinding, LOCALE_ID, effect, inject, input } from '@angular/core';

import { BookmarkComponent } from '@/app/components/bookmark/bookmark.component';
import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { SlideArticle } from '@/app/types/articles';
import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';

@Component({
  selector: 'app-article-slide-light',
  standalone: true,
  imports: [DatePipe, WpsAuthorComponent, BookmarkComponent],
  templateUrl: './article-slide-light.component.html',
  styleUrl: './article-slide-light.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: slide', 'strategy']
  }]
})
export class ArticleSlideLightComponent {
  @HostBinding('attr.title') public title: string | undefined = '';

  public slide = input.required<SlideArticle | Partial<SlideArticle> | undefined>();
  public strategy = input<SelectionStrategy>();

  private readonly datePipe = new DatePipe(inject(LOCALE_ID));

  private slideEffect = effect(
    () => {
      const metadata = [
        this.slide()?.authors?.[0] ?? undefined,
        this.slide()?.modified ? this.datePipe.transform(this.slide()?.modified, 'mediumDate') : undefined,
      ];

      this.title = `${this.slide()?.title}\n${metadata.join(', ')}`
    }
  );
}
