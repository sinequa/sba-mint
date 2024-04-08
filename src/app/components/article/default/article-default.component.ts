import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';

import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { SourceIconPipe } from '@/app/pipes';
import { Article } from "@/app/types/articles";
import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';
import { StopPropagationDirective } from 'toolkit';

import { BookmarksService } from '@/app/services/bookmarks.service';
import { UserSettingsStore, appStore } from '@/app/stores';
import { getState } from '@ngrx/signals';
import { ArticleDefaultLightComponent } from '../default-light/article-default-light.component';
import { MetadataComponent } from '@sinequa/atomic-angular';

type Tab = 'attachments' | 'similars';

@Component({
  selector: 'app-article-default',
  standalone: true,
  imports: [NgClass, AsyncPipe, DatePipe, SourceIconPipe, SelectArticleOnClickDirective, StopPropagationDirective, ArticleDefaultLightComponent, WpsAuthorComponent, MetadataComponent],
  templateUrl: './article-default.component.html',
  styleUrl: './article-default.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article', 'strategy']
  }]
})
export class ArticleDefaultComponent implements OnInit {
  public readonly article = input.required<Article>();
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
  protected articleMetadata = computed(() => {
    const source = this.article()?.treepath?.[0]?.split('/')[1];
    const maps = appStore.getCustomizationJson()?.sourcesTagsMap;
    const fields = maps?.find((map) => map.sources.includes(source!));

    return fields?.tags;
  })

  protected attachments: Article[] = [
    { value: 'X-1', type: 'default' },
    { value: 'X-2', type: 'default' },
    { value: 'X-3', type: 'default' }
  ] as Article[];

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
