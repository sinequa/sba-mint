import { SelectArticleOnClickDirective } from '@/app/directives';
import { Article } from "@/app/types/articles";
import { Component, Input, OnInit, signal } from '@angular/core';
import { StopPropagationDirective } from 'toolkit';

import { searchInputStore } from '@/app/stores';
import { ArticleDefaultLightComponent } from '../default-light/article-default-light.component';

@Component({
  selector: 'app-article-matter',
  standalone: true,
  imports: [ArticleDefaultLightComponent, StopPropagationDirective],
  templateUrl: './article-matter.component.html',
  styleUrl: './article-matter.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article']
  }]
})
export class ArticleMatterComponent implements OnInit {
  @Input() public article: Partial<Article> | undefined;

  protected readonly queryText = signal<string>('');

  ngOnInit(): void {
    this.queryText.set(searchInputStore.state ?? '');
  }

  public articles: Partial<Article>[] = [
    { value: 'X-1', type: 'default' },
    { value: 'X-2', type: 'default' },
    { value: 'X-3', type: 'default' }
  ];
}
