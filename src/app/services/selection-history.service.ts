import { EventEmitter, Injectable, OnDestroy, inject } from '@angular/core';
import { Article } from '@mint/types/articles/article.type';
import { Subscription, filter, tap } from 'rxjs';
import { selectionStore } from '../stores/selection.store';
import { SelectionService } from './selection.service';

// back is used when the user close the current selection and want to go back to the previous one
// new is used when the user select a new article
export type SelectionHistoryEvent = 'back' | 'new';

@Injectable({
  providedIn: 'root'
})
export class SelectionHistoryService implements OnDestroy {
  public readonly selectionHistoryEvent = new EventEmitter<SelectionHistoryEvent>();

  private readonly selectionService = inject(SelectionService);

  private readonly newSelection$ = selectionStore.next$
    .pipe(
      tap((article) => console.log('-- selectionHistory - newSelection before filter: currentArticle: %o, history: %o', article, this.history)),
      // prevent from adding the same article twice
      filter((article) => !!article && article !== this.history[this.history.length - 1]),
      tap((article) => {
        console.log('-- selectionHistory - newSelection: currentArticle: %o, history: %o', article, this.history);
        this.history.push(article!);
        this.selectionHistoryEvent.next('new');
      })
    );

  private readonly history: Partial<Article>[] = [];
  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(this.newSelection$.subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getCurrentSelectionIndex(): number {
    return this.history.length - 1;
  }

  public getSelection(index: number): Article | Partial<Article> | undefined {
    if (index < 0 || index >= this.history.length) return undefined;

    return this.history[index];
  }

  public getHistoryLength(): number {
    return this.history.length;
  }

  public clearHistory(): void {
    this.history.length = 0;
    this.selectionService.clearCurrentArticle();
  }

  public back(): Partial<Article> | undefined {
    this.history.pop();

    if (this.history.length === 0) return undefined;

    const last = this.history[this.history.length - 1];

    this.selectionService.setCurrentArticle(last);
    this.selectionHistoryEvent.next('back');

    return last;
  }
}
