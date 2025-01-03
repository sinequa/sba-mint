import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Article } from '@sinequa/atomic';
import { QueryParamsStore, SearchService } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-missing-terms',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './missing-terms.component.html',
  providers: [provideTranslocoScope({ scope: 'article', loader })],
  styles: `
.sq-missing-term {
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
    return this.article().termspresence
      ?.filter(tp => tp.presence === 'missing')
      .map(tp => tp.term) || [];
  });

  mustInclude(term: string) {
    const query = this.queryParamsStore.getQuery();
    const text = (query.text || '').replace(new RegExp(`\\b${term}\\b`, 'gi'), "");
    this.router.navigate(['/search'], { queryParams: { q: `${text}+[${term}]` } });
  }
}
