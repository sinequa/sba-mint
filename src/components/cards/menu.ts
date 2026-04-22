import { Component, inject, input, model } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";

import { Article as A, error } from "@sinequa/atomic";
import { AppStore, CollectionsDialog, LabelsEditDialog, SelectionStore } from "@sinequa/atomic-angular";
import { ButtonComponent, DialogEvent, DialogService, EllipsisVerticalIcon, InboxIcon, MenuComponent, MenuContentComponent, MenuItemComponent, PaperclipIcon, TagIcon } from "@sinequa/ui";
import { QueryClient } from "@tanstack/angular-query-experimental";

type Article = A & {
  [key: string]: unknown;
};

@Component({
  selector: "card-menu, CardMenu, cardmenu",
  standalone: true,
  imports: [ButtonComponent, MenuComponent, MenuContentComponent, MenuItemComponent, TranslocoPipe, EllipsisVerticalIcon, TagIcon, InboxIcon, PaperclipIcon],
  template: `
    <menu class="invisible ml-auto group-hover:visible" (click)="$event.stopImmediatePropagation()">
      <button variant="ghost" size="icon" [title]="'article.openMenu' | transloco" [attr.aria-label]="'article.openMenu' | transloco">
        <span class="sr-only">{{ "article.openMenu" | transloco }}</span>
        <EllipsisVerticalIcon />
      </button>

      <MenuContent>
        @if (appStore.allowLabels()) {
          <MenuItem class="whitespace-nowrap" (click)="editLabels()"> <TagIcon /> {{ "article.editLabels" | transloco }} </MenuItem>
        }
        <MenuItem class="whitespace-nowrap" (click)="addToCollection()">
          <InboxIcon /> {{ "article.addToCollection" | transloco }}
        </MenuItem>
        @if (allowAI()) {
          <MenuItem class="whitespace-nowrap" variant="ai" (click)="attachToAssistant()">
            <PaperclipIcon /> {{ "article.addToAIOverview" | transloco }}
          </MenuItem>
        }
      </MenuContent>
    </menu>
  `
})
export class CardMenuComponent {
  dialogService = inject(DialogService);
  selectionStore = inject(SelectionStore);
  appStore = inject(AppStore);
  queryClient = inject(QueryClient);

  article = model<Article>();

  // by default add to assistant is disabled
  readonly allowAI = input(false);

  editLabels(): void {
    this.dialogService
      .open<{ type: DialogEvent; article: Article }>(LabelsEditDialog, this.article())
      .then(v => {
        // update the article with the new labels
        this.article.set({ ...v.article });
      })
      .catch(e => error("LabelsEditDialog error", e));
  }

  addToCollection(): void {
    this.dialogService
      .open(CollectionsDialog, this.article())
      .then((event: unknown) => {
        if (event === "dialog-confirm") {
          this.queryClient.invalidateQueries().catch(e => error("Error invalidating queries", e));
        }
      })
      .catch(e => error("CollectionsDialog error", e));
  }

  attachToAssistant(): void {
    const id = this.article()?.id;
    if (!id) return;

    const assistantIdsToAttach = this.selectionStore.assistantIdsToAttach();
    const ids = assistantIdsToAttach || [];

    if ((assistantIdsToAttach || []).indexOf(id) === -1) {
      ids.push(id);
    }

    // update the selection store with the new list of article ids to attach,
    // the spread operator is used to create a new array, which is necessary to trigger change detection in the store
    this.selectionStore.update({ assistantIdsToAttach: [...ids] });
  }
}
