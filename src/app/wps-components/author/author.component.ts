import { Component, HostBinding, HostListener, Injector, inject, input, runInInjectionContext, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, tap } from 'rxjs';

import { Query } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticlePersonLightComponent } from '@/app/components/article/person-light/article-person-light.component';
import { PEOPLE_QUERY_NAME } from '@/app/config/query-names';
import { SelectionStrategy } from '@/app/directives';
import { buildQuery } from '@/app/services';
import { PersonArticle } from '@/app/types/articles';
import { StopPropagationDirective } from 'toolkit';

import { WpsAuthorImageComponent } from '../author-image/author-image.component';

/**
 * Component to display an author based on its name.
 * The author's name will be used as a query text to search with `PEOPLE_QUERY_NAME` query.
 * By default the ArticlePersonLightComponent will be used to display the author's information.
 * Component will be rendered on hover.
 *
 * @example
 * ```html
 * <wps-author [authorName]="'John doe'" />
 * ```
 */
@Component({
  selector: 'wps-author',
  standalone: true,
  imports: [ArticlePersonLightComponent, WpsAuthorImageComponent],
  templateUrl: './author.component.html',
  styleUrl: './author.component.scss',
  hostDirectives: [{
    directive: StopPropagationDirective
  }]
})
export class WpsAuthorComponent {
  @HostListener('mouseenter')
  public mouseEnter(): void {
    this.showAuthor.set(true);
  }

  @HostListener('mouseleave')
  public mouseLeave(): void {
    this.showAuthor.set(false);
  }

  @HostBinding('class.not-allowed')
  protected cursorNotAllowed = true;

  public readonly authorName = input.required<string>();
  public readonly strategy = input<SelectionStrategy>('stack');

  public readonly showAuthor = signal(false);

  protected readonly person = toSignal(
    toObservable(this.authorName).pipe(
      switchMap((name) =>
        this.queryService.search(this.buildPersonQuery(name))
          .pipe(
            map(result => (result.records?.[0] as PersonArticle)),
            filter(person => !!person),
            map(person => Object.assign(person, { type: 'person' }) as PersonArticle),
            tap(() => this.cursorNotAllowed = false)
          )
      )
    )
  );

  private readonly queryService = inject(QueryService);
  private readonly injector = inject(Injector);

  private buildPersonQuery(author: string): Query {
    return runInInjectionContext(this.injector, () => buildQuery({ name: PEOPLE_QUERY_NAME, text: author, pageSize: 1 }));
  }
}
