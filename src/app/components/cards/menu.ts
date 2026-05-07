import { Component, computed, inject, input, model } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";

import { Article as A, error } from "@sinequa/atomic";
import {
  AppStore,
  CollectionsDialog,
  DrawerStackService,
  LabelsEditDialog,
  SelectionStore
} from "@sinequa/atomic-angular";
import {
  ButtonComponent,
  DialogEvent,
  DialogService,
  EllipsisVerticalIcon,
  IconButtonComponent,
  InboxIcon,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  PaperclipIcon,
  TagIcon
} from "@sinequa/ui";
import { QueryClient } from "@tanstack/angular-query-experimental";

type Article = A & {
  [key: string]: unknown;
};

@Component({
  selector: "card-menu, CardMenu, cardmenu",
  standalone: true,
  imports: [
    ButtonComponent,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    TranslocoPipe,
    EllipsisVerticalIcon,
    TagIcon,
    InboxIcon,
    PaperclipIcon,
    IconButtonComponent
  ],
  template: `
    <menu class="invisible ml-auto group-hover:visible" (click)="$event.stopImmediatePropagation()">
      <button variant="none" icon-button [title]="'article.openMenu' | transloco" [attr.aria-label]="'article.openMenu' | transloco">
        <span class="sr-only">{{ 'article.openMenu' | transloco }}</span>
        <EllipsisVerticalIcon />
      </button>

      <MenuContent [position]="drawerOpened() ? 'bottom-end' : 'right-start'">
        @if (appStore.allowLabels()) {
          <menuitem (click)="editLabels()"> <TagIcon /> {{ 'article.editLabels' | transloco }} </menuitem>
        }
        <menuitem (click)="addToCollection()"> <InboxIcon /> {{ 'article.addToCollection' | transloco }} </menuitem>
        @if (allowAI()) {
          <menuitem variant="ai" (click)="attachToAssistant()"> <PaperclipIcon /> {{ 'article.addToAIOverview' | transloco }} </menuitem>
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
      .then((v) => {
        // update the article with the new labels
        this.article.set({ ...v.article });
      })
      .catch((e) => error("LabelsEditDialog error", e));
  }

  addToCollection(): void {
    this.dialogService
      .open(CollectionsDialog, this.article())
      .then((event: unknown) => {
        if (event === "dialog-confirm" || event === "dialog-no") {
          this.queryClient.invalidateQueries().catch((e) => error("Invalidate queries error", e));
        }
      })
      .catch((e) => error("CollectionsDialog error", e));
  }

  attachToAssistant(): void {
    const id = this.article()?.id;
    if (!id) return;

    const assistantIdsToAttach = this.selectionStore.assistantIdsToAttach();
    const ids = assistantIdsToAttach || [];

    if ((assistantIdsToAttach || []).indexOf(id) === -1) {
      ids.push(id);
    }

    this.selectionStore.update({ assistantIdsToAttach: [...ids] });
  }
}
