import { Component, inject, input, signal, viewChild } from '@angular/core';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { toast } from 'ngx-sonner';

import { Result } from '@sinequa/atomic';
import { AuditService, MenuComponent, MenuContentComponent, MenuItemComponent, QueryParamsStore } from '@sinequa/atomic-angular';
import { ButtonComponent } from '@sinequa/ui';
import { FeedbackDialogComponent } from './feedback.dialog';

interface FeedbackMenu {
  type: string;
  icon: string;
}

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
  imports: [ButtonComponent, MenuComponent, MenuContentComponent, MenuItemComponent, TranslocoPipe, FeedbackDialogComponent],
  providers: [provideTranslocoScope({ scope: 'searchFeedback', loader })],
  templateUrl: './search-feedback.html'
})
export class SearchFeedbackComponent {
  pages = input.required<any>();
  readonly auditService = inject(AuditService);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  private readonly transloco = inject(TranslocoService);

  readonly feedbackDialog = viewChild(FeedbackDialogComponent);

  liked = signal<boolean>(false);
  disliked = signal<boolean>(false);

  menus: FeedbackMenu[] = [
    { type: 'content', icon: 'far fa-file-alt' },
    { type: 'ui', icon: 'fas fa-desktop' },
    { type: 'lang', icon: 'far fa-comments' },
    { type: 'other', icon: 'far fa-lightbulb' }
  ];

  like(): void {
    if (this.liked()) return;

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
    if (this.disliked()) return;

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

  openFeedbackDialog(type: string): void {
    this.feedbackDialog()?.showModal(type);
  }
}
