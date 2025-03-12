import { Component, computed, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Query } from '@sinequa/atomic';
import { Basket, buildQuery, DrawerStackService, UserSettingsStore } from '@sinequa/atomic-angular';
import { ButtonComponent, DialogService, ListItemComponent, HorizontalDividerComponent, PopoverComponent } from '@sinequa/ui';

import { DeleteCollectionDialog } from './collections-delete.dialog';
import { ManageCollectionsDialog } from './collections-manage.dialog';

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
  imports: [TranslocoPipe, HorizontalDividerComponent, DeleteCollectionDialog, ButtonComponent, ListItemComponent],
  templateUrl: './collections.html',
  providers: [provideTranslocoScope({ scope: 'collection', loader })]
})
export class CollectionsComponent {
  showButtons = input<boolean>(true);
  floating = inject(PopoverComponent, { skipSelf: true, optional: true });
  modal = inject(DialogService);

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
    this.floating?.close();
    this.modal.open(ManageCollectionsDialog).then(v => console.log('result', v));
  }
}
