import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Article } from '@sinequa/atomic';
import { QueryParamsStore, SearchService } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'missing-terms',
  standalone: true,
  imports: [TranslocoPipe, RouterLink],
  templateUrl: './missing-terms.component.html',
  providers: [provideTranslocoScope({ scope: 'article', loader })],
  styles: `
.term {
    text-decoration-line: line-through;
}
  `
})
export class MissingTermsComponent {
  public readonly article = input.required<Article>();

  queryParamsStore = inject(QueryParamsStore);
  searchService = inject(SearchService);
  router = inject(Router);

  public missingTerms = computed(() => {
    const query = this.queryParamsStore.getQuery();
    return this.article().termspresence?.filter(tp => tp.presence === 'missing').map(tp => {
      const text = (query.text || '').replace(new RegExp(`\\b${tp.term}\\b`, 'gi'), "");
      return ({
        value: tp.term,
        queryParams: { q: `${text}+[${tp.term}]` }
      })
    });
  })
}
