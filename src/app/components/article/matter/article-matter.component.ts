import { Component, Input } from '@angular/core';
import { SelectArticleOnClickDirective } from '@mint/directives/select-article-on-click.directive';
import { Article } from '@mint/types/articles/article.type';
import { StopPropagationDirective } from 'toolkit';
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
export class ArticleMatterComponent {
  @Input() public article: Partial<Article> | undefined;

  public articles: Partial<Article>[] = [
    { value: 'X-1', type: 'default' },
    { value: 'X-2', type: 'default' },
    { value: 'X-3', type: 'default' }
  ];
}
