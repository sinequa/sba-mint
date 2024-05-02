import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { SourceIconPipe } from '@/app/pipes';
import { Article } from "@/app/types/articles";
import { AuthorComponent } from '@/app/components/author/author.component';

@Component({
  selector: 'app-article-default-light',
  standalone: true,
  imports: [DatePipe, SourceIconPipe, AuthorComponent],
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
