import { BookmarksService } from '@/app/services/bookmarks.service';
import { userSettingsStore } from '@/app/stores/user-settings.store';
import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { SelectArticleOnClickDirective, SelectionStrategy } from '@mint/directives/select-article-on-click.directive';
import { Article } from '@mint/types/articles/article.type';
import { combineLatest, filter, map } from 'rxjs';
import { StopPropagationDirective } from 'toolkit';
import { TreepathToIconClassPipe } from '../../../pipes/treepath-to-icon-class.pipe';
import { ArticleDefaultLightComponent } from '../default-light/article-default-light.component';

type Tab = 'attachments' | 'similars';

@Component({
  selector: 'app-article-default',
  standalone: true,
  imports: [NgClass, AsyncPipe, DatePipe, TreepathToIconClassPipe, SelectArticleOnClickDirective, StopPropagationDirective, ArticleDefaultLightComponent, WpsAuthorComponent],
  templateUrl: './article-default.component.html',
  styleUrl: './article-default.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article', 'strategy']
  }]
})
export class ArticleDefaultComponent implements OnInit {
  public readonly article = input<Partial<Article> | undefined>();
  public readonly strategy = input<SelectionStrategy>();

  protected showTab = signal(false);
  protected currentTab: Tab = 'attachments';
  protected isBookmarked = combineLatest([
    userSettingsStore.current$,
    toObservable(this.article)
      .pipe(
        filter((article) => !!article)
      )
  ]).pipe(
    map(([userSettings, article]) => {
      if (!userSettings || !article) return false;
      return userSettings.bookmarks?.find((bookmark) => bookmark.id === article.id);
    })
  );

  protected attachments: Partial<Article>[] = [
    { value: 'X-1', type: 'default' },
    { value: 'X-2', type: 'default' },
    { value: 'X-3', type: 'default' }
  ]

  protected similars: Partial<Article>[] = [
    { value: 'X-1', type: 'default' },
    { value: 'X-2', type: 'default' },
    { value: 'X-3', type: 'default' },
    { value: 'X-4', type: 'default' },
    { value: 'X-5', type: 'default' }
  ]

  private readonly bookmarksService = inject(BookmarksService);

  ngOnInit(): void {
    if (!this.article()) return;
  }

  public toggleTab(tab: Tab): void {
    if (this.currentTab === tab) {
      this.showTab.set(!this.showTab());
      return;
    }

    this.currentTab = tab;
    this.showTab.set(true);
  }

  public async bookmark(): Promise<void> {
    const isBookmarked = await this.bookmarksService.isBookmarked(this.article()!.id!);

    if (isBookmarked)
      this.bookmarksService.unbookmark(this.article()!.id!);
    else
      this.bookmarksService.bookmark(this.article()! as Article);
  }
}
