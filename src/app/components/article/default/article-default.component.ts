import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';

import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { TreepathToIconClassPipe } from '@/app/pipes';
import { Article } from "@/app/types/articles";
import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';
import { StopPropagationDirective } from 'toolkit';

import { BookmarksService } from '@/app/services/bookmarks.service';
import { UserSettingsStore } from '@/app/stores';
import { getState } from '@ngrx/signals';
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

  bookmarksService = inject(BookmarksService);
  userSettingsStore = inject(UserSettingsStore);

  protected showTab = signal(false);
  protected currentTab: Tab = 'attachments';
  protected isBookmarked = computed(() => {
    const { bookmarks } = getState(this.userSettingsStore);
    const article = this.article();

    if (!article) return false;
    return bookmarks?.find((bookmark) => bookmark.id === article.id);
  })

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
