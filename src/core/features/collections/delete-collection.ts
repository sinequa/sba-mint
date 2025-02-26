import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Basket, UserSettingsStore } from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';

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
  imports: [FormsModule, TranslocoPipe],
  providers: [provideTranslocoScope({ scope: 'collection', loader })],
  template: `
    <dialog popover class="z-backdrop w-full max-w-md rounded-lg border border-neutral-200 p-4 shadow-2xl" #dialog>
      <div class="flex flex-col gap-4">
        <h1 class="text-xl font-bold">{{ 'collection.deleteCollection' | transloco }}</h1>
        <hr class="border-t" />
        <p>{{ 'collection.confirmDelete' | transloco }} {{ collection()?.name }}?</p>

        <div class="mt-4 flex justify-end gap-2">
          <button class="btn btn-ghost w-24 outline-none" (click)="dialog.close()">
            {{ 'cancel' | transloco }}
          </button>

          <button class="btn w-24 bg-alert" (click)="deleteCollection()">
            {{ 'delete' | transloco }}
          </button>
        </div>
      </div>
    </dialog>
  `
})
export class DeleteCollectionDialog {
  readonly dialog = viewChild<ElementRef>('dialog');

  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly translocoService = inject(TranslocoService);

  collection = signal<Basket | undefined>(undefined);
  index = signal<number | undefined>(undefined);

  showModal(collection: Basket, index: number) {
    this.collection.set(collection);
    this.index.set(index);
    this.dialog()!.nativeElement.showModal();
  }

  async deleteCollection(): Promise<void> {
    this.dialog()!.nativeElement.close();
    await this.userSettingsStore.deleteBasket(this.index()!);
    const message = this.translocoService.translate('collection.deleted');
    toast.success(message, { duration: 2000 });
  }
}
