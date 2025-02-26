import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Article } from '@sinequa/atomic';
import {
  Basket,
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  UserSettingsStore
} from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'add-to-collection-dialog',
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
        <DialogTitle>{{ 'collection.addToCollection' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <ul class="flex flex-col">
          @for (collection of collections(); track $index) {
            <li
              class="group flex h-10 cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary focus:outline-none"
              tabindex="0"
              (click)="addToCollection(collection, $index)">
              @if (containsArticle(collection)) {
                <i class="fa-fw fa-regular fa-square-check"></i>
              } @else {
                <i class="fa-fw fa-regular fa-square"></i>
              }
              {{ collection.name }}
            </li>
          } @empty {
            <li class="py-4 text-center text-neutral-500">
              {{ 'collection.noCollections' | transloco }}
            </li>
          }
          @if (creating()) {
            <li
              class="group flex h-10 cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary focus:outline-none"
              tabindex="0">
              <div class="flex grow">
                <input
                  #createInput
                  class="h-10 w-full grow rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
                  type="text"
                  autocomplete="off"
                  spellcheck="false"
                  [attr.aria-label]="'collection.collectionName' | transloco"
                  [attr.placeholder]="'collection.collectionName' | transloco"
                  [ngModel]="newCollectionName()"
                  (ngModelChange)="newCollectionName.set($event)"
                  (blur)="onBlurCreate()" />
              </div>
            </li>
          }
        </ul>
      </DialogContent>

      <DialogFooter>
        <button variant="outline" class="w-full" tabindex="0" [attr.title]="'collection.createCollection' | transloco" (click)="onCreate()">
          {{ (creating() ? 'collection.cancelCreation' : 'collection.createCollection') | transloco }}
        </button>
        <button (click)="dialog.close()">
          {{ 'collection.close' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class CollectionsDialog {
  readonly article = input.required<Article>();
  private readonly userSettingsStore = inject(UserSettingsStore);
  readonly createInput = viewChild<ElementRef>('createInput');
  readonly dialog = viewChild<DialogComponent>(DialogComponent);
  protected collections = computed<Basket[]>(() => this.userSettingsStore.baskets());
  newCollectionName = signal<string>('');
  creating = signal<boolean>(false);

  showModal() {
    this.dialog()!.showModal();
  }

  containsArticle(collection: Basket): boolean {
    return (collection.ids || []).some(id => id === this.article().id);
  }

  onCreate(): void {
    if (this.creating()) return this.creating.set(false);

    this.creating.set(true);
    this.createInput()?.nativeElement.focus();
  }

  async addToCollection(collection: Basket, collectionIndex: number): Promise<void> {
    if (this.containsArticle(collection)) {
      // remove it
      const index = collection.ids!.indexOf(this.article().id);
      collection.ids!.splice(index, 1);
    } else {
      // add it
      if (!collection.ids) collection.ids = [];
      collection.ids!.push(this.article().id);
    }
    await this.userSettingsStore.updateBasket(collection, collectionIndex);
  }

  onBlurCreate(): void {
    if (this.newCollectionName()) {
      const collection: Basket = { name: this.newCollectionName() };
      this.userSettingsStore.createBasket(collection);
      this.newCollectionName.set('');
      this.creating.set(false);
    }
  }
}
