import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { Basket, UserSettingsStore } from '@sinequa/atomic-angular';
import { ButtonComponent, DialogComponent, DialogContentComponent, DialogFooterComponent, DialogHeaderComponent, DialogTitleComponent } from '@sinequa/ui';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'delete-collection-dialog',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoPipe,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent
  ],
  providers: [provideTranslocoScope({ scope: 'collection', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'collection.deleteCollection' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <p>{{ 'collection.confirmDelete' | transloco }} {{ collection()?.name }}?</p>
      </DialogContent>

      <DialogFooter>
        <button variant="ghost" (click)="dialog.close()">
          {{ 'cancel' | transloco }}
        </button>

        <button variant="destructive" (click)="deleteCollection()">
          {{ 'delete' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class DeleteCollectionDialog {
  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly translocoService = inject(TranslocoService);

  collection = signal<Basket | undefined>(undefined);
  index = signal<number | undefined>(undefined);

  showModal(collection: Basket, index: number) {
    this.collection.set(collection);
    this.index.set(index);
    this.dialog()!.showModal();
  }

  async deleteCollection(): Promise<void> {
    this.dialog()!.close();
    await this.userSettingsStore.deleteBasket(this.index()!);
    const message = this.translocoService.translate('collection.deleted');
    toast.success(message, { duration: 2000 });
  }
}
