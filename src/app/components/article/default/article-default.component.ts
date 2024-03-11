import { DatePipe, NgClass } from '@angular/common';
import { Component, input, signal } from '@angular/core';

import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { TreepathToIconClassPipe } from '@/app/pipes';
import { Article } from "@/app/types/articles";
import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';
import { StopPropagationDirective } from 'toolkit';

import { ArticleDefaultLightComponent } from '../default-light/article-default-light.component';

type Tab = 'attachments' | 'similars';

@Component({
  selector: 'app-article-default',
  standalone: true,
  imports: [NgClass, DatePipe, TreepathToIconClassPipe, SelectArticleOnClickDirective, StopPropagationDirective, ArticleDefaultLightComponent, WpsAuthorComponent],
  templateUrl: './article-default.component.html',
  styleUrl: './article-default.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article', 'strategy']
  }]
})
export class ArticleDefaultComponent {
  public readonly article = input<Partial<Article> | undefined>();
  public readonly strategy = input<SelectionStrategy>();

  protected showTab = signal(false);
  protected currentTab: Tab = 'attachments';

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

  public toggleTab(tab: Tab): void {
    if (this.currentTab === tab) {
      this.showTab.set(!this.showTab());
      return;
    }

    this.currentTab = tab;
    this.showTab.set(true);
  }
}
