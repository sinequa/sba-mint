import { Component, HostBinding, effect, input } from '@angular/core';

import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { PersonArticle } from '@/app/types/articles';
import { AuthorAvatarComponent } from '@/app/wps-components/author-avatar/author-avatar.component';

@Component({
  selector: 'app-article-person-light',
  standalone: true,
  imports: [AuthorAvatarComponent],
  templateUrl: './article-person-light.component.html',
  styleUrl: './article-person-light.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: person', 'strategy']
  }]
})
export class ArticlePersonLightComponent {
  @HostBinding('attr.title') public title: string | undefined = '';

  public readonly person = input.required<PersonArticle | undefined>();
  public readonly strategy = input<SelectionStrategy>('stack');

  private personEffect = effect(() => this.title = `${this.person()?.employeeFullName}\n${this.person()?.employeeJobTitle}`);
}
