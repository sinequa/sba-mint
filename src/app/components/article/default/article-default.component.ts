import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';

import { AuthorComponent } from '@/app/components/author/author.component';
import { BookmarkComponent } from '@/app/components/bookmark/bookmark.component';
import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { AppStore, SelectionStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { getState } from '@ngrx/signals';
import { MetadataComponent } from '@sinequa/atomic-angular';
import { StopPropagationDirective } from 'toolkit';
import { SourceIconComponent } from '../../source-icon/source-icon.component';
import { ArticleDefaultLightComponent } from '../default-light/article-default-light.component';

type Tab = 'attachments' | 'similars';

const HIDDEN_METADATA = ['web', 'htm', 'html', 'xhtm', 'xhtml', 'mht', 'mhtml', 'mht', 'aspx', 'page'];

@Component({
  selector: 'app-article-default',
  standalone: true,
  imports: [NgClass, AsyncPipe, DatePipe, SelectArticleOnClickDirective, StopPropagationDirective, ArticleDefaultLightComponent, AuthorComponent, MetadataComponent, BookmarkComponent, SourceIconComponent],
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
  protected docformatMetadata = computed(() => {
    if (this.article().docformat && !HIDDEN_METADATA.includes(this.article().docformat.toLowerCase()))
      return this.article().docformat;

    if (this.article().doctype && !HIDDEN_METADATA.includes(this.article().doctype!.toLowerCase()))
      return this.article().doctype;

    return undefined;
  });

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
