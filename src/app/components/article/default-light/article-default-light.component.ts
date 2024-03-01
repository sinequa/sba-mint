import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';
import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SelectArticleOnClickDirective, SelectionStrategy } from '@mint/directives/select-article-on-click.directive';
import { Article } from '@mint/types/articles/article.type';
import { TreepathToIconClassPipe } from '../../../pipes/treepath-to-icon-class.pipe';

@Component({
  selector: 'app-article-default-light',
  standalone: true,
  imports: [DatePipe, TreepathToIconClassPipe, WpsAuthorComponent],
  templateUrl: './article-default-light.component.html',
  styleUrl: './article-default-light.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article']
  }]
})
export class ArticleDefaultLightComponent {
  public readonly article = input.required<Article | Partial<Article> | undefined>();
  public readonly strategy = input<SelectionStrategy>('stack');
}
