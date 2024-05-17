import { EventEmitter, Injectable, effect, inject } from '@angular/core';

import { SelectionStore } from '@/app/stores/selection.store';
import { Article } from "@/app/types/articles";

import { getState } from '@ngrx/signals';
import { SelectionService } from './selection.service';

// back is used when the user close the current selection and want to go back to the previous one
// new is used when the user select a new article
export type SelectionHistoryEvent = 'back' | 'new';

@Injectable({
  providedIn: 'root'
})
export class SelectionHistoryService {
  public readonly selectionHistoryEvent = new EventEmitter<SelectionHistoryEvent>();

  private readonly selectionService = inject(SelectionService);
  private readonly selectionStore = inject(SelectionStore);

  private readonly history: Article[] = [];

  constructor() {
    effect(() => {
      const { article } = getState(this.selectionStore);

      if (!!article && article !== this.history[this.history.length - 1]) {
        this.history.push(article);
        this.selectionHistoryEvent.next('new');
      }
    })
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

  public back(): Article | undefined {
    this.history.pop();

    if (this.history.length === 0) return undefined;

    const last = this.history[this.history.length - 1];

    this.selectionService.setCurrentArticle(last);
    this.selectionHistoryEvent.next('back');

    return last;
  }
}
