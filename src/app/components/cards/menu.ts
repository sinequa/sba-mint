import { Component, computed, inject, input, model } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article as A, error } from '@sinequa/atomic';
import { AppStore, CollectionsDialog, DrawerStackService, LabelsEditDialog, SelectionStore } from '@sinequa/atomic-angular';
import { ButtonComponent, DialogEvent, DialogService, MenuComponent, MenuContentComponent, MenuItemComponent } from '@sinequa/ui';
import { QueryClient } from '@tanstack/angular-query-experimental';

type Article = A & {
  [key: string]: any;
};

@Component({
  selector: 'card-menu, CardMenu, cardmenu',
  standalone: true,
  imports: [ButtonComponent, MenuComponent, MenuContentComponent, MenuItemComponent, TranslocoPipe], // Add necessary imports
  template: `
    <menu class="invisible ml-auto group-hover:visible" (click)="$event.stopImmediatePropagation()">
      <button variant="ghost" size="icon" [title]="'article.openMenu' | transloco" [attr.aria-label]="'article.openMenu' | transloco">
        <span class="sr-only">{{ 'article.openMenu' | transloco }}</span>
        <i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
      </button>

      <MenuContent [position]="drawerOpened() ? 'bottom-end' : 'right-start'">
        @if (appStore.allowLabels()) {
          <menuitem (click)="editLabels()"> <i class="fa-fw far fa-tag"></i> {{ 'article.editLabels' | transloco }} </menuitem>
        }
        <menuitem (click)="addToCollection()"> <i class="fa-fw far fa-inbox"></i> {{ 'article.addToCollection' | transloco }} </menuitem>
        @if (allowAI()) {
          <menuitem variant="ai" (click)="attachToAssistant()"> <i class="fa-fw fas fa-paperclip"></i> {{ 'article.addToAIOverview' | transloco }} </menuitem>
        }
      </MenuContent>
    </menu>
  `
})
export class CardMenuComponent {
  dialogService = inject(DialogService);
  drawerStack = inject(DrawerStackService);
  selectionStore = inject(SelectionStore);
  appStore = inject(AppStore);
  queryClient = inject(QueryClient);

  article = model<Article>();

  // by default add to assistant is disabled
  readonly allowAI = input(false);
  readonly drawerOpened = computed(() => this.drawerStack.isOpened());

  editLabels(): void {
    this.dialogService
      .open<{ type: DialogEvent; article: Article }>(LabelsEditDialog, this.article())
      .then(v => {
        // update the article with the new labels
        this.article.set({ ...v.article });
      })
      .catch(e => error('LabelsEditDialog error', e));
  }

  addToCollection(): void {
    this.dialogService.open(CollectionsDialog, this.article()).then((event: any) => {
      if (event === 'dialog-confirm' || event === 'dialog-no') {
        this.queryClient.invalidateQueries();
      }
    });
  }

  attachToAssistant(): void {
    const id = this.article()?.id;
    if (!id) return;

    const { assistantIdsToAttach } = getState(this.selectionStore);
    let ids = assistantIdsToAttach || [];

    if ((assistantIdsToAttach || []).indexOf(id) === -1) {
      ids.push(id);
    }

    this.selectionStore.update({ assistantIdsToAttach: ids });
  }
}
