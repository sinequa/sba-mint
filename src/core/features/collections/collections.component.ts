import { Component, computed, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Basket, buildQuery, DrawerStackService, UserSettingsStore } from '@sinequa/atomic-angular';
import { ManageCollectionsDialog } from './manage-collections';
import { Query } from '@sinequa/atomic';
import { DeleteCollectionDialog } from './delete-collection';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [TranslocoPipe, ManageCollectionsDialog, DeleteCollectionDialog],
  templateUrl: './collections.component.html',
  providers: [provideTranslocoScope({ scope: 'collection', loader })]
})
export class CollectionsComponent {
  showButtons = input<boolean>(true);

  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly router = inject(Router);

  protected collections = computed<Basket[]>(() => this.userSettingsStore.baskets());

  readonly manageCollectionsDialog = viewChild(ManageCollectionsDialog);
  readonly deleteCollectionDialog = viewChild(DeleteCollectionDialog);

  query: Query;

  constructor() {
    this.query = buildQuery();
  }

  onClick(collection: Basket): void {
    this.drawerStack.closeAll();
    this.router.navigate(['/search'], { queryParams: { b: collection.name } });
  }

  public onDelete(collection: Basket, index: number, e: Event) {
    e.stopPropagation();
    this.deleteCollectionDialog()?.showModal(collection, index);
  }

  manageCollections(): void {
    this.manageCollectionsDialog()?.showModal();
  }
}
