import { Component, HostBinding, effect, input } from '@angular/core';

import { SelectArticleOnClickDirective, SelectionStrategy } from '@/app/directives';
import { PersonArticle } from '@/app/types/articles';
import { AuthorAvatarComponent } from '@/app/components/author/author-avatar/author-avatar.component';

@Component({
  selector: 'app-article-person-light',
  standalone: true,
  imports: [AuthorAvatarComponent],
  templateUrl: './article-person-light.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'article flex' },
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: person', 'strategy']
  }]
})
export class ArticlePersonLightComponent {
  @HostBinding('attr.title') public title: string | undefined = '';

  public readonly person = input.required<Partial<PersonArticle> | undefined>();
  public readonly strategy = input<SelectionStrategy>('stack');

  constructor() {
    effect(() => this.title = `${this.person()?.employeeFullName}\n${this.person()?.employeeJobTitle}`);
  }
}
