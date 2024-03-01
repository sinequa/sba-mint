import { Component, HostBinding, effect, input } from '@angular/core';
import { SelectArticleOnClickDirective, SelectionStrategy } from '@mint/directives/select-article-on-click.directive';
import { PersonArticle } from '@mint/types/articles/person.type';

@Component({
  selector: 'app-article-person-light',
  standalone: true,
  imports: [],
  templateUrl: './article-person-light.component.html',
  styleUrl: './article-person-light.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: person', 'strategy']
  }]
})
export class ArticlePersonLightComponent {
  @HostBinding('attr.title') public title: string | undefined = '';

  public readonly person = input.required<PersonArticle | Partial<PersonArticle> | undefined>();
  public readonly strategy = input<SelectionStrategy>('stack');

  private personEffect = effect(() => this.title = `${this.person()?.employeeFullName}\n${this.person()?.employeeJobTitle}`);
}
