import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';

import { BookmarkComponent } from '@/app/components/bookmark/bookmark.component';
import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { SourceIconPipe } from '@/app/pipes';
import { AppStore, SelectionStore, UserSettingsStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';
import { getState } from '@ngrx/signals';
import { MetadataComponent } from '@sinequa/atomic-angular';
import { StopPropagationDirective } from 'toolkit';
import { ArticleDefaultLightComponent } from '../default-light/article-default-light.component';

type Tab = 'attachments' | 'similars';

@Component({
  selector: 'app-article-default',
  standalone: true,
  imports: [NgClass, AsyncPipe, DatePipe, SourceIconPipe, SelectArticleOnClickDirective, StopPropagationDirective, ArticleDefaultLightComponent, WpsAuthorComponent, MetadataComponent, BookmarkComponent],
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

  userSettingsStore = inject(UserSettingsStore);
  appStore = inject(AppStore);
  selectionStore = inject(SelectionStore);

  selected = computed(() => this.article()?.id === getState(this.selectionStore).id);

  protected showTab = signal(false);
  protected currentTab: Tab = 'attachments';

  protected articleMetadata = computed(() => {
    const source = this.article()?.treepath?.[0]?.split('/')[1];
    const maps = this.appStore.customizationJson()?.sourcesTagsMap;
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
}
