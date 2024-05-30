import { EventEmitter, Injectable, OnDestroy, inject, signal } from '@angular/core';
import { getState } from '@ngrx/signals';

import { NavigationService, SelectionHistoryService, SelectionService } from '@/app/services';
import { SelectionStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { Subscription } from 'rxjs';
import { BackdropService } from '../drawer/components/backdrop/backdrop.service';

@Injectable({
  providedIn: 'root'
})
export class DrawerStackService implements OnDestroy {
  public readonly isOpened = signal(false);
  public readonly toggleTopDrawerExtension$ = new EventEmitter<void>();
  public readonly forceTopDrawerCollapse$ = new EventEmitter<void>();
  public readonly closeTopDrawer$ = new EventEmitter<void>();
  public readonly closeAllDrawers$ = new EventEmitter<void>();

  public readonly isChatOpened = signal(false);
  public readonly openChatDrawer$ = new EventEmitter<void>();
  public readonly closeChatDrawer$ = new EventEmitter<void>();
  public readonly askAI$ = new EventEmitter<string>();

  private readonly selection = inject(SelectionService);
  private readonly selectionHistory = inject(SelectionHistoryService);
  private readonly selectionStore = inject(SelectionStore);
  private readonly navigationService = inject(NavigationService);
  private readonly backdropService = inject(BackdropService);

  private readonly subscriptions = new Subscription();

  constructor() {
    // on new search, close all drawers including chat drawer
    this.subscriptions.add(
      this.navigationService.navigationEnd$.subscribe(() => {
        console.log('Navigation end');
        this.closeAssistant();
        this.closeAll();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

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
  public replace(article: Article | undefined, closeAssistant: boolean = false): void {
    const { id } = getState(this.selectionStore);
    if (id && (!article || article.id === id)) return;

    // close everything without trigger layout animation
    this.closeAll(true);

    if (closeAssistant) this.closeAssistant(true);

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
    if (this.isChatOpened()){
      this.backdropService.hide();
      this.closeAssistant();
    } else {
      this.backdropService.show();
      this.openAssistant();
    }
  }

  public openAssistant(): void {
    console.log('Open assistant');
    this.isChatOpened.set(true);
    this.isOpened.set(true);
    this.openChatDrawer$.next();
    this.backdropService.show();
  }

  public closeAssistant(keepDrawerOpen: boolean = false): void {
    console.log('Close assistant');
    this.isChatOpened.set(false);

    if (!keepDrawerOpen && this.selectionHistory.getCurrentSelectionIndex() === -1) {
      this.isOpened.set(false);
      this.closeAllDrawers$.next();
    }

    this.closeChatDrawer$.next();
    this.backdropService.hide();
  }

  public askAI(text: string): void {
    this.openAssistant();
    this.askAI$.next(text);
  }
}
