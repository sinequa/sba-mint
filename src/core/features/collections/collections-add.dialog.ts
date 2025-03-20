import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';

import { Article } from '@sinequa/atomic';
import { Basket, UserSettingsStore } from '@sinequa/atomic-angular';
import {
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  InputComponent,
  ListItemComponent
} from '@sinequa/ui';

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
    DialogFooterComponent,
    ListItemComponent,
    InputComponent
  ],
  providers: [provideTranslocoScope({ scope: 'collection', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'collection.addToCollection' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <ul class="flex flex-col" role="list">
          @for (collection of collections(); track $index) {
            <li role="listitem" (click)="addToCollection(collection, $index)">
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
        </ul>
        @if (creating()) {
          <input
            #createInput
            type="text"
            autocomplete="off"
            spellcheck="false"
            [attr.aria-label]="'collection.collectionName' | transloco"
            [attr.placeholder]="'collection.collectionName' | transloco"
            [ngModel]="newCollectionName()"
            (ngModelChange)="newCollectionName.set($event)"
            (keydown.escape)="$event.preventDefault(); creating.set(false)"
            (blur)="onBlurCreate()" />
        }
      </DialogContent>

      <DialogFooter class="flex flex-col">
        <button variant="outline" class="w-full" tabindex="0" [attr.title]="'collection.createCollection' | transloco" (click)="onCreate()">
          {{ (creating() ? 'collection.cancelCreation' : 'collection.createCollection') | transloco }}
        </button>
        <button (click)="dialog.close()" class="self-end">
          {{ 'collection.close' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class CollectionsDialog {
  readonly createInputElement = viewChild<ElementRef<HTMLInputElement>>('createInput');
  readonly dialogElement = viewChild<DialogComponent>(DialogComponent);

  readonly article = input.required<Article>();

  private readonly userSettingsStore = inject(UserSettingsStore);
  protected collections = computed<Basket[]>(() => this.userSettingsStore.baskets());

  newCollectionName = signal<string>('');
  creating = signal<boolean>(false);

  showModal() {
    this.dialogElement()!.showModal();
  }

  containsArticle(collection: Basket): boolean {
    return (collection.ids || []).some(id => id === this.article().id);
  }

  onCreate(): void {
    if (this.creating()) return this.creating.set(false);

    this.creating.set(true);

    // Focus the input element with a delay because the input element is not yet rendered
    setTimeout(() => {
      this.createInputElement()?.nativeElement.focus();
    }, 1);
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
