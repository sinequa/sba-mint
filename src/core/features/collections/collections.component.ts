import { Component, computed, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Basket, buildQuery, DrawerStackService, UserSettingsStore } from '@sinequa/atomic-angular';
import { CreateCollectionDialog } from "./create-collection";
import { ManageCollectionsDialog } from "./manage-collections";
import { Query } from '@sinequa/atomic';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [TranslocoPipe, CreateCollectionDialog, ManageCollectionsDialog],
  templateUrl: './collections.component.html',
  providers: [provideTranslocoScope({ scope: 'collection', loader })]
})
export class CollectionsComponent {
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly router = inject(Router);

  protected collections = computed<Basket[]>(() => this.userSettingsStore.baskets());

  readonly createCollectionDialog = viewChild(CreateCollectionDialog);
  readonly manageCollectionsDialog = viewChild(ManageCollectionsDialog);

  query: Query;

  constructor() {
    this.query = buildQuery();
  } 

  onClick(collection: Basket): void {
    this.drawerStack.closeAll();
    this.router.navigate(['/search'], { queryParams: { b: collection.name } });
  }

  createCollection(): void {
    this.createCollectionDialog()?.showModal();
  }

  manageCollections(): void {
    this.manageCollectionsDialog()?.showModal();
  }
}
