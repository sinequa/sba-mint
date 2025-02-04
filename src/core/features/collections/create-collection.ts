import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { UserSettingsStore } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'create-collection-dialog',
  standalone: true,
  imports: [FormsModule, TranslocoPipe],
  providers: [provideTranslocoScope({ scope: 'collection', loader })],
  template: `
    <dialog popover class="z-backdrop w-full max-w-md rounded-lg border border-neutral-200 p-4 shadow-2xl" #dialog>
      <div class="flex flex-col gap-4">
        <h1 class="text-xl font-bold">{{ 'collection.createCollection' | transloco }}</h1>
        <hr class="mb-2 border-t" />

        <input
          class="h-10 w-full rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
          type="text"
          autocomplete="off"
          spellcheck="false"
          [attr.aria-label]="'collection.collectionName' | transloco"
          [attr.placeholder]="'collection.collectionName' | transloco"
          [ngModel]="collectionName()"
          (ngModelChange)="collectionName.set($event)" />

        <div class="mt-4 flex justify-end gap-2">
          <button class="btn btn-tertiary w-24 outline-none" (click)="create()">
            {{ 'collection.create' | transloco }}
          </button>
          <button class="btn btn-tertiary w-24 outline-none" (click)="dialog.close()">
            {{ 'collection.cancel' | transloco }}
          </button>
        </div>
      </div>
    </dialog>
  `
})
export class CreateCollectionDialog {
  private readonly userSettingsStore = inject(UserSettingsStore);
  readonly dialog = viewChild<ElementRef>('dialog');
  collectionName = signal<string>('');

  showModal() {
    this.dialog()!.nativeElement.showModal();
  }

  async create(): Promise<void> {
    if (!this.collectionName()) return;
    await this.userSettingsStore.createBasket({ name: this.collectionName() });
    this.dialog()!.nativeElement.close();
  }
}
