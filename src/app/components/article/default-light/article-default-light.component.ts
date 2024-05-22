import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { AuthorComponent } from '@/app/components/author/author.component';
import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { Article } from "@/app/types/articles";
import { SourceIconComponent } from '../../source-icon/source-icon.component';

@Component({
  selector: 'app-article-default-light',
  standalone: true,
  imports: [DatePipe, SourceIconComponent, AuthorComponent],
  templateUrl: './article-default-light.component.html',
  styleUrl: './article-default-light.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article']
  }]
})
export class ArticleDefaultLightComponent {
  public readonly article = input.required<Article>();
  public readonly strategy = input<SelectionStrategy>('stack');
}
