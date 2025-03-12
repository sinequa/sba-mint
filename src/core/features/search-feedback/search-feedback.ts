import { Component, inject, input, signal } from '@angular/core';
import { HashMap, provideTranslocoScope, Translation, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { toast } from 'ngx-sonner';

import { Result } from '@sinequa/atomic';
import { AuditService, QueryParamsStore } from '@sinequa/atomic-angular';
import { ButtonComponent } from '@sinequa/ui';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'search-feedback',
  standalone: true,
  imports: [ButtonComponent],
  providers: [provideTranslocoScope({ scope: 'searchFeedback', loader })],
  templateUrl: './search-feedback.html'
})
export class SearchFeedbackComponent {
  pages = input.required<any>();
  readonly auditService = inject(AuditService);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  private readonly transloco = inject(TranslocoService);

  liked = signal<boolean>(false);
  disliked = signal<boolean>(false);

  like(): void {
    const state = getState(this.queryParamsStore);
    const articles: string[] = [];
    if (this.pages() && this.pages().length) {
      this.pages().forEach((page: Result) => {
        articles.push(...page.records.map(r => r.id));
      });
    }
    const detail = { query: state, records: articles };
    this.auditService.notify({
      type: 'Search_Like',
      detail
    });
    this.liked.set(true);
    toast.success(this.transloco.translate('searchFeedback.feedbackSuccess'), { duration: 2000 });
  }

  dislike(): void {
    const state = getState(this.queryParamsStore);
    const articles: string[] = [];
    if (this.pages() && this.pages().length) {
      this.pages().forEach((page: Result) => {
        articles.push(...page.records.map(r => r.id));
      });
    }
    const detail = { query: state, records: articles };
    this.auditService.notify({
      type: 'Search_Disike',
      detail
    });
    this.disliked.set(true);
    toast.success(this.transloco.translate('searchFeedback.feedbackSuccess'), { duration: 2000 });
  }
}
