import { DatePipe } from '@angular/common';
import { Component, HostBinding, LOCALE_ID, OnDestroy, effect, inject, input, signal } from '@angular/core';

import { AuthorComponent } from '@/app/components/author/author.component';
import { BookmarkComponent } from '@/app/components/bookmark/bookmark.component';
import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { ShowBookmarkDirective } from '@/app/directives/show-bookmark.directive';
import { SlideArticle } from '@/app/types/articles';

@Component({
  selector: 'app-article-slide-light',
  standalone: true,
  imports: [DatePipe, AuthorComponent, BookmarkComponent],
  templateUrl: './article-slide-light.component.html',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: slide', 'strategy']
  }, {
    directive: ShowBookmarkDirective,
    inputs: ['article: slide']
  }]
})
export class ArticleSlideLightComponent implements OnDestroy {
  @HostBinding('attr.title') public title: string | undefined = '';

  public slide = input.required<SlideArticle | Partial<SlideArticle> | undefined>();
  public strategy = input<SelectionStrategy>();

  showBookmark = signal(false);
  showBookmarkOutputSubscription = inject(ShowBookmarkDirective)?.showBookmark.subscribe((value) => {
    this.showBookmark.set(value);
  });

  private readonly datePipe = new DatePipe(inject(LOCALE_ID));

  private slideEffect = effect(
    () => {
      const metadata = [
        this.slide()?.authors?.[0] ?? undefined,
        this.slide()?.modified ? this.datePipe.transform(this.slide()?.modified, 'mediumDate') : undefined,
      ];

  ngOnDestroy(): void {
    this.showBookmarkOutputSubscription.unsubscribe();
  }
}
