import { EventEmitter, Injectable, inject, signal } from '@angular/core';

import { SelectionHistoryService, SelectionService } from '@/app/services';
import { SelectionStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { getState } from '@ngrx/signals';

@Injectable({
  providedIn: 'root'
})
export class DrawerStackService {
  public readonly isOpened = signal(false);
  public readonly toggleTopDrawerExtension$ = new EventEmitter<void>();
  public readonly forceTopDrawerCollapse$ = new EventEmitter<void>();
  public readonly closeTopDrawer$ = new EventEmitter<void>();
  public readonly closeAllDrawers$ = new EventEmitter<void>();
  public readonly isChatOpened = signal(false);
  public readonly openChatDrawer$ = new EventEmitter<void>();
  public readonly closeChatDrawer$ = new EventEmitter<void>();

  private readonly selection = inject(SelectionService);
  private readonly selectionHistory = inject(SelectionHistoryService);
  private readonly selectionStore = inject(SelectionStore);

  /**
   * Sets current drawer stack status to open
   */
  public open(): void {
    this.isOpened.set(true);
  }

  /**
   * Emits event to extend the top drawer
   */
  public extend(): void {
    this.toggleTopDrawerExtension$.next();
  }

  /**
   * Emits event to close the top drawer, checks if history is empty, if so,
   * sets current drawer stack status to closed and clears history and current
   * selection
   */
  public close(): void {
    this.closeTopDrawer$.next();

    if (this.selectionHistory.getCurrentSelectionIndex() === -1) {
      this.isOpened.set(false);
      this.selectionHistory.clearHistory();
    }
  }

  /**
   * Emits event to close the top drawer
   */
  public closeTop(): void {
    this.closeTopDrawer$.next();
  }

  /**
   * Sets current drawer stack status to closed, clears history and emits event
   * to close all drawers
   *
   * @param keepDrawerOpen if true, do not trigger layout animation
   */
  public closeAll(keepDrawerOpen: boolean = false): void {
    if (!keepDrawerOpen) this.isOpened.set(false);

    this.selectionHistory.clearHistory();

    this.closeAllDrawers$.next();
  }

  /**
   * Replace the current selection with the given article by closing all
   * drawers and opening the drawer with the new selection without triggering
   * layout animation
   *
   * @param article the article to replace the current selection with
   */
  public replace(article: Article | undefined): void {
    const { id } = getState(this.selectionStore);
    if (id && (!article || article.id === id)) return;

    // close everything without trigger layout animation
    this.closeAll(true);
    // set selection
    this.selection.setCurrentArticle(article);
    // open drawer
    this.open();
  }

  /**
   * Stack the given article by setting the current selection and opening the
   * drawer
   *
   * @param article the article to stack
   */
  public stack(article: Article | undefined): void {
    const { id } = getState(this.selectionStore);

    if (id && (!article || article.id === id)) return;

    // force top drawer to collapse
    this.forceTopDrawerCollapse$.next();
    // set selection
    this.selection.setCurrentArticle(article);
    // open drawer
    this.open();
  }

  public toggleAssistant(): void {
    if (this.isChatOpened())
      this.closeAssistant();
    else
      this.openAssistant();
  }

  public openAssistant(): void {
    console.log('Open assistant');
    this.isChatOpened.set(true);
    this.isOpened.set(true);
    this.openChatDrawer$.next();
  }

  public closeAssistant(): void {
    console.log('Close assistant');
    this.isChatOpened.set(false);

    if (this.selectionHistory.getCurrentSelectionIndex() === -1)
      this.isOpened.set(false);

    this.closeChatDrawer$.next();
  }
}
